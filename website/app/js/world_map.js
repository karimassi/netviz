$(function() {
    // append the svg object to the body of the page
    var width = 1000
    var height = 400

    var svg = d3.select("#world-map")
    .append("svg")
        .attr("width", width)
        .attr("height", height)
    .append("g")

    // Map and projection
    var path = d3.geoPath();
    var projection = d3.geoMercator()
    .scale(100)
    .center([0,0])
    .translate([width / 2, height / 2 + 80]);

    // Data and color scale
    var data = d3.map();

    // Load external data and boot
    d3.queue()
    .defer(d3.json, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
    .await(ready);

    function ready(error, topo) {

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
        // set the color of each country
        .attr("fill", "white")
        }
})

