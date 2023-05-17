## @tripathirajan/logtrace

Logger package build on top of `pino`, `pino-pretty` and `file-stream-rotator`.

### Installation

```js
npm install @tripathirajan/logtrace
```

or

```js
yarn add @tripathirajan/logtrace
```

### Set Rules

First create logRule.json with following rules:

```javascript
{
    logDir: 'logs',
    targets: {
        console: {
            singleLine: false,
            colorize: true
        },
        file: {
            fileName: '%fileName%-%DATE%',
            ext: 'log',
            maxLogs: '10d',
            frequency: '24h',
            maxSize: '1m',
            dateFormat: 'YYYY-MM-DD',
            prettyConfig: {
                singleLine: false,
                colorize: false
            }
        },
        remote: {
            url: '',
            method: 'POST',
            format: '',
            prettyConfig: {
                singleLine: false,
                colorize: false
            }
        }
    },
    rules: [
        { loggerName: '*', level: 'info', outputMode: 'console' },
        { loggerName: '*', level: 'debug', outputMode: 'file' },
        { loggerName: '*', level: 'error', outputMode: 'file' }
    ],
    disableLogger: []
}
```

Here in config we have two major section `targets` and `rules`. Those who have worked on Nlog (in .net) should familiar with this pattern, we have used same configurtion pattern. lets understand the each sections.

1. `Targets` : this section contains the output of logs like what type of output mode we have. Here we have `console`, `file`, `remote`, and `elastic`.

- `Console`: here we allow configuration of pino-pretty like `colorize`, `singleLine`
- `file`: here we allow configuration for log files like `fileName pattern`, `ext` (file extesion) etc. we can also add pretty config by adding `prettyConfig:{}`
- `Remote` : this feature not implemented yet it is in WIP, this target is to post log to any url.

2. `Rules`: rules are basically to decide the for which loglevel and loggername what will be target. By default loggerName specified ` *` which means it will aplly for all logger and all log levels. If we need to specify for a perticular logger to generate separae file we have to add in rule as:

```js
{ loggerName:'App' level:'error', outputMode:'file,console'}
```

Then for logger _App_ and loglevel `error` it will generate separate log file and post log to remote target.

3. `logDir`: default log directory name.

4. `disableLogger`: this feature not implemented yet.
   Now we have completed the configuration part now here are the rest of steps:
   Step 1 (a). Add middleware first in the root file like `app.js` or `server.js` or `index.js` whatever is your root file

```js
const express = require('express');
const { logTraceMiddleware } = require('@tripathirajan/logtrace');
.
.
const app = express();
app.use(logTraceMiddleware);
```

This is to get request information in case of loging error for `logger.debug` and `logger.error()`

Step 1 (b). require logmanager in your file where you want to use the logger:

```js
const logManager = require('@tripathirajan/logtrace');
const appLogger = logManager.getLogger('App');
```

here you have to pass logger name `getLogger(loggerName)`, by default it is `logger`
you can create multiple instance of logger as:

```js
const logManager = require('@tripathirajan/logtrace');
const appLogger = logManager.getLogger('App');
const uploadLogger = logManager.getLogger('Upload');
```

Step 2. add your logger

```js
appLogger.info('App running'); // [18:29:11.000] INFO (89643): App running
```
