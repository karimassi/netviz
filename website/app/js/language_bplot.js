// set the dimensions and margins of the graph
var margin_audio = {top: 10, right: 30, bottom: 50, left: 70},
    width_audio = 1500 - margin_audio.left - margin_audio.right,
    height_audio = 700 - margin_audio.top - margin_audio.bottom;

// append the svg object to the body of the page
var audio = d3.selectAll("#most-languages")
  .append("svg")
    .attr("width", width_audio + margin_audio.left + margin_audio.right)
    .attr("height", height_audio + margin_audio.top + margin_audio.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin_audio.left + "," + margin_audio.top + ")");

d3.csv("../data/audio.csv", function(data) {

  var new_data = data.slice(0,10) ;

  var x = d3.scaleLinear()
      .domain([ 0, 5000 ])
      .range([ 0, width_audio ]);
  audio.append("g")
      .attr("transform", "translate(0," + height_audio + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
          .attr("transform", "translate(-10,0)rotate(-45)")
          .style("text-anchor", "end")
          .style('fill', 'whitesmoke')
          .style('font-size', '0.7rem')

  // Add Y axis
  var y = d3.scaleBand()
      .range([ 0, height_audio])
      .domain( new_data.map(function(d) { return d.audio}))
      .padding(.1);
  audio.append("g")
      .call(d3.axisLeft(y))
      .selectAll("text")
        .style('fill', 'whitesmoke')
        .style('font-size', '0.7rem');

  //Bars
  audio.selectAll("myRect")
    .data(new_data)
    .enter()
    .append("rect")
    .attr("x", x(0) )
    .attr("y", function(d) { return y(d.audio); })
    .attr("width", function(d) { return x(d.id); })
    .attr("height", y.bandwidth() )
    .attr("fill", "#db0000")
})
