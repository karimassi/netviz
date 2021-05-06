// set the dimensions and margins of the graph
var margin_releases = {top: 10, right: 30, bottom: 50, left: 50},
    width_releases = 1350 - margin_releases.left - margin_releases.right,
    height_releases = 450 - margin_releases.top - margin_releases.bottom;

// append the svg object to the body of the page
var releases = d3.select("#busiest-month")
  .append("svg")
    .attr("width", width_releases + margin_releases.left + margin_releases.right)
    .attr("height", height_releases + margin_releases.top + margin_releases.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin_releases.left + "," + margin_releases.top + ")");

d3.csv("../data/busiest_month.csv", function(data) {

  var type = data.columns.slice(1);
  var month = d3.map(data, function(d){return(d.month)}).keys()
  var x = d3.scaleBand()
      .domain(month)
      .range([ 0, width_releases ])
      .padding(0.4);
  releases.append("g")
      .attr("transform", "translate(0," + height_releases + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
          .attr("transform", "translate(-10,0)rotate(-45)")
          .style("text-anchor", "end")
          .style('fill', 'whitesmoke')
          .style('font-size', '0.7rem')

  // Add Y axis
  var y = d3.scaleLinear()
      .domain([0, 2000])
      .range([ height_releases, 0]);
  releases.append("g")
      .call(d3.axisLeft(y))
      .selectAll("text")
        .style('fill', 'whitesmoke')
        .style('font-size', '0.7rem');

  var color = d3.scaleOrdinal()
    .domain(type)
    .range(['#DB0000', '#623A63']);

  var stackedData = d3.stack()
    .keys(type)
    (data)


  // ----------------
    // Create a tooltip
    // ----------------
    var tooltip = d3.select("#busiest-month")
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "1px")
      .style("border-radius", "5px")
      .style("padding", "10px")

    // Three function that change the tooltip when user hover / move / leave a cell
    var mouseover = function(d) {
      var subgroupName = d3.select(this.parentNode).datum().key;
      var subgroupValue = d.data[subgroupName];
      tooltip
          .html("subgroup: " + subgroupName + "<br>" + "Value: " + subgroupValue)
          .style("opacity", 1)
          .style('color', 'black')
    }
    var mousemove = function(d) {
      tooltip
        .style("left", (d3.mouse(this)[0]+90) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
        .style("top", (d3.mouse(this)[1]) + "px")
    }
    var mouseleave = function(d) {
      tooltip
        .style("opacity", 0)
    }

  releases.append("g")
    .selectAll("g")
    // Enter in the stack data = loop key per key = group per group
    .data(stackedData)
    .enter().append("g")
      .attr("fill", function(d) { return color(d.key); })
      .selectAll("rect")
      // enter a second time = loop subgroup per subgroup to add all rectangles
      .data(function(d) { return d; })
      .enter().append("rect")
        .attr("x", function(d) { return x(d.data.month); })
        .attr("y", function(d) { return y(d[1]); })
        .attr("height", function(d) { return y(d[0]) - y(d[1]); })
        .attr("width",x.bandwidth())
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave)
})
