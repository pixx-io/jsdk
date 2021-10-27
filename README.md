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
  v1: true|false,
  element: HTMLElement
})
```
### Options

**appKey**

Your system Application Key.

**appUrl**

Your pixx.io system URL. (Mediaspace) If the `appUrl` is not set, the field user will be requested to set the mediaspace on the login screen.

**v1**

If you are requesting a version 1 pixx.io system, you have to add the boolean flag `v1`

**element**

if element is set, then this element will be used as root element for the pixxio selector. Otherwise an own element is created and added to the body. 


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

- `max` : a number which sets the maximum of selected files. If `0` the maximum has no effect. default `0` 
- `allowedTypes`: define the file extensions which are allowed to select. For example `['jpg', 'png']` default: `[]`
- `allowedFormats`: define download formats which are allowed to select. For original or preview use the keys: `preview`, `original` the other system configured formats can be defined by id. So for example `['preview', 123, 321]` default: `null`

#### Returns

an array of files like this:

```javascript 
[
  {
    id: '...', // mediaspace file id
    url: '...',
    thumbnail: '...'
  }, 
  ...
]
```