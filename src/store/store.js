import { writable } from 'svelte/store';

export const domain = writable('');
export const appKey = writable('');
export const refreshToken = writable('');
export const accessToken = writable('');
export const modal = writable(true);
export const language = writable('en');
export const isAuthenticated = writable(false);
export const show = writable(false);
export const mode = writable('get');
export const uploadConfig = writable(null);
export const askForProxy = writable(false);
export const compact = writable(false);
export const websocket = writable(null);

