/**
 * Element wise array equality check
 */
function arrayEquals(a, b) {
  return Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((val, index) => val === b[index]);
}

class SimpleBarPlot {
  constructor(id, initialLabels, width=600, height=400, barWidth=100) {
    this.id = id;
    this.svg = d3.select(`svg#${id}`);
    this.availableHeight = undefined;
    this.bars = undefined;
    this.barTexts = undefined;
    this.labels = undefined;
    this.initialized = false;
    this.setup(width, height, initialLabels, barWidth);
  }

  /**
   * Updates the text of the labels under the bars to the given values.
   *  It is assumed that the number of passed labels is equal to the number of
   *  texts that hold them.
   */
  updateLabels(labels) {
    if(!this.initialized || arrayEquals(this.labels, labels)) {
      return;
    }

    const t = d3.transition().duration(300);
    for(let i = 0; i < this.labelTexts.length; i++) {

      if(labels[i].length > 13) {
        labels[i] = labels[i].slice(0, 13) + '...';
      }
      this.labelTexts[i]
        .transition(t)
        .style('opacity', 0)
        .transition()
        .text(labels[i])
        .transition(t)
        .style('opacity', 1);
    }
    this.labels = labels;
  }

  /**
   * Updates the size of the bars and the values of the labels indicating the size of the
   *  bars to match the given data. It is assumed that the number of passed data instances
   *  is equal to the number of bars.
   */
  updateData(data) {
    if(!this.initialized) {
      return;
    }

    let max = 1;
    for(const n of data) {
      max = Math.max(max, n);
    }
    const scaling = d3.scaleLinear()
      .domain([0, max])
      .range([0, this.availableHeight]);

    for(let i = 0; i < data.length; i++) {

      const height = scaling(data[i])
      const t = d3.transition()
        .duration(1000);
      this.bars[i]
        .transition(t)
        .attr('y', -height)
        .attr('height', height);

      this.barTexts[i]
        .transition(t)
        .attr('transform', `translate(0 ${-height})`)
        .tween('text', () => {
          const textObj = this.barTexts[i];
          const scale = d3.scaleLinear()
            .domain([0, 1])
            .range([+textObj.text(), data[i]]);
          return t => {
            textObj.text(Math.round(scale(t)));
          }
        });
    }
  }

  /**
   * Creates GUI elements of the plot
   */
  setup(width, height, labels, barWidth) {
    const hMargin = 50;
    const [sizeX, sizeY] = [width, height];
    this.svg.attr('viewBox', `0 0 ${sizeX} ${sizeY}`);

    this.availableHeight = sizeY - 80;

    const group = this.svg.append('g')
      .attr('transform', `translate(0 ${sizeY - 40})`);

    const n = labels.length;
    const BAR_WIDTH = barWidth;
    const BAR_MARGIN = (sizeX - 2 * hMargin - n * BAR_WIDTH) / n;

    const barCenter = i => hMargin + (.5 + i) * (BAR_MARGIN + BAR_WIDTH);

    const primaryColor = '#DB0000';

    const bars = group.selectAll('rect.simple-plot-bars')
      .data(labels)
      .enter()
      .append('rect')
        .attr('fill', primaryColor)
        .attr('x', (d, i) => barCenter(i) - .5 * BAR_WIDTH)
        .attr('y', 0)
        .attr('width', BAR_WIDTH)
        .attr('height', 0)
        .attr('class', 'simple-plot-bars');

    const barTexts = group.selectAll('text.bar-text')
      .data(labels)
      .enter()
      .append('text')
        .attr('fill', 'white')
        .attr('x', (d, i) => barCenter(i))
        .attr('y', -13)
        .attr('class', 'bar-text')
        .style('font-size', '1.8em')
        .style('user-select', 'none')
        .style('text-anchor', 'middle')
        .text('0');

    this.bars = bars._groups[0].map(x => d3.select(x));
    this.barTexts = barTexts._groups[0].map(x => d3.select(x));

    group.append('line')
      .attr('x1', hMargin)
      .attr('x2', sizeX - hMargin)
      .attr('y1', 0)
      .attr('y2', 0)
      .attr('class', 'simple-plot-axis')
      .attr('stroke', 'white');

    const labelTexts = group.selectAll('text.label-text-simple-plot')
      .data(labels)
      .enter()
      .append('text')
        .attr('fill', 'white')
        .attr('y', 10)
        .attr('x', (d, i) => barCenter(i))
        .attr('class', 'label-text-simple-plot')
        .style('font-size', '2em')
        .style('user-select', 'none')
        .style('text-anchor', 'middle')
        .style('alignment-baseline', 'hanging')
        .text(d => d);
    this.labelTexts = labelTexts._groups[0].map(x => d3.select(x));

    this.initialized = true;
  }
}
