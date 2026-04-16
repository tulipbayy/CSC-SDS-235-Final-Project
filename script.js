async function drawMap() {

    const width = 800;
    const height = 500;

    // Create SVG
    const svg = d3.select("#map")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Projection
    const projection = d3.geoAlbersUsa()
        .translate([width / 2, height / 2])
        .scale(1000);

    const path = d3.geoPath().projection(projection);

    // Load US data
    const us = await d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json");

    // Convert TopoJSON → GeoJSON
    const states = topojson.feature(us, us.objects.states);

    // Draw states
    svg.selectAll("path")
        .data(states.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", "lightgray")
        .attr("stroke", "white")
        .on("mouseover", function (event, d) {
            d3.select(this).attr("fill", "orange");
        })
        .on("mouseout", function (event, d) {
            d3.select(this).attr("fill", "lightgray");
        });
}

drawMap();




///Sankey Vis

const data = {
  nodes: [
    { name: "Total Budget" },
    { name: "Non-Local Distributor" },
    { name: "Local Distributor" },
    { name: "Local Food" },
    { name: "Non-Local Food" }
  ],
  links: [
    { source: 0, target: 1, value: 4500000 },
    { source: 0, target: 2, value: 62000 },

    { source: 1, target: 3, value: 90000 },   
    { source: 1, target: 4, value: 4400000 },

    { source: 2, target: 3, value: 62000 }
  ]
};

// SVG setup
const width = 800;
const height = 500;

const svg = d3.select("#sankey")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

// Sankey generator
const sankey = d3.sankey()
  .nodeWidth(20)
  .nodePadding(10)
  .extent([[1, 1], [width - 1, height - 6]]);

const graph = sankey({
  nodes: data.nodes.map(d => Object.assign({}, d)),
  links: data.links.map(d => Object.assign({}, d))
});

// Draw links
svg.append("g")
  .selectAll("path")
  .data(graph.links)
  .join("path")
  .attr("d", d3.sankeyLinkHorizontal())
  .attr("stroke-width", d => d.width)
  .attr("stroke", "#999")
  .attr("fill", "none")
  .attr("opacity", 0.5);

// Draw nodes
svg.append("g")
  .selectAll("rect")
  .data(graph.nodes)
  .join("rect")
  .attr("x", d => d.x0)
  .attr("y", d => d.y0)
  .attr("height", d => d.y1 - d.y0)
  .attr("width", d => d.x1 - d.x0)
  .attr("fill", "#69b3a2");

// Labels
svg.append("g")
  .selectAll("text")
  .data(graph.nodes)
  .join("text")
  .attr("x", d => d.x0 - 6)
  .attr("y", d => (d.y1 + d.y0) / 2)
  .attr("dy", "0.35em")
  .attr("text-anchor", "end")
  .text(d => d.name);


  // Add tooltip div
const tooltip = d3.select("body")
  .append("div")
  .style("position", "absolute")
  .style("background", "white")
  .style("padding", "5px")
  .style("border", "1px solid #ccc")
  .style("display", "none");

// Update links
svg.append("g")
  .selectAll("path")
  .data(graph.links)
  .join("path")
  .attr("d", d3.sankeyLinkHorizontal())
  .attr("stroke-width", d => d.width)
  .attr("stroke", d => {
    if (d.target.name === "Local Food") return "green";
    if (d.target.name === "Non-Local Food") return "red";
    return "#999";
  })
  .attr("fill", "none")
  .attr("opacity", 0.5)
  .on("mouseover", (event, d) => {
    tooltip.style("display", "block")
      .html(`$${d.value.toLocaleString()}`);
  })
  .on("mousemove", (event) => {
    tooltip.style("left", event.pageX + 10 + "px")
      .style("top", event.pageY + 10 + "px");
  })
  .on("mouseout", () => {
    tooltip.style("display", "none");
  });