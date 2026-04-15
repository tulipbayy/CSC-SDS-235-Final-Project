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