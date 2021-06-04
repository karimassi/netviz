$(function() {
  const map =  new WorldMapPlot("#world-map");
  d3.json("data/countries_info.json").then(data => {
    map.draw(data, ( (code, name) => {
      updateCountryPassport(name, data[code])
    }))
  });
})

/**
 * Updates the sidebar next to the world map 
 * @param {string} name The selected country name
 * @param {Object} info The country's data 
 * @returns 
 */
function updateCountryPassport(name, info) {
  $("#country-passport").empty()
  $("#country-passport").append(`<h2>${name}</h2><br>`)
  if (typeof info == 'undefined') {
      $("#country-passport").append("<p>Unfortunately, no information is available for that country... Try selecting another one!</p><br>")
      return 
  }
  $("#country-passport").append(`<p>Netflix has been available in this country since ${info.date_joined}.</p><br>`)

  $("#country-passport").append("<h4>Movies</h4><br>")
  $("#country-passport").append(`<p class="count">${info.count_movies}</p><br>`)
  $("#country-passport").append("<h4>TV Shows</h4><br>")
  $("#country-passport").append(`<p class="count">${info.count_series}</p><br>`)
  $("#country-passport").append("<h4>Top 10 genres</h4><br>")
  $("#country-passport").append(`<p>${info.genres.join(', ')}</p><br>`)

}

/**
 * Construct a world map using the miller projection
 * and draw it in the container with the provided id 
 */
class WorldMapPlot {
  constructor(id) {
    this.id = id;
  }

  /**
   * Draws the given data on a map and calls the given callback
   * when a region is selected
   * @param {Object} data Data corresponding to countries 
   * @param {Function} callback Callback to call when selecting a region
   */
  draw(data, callback) {

    // Compute total country counts to color map
    let total_counts = {};
    for (var key in data) {
      total_counts[key] = data[key].count_movies + data[key].count_series;
    }
    
    $(this.id).vectorMap({
      map: 'world_mill',
      hoverColor: false,
      backgroundColor: '#000',
      zoomOnScroll: false, 
      regionsSelectable: true,
      regionsSelectableOne: true,
      series: {
        regions: [{
          values: total_counts,
          scale: ['#550000', '#D00000'],
          normalizeFunction: 'polynomial',
          legend: {
            horizontal: true,
            title: 'Catalogue size'
          }
        }]
      },
      regionStyle: {
        initial: {
          fill: '#564D4D',
          "fill-opacity": 1,
        },
        hover: {
          "fill-opacity": 0.8,
        },
        selected: {
          fill: 'lightgray',
          stroke: 'white',
          "stroke-width": 3
        },
        selectedHover: {
          "fill-opacity": 1,
        }
      },
      zoomMax: 8, 
      zoomMin: 1, 
      zoomStep: 1.6,
      // When selecting a region call the provided callback
      // with the selected region
      onRegionSelected: ((event, code, isSelected) => {
        if (isSelected) {
          let map=$(this.id).vectorMap('get', 'mapObject');
          callback(code, map.getRegionName(code))
        }
      })
    });  
  }
}