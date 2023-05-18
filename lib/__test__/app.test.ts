import { default as Application } from '../Application';
import express from 'express';

describe('Application status test', () => {
  let expressApp: express.Application;

  beforeAll(async () => {
    const app: Application = new Application({
      port: 3000,
      appName: 'Integration-Test',
      isSecureHttp: false,
    });
    expressApp = app.app;
  });
  test('Should have instance', () => {
    expect(expressApp).toBeDefined();
  });
});
