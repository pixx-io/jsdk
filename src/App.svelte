<script>
	import { createEventDispatcher, onMount } from 'svelte';
	import Logo from './Logo.svelte';
	import SearchField from './SearchField.svelte';
	import Login from './Login.svelte';
	import Files from './Files.svelte';
	import User from './User.svelte';
	import Upload from './Upload.svelte';
  import { WEBSOCKET } from './websocket'
	import { mediaspace, modal, refreshToken, isAuthenticated, mode, show, compact, websocket } from './store/store';

	/* Props */
	export let uploadConfig = {};

	const dispatch = createEventDispatcher();

	let searchQuery = '';

  onMount(() => { 
    websocket.update(() => new WEBSOCKET());
  });
	
	// authenticated
	const authenticated = () => {
		isAuthenticated.update(() => true);
	}

	const logout = () => {
		if (typeof localStorage !== 'undefined') {
			localStorage.removeItem('refreshToken');
			localStorage.removeItem('mediaspace');
		}
		isAuthenticated.update(() => false);
		mediaspace.update(() => '');
		refreshToken.update(() => '');
	}

	const cancel = () => {
		dispatch('cancel');
	}

	const submit = ({detail}) => {
		dispatch('submit', detail)
	}

	const uploaded = ({detail}) => {
		dispatch('uploaded', detail)
	}
	const uploadError = ({detail}) => {
		dispatch('uploadError', detail)
	}
</script>
{#if $show}
<main class:no-modal={!$modal} class:compact={$compact}>
	<div class="container" class:container--enlarge={$isAuthenticated}>
		<header>
			{#if !$compact}
			<Logo></Logo>
			{/if}
			{#if $isAuthenticated && $mode == 'get'}
				<SearchField bind:value={searchQuery}></SearchField>
			{/if}
			<a href="#" on:click={cancel} class="close"></a>
		</header>

		{#if !$isAuthenticated}
		<section class="pixxioSectionLogin">
			<Login 
				on:cancel={cancel} 
				on:authenticated={authenticated}
			></Login>
		</section>
		{:else if $mode == 'get'}
		<section class="pixxioSectionFiles">
			<Files 
				on:cancel={cancel} 
				on:submit={submit}
			></Files>
		</section>
		{:else if $mode == 'upload'}
		<section>
			<Upload bind:config={uploadConfig} on:uploaded={uploaded} on:error={uploadError}></Upload>
		</section>
		{/if}
		{#if $isAuthenticated && !$compact}
			<User on:logout={logout}></User>
		{/if}
	</div>
</main>
{/if}


<svelte:head>
  <!-- Google Font -->
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;700&family=Work+Sans:wght@400;500&display=swap" rel="stylesheet">

  <style lang="scss">
    /* Global CSS via SASS */
    #pixxio-integration {
			font-family: 'Heebo', Arial, Helvetica, sans-serif;
			font-size: 16px;
			all: initial;
		}
  </style>
</svelte:head>


<style lang="scss">
	@import './styles/variables';
	@import './styles/fields';
	@import './styles/button';

	a.close {
		display: block;
		position: relative;
		width: 30px;
		height: 30px;
		&:after,
		&:before {
			content: '';
			width: 80%;
			height: 2px;
			background: #212121;
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%) rotate(45deg);
		}
		&:after {
			transform: translate(-50%, -50%) rotate(-45deg);
		}
	}
	main {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		color: $color;
		background: rgba(0,0,0,0.5);
		padding: 0 20px;
		font-family: Heebo, sans-serif;

		header {
			display: flex;
      flex-direction: row;
			align-items: center;
			margin-top: 4px;
			margin-bottom: 20px;
			padding: 0 30px;
		}

		a {
			color: $primary;
			text-decoration: none;
			transition: color 500ms ease;
			&:hover {
				color: darken($primary, 10%);
			}
		}

		

		.container {
			border-radius: 10px;
			padding: 30px 0;
			max-width: 320px;
			width: 100%;
			background: white;
			transition: max-width 200ms ease;
			position: relative;
			overflow: hidden;
			&--enlarge {
				max-width: 860px;
			}
			h1, h2 {
				font-family: 'Work Sans', Arial, Helvetica, sans-serif;
				font-weight: 700;
				font-size: 42px;
				color: $color;
				text-align: center;
			}
			p {
				color: $grey;
				margin: 0 0 2em;
			}
		}

		&.no-modal {
			position: relative;
			top: auto;
			left: auto;
			right: auto;
			bottom: auto;
			background: transparent;
			padding: 10px;
			header {
				padding: 0;
			}

			a.close {
        position: relative;
				top: 0;
				right: 0;
			}

			.container {
				border-radius: 0;
				padding: 0;
				max-width: none;
				padding: 0;
				&--enlarge {
					max-width: none;
				}
			}
		}
		
	}
</style>