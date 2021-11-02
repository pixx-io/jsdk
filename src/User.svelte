<script>
import { API } from "./api";

import { lang } from "./translation";
import { domain } from "./store";
import { createEventDispatcher } from "svelte";

const api = new API();

let username = '';

const fetchUser = async () => {
  api.get('/users/current').then((user) => {
    username = user.user.displayName;
  })
}
fetchUser();

const dispatch = createEventDispatcher();
const logout = () => {
  dispatch('logout');
}

</script>

<small>{lang('logged_in_as')} {username} in <a href="https://{$domain}" target="_blank">{$domain}</a>. <a href="#" on:click={logout}>Ausloggen</a></small>

<style lang="scss">
  @import './styles/variables';
  small {
    opacity: 0.75;
    display: block;
    a {
      color: $primary;
      text-decoration: none;
    }
  }
</style>