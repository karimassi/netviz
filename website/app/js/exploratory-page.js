function map(id, callback) {
  const mapDiv = $(`#${id}`);
  mapDiv.vectorMap({
    map: 'world_mill',
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
        fill: '#DB0000'
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
        const map = mapDiv.vectorMap('get', 'mapObject');
        const codeName = map.getRegionName(code);
        callback(codeName);
      }
    })
  });
}

/**
 * Does reduction using multiple reducers at the same time
 *  and filters results beforehand in a single pass
 */
function filterMultiReduce(iterable, reducers, filterFunc) {
  const reducedValues = {};
  const reducerNames = Object.keys(reducers);
  reducerNames.forEach(name => reducedValues[name] = undefined);
  iterable.forEach(el => {
    if(filterFunc(el)) {
      reducerNames.forEach(name => {
        reducedValues[name] = reducers[name](reducedValues[name], el);
      });
    }
  });
  return reducedValues;
}

/**
 * Maps string of ints with comma separator to array of int
 */
function parseArrayOfInts(str) {
  return str.split(',').map(x => +x);
}

class ExploratoryTool {
  constructor(mapId, sideBarId, statisticsBarId, audioPlotId,
      selectorPlotData, exploratoryDataPath, countriesPath) {
    this.exploratoryData = undefined;
    this.selected = {
      country: undefined,
      interval: undefined
    };
    this.audioBarPlot = undefined;
    this.idToCountryMapping = undefined;
    this.countryToIdMapping = undefined;
    this.sideBar = $(`#${sideBarId}`);
    this.statisticsBar = $(`#${statisticsBarId}`);

    this.preparePlots(audioPlotId);
    this.startEploratoryDataLoading(exploratoryDataPath)
    this.startselectionElementCreation(mapId, selectorPlotData);
    this.startLoadingMappings(countriesPath);
  }

  fillAudioPlot(data) {
    this.fillAudioWithNonAppearing(data);
    const topAudio = Object.entries(data).sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    const values = topAudio.map(x => x[1]);
    const labels = topAudio.map(x => x[0]);
    this.audioBarPlot.updateData(values);
    this.audioBarPlot.updateLabels(labels);
  }

  handleNoData() {
    this.sideBar.html('No data available');
    this.statisticsBar.html('No data available');
    this.fillAudioPlot({});
  }

  fillAudioWithNonAppearing(data) {
    const sampleLanguages = [
      'English', 'Hindi', 'Spanish', 'Japanese', 'Italian', 'Korean', 'Mandarin'
    ];
    for(const language of sampleLanguages) {
      if(data[language] === undefined) {
        data[language] = 0;
      }
    }
  }

  displayData(data) {

    if(data['audioCount'] === undefined) {
      data['audioCount'] = {};
    }
    this.fillAudioPlot(data['audioCount']);

    this.sideBar.html(`
      Top movies:
      <ol>
        ${
          data['topMovies'] === undefined ? 'No data available' :
            data['topMovies'].arr.filter(x => x !== undefined).map(x => `<li>${x.title}</li>`).join('\n')
        }
      </ol>
      Top TV shows:
      <ol>
        ${
          data['topMovies'] === undefined ? 'No data available' :
            data['topShows'].arr.filter(x => x !== undefined).map(x => `<li>${x.title}</li>`).join('\n')
        }
      </ol>
    `);
    this.statisticsBar.html(`
      <p>Number of movies: <b>${data['numberOfTitles'][0]}</b></p>

      <p>Average length of a movie: <b>${Math.round(data['averageDuration'][0] / data['averageDuration'][1])} minutes</b></p>

      <p>Number of TV Shows: <b>${data['numberOfTitles'][1]}</b></p>

      <p>Average duration of a TV show: <b>${(data['averageNumberOfSeasons'][0] / data['averageNumberOfSeasons'][1]).toFixed(2)} seasons</b></p>
    `)
  }

  updateData() {
    if(this.exploratoryData !== undefined &&
        this.selected.country !== undefined &&
        this.selected.interval !== undefined) {

      const countryId = this.countryToIdMapping[this.selected.country];
      if(countryId !== undefined) {

        const filterCondition = entry => entry.countries.has(countryId) &&
          entry['release date on Netflix'] >= this.selected.interval[0] &&
          entry['release date on Netflix'] <= this.selected.interval[1];

        const aggregates = filterMultiReduce(this.exploratoryData, {
            'topMovies': this.topMoviesReducer(5),
            'topShows': this.topShowsReducer(5),
            'numberOfTitles': this.countMoviesShows,
            'averageDuration': this.attrAverageDataReducer('duration'),
            'averageNumberOfSeasons': this.attrAverageDataReducer('number of seasons'),
            'audioCount': this.countAudio
          },
          filterCondition);
        this.displayData(aggregates);
      }
      else {
        this.handleNoData();
      }
    }
    else {
      this.handleNoData();
    }
  }

  countAudio(agg, title) {
    if(agg === undefined) {
      agg = {};
    }
    const audio = title.audio;
    if(agg[audio] === undefined) {
      agg[audio] = 1;
    }
    else {
      agg[audio] += 1
    }
    return agg;
  }

  attrAverageDataReducer(attrName) {
    return (agg, title) => {
      if(agg === undefined) {
        agg = [0, 0];
      }
      const attrValue = +title[attrName];
      if(!isNaN(attrValue) && attrValue > 0) {
        agg[0] += +attrValue;
        agg[1]++;
      }
      return agg;
    }
  }

  countMoviesShows(agg, title) {
    if(agg === undefined) {
      agg = [0, 0];
    }
    if(!isNaN(title.duration)) {
      agg[0]++;
    }
    else if(!isNaN(title['number of seasons'])) {
      agg[1]++;
    }
    return agg;
  }

  topMoviesReducer(k) {
    return (agg, title) => {
      if(agg === undefined) {
        agg = new SortedCollection(k, (a, b) => a.metacritic > b.metacritic);
      }
      if(!isNaN(title.duration) && !isNaN(title.metacritic)) {
        agg.tryToInsert(title);
      }
      return agg;
    }
  }

  topShowsReducer(k) {
    return (agg, title) => {
      if(agg === undefined) {
        agg = new SortedCollection(k, (a, b) => a.metacritic > b.metacritic);
      }
      if(!isNaN(title['number of seasons']) && !isNaN(title.metacritic)) {
        agg.tryToInsert(title);
      }
      return agg;
    }
  }

  /**
   * Loads data for the background of selector and creates the map
   */
  startselectionElementCreation(mapId, selectorDataFilepath) {
    d3.csv(selectorDataFilepath).then(data => {
      const points = [];

      for(let i = 0; i < data.length; i++) {
        points.push({
          month: new Date(data[i]['release month']),
          count: (data[i].count > 0) ? Math.log(data[i].count) : 0
        });
      }

      const f = d => ('0' + d).slice(-2);

      const selector = new RangeSelector(
        'exporatory-time-selection',
        points,
        (left, right) => {
          this.selected.interval = [left, right];
          this.updateData();
        },
        date => `${f(date.getDate())}-${f(date.getMonth() + 1)}-${f(date.getFullYear())}`);

        const synonyms = {
          'United Kingdom': 'UK',
          'United States': 'USA',
          'United Arab Emirates': 'UAE'
        };

        map(mapId, country => {
          const synonym = synonyms[country];
          if(synonym !== undefined) {
            country = synonym;
          }
          if(country !== this.selected.country) {
            this.selected.country = country;
            this.updateData();
          }
        });
    });
  }

  preparePlots(audioPlotId) {
    this.audioBarPlot = new SimpleBarPlot(
      audioPlotId,
      ['English', 'Japanese', 'Chinese', 'Portugese', 'Latin'],
      1200,
      380,
      100
    );
  }

  /**
   * Loads title data
   */
  startEploratoryDataLoading(exploratoryDataFilepath) {
    d3.csv(exploratoryDataFilepath).then(data => {
      this.exploratoryData = data;
      this.exploratoryData.forEach(d => {
        d.imdb = parseFloat(d.imdb);
        d.metacritic = parseFloat(d.metacritic);
        d.duration = parseFloat(d.duration);
        d['number of seasons'] = parseFloat(d['number of seasons']);
        d['release date on Netflix'] = new Date(d['release date on Netflix']);
        d.countries = new Set(parseArrayOfInts(d.countries));
      });
    });
  }

  /**
   * Load countries and their ids
   */
  startLoadingMappings(countryFilepath) {
    d3.csv(countryFilepath).then(data => {
      this.idToCountryMapping = {};
      this.countryToIdMapping = {};
      data.forEach(dataPoint => {
        this.idToCountryMapping[+dataPoint.id] = dataPoint.name;
        this.countryToIdMapping[dataPoint.name] = +dataPoint.id;
      });
    });
  }
}

$(() => {
  const exploratoryTool = new ExploratoryTool(
    'exploratory-tool-world-map',
    'exploratory-side-bar',
    'statistics-side-bar',
    'exploratory-tool-audio-bar-plot',
    'data/release_density_per_month.csv',
    'data/exploratory_data.csv',
    'data/countries.csv');
});
