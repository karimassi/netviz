from net import get
from functools import reduce
from multiprocessing import Pool

root = get('/catalogs/')

# selector = 'main#main details ul li a'
selector = 'main#main ul li a'

country_links = list(map(lambda a: a['href'], root.select(selector)))

def get_num_pages(soup):
    try:
        pagination_texts = map(lambda el: el.string, soup.select_one('#pagination').children)
        return reduce(
            lambda prev, curr: max(prev, int(curr)) if curr.isnumeric() else prev,
            pagination_texts,
            1
        )
    except:
        return 0

def get_movies_for_country(country_url):
    try:
        print(f'Retrieving {country_url}')
        base_page = get(country_url)
        number_of_pages = get_num_pages(base_page)
        items = set()
        for page_num in range(1, number_of_pages + 1):
            # print(page_num)
            page = get(f'{country_url}?paged={page_num}')
            items.update(map(lambda a: a['href'], page.select('div.catalogue-item > a')))
        return items
    except Exception as e:
        print(f' ***** Exception for {country_url}:', e)
        return set()

with Pool() as p:
    titles = reduce(lambda a, b: a.union(b),
        p.map(get_movies_for_country, country_links),
        set())
    with open('title_links.txt', 'w') as f:
        for title in titles:
            print(title, file=f)
