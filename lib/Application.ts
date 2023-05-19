import express, { Router } from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { AddressInfo } from 'net';

type Environment = 'development' | 'production';
type AppMiddleWare = (req: express.Request, res: express.Response, next: (err?: any) => any) => void;
type HttpMethod = 'all' | 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head';

type AppRoute = {
  path: string;
  method: HttpMethod;
  handler: (req: express.Request, res: express.Response) => void;
  middleware?: AppMiddleWare;
};

type AppConfig = {
  port: number;
  appName: string;
  isSecureHttp: boolean;
  allowedCorsOrigin?: string[];
  middleware?: AppMiddleWare[];
  routes?: AppRoute[];
  customErrorHandler?: (err: Error) => void;
};

class Application {
  /**
   * App  of application
   */
  public app: express.Application;

  /**
   * App name of application
   */
  private appName: string = 'Node-App';

  /**
   * Port  of application
   */
  private port: number = 8800;

  /**
   * Determines whether secure http is or not
   */
  private isSecureHttp: boolean = false;

  /**
   * Environment  of application
   */
  private environment: Environment = (process.env.environment || 'development') as Environment;

  /**
   * Server  of application
   */
  private server: http.Server | undefined;

  /**
   * Routes  of application
   */
  private routes: AppRoute[] | undefined;

  /**
   * App middleware of application
   */
  private appMiddleware: AppMiddleWare[] | undefined;

  /**
   * Allowed cors origin of application
   */
  private allowedCorsOrigin: string[] = [
    'http://localhost:4000/',
    'http://localhost:3000/',
    'http://127.0.0.1:4000',
    'http://127.0.0.1:3000',
  ];

  /**
   * Router  of application
   */
  private router: Router = Router();

  private customErrorHandler: undefined | ((error: Error) => void) = undefined;

  /**
   * Creates an instance of application.
   * @param config
   */
  constructor(config: AppConfig) {
    this.app = express();
    const { port, appName, isSecureHttp, allowedCorsOrigin, middleware, routes, customErrorHandler } = config;
    if (port !== undefined) this.port = port;
    if (appName !== undefined) this.appName = appName;
    if (isSecureHttp !== undefined) this.isSecureHttp = isSecureHttp;
    if (this.environment === 'production') this.isSecureHttp = true;
    if (allowedCorsOrigin !== undefined) {
      this.allowedCorsOrigin.concat(allowedCorsOrigin);
    }
    if (middleware !== undefined) this.appMiddleware = middleware;
    if (routes !== undefined) this.routes = routes;
    if (customErrorHandler !== undefined && typeof customErrorHandler === 'function') {
      this.customErrorHandler = customErrorHandler;
    }
  }

  /**
   * Inits application
   * @returns init
   */
  public async init(): Promise<void> {
    // middleware
    this.initializeMiddleware();
    // register routes
    this.registerRoute();

    // server
    if (this.isSecureHttp) {
      this.createHttpsServer();
    } else {
      this.createHttpServer();
    }
    // start app
    this.startApp();
    // error handler
    this.app.use(this.errorHandler.bind(this));
  }

  /**
   * Creates http server
   */
  private createHttpServer(): void {
    this.server = http.createServer(this.app);
  }
  /**
   * Creates https server
   */
  private createHttpsServer(): void {
    // todo: create https server
  }

  /**
   * Initializes middleware
   */
  private initializeMiddleware(): void {
    // mandatory middleware
    this.app.use(helmet({ contentSecurityPolicy: false }));
    this.app.use(express.json({ limit: '100mb' }));
    this.app.use(express.urlencoded({ limit: '100mb', extended: true }));
    this.app.use(
      cors({
        origin: (origin, callback) => {
          if ((origin !== undefined && this.allowedCorsOrigin.includes(origin)) || !origin) {
            callback(null, true);
          } else {
            callback(new Error('Not allowed by CORS'));
          }
        },
      }),
    );
    // custom middleware
    if (this.appMiddleware !== undefined || Array.isArray(this.appMiddleware)) {
      for (const middleware of this.appMiddleware) {
        this.app.use(middleware);
      }
    }
  }

  /**
   * Init routes
   */
  private registerRoute(): void {
    if (this.routes !== undefined && this.routes.length > 0) {
      for (const route of this.routes) {
        if (route.middleware) {
          this.router[route.method](route.path, route.middleware, route.handler);
        } else {
          this.router[route.method](route.path, route.handler);
        }
      }
      this.app.use('/', this.router);
    }
    this.app.all('*', (req: express.Request, res: express.Response) => {
      res.status(404);
      if (req.accepts('html')) {
        res.sendFile(path.join(process.cwd(), 'errors', '404.html'));
      } else if (req.accepts('json')) {
        res.json({ message: ' Not found.' });
      } else {
        res.type('txt').send('404 Not Found');
      }
    });
  }

  /**
   * Servers error
   * @param error
   */
  private serverError(error: NodeJS.ErrnoException) {
    if (error.syscall !== 'listen') {
      throw error;
    }
    // handle specific error codes here.
    throw error;
  }

  /**
   * Servers listener
   */
  private serverListener(): void {
    const addressInfo: AddressInfo = this.server?.address() as AddressInfo;
    this.logApplicationStatus(addressInfo.address, this.port);
  }

  /**
   * Starts app
   */
  private startApp(): void {
    if (this.server) {
      this.server.on('error', this.serverError.bind(this));
      this.server.on('listening', this.serverListener.bind(this));
      this.server.listen(this.port);
    }
  }
  private errorHandler(err: Error, req: express.Request, res: express.Response, next: (err?: any) => any) {
    if (this.customErrorHandler && typeof this.customErrorHandler === 'function') {
      this.customErrorHandler(err);
    }
    res.status(500).json({ message: 'Internal server error.' });
  }
  private logApplicationStatus(host: string, port: number) {
    process.stdout.write('\x1b[32m');
    process.stdout.write('*************************************************\n');
    process.stdout.write(`App Name: ${this.appName}\n`);
    process.stdout.write(`Host: ${host || 'localhost'}\n`);
    process.stdout.write(`Port: ${port}\n`);
    process.stdout.write(`Environment: ${this.environment}\n`);
    process.stdout.write(`Status: Running \n`);
    process.stdout.write('*************************************************\n \n');
    process.stdout.write('Thanks for using package @tripathirajan/node-app \n \n');
    process.stdout.write('*************************************************\n');
    process.stdout.write('\x1b[00m');
  }
}

export default Application;
