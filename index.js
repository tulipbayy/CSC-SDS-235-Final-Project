// d3.csv("data.csv", function(d) {
//   return {
//     distributors: d["Distributors"], 
//     total_spent: +d.Total_Spent.replace(/[$,]/g, ""), 
//     plant_based: +d.Plant_Based.replace(/[$,]/g, ""),  
//     isLocal: d["isLocal"]
//   }
// }).then(data => {

//   console.log(data);  

//   const totals = data.map(d => d.Total_Spent)

//   //const plantCategory = d.plant_based > 0 ? "Plant-Based" : "Non-Plant-Based";

// //let nodes = [];
  
//   graph = {"nodes" : [], "links" : []}; 

//   data.forEach(links =>{
//     const localNode = d.isLocal === "Yes" ? "Local" : "Non-local";
//     const plant = d.plant_based; 
//     const nonPlant = d.total_spent - d.plant_based; 

//     if (plant > 0) {

//     }
    
//     graph.nodes.push({"name": links.source});
//     graph.nodes.push({"name": links.target});
  
//   })
  

  

// //let links = []; 

//   //First flow: Total → Local/non
//  data.forEach(d => {
//     links.push({
//       source: "Total Budget Spent",
//       target: d.isLocal === "Yes" ? "Local" : "Non-local",
//       value: totals
//     }
//   )

//   //second flow: local → plant-based 
//   data.forEach(d => {
//     links.push({
//       source: "isLocal",
//       target: plantCategory, 
//       value: d.plant_based
//     })
    
//   });

//   //last one: plant-based →  each distributor 
//   data.forEach(d => {
//     links.push({
//       source: plantCategory,
//       target: d.Distributors,
//       value: d.total_spent

//     })
//   });
    
//   });

  

// const width = 900; 
// const height = 600; 

// const svg = d3.select("#sankey") 
//   .attr("width", width)
//   .attr("height", height); 


// const sankey = d3.sankey()
//   .nodeWidth(20)
//   .nodePadding(10)
//   .extent([[1, 1], [width - 1, height - 6]]);
  
// //links
// svg.append("g")
//   .selectAll("path")
//   .data(graph.links)
//   .join("path")
//   .attr("d", d3.sankeyLinkHorizontal)
//   .attr("fill", "none")
//   .attr("stroke-width", d => d.width);

  

// //nodes
// svg.append("g")
//   .selectAll("rect")
//   .data(graph.nodes)
//   .attr("x", d => d.x0)
//   .attr("y", d => d.y0)
//   .attr("height", d => d.y1 - dy0)
//   .attr("width", d => d.x1 - dx0)
//   .attr("fill", "#2596be")

// }) 

// d3.csv("data.csv", d => ({
//   distributor: d["Distributors"],
//   total: +d.Total_Spent.replace(/[$,]/g, ""),
//   plant: +d.Plant_Based.replace(/[$,]/g, ""),
//   isLocal: d["isLocal"]
// })).then(data => {

  

//   const nodeMap = new Map();
//   const nodes = [];
//   const links = [];

//   function getNode(name) {
//     if (!nodeMap.has(name)) {
//       nodeMap.set(name, nodes.length);
//       nodes.push({ name });
//     }
//     return nodeMap.get(name);
//   }

//   // --- Build flows ---
//   data.forEach(d => {
//     const totalNode = "Total Budget";
//     const localNode = d.isLocal === "Yes" ? "Local" : "Non-local";

//     const plantNode = "Plant-Based";
//     const nonPlantNode = "Non-Plant-Based";

//     const distributorNode = d.distributor;

//     const nonPlantValue = d.total - d.plant;

//     // 1️⃣ Total → Local/Non-local
//     links.push({
//       source: getNode(totalNode),
//       target: getNode(localNode),
//       value: d.total
//     });

//     // 2️⃣ Local → Plant / Non-Plant
//     if (d.plant > 0) {
//       links.push({
//         source: getNode(localNode),
//         target: getNode(plantNode),
//         value: d.plant
//       });
//     }

//     if (nonPlantValue > 0) {
//       links.push({
//         source: getNode(localNode),
//         target: getNode(nonPlantNode),
//         value: nonPlantValue
//       });
//     }

//     // 3️⃣ Plant / Non-Plant → Distributor
//     if (d.plant > 0) {
//       links.push({
//         source: getNode(plantNode),
//         target: getNode(distributorNode),
//         value: d.plant
//       });
//     }

//     if (nonPlantValue > 0) {
//       links.push({
//         source: getNode(nonPlantNode),
//         target: getNode(distributorNode),
//         value: nonPlantValue
//       });
//     }
//   });

//   const graph = { nodes, links };

//   // --- DRAW SANKEY ---
//   const width = 900;
//   const height = 600;

//   const sankey = d3.sankey()
//     .nodeWidth(20)
//     .nodePadding(10)
//     .extent([[1, 1], [width - 1, height - 6]]);

//   const svg = d3.select("#sankey")
//     .attr("width", width)
//     .attr("height", height);


//   const { nodes: sankeyNodes, links: sankeyLinks } = sankey(graph);

//   // links
//   svg.append("g")
//     .selectAll("path")
//     .data(sankeyLinks)
//     .join("path")
//     .attr("d", d3.sankeyLinkHorizontal())
//     .attr("fill", "none")
//     .attr("stroke", "#999")
//     .attr("stroke-width", d => d.width);

//   // nodes
//   svg.append("g")
//     .selectAll("rect")
//     .data(sankeyNodes)
//     .join("rect")
//     .attr("x", d => d.x0)
//     .attr("y", d => d.y0)
//     .attr("height", d => d.y1 - d.y0)
//     .attr("width", d => d.x1 - d.x0)
//     .attr("fill", "#2596be");

//     console.log(data); 
//     console.log(graph); 
// });




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
      value: d.total
    });

    // Local → Plant / Non-Plant
    if (d.plant > 0) {
      links.push({
        source: getNode(local),
        target: getNode(plantCat),
        value: d.plant
      });
    }

    if (nonPlant > 0) {
      links.push({
        source: getNode(local),
        target: getNode(nonPlantCat),
        value: nonPlant
      });
    }

    // Plant → Distributor
    if (d.plant > 0) {
      links.push({
        source: getNode(plantCat),
        target: getNode(distributor),
        value: d.plant
      });
    }

    // Non-Plant → Distributor
    if (nonPlant > 0) {
      links.push({
        source: getNode(nonPlantCat),
        target: getNode(distributor),
        value: nonPlant
      });
    }
  });

  const graph = { nodes, links };

  console.log("GRAPH:", graph); // 👈 check this

  const width = 900;
  const height = 600;

  const svg = d3.select("#sankey")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const sankey = d3.sankey()
    .nodeWidth(20)
    .nodePadding(10)
    .extent([[1, 1], [width - 1, height - 6]]);

  const { nodes: sankeyNodes, links: sankeyLinks } = sankey(graph);

  // LINKS
  svg.append("g")
    .selectAll("path")
    .data(sankeyLinks)
    .join("path")
    .attr("d", d3.sankeyLinkHorizontal())
    .attr("fill", "none")
    .attr("stroke", "black")
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
    .attr("fill", "#2596be");

  //labels 
  
});







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