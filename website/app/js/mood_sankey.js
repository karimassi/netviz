// code adapted from https://bl.ocks.org/d3noob/06e72deea99e7b4859841f305f63ba85



class SankeyMood {
    constructor(svgElement) {
        this.svg = svgElement;
        this.currentData = {};
        this.MONTHS = [];
        this.width = 0;
        this.height = 0;
        this.margin = {};
        this.setup();
    }

    setup (){
        this.width = 1100,
        this.height =  600;
        this.margin = {top: 40, right: 115, bottom: 50, left: 100};
        this.svg.attr('viewBox', `0 -10 ${this.width} ${this.height}`); // viewbox : 0 0 widt height

        // set the dimensions and margins of the graph

        this.svg = this.svg
        .append("g")
        .attr("transform", "translate(125,0)");

    }

    createSankey() {

        let MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July','August', 'September', 'October', 'November', 'December'];


        var units = "Items";

        var formatNumber = d3.format(",.0f");    // zero decimal places
        var format = function(d) { return formatNumber(d) + " " + units; };

        
        var sankey = d3.sankey()
        .nodeWidth(20)
        .nodePadding(10)
        .size([this.width-this.margin.right-this.margin.left, this.height-this.margin.bottom-this.margin.top]);

        var path = sankey.link();

        //set up graph in same style as original example but empty
        let graph = {"nodes" : [], "links" : []};


        this.currentData.forEach(function (d) {
            graph.nodes.push({ "name": MONTHS[d.source-1] });
            graph.nodes.push({ "name": d.target });
            graph.links.push({ "source": MONTHS[d.source-1],
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

        sankey
            .nodes(graph.nodes)
            .links(graph.links)
            .layout(32);

            // add in the links
        var link = this.svg
        .append("g").selectAll(".link")
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
        var node = this.svg.append("g").selectAll(".node")
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
            .attr("height", function(d) {return d.dy; })
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
            .attr("x", 25)
            .attr("y", function(d) { return d.dy / 2; })
            .attr("dy", ".35em")
            .attr("text-anchor", "start")
            .attr("transform", null)
            .text(function(d) { return d.name; })
        .filter(function(d) { return d.x < 550; })
            .attr("x", -10)
            .attr("text-anchor", "end")
            .style("font-size", "20px");

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
    }
}

function instantiateMoodSankey(svg, data_path) {
    let plot = new SankeyMood(svg);
    
    function showInitialPlot() {
        svg.style('opacity', 0);
        svg.transition()
            .delay(1000)
            .duration(600)
            .style('opacity', 1);
    }

    d3.csv(data_path).then(function(data) {
        plot.currentData = data;
        plot.createSankey();
    });

    

}

$(() => {
    let svg = d3.select('svg#mood');
    let data_path= 'data/mood.csv';

    instantiateMoodSankey(svg, data_path) ;

})