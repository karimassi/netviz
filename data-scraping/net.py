import requests
from bs4 import BeautifulSoup

def get(suburl=''):
    WEBSITE = 'https://www.flixwatch.co/'
    url = f'{WEBSITE}{suburl}' if not suburl.startswith(WEBSITE) else suburl
    doc = requests.get(url).text
    parser = 'html.parser'
    ext = suburl.split('.')[-1]
    if ext == 'xml':
        parser = 'lxml'
    return BeautifulSoup(doc, parser)
