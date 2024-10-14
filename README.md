### Note: this project has been transferred to (https://github.com/typhoonts/typhoonts)[https://github.com/typhoonts/typhoonts]

# TyphoonTS

A robust and type-safe framework for building scalable web applications using TypeScript

## Features

- TypeScript-Only Framework
- Decorators for Routes and Services
- Middleware Support
- Object Pool for Singleton Services
- Session and Cookie Management
- MVC Architecture
- Dynamic Routing
- Modular and Extensible
- HTTP Server Creation
- Service Injection

## Installation

    npm install typhoonts

## Example Usage

### Defining a Service

    import { Service } from 'typhoonts';

    @Service()
    export class ExampleService {
        getExampleData() {
            return { message: 'Hello from the service!' };
        }
    }

### Defining a Controller

    import { Controller, Get, Request, Response } from 'typhoonts';
    import { ExampleService } from './services/ExampleService';
    import { Inject } from 'typhoonts';

    @Controller('/')
    export class HomeController {
        @Inject(ExampleService)
        private exampleService!: ExampleService;

        @Get('/')
        getHome(req: Request, res: Response) {
            const data = this.exampleService.getExampleData();
            res.json(data);
        }

        @Post("/")
        save(req: Request, res: Response) {
            res.json({
                body: req.body,
                params: req.params,
                query: req.query,
            });
        }
    }

### Setting Up the Server

    import { Server } from 'typhoonts';
    import { HomeController } from './controllers/HomeController';
    import { ExampleService } from './services/ExampleService';

    const server = new Server({
        useBodyParser: true,
        useCookieParser: true,
        useSession: true,
        sessionOptions: { secret: 'my_secret_key' }
    });

    server.registerController(HomeController);

    server.listen(8000, () => {
        console.log('Server is running on http://localhost:8000');
    });

## Dynamic URL Example

    import { Controller, Get, Request, Response } from 'typhoonts';

    @Controller('/users')
    export class UserController {
        @Get('/:id')
        getUser(req: Request, res: Response) {
            const userId = req.params.id;
            res.send(`User ID is ${userId}`)
        }
    }

## Controller with @ResponseBody()

    import { Controller, Get, Request, Response } from 'typhoonts';

    @Controller('/users')
    export class UserController {
        @Post("/")
        @ResponseBody()
        save(req: Request, res: Response) {
            return {
                body: req.body,
                params: req.params,
                query: req.query,
            };
        }
    }

## Controller with @ResponseBody(), @Param(), @Body(), and @Query()

    import { Controller, Get, Request, Response } from 'typhoonts';

    @Controller('/users')
    export class UserController {
        @Put("/:id")
        @ResponseBody()
        update(
            @Param("id") id: string,
            @Body() reqBody: any,
            @Query("keyword") keyword: string
        ) {
            return {
                body: reqBody,
                params: {
                    id,
                },
                query: {
                    keyword,
                },
            };
        }
    }

In this example, a GET request to `/users/123` would respond with `User ID is 123`.

## Middleware

### Body Parser

    import { bodyParser } from 'typhoonts';

    // Use body parser middleware
    server.use(bodyParser);

### Cookie Parser

    import { cookieParser } from 'typhoonts';

    // Use cookie parser middleware
    server.use(cookieParser);

### Session

    import { session } from 'typhoonts';

    // Use session middleware
    server.use(session({ secret: 'my_secret_key' }));

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.
