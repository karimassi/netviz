$(function() {
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  
  // set the dimensions and margins of the graph
  var margin = {top: 10, right: 30, bottom: 50, left: 50},
      width = 1350 - margin.left - margin.right,
      height = 450 - margin.top - margin.bottom;
  
  // append the svg object to the body of the page
  let svg = d3.select("#busiest-month")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
  
  d3.csv("../data/busiest_month.csv", function(data) {
  
    var x = d3.scaleBand()
        .range([ 0, width ])
        .domain(data.map(function(d) { return MONTHS[d.month-1]; }))
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
  
    // Bars
    svg.selectAll("mybar")
        .data(data)
        .enter()
        .append("rect")
            .attr("x", function(d) { return x(MONTHS[d.month-1]); })
            .attr("y", function(d) { return y(d.id); })
            .attr("width", x.bandwidth())
            .attr("height", function(d) { return height - y(d.id); })
            .attr("fill", "#DB0000");
  })
})


