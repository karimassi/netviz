from net import get
from functools import reduce

import re


time_re = re.compile(r'((?P<h>\d+)h)?.*?((?P<m>\d+)m)')


def parse_key_value(el):
    key_el = el.select_one('b')
    if key_el is None:
        return None
    key = key_el.text.strip()[:-1]
    value = list(key_el.next_siblings)
    return key, value


def get_important_pairs(soup):
    pairs = [
        parse_key_value(el)\
        for el in soup.select('.content p')
    ]
    return filter(lambda x: x is not None, pairs)


def split_and_strip(x, delimiter=','):
    return [
        s.strip()\
        for s in x.split(delimiter)
    ]


def identity(x):
    return x.strip()


def family_friendly(x):
    return x.lower().strip() == 'yes'


def extract_minutes(x):
    match = time_re.match(x.strip())
    if not match:
        return 0
    else:
        m = match.group('m')
        h = match.group('h')
        m = int(m) if m else 0
        h = int(h) if h else 0
        return 60 * h + m


def imdb(x):
    v = x.split('/')[0].strip()
    if v == '0':
        return None
    else:
        if v.isnumeric():
            return float(v)
        else:
            return None

def metacritic(x):
    try:
        return int(x.split('/')[0].strip())
    except:
        return None


def composition(*fs):
    result = None
    for f in reversed(fs):
        a = result
        if result is None:
            result = f
        else:
            result = lambda x: f(a(x))
    return result


def connect_sibling_text(x):
    return reduce(lambda a, b: a + b,
        map(lambda el: el.string.replace('\xa0', ''), x),
        '').strip()


def extract_persons(v):
    return list(
        map(
            lambda x: (x['href'], x.string),
            filter(lambda x: x.name == 'a', v)
        )
    )


def scrap_movie_page(url):
    try:
        soup = get(url)
        data = {
            'title': soup.select_one('h1.h1class').string,
            'description': soup.select_one('.grid-child .descript').string
        }
        data_to_extract = {
            'Genre': ('genres', composition(split_and_strip, connect_sibling_text)),
            'Alternate Genre': ('alternate_genres', composition(split_and_strip, connect_sibling_text)),
            'IMDb': ('imdb', composition(imdb, connect_sibling_text)),
            'Metacritic': ('metacritic', composition(metacritic, connect_sibling_text)),
            'Audio': ('audio', composition(identity, connect_sibling_text)),
            'Year': ('year', composition(int, connect_sibling_text)),
            'Duration': ('duration', composition(extract_minutes, connect_sibling_text)),
            'Family Friendly': ('family_friendly', composition(family_friendly, connect_sibling_text)),
            'No. of Seasons (?)': ('number_of_seasons', composition(lambda x: int(x) if x.isnumeric() else None, connect_sibling_text)),
            'Suitable for Age (?)': ('age_rating', composition(identity, connect_sibling_text)),
            'Available From (?)': ('available_from', composition(identity, connect_sibling_text)),
            'Actor(s)': ('actors', extract_persons),
            'Director(s)': ('directors', extract_persons)
        }
        pairs = get_important_pairs(soup)
        for k, v in pairs:
            key_handle = data_to_extract.get(k)
            if key_handle is not None:
                data[key_handle[0]] = key_handle[1](v)

        data['streaming_in'] =  [
            a.string\
            for a in soup.select('div.country-box p a')
        ]
        return data
    except Exception as e:
        print(f' ***** Exception for {url}:', e)
        return None


import json

if __name__ == "__main__":
    # print(scrap_movie_page('https://www.flixwatch.co/movies/blitz/'))
    # print(scrap_movie_page('https://www.flixwatch.co/movies/blitz/'))
    # print(scrap_movie_page('https://www.flixwatch.co/movies/firegate/'))
    # print(scrap_movie_page('https://www.flixwatch.co/tvshows/shopaholic-louis/'))
    # print(scrap_movie_page('https://www.flixwatch.co/movies/beverly-hills-cop-ii/'))
    # print(scrap_movie_page('https://www.flixwatch.co/tvshows/fire-of-eternal-love-the-flames-daughter/'))
    print(json.dumps(scrap_movie_page('https://www.flixwatch.co/tvshows/the-press/')))

    # print(scrap_movie_page('https://www.flixwatch.co/movies/creating-an-army-of-the-dead/'))
    # print(scrap_movie_page('https://www.flixwatch.co/movies/jungle-beat-the-movie/'))
    # print(scrap_movie_page('https://www.flixwatch.co/tvshows/sex-education/'))
    # print(scrap_movie_page('https://www.flixwatch.co/movies/army-of-the-dead/'))
