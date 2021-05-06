$(() => {
  let words = [
    'Drama', 'Teens', 'Teenagers', 'Romance', 'College', 'Humour', 'Mission',
    'Car', 'Graduation', 'College', 'Summer']
  let svg = d3.select('svg#topic-wordcloud')
  generateWordCloud(svg, words)
})

function generateWordCloud(svg, words) {
  const main_color = 'whitesmoke'
  let [sizeX, sizeY] = [700, 500]
  svg.attr('viewBox', `0 0 ${sizeX} ${sizeY}`)

  class ColorPicker {
    constructor(colors) {
      this.colors = colors
      this.index = 0
    }

    getColor() {
      const color = this.colors[this.index]
      this.index = (this.index + 1) % this.colors.length
      return color
    }
  }

  var layout = d3.layout.cloud()
    .size([sizeX, sizeY])
    .words(words.map(w => ({
      text: w
    })))
    .padding(10)
    .fontSize((d, i) => Math.max(0, 60 - i * 5))
    .on("end", draw)
  layout.start()

  function draw(words) {
    const colorPicker = new ColorPicker(['red', '#ff0000', 'whitesmoke', 'gray', '#ffe6e6'])
    svg
      .append("g")
        .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
        .selectAll("text")
          .data(words)
          .enter()
          .append('text')
            .attr('font-size', d => `${d.size}px`)
            .attr('text-anchor', 'middle')
            .attr('fill', (d, i) => colorPicker.getColor())
            .attr('transform', d =>
              `translate(${d.x}, ${d.y}) rotate(${d.rotate})`)
            .text(d => d.text)
  }
}
