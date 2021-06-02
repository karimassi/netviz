class CounterAnimation {
    constructor(svgElement) {
        this.svg = svgElement;
        this.finalValue = 0;
        this.tickDuration = 0;
        this.x = 0;
        this.y = 0;
        this.width=0;
        this.height=0;
        this.setup();
    }

    initiateCounter() {

        this.svg
        .append("text")
        .text(this.finalValue)
        .attr('class', 'txt')
        .attr("x", this.x)
        .attr("y", this.y)
        .attr('font-size', '50')
        .style('fill', '#db0000');
    }

    setup() {
        this.width = 600 ;
        this.height = 100;
        this.x = 10;
        this.y = 10;
        this.svg.attr('viewBox', `0  0 ${this.width} ${this.height}`);

        this.tickDuration = 500;
    }

    updateData() {
        let final = [this.finalValue] ;

        this.svg.append('g')
        .selectAll('g')
            .data(final)
            .enter()
            .append("text")
            .text(0)
            .attr("class", "txt")
            .attr("x", 10)
            .attr("y", this.height)
            .style('font-size', '250')
            .style('fill', '#db0000')
            .transition()
            .duration(3000)
            .tween("textTween", function(d) {
                var i = d3.interpolate(this.textContent, d);
                return function(t) {
                // t is the percent completion of the transition
                this.textContent = Math.round(i(t));
                }
            });
    }

}

function instantiateCounter(value, svg) {

    let counter = new CounterAnimation(svg);

    function showInitialPlot() {
        svg.style('opacity', 0);
        svg.transition()
            .delay(1000)
            .duration(600)
            .style('opacity', 1);
    }

    showInitialPlot();
    counter.finalValue = value;

    counter.updateData();

}