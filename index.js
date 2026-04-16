fetch("data_Totals.csv")
  .then(res => res.text())
  .then(csv => {
    const lines = csv.split("\n");

    const data = lines.slice(0, 4).map(line => {
      const cols = line.split(",");

      return {
        distributor: cols[0].replace(/"/g, "").trim(),
        total: cleanNumber(cols[1]),
        local: cleanNumber(cols[3]) // THIS is key column
      };
    });

    console.log(data);

    buildSankey(data);
  });

function cleanNumber(str) {
  return Number(str?.replace(/[$,"]/g, "")) || 0;
}

function buildSankey(data) {

  const labels = [
    "Total Budget",
    "Non-Local Distributor",
    "Local Distributor",
    "Local Food",
    "Non-Local Food"
  ];

  const index = Object.fromEntries(labels.map((d, i) => [d, i]));

  let source = [];
  let target = [];
  let value = [];

  data.forEach(d => {

    const isLocalDistributor = d.local > d.total * 0.5; 
    // simple assumption for now

    const distributorType = isLocalDistributor
      ? "Local Distributor"
      : "Non-Local Distributor";

    const nonLocalAmount = d.total - d.local;

    // Total → Distributor Type
    source.push(index["Total Budget"]);
    target.push(index[distributorType]);
    value.push(d.total);

    // Distributor Type → Outcomes
    if (d.local > 0) {
      source.push(index[distributorType]);
      target.push(index["Local Food"]);
      value.push(d.local);
    }

    if (nonLocalAmount > 0) {
      source.push(index[distributorType]);
      target.push(index["Non-Local Food"]);
      value.push(nonLocalAmount);
    }

  });

  Plotly.newPlot("sankey", [{
    type: "sankey",
    node: { label: labels },
    link: { source, target, value }
  }]);
}