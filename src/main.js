import { get } from 'svelte/store';
import { API } from './api';
import { HELPER } from './helper';
import App from './App.svelte';
import { changed, maxFiles, allowFormats, allowTypes, additionalResponseFields, showFileName, showFileType, showFileSize, showSubject } from './store/media';
import { mediaspacePreSet, mediaspace, language, appKey, modal, show, isAuthenticated, mode, refreshToken, askForProxy, compact } from './store/store';

// Tippy styles
import 'tippy.js/dist/tippy.css';

class PIXXIO {
	constructor(config = {}, lang = 'en') {
		this.config = config;
		this.runningPromise;
		this.boot();
		this.storeConfig(config);
		this.app = new App({
			target: this.element,
			props: {
				standalone: true,
				config
			}
		});
	}
	storeConfig(config) {
		language.update(() => config?.language || 'en');
		mediaspace.update(() => config?.appUrl || '');
		mediaspacePreSet.update(() => !!config?.appUrl || false);
		appKey.update(() => config?.appKey || '');
		modal.update(() => config?.modal);
		askForProxy.update(() => !!config?.askForProxy);
		compact.update(() => config?.compact || false);
		refreshToken.update(() => config?.refreshToken || '');
	}
	boot() {
		if (!this.config?.element) {
			const root = document.createElement('div');
			root.id = 'pixxio-integration';
			document.body.appendChild(root);
			this.element = root;
		} else {
			this.element = this.config.element;
		}
	};
	destroy() {
		show.update(() => false);
		this.element.parentNode.removeChild(this.element);
	}
	destroyMedia() {
		show.update(() => false);
	}
	getMedia(config) {
		allowTypes.update(() => config?.allowTypes || []);
		allowFormats.update(() => config?.allowFormats || null);
		maxFiles.update(() => config?.max > 0 ? (config?.max || 0) : 0);
		additionalResponseFields.update(() => config?.additionalResponseFields || []);
    
    if (HELPER.isBoolean(config?.showFileName)) {
		  showFileName.update(() => config?.showFileName);
    }
    
    if (HELPER.isBoolean(config?.showFileType)) {
		  showFileType.update(() => config?.showFileType);
    }
    
    if (HELPER.isBoolean(config?.showFileSize)) {
      showFileSize.update(() => config?.showFileSize);
    }

    if (HELPER.isBoolean(config?.showSubject)) {
      showSubject.update(() => config?.showSubject);
    }
	
		const calledTime = Date.now();
		changed.update(() => calledTime);
		mode.update(() => 'get');

		return new Promise((resolve, reject) => {
			show.update(() => true);
			this.app.$on('submit', (event) => {
				show.update(() => false);
				resolve(event.detail);
			})
			this.app.$on('cancel', () => {
				show.update(() => false);
				reject();
			})
			changed.subscribe((value) => {
				if (calledTime !== value) {
					reject();
				}
			})
		});
	}

	on(eventKey, callback) {
		switch(eventKey) {
			case 'authState':
				isAuthenticated.subscribe(value => {
					if (callback && typeof callback === 'function') {
						callback({login: value})
					}
				});
				break;
			default:
				console.error('Error: Event does not extist');
				break;	
		}
		
	}

	pushMedia(config) {
		const calledTime = Date.now();
		changed.update(() => calledTime);
		mode.update(() => 'upload');
		
		return new Promise((resolve, reject) => {
			show.update(() => true);
			this.app.$set({ uploadConfig: config });
			this.app.$on('uploaded', (event) => {
				resolve(event.detail);
			})
			this.app.$on('uploadError', () => {
				reject();
			})
			this.app.$on('cancel', () => {
				show.update(() => false)
				reject();
			})
		});
	}

	bulkMainVersionCheck(ids) {
		const api = new API();
		const auth = get(isAuthenticated);
		return new Promise(async (resolve, reject) => {
			if (!auth) {
				reject();
			} else {
				try {
					const chunkSize = 200;
					const chunks = [];
					for(let i = 0; i < ids.length; i++) {
						const key = Math.floor(i/chunkSize);
						if (!chunks[key]) {
							chunks[key] = [];
						}
						chunks[key].push(ids[i]);
					}
					
					Promise.all(chunks.map(async chunk => {
						const _options = { 
							ids: chunk,
							responseFields: [
								"id",
								"isMainVersion",
								"mainVersion",
								"mainVersionOriginalFileURL",
								"mainVersionFileName",
								"mainVersionFileSize"
							]
						};
						const data = await api.get(`/files/existence`, _options);
						if(!data.success) {
							throw new Error(data.errormessage)
						}
						return data;
					})).then((data) => {
						let files = [];
						data.forEach(d => {
							files = [...files, ...d.files]
						});
						resolve(files);
					})
				} catch(e) {
					console.log(e);
					reject(e);
				}
			}
		})
	}

	forceLogout = () => {
		try {
			if (typeof localStorage !== 'undefined') {
				localStorage.removeItem('refreshToken');
				localStorage.removeItem('mediaspace');
				localStorage.removeItem('proxy');
			}
		} catch(e) {}
		isAuthenticated.update(() => false);
		mediaspace.update(() => '');
		refreshToken.update(() => '');
	}

	getProxyConfiguration() {
		try {
			const proxyStettings = typeof localStorage !== 'undefined' ? localStorage.getItem('proxy') : null;
			if (proxyStettings) {
				return JSON.parse(proxyStettings);
			}
		} catch(e) {}
		return null;
	}

	getFileById(id, options) {
		const api = new API();
		const auth = get(isAuthenticated);
		return new Promise(async (resolve, reject) => {
			if (!auth) {
				reject();
			} else {
				try {
					const _options = { 
						responseFields: [
							"id",
							"originalFileURL",
							"width",
							"height",
							"fileName",
							"fileExtension",
							"uploadDate",
							"modifyDate",
							"rating",
							"fileSize",
							"dominantColor",
							"versions"
						],
						...(options || {})
					}
		
					const data = await api.get(`/files/${id}`, _options);
					if(!data.success) {
						throw new Error(data.errormessage)
					}
					resolve(data);
				} catch(e) {
					console.log(e);
					reject(e);
				}
			}
		})
	}

	api() {
		const api = new API();
		const auth = get(isAuthenticated);
		return {
			get: async (path, params) => {
				return await api.get(path, params);
			}
		}
	}
}

if (typeof window !== 'undefined') {
	window.PIXXIO = PIXXIO;
}

export default PIXXIO;