import express from 'express';
import http from 'http';
import https from 'https';
import fs from 'fs';
import { AddressInfo } from 'net';

interface IServer {
  getAddressInfo(): AddressInfo | undefined;
}

type ServerConfig = {
  keyPath?: string;
  certPath?: string;
  isHttps: boolean;
};

type AppServerType = http.Server | https.Server;

class AppServer implements IServer {
  private server: AppServerType | undefined;
  private isHttps: boolean = false;
  private application: express.Application | undefined;
  private keyPath: string | undefined;
  private certPath: string | undefined;

  constructor(app: express.Application) {
    if (app !== undefined) this.application = app;
  }
  private isFileExists(path: string): boolean {
    return fs.existsSync(path);
  }
  public getAddressInfo(): AddressInfo | undefined {
    let address: AddressInfo | undefined;
    if (this.server && typeof this?.server?.address === 'function') {
      address = this.server.address() as AddressInfo;
    }
    return address;
  }
  private createHttpServer(): void {
    this.server = http.createServer(this.application);
  }
  private createHttpsServer(): void {
    const certificateConfig: any = {
      key: fs.readFileSync(this.keyPath || ''),
      cert: fs.readFileSync(this.certPath || ''),
    };
    this.server = https.createServer(certificateConfig, this.application);
  }
  public createServer(config: ServerConfig): AppServerType | undefined {
    const { isHttps, keyPath, certPath } = config;
    if (isHttps && (keyPath === undefined || certPath === undefined)) {
      this.isHttps = false;
    } else {
      this.isHttps = isHttps;
    }
    if (keyPath !== undefined && certPath !== undefined) {
      const pathExists = this.isFileExists(keyPath) && this.isFileExists(certPath);
      if (!pathExists) {
        throw new Error('Key and cert path is not valid.');
      }
      this.keyPath = keyPath;
      this.certPath = certPath;
    }
    if (this.isHttps) {
      this.createHttpsServer();
    } else {
      this.createHttpServer();
    }
    return this.server;
  }
}

export default AppServer;
