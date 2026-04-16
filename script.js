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

// helper: clean money strings like "$2,763,645.82"
function cleanMoney(str) {
  if (!str) return 0;
  return +str.replace(/[$,]/g, "");
}

// helper: detect category column (your file has it in 9th-ish column)
function getCategory(d) {
  return d.Category || d["Category "] || d["Category Breakdown"] || d[8];
}

d3.csv("categories.csv").then(data => {

  let rows = [];

  data.forEach(d => {

    const category = d.Category || d["Category Breakdown"] || d[8];
    const group = d.Group;

    // skip rows without category
    if (!category || category === "") return;

    const total = cleanMoney(d["TOTALS"] || d["TOTALS "] || d["Totals"]);

    rows.push({
      category: category.trim(),
      group: group === "0" ? "Local" : "Not Local",
      total: total
    });
  });

  // aggregate
  const rolled = d3.rollups(
    rows,
    v => d3.sum(v, d => d.total),
    d => d.category,
    d => d.group
  );

  const formatted = rolled.map(([category, values]) => {
    const obj = { category };
    values.forEach(([group, total]) => {
      obj[group] = total;
    });
    obj["Local"] = obj["Local"] || 0;
    obj["Not Local"] = obj["Not Local"] || 0;
    return obj;
  });

  const keys = ["Local", "Not Local"];

  const stack = d3.stack().keys(keys);
  const series = stack(formatted);

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

  // bars
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

  // x axis
  g.append("g")
    .attr("transform", `translate(0,${chartHeight})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  // y axis
  g.append("g")
    .call(d3.axisLeft(y));

  // legend
  const legend = svg.append("g")
    .attr("transform", `translate(${width - 170},40)`);

  keys.forEach((k, i) => {
    const row = legend.append("g")
      .attr("transform", `translate(0, ${i * 20})`);

    row.append("rect")
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", color(k));

    row.append("text")
      .attr("x", 20)
      .attr("y", 12)
      .text(k);
  });

});