from net import get
from multiprocessing import Pool
from functools import reduce

import re

movies_shows_sitemap_pattern = re.compile(
    r'https://www.flixwatch.co/(movies|tvshows)-sitemap\d+.xml')

title_sitemaps = []

sitemap_root = get('https://www.flixwatch.co/sitemap_index.xml')
subsitemaps = list(map(lambda x: str(x.string), sitemap_root.select('loc')))
for url in subsitemaps:
    if movies_shows_sitemap_pattern.match(url):
        title_sitemaps.append(url)

def extract_movies_from_submap(submap_url):
    soup = get(submap_url)
    title_locs = soup.select('loc')
    return set(list(map(
        lambda x: str(x.string), title_locs)))


with Pool() as p:
    titles = reduce(lambda a, b: a.union(b),
        p.map(extract_movies_from_submap, title_sitemaps),
        set())
    with open('title_links.txt', 'w') as f:
        for title in titles:
            print(title, file=f)
