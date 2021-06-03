class SequentialColorPicker {
  constructor(colors) {
    this.colors = colors;
    this.index = 0;
  }

  getColor() {
    const color = this.colors[this.index];
    this.index = (this.index + 1) % this.colors.length;
    return color;
  }
}

class WordCloud {
  constructor(id) {
    this.id = id;
    this.svg = d3.select(`#${id}`);
    this.svgSize = undefined;
    this.processingId = 0;
    this.activeWordGroup = undefined;
    this.setup();
  }

  setup() {
    const main_color = 'whitesmoke';
    let [sizeX, sizeY] = [700, 500];
    this.svg.attr('viewBox', `0 0 ${sizeX} ${sizeY}`);
    this.svgSize = {
      x: sizeX,
      y: sizeY
    };
  }

  drawWords(words, layout, processId) {
    if(processId === this.processingId) {
      let appearTransition = d3.transition();

      if(this.activeWordGroup !== undefined) {
        appearTransition = appearTransition.delay(1000);
        this.activeWordGroup
          .transition()
          .duration(1000)
          .style('opacity', 0)
          .remove();
      }
      const colorPicker = new SequentialColorPicker([
        'darkred', '#ff0000', 'whitesmoke', 'gray', '#ffe6e6']);
      const maxSize = d3.max(words, d => d.size);
      const newGroup = this.svg
        .append('g')
        .attr('transform', `translate(${layout.size()[0] / 2} ${layout.size()[1] / 2})`);
      this.activeWordGroup = newGroup;
      this.activeWordGroup
        .selectAll('text')
          .data(words)
          .enter()
          .append('text')
            .attr('text-anchor', 'middle')
            .attr('fill', (d, i) => colorPicker.getColor())
            .attr('transform', d =>
              `translate(${d.x}, ${d.y}) rotate(${d.rotate})`)
            .style('opacity', 0)
            .style('font-size', d => `${d.size}px`)
            .text(d => d.text)
            .transition(appearTransition)
            .duration(d =>  1000 + (1 - d.size / maxSize) * 5000)
            .style('opacity', 1);
    }
  }

  updateWords(words) {
    const layout = d3.layout.cloud()
      .size([this.svgSize.x, this.svgSize.y])
      .words(words.map(w => ({
        text: w
      })))
      .padding(10)
      .rotate((d, i) => /*~~(Math.random() * 2)*/ (i % 2) * 90)
      .fontSize((d, i) => Math.max(15, 60 - i * 3))
      .on('end', d => this.drawWords(d, layout, this.processingId));
    this.processingId++;
    layout.start();
  }
}

$(() => {
  const NUMBER_OF_WORDS = 30;
  const month_names = [
    "January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"];

  const cloud = new WordCloud(
    'topic-wordcloud');


  let words = {};
  for(let i = 1; i <= 12; i++) {
    words[i] = [];
  }

  const selector = new TimeSelector(
    'word-cloud-time-selection',
    [1, 12],
    month => cloud.updateWords(words[month]),
    60000,
    'int',
    month_int => month_names[month_int - 1]
  );

  d3.json('data/keywords_per_month.json').then(data => {
    Object.keys(data).map(key => {
      let pairs = Object.entries(data[key]);
      pairs.sort((a, b) => b[1] - a[1]);

      words[key] = pairs.map(x => x[0]).slice(0, NUMBER_OF_WORDS).map(x => x[0].toUpperCase() + x.slice(1));
    });

    selector.setValue(1);
  });
});
