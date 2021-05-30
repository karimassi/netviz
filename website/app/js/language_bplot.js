//  code adapted from : https://bl.ocks.org/jrzief/70f1f8a5d066a286da3a1e699823470f

$(() => {
  let svg = d3.select('svg#most-languages') ;
  let data = 'data/racing_audio.csv';

  createRacingLanguageBars(svg, data);
})


function createRacingLanguageBars(svg, data) {

  let [sizeX, sizeY] = [2000, 960];
  svg.attr('viewBox', `0 0 ${sizeX} ${sizeY}`);

  // set the dimensions and margins of the graph
  var margin = {top: 50, right: 40, bottom: 30, left: 70};
  var top_n = 10;
  var tickDuration = 200;

  var svg = svg.append('g')
      .attr("width", sizeX)
      .attr("height", `translate(0, ${sizeY - 50})`);

  let barPadding = (sizeY-(margin.bottom+margin.top))/(top_n*5);

  let subTitle = svg.append("text")
    .attr("class", "subTitle")
    .attr("y", 20)
    .html("Number of items")
    .style('fill', 'whitesmoke');

  let ini_date = 0;

  d3.csv('data/racing_audio.csv').then(function(data) {

    data.forEach(d => {
      d.count = +d.count,
      d.release_date = d.release_date
    });

    let audios = new Set (data.map(d => d.audio));
    let datesValues = d3.map(data, function(d) {return d.release_date}).keys();
    let dateSlice = data.filter(d => d.release_date == datesValues[ini_date])
    .sort((a,b) =>  d3.ascending(a, b))
    .slice(0, top_n);

    dateSlice.forEach((d,i) => d.rank = i);

    let x = d3.scaleLinear()
        .domain([0, d3.max(dateSlice, d => d.count)])
        .range([margin.left, sizeX-margin.right-65]);
  
    let y = d3.scaleLinear()
      .domain([top_n, 0])
      .range([sizeY-margin.bottom, margin.top]);

    let xAxis = d3.axisTop()
      .scale(x)
      .ticks(sizeX > 500 ? 5:2)
      .tickSize(-(sizeY-margin.top-margin.bottom))
      .tickFormat(d => d3.format(',')(d));
    svg.append('g')
      .attr('class', 'axis xAxis')
      .attr('transform', `translate(0, ${margin.top})`)
      .call(xAxis)
      .selectAll('.tick line')
      .classed('origin', d => d == 0);
  
    svg.selectAll('rect.bar')
        .data(dateSlice, d => d.audio)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', x(0)+1)
        .attr('width', d => x(d.count)-x(0)-1)
        .attr('y', d => y(d.rank)+5)
        .attr('height', y(1)-y(0)-barPadding)
        .style('fill', '#db0000');
      
    svg.selectAll('text.label')
        .data(dateSlice, d => d.audio)
        .enter()
        .append('text')
        .attr('class', 'label')
        .attr('x', d => x(d.count)-8)
        .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1)
        .style('text-anchor', 'end')
        .style('fill', 'whitesmoke')
        .html(d => d.audio);

    let dateText = svg.append('text')
      .attr('class', 'dateText')
      .attr('x', sizeX-margin.right)
      .attr('y', sizeY-25)
      .style('text-anchor', 'end')
      .style('fill', '#ffffff')
      .html(datesValues[ini_date])
      .call(halo, 10);

    let ticker = d3.interval(e => {

      dateSlice = data.filter(d => d.release_date == datesValues[ini_date])
        .sort((a,b) => d3.ascending(a, b))
        .slice(0,top_n);

      dateSlice.forEach((d,i) => d.rank = i);
      
      x.domain([0, d3.max(dateSlice, d => d.count)]); 
      
      svg.select('.xAxis')
        .transition()
        .duration(tickDuration)
        .ease(d3.easeLinear)
        .call(xAxis);
  
      let bars = svg.selectAll('.bar').data(dateSlice, d => d.audio);

      bars
        .enter()
        .append('rect')
        .attr('class', d => `bar ${d.audio.replace(/\s/g,'_')}`)
        .attr('x', x(0)+1)
        .attr( 'width', d => x(d.count)-x(0)-1)
        .attr('y', d => y(top_n+1)+5)
        .attr('height', y(1)-y(0)-barPadding)
        .style('fill', '#db0000')
        .transition()
          .duration(tickDuration)
          .ease(d3.easeLinear)
          .attr('y', d => y(d.rank)+5);
       
      bars
      .transition()
        .duration(tickDuration)
        .ease(d3.easeLinear)
        .attr('width', d => x(d.count)-x(0)-1)
        .attr('y', d => y(d.rank)+5);

      bars
      .exit()
      .transition()
        .duration(tickDuration)
        .ease(d3.easeLinear)
        .attr('width', d => x(d.count)-x(0)-1)
        .attr('y', d => y(top_n+2)+5)
        .remove();

      let labels = svg.selectAll('.label')
        .data(dateSlice, d => d.audio);
       
      labels
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => x(-10))
      .attr('y', d => y(top_n+1)+5+((y(1)-y(0))/2))
      .style('text-anchor', 'end')
      .style('fill', 'whitesmoke')
      .html(d => d.audio)    
      .transition()
        .duration(tickDuration)
        .ease(d3.easeLinear)
        .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1);
            
      labels
        .transition()
        .duration(tickDuration)
          .ease(d3.easeLinear)
          .attr('x', x(-10))
          .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1);

      labels
        .exit()
        .transition()
          .duration(tickDuration)
          .ease(d3.easeLinear)
          .attr('x', d => x(-10))
          .attr('y', d => y(top_n+2)+5)
          .remove();
        
      dateText.html(datesValues[ini_date]);
      
      if(datesValues[ini_date] == datesValues.slice(-1)) ticker.stop();
      ++ ini_date ;
    },tickDuration);
  
   });
      
   const halo = function(text, strokeWidth) {
    text.select(function() { return this.parentNode.insertBefore(this.cloneNode(true), this); })
      .style('fill', '#000000')
       .style( 'stroke','#000000')
       .style('stroke-width', strokeWidth)
       .style('stroke-linejoin', 'round')
       .style('opacity', 1);
   }

  
  }