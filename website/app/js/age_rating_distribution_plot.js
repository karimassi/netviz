const zip = (arr, ...arrs) => {
  return arr.map((val, i) => arrs.reduce((a, arr) => [...a, arr[i]], [val]));
}

$(() => {
  let svg = d3.select('svg#age-rating-distribution-plot')
  let data = {
    'names': ['R+', '7+', '13+', '16+', '18+'],
    'values': {
      'shows': [0.1, 0.2, 0.2, 0.4, 0.1],
      'movies': [0, 0.15, 0.25, 0.1, 0.5]
    }
  }
  createAgeRatingDistriutionPlot(svg, data)
})

function createAgeRatingDistriutionPlot(svg, data) {
  const main_color = 'whitesmoke';
  let [sizeX, sizeY] = [700, 500]
  svg.attr('viewBox', `0 0 ${sizeX} ${sizeY}`)

  const MID_SIZE = 50
  const MAX_BAR_WIDTH = (sizeX - MID_SIZE) / 2 - 30

  let axis = svg.append('g')
    .attr('width', sizeX)
    .attr('transform', `translate(0, ${sizeY - 50})`)

  axis.append('line')
    .attr('stroke', main_color)
    .attr('x1', 0)
    .attr('y1', 0)
    .attr('x2', sizeX)
    .attr('y2', 0)

  const ticksX = [
    [(sizeX - MID_SIZE) / 2 - MAX_BAR_WIDTH, 100],
    [(sizeX - MID_SIZE) / 2, 0]
  ].flatMap(v =>
    [{
      position: v[0],
      value: v[1]
    }, {
      position: sizeX - v[0],
      value: v[1]
    }])
  const ticks = axis.selectAll('.plot-tick')
    .data(ticksX)
    .enter()

  ticks.append('line')
    .attr('stroke', main_color)
    .attr('x1', tick => tick.position)
    .attr('y1', 0)
    .attr('x2', tick => tick.position)
    .attr('y2', 5)

  ticks.append('text')
    .attr('stroke', main_color)
    .attr('y', 10)
    .attr('x', tick => tick.position)
    .style('text-anchor', 'middle')
    .style('alignment-baseline', 'hanging')
    .text(tick => tick.value + '%')


  const middle_bar = svg.append('g')
    .attr('width', MID_SIZE)
    .attr('transform', `translate(${sizeX / 2}, ${sizeY - 50})`)
    .style('background-color', main_color)

  const BAR_HEIGHT = 50
  const BAR_OFFSET = 32
  const VALUE_GAP = 80
  const VALUE_OFFSET = 50

  data = zip(data.names, data.values.movies, data.values.shows).map(v => ({
    name: v[0],
    movies: v[1],
    shows: v[2]
  }))
  const values = middle_bar.selectAll('.middle-bar-value')
    .data(data)
    .enter()
  values.append('text')
    .attr('stroke', main_color)
    .attr('x', 0)
    .attr('y', (_, i) => -(VALUE_OFFSET + VALUE_GAP * i))
    .style('text-anchor', 'middle')
    .style('alignment-baseline', 'ideographic')
    .text(point => point.name)



  values.append('rect')
    .attr('fill', 'red')
    .attr('y', (_, i) => -(VALUE_OFFSET + VALUE_GAP * i + BAR_OFFSET))
    .attr('x', MID_SIZE / 2)
    .attr('height', BAR_HEIGHT)
    .attr('width', point => point.shows * MAX_BAR_WIDTH)

  values.append('rect')
    .attr('fill', 'red')
    .attr('y', (_, i) => -(VALUE_OFFSET + VALUE_GAP * i + BAR_OFFSET))
    .attr('x', point => -MID_SIZE / 2 - point.movies * MAX_BAR_WIDTH)
    .attr('height', BAR_HEIGHT)
    .attr('width', point => point.movies * MAX_BAR_WIDTH)

  svg.append('text')
    .attr('x', (sizeX - MID_SIZE) / 2 - MAX_BAR_WIDTH)
    .attr('stroke', 'red')
    .style('font-size', '2em')
    .style('text-anchor', 'start')
    .style('alignment-baseline', 'hanging')
    .text('Movies')

    svg.append('text')
      .attr('x', sizeX - (sizeX - MID_SIZE) / 2 + MAX_BAR_WIDTH)
      .attr('stroke', 'red')
      .style('font-size', '2em')
      .style('text-anchor', 'end')
      .style('alignment-baseline', 'hanging')
      .text('TV Shows')
}
