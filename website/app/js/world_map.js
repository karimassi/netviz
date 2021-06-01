$(function() {
  const map =  new WorldMapPlot("#world-map");
  d3.json("data/countries_info.json").then(data => {
    map.draw((name => {
      updateCountryPassport(name, data)
    }))
  });
})

function updateCountryPassport(name, info) {
  $( "#country-passport" ).find("h4").text(name)
  if (typeof info[name] == 'undefined') {
      $("#country-passport").find("p").text("No information available for that country...")
  } else {
      $("#country-passport").find("p").html(`There are ${info[name].count_movies} movies and ${info[name].count_series} series available in this country.<br><br>The top 10 genres are ${info[name].genres.join(', ')}.`)
  }
}

class WorldMapPlot {
  constructor(id) {
    this.id = id
  }

  draw(callback) {
    $(this.id).vectorMap({
      map: 'world_mill',
      // zoomOnScroll: true, 
      // panOnDrag: true, 
      hoverColor: false,
      backgroundColor: '#000',
      regionsSelectable: true,
      regionsSelectableOne: true,
      regionStyle: {
        initial: {
          fill: 'gray',
          "fill-opacity": 1,
        },
        hover: {
          "fill-opacity": 0.8,
        },
        selected: {
          fill: 'red'
        },
        selectedHover: {
          "fill-opacity": 1,
        }
      },
      zoomMax: 8, 
      zoomMin: 1, 
      zoomStep: 1.6,
      onRegionSelected: ((event, code, isSelected) => {
        if (isSelected) {
          let map=$('#world-map').vectorMap('get', 'mapObject');
          callback(map.getRegionName(code))
        }
      })
    });  
  }
}