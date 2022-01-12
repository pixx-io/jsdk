import { writable } from 'svelte/store';

export const showSelection = writable(false);
export const searchTerm = writable('');
export const format = writable('preview');
export const allowTypes = writable([]);
export const allowFormats = writable(null);
export const changed = writable(1);
export const maxFiles = writable(0);
export const additionalResponseFields = writable([]);
export const showFileName = writable(false);
export const showFileType = writable(false);
export const showFileSize = writable(false);
