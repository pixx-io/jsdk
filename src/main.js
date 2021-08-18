import App from './App.svelte';

class PIXXIO {
	constructor(config = {}, lang = 'en') {
		this.config = config;
		this.boot();
		this.app = new App({
			target: this.element,
			props: {
				standalone: true,
				config
			}
		});
	}
	boot() {
		if (!this.config.element) {
			const root = document.createElement('div');
			root.id = 'pixxio-integration';
			document.body.appendChild(root);
			this.element = root;
		} else {
			this.element = this.config.element;
		}
	};
	getMedia(config) {		
		return new Promise((resolve, reject) => {
			if(config.max) {
				this.app.$set({ max: config.max });
			}
			this.app.$set({ show: true });
			this.app.$on('submit', (event) => {
				this.app.$set({ show: false });
				resolve(event.detail);
			})
			this.app.$on('cancel', () => {
				this.app.$set({ show: false });
				reject();
			})
		}) 
	}
}

window.PIXXIO = PIXXIO

export default PIXXIO;