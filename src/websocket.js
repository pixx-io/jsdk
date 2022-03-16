import { API } from './api';
import { mediaspace, accessToken } from './store/store';
import { writable } from 'svelte/store';

export class WEBSOCKET {

  listenSubject = writable(null);

  socket = null;
  mediaspace = null;
  accessToken = null;
  status = 'NOT_CONNECTED';
  reconnectionAttempts = 0;
  reconnectionTimeout = null;
  reconnectionTimeoutDelay = 5000;

  constructor() {
    mediaspace.subscribe(value => {
      this.mediaspace = value;
      this.init();
    });
    accessToken.subscribe(value => {
      this.accessToken = value;
      this.init();
    });
  }

  init() {
    if (this.mediaspace && this.accessToken) {
      this.connect();
    }
  }

  connect() {
    if (this.status === 'CONNECTING') {
      return true;
    }

    this.close();

    if (!this.accessToken) {
      return false;
    }

    this.status = 'CONNECTING';

    const websocketUrl = 'wss://' + this.mediaspace.replace(/^(http|https):\/\//, '') + '/gobackend/ws?accessToken=' + this.accessToken;
    this.socket = new WebSocket(websocketUrl);

    this.socket.onopen = () => {
      this.status = 'CONNECTED';
      this.reconnectionTries = 10;
      clearTimeout(this.reconnectionTimeout);
    };

    this.socket.onmessage = (event) => {
      try {
        const lines = event.data.split("\n");
        lines.forEach(line => {
          this.triggerListeners(JSON.parse(line));
        });
      } catch (e) { }
    };

    this.socket.onclose = (event) => {
      console.warn('WS: Connection Lost', event);
      this.status = 'NOT_CONNECTED';
      this.reconnect();
    };

    this.socket.onerror = (event) => {
      console.error('WS: Error!', event);
      this.status = 'ERROR';
      if (this.reconnectionTries < 5) {
        (new API()).callAccessToken().then({
          // connection will be triggered by the accessToken subscriber
        });
      } else {
        this.reconnect();
      }
    };
    
    return true;
  }

  reconnect() {
    if (this.reconnectionAttempts <= 0) {
      return;
    }

    if (this.reconnectionTimeout) {
      clearTimeout(this.reconnectionTimeout);
    }

    this.reconnectionTimeout = setTimeout(() => {
      this.reconnectionAttempts -= 1;
      const authenticated = this.connect();
      if (!authenticated) {
        clearTimeout(this.reconnectionTimeout);
      }
    }, this.reconnectionTimeoutDelay);
  }

  close() {
    if (this.socket && (this.status === 'CONNECTED' || this.status === 'CONNECTING')) {
      this.socket.close();
    }
  }

  triggerListeners(data) {
    this.listenSubject.update(() => data);
  }

  listen(callback) {
    return this.listenSubject.subscribe(callback);
  }
}
