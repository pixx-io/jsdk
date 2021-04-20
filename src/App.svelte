<script>
	import Logo from './Logo.svelte';
	import Loading from './Loading.svelte';
	import SearchField from './SearchField.svelte';
	import Login from './Login.svelte';
	import Files from './Files.svelte';
	import { lang } from './translation';
	import { createEventDispatcher, onMount } from 'svelte';
	import { domain, appKey } from './store';

	/* Props */
	export let standalone = false;
	export let config = {
		appUrl: '',
		appKey: ''
	};
	export let show = false;
	export let max = 0;

	const dispatch = createEventDispatcher();

	onMount(async () => {
		domain.update(() => config.appUrl);
		appKey.update(() => config.appKey);
	})

	let loading = false;
	let isAuthenticated = false;
	let searchQuery = '';

	$: enlarge = isAuthenticated;
	
	// authenticated
	const authenticated = () => {
		isAuthenticated = true;
	}

	const cancel = () => {
		dispatch('cancel');
	}

	const submit = ({detail}) => {
		dispatch('submit', detail)
	}
</script>
{#if show}
<main>
	<div class="container" class:container--enlarge="{enlarge}">
		<header>
			{#if standalone}
			<Logo></Logo>
			{/if}
			{#if isAuthenticated}
			<SearchField bind:value={searchQuery}></SearchField>
			{/if}
		</header>

		{#if !isAuthenticated}
		<section>
			<Login on:cancel={cancel} on:authenticated={authenticated}></Login>
		</section>
		{:else}
		<section>
			<Files on:cancel={cancel} on:submit={submit} bind:max={max}></Files>
		</section>
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
			align-items: center;
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

		
	}
</style>