import json
from copy import deepcopy
import pandas as pd
from datetime import datetime
from functools import reduce

def flatsetmap(f, collection):
    return reduce(
        lambda a, b: a.union(b),
        map(f, collection),
        set()
    )

def extract_persons(entry):
    l = []
    for attr in ['actors', 'directors']:
        if attr in entry:
            l += entry[attr]
    return l

with open('title_data.json', 'r') as f:
    data_json = json.load(f)

for entry in data_json:
    for attr_name in ['actors', 'directors']:
        if attr_name not in entry:
            entry[attr_name] = []
        else:
            entry[attr_name] = list(map(tuple, entry[attr_name]))

countries = flatsetmap(lambda x: x['streaming_in'], data_json)
all_genres = flatsetmap(lambda x: x['genres'] + x['alternate_genres'], data_json)
persons = flatsetmap(extract_persons, data_json)

def create_to_id_mapping(collection):
    return {
        el: index\
        for index, el in enumerate(collection)
    }

def map_list_of_values(list, matching_map):
    return [
        matching_map[entry]\
        for entry in list
    ]

country_to_id_mapping = create_to_id_mapping(countries)
all_genres_to_id_mapping = create_to_id_mapping(all_genres)
person_to_id_mapping = create_to_id_mapping(persons)

data = data_json
for entry in data:
    for attr_name, mapping in [
                ('streaming_in', country_to_id_mapping),
                ('genres', all_genres_to_id_mapping),
                ('alternate_genres', all_genres_to_id_mapping),
                ('actors', person_to_id_mapping),
                ('directors', person_to_id_mapping)
            ]:
        entry[attr_name] = map_list_of_values(entry[attr_name], mapping)

def list_show(list):
    return ','.join(map(str, list))

def save_mapping(mapping, filename, key_lambda=lambda x: x):
    df = pd.DataFrame(
        [
            (id, key_lambda(entry))\
            for entry, id in mapping.items()
        ],
        columns=('id', 'name'))
    df.to_csv(f'data/{filename}.csv', index=False)


save_mapping(country_to_id_mapping, 'countries')
save_mapping(all_genres_to_id_mapping, 'genres')
save_mapping(person_to_id_mapping, 'persons', lambda x: x[1])

df = pd.DataFrame(
    [
        (id, title['title'], title.get('description'), title.get('imdb'), title.get('metacritic'),
            title.get('duration'), title.get('number_of_seasons'), title.get('audio'), title.get('family_friendly'),
            title.get('age_rating'), datetime.fromisoformat(title.get('available_from')), title.get('year'),
            list_show(title.get('actors')), list_show(title.get('directors')), list_show(title.get('streaming_in')),
            list_show(title.get('genres')), list_show(title.get('alternate_genres'))
        )
        for id, title in enumerate(data)
    ],
    columns=('id', 'title', 'description', 'imdb', 'metacritic', 'duration', 'number of seasons', 'audio', 'family friendly',
        'age rating', 'release date on Netflix' , 'year', 'actors', 'directors', 'countries', 'genres', 'alternate genres'))
df.to_csv('data/titles.csv', index=False)
