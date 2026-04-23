d3.csv("data.csv", d => ({
  distributor: d["Distributors"],
  total: +d.Total_Spent.replace(/[$,]/g, ""),
  plant: +d.Plant_Based.replace(/[$,]/g, ""),
  isLocal: d["isLocal"]
})).then(data => {

  const nodeMap = new Map();
  const nodes = [];
  const links = [];

  function getNode(name) {
    if (!nodeMap.has(name)) {
      nodeMap.set(name, nodes.length);
      nodes.push({ name });
    }
    return nodeMap.get(name);
  }

  data.forEach(d => {
    const local = d.isLocal === "Yes" ? "Local" : "Non-local";
    const plantCat = "Plant-Based";
    const nonPlantCat = "Non-Plant-Based";
    const distributor = d.distributor;

    const nonPlant = d.total - d.plant;

    // Total → Local
    links.push({
      source: getNode("Total Budget"),
      target: getNode(local),
      value: d.total, 
      distributor: distributor
    });

    // Local → Plant / Non-Plant
    if (d.plant > 0) {
      links.push({
        source: getNode(local),
        target: getNode(plantCat),
        value: d.plant, 
        distributor: distributor
      });
    }

    if (nonPlant > 0) {
      links.push({
        source: getNode(local),
        target: getNode(nonPlantCat),
        value: nonPlant,
        distributor: distributor
      });
    }

    // Plant → Distributor
    if (d.plant > 0) {
      links.push({
        source: getNode(plantCat),
        target: getNode(distributor),
        value: d.plant,
        distributor: distributor
      });
    }

    // Non-Plant → Distributor
    if (nonPlant > 0) {
      links.push({
        source: getNode(nonPlantCat),
        target: getNode(distributor),
        value: nonPlant, 
        distributor: distributor
      });
    }
  });

  const graph = { nodes, links };

  console.log("GRAPH:", graph); 

  const width = 1000;
  const height = 800;

  const svg = d3.select("#sankey")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const margin = { top: 20, right: 40, bottom: 20, left: 40 };

  const sankey = d3.sankey()
    .nodeWidth(20)
    .nodePadding(15)
    .nodeAlign(d3.sankeyJustify)
    .extent([    [margin.left, margin.top],
    [width - margin.right, height - margin.bottom]]);

  const { nodes: sankeyNodes, links: sankeyLinks } = sankey(graph);

  // LINKS
  svg.append("g")
    .selectAll("path")
    .data(sankeyLinks)
    .join("path")
    .attr("d", d3.sankeyLinkHorizontal())
    .attr("fill", "none")
    .attr("stroke", "grey")
    .attr("stroke-width", d => d.width);

  // NODES
  svg.append("g")
    .selectAll("rect")
    .data(sankeyNodes)
    .join("rect")
    .attr("x", d => d.x0)
    .attr("y", d => d.y0)
    .attr("height", d => d.y1 - d.y0)
    .attr("width", d => d.x1 - d.x0)
    .attr("fill", d => {
        if (d.name === "Plant-Based") return "#2ecc71";        // green
        if (d.name === "Non-Plant-Based") return "#e67e22";    // orange
        if (d.name === "Local") return "#3498db";              // blue
        if (d.name === "Non-local") return "#e74c3c";          // red
        if (d.name === "Total Budget") return "#207906";          // dark green
        return "#db69df"; // distributors (purplish)
      });

  //labels 
  svg.append("g")
  .selectAll("text")
  .data(sankeyNodes)
  .join("text")
  .attr("x", d => (d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)) // left/right side
  .attr("y", d => (d.y1 + d.y0) / 2) // vertical center of node
  .attr("dy", "0.35em")
  .attr("text-anchor", d => (d.x0 < width / 2 ? "start" : "end"))
  .text(d => d.name)
  .style("font-size", "13px")
  .style("fill", "black")
  .style("font-weight", "bold");

  //tooltip for hover to give more information about the flows
  const tooltip = d3.select("#tooltip");
  svg.append("g")
  .selectAll("path")
  .data(sankeyLinks)
  .join("path")
  .attr("d", d3.sankeyLinkHorizontal())
  .attr("fill", "none")
  .attr("stroke", "#ffffff")
  .attr("stroke-width", d => d.width)
  .style("font-family", "serif")

  .on("mouseover", (event, d) => {
    tooltip
      .style("opacity", 1)
      .html(`
        <strong>${d.distributor}</strong><br> 
        <strong>${d.source.name} → ${d.target.name}</strong><br>
        $${d.value.toLocaleString()}
      `);
  })

  .on("mousemove", (event) => {
    tooltip
      .style("left", (event.pageX + 10) + "px")
      .style("top", (event.pageY + 10) + "px");
  })

  .on("mouseout", () => {
    tooltip.style("opacity", 0);
  });
});