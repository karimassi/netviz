import requests
from bs4 import BeautifulSoup

def get(suburl=''):
    WEBSITE = 'https://www.flixwatch.co/'
    url = f'{WEBSITE}{suburl}' if not suburl.startswith(WEBSITE) else suburl
    doc = requests.get(url).text
    return BeautifulSoup(doc, 'html.parser')
