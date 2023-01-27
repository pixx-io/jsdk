import axios from "axios";
import { accessToken, appKey, mediaspace, refreshToken, proxy } from "./store/store";

export class API {
  accessToken = '';
  refreshToken = '';
  mediaspace = '';
  appKey = '';
  proxyConfig = {};

  isAccessTokenFetching = false;
  queuedRequests = [];

  constructor(
  ) {
    mediaspace.subscribe(value => this.mediaspace = value);
    appKey.subscribe(value => this.appKey = value);
    refreshToken.subscribe(value => this.refreshToken = value);
    accessToken.subscribe(value => this.accessToken = value);
  }

  get(path, parameters = {}, useAccessToken = true, additionalHeaders = null, setDefaultHeader = true, useURLSearchParams = true)  {
    return this.call('get', path, parameters, useAccessToken, additionalHeaders, setDefaultHeader, useURLSearchParams);
  }

  post(path, parameters = {}, useAccessToken = true, additionalHeaders = null, setDefaultHeader = true, useURLSearchParams = true) {
    return this.call('post', path, parameters, useAccessToken, additionalHeaders, setDefaultHeader, useURLSearchParams);
  }

  put(path, parameters = {}, useAccessToken = true, additionalHeaders = null, setDefaultHeader = true, useURLSearchParams = true) {
    return this.call('put', path, parameters, useAccessToken, additionalHeaders, setDefaultHeader, useURLSearchParams);
  }

  delete(path, parameters = {}, useAccessToken = true, additionalHeaders = null, setDefaultHeader = true, useURLSearchParams = true) {
    return this.call('delete', path, parameters, useAccessToken, additionalHeaders, setDefaultHeader, useURLSearchParams);
  }

  callAccessToken() {
    return new Promise((resolve, reject) => {
      let requestData = {
        refreshToken: this.refreshToken,
        applicationKey: this.appKey
      };

      this.post('/accessToken', requestData, false)
      .then((data) => {
        if(data.success) {
          this.accessToken = data.accessToken;
          accessToken.update(() => data.accessToken);
          resolve(data);
        } else {
          reject(data);
        }
      }).catch(reject);
    })
    
  }

  call(method, path, parameters = {}, useAccessToken = true, additionalHeaders = null, setDefaultHeader = true, useURLSearchParams = true) {
    return new Promise((resolve, reject) => {
      const request = (requestData, headers) => {
        const url = 'https://' + this.mediaspace.replace(/(http|https):\/\//, '') + '/gobackend' + path;
        let params = requestData;
        if (useURLSearchParams) {
          params = new URLSearchParams();
          for (const key of Object.keys(requestData)) {
            let value = requestData[key];
            if (typeof value === 'object') {
              value = JSON.stringify(value);
            }
            params.set(key, value);
          }
          params = params.toString();
        }

        if (!headers) {
          headers = {};
        }

        if (setDefaultHeader) {
          headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }

        if (additionalHeaders) {
          headers = {...headers, ...additionalHeaders};
        }

        let observeCall = { url: url, request: { method: 'post', headers, data: params } };

        switch (method) {
          case 'get':
            observeCall = { url: url + '?' + params, request: { headers } };
            break;
          case 'put':
            observeCall = { url: url, request: { method: 'put', headers, data: params } };
            break;
          case 'delete':
            observeCall = { url: url, request: { method: 'delete', headers, data: params } };
            break;
        }

        axios({ url: observeCall.url, proxy: this.proxyConfig, ...observeCall.request })
          .then(({ data }) => {
            if (data.success === true || data.success === 'true') {
              resolve(data);
            } else {
              throw { response: data };
            }
          })
          .catch(({ response }) => {
            const data = response?.data;
            switch (data.errorcode) {
              case 15007:
              case 15008:
              case 2062:
                if (this.isAccessTokenFetching) {
                  this.queuedRequests.push(doRequest);
                } else {
                  this.isAccessTokenFetching = true;
                  this.callAccessToken()
                    .then(() => {
                      this.isAccessTokenFetching = false;
                      doRequest();
                      this.queuedRequests.forEach(r => r());
                      this.queuedRequests = [];
                    })
                    .catch(() => reject());
                }
                break;
              case 5266:
                reject(data.errormessage);
                break;
              default:
                reject(data.errormessage);
                break;
            }
          });
      };

      const doRequest = () => {
        try {
          this.proxyConfig = typeof localStorage !== 'undefined' ? JSON.parse(localStorage.getItem('proxy')) : {};
        } catch(e) {}

        if (useAccessToken) {
          const accessToken = this.accessToken;
          let headers = {};
          headers = {  // API v2
            Authorization: 'Key ' + accessToken
          };
          request(parameters, headers);
        } else {
          request(parameters);
        }
      }

      doRequest();
    });
  }
}
