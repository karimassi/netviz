# Milestone 1

## Problematic

Ten years ago Netflix was only present in the United States. Nowadays, the world-wide streaming platform is available in more than 190 countries. 
Its catalogue is rapidly growing not only to catch up with recent movies and TV shows releases, 
but also to adapt their content to the local market by producing original content.

They gradually made their services available in different parts of the world, which in turn created demand and introduced new kinds of viewers.
Doing so allowed the company to update their business model. 
On the one hand, they started collaborating with local studios offering new original content. 
On the other hand, they made available existing local content to their global audience.

We expect that the evolution of their library reflects this strategy. 
We are therefore interested in studying how Netflix's release strategy evolved during the last decade.

## Dataset

We first oriented our research on Kaggle but the available datasets did not meet our requirements. 
Later on we stumbled upon an unofficial Netflix catalogue, [Flixwatch](www.flixwatch.co), from which we scrapped the content. 
In its FAQ page, the author specifies that the scrapping is allowed for non-commercial purposes. Our data contains the following attributes:
- The title of the movie or the TV show;
- A list of countries in which it is available;
- A list of genres the item is associated with;
- A list of alternate (more broad) genres;
- The item's IMDb and Metacritic scores;
- The original audio's language of the item;
- The year the item was released;
- The duration, if the item is a movie, or the number of seasons for a TV show;
- The exact date that it was made available on Netflix;
- The age rating along with the flag indicating if it is family friendly;
- A list of item's actors;
- A list of directors for a movie.


Note: if we think some information are missing we plan on retrieving it from an IMDb dataset.

## Exploratory Data Analysis

In [this notebook](eda.ipynb), you will find some initial exploratory work on our data. It is also available [here](eda.md) under a nicer markdown format.

We show some insights and preliminary findings about the scrapped Netflix catalogue. 
Since we scrapped the data ourselves, the amount of missing values is negligible. 

## Related Work

There are a lot of datasets about Netflix's library. Some exploratory data analyses have been done by multiple users on Kaggle.
However, these datasets lack information in comparison to what we were able to scrape (e.g. availability of items, ratings, better genres). 
Moreover, our dataset is very recent (the latest item is from April 2021), whereas the ones on Kaggle were several months old at the time of writing. 

Looking at last year's projects, we noticed a few ones using the IMDb data, which can be a source of inspiration if needed. 

Existing analyses focus mainly on the *recommender systems* side of the data but do not give importance to the streaming platform's releasing strategy,
mainly due to the lack of corresponding data. 

Finally, here are a few pointers to interesting resources:
1. [Constellations of Directors and Their Stars, The New York Times](https://www.nytimes.com/newsgraphics/2013/09/07/director-star-chart/index.html): a nice visualization about the relation between directors and actors throughout time
2. [Netflix Visualizations, Recommendation, EDA](https://www.kaggle.com/niharika41298/netflix-visualizations-recommendation-eda/): an extensive exploratory data analysis on a Netflix dataset 
3. [Recommendation System on Netflix Data](https://www.kaggle.com/tuniosuleman/recommendation-system-on-netflix-data): a recommender system built by a Kaggle user
