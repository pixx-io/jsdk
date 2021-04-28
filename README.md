# PIXXIO JSDK

This Library helps you to integrate pixx.io DAM Features to your application.

## SETUP

### NPM

just install the package via `npm install @pixx.io/jsdk` and import it in your application via ESM:
```javascript
import '@pixx.io/jsdk/build/pixxio.jsdk.css'; /* CSS stuff is needed */
import PIXXIO from '@pixx.io/jsdk';

/* or */
const PIXXIO = require('@pixx.io/jsdk')
```

### Or simply integrate it

Just integrate it via unpkg.com:
- [https://unpkg.com/@pixx.io/jsdk@latest/build/pixxio.jsdk.css](https://unpkg.com/@pixx.io/jsdk@latest/build/pixxio.jsdk.css)
- [https://unpkg.com/@pixx.io/jsdk@latest/build/pixxio.jsdk.min.js](https://unpkg.com/@pixx.io/jsdk@latest/build/pixxio.jsdk.min.js)


## USAGE

First you have to initialize the PIXXIO Class with your `APPKEY` and your `APPURL` (the URL to your pixx.io installation. e.g. https://demo.pixxio.media)

```javascript
const p = new PIXXIO({
  appKey: 'APPKEY',
  appUrl: 'APPURL',
  v1: true|false
})
```
### Options

**appKey**

Your system Application Key.

**appUrl**

Your pixx.io system URL.

**v1**

If you are requesting a version 1 pixx.io system, you have to add the boolean flag `v1`


## Methods

### getMedia

Opens a File Selector and returns a Promise. If the promise is resolved, you will recieve an array of selected files.

```javascript
p.getMedia({
  max: 10
}).then((files) => {
  /** do whatever you want **/
})
```

#### Options

`max` : a number which sets the maximum of selected files. If `0` the maximum has no effect. default `0` 

#### Returns

an array of files like this:

```javascript 
[
  {
    url: '...',
    thumbnail: '...'
  }, 
  ...
]
```