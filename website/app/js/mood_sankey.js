// code adapted from https://bl.ocks.org/d3noob/06e72deea99e7b4859841f305f63ba85

$(() => {
    let svg = d3.select('svg#mood');
    let data = 'data/mood.csv';

    createSankeyMood(svg, data) ;

})


function createSankeyMood(svg, data) {

    let [sizeX, sizeY] = [1350, 900];
    svg.attr('viewBox', `0 0 ${sizeX} ${sizeY}`); // viewbox : 0 0 widt height

    // set the dimensions and margins of the graph
    var margin = {top: 10, right: 30, bottom: 50, left: 70};

    var units = "Widgets";

    var formatNumber = d3.format(",.0f");    // zero decimal places
    var format = function(d) { return formatNumber(d) + " " + units; };

    var svg = svg
        .append("g")
        .attr('width', sizeX)
        .attr('transform', `translate(0, ${sizeY - 50})`);
        
    var sankey = d3.sankey()
        .nodeWidth(20)
        .nodePadding(10)
        .size([sizeX, sizeY]);

    var path = sankey.link();

    d3.csv(data).then(function(data) {

        //set up graph in same style as original example but empty
        let graph = {"nodes" : [], "links" : []};

        data.forEach(function (d) {
            graph.nodes.push({ "name": d.source });
            graph.nodes.push({ "name": d.target });
            graph.links.push({ "source": d.source,
                            "target": d.target,
                            "value": +d.value });
        });

        // return only the distinct / unique nodes
        graph.nodes = d3.keys(d3.nest()
            .key(function (d) { return d.name; })
            .object(graph.nodes));

        // loop through each link replacing the text with its index from node
        graph.links.forEach(function (d, i) {
            graph.links[i].source = graph.nodes.indexOf(graph.links[i].source);
            graph.links[i].target = graph.nodes.indexOf(graph.links[i].target);
        });

        // now loop through each nodes to make nodes an array of objects
        // rather than an array of strings
        graph.nodes.forEach(function (d, i) {
            graph.nodes[i] = { "name": d };
        });

/*         console.log(graph);
 */        sankey
            .nodes(graph.nodes)
            .links(graph.links)
            .layout(32);

             // add in the links
        var link = svg.append("g").selectAll(".link")
            .data(graph.links)
        .enter().append("path")
            .attr("class", "link")
            .attr("d", path)
            .style("stroke-width", function(d) { return Math.max(2, d.dy); })
            .sort(function(a, b) { return b.dy - a.dy; });

        // add the link titles
        link.append("title")
            .text(function(d) {
                return d.source.name + " → " + 
                    d.target.name + "\n" + format(d.value); });

        // add in the nodes
        var node = svg.append("g").selectAll(".node")
            .data(graph.nodes)
        .enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d) { 
                return "translate(" + d.x + "," + d.y + ")"; })
            .call(d3.drag()
            .subject(function(d) {
                return d;
            })
            .on("start", function() {
                this.parentNode.appendChild(this);
            })
            .on("drag", dragmove));

        // add the rectangles for the nodes
        node.append("rect")
            .attr("height", function(d) { 
                //console.log(d);
                //console.log(d.dy);
                return d.dy; })
            .attr("width", sankey.nodeWidth())
            .style("fill", function(d) { 
                return d.color = "#db0000"; })
            .style("stroke", function(d) { 
                return d3.rgb(d.color).darker(2); })
        .append("title")
            .text(function(d) { 
                return d.name + "\n" + format(d.value); });

        // add in the title for the nodes
        node.append("text")
            .attr("x", -6)
            .attr("y", function(d) { return d.dy / 2; })
            .attr("dy", ".35em")
            .attr("text-anchor", "end")
            .attr("transform", null)
            .text(function(d) { return d.name; })
        .filter(function(d) { return d.x < sizeX / 2; })
            .attr("x", 6 + sankey.nodeWidth())
            .attr("text-anchor", "start");

        // the function for moving the nodes
        function dragmove(d) {
            d3.select(this)
                .attr("transform", 
                    "translate(" 
                        + d.x + "," 
                        + (d.y = Math.max(
                            0, Math.min(sizeY - d.dy, d3.event.y))
                        ) + ")");
            sankey.relayout();
            link.attr("d", path);
        } 
})

}