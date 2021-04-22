# Milestone 1
## Exploratory Data Analysis



### Basic Statistics

    Here are some basic statistics about our data:
    
    --> There are 9113 items of the Netflix catalogue in our data.
    
    --> The content we have was released on Netflix between 2015-04-14 00:00:00 and 2021-04-08 00:00:00.
    
    --> There are 40868 unique actors starring in the Netflix catalogue.
    
    --> There are 5451 unique directors in the Netflix catalogue.
    
    --> Content is classified into 25 genres (and 899 alternative genres) in the Netflix catalogue.



### Movies vs. TV shows 

A first interesting statistic to note is the proportion of movies and TV shows available on the streaming platform. Netflix is best-known for TV-shows, but it actually started out as a movie-rental service. There are clearly more movies than TV shows in their current catalogue.

    There are 7538 movies in the dataset and 1575 TV shows




![png](eda_files/eda_9_1.png)
    


### Proportion of content for each age rating

The streaming platform is popular among families, it therefore offers a large variety of content destined to different-aged publics. 


​    
![png](eda_files/eda_11_0.png)
​    


Netflix offers mostly content aimed towards a public of `+13` and `+16`.

### Number of items per country

In 2010, Netflix decided to expand its operations to a wider range of locations. Today, it is available in more than 190 countries. Naturally, some content is specific to a certain region, depending on language, culture and copyrights. Let's explore the catalogue's size depending on the country.


​    
![png](eda_files/eda_14_0.png)
​    


### Audio representation in the catalogue

With its expansion, Netflix acquired content rights to match the culture of its newly added regions. Moreover, it recently started to produce its own content, in various languages. Let's explore the representation of each language in Netflix's library.

    There are 73 different languages in our dataset. The 3 most present ones are English, Japanese and Korean.




![png](eda_files/eda_16_1.png)
    


### Releases per month

To stay competitive during their expansion, Netflix releases content frequently. Let's explore the amount of content their releases each month since April of 2015.


​    
![png](eda_files/eda_18_0.png)
​    


### Releases per month, per rating

We have just seen the amount of content they propose on their platform for each month since April 2015. For those same periods of time, let's study how much of their released content is intended for which type of viewers, characterized by the age rating.


​    
![png](eda_files/eda_20_0.png)
​    


We can observe that Netflix started introducing a lot of content rated as `+18` as well as `+7` at the beginning of the year 2020. Otherwise, their content is mostly orientated to `+13` and `+16` viewers.

### Number of items per genre

As well as proposing frequent releases for different type of viewers, their content is adapted to different tastes. Let's study the amount of content proposed for each genre.


​    
![png](eda_files/eda_23_0.png)
​    


Clearly the 2 most represented genres are Drama and Comedy.

### Number of items per genre, per release date

After seeing what are the most popular genres in the entire Netflix catalogue, let's see how they release content based on the genre over the years.


​    
![png](eda_files/eda_27_0.png)
​    


### Cumulative amount of each genre over the years

Netflix's library has grown over the years. Let's see how it has evolved.


​    
![png](eda_files/eda_31_0.png)
​    




![png](eda_files/eda_32_0.png)
    


### Top directors and top actors bar plots

The streaming platform offers a lot of content from a lot of cultures. Let's see who are the top-10 directors and the top-10 actors, according to the number of movies they appear in or direct in our dataset.


​    
![png](eda_files/eda_34_0.png)
​    




![png](eda_files/eda_34_1.png)
    


We can observe that for both the top-10 directors and the top-10 actors are quite diverse, even though they both seems to belong to the American or the Asian culture (except for director Pedro Almodovar).

### Most represented actors in top-graded items

Not all content available on netflix is well rated on websites such as IMDb. Let's compare the result for the actors we had above with the top-10 actors, according to the best-rated content on IMDb.


​    
![png](eda_files/eda_37_0.png)
​    


We can note that the name in the top 10 actors occurrences in top-graded content differs a lot from the previous part. We can identified only `Morgan Freeman` from the American movie industry. All the others are from the Asian movie industry.

### Most represented genre in top-graded items

We know that the most represented genres in the Netflix's catalogue are Drama and Comedy. Let's see if it is still the case in the top-rated movies according to IMDb.


​    
![png](eda_files/eda_40_0.png)
​    

