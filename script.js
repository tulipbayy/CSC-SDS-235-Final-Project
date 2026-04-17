const width = 950;
const height = 550;
const margin = { top: 40, right: 30, bottom: 140, left: 80 };

const svg = d3.select("#chart")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const g = svg.append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

const chartWidth = width - margin.left - margin.right;
const chartHeight = height - margin.top - margin.bottom;

d3.csv("Categories.csv").then(data => {

  console.log("DATA LOADED:", data);

  // -----------------------------
  // CLEAN COLUMN LIST
  // -----------------------------
  const categories = data.columns.filter(c =>
    c &&
    c !== "Group" &&
    c !== "TOTALS"
  );

  // -----------------------------
  // INIT STORAGE
  // -----------------------------
  let result = {};

  categories.forEach(cat => {
    result[cat] = {
      category: cat,
      Local: 0,
      "Not Local": 0
    };
  });

  // -----------------------------
  // BUILD AGGREGATES
  // -----------------------------
  data.forEach(d => {

    // skip junk / totals row
    if (!d.Group || d.Group.toLowerCase().includes("total")) return;

    const groupType = +d.Group === 0 ? "Local" : "Not Local";

    categories.forEach(cat => {

      const val = +d[cat];

      if (isNaN(val)) return;

      result[cat][groupType] += val;
    });
  });

  const formatted = Object.values(result);

  console.log("FORMATTED:", formatted);

  // -----------------------------
  // STACK SETUP
  // -----------------------------
  const keys = ["Local", "Not Local"];

  const stack = d3.stack().keys(keys);
  const series = stack(formatted);

  // -----------------------------
  // SCALES
  // -----------------------------
  const x = d3.scaleBand()
    .domain(formatted.map(d => d.category))
    .range([0, chartWidth])
    .padding(0.2);

  const y = d3.scaleLinear()
    .domain([0, d3.max(formatted, d => d.Local + d["Not Local"])])
    .nice()
    .range([chartHeight, 0]);

  const color = d3.scaleOrdinal()
    .domain(keys)
    .range(["darkgreen", "lightgray"]);

  // -----------------------------
  // DRAW BARS
  // -----------------------------
  g.selectAll("g.layer")
    .data(series)
    .enter()
    .append("g")
    .attr("fill", d => color(d.key))
    .selectAll("rect")
    .data(d => d)
    .enter()
    .append("rect")
    .attr("x", d => x(d.data.category))
    .attr("y", d => y(d[1]))
    .attr("height", d => y(d[0]) - y(d[1]))
    .attr("width", x.bandwidth());

  // -----------------------------
  // X AXIS
  // -----------------------------
  g.append("g")
    .attr("transform", `translate(0,${chartHeight})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  // -----------------------------
  // Y AXIS
  // -----------------------------
  g.append("g")
    .call(d3.axisLeft(y));

  // -----------------------------
  // LEGEND
  // -----------------------------
  const legend = svg.append("g")
    .attr("transform", `translate(${width - 160}, 40)`);

  keys.forEach((k, i) => {
    const row = legend.append("g")
      .attr("transform", `translate(0, ${i * 20})`);

    row.append("rect")
      .attr("width", 12)
      .attr("height", 12)
      .attr("fill", color(k));

    row.append("text")
      .attr("x", 18)
      .attr("y", 10)
      .text(k);
  });

}).catch(err => {
  console.error("CSV LOAD ERROR:", err);
});
