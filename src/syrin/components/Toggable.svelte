<script lang="ts">
	// Params & State
	export let on: string[];
	export let off: string[];
	export let disabled = false;
	export let toggled: boolean = false;

	let title = "";
	let icon = "";

	// Reactive Blocks
	const reactiveTitle = (toggled, on, off) => {
		title = toggled ? on[0] : off[0];
	};
	const reactiveIcon = (toggled, on, off) => {
		icon = toggled ? on[1] : off[1];
	};

	$: reactiveTitle(toggled, on, off);	
	$: reactiveIcon(toggled, on, off);	
</script>

{#if !disabled}
	<span role="button" class="syrin-control" on:click {title}>
		<i class="fas fa-{icon}" />
	</span>
{/if}

<style>
	.syrin-control {
		display: inline;
		margin: 2px;
		vertical-align: middle;
	}

	.syrin-control i {
		display: inline;
		vertical-align: middle;
	}
</style>
