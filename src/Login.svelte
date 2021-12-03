<script>
  import { createEventDispatcher } from "svelte"; 
  import { lang } from "./translation";
  import { domain, appKey, refreshToken, modal } from './store/store';
  import { API } from "./api";
  import Loading from "./Loading.svelte";
  
  const dispatch = createEventDispatcher();
  const api = new API();

  let username = '';
  let password = '';
  let hasError = false;
  let isLoading = false;
  let mediaspace = '';

  /**
   * check if there is a refreshToken in storage
   */
  const token = sessionStorage.getItem('refreshToken');
  mediaspace = sessionStorage.getItem('domain');
  if (mediaspace) {
    domain.update(() => mediaspace);
  }
  if(token && ($domain || mediaspace)) {
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

  const login = async () => {
    isLoading = true;
    hasError = false;
    mediaspace = mediaspace.replace(/(http|https):\/\//, '').trim();
    try {
      const formData = new FormData();
      formData.set('applicationKey', $appKey);
      formData.set('userNameOrEmail', username.trim());
      formData.set('password', password.trim());

      const data = await fetch(`https://${mediaspace}/gobackend/login`, {
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
      domain.update(() => mediaspace);
      sessionStorage.setItem('domain', mediaspace);
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

<div class="login fields" class:no-modal="{!$modal}">
  <h2>{lang('signin')}</h2>
  <p>{lang('signin_description')}</p>
  {#if !$domain}
  <div class="field">
    <input bind:value={mediaspace} id="pixxio-mediaspace" disabled='{isLoading}' type="text" placeholder=" " />
    <label for="pixxio-mediaspace">{lang('mediaspace')}</label>
  </div>
  {/if}
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

    &.no-modal {
      padding: 0;
      max-width: 300px;
    }
  }
  
</style>