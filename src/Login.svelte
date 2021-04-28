<script>
  import { createEventDispatcher } from "svelte"; 
  import { lang } from "./translation";
  import { domain, appKey, refreshToken, v1 } from './store';
import { API } from "./api";
import Loading from "./Loading.svelte";
  
  const dispatch = createEventDispatcher();
  const api = new API();

  let username = '';
  let password = '';
  $: domainVal = $domain;
  $: appKeyVal = $appKey;
  $: version1 = $v1;
  let hasError = false;
  let isLoading = false;

  /**
   * check if there is a refreshToken in storage
   */
  const token = sessionStorage.getItem('refreshToken');
  if(token) {
    isLoading = true;
    refreshToken.update(() => token);
    api.callAccessToken().then(() => {
      isLoading = false;
      dispatch('authenticated');
    }).catch((e) => {
      refreshToken.update(() => '');
      isLoading = false;
    })
  }

  let handleLogin = null;
  const login = async () => {
    isLoading = true;
    hasError = false;
    try {
      const formData = new FormData();
      formData.set('applicationKey', appKeyVal);
      formData.set('userName', username);
      formData.set('password', password);

      const data = await fetch(`${domainVal}/gobackend/login`, {
        method: 'POST',
        body: formData
      });

      const response = await data.json();

      isLoading = false;

      if (!response.success) {
        hasError = true;
        throw new Error();
      }

      // store refreshToken 
      refreshToken.update(() => response.refreshToken);
      sessionStorage.setItem('refreshToken', response.refreshToken);
      
      api.callAccessToken().then(() => {
        dispatch('authenticated');
      });
    } catch(error) {
      isLoading = false;
      hasError = true;
    }
  }

  const loginV1 = async () => {
    isLoading = true;
    hasError = false;
    try {
      const formData = new FormData();
      formData.set('apiKey', appKeyVal);
      formData.set('options', JSON.stringify({ username, password }));
      const requestData = {
        apiKey: appKeyVal,
        options: { username, password }
      };

      let params = new URLSearchParams();
      for (const key of Object.keys(requestData)) {
        let value = requestData[key];
        if (typeof value === 'object') {
          value = JSON.stringify(value);
        }
        params.set(key, value);
      }
      params = params.toString();

      const data = await fetch(`${domainVal}/cgi-bin/api/pixxio-api.pl/json/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params
      });

      const response = await data.json();

      isLoading = false;

      if (response.success !== 'true') {
        hasError = true;
        throw new Error();
      }

      // store refreshToken 
      refreshToken.update(() => response.refreshToken);
      sessionStorage.setItem('refreshToken', response.refreshToken);
      
      api.callAccessToken().then(() => {
        dispatch('authenticated');
      });
    } catch(error) {
      isLoading = false;
      hasError = true;
    }
  }
  const cancel = () => {
    dispatch('cancel');
  }
</script>

<div class="login fields">
  <h2>{lang('signin')}</h2>
  <p>{lang('signin_description')}</p>
  <div class="field">
    <input bind:value={username} id="pixxio-username" disabled='{isLoading}' type="text" placeholder=" " />
    <label for="pixxio-username">{lang('username')}</label>
  </div>
  <div class="field">
    <input bind:value={password} id="pixxio-password" disabled='{isLoading}' type="password" placeholder=" " />
    <label for="pixxio-password">{lang('password')}</label>
  </div>
  {#if hasError}
  <small class="error">{lang('signin_error')}</small>
  {/if}
  <div class="buttonGroup">
    <button class="button button--secondary" on:click={cancel}>{lang('cancel')}</button>
    <button class="button" type="submit" disabled='{isLoading}' on:click={version1 ? loginV1 : login}>{lang('signin')}</button>
  </div>
  {#if isLoading}
    <Loading></Loading>
  {/if}
</div>



<style lang="scss">
	@import './styles/variables';
  @import './styles/fields';
  @import './styles/button';

  h2 {
    margin: 0 0 1em;
  }
  .fields {
    max-width: 300px;
    margin: 0 auto;
    padding: 0 30px;
    .field {
      margin: 0 0 1em;
    }

    .error {
      color: red;
      font-size: 12px;
    }
  }
  
</style>