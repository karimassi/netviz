$(function() {
  let svg = d3.select('svg#world-map')
  d3.queue()
  .defer(d3.json, "data/countries_info.json")
  .await((error, data) => {
    draw_map(svg, (name => {
      updateCountryPassport(name, data)
    }))
  } );
})

function updateCountryPassport(name, info) {
  $( "#country-passport" ).find("h4").text(name)
  if (typeof info[name] == 'undefined') {
      $("#country-passport").find("p").text("No information available for that country...")
  } else {
      $("#country-passport").find("p").html(`There are ${info[name].count_movies} movies and ${info[name].count_series} series available in this country.<br><br>The top 10 genres are ${info[name].genres.join(', ')}.`)
  }
}

function draw_map(svg, callback) {
  
  let [width, height] = [800, 450]
  svg.attr('viewBox', `0, 0, ${width}, ${height}`)

  var projection = d3.geoPatterson().translate([width/2, height/2]);

  d3.queue()
    .defer(d3.json, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
    .await(ready);

  function ready(error, topo, info) {
    let mouseClick = function(d) {
        d3.selectAll(".Country")
          .transition()
          .duration(200)
          .style("fill", "grey")
          .style("stroke", "transparent")
        d3.select(this)
          .transition()
          .duration(200)
          .style("opacity", 1)
          .style("fill", "red")
          .style("stroke", "black")
        callback(d.properties.name)
      }

    // Draw the map
    svg.append("g")
        .selectAll("path")
        .data(topo.features)
        .enter()
        .append("path")
        // draw each country
        .attr("d", d3.geoPath()
            .projection(projection)
        )
        .attr("class", function(d){ return "Country" } )
        // set the color of each country
        .attr("fill", "white")
        .style("stroke", "transparent")
        .on("click", mouseClick)
}
  
}