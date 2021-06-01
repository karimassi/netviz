import nltk
import json
import pandas as pd
from collections import Counter
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

# Load the data
DATA_PATH = '../../data'
WEBSITE_DATA_PATH = '../../website/app/data'
catalogue = pd.read_csv(f'{DATA_PATH}/titles.csv').dropna(subset = ['description'])
catalogue['release date on Netflix'] = pd.to_datetime(catalogue['release date on Netflix'])
catalogue['month'] = catalogue['release date on Netflix'].dt.month

stop_words = stopwords.words('english')
allowed_pos_tags = ['NOUN', 'ADJ']

def process_description(description):
    '''
        Processes a string into tokens and removes stopwords, 
        short words, and keeps nouns and adjectives. Produces 
        bigrams and lemmatizes tokens
    '''
    if type(description) is float:
        print(description)
    lowered = description.lower()
    tokens = nltk.word_tokenize(lowered)
    tokens = [token for token in tokens if token not in stop_words]
    tokens = [token for token, pos in nltk.pos_tag(tokens, tagset='universal') if pos in allowed_pos_tags]
    lemmatizer = WordNetLemmatizer()
    tokens = [lemmatizer.lemmatize(word) for word in tokens]
    tokens = [token for token in tokens if token.isalpha() and len(token) > 3]
    tokens += [' '.join(bigram) for bigram in list(nltk.bigrams(tokens))]
    return tokens 

def flatten_list(to_flatten):
    return [t for to in to_flatten for t in to]

# Process descriptions into tokens
catalogue['description_tokens'] = catalogue.description.apply(process_description)

# Dictionary of descriptions for every month
descriptions_per_month = catalogue.groupby('month').agg({'description_tokens': list})['description_tokens'].to_dict()

# Have a list of words per month, with a counter
per_months_flat = {k:flatten_list(v) for k, v in descriptions_per_month.items()}
per_months_lengths = {k:len(v) for k, v in per_months_flat.items()}
per_months_count = {k:Counter(v) for k, v in per_months_flat.items()}

# List of all words 
all_words = []
for k, v in per_months_flat.items():
    all_words += v

# Probability distribution of all words
allwords_dic = dict.fromkeys(all_words, 0)
for word in allwords_dic.keys():
    allwords_dic[word] = 0
    for month, counts in per_months_count.items():
        allwords_dic[word] += counts[word]/per_months_lengths[month]
    allwords_dic[word]/=12

# Std of probabilities
all_words_std = pd.Series(allwords_dic).std() 
    
# Readjust monthly distribution by giving less importance to words that are 
# frequent throughout all months
per_months_cleaned = {}
for month, words in per_months_flat.items():
    words_cleaned = {}
    for word in words:
        if allwords_dic[word] > all_words_std:
            words_cleaned[word] = per_months_count[month][word]/per_months_lengths[month] - allwords_dic[word]
        else:
            # If word is veeeery rare (w.r.t. std), don't consider it
            words_cleaned[word] = 0
    per_months_cleaned[month] = words_cleaned
    
# Keep top 100 words for every month
top_keywords_months = {} 
for i in range(1, 13):
    top_keywords_months[i] = dict(sorted(per_months_cleaned[i].items(), key = lambda x: -x[1])[:100])

# Save as json file in website folder
with open(f'{WEBSITE_DATA_PATH}/keywords_per_month.json', 'w') as f:
    json.dump(top_keywords_months, f)