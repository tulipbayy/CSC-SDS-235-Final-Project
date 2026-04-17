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

function drawSankey() {
  const sankeyPath = "data_Totals.csv";

  fetch(sankeyPath)
    .then(res => {
      if (!res.ok) throw new Error(`${sankeyPath} returned ${res.status}`);
      return res.text();
    })
    .then(text => {
      const data = d3.csvParse(text);
      console.log("Sankey columns:", data.columns, "rows:", data.length);

      if (data.length === 0) throw new Error("Sankey CSV is empty");

      const labelKey = data.columns.find(c => /(distributor|supplier|source|group|name|node)/i.test(c)) || data.columns[0];
      const localKey = data.columns.find(c => /local/i.test(c) && !/non/i.test(c));
      const nonLocalKey = data.columns.find(c => /(non.*local|not.*local|nonlocal|not local|non local)/i.test(c));
      const totalKey = data.columns.find(c => /total|amount|value|spend|expense|budget|cost/i.test(c) && !/local/i.test(c));

      console.log("Sankey keys:", { labelKey, localKey, nonLocalKey, totalKey });

      const rows = data.filter(d => {
        const label = String(d[labelKey] || "").trim();
        return label && !/total/i.test(label.toLowerCase());
      });

      if (!rows.length) throw new Error("No valid rows found in Sankey CSV");

      const parsed = rows.map(d => ({
        label: String(d[labelKey] || "").trim(),
        local: localKey ? parseNumeric(d[localKey]) : NaN,
        nonLocal: nonLocalKey ? parseNumeric(d[nonLocalKey]) : NaN,
        total: totalKey ? parseNumeric(d[totalKey]) : NaN
      }));

      const totalLocal = d3.sum(parsed, d => Number.isFinite(d.local) ? d.local : 0);
      const totalNonLocal = d3.sum(parsed, d => Number.isFinite(d.nonLocal) ? d.nonLocal : 0);
      let totalBudget = d3.sum(parsed, d => Number.isFinite(d.total) ? d.total : 0);

      if (!Number.isFinite(totalBudget) || totalBudget === 0) {
        totalBudget = totalLocal + totalNonLocal;
      }

      if (![totalLocal, totalNonLocal].every(Number.isFinite)) {
        console.error("Parsed Sankey rows:", parsed);
        throw new Error("Could not parse numeric Sankey values from CSV");
      }

      renderSankey({
        nodes: [
          { name: "Budget" },
          { name: "Local Spend" },
          { name: "Non-Local Spend" }
        ],
        links: [
          { source: 0, target: 1, value: totalLocal },
          { source: 0, target: 2, value: totalNonLocal }
        ]
      });
    })
    .catch(err => {
      console.error("drawSankey error:", err);
      d3.select("#sankey").append("div").style("color", "#900").text(`Sankey error: ${err.message}`);
    });
}

function renderSankey(data) {
  const width = 800;
  const height = 500;

  const svg = d3.select("#sankey")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const sankeyGenerator = d3.sankey()
    .nodeWidth(20)
    .nodePadding(10)
    .extent([[1, 1], [width - 1, height - 6]]);

  const graph = sankeyGenerator({
    nodes: data.nodes.map(d => ({ ...d })),
    links: data.links.map(d => ({ ...d }))
  });

  svg.append("g")
    .selectAll("path")
    .data(graph.links)
    .join("path")
    .attr("d", d3.sankeyLinkHorizontal())
    .attr("stroke-width", d => d.width)
    .attr("stroke", "#999")
    .attr("fill", "none")
    .attr("opacity", 0.5);

  svg.append("g")
    .selectAll("rect")
    .data(graph.nodes)
    .join("rect")
    .attr("x", d => d.x0)
    .attr("y", d => d.y0)
    .attr("height", d => d.y1 - d.y0)
    .attr("width", d => d.x1 - d.x0)
    .attr("fill", "#69b3a2");

  svg.append("g")
    .selectAll("text")
    .data(graph.nodes)
    .join("text")
    .attr("x", d => d.x0 - 6)
    .attr("y", d => (d.y1 + d.y0) / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", "end")
    .text(d => d.name);
}

drawGeo();
drawSankey();