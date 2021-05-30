class RangeSelector {
  constructor(id, points, callback) {
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
    this.setup();
  }


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

  getPosition(side) {
    return parseFloat(this.selectionTools[side].line.attr('x1'));
  }

  emitPosition() {
    // For some reason d3 is messing up with the same reference, so the result
    //  has to be cloned...
    let result = this.positionToDateScaling(this.getPosition('left'));
    const lowerBound = new Date(result.getTime());
    result = this.positionToDateScaling(this.getPosition('right'));
    const upperBound = new Date(result.getTime());

    this.callback(lowerBound, upperBound);
  }

  moveSelectionTool(side, percentage, minDistanceCheck=false) {
    percentage = Math.max(0, Math.min(1, percentage));

    const tools = this.selectionTools[side];
    let position = this.percentScaling(percentage);

    if(minDistanceCheck) {
      const MIN_DISTANCE = 20;
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
      .attr('transform', `translate(${position} 8) rotate(180)`);

    this.updateSelectionRect();
  }


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

  handleMouseMove() {
    if(this.draggedSide !== undefined) {
      const [mouseX, _] = d3.mouse(this.plot.node());

      this.moveSelectionTool(
        this.draggedSide, this.reversedPercentScaling(mouseX), true);
    }
  }

  handleMouseUp() {
    if(this.draggedSide !== undefined) {
      this.draggedSide = undefined;
      this.emitPosition();
    }
  }

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
      .range([40, 20]);

    const area = d3.area()
      .curve(d3.curveCatmullRom.alpha(0.5))
      .x(d => scaleX(d.month))
      .y0(40)
      .y1(d => scaleY(d.count));

    this.plot = this.svg.append('path')
      .data([this.points])
      .attr('fill', 'whitesmoke')
      .attr('d', area);

    this.selectionRect = this.svg.append('rect')
      .attr('x', 100)
      .attr('y', 10)
      .attr('width', 100)
      .attr('height', 30)
      .attr('fill', 'rgba(255, 0, 0, .2)');

    const leftLine = this.svg.append('line')
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', 7)
      .attr('y2', 40)
      .attr('stroke', 'whitesmoke')
      .style('stroke-dasharray', '3, 1');

    const rightLine = this.svg.append('line')
      .attr('x1', 500)
      .attr('x2', 500)
      .attr('y1', 7)
      .attr('y2', 40)
      .attr('stroke', 'whitesmoke')
      .style('stroke-dasharray', '3, 1');

    const leftTriangle = this.svg.append('path')
      .attr('d', d3.symbol().type(d3.symbolTriangle).size(20))
      .attr('fill', 'whitesmoke')
      .attr('transform', 'translate(100 8) rotate(180)');

    const rightTriangle = this.svg.append('path')
      .attr('d', d3.symbol().type(d3.symbolTriangle).size(20))
      .attr('fill', 'whitesmoke')
      .attr('transform', 'translate(200 8) rotate(180)');

    this.selectionTools = {
      left: {
        line: leftLine,
        triangle: leftTriangle
      },
      right: {
        line: rightLine,
        triangle: rightTriangle
      }
    };

    this.moveSelectionTool('left', 0);
    this.moveSelectionTool('right', 1);

    this.svg
      .selectAll('text')
      .data([2015, 2016, 2017, 2018, 2019, 2020, 2021])
      .enter()
      .append('text')
        .attr('fill', 'whitesmoke')
        .attr('x', year => scaleX(new Date(`01-01-${year}`)))
        .attr('y', 44)
        .style('font-size', '.5em')
        .style('text-anchor', 'middle')
        .style('alignment-baseline', 'hanging')
        .text(year => year);

    this.svg
      .on('mousedown', () => this.handleMouseDown());

    d3.select('body')
      .on(`mousemove.${this.id}`, () => this.handleMouseMove())
      .on(`mouseup.${this.id}`, () => this.handleMouseUp());
  }

  setup() {
    const [sizeX, sizeY] = [500, 55];
    const [marginX] = [10];
    this.svg.attr('viewBox', `0 0 ${sizeX} ${sizeY}`);

    this.createPlot(sizeX, sizeY, marginX);
  }
}

$(() => {
  d3.csv('data/release_density_per_month.csv', data => {
    const points = [];

    for(let i = 0; i < data.length; i++) {
      points.push({
        month: new Date(data[i]['release month']),
        count: data[i]['count']
      });
    }

    const selector = new RangeSelector(
      'exporatory-time-selection',
      points,
      (left, right) => console.log(`${left}, ${right}`));
  });
});
