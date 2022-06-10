<script>
  import { createEventDispatcher } from "svelte"; 
  import { lang } from "./translation";
  import { mediaspacePreSet, mediaspace, appKey, refreshToken, modal, askForProxy } from './store/store';
  import { API } from "./api";
  import Loading from "./Loading.svelte";
  import axios from 'axios';
  import { get } from "svelte/store"; 
  
  const dispatch = createEventDispatcher();
  const api = new API();

  let username = '';
  let password = '';
  let hasError = false;
  let isLoading = false;
  let _mediaspace = $mediaspace;
  let applicationKeyIsLocked = false;
  let showAdvancedSettings = false;

  let proxyInput = {
    connectionString: '',
    auth: {
      username: '',
      password: ''
    }
  }

  /**
   * check if there is a refreshToken in storage
   */
  const localStoreRefreshToken = typeof localStorage !== 'undefined' ? localStorage.getItem('refreshToken') : null;
  const localStoreMediaSpace = typeof localStorage !== 'undefined' ? localStorage.getItem('mediaspace') : null;
  if (localStoreMediaSpace) {
    mediaspace.update(() => localStoreMediaSpace);
  }
  if((refreshToken || localStoreRefreshToken) && ($mediaspace || _mediaspace)) {
    isLoading = true;
    if (localStoreRefreshToken) {
      refreshToken.update(() => localStoreRefreshToken);
    }
    
    api.callAccessToken().then(() => {
      isLoading = false;
      dispatch('authenticated');
    }).catch((e) => {
      refreshToken.update(() => '');
      isLoading = false;
      applicationKeyIsLocked = e.errorcode === 15016
    })
  }

  const login = async () => {
    try {
      isLoading = true;
      hasError = false;
      _mediaspace = _mediaspace.replace(/(http|https):\/\//, '').trim();
      const formData = new FormData();
      formData.set('applicationKey', $appKey);
      formData.set('userNameOrEmail', username.trim());
      formData.set('password', password.trim());
      let tempProxy = null;

      if (proxyInput.connectionString) {
        const proxyParts = proxyInput.connectionString.split(':');
        tempProxy = {
          protocol: /^http/gi.test(proxyParts[0]) ? proxyParts[0] : 'http',
          host: /^http/gi.test(proxyParts[0]) ? proxyParts[1].replace('//', '') : proxyParts[0].replace('//', ''),
          port: (/^http/gi.test(proxyParts[0]) ? proxyParts[2] : proxyParts[1]) || '',
          auth: proxyInput.auth
        };
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('proxy', JSON.stringify(tempProxy));
        }
      }

      const response = await axios({
        url: `https://${_mediaspace}/gobackend/login`,
        method: 'POST',
        data: formData
      });

      isLoading = false;

      if (!response.data.success) {
        hasError = true;
        throw response.data;
      }

      // store refreshToken 
      refreshToken.update(() => response.data.refreshToken);
      mediaspace.update(() => _mediaspace);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('mediaspace', _mediaspace);
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
      
      api.callAccessToken().then(() => {
        dispatch('authenticated');
      });
    } catch(error) {
      isLoading = false;
      hasError = true;
      console.log(error)
      applicationKeyIsLocked = error.errorcode === 15016
    }
  }

  const handleKeydown = (event) => {
    if (event.key === 'Enter') {
      login();
    }
  }
</script>

<div class="login fields" class:no-modal="{!$modal}">
  <h2>{lang('signin')}</h2>
  <p>{lang('signin_description')}</p>
  {#if !$mediaspacePreSet}
  <div class="field">
    <input bind:value={_mediaspace} id="pixxio-mediaspace" disabled='{isLoading}' type="text" placeholder=" " on:keydown={handleKeydown} />
    <label for="pixxio-mediaspace">{lang('mediaspace')}</label>
  </div>
  {/if}
  <div class="field">
    <input bind:value={username} id="pixxio-username" disabled='{isLoading}' type="text" placeholder=" " on:keydown={handleKeydown} />
    <label for="pixxio-username">{lang('username')}</label>
  </div>
  <div class="field">
    <input bind:value={password} id="pixxio-password" disabled='{isLoading}' type="password" placeholder=" " on:keydown={handleKeydown} />
    <label for="pixxio-password">{lang('password')}</label>
  </div>
  {#if $askForProxy}
    <small><a href="#" on:click={() => showAdvancedSettings = !showAdvancedSettings} class="advanced">{lang('advanced')}</a></small>
    {#if showAdvancedSettings }
    <br>
    <br>
    <div class="field">
      <input bind:value={proxyInput.connectionString} id="pixxio-host" disabled='{isLoading}' type="text" placeholder=" " />
      <label for="pixxio-host">{lang('proxy_connection_string')}</label>
    </div>
    <div class="field">
      <input bind:value={proxyInput.auth.username} id="pixxio-auth-username" disabled='{isLoading}' type="text" placeholder=" " />
      <label for="pixxio-auth-username">{lang('proxy_auth_username')}</label>
    </div>
    <div class="field">
      <input bind:value={proxyInput.auth.password} id="pixxio-auth-password" disabled='{isLoading}' type="password" placeholder=" " />
      <label for="pixxio-auth-password">{lang('proxy_auth_password')}</label>
    </div>
    {/if}
  {/if}
  {#if hasError && !applicationKeyIsLocked}
  <small class="error">{lang('signin_error')}</small>
  {/if}
  {#if hasError && applicationKeyIsLocked}
  <small class="error">{lang('application_key_error')}</small>
  {/if}
  <div class="buttonGroup buttonGroup--fullSize">
    <button class="button" type="submit" disabled='{isLoading}' on:click={login}>{lang('signin')}</button>
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
    margin: 0 0 0.5em;
  }
  p {
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
      line-height: 1.3em;
      font-size: 12px;
    }

    &.no-modal {
      padding: 0;
      max-width: 300px;
    }

    a.advanced {
      color: $primary;
    }
  }
  
</style>