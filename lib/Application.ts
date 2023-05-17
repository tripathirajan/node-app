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
   * Logger  of application
   */
  private logger: any;

  /**
   * Router  of application
   */
  private router: Router = Router();

  constructor(config: AppConfig) {
    this.app = express();
    const { port, appName, isSecureHttp, allowedCorsOrigin, middleware, routes } = config;
    if (port !== undefined) this.port = port;
    if (appName !== undefined) this.appName = appName;
    if (isSecureHttp !== undefined) this.isSecureHttp = isSecureHttp;
    if (this.environment === 'production') this.isSecureHttp = true;
    if (allowedCorsOrigin !== undefined) {
      this.allowedCorsOrigin.concat(allowedCorsOrigin);
    }
    if (middleware !== undefined) this.appMiddleware = middleware;
    if (routes !== undefined) this.routes = routes;
  }

  /**
   * Init logger
   * @param logger
   */
  public initLogger(logger: any) {
    this.logger = logger;
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
   * Parses route method
   * @param method
   * @returns
   */
  private parseRouteMethod(method: HttpMethod) {
    switch (method) {
      case 'get':
        return this.router.get;
      case 'post':
        return this.router.post;
      case 'put':
        return this.router.put;
      case 'patch':
        return this.router.patch;
      default:
        return this.router.get;
    }
  }
  /**
   * Init routes
   */
  private registerRoute(): void {
    if (this.routes !== undefined && this.routes.length > 0) {
      let routeMethod = this.router.get;
      for (const route of this.routes) {
        routeMethod = this.parseRouteMethod(route.method);
        if (route.middleware) {
          routeMethod(route.path, route.middleware, route.handler);
        } else {
          routeMethod(route.path, route.handler);
        }
      }
    }
    this.app.all('*', (req: express.Request, res: express.Response) => {
      res.status(404);
      if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'errors', '404.html'));
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
    this.logger.info(`${this.appName} running on ${addressInfo.address}:${this.port}`);
  }

  /**
   * Starts app
   */
  public startApp(): void {
    if (this.server) {
      this.server.on('error', this.serverError);
      this.server.on('listening', this.serverListener);
      this.server.listen(this.port);
    }
  }
}

export default Application;
