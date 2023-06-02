## @tripathirajan/node-app

NodeJs-ExpressJs framework which handle basic setup for new app.

### Installation

```js
npm install @tripathirajan/node-app
```

or

```js
yarn add @tripathirajan/node-app
```

### Usage

```js
import { default as Application } from '@tripathirajan/node-app'

const app = Application({
    port:3000,
    appName:'test-app',
    isSecureHttp: false,
    routes:[{
        method:'get',
        path:'/info',
        handler:(req, res)=>{},
        middleware:(req, res, next)=>{} // optional
    }],
    middleware:[
        (req, res, next)=>{},
        (req, res, next)=>{}
    ],
    customErrorHandler:(error){
        console.log(error)
    },
    // (optional) add dotenv config (see the dotenv doc)
    envConfig:{
        /**
         * Default: `path.resolve(process.cwd(), '.env')`
         *
         * Specify a custom path if your file containing environment variables is located elsewhere.
         *
         */
        path: path.resolve(process.cwd(), '.env') ;

        /**
         * Default: `utf8`
         *
         * Specify the encoding of your file containing environment variables.
         *
         * example: `encoding: 'latin1' `
         */
        encoding: 'utf8';

        /**
         * Default: `false`
         *
         * Turn on logging to help debug why certain keys or values are not being set as you expect.
         *
         * example:  debug: process.env.DEBUG `
         */
        debug: false;

        /**
         * Default: `false`
         *
         * Override any environment variables that have already been set on your machine with values from your .env file.
         *
         * example: `override: true`
         */
        override: false;
    }
    /**
     * existing allowed origins
     *
     * 'http://localhost:4000/',
     * 'http://localhost:3000/',
     * 'http://127.0.0.1:4000',
     * 'http://127.0.0.1:3000',
     *
     * add the origin if not in the above list
     * */
    allowedCorsOrigin:[] // (optional) add origin in this array
})

app.init().then(()=>{
    // do your stuff like db connection and other
}).catch(error=>{
process.exit(1);
});
```

### Output

```console
*************************************************
App Name: test-app
Host: ::
Port: 8080
Environment: development
Status: Running
*************************************************

Thanks for using package @tripathirajan/node-app

*************************************************
```
