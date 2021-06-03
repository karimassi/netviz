class BusiestMonthStackedBarPlot {
    constructor(svgElement) {
        this.svg = svgElement;
        this.currentData = {};
        this.MONTHS = {};
        this.width = 0;
        this.height = 0;
        this.setup();
    }

    xScale() {
        return d3.scaleBand()
        .domain(this.MONTHS)
        .range([ 0, this.width ])
        .padding(0.4);
    }

    createXaxis() {
        var x = this.xScale(this.width) ;

        this.svg.append("g")
        .attr("transform", "translate(0," + this.height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
            .style("text-anchor", "middle")
            .style('fill', 'whitesmoke')
            .style('font-size', '1rem');
    }

    yScale() {
        return d3.scaleLinear()
        .domain([0,2500])
        .range([ this.height, 0]);
    }

    createYaxis() {
        var y = this.yScale(this.height);

        this.svg.append("g")
        .attr("transform", "translate(40,0)")
        .call(d3.axisLeft(y).ticks(4))
        .selectAll("text")
        .transition().duration(100)
          .style('fill', 'whitesmoke')
          .style('font-size', '0.7rem');
    }

    createColorRange() {
        return d3.scaleOrdinal()
                .domain(['Movies', 'TV Shows'])
                .range(['#DB0000', '#623A63']);
    }

    createStackedData() {
        var types = this.currentData.columns.slice(1) ;
        return d3.stack().keys(types)(this.currentData);
    }

    createTooltips() {
        d3.select('div#busiest-month')
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px")
    }

    initiateBars() {
        var x = this.xScale();
        var y = this.yScale();
        var color = this.createColorRange();

        this.svg.append("g")
        .selectAll("g")
        // Enter in the stack data = loop key per key = group per group
        .data(this.MONTHS)
        .enter().append("g")
            .attr("fill", '#ffffff')
            .attr("x", function(d) { return x(d); })
            .attr("y", function(d) { return y(0); })
            .attr("height", function(d) { return y(0); })
            .attr("width",x.bandwidth());
    }

    setup() {
        this.width = 1350 ;
        this.height = 380;
        this.svg.attr('viewBox', `0 0 ${this.width} ${this.height}`);

        this.initiateBars() ;
    }

    updateData() {

        //this.currentData.forEach(d=> d.total = parseInt(d.movie)+parseInt(d.show));
        var stackedData = this.createStackedData();
        var types = this.currentData.columns.slice(1);
        var color = this.createColorRange();

        var transition = d3.transition().duration(2000);

        var x = this.xScale(); 
        var y = this.yScale();

        this.createXaxis();
        this.createYaxis();

        var tooltip = d3.select('div#busiest-month');

        this.createTooltips();

        //setup tooltip
        var mouseover = function(d) {
            var subgroupName = d3.select(this.parentNode).datum().key;
            var subgroupValue = d.data[subgroupName];
            tooltip
                .html(subgroupName + "<br>" + "Count: " + subgroupValue)
                .style('color', 'black')
                .transition().duration(2100)
                .style('opacity', 1)
          }
        var mousemove = function(d) {
            var x = d3.event.x,
            y = d3.event.y;
            tooltip
            .style("left", (x + 10) + "px") // It is important to put the +10: other wise the tooltip is exactly where the point is an it creates a weird effect
            .style("top", y + "px")
            .style('opacity',0)
        }
        var mouseleave = function(d) {
            tooltip.style("opacity", 0)
        }


        this.svg.append("g")
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
            .attr("y", function(d) { return y(this.height); })
            .attr("height", function(d) { return y(0); })
            .attr("width",x.bandwidth())
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)
            .transition(transition)
            .attr("y", function(d) { return y(d[1]); })
            .attr("height", function(d) { return y(d[0]) - y(d[1]); })
            //.delay(function(d,i) {return i*200})
        
    }
    }


function instentiateBusiestMonth(svg,data_path) {

    let loadedData = {};

    let plot = new BusiestMonthStackedBarPlot(svg);

    function showInitialPlot() {
        svg.style('opacity', 0);
        svg.transition()
            .delay(1000)
            .duration(600)
            .style('opacity', 1);
    }

    d3.csv(data_path).then(data => {
        loadedData = data;
        loadedData.forEach(d=> d.total = parseInt(d.movie)+parseInt(d.show));
        
        showInitialPlot();
        plot.currentData = loadedData;
        plot.MONTHS = d3.map(loadedData, function(d){return(d.month)}).keys();

        plot.updateData();
    });
}
