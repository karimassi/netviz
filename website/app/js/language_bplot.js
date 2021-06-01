//  code adapted from : https://bl.ocks.org/jrzief/70f1f8a5d066a286da3a1e699823470f

class RacingBarsAudio {
  constructor(svgElement) {
    this.svg = svgElement;
    this.currentData = {};
    this.datetext = {};
    this.datesValues = {};
    this.width = 0;
    this.height = 0;
    this.margin = {};
    this.ini_date = 0;
    this.top_n = 0;
    this.tickDuration = 0;
    this.barPadding= 0 ;
    this.setup()
  }

  xScale() {
    let dateSlice = {};
    if (this.currentData.length > 0) {
      dateSlice = this.currentData.filter(d => d.release_date == this.datesValues[this.ini_date]);
    }
    return d3.scaleLinear()
    .domain([0, d3.max(dateSlice, d => d.count)])
    .range([this.margin.left, this.width-this.margin.right-65]);
  }

  createXaxis() {
    let x = this.xScale() ;
    let xAxis = d3.axisTop()
      .scale(x)
      .ticks(this.width > 500 ? 5:2)
      .tickSize(-(this.height-this.margin.top-this.margin.bottom))
      .tickFormat(d => d3.format(',')(d));
      
    this.svg.append('g')
      .attr('class', 'axis xAxis')
      .attr('transform', `translate(0, ${this.margin.top})`)
      .call(xAxis)
      .selectAll('.tick line')
      .classed('origin', d => d == 0);
  }

  yScale() {
    return d3.scaleLinear()
      .domain([this.top_n, 0])
      .range([this.height-this.margin.bottom, this.margin.top]);
  }

  dateText () {

  const halo = function(text, strokeWidth) {
    text.select(function() { return this.parentNode.insertBefore(this.cloneNode(true), this); })
      .style('fill', '#000000')
        .style( 'stroke','#000000')
        .style('stroke-width', strokeWidth)
        .style('stroke-linejoin', 'round')
        .style('opacity', 1);
    }
    return this.svg.append('text')
    .attr('class', 'dateText')
    .attr('x', this.width-this.margin.right)
    .attr('y', this.height-25)
    .style('text-anchor', 'end')
    .style('fill', '#ffffff')
    .text(d => this.datesValues[this.ini_date])
    .call(halo, 10);
    
  }

  intiateBars(dateSlice) {

    let x = this.xScale().domain([0, d3.max(dateSlice, d => d.count)]);
    let y = this.yScale();

    this.svg.selectAll('rect.bar')
        .data(dateSlice, d => d.audio)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', x(0)+1)
        .attr('width', d => x(d.count)-x(0)-1)
        .attr('y', d => y(d.rank)+5)
        .attr('height', y(1)-y(0)-this.barPadding)
        .style('fill', '#db0000');

    this.svg.selectAll('text.label')
        .data(dateSlice, d => d.audio)
        .enter()
        .append('text')
        .attr('class', 'label')
        .attr('x', d => x(d.count)-8)
        .attr('y',d => y(d.rank)+5+((y(1)-y(0))/2)+1)
        .style('text-anchor', 'end')
        .style('fill', 'whitesmoke')
        .text(d => d.audio);

    this.datetext = this.dateText();
  }

  updateBars(dateSlice) {
    let x = this.xScale().domain([0, d3.max(dateSlice, d => d.count)]);
    let y = this.yScale();

    let bars = this.svg.selectAll('.bar').data(dateSlice, d => d.audio);

      bars
        .enter()
        .append('rect')
        .attr('class', d => `bar ${d.audio.replace(/\s/g,'_')}`)
        .attr('x', x(0)+1)
        .attr( 'width',d => x(d.count)-x(0)-1)
        .attr('y', d => y(this.top_n+1)+5)
        .attr('height', y(1)-y(0)-this.barPadding)
        .style('fill', '#db0000')
        .transition()
          .duration(this.tickDuration)
          .ease(d3.easeLinear)
          .attr('y', d => y(d.rank)+5);
       
      bars
      .transition()
        .duration(this.tickDuration)
        .ease(d3.easeLinear)
        .attr('width', d => x(d.count)-x(0)-1)
        .attr('y', d => y(d.rank)+5);

      bars
      .exit()
      .transition()
        .duration(this.tickDuration)
        .ease(d3.easeLinear)
        .attr('width', d => x(d.count)-x(0)-1)
        .attr('y', d => y(this.top_n+10)+5)
        .remove();
  }

  updateLabels(dateSlice) {

    let x = this.xScale().domain([0, d3.max(dateSlice, d => d.count)]);
    let y = this.yScale();

    let labels = this.svg.selectAll('.label')
        .data(dateSlice, d => d.audio);
       
    labels
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => x(-10))
      .attr('y', d => y(this.top_n+1)+5+((y(1)-y(0))/2))
      .style('text-anchor', 'end')
      .style('fill', 'whitesmoke')
      .text(d => d.audio)    
      .transition()
        .duration(this.tickDuration)
        .ease(d3.easeLinear)
        .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1);
            
    labels
      .transition()
      .duration(this.tickDuration)
        .ease(d3.easeLinear)
        .attr('x', x(-10))
        .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1);

    labels
      .exit()
      .transition()
        .duration(this.tickDuration)
        .ease(d3.easeLinear)
        .attr('x', d => x(-10))
        .attr('y', d => y(this.top_n+10)+5)
        .remove();
  }

  ticker() {
    let ticker = d3.interval(e => {

      let dateSlice = this.currentData.filter(d => d.release_date == this.datesValues[this.ini_date])
        .sort((a,b) => d3.ascending(a, b))
        .slice(0,this.top_n);


      dateSlice.forEach((d,i) => d.rank = i);
      
      let x = this.xScale().domain([0, d3.max(dateSlice, d => d.count)]); 
      let xAxis = d3.axisTop()
        .scale(x)
        .ticks(this.width > 500 ? 5:2)
        .tickSize(-(this.height-this.margin.top-this.margin.bottom))
        .tickFormat(d => d3.format(',')(d));

      this.svg.select('.xAxis')
        .transition()
        .duration(this.tickDuration)
        .ease(d3.easeLinear)
        .call(xAxis);
        
      
      this.updateBars(dateSlice) ;
      this.updateLabels(dateSlice) ;

      this.datetext.text(d => this.datesValues[this.ini_date]);
      
      if(this.datesValues[this.ini_date] == this.datesValues.slice(-1)) ticker.stop();
      ++ this.ini_date ;
    },this.tickDuration);
    
  }

  setup() {
    this.width = 2000;
    this.height = 960;
    this.margin = {top: 50, right: 40, bottom: 30, left: 125};
    this.svg.attr('viewBox', `0 0 ${this.width} ${this.height}`);

    this.top_n= 10;

    this.tickDuration = 200;
    this.barPadding= (this.height-(this.margin.bottom+this.margin.top))/(this.top_n*5); ;

    this.svg.append('g')
    .attr("height", `translate(0, ${this.height - 50})`)

    this.createXaxis();
    
    this.svg.append("text")
    .attr("class", "subTitle")
    .attr("y", 20)
    .attr('x', 0)
    .text(d => "Number of items")
    .style('fill', 'whitesmoke');
  }
}

function instantiateRacingBars(svg, data_path) {

  let plot = new RacingBarsAudio(svg);

  function showInitialPlot() {
    svg.style('opacity', 0);
    svg.transition()
        .delay(1000)
        .duration(600)
        .style('opacity', 1);
  }

  d3.csv(data_path).then(data => {
    data.forEach(d => {
      d.count = +d.count,
      d.release_date = d.release_date
    });

    plot.currentData = data;
    plot.datesValues = d3.map(data, function(d) {return d.release_date}).keys();
    let dateSlice = data.filter(d => d.release_date == plot.datesValues[plot.ini_date])
    .sort((a,b) =>  d3.ascending(a, b))
    .slice(0, plot.top_n);

    dateSlice.forEach((d,i) => d.rank = i);

    plot.intiateBars(dateSlice) ;

    plot.ticker();
  });
  
}