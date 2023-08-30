import { DotenvConfigOptions } from 'dotenv';
import express from 'express';

export type Environment = 'development' | 'production' | 'testing' | 'staging';
export type AppMiddleWare = (req: express.Request, res: express.Response, next: (err?: any) => any) => void;
export type HttpMethod = 'all' | 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head';

export type AppRoute = {
  path: string;
  method: HttpMethod;
  handler: (req: express.Request, res: express.Response) => void;
  middleware?: AppMiddleWare;
};

export type HttpsServerConfig = {
  keyPath: string;
  certPath: string;
};
export type AppConfig = {
  port: number;
  appName: string;
  isSecureHttp: boolean;
  allowedCorsOrigin?: string[];
  middleware?: AppMiddleWare[];
  routes?: AppRoute[];
  customErrorHandler?: (err: Error) => void;
  envConfig?: DotenvConfigOptions;
  httpsServerConfig?: HttpsServerConfig;
  enableSwagger: boolean;
};
