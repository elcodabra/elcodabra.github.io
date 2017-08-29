;(function() {
  var width = 780;
  var height = 400;

  var svg = d3.select("#skillsChart").append("svg")
    .attr("class", "skillsBubbleSVG")
    .attr("width", width)
    .attr("height",height)
    .on("mouseleave", function() {return resetBubbles();});

  var format = d3.format(",d");

  var color = d3.scaleOrdinal([
    "#ffffff",
    "#f0f0f0",
    "#d9d9d9",
    "#bdbdbd",
    "#969696",
    "#737373",
  ]);

  var pack = d3.pack()
    .size([width, height])
    .padding(1.5);

  d3.csv("./data/skills.csv", function(d) {
    d.value = +d.value;
    if (d.value) return d;
  }, function(error, classes) {
    if (error) throw error;

    var root = d3.hierarchy({children: classes})
      .sum(function(d) { return d.value; })
      .each(function(d) {
        if (id = d.data.id) {
          var id, i = id.lastIndexOf(".");
          d.id = id;
          d.package = id.slice(0, i);
          d.class = id.slice(i + 1);
        }
      });

    var node = svg.selectAll(".node")
      .data(pack(root).leaves())
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

    node.append("circle")
      .attr("id", function(d) { return d.id; })
      .attr("r", function(d) { return d.r; })
      .attr("stroke", "black")
      .style("fill", function(d) { return color(d.package); });

    node.append("clipPath")
      .attr("id", function(d) { return "clip-" + d.id; })
      .append("use")
      .attr("xlink:href", function(d) { return "#" + d.id; });

    node.append("text")
      .attr("clip-path", function(d) { return "url(#clip-" + d.id + ")"; })
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("alignment-baseline", "middle")
      .selectAll("tspan")
      .data(function(d) { return d.class.split(/(?=[A-Z][^A-Z])/g); })
      .enter().append("tspan")
      .attr("x", 0)
      .attr("y", function(d, i, nodes) { return 13 + (i - nodes.length / 2 - 0.5) * 10; })
      .text(function(d) { return d; });

    node.append("title")
      .text(function(d) { return d.id + "\n" + format(d.value); });
  });
})();