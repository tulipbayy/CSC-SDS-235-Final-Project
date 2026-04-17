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

d3.text("categories.csv").then(text => {
  const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
  const firstLine = lines[0].split(",");
  const secondLine = lines[1].split(",");

  const header = [
    firstLine[0] || "Category Breakdown",
    firstLine[1] || "Plant Based",
    "Supplier",
    secondLine[3] || "Group",
    secondLine[4] || "TOTALS",
    ...secondLine.slice(5)
  ];

  const csvText = [header.join(","), ...lines.slice(2)].join("\n");
  const data = d3.csvParse(csvText);

  const categories = data.columns.filter(c =>
    c &&
    c !== "Category Breakdown" &&
    c !== "Plant Based" &&
    c !== "Supplier" &&
    c !== "Group" &&
    c !== "TOTALS"
  );

  const result = {};
  categories.forEach(cat => {
    result[cat] = { category: cat, Local: 0, "Not Local": 0 };
  });

  data.forEach(d => {
    const groupText = String(d.Group || "").trim();
    if (!groupText || /total/i.test(groupText)) return;

    const groupType =
      groupText === "0" ? "Local" :
      groupText === "1" ? "Not Local" :
      /local/i.test(groupText) ? "Local" :
      /not|non/i.test(groupText) ? "Not Local" :
      null;

    if (!groupType) return;

    categories.forEach(cat => {
      const val = +d[cat];
      if (!isNaN(val)) result[cat][groupType] += val;
    });
  });

  const formatted = Object.values(result).filter(d => d.Local || d["Not Local"]);
  const keys = ["Local", "Not Local"];
  const stack = d3.stack().keys(keys);
  const series = stack(formatted);

  const x = d3.scaleBand()
    .domain(formatted.map(d => d.category))
    .range([0, chartWidth])
    .padding(0.2);

  const y = d3.scaleLinear()
    .domain([0, d3.max(formatted, d => d.Local + d["Not Local"]) || 0])
    .nice()
    .range([chartHeight, 0]);

  const color = d3.scaleOrdinal()
    .domain(keys)
    .range(["#ffb6c1", "#800020"]);

  const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

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
    .attr("width", x.bandwidth())
    .on("mouseover", function(event, d) {
      const key = d3.select(this.parentNode).datum().key;
      const value = d[1] - d[0];
      tooltip
        .style("opacity", 1)
        .html(`<strong>${d.data.category}</strong><br>${key}: $${value.toLocaleString()}`);
      d3.select(this).attr("stroke", "#000").attr("stroke-width", 1);
    })
    .on("mousemove", function(event) {
      tooltip
        .style("left", `${event.pageX + 12}px`)
        .style("top", `${event.pageY + 12}px`);
    })
    .on("mouseout", function() {
      tooltip.style("opacity", 0);
      d3.select(this).attr("stroke", "none");
    });

  g.append("g")
    .attr("transform", `translate(0,${chartHeight})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  g.append("g")
    .call(d3.axisLeft(y).ticks(6));

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