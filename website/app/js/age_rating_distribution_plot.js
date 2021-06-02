class AgeRatingDistributionPlot {
  constructor(svgElement) {
    this.svg = svgElement;
    this.bars = {};
    this.yTickValues = ['NR', '3+', '7+', '10+', '13+', '16+', '18+'];
    this.currentData = {};
    this.setup();
  }

  /**
   * Creates texts in corners (Movies/TV Shows)
   */
  createInfoTexts(width, xSideGap) {
    this.svg.append('text')
      .attr('x', xSideGap)
      .attr('fill', 'red')
      .style('font-size', '2em')
      .style('text-anchor', 'start')
      .style('alignment-baseline', 'hanging')
      .text('Movies');

    this.svg.append('text')
      .attr('x', width - xSideGap)
      .attr('fill', 'red')
      .style('font-size', '2em')
      .style('text-anchor', 'end')
      .style('alignment-baseline', 'hanging')
      .text('TV Shows');
  }

  /**
   * Creates X axis and sets its ticks
   */
  createXAxis(width, height, tickPositionValuePairsOneSided) {
    const axis = this.svg.append('g')
      .attr('width', width)
      .attr('transform', `translate(0, ${height - 50})`);

    axis.append('line')
      .attr('stroke', 'whitesmoke')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', width)
      .attr('y2', 0);

    const ticksX = tickPositionValuePairsOneSided.flatMap(v =>
      [{
        position: v[0],
        value: v[1]
      }, {
        position: width - v[0],
        value: v[1]
      }]);
    const ticks = axis.selectAll('.plot-tick')
      .data(ticksX)
      .enter();

    ticks.append('line')
      .attr('stroke', 'whitesmoke')
      .attr('x1', tick => tick.position)
      .attr('y1', 0)
      .attr('x2', tick => tick.position)
      .attr('y2', 5);

    ticks.append('text')
      .attr('fill', 'whitesmoke')
      .attr('y', 10)
      .attr('x', tick => tick.position)
      .style('text-anchor', 'middle')
      .style('alignment-baseline', 'hanging')
      .text(tick => tick.value + '%');
  }

  /**
   * Returns the size of bar depending on percentage
   */
  barWidth(percentage) {
    return percentage * this.maxBarWidth;
  }

  /**
   * Creates text values on Y axis in the middle of the plot, as well as
   *  corresponding bars for each
   */
  createYAxisAndBars(width, height, yAxisWidth) {
    const middle_bar = this.svg.append('g')
      .attr('width', yAxisWidth)
      .attr('transform', `translate(${width / 2}, ${height - 50})`);

    const BAR_HEIGHT = 40;
    const BAR_OFFSET = 32;
    const VALUE_GAP = 60;
    const VALUE_OFFSET = 30;

    const values = middle_bar.selectAll('.middle-bar-value')
      .data(this.yTickValues)
      .enter();
    values.append('text')
      .attr('fill', 'whitesmoke')
      .attr('x', 0)
      .attr('y', (_, i) => -(VALUE_OFFSET + VALUE_GAP * i))
      .style('text-anchor', 'middle')
      .style('alignment-baseline', 'ideographic')
      .text(name => name);

    const distanceFromMiddle = this.yAxisWidth / 2;

    this.defaultBarColor = 'red';
    this.hoverBarColor = '#800000';

    const showBars = values.append('rect')
      .attr('fill', this.defaultBarColor)
      .attr('y', (_, i) => -(VALUE_OFFSET + VALUE_GAP * i + BAR_OFFSET))
      .attr('x', distanceFromMiddle)
      .attr('height', BAR_HEIGHT)
      .attr('width', this.barWidth(0));
      // .on('mouseover', d => handleBarMouseOver(d, middle_bar))
      // .on('mouseout', d => handleBarMouseOut(d));

    const movieBars = values.append('rect')
      .attr('fill', this.defaultBarColor)
      .attr('y', (_, i) => -(VALUE_OFFSET + VALUE_GAP * i + BAR_OFFSET))
      .attr('x', point => -(distanceFromMiddle + this.barWidth(0)))
      .attr('height', BAR_HEIGHT)
      .attr('width', this.barWidth(0));
      // .on('mouseover', d => handleBarMouseOver(d, middle_bar))
      // .on('mouseout', d => handleBarMouseOut(d));

    const getManipulableElements = selection => selection._groups[0];
    this.yTickValues.forEach((value, index) => {
      this.bars[value] = {
        movies: d3.select(getManipulableElements(movieBars)[index]),
        shows: d3.select(getManipulableElements(showBars)[index])
      }
    });
  }

  /**
   * Creates the box that appears when a bar is hovered
   */
  createTooltip() {
    const tooltipGroup = this.svg.append('g')
      .attr('id', 'age-rating-distribution-tooltip')
      .style('alignment-baseline', 'baseline')
      .style('visiblity', 'hidden');
      // .attr('class', 'tooltip');
    const tooltipBox = tooltipGroup.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('fill', 'whitesmoke')
      .attr('rx', 4);
    const tooltipText = tooltipGroup
      .append('text')
      .attr('fill', 'black')
      .style('alignment-baseline', 'hanging')
      .style('text-anchor', 'start')
      .text('');
  }

  /**
   * Creates GUI and sets the initial state of the plot
   */
  setup() {
    const main_color = 'whitesmoke';
    let [sizeX, sizeY] = [800, 530];
    this.svg.attr('viewBox', `0 0 ${sizeX} ${sizeY}`);

    this.yAxisWidth = 50;
    this.maxBarWidth = (sizeX - this.yAxisWidth) / 2 - 30;

    this.createXAxis(sizeX, sizeY, [
      [(sizeX - this.yAxisWidth) / 2 - this.maxBarWidth, 100],
      [(sizeX - this.yAxisWidth) / 2, 0]
    ]);

    this.createYAxisAndBars(sizeX, sizeY);

    const sideGap = (sizeX - this.yAxisWidth) / 2 - this.maxBarWidth;
    this.createInfoTexts(sizeX, sideGap);

    this.createTooltip();
  }

  /**
   * Updates size of elements depending on the received data and
   *  changes event functions of the tooltip to match the new data
   */
  updateData(data) {
    this.currentData = data;
    const distanceFromMiddle = this.yAxisWidth / 2;
    const transition = d3.transition(d3.easeCubicOut).duration(1000);

    const BAR_COLOR = this.defaultBarColor;
    const HOVER_COLOR = this.hoverBarColor;
    const SVG = this.svg;
    const TOOLTIP_GROUP = d3.select('#age-rating-distribution-tooltip');

    const setupTooltip = function(element, data) {
      const handleMouseOver = function(d) {
        d3.select(this)
          .transition()
          .duration(500)
          .attr('fill', HOVER_COLOR);
        const tooltipText = TOOLTIP_GROUP.select('text');
        const padding = {
          x: 10,
          y: 10
        };
        tooltipText
          .attr('x', padding.x)
          .attr('y', padding.y)
          .text((data * 100).toFixed(1) + '%');
        const textSize = tooltipText.node().getBBox();
        TOOLTIP_GROUP.select('rect')
          .attr('width', textSize.width + 2 * padding.x)
          .attr('height', textSize.height + 2 * padding.y);
        TOOLTIP_GROUP
          .style('visibility', 'visible');
        // d3.select().style('visibility', 'visible');
      };

      const handleMouseOut = function(d) {
        d3.select(this)
          .transition()
          .duration(500)
          .attr('fill', BAR_COLOR);
        const tooltipText = TOOLTIP_GROUP.select('text');
        tooltipText
          .text('');
        TOOLTIP_GROUP
          .style('visibility', 'hidden');
      };
      const handleMouseMove = function(d) {
        const [mouseX, mouseY] = d3.mouse(SVG.node());
        const margin = {
          x: 2,
          y: 2
        };
        const tooltipBox = TOOLTIP_GROUP.select('rect');
        const [x, y] = [
          mouseX + margin.x,
          mouseY - tooltipBox.node().getBBox().height - margin.y];
        TOOLTIP_GROUP.attr('transform', `translate(${x}, ${y})`);
      };

      element
        .on('mouseover', handleMouseOver)
        .on('mousemove', handleMouseMove)
        .on('mouseout', handleMouseOut);
    }

    this.yTickValues.forEach(value => {
      setupTooltip(this.bars[value].movies, data[value].movies);
      this.bars[value].movies
        .transition(transition)
        .attr('x', -(distanceFromMiddle + this.barWidth(data[value].movies)))
        .attr('width', this.barWidth(data[value].movies));

      setupTooltip(this.bars[value].shows, data[value].shows);
      this.bars[value].shows
        .transition(transition)
        .attr('width', this.barWidth(data[value].shows));
    });
  }
}

$(() => {
  const svg = d3.select('svg#age-rating-distribution-plot')
  const plot =  new AgeRatingDistributionPlot(svg);

  const stats_for_year = {};

  const selector = new TimeSelector(
    'content-time-selection',
    [2015, 2021],
    year => plot.updateData(stats_for_year[year]),
    10000,
    'int'
  );

  function showInitialPlot() {
    svg.style('opacity', 0);
    svg.transition()
      .delay(1000)
      .duration(600)
      .style('opacity', 1);
    selector.setValue(2015);
  }

  d3.csv('data/age_rating_per_year_distribution.csv')
    .then(data => {
      data.forEach(dataPoint => {
        if(stats_for_year[dataPoint.year] === undefined) {
          stats_for_year[dataPoint.year] = {};
        }
        if(stats_for_year[dataPoint.year][dataPoint['age rating']] === undefined) {
          stats_for_year[dataPoint.year][dataPoint['age rating']] = {};
        }
        stats_for_year[dataPoint.year][dataPoint['age rating']][dataPoint.category] = parseFloat(dataPoint.percentage)
      });

      showInitialPlot();
    });

  $('#content-button').click(() => {
    const year = parseInt($('#content-year-option').val());
    plot.updateData(stats_for_year[year]);
  });





  // let i = 0;
  // const iterval = setInterval(() => {
  //   console.log(1);
  //   i++;
  //   if(i >= 10) {
  //     interval.clearInterval();
  //   }
  // }, 500);



  // const dateFormatter = date => {
  //   let month = date.getMonth() + 1;
  //   const year = date.getFullYear();
  //   if(month < 10) {
  //     month = `0${month}`;
  //   }
  //   return `${month}-${year}`
  // };
  //
  // const a = new TimeSelector(
  //   'content-time-selection',
  //   [new Date('01-01-2015'), new Date('05-30-2021')],
  //   console.log,
  //   5000,
  //   'date',
  //   dateFormatter);


});
