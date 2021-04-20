# PIXXIO JSDK

This Library helps you to integrate pixx.io DAM Features to your application.

## SETUP

## USAGE

First you have to initialize the PIXXIO Class with your `APPKEY` and your `APPURL` (the URL to your pixx.io installation. e.g. https://demo.pixxio.media)

```javascript
const p = new PIXXIO({
  appKey: 'APPKEY',
  appUrl: 'APPURL'
})
```
### Options

**appKey**

Your system Application Key.

**appUrl**

Your pixx.io system URL.


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