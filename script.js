function parseNumeric(value) {
  if (value == null) return NaN;
  const cleaned = String(value)
    .replace(/[\$,]/g, "")
    .trim();
  return cleaned === "" ? NaN : +cleaned;
}

function drawGeo() {
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
    if (lines.length < 3) throw new Error("categories.csv must have at least 3 rows");

    const firstLine = lines[0].split(",");
    const secondLine = lines[1].split(",");

    const header = [
      firstLine[0] || "Category Breakdown",
      firstLine[1] || "Plant Based",
      secondLine[2] || "Supplier",
      secondLine[3] || "Group",
      secondLine[4] || "TOTALS",
      ...secondLine.slice(5)
    ];

    const csvText = [header.join(","), ...lines.slice(2)].join("\n");
    const data = d3.csvParse(csvText);

    const categories = data.columns.filter(c =>
      c && !["Category Breakdown", "Plant Based", "Supplier", "Group", "TOTALS"].includes(c)
    );

    const result = {};
    categories.forEach(cat => {
      result[cat] = { category: cat, Local: 0, "Not Local": 0 };
    });

    data.forEach(d => {
      const group = String(d.Group || "").trim();
      if (!group || /total/i.test(group)) return;

      const groupType =
        group === "0" || /local/i.test(group) ? "Local" :
        group === "1" || /not|non/i.test(group) ? "Not Local" :
        null;

      if (!groupType) return;

      categories.forEach(cat => {
        const value = parseNumeric(d[cat]);
        if (!Number.isNaN(value)) result[cat][groupType] += value;
      });
    });

    const formatted = Object.values(result).filter(d => d.Local || d["Not Local"]);
    if (formatted.length === 0) throw new Error("No valid category values found in categories.csv");

    const keys = ["Local", "Not Local"];
    const series = d3.stack().keys(keys)(formatted);

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
      .range(["#ffb6c1", "#800020"]);

    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip");

    const groups = g.selectAll("g.layer")
      .data(series)
      .enter()
      .append("g")
      .attr("fill", d => color(d.key));

    groups.selectAll("rect")
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
        tooltip.style("opacity", 1)
          .html(`<strong>${d.data.category}</strong><br>${key}: $${value.toLocaleString()}`);
      })
      .on("mousemove", function(event) {
        tooltip.style("left", `${event.pageX + 12}px`)
          .style("top", `${event.pageY + 12}px`);
      })
      .on("mouseout", () => tooltip.style("opacity", 0));

    g.append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    g.append("g").call(d3.axisLeft(y));
  }).catch(err => {
    console.error("drawGeo error:", err);
    d3.select("#chart").append("div").style("color", "#900").text(err.message);
  });
}

drawGeo();
