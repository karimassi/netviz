$(function() {

  // set the dimensions and margins of the graph
  var margin = {top: 10, right: 30, bottom: 50, left: 50},
      width = 1350 - margin.left - margin.right,
      height = 450 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = d3.select("#busiest-month")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

  d3.csv("data/busiest_month.csv", function(data) {

    var type = data.columns.slice(1);
    var month = d3.map(data, function(d){return(d.month)}).keys()
    var x = d3.scaleBand()
        .domain(month)
        .range([ 0, width ])
        .padding(0.4);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end")
            .style('fill', 'whitesmoke')
            .style('font-size', '0.7rem')

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([0, 2000])
        .range([ height, 0]);
    svg.append("g")
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
            .html(subgroupName + "<br>" + "Count: " + subgroupValue)
            .style("opacity", 1)
            .style('color', 'black')
      }
      var mousemove = function(d) {
        var x = d3.event.x,
        y = d3.event.y;
        tooltip
        .style("left", (x + 10) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
        .style("top", y + "px")
      } 
      var mouseleave = function(d) {
        tooltip
          .style("opacity", 0)
      }

    svg.append("g")
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
})