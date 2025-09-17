<script>
  import Graph from './Graph.svelte';

</script>

<div id="header">
	How life works?
</div>
<div class=main>
  <Graph/>
</div>

<style>
  html, body {
    margin: 0;
    height: 100%;
  }

  	#header{
		text-align: center;
		padding: 10px;
		background-color: teal;
		fill-opacity: 0;
		color:white;
		font-weight:bold;
		font-size:2rem;
		font-family: 'system-ui';
		margin: 3px;
	}
	.main {
		display: flex;
		flex-direction: column;
		width: 100%;
		margin: 2px;
		justify-content: center;
		align-items: center;
	}

	@media (min-width: 1000px) {
		.main {
			flex-direction: row;
			align-items: start;
		}
	}
</style>