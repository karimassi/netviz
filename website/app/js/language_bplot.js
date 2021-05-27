$(function() {
  // set the dimensions and margins of the graph
  var margin = {top: 10, right: 30, bottom: 50, left: 70},
      width = 1200 - margin.left - margin.right,
      height = 700 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = d3.selectAll("#most-languages")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

  d3.csv("data/audio.csv", function(data) {

    var new_data = data.slice(0,10) ;

    var x = d3.scaleLinear()
        .domain([ 0, 5000 ])
        .range([ 0, width ]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end")
            .style('fill', 'whitesmoke')
            .style('font-size', '0.7rem')

    // Add Y axis
    var y = d3.scaleBand()
        .range([ 0, height])
        .domain( new_data.map(function(d) { return d.audio}))
        .padding(.1);
    svg.append("g")
        .call(d3.axisLeft(y))
        .selectAll("text")
          .style('fill', 'whitesmoke')
          .style('font-size', '0.7rem');

    // ----------------
    // Create a tooltip
    // ----------------
    var tooltip = d3.select("#most-languages")
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "1px")
      .style("border-radius", "5px")
      .style("padding", "10px")
      .style('position', 'absolute');

    // Three function that change the tooltip when user hover / move / leave a cell
    var mouseover = function(d) {
      var audioName = d.audio;
      var audioValue = d.id;

      tooltip
          .html("Language: " + audioName + "<br>" + "Value: " + audioValue)
          .style("opacity", 1)
          .style('color', 'black')

    }
    var mousemove = function(d) {
      var x = d3.event.x,
        y = d3.event.y;
      tooltip
      .style("left", (x+10) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
      .style("top", y + "px")
    }
    var mouseleave = function(d) {
      tooltip
        .style("opacity", 0)
    }

    //Bars
    svg.selectAll("myRect")
      .data(new_data)
      .enter()
      .append("rect")
      .attr("x", x(0) )
      .attr("y", function(d) { return y(d.audio); })
      .attr("width", function(d) { return x(d.id); })
      .attr("height", y.bandwidth() )
      .attr("fill", "#db0000")
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave)
  })
})