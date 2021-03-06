class RangeSelector {
  constructor(id, points, callback, dateFormatter) {
    this.svg = d3.select(`#${id}`);
    this.id = id;
    this.points = points;
    this.selectionTools = {};
    this.percentScaling = undefined;
    this.reversedPercentScaling = undefined;
    this.selectionRect = undefined;
    this.plot = undefined;
    this.draggedSide = undefined;
    this.positionToDateScaling = undefined;
    this.callback = callback;
    this.dateFormatter = dateFormatter;
    this.setup();
  }


  /**
   * Changes the size and position of the selection rectangle (the red one)
   */
  updateSelectionRect() {
    const x = Math.min(
      this.selectionTools.left.line.attr('x1'),
      this.selectionTools.right.line.attr('x1')
    );
    const width = Math.abs(
      this.selectionTools.right.line.attr('x1') -
      this.selectionTools.left.line.attr('x1')
    );
    this.selectionRect
      .attr('x', x)
      .attr('width', width);
  }

  /**
   * Gets the position of a side based on the position of its respective
   *  selecton line.
   */
  getPosition(side) {
    return parseFloat(this.selectionTools[side].line.attr('x1'));
  }

  /**
   * Converts the position of selection tools to dates and calls the callback
   *  with these dates as parameters
   */
  emitPosition() {
    // For some reason d3 is messing up with the same reference, so the result
    //  has to be cloned...
    let result = this.positionToDateScaling(this.getPosition('left'));
    const lowerBound = new Date(result.getTime());
    result = this.positionToDateScaling(this.getPosition('right'));
    const upperBound = new Date(result.getTime());

    this.callback(lowerBound, upperBound);
  }

  /**
   * Moves the selection tool of this side to the specified position, while
   *  also keeping the minimum specified distance from the other side if
   *  specified
   */
  moveSelectionTool(side, percentage, minDistanceCheck=false) {
    percentage = Math.max(0, Math.min(1, percentage));

    const tools = this.selectionTools[side];
    let position = this.percentScaling(percentage);

    if(minDistanceCheck) {
      const MIN_DISTANCE = 40;
      switch(side) {
        case 'right':
          position = Math.max(
            position,
            this.getPosition('left') + MIN_DISTANCE
          );
          break;
        case 'left':
          position = Math.min(
            position,
            this.getPosition('right') - MIN_DISTANCE
          );
          break;
        default:
          console.log('Trying to move unsupported side');
      }
    }

    tools.line
      .attr('x1', position)
      .attr('x2', position);

    tools.triangle
      .attr('transform', `translate(${position} 18) rotate(180)`);

    tools.display
      .attr('transform', `translate(${position} 7)`)

    tools.displayText
      .attr('transform', `translate(${position} 8)`);

    tools.displayText
      .text(this.dateFormatter(this.positionToDateScaling(position)));

    this.updateSelectionRect();
  }

  /**
   * Callback when mouse is pressed on SVG element. It checks if the selector is
   *  close and activates selection of that side if that's the case
   */
  handleMouseDown() {
    const [mouseX, mouseY] = d3.mouse(this.plot.node());

    if(mouseY <= 40) {
      const MAX_CLICK_DISTANCE = 10;
      let leastDistance = MAX_CLICK_DISTANCE;
      let currentClosest = '';
      ['left', 'right'].forEach(side => {
        const dist = Math.abs(mouseX - this.selectionTools[side].line.attr('x1'));
        if(dist < leastDistance) {
          leastDistance = dist;
          currentClosest = side;
        }
      });
      if(currentClosest !== '') {
        this.draggedSide = currentClosest;
      }
    }
  }

  /**
   * Callback when mouse is moved. If the selection is active, the selection
   *  tools for the side for which selection is active will be moved
   */
  handleMouseMove() {
    if(this.draggedSide !== undefined) {
      const [mouseX, _] = d3.mouse(this.plot.node());

      this.moveSelectionTool(
        this.draggedSide, this.reversedPercentScaling(mouseX), true);
    }
  }

  /**
   * Callback for the release of mouse click in SVG element. If the selection
   *  was active, emits the value and deactivates selection.
   */
  handleMouseUp() {
    if(this.draggedSide !== undefined) {
      this.draggedSide = undefined;
      this.emitPosition();
    }
  }

  /**
   * Creates GUI elements of the plot and sets the proper callbacks.
   */
  createPlot(width, heihgt, marginX) {
    this.points.sort((a, b) => a.month - b.month);

    const minMonth = this.points[0].month;
    const maxMonth = this.points[this.points.length - 1].month;

    let [minCount, maxCount] = [Number.MAX_SAFE_INTEGER, 0];
    for(let i = 0; i < this.points.length; i++) {
      const count = this.points[i].count;
      minCount = Math.min(minCount, count);
      maxCount = Math.max(maxCount, count);
    }

    const plotBounds = [marginX, width - marginX];

    const timeBounds = [minMonth, maxMonth];

    const scaleX = d3.scaleTime()
      .domain(timeBounds)
      .range(plotBounds);

    this.positionToDateScaling = d3.scaleTime()
      .domain(plotBounds)
      .range(timeBounds);

    this.percentScaling = d3.scaleLinear()
      .domain([0, 1])
      .range(plotBounds);

    this.reversedPercentScaling = d3.scaleLinear()
      .domain(plotBounds)
      .range([0, 1]);

    const scaleY = d3.scaleLinear()
      .domain([0, maxCount])
      .range([50, 30]);

    const area = d3.area()
      .curve(d3.curveCatmullRom.alpha(0.5))
      .x(d => scaleX(d.month))
      .y0(50)
      .y1(d => scaleY(d.count));

    this.plot = this.svg.append('path')
      .data([this.points])
      .attr('fill', 'whitesmoke')
      .attr('d', area);

    this.selectionRect = this.svg.append('rect')
      .attr('x', 100)
      .attr('y', 20)
      .attr('width', 100)
      .attr('height', 30)
      .attr('fill', 'rgba(255, 0, 0, .2)');

    const leftLine = this.svg.append('line')
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', 17)
      .attr('y2', 50)
      .attr('stroke', 'whitesmoke')
      .style('stroke-dasharray', '3, 1');

    const rightLine = this.svg.append('line')
      .attr('x1', 500)
      .attr('x2', 500)
      .attr('y1', 17)
      .attr('y2', 50)
      .attr('stroke', 'whitesmoke')
      .style('stroke-dasharray', '3, 1');

    const leftTriangle = this.svg.append('path')
      .attr('d', d3.symbol().type(d3.symbolTriangle).size(20))
      .attr('fill', 'whitesmoke')
      .attr('transform', 'translate(100 18) rotate(180)');

    const rightTriangle = this.svg.append('path')
      .attr('d', d3.symbol().type(d3.symbolTriangle).size(20))
      .attr('fill', 'whitesmoke')
      .attr('transform', 'translate(200 18) rotate(180)');

    const leftDisplay = this.svg.append('rect')
      .attr('x', -20)
      .attr('y', -3)
      .attr('width', 40)
      .attr('height', 13)
      .attr('fill', 'white')
      .attr('rx', 4)
      .attr('transform', 'translate(0 0)');

    const rightDisplay = this.svg.append('rect')
      .attr('x', -20)
      .attr('y', -3)
      .attr('width', 40)
      .attr('height', 13)
      .attr('fill', 'white')
      .attr('rx', 4)
      .attr('transform', 'translate(0 0)');

    const leftDisplayText = this.svg.append('text')
      .attr('fill', 'black')
      .style('font-size', '.39em')
      .style('user-select', 'none')
      .style('text-anchor', 'middle')
      .style('alignment-baseline', 'hanging')
      .text('01-01-1970');

    const rightDisplayText = this.svg.append('text')
      .attr('fill', 'black')
      .style('font-size', '.39em')
      .style('user-select', 'none')
      .style('text-anchor', 'middle')
      .style('alignment-baseline', 'hanging')
      .text('01-01-1970');

    this.selectionTools = {
      left: {
        displayText: leftDisplayText,
        display: leftDisplay,
        line: leftLine,
        triangle: leftTriangle
      },
      right: {
        displayText: rightDisplayText,
        display: rightDisplay,
        line: rightLine,
        triangle: rightTriangle
      }
    };

    this.moveSelectionTool('left', 0);
    this.moveSelectionTool('right', 1);

    this.svg
      .selectAll('text.years')
      .data([2015, 2016, 2017, 2018, 2019, 2020, 2021])
      .enter()
      .append('text')
        .attr('class', 'years')
        .attr('fill', 'whitesmoke')
        .attr('x', year => scaleX(new Date(`01-01-${year}`)))
        .attr('y', 54)
        .style('font-size', '.5em')
        .style('user-select', 'none')
        .style('text-anchor', 'middle')
        .style('alignment-baseline', 'hanging')
        .text(year => year);

    this.svg
      .on('mousedown', () => this.handleMouseDown());

    d3.select('body')
      .on(`mousemove.${this.id}`, () => this.handleMouseMove())
      .on(`mouseup.${this.id}`, () => this.handleMouseUp());

    this.emitPosition();
  }

  /**
   * Sets the size of the SVG and initiates GUI creation procedure
   */
  setup() {
    const [sizeX, sizeY] = [500, 65];
    const [marginX] = [30];
    this.svg.attr('viewBox', `0 0 ${sizeX} ${sizeY}`);

    this.createPlot(sizeX, sizeY, marginX);
  }
}
