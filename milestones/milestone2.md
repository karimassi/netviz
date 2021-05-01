# Milestone 2

*How did Netflix's release strategy evolve during the last decade?*

1. Introduction:
    - Counter with number of TV shows and movies, per day or week
      - sketch :
      - description : number of movies and TV shows in the library evolving over time
      - tools : d3
      - lectures related :
      
  - Release trends (i.e. per season, year or month)
       - per month all years aggregated
           - sketch :
           - decription : bar plot to show in which month there is the most released
           - tools : d3
           - lectures related :
      

2. Geographical and cultural expansion of Netflix, and how its library was updated:
  - *Racing bars* with evolution of content's language per year
      - sketch :
      - description : animated horizontal bar plot sorted by most represented languages in movies and TV shows. The animation starts in April 2015 and goes to the current point in time. 
      - tools : d3, jquery
      - lectures related :
  - Map of the world (either static or per year) with a side bar (i.e. showing statistics per country)
      - sketch : 
      - description : static map of the world showcasing the amount of content available in each country. When clicking on a country, a side box appears with statistics, plots and other information only about this country.
      - tools : d3, leaflets
      - lectures related :
  - Graph where movies are nodes and there is a link between two movies if they share a common actor. Then perform community detection to find language communities.
      - sketch :
      - description : 2D graph where nodes are movies and there is an weight edge if 2 movies share common actors (we take out vertices that has no edges)
      - tools : d3, others that might come later
      - lectures related :
      - comments : pretty imaginary for the moment might need some rethinking later  

3. Evolution of the content to adapt to the growing demand. 
    - Release trends per month/year
          - sketch :
          - description : line plot (with 2 lines) showcasing the numbers of, respectively, movies and TV shows released per month/year
          - tools : d3 
          - lectures related :
          
  - Topic extraction from the content description, per season. Try to find particularities (keywords relevant per season, i.e. Christmas, valentines)
      - sketch :
      - description : word cloud displaying the most recurring key phrases in item descriptions, splitting movies and TV shows in different clouds
      - tools : d3, and probably other tools
      - lectures related :
  - Age rating (vertical symmetric barplot, TV shows vs. Movies)
      - sketch :
      - description : dynamic pyramid plot (like one used to show age distribution in a population) where we have movies on one side and TV shows on the other. Each row represents amount in percentage of an age rating and the plot changes over time.
      - tools : d3, and other tools that we don't know about yet
      - lectures related :
  - Genres (timeline) 
      - sketch :
      - description :
      - tools :
      - lectures related :
