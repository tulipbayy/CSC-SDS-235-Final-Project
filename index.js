d3.csv("data.csv", function(d) {
  return {
    distributors: d["Distributors"], 
    total_spent: +d.Total_Spent.replace(/[$,]/g, ""), 
    plant_based: +d.Plant_Based.replace(/[$,]/g, ""),  
    local: +d.Local.replace(/[$,]/g, "")
  }
}).then(data => {

  console.log(data);  

  


















})













// fetch("data.csv")
//   .then(res => res.text())
//   .then(csv => {
//     const lines = csv.split("\n");

//     const data = lines.slice(0, 4).map(line => {
//       const cols = line.split(",");

//       return {
//         distributor: cols[0].replace(/"/g, "").trim(),
//         total: cleanNumber(cols[1]),
//         local: cleanNumber(cols[3]) 
//       };
//     });

//     console.log(data);

//     buildSankey(data);
//   }); 

//   console.log(data);

// const data = {
//   nodes: [
//     { name: "Total Budget Spent" },
//     { name: "Non-Local Distributor" },
//     { name: "Local Distributor" },
//     { name: "Plant Based" },
//     { name: " " }
//   ],
//   links: [
//     { source: 0, target: 1, value: d.Total },
//     { source: 0, target: 2, value: 62000 },

//     { source: 1, target: 3, value: 90000 },  
//     { source: 1, target: 4, value: 4400000 },

//     { source: 2, target: 3, value: 62000 }
//   ]
// };

// // SVG setup
// const width = 800;
// const height = 500;

// const svg = d3.select("#sankey")
//   .append("svg")
//   .attr("width", width)
//   .attr("height", height);

// // Sankey generator
// const sankey = d3.sankey()
//   .nodeWidth(20)
//   .nodePadding(10)
//   .extent([[1, 1], [width - 1, height - 6]]);

// const graph = sankey({
//   nodes: data.nodes.map(d => Object.assign({}, d)),
//   links: data.links.map(d => Object.assign({}, d))
// });

// // Draw links
// svg.append("g")
//   .selectAll("path")
//   .data(graph.links)
//   .join("path")
//   .attr("d", d3.sankeyLinkHorizontal())
//   .attr("stroke-width", d => d.width)
//   .attr("stroke", "#999")
//   .attr("fill", "none")
//   .attr("opacity", 0.5);

// // Draw nodes
// svg.append("g")
//   .selectAll("rect")
//   .data(graph.nodes)
//   .join("rect")
//   .attr("x", d => d.x0)
//   .attr("y", d => d.y0)
//   .attr("height", d => d.y1 - d.y0)
//   .attr("width", d => d.x1 - d.x0)
//   .attr("fill", "#69b3a2");

// // Labels
// svg.append("g")
//   .selectAll("text")
//   .data(graph.nodes)
//   .join("text")
//   .attr("x", d => d.x0 - 6)
//   .attr("y", d => (d.y1 + d.y0) / 2)
//   .attr("dy", "0.35em")
//   .attr("text-anchor", "end")
//   .text(d => d.name);