const TICKS_PER_SECOND = 30;

class TimeSelector {
  constructor(id, interval, onPercentageSelectedCallback, traverseTime, scalingType, dateFormatter) {
    this.baseEl = d3.select(`#${id}`);
    this.dragging = false;
    this.interval = interval;
    this.onPercentageSelectedCallback = onPercentageSelectedCallback;
    this.dateFormatter = dateFormatter;
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

  increasePercentage() {
    const oldPercentage = this.percentage;
    this.setPercentage(oldPercentage + this.increasePerTick, !this.dragging);
    this.emitPercentage(this.percentage);
  }

  setVisualPercentage(percentage) {
    const size = percentage * this.maxBarWidth;
    this.plotHandle.attr('cx', size);
    this.plotBar.attr('width', size);
    const value = this.scaling(percentage);
    this.selectionText.text(this.createText(value));
  }

  setPercentage(percentage, updateVisually=true) {
    percentage = Math.max(0, Math.min(1, percentage));
    this.percentage = percentage;
    if(updateVisually) {
      this.setVisualPercentage(percentage);
    }
  }

  getDisplayableValue(value) {
    if(this.scalingType == 'date') {
      return this.dateFormatter(value);
    }
    else {
      return value + '';
    }
  }

  getMousePercentage() {
    const [mouseX, _] = d3.mouse(this.plotBar.node());
    const percentage = Math.max(0, Math.min(1, mouseX / this.maxBarWidth));
    return percentage;
  }

  emitPercentage(percentage) {
    const value = this.scaling(percentage);
    if(value != this.lastEmit) {
      this.onPercentageSelectedCallback(value);
    }
    this.lastEmit = value;
  }

  createText(current) {
    return `${this.getDisplayableValue(current)} / ${this.getDisplayableValue(this.interval[1])}`;
  }

  play() {
    this.isPlaying = true;
    this.displayCorrectControlIcon();
    this.playLoop = setInterval(() => this.loopTick(), 1000 / TICKS_PER_SECOND);
  }

  pause() {
    this.isPlaying = false;
    this.displayCorrectControlIcon();
    clearInterval(this.playLoop);
  }

  loopTick() {
    this.increasePercentage();
    if(this.percentage == 1) {
      this.pause();
    }
  }

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

  displayCorrectControlIcon() {
    this.controlButton.attr('class', `bi bi-${this.isPlaying ? 'pause' : 'play'}-fill`);
  }

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
      .on('mousedown', () => {
        this.dragging = true;
      });

    this.plotBar = barGroup.append('rect')
      .attr('x', 0)
      .attr('y', -BAR_HEIGHT / 2)
      .attr('height', BAR_HEIGHT)
      .attr('width', 0)
      .attr('fill', 'red')
      .on('mousedown', () => {
        this.dragging = true;
      });

    this.plotHandle = barGroup.append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', 9)
      .attr('fill', 'red')
      .style('cursor', 'pointer')
      .on('mousedown', () => {
        this.dragging = true;
      });

    barSvg
      .on('mouseup', () => {
        if(this.dragging) {
          this.dragging = false;
          this.emitPercentage(this.getMousePercentage());
          this.setPercentage(this.getMousePercentage());
        }
      })
      .on('mousemove', () => {
        if(this.dragging) {
          this.setVisualPercentage(this.getMousePercentage());
        }
      })
      .on('mouseleave', () => {
        if(this.dragging) {
          this.dragging = false;
          this.emitPercentage(this.getMousePercentage());
          this.setPercentage(this.getMousePercentage());
        }
      });

    this.selectionText = barGroup.append('text')
      .attr('x', 2)
      .attr('y', BAR_HEIGHT + 10)
      .attr('fill', 'whitesmoke')
      .attr('font-size', '1.3em')
      .style('alignment-baseline', 'hanging')
      .style('text-anchor', 'start')
      .text(this.createText(this.interval[0]));


    const plotDesc = this.baseEl.attr('plot-description');
    if(plotDesc !== undefined) {
      rowDiv.append('div')
        .attr('class', 'col-md-7 col-12 my-auto plot-description')
        .html(`<i class="bi bi-info-circle-fill"></i> ${plotDesc}`);
    }
  }
}
