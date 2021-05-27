from scrap import scrap_movie_page
from multiprocessing.dummy import Pool
import json

title_urls = []

with open('title_links.txt', 'r') as f:
  for title_url in f:
      if len(title_url.strip()) > 0:
          title_urls.append(title_url.strip())

# print(title_urls[:5])

with Pool() as p:
    title_list = list(filter(lambda x: x is not None, p.map(scrap_movie_page, title_urls)))

with open('title_data.json', 'w') as f:
    json.dump(title_list, f)
