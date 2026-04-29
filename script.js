function parseNumeric(value) {
  if (value == null) return NaN;
  const cleaned = String(value).replace(/[\$,\s\(\)\-]/g, "").trim();
  return cleaned === "" ? NaN : +cleaned;
}

const pieTooltip = d3.select("body")
  .append("div")
  .attr("class", "pie-tooltip")
  .style("opacity", 0);

function drawGeo() {
  const width = 1500;
  const height = 800;

  // ✅ FIXED MARGINS (prevents clipping)
  const margin = { top: 60, right: 30, bottom: 180, left: 80 };

  const svg = d3.select("#chart")
    .append("svg")
    // ✅ RESPONSIVE
    .attr("viewBox", `0 0 ${width} ${height}`)
    .style("width", "100%")
    .style("height", "auto");

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // TOOLTIP
  const tooltip = d3.select("body")
    .selectAll(".tooltip")
    .data([null])
    .join("div")
    .attr("class", "tooltip");

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
    if (formatted.length === 0) throw new Error("No valid category values found");

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

    // =========================
    // BARS
    // =========================
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

      .on("mouseover", function (event, d) {
        const key = d3.select(this.parentNode).datum().key;
        const value = d[1] - d[0];

        const totalSum = d3.sum(formatted, d => d.Local + d["Not Local"]);
        const percent = ((value / totalSum) * 100).toFixed(1);

        tooltip
          .style("opacity", 1)
          .html(`
            <strong>${d.data.category}</strong><br>
            ${key}: $${value.toLocaleString()}<br>
            ${percent}% of total
          `);
      })

      .on("mousemove", function (event) {
        tooltip
          .style("left", `${event.clientX + 12}px`)
          .style("top", `${event.clientY + 12}px`);
      })

      .on("mouseout", () => {
        tooltip.style("opacity", 0);
      });

    // =========================
    // AXES
    // =========================
    g.append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    g.append("g").call(d3.axisLeft(y));

    // =========================
    // TITLE + LABELS
    // =========================

    // Title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 40)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .text("Smith College Food Spending: Local vs Non-Local");

    // X-axis label
    g.append("text")
      .attr("x", chartWidth / 2)
      .attr("y", chartHeight + 100)
      .attr("text-anchor", "middle")
      .style("font-size", "13px")
      .style("font-weight", "600")
      .text("Food Categories");

    // Y-axis label
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -chartHeight / 2)
      .attr("y", -65)
      .attr("text-anchor", "middle")
      .style("font-size", "13px")
      .style("font-weight", "600")
      .text("Total Spending ($)");

    // =========================
    // LEGEND
    // =========================
    const legend = svg.append("g")
      .attr("transform", `translate(${width - 180}, ${margin.top})`);

    const legendItem = legend.selectAll(".legend-item")
      .data(keys)
      .enter()
      .append("g")
      .attr("transform", (d, i) => `translate(0, ${i * 25})`);

    legendItem.append("rect")
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", d => color(d));

    legendItem.append("text")
      .attr("x", 20)
      .attr("y", 12)
      .text(d => d)
      .style("font-size", "12px");

  }).catch(err => {
    console.error("drawGeo error:", err);
    d3.select("#chart")
      .append("div")
      .style("color", "#900")
      .text(err.message);
  });
}

// =========================
// PIE CHARTS (unchanged)
// =========================
function drawPieChart(container, data) {
  const width = 360;
  const height = 360;
  const radius = Math.min(width, height) / 2 - 20;

  const svg = d3.select(container)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

  const pieGen = d3.pie()
    .value(d => +d.value)
    .sort(null);

  const arcs = pieGen(data);
  const total = d3.sum(data, d => +d.value);

  const color = d3.scaleOrdinal()
    .domain(data.map(d => d.label))
    .range(d3.schemeTableau10);

  const arc = d3.arc()
    .innerRadius(0)
    .outerRadius(radius);

  svg.selectAll("path")
    .data(arcs)
    .enter()
    .append("path")
    .attr("d", arc)
    .attr("fill", d => color(d.data.label))
    .attr("stroke", "#fff")
    .attr("stroke-width", 2)

    .on("mouseover", function (event, d) {
      const value = +d.data.value;
      const percent = total ? ((value / total) * 100).toFixed(1) : 0;

      d3.select(this)
        .transition()
        .duration(150)
        .attr("transform", "scale(1.05)");

      pieTooltip
        .style("opacity", 1)
        .style("left", `${event.clientX + 12}px`)
        .style("top", `${event.clientY + 12}px`)
        .html(`
          <div style="font-weight:700;">${d.data.label}</div>
          <div>$${value.toLocaleString()}</div>
          <div>${percent}% of total</div>
        `);
    })

    .on("mousemove", function (event) {
      pieTooltip
        .style("left", `${event.clientX + 12}px`)
        .style("top", `${event.clientY + 12}px`);
    })

    .on("mouseout", function () {
      d3.select(this)
        .transition()
        .duration(150)
        .attr("transform", "scale(1)");
      pieTooltip.style("opacity", 0);
    });

  svg.selectAll("text")
    .data(arcs)
    .enter()
    .append("text")
    .attr("transform", d => `translate(${arc.centroid(d)})`)
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .style("font-weight", "800")
    .style("fill", "white")
    .text(d => d.data.value > 0 ? d.data.label : "");
}

function drawPieCharts() {
  d3.csv("./data_Totals.csv").then(rows => {
    const get = (row, key) => {
      const val = row[key];
      if (!val) return 0;
      const num = parseFloat(String(val).replace(/[^0-9.-]/g, ""));
      return isNaN(num) ? 0 : num;
    };

    const totals = rows.reduce((acc, row) => {
      acc.total += get(row, "Total Spent");
      acc.real += get(row, "REAL");
      acc.sustainable += get(row, "Sustainable");
      acc.local += get(row, "Local");
      acc.fair += get(row, "Fair");
      acc.humane += get(row, "Humane");
      return acc;
    }, {
      total: 0,
      real: 0,
      sustainable: 0,
      local: 0,
      fair: 0,
      humane: 0
    });

    drawPieChart("#pie-real", [
      { label: "REAL", value: totals.real },
      { label: "Not REAL", value: Math.max(totals.total - totals.real, 0) }
    ]);

    drawPieChart("#pie-real-breakdown", [
      { label: "Sustainable", value: totals.sustainable },
      { label: "Local", value: totals.local },
      { label: "Fair", value: totals.fair },
      { label: "Humane", value: totals.humane }
    ]);
  });
}

drawGeo();
drawPieCharts();