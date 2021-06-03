//  code adapted from : https://bl.ocks.org/jrzief/70f1f8a5d066a286da3a1e699823470f

// const { duration } = require("moment");

class RacingBarsAudio {
  constructor(svgElement) {
    this.svg = svgElement;
    this.currentData = {};
    this.datetext = {};
    //this.datesValues = {};
    this.width = 0;
    this.height = 0;
    this.margin = {};
    this.ini_date = new Date();
    this.top_n = 0;
    this.tickDuration = 0;
    this.barPadding= 0 ;
    this.setup()
  }

  xScale() {
    let dateSlice = {};
    if (this.currentData.length > 0) {
      dateSlice = this.currentData.filter(d => d.release_date.getTime() == this.ini_date.getTime());
    }
    return d3.scaleLog()
    .domain([1, d3.max(dateSlice, d => d.count)])
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
    .text(d => this.ini_date.toString())
    .call(halo, 10);

  }

  intiateBars(dateSlice) {

    let x = this.xScale().domain([1, d3.max(dateSlice, d => d.count)]);
    let y = this.yScale();

    this.svg.selectAll('rect.bar')
        .data(dateSlice, d => d.audio)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', x(1))
        .attr('width', d => x(d.count)-x(1)-1)
        .attr('y', d => y(d.rank)+5)
        .attr('height', y(1)-y(0)-this.barPadding)
        .style('fill', '#db0000');

    this.svg.selectAll('text.label')
        .data(dateSlice, d => d.audio)
        .enter()
        .append('text')
        .attr('class', 'label')
        .attr('x', d => x(1)-8)
        .attr('y',d => y(d.rank)+5+((y(1)-y(0))/2)+1)
        .style('text-anchor', 'end')
        .style('fill', 'whitesmoke')
        .text(d => d.audio);

    this.svg.selectAll('text.valueLabel')
        .data(dateSlice, d=> d.audio)
        .enter()
        .append('text')
        .attr('class', 'valueLabel')
        .attr('x', d => x(d.count)+5)
        .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2))
        .style('fill', 'whitesmoke')
        .text(d => d.count);

    this.datetext = this.dateText();
  }

  updateBars(dateSlice) {
    let x = this.xScale().domain([1, d3.max(dateSlice, d => d.count)]);
    let y = this.yScale();

    let bars = this.svg.selectAll('.bar').data(dateSlice, d => d.audio);

      bars
        .enter()
        .append('rect')
        .attr('class', d => `bar ${d.audio.replace(/\s/g,'_')}`)
        .attr('x', x(1))
        .attr( 'width',d => x(d.count)-x(1)-1)
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
        .attr('width', d => x(d.count)-x(1)-1)
        .attr('y', d => y(d.rank)+5);

      bars
      .exit()
      .transition()
        .duration(this.tickDuration)
        .ease(d3.easeLinear)
        .attr('width', d => x(d.count)-x(1)-1)
        .attr('y', d => y(this.top_n+10)+5)
        .remove();
  }

  updateLabels(dateSlice) {

    let x = this.xScale().domain([1, d3.max(dateSlice, d => d.count)]);
    let y = this.yScale();

    let labels = this.svg.selectAll('.label')
        .data(dateSlice, d => d.audio);

    labels
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => x(1)-8)
      .attr('y', d => y(this.top_n+1)+5+((y(1)-y(0))/2))
      .style('text-anchor', 'end')
      .style('fill', 'whitesmoke')
      .text(d => d.audio)
      .transition()
        .duration(this.tickDuration)
        .ease(d3.easeLinear)
        .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2));

    labels
      .transition()
      .duration(this.tickDuration)
        .ease(d3.easeLinear)
        .attr('x', x(1)-8)
        .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2));

    labels
      .exit()
      .transition()
        .duration(this.tickDuration)
        .ease(d3.easeLinear)
        .attr('x', d => x(1)-8)
        .attr('y', d => y(this.top_n+10)+5)
        .remove();
  }

  updateValueLabels (dateSlice) {

    let x = this.xScale().domain([1, d3.max(dateSlice, d => d.count)]);
    let y = this.yScale();

    let valueLabel = this.svg.selectAll('.valueLabel')
        .data(dateSlice, d => d.audio);

    valueLabel
        .enter()
        .append('text')
        .attr('class', 'valueLabel')
        .attr('x', d => x(d.count)+5)
        .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1)
        .style('fill', 'whitesmoke')
        .transition()
        .duration(this.tickDuration)
        .tween("textTween", function (d) {
          var i = d3.interpolate(this.textContent, d.count);
              return function(t) {
                // t is the percent completion of the transition
                this.textContent = Math.round(i(t));
              }
        });

    valueLabel
      .transition()
      .duration(this.tickDuration)
      .ease(d3.easeLinear)
      .attr('x', d => x(d.count)+5)
      .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1)
      .tween("textTween", function (d) {
        var i = d3.interpolate(this.textContent, d.count);
            return function(t) {
              // t is the percent completion of the transition
              this.textContent = Math.round(i(t));
            }
      });

    valueLabel
      .exit()
      .transition()
      .duration(this.tickDuration)
      .ease(d3.easeLinear)
      .attr('x', d => x(d.count)+5)
      .attr('y', d => y(this.top_n+10)+5)
      .tween("textTween", function (d) {
        var i = d3.interpolate(this.textContent, d.count);
            return function(t) {
              // t is the percent completion of the transition
              this.textContent = Math.round(i(t));
            }
      });

  }

  binarySearch(arr, date) {
    let lower = 0, higher = arr.length - 1;

    if(arr[lower].release_date > date) {
      return 0;
    }
    if(arr[higher].release_date <= date) {
      return arr[higher].count;
    }

    while(lower <= higher) {
      const mid = Math.floor((lower + higher) / 2);
      const midDate = arr[mid].release_date;
      if(midDate == date) {
        return arr[mid].count;
      }
      else if(midDate > date) {
        higher = mid - 1;
      }
      else {
        lower = mid + 1;
      }
    }
    return arr[lower - 1].count;
  }

  updateData() {
    const date = this.ini_date.getTime();
    let dateSlice = Object.entries(this.currentData).map(([audio, entries]) => ({
        audio: audio,
        count: this.binarySearch(entries, date)
      }))
      .sort((a,b) => b.count - a.count)
      .slice(0, this.top_n);
      dateSlice.forEach((d,i) => d.rank = i);

      let x = this.xScale().domain([1, d3.max(dateSlice, d => d.count)]);

      if (dateSlice.length > 0) {
        this.updateBars(dateSlice) ;
        this.updateLabels(dateSlice) ;
        this.updateValueLabels(dateSlice) ;
      }


      //this.datetext.text(d => this.datesValues[this.ini_date]);

      //if(this.ini_date == new Date('2021-04-08')) ticker.stop();
      this.ini_date = new Date(this.ini_date.setDate(this.ini_date.getDate() + 1));
      /* console.log(this.ini_date); */
/*       ++ this.ini_date ;
 */  }

 /*  ticker() {
    let ticker = d3.interval(e => {

      let dateSlice = this.currentData.filter(d => d.release_date == this.datesValues[this.ini_date])
        .sort((a,b) => d3.ascending(a, b))
        .slice(0,this.top_n);


      dateSlice.forEach((d,i) => d.rank = i);

      let x = this.xScale().domain([1, d3.max(dateSlice, d => d.count)]);


      this.updateBars(dateSlice) ;
      this.updateLabels(dateSlice) ;
      this.updateValueLabels(dateSlice) ;

      this.datetext.text(d => this.datesValues[this.ini_date]);

      if(this.datesValues[this.ini_date] == this.datesValues.slice(-1)) ticker.stop();
      ++ this.ini_date ;
    },this.tickDuration);

  } */

  setup() {
    this.width = 2000;
    this.height = 960;
    this.margin = {top: 50, right: 40, bottom: 30, left: 125};
    this.svg.attr('viewBox', `0 0 ${this.width} ${this.height}`);

    this.ini_date = new Date('2015-04-14');
    this.top_n= 10;

    this.tickDuration = 200;
    this.barPadding= (this.height-(this.margin.bottom+this.margin.top))/(this.top_n*5); ;

    this.svg.append('g')
    .attr("height", `translate(0, ${this.height - 50})`)

    this.createXaxis();
  }
}

function instantiateRacingBars(svg, data_path) {

  let plot = new RacingBarsAudio(svg);

  var new_data = {} ;

  const dateFormatter = date => `${date.getDate()}-${date.getMonth()+1}-${date.getFullYear()}`;

  const selector = new TimeSelector(
    'racing-audio-time-selection',
    [new Date('04-14-2015'), new Date('04-08-2020')],
    function(date) {
      plot.ini_date = date;
      plot.updateData();
    },
    60000,
    'date', dateFormatter

  );

  function showInitialPlot() {
    svg.style('opacity', 0);
    svg.transition()
        .delay(1000)
        .duration(600)
        .style('opacity', 1);
    selector.setValue('2015-04-14');
  }

  d3.csv(data_path).then(data => {
    const country_data = {};

    data.forEach(entry => {
      const country = entry.audio;
      if(country_data[country] === undefined) {
        country_data[country] = [];
      }
      country_data[country].push({
        count: +entry.count,
        release_date: new Date(entry.release_date)
      });
    });

    plot.currentData = country_data;

    plot.updateData() ;
  });

}
