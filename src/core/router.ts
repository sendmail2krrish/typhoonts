import { ParsedUrlQuery } from "querystring";
import { parse } from "url";
import { RequestWithCookies, ResponseWithCookies, Route } from "../types";

export class Router {
  private routes: Route[] = [];

  // Register controller and extract metadata
  register(controller: any) {
    const instance = new controller();
    const basePath = Reflect.getMetadata("basePath", controller);

    Object.getOwnPropertyNames(controller.prototype).forEach((methodName) => {
      const method = Reflect.getMetadata(
        "method",
        controller.prototype,
        methodName
      );
      const path = Reflect.getMetadata(
        "path",
        controller.prototype,
        methodName
      );
      const params =
        Reflect.getMetadata("params", controller.prototype, methodName) || [];
      const responseOptions = Reflect.getMetadata(
        "responseBody",
        controller.prototype,
        methodName
      );

      if (method && path) {
        this.routes.push({
          method,
          path: `${basePath}${path}`,
          handler: async (
            req: RequestWithCookies,
            res: ResponseWithCookies
          ) => {
            const args = params
              .sort((a: any, b: any) => a.index - b.index)
              .map((param: any) => {
                switch (param.type) {
                  case "param":
                    return req.params[param.name];
                  case "body":
                    return req.body;
                  case "query":
                    return req.query[param.name];
                  default:
                    return undefined;
                }
              });
            const result = await instance[methodName].bind(instance)(
              ...args,
              req,
              res
            );

            if (responseOptions) {
              res.writeHead(responseOptions.statusCode, {
                "Content-Type": responseOptions.contentType,
              });
              res.end(
                responseOptions.contentType === "application/json"
                  ? JSON.stringify(result)
                  : result
              );
            }
          },
        });
      }
    });
  }

  // Handle incoming requests
  async handle(req: RequestWithCookies, res: ResponseWithCookies) {
    const url = parse(req.url || "", true);
    const method = req.method?.toLowerCase();
    const matchingRoute = this.routes.find((route) =>
      this.matchRoute(route, url.pathname!, method)
    );

    if (matchingRoute) {
      const params = this.extractParams(matchingRoute.path, url.pathname!);
      req.params = params;
      req.query = this.extractQueryString(url.query);
      await matchingRoute.handler(req, res);
    } else {
      res.status(404).send("Not Found");
    }
  }

  // Match route path and method
  private matchRoute(
    route: Route,
    pathname: string,
    method: string | undefined
  ): boolean {
    if (route.method !== method) return false;
    const routeSegments = route.path.split("/").filter(Boolean);
    const pathSegments = pathname.split("/").filter(Boolean);
    if (routeSegments.length !== pathSegments.length) return false;

    return routeSegments.every((segment, index) => {
      return segment.startsWith(":") || segment === pathSegments[index];
    });
  }

  // Extract parameters from route
  private extractParams(
    routePath: string,
    pathname: string
  ): { [key: string]: string } {
    const params: { [key: string]: string } = {};
    const routeSegments = routePath.split("/").filter(Boolean);
    const pathSegments = pathname.split("/").filter(Boolean);

    routeSegments.forEach((segment, index) => {
      if (segment.startsWith(":")) {
        const paramName = segment.slice(1);
        params[paramName] = pathSegments[index];
      }
    });

    return params;
  }

  // Extract query string parameters
  private extractQueryString(query: ParsedUrlQuery): {
    [key: string]: string | string[];
  } {
    const parsedQuery: { [key: string]: string | string[] } = {};
    for (const key in query) {
      if (query[key] !== undefined) {
        parsedQuery[key] = query[key] as string | string[];
      }
    }
    return parsedQuery;
  }
}
