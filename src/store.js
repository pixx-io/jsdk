import { writable } from 'svelte/store';

export const domain = writable('');
export const appKey = writable('');
export const refreshToken = writable('');
export const accessToken = writable('');
export const searchTerm = writable('');
export const format = writable('preview');
export const v1 = writable(false);