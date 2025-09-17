<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  let svg;
  let data = [];
  let selectedEntity = 'Junk DNA';
  let entitySet = [];
  let filteredTexts = [];
  let hoveredRow = null;

  $: if (data.length > 0 && selectedEntity) {
    filteredTexts =
  selectedEntity === 'All'
    ? data.map(d => ({ text: d.Text, entity: d.entity, rowIndex: d.rowIndex }))
    : data
        .filter(d => d.entity === selectedEntity)
        .map(d => ({ text: d.Text, entity: d.entity, rowIndex: d.rowIndex }));

    }

  let linkElements;

onMount(async () => {
  const response = await fetch('/How_life_works.csv');
  const raw = await response.text();
  data = d3.csvParse(raw).map((d, i) => ({
    ...d,
    rowIndex: i // assign once, globally
  }));

  entitySet = Array.from(new Set(data.map(d => d.entity)));
  entitySet.unshift('All');

  renderGraph(data);
});

  function renderGraph(data) {
    const width = 400;   // your simulation space
    const height = 400;

  svg = d3.select('#graph').attr("viewBox", `0 0 ${width} ${height}`)
            .attr("preserveAspectRatio", "xMidYMid meet");;
  svg.selectAll('*').remove(); // Clear old graph if re-rendered

  // --- Build nodes ---
  const nodesMap = new Map();
  data.forEach(d => {
    if (d.Source) nodesMap.set(d.Source, { id: d.Source });
    if (d.Target) nodesMap.set(d.Target, { id: d.Target });
  });
  const nodes = Array.from(nodesMap.values());

// --- Group links for curves (direction preserved) ---
const linkGroups = {};
data.forEach(d => {
  // Keep direction in the key
  const key = `${d.Source}|${d.Target}`;

  if (!linkGroups[key]) linkGroups[key] = [];
  linkGroups[key].push(d);
});

Object.values(linkGroups).forEach(group => {
  const half = Math.floor(group.length / 2);
  group.forEach((d, i) => {
    d.curve = (i - half) * 20;
    if (group.length % 2 === 0 && i >= half) d.curve += 10;
  });
});

  // --- Filter & create links with node objects ---
  const links = data
    .filter(d => nodesMap.has(d.Source) && nodesMap.has(d.Target))
    .map((d,i) => ({
      source: nodesMap.get(d.Source),
      target: nodesMap.get(d.Target),
      entity: d.entity,
      curve: d.curve,
      rowIndex: d.rowIndex // keep track of which row this link came from
    }));
    
    const bigPalette = d3.schemeTableau10.concat(d3.schemeSet3);
    
    const color = d3.scaleOrdinal()
    .domain(entitySet)
    .range(bigPalette);

  // --- Simulation ---
  const simulation = d3.forceSimulation(nodes)
  // Keep linked nodes together but not too tight
  .force('link', d3.forceLink(links)
    .id(d => d.id) // always define the id accessor!
    .distance(200) // spacing between connected nodes
  )
  
  // Gentle repulsion to spread nodes
  .force('charge', d3.forceManyBody()
    .strength(-300) // negative = repel, lower absolute value = less repulsion
  )
  
  // Constant gentle pull toward center along both axes
  .force('x', d3.forceX(width / 2).strength(0.05))
  .force('y', d3.forceY(height / 2).strength(0.05))
  
  // Prevent overlap with a decent personal space bubble
  .force('collide', d3.forceCollide(50)); // radius in pixels
  simulation.alpha(1).restart();

  // --- Arrow marker ---
  svg.append('defs').append('marker')
    .attr('id', 'arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 20)
    .attr('refY', 0)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', '#999');

  // --- Links ---
  linkElements = svg.append('g')
    .selectAll('path')
    .data(links)
    .enter()
    .append('path')
    .attr('stroke', d => color(d.entity))
    .attr('fill', 'none')
    .attr('stroke-width', 2)
    .attr('marker-end', 'url(#arrow)')
    .attr('opacity', 1);

  linkElements
  .on('mouseover', function (event, d) {
    hoveredRow = d.rowIndex;
  })
  .on('mouseout', function () {
    hoveredRow = null;
  });

  linkElements.append('title').text(d => d.entity);

  // --- Nodes ---
  const node = svg.append('g')
    .selectAll('circle')
    .data(nodes)
    .enter()
    .append('circle')
    .attr('r', 10)
    .attr('fill', 'tomato')
    .call(d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended));

  // --- Labels ---
  svg.append('g')
    .selectAll('text')
    .data(nodes)
    .enter()
    .append('text')
    .text(d => d.id)
    .attr('font-size', 12)
    .attr('dx', 12)
    .attr('dy', '.35em');

  // --- Tick update ---
  simulation.on('tick', () => {
    linkElements.attr('d', d => {
      if (
        !isFinite(d.source.x) || !isFinite(d.source.y) ||
        !isFinite(d.target.x) || !isFinite(d.target.y)
      ) {
        return ''; // skip until coordinates are valid
      }

      const dx = d.target.x - d.source.x;
      const dy = d.target.y - d.source.y;
      const dr = Math.sqrt(dx * dx + dy * dy);

      const normX = dx / dr;
      const normY = dy / dr;
      const midX = (d.source.x + d.target.x) / 2;
      const midY = (d.source.y + d.target.y) / 2;

      let curveX = midX + (-normY * d.curve);
      let curveY = midY + (normX * d.curve);

      curveX = Math.max(0, Math.min(width, curveX));
      curveY = Math.max(0, Math.min(height, curveY));

      return `M${d.source.x},${d.source.y} Q${curveX},${curveY} ${d.target.x},${d.target.y}`;
    });

    svg.selectAll('circle')
      .attr('cx', d => d.x = Math.max(20, Math.min(width - 40, d.x)))
      .attr('cy', d => d.y = Math.max(20, Math.min(height - 40, d.y)));

    svg.selectAll('text')
      .attr('x', d => d.x = Math.max(20, Math.min(width - 50, d.x)))
      .attr('y', d => d.y = Math.max(20, Math.min(height - 50, d.y)));
  });

  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }
  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }
  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
}

  // 🔍 When user selects a filter, update edge opacity
  $: if (linkElements) {
    linkElements.attr('opacity', d =>
      selectedEntity === 'All' || d.entity === selectedEntity ? 1 : 0.05
    );
  }
</script>

<!-- Filter Dropdown -->
<div class=column>
<div class=row>
  <label>Filter by Entity:</label>
  <select bind:value={selectedEntity}>
    {#each entitySet as entity}
      <option value={entity}>{entity}</option>
    {/each}
  </select>
</div>
<!-- SVG Graph -->
<svg id="graph"></svg>
</div>

<!-- Matching Texts Display -->
<div class="column">
  <h3>Matching Texts ({filteredTexts.length})</h3>
  <ul>
    {#each filteredTexts as item}
      <li class:item-highlight={hoveredRow  === item.rowIndex}>
      {item.text}
    </li>
    {/each}
  </ul>
</div>

<style>
  body, html {
    margin: 0;
    padding: 0;
  }

  select {
    margin: 10px;
    font-size: 1rem;
  }

  .column {
		display: flex;
		flex-direction: column;
		width: 100%;
		margin: 2px;
		justify-content: center;
		align-items: center;
	}
  .row {
		display: flex;
		flex-direction: row;
		width: 100%;
		margin: 2px;
		justify-content: center;
		align-items: center;
	}

  svg {
    width: 100%;
    display: block;
  }
  .item-highlight {
  background-color: yellow;
  font-weight: bold;
}

</style>
