## @tripathirajan/node-app

NodeJs-ExpressJs framework which handle basic setup for new new app.

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
        handler:(req, res)=>{}
        middleware:(req, res, next)=>{} // optional
    }],
    middleware:[
        (req, res, next)=>{},
        (req, res, next)=>{}
    ]
})

app.init().then(()=>{
    // do your stuff like db connection and other
});
```
