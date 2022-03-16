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
  appKey: string,
  appUrl: string,
  modal: boolean,
  element: HTMLElement,
  language: string,
  askForProxy: boolean
})
```
### Options

- `appKey`: Your system Application Key.
- `appUrl`: Your pixx.io system URL. (Mediaspace) If the `appUrl` is not set, the user will be requested to set the mediaspace on the login screen.
- `refreshToken`: If you know your refresh token, you can define it here. If a refreshToken and an appUrl is set the login step is skipped.
- `element`: if element is set, then this element will be used as root element for the pixxio selector. Otherwise an own element is created and added to the body. 
- `modal`: if modal is set to false. the selector won't open as an overlay. default `true`
- `language`: currently supported are german `de` and english `en`
- `askForProxy`: if its true it shows the advanced settings at the login screen to enter proxy configurations. The JSDK does not use this information but it stores for you and you can ask for proxy settings be calling the method `getProxyConfiguration()`
- `compact`: shows the interface as compact version. just necessary elements. default `false`
### Events

- `authState`: returns an object `{ login: boolean }` everytime the state is changed

## Methods

### getMedia()

Opens a File Selector and returns a Promise. If the promise is resolved, you will recieve an array of selected files.

```javascript
p.getMedia({
  max: 10
}).then((files) => {
  /** do whatever you want **/
});
```

#### Options

- `max` : a number which sets the maximum of selected files. If `0` the maximum has no effect. default `0` 
- `allowTypes`: define the file extensions which are allowed to select. For example `['jpg', 'png']` default: `[]`
- `allowFormats`: define download formats which are allowed to select. For original or preview use the keys: `preview`, `original` the other system configured formats can be defined by id. So for example `['preview', 123, 321]` default: `null`
- `additionalResponseFields`: is an array of responseFields. the possible fields are described in the official pixx.io API.
- `showFileType`: shows the file type as tag in the file list. default `false`
- `showFileSize`: shows the file size as tag in the file list. default `false`
- `showSubject`: shows the subject under the file item as caption. default `true`
- `showFileName`: shows the file name under the file item as caption. default `false`

#### Returns

an array of files like this:

```javascript 
[
  {
    id: '...', // mediaspace file id
    url: '...',
    thumbnail: '...',
    file: {...}
  }, 
  ...
]
```


### pushMedia()

Uploads a given File to pixx.io

```javascript
p.pushMedia({
  file: File(binary)
}).then(() => {
  /** do whatever you want **/
}).catch(() => {
  /** upload failed **/
});
```

#### Options

- `file` : File binary
- you can chain other options directly (like directory or keywords). For those check the API documentation of pixx.io


### bulkMainVersionCheck(ids: number[])

returns an array of ids and mainVersion boolean to check if a file has changed 

```javascript
p.bulkMainVersionCheck([5555,5551,5553]).then(() => {
  /** do whatever you want **/
}).catch(() => {
  /** check failed **/
});
```

#### Returns

```json
[
  { "id": 5555, "isMainVersion": false, "mainVersion": 5556, "originalFileURL": "..." },
  ...
]
```

### getProxyConfiguration()

returns the entered configuration during login 

```js
p.getProxyConfiguration(); 
```
#### Returns

```json
{
  "protocol": "",
  "host": "",
  "port": "",
  "auth": {
    "username": "",
    "password": ""
  }
}
```

### forceLogout

forces the logout of the pixx.io mediaspace

```js 
p.forceLogout()
```