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

  setup(wods) {
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
            .attr('font-size', d => `${d.size}px`)
            .attr('text-anchor', 'middle')
            .attr('fill', (d, i) => colorPicker.getColor())
            .attr('transform', d =>
              `translate(${d.x}, ${d.y}) rotate(${d.rotate})`)
            .style('opacity', 0)
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
      .fontSize((d, i) => Math.max(5, 60 - i * 3))
      .on('end', d => this.drawWords(d, layout, this.processingId));
    this.processingId++;
    layout.start();
  }
}

$(() => {

  const words = [
    'Drama', 'Teens', 'Teenagers', 'Romance', 'College', 'Humour', 'Mission',
    'Car', 'Graduation', 'College', 'Summer', 'Klara', 'Pera', 'Mara', 'Sara',
    'Tara', 'Sanja', 'Marko', 'Prijestolonaslednikovica'
  ];
  const cloud = new WordCloud(
    'topic-wordcloud');

  cloud.updateWords(words);


  $('#btn-1').click(() => {
    cloud.updateWords([
      'Olja', 'Pera', 'Mica', 'Stefan', 'Marko', 'Serafina', 'Ljubivoj', 'Nikola',
      'Sanja', 'Marijana', 'Merima', 'Ostoja'
    ]);
  });
});
