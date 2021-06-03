const TICKS_PER_SECOND = 30;

class TimeSelector {
  /**
   * Creates media player like time selector. Parameters of the constructor are
   * the following:
   *  - id: id of the div where time selector should be placed
   *  - interval: two element array indicating min and max value of the interval
   *  - onPercentageSelectedCallback: function of a single parameter that is
   *      when a new is selected or during automatic playing
   *  - traverseTime: time in milliseconds that should take automatic playing
   *      to go from beginning to end. This is used to calculate the speed of
   *      movement and the whole sequence may take more or less time than indicated.
   *  - scalingType: type of interval (supported: date, int, float)
   *  - dataFormatter: function that maps object to string. If the function
   *      is not specified default javascript's 'toString' will we invoced
   */
  constructor(id, interval, onPercentageSelectedCallback,
      traverseTime, scalingType, dataFormatter) {
    this.baseEl = d3.select(`#${id}`);
    this.id = id;
    this.dragging = false;
    this.interval = interval;
    this.onPercentageSelectedCallback = onPercentageSelectedCallback;
    this.dataFormatter = dataFormatter;
    this.scalingType = scalingType;
    const totalTicks = traverseTime / 1000 * TICKS_PER_SECOND;
    this.increasePerTick = 1 / totalTicks;
    switch(this.scalingType) {
      case 'date':
        this.scaling = d3.scaleTime()
          .domain([0, 1])
          .range(interval);
        break;
      case 'int':
        this.scaling = d3.scaleLinear()
          .domain([0, 1])
          .rangeRound(interval);
        break;
      case 'float':
        this.scaling = d3.scaleLinear()
          .domain([0, 1])
          .range(interval);
        break;
      default:
        console.log('Unsupported scaling type!');
    }
    this.createGUI();
    this.isPlaying = false;
    this.lastEmit = undefined;
  }

  /**
   * Increase percentage by a value of a tick and update it visually if
   *  user is not dragging the bar.
   */
  increasePercentage() {
    const oldPercentage = this.percentage;
    this.setPercentage(oldPercentage + this.increasePerTick, !this.dragging);
    this.emitPercentage(this.percentage);
  }

  /**
   * Sets size and position of play bar and play handle to match percentage
   */
  setVisualPercentage(percentage) {
    const size = percentage * this.maxBarWidth;
    this.plotHandle.attr('cx', size);
    this.plotBar.attr('width', size);
    const value = this.scaling(percentage);
    this.selectionText.text(this.createText(value));
  }

  /**
   * Sets percentage while at the same time being cautious of its domain
   *  and does visual update depending on the value of parameter updateVisually
   */
  setPercentage(percentage, updateVisually=true) {
    percentage = Math.max(0, Math.min(1, percentage));
    this.percentage = percentage;
    if(updateVisually) {
      this.setVisualPercentage(percentage);
    }
  }

  /**
   * Maps value to string properly depending on scalingType
   */
  getDisplayableValue(value) {
    if(this.dataFormatter !== undefined){
      return this.dataFormatter(value);
    }
    else {
      return value + '';
    }
  }

  /**
   * Gets mouse position relative to the bar and translates it into percentage
   */
  getMousePercentage() {
    const [mouseX, _] = d3.mouse(this.plotBar.node());
    const percentage = Math.max(0, Math.min(1, mouseX / this.maxBarWidth));
    return percentage;
  }

  /**
   *  Calls the callback and puts the value aside so it can check later not to
   *    call the callback with the same value
   */
  invokeCallback(value) {
    if(value != this.lastEmit) {
      this.onPercentageSelectedCallback(value);
    }
    else {
      console.log('Same', this.lastEmit);
    }
    switch(this.scalingType) {
      case 'date':
        this.lastEmit = new Date(value.getTime());
        break;
      default:
        this.lastEmit = value;
    }

  }

  /**
  * Get proper value depending on percentage and calls invokeCallback to take
  *   care of notifying application
  */
  emitPercentage(percentage) {
    const value = this.scaling(percentage);
    this.invokeCallback(value);
  }

  /**
   * Sets percentage to point to given value and invokes the callback
   */
  setValue(value) {
    const percentage = this.scaling.invert(value);
    if(percentage >= 0 && percentage <= 1) {
      this.setPercentage(percentage, true);
      this.invokeCallback(value);
    }
  }

  /**
   *  Formats the text that is displayed under the bar, for the given value
   *    passed as current
   */
  createText(current) {
    return `${this.getDisplayableValue(current)}`;
  }

  /**
   * Starts playing transition automatically
   */
  play() {
    this.isPlaying = true;
    this.displayCorrectControlIcon();
    this.playLoop = setInterval(() => this.loopTick(), 1000 / TICKS_PER_SECOND);
  }

  /**
   * Stops playing automatic transition
   */
  pause() {
    this.isPlaying = false;
    this.displayCorrectControlIcon();
    clearInterval(this.playLoop);
  }

  /**
   * Does a single tick of automatic transition
   */
  loopTick() {
    this.increasePercentage();
    if(this.percentage == 1) {
      this.pause();
    }
  }

  /**
   * Handles play/pause button being clicked
   */
  handleControlButtonClick() {
    if(this.isPlaying) {
      this.pause();
    }
    else {
      if(this.percentage == 1) {
        this.percentage = 0;
      }
      this.play();
    }
  }

  /**
   * Display correct control button (play/pause) depending on the state of the
   *  automatic transition
   */
  displayCorrectControlIcon() {
    this.controlButton.attr('class', `bi bi-${this.isPlaying ? 'pause' : 'play'}-fill`);
  }

  /**
   * Starts dragging mode
   */
  handleDragStart() {
    this.dragging = true;
  }

  /**
   * Sets visuals and emits data when dragging is over, also ends dragging mode
   */
  handleDragOver() {
    if(this.dragging) {
      this.dragging = false;
      this.emitPercentage(this.getMousePercentage());
      this.setPercentage(this.getMousePercentage());
    }
  }

  /**
   * Does visual update if possible during dragging of the slider
   */
  handleDragMove() {
    if(this.dragging) {
      this.setVisualPercentage(this.getMousePercentage());
    }
  }

  /**
   * Creates GUI elements and setups initial state
   */
  createGUI() {
    const rowDiv = this.baseEl.append('div')
      .attr('class', 'time-selector row');

    const controlButtonDiv = rowDiv.append('div')
      .attr('class', 'col-md-1 col-3 play-control my-auto');

    this.controlButton = controlButtonDiv.append('i')
      .attr('class', 'bi bi-play-fill')
      .style('cursor', 'pointer');

    this.controlButton.on('click', () => this.handleControlButtonClick());

    const barDiv = rowDiv.append('div')
      .attr('class', 'col-md-4 col-9 my-auto')
      .style('text-align', 'left');

    const svgSize = {
      x: 500,
      y: 100
    };

    const barSvg = barDiv.append('svg')
      .style('width', '100%')
      .attr('viewBox', `0 0 ${svgSize.x} ${svgSize.y}`);

    const BAR_HEIGHT = 8;
    const BAR_WIDTH = 480;
    this.maxBarWidth = BAR_WIDTH;

    const barGroup = barSvg.append('g')
      .attr('transform',
        `translate(${(svgSize.x - BAR_WIDTH) /2}, ${svgSize.y / 2})`);

    this.percentage = 0;

    const backgroundBar = barGroup.append('rect')
      .attr('x', 0)
      .attr('y', -BAR_HEIGHT / 2)
      .attr('height', BAR_HEIGHT)
      .attr('width', BAR_WIDTH)
      .attr('fill', 'rgba(255, 255, 255, .5)')
      .on('mousedown', () => this.handleDragStart());

    this.plotBar = barGroup.append('rect')
      .attr('x', 0)
      .attr('y', -BAR_HEIGHT / 2)
      .attr('height', BAR_HEIGHT)
      .attr('width', 0)
      .attr('fill', '#DB0000')
      .on('mousedown', () => this.handleDragStart());

    this.plotHandle = barGroup.append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', 9)
      .attr('fill', '#DB0000')
      .style('cursor', 'pointer')
      .on('mousedown', () => this.handleDragStart());

    d3.select('body')
      .on(`mouseup.${this.id}`, () => this.handleDragOver())
      .on(`mousemove.${this.id}`, () => this.handleDragMove());

    this.selectionText = barGroup.append('text')
      .attr('x', 2)
      .attr('y', BAR_HEIGHT + 10)
      .attr('fill', 'whitesmoke')
      .attr('font-size', '1.3em')
      .style('alignment-baseline', 'hanging')
      .style('text-anchor', 'start')
      .style('user-select', 'none')
      .text(this.createText(this.interval[0]));

    const plotDesc = this.baseEl.attr('plot-description');
    if(plotDesc !== undefined) {
      rowDiv.append('div')
        .attr('class', 'col-md-1 col-1 my-auto plot-description')
        .style('text-align', 'right')
        .html('<i class="bi bi-info-circle-fill"></i>');
      rowDiv.append('div')
        .attr('class', 'col-md-6 col-11 my-auto plot-description')
        .html(plotDesc);
    }
  }
}

// $(() => {
//   new TimeSelector(
//     'test-player',
//     [new Date('04-14-2015'), new Date('05-20-2020')],
//     console.log,
//     10000,
//     'date',
//     date => `${date.getDate()}. ${date.getMonth() + 1}. ${date.getFullYear()}.`
//   )
// });
