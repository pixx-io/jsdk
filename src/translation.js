import { language } from "./store/store";

export function lang(key) {

  let lang = 'en';
  language.subscribe(value => lang = value);

  const lines = {
    de: {
      mediaspace: 'Mediaspace (example.px.media)',
      username: 'Username oder E-Mail',
      password: 'Passwort',
      signin: 'Anmelden',
      signin_description: 'Bitte melde dich in dein pixxio System an um Dateien auszuwählen.',
      signin_error: 'Ungültiger Benutzer oder Passwort',
      application_key_error: 'Das Plugin ist nicht für deinen Mediaspace freigegeben. Kontaktiere deinen Administrator oder support@pixx.io für weitere Informationen.',
      cancel: 'Abbrechen',
      select: 'Auswählen',
      selected: 'ausgewählt',
      please_select: 'Format wählen',
      original: 'Original',
      preview: 'Vorschau',
      logged_in_as: 'Du bist angemeldet als: ',
      logout: 'Ausloggen',
      duplicate_file: 'Duplikat: Die Datei existiert bereits.',
      success_upload_file: 'Die Datei wurde erfolgreich hochgeladen.',
      advanced: 'Erweiterte Einstellungen',
      proxy_connection_string: "Proxy Verbindung (http://127.0.0.1:8080)",
      proxy_protocol: "Proxy Protokoll",
      proxy_host: "Proxy Host",
      proxy_port: "Proxy Port",
      proxy_auth_username: "Username (optional)",
      proxy_auth_password: "Password (optional)",
    },
    en: {
      mediaspace: 'Mediaspace (example.px.media)',
      username: 'Username or email',
      password: 'Password',
      signin: 'Sign in',
      signin_description: 'Please sign in to your pixxio system to select files.',
      signin_error: 'Invalid username or password',
      application_key_error: 'The plugin is locked for your mediaspace. Contact your administrator or support@pixx.io for more information.',
      cancel: 'Cancel',
      select: 'Select',
      selected: 'selected',
      please_select: 'Choose a format',
      original: 'Original',
      preview: 'Preview',
      logged_in_as: 'You are logged in as: ',
      logout: 'Logout',
      duplicate_file: 'Duplicate file: The file already exists.',
      success_upload_file: 'File successfully uploaded.',
      advanced: 'Advanced settings',
      proxy_connection_string: "Proxy Connection (http://127.0.0.1:8080)",
      proxy_protocol: "Proxy Protocol",
      proxy_host: "Proxy Host",
      proxy_port: "Proxy Port",
      proxy_auth_username: "Username (optional)",
      proxy_auth_password: "Password (optional)",
    }
  }
  return lines[lang || 'en'][key];
}