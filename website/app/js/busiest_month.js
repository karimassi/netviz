class BusiestMonthStackedBarPlot {
    constructor(svgElement) {
        this.svg = svgElement;
        this.bars = {};
        this.currentData = {};
        this.MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        this.setup();
    }

    xScale(width) {
        return d3.scaleBand()
        .domain(this.MONTHS)
        .range([ 0, width ])
        .padding(0.4);
    }

    createXaxis(width, height) {
        var x = this.xScale(width) ;

        this.svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end")
            .style('fill', 'whitesmoke')
            .style('font-size', '1rem');
    }

    yScale(height) {
        return d3.scaleLinear()
        .domain([0,2000])
        .range([ height, 0]);
    }

    createYaxis(width, height) {
        var y = this.yScale(height);

        this.svg.append("g")
        .attr("transform", "translate(0," + width + ")")
        .call(d3.axisLeft(y))
        .selectAll("text")
          .style('fill', 'whitesmoke')
          .style('font-size', '0.7rem');
    }
    
    createColorRange() {
        return d3.scaleOrdinal()
                .domain(['Movies', 'Shows'])
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

    initiateBars(width, height) {
        var x = this.xScale(width);
        var y = this.yScale(height);
        var color = this.createColorRange();
        
        this.svg.append("g")
        .selectAll("g")
        // Enter in the stack data = loop key per key = group per group
        .data(this.MONTHS)
        .enter().append("g")
            .attr("fill", '#ffffff')
            .selectAll("rect")
            .attr("x", function(d) { return x(d); })
            .attr("y", function(d) { return y(0); })
            .attr("height", function(d) { return y(0); })
            .attr("width",x.bandwidth());
    }

    setup() {
        let [sizeX, sizeY] = [1350, 380];
        this.svg.attr('viewBox', `0 0 ${sizeX} ${sizeY}`);

        this.createXaxis(sizeX, sizeY);
        this.createYaxis(sizeX, sizeY);

        this.initiateBars(sizeX, sizeY) ;

        this.createTooltips();
    }

    updateData(data) {

        this.currentData = data ;

        this.currentData.forEach(d=> d.total = parseInt(d.movie)+parseInt(d.show));

        var stackedData = this.createStackedData();
        var types = this.currentData.columns.slice(1);
        var color = this.createColorRange();

        var transition = d3.transition(d3.easeCubicOut).duration(10000);

        //setup tooltip

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
            tooltip.style("opacity", 0)
        }
        //console.log(stackedData);
        //update data
        this.svg.selectAll('rect')
            .data(stackedData)
            .enter().append('g')
            .attr("fill", function(d) { return color(d.key);})
            .selectAll('rect')
            .data(function(d) {
                return d;
            })
            .transition(transition)
            .attr("y", function(d) { return y(d[1]); })
            .attr("height", function(d) { 
                return y(d[0]) - y(d[1]); 
            })
            //.delay(function(d,i) {return i*100})
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)
    }
    }


function instentiateBusiestMonth(svg,data_path) {

    let data = {};

    let plot = new BusiestMonthStackedBarPlot(svg);

    function showInitialPlot() {
        svg.style('opacity', 0);
        svg.transition()
            .delay(1000)
            .duration(600)
            .style('opacity', 1);
    }

    d3.csv(data_path).then(function(data) {
        data = data;
        data.forEach(d=> d.total = parseInt(d.movie)+parseInt(d.show));
    });

    showInitialPlot();

    plot.updateData(data);
}