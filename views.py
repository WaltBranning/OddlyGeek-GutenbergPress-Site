from flask import render_template, make_response
from flask_sitemap import Sitemap
from sqlalchemy import func
from gutenbergpress import app, utilities
from gutenbergpress.models import Catalog, Authors, db
from gutenbergpress.api import gutenberg_api
import requests, json

map = Sitemap(app=app)

@app.route('/')
def gutenbergpress():
    """ This section creates a dict object from the sortkeys that allow the 
        catalog items to be alphabetically sorted and the orginal purpose for 
        the dict object was a way pass along the keys to generate the first
        versions navigation -- it is currently not being used here and plan to 
        move to the utility module"""
    query = db.session.query(Catalog.sortkey).order_by(Catalog.sortkey).all()
    index = {i.sortkey[0]:[] for i in query if i.sortkey and i.sortkey[0].isalpha()}
    
    for i in query:
        key = i.sortkey
        if key and key[0].isalpha() and key not in index[key[0]]:
            index[i.sortkey[0]].append(i.sortkey)
    
    resp = index

    """ This Section Queries Authors for featured - pulling a random author
        from those flagged as featured in the database catalog"""

    author_q = Authors.query.filter(Authors.featured==1)
    author_q = author_q.order_by(func.random()).first()

    """ Need to clean this and the template to only pass json object to template
        instead of creating a new dict object"""
    
    bio = json.loads(author_q.bio)
    
    featured_author = {'name':f"{author_q.first_name} {author_q.last_name}",
                       'id': str(author_q.id),
                       'bio': bio['bio'],
                       'link': bio['wiki_link']}

    """ Query Catalog for starred books returns name and id for book cover """
    star_q = Catalog.query.filter(Catalog.starred==1, Catalog.has_cover==1)
    star_q = star_q.order_by(func.random()).limit(4).all()
    starred_works = [{'id':str(i.text_number), 
                      'title':i.title, 
                      'author':i.authors} for i in star_q]

    """ Build content to return to template"""
    sections = ['author', 'notable_works', 'reading_lists', 'discover_new']
    content = dict(zip(sections, [featured_author,starred_works,{},{}]))

    return render_template('gutenberg.jinja', content=content, nav_index=resp)

@app.route('/browse/books/')
def books():
    return render_template('catalog.jinja')

@app.route('/writers')
def writers():
    return render_template('missing.jinja')

@app.route('/featured-reading/<subject>')
def featuredreading(subject):
    if subject.lower() == 'classics':
        sub_q = Catalog.query.filter(Catalog.interesting==1, Catalog.has_cover==1)
        sub_q = sub_q.order_by(Catalog.text_number).all()
        content = sub_q
        print(content)
    else:
        return render_template('missing.jinja')

    return render_template('featuredreading.jinja', content=content)

@map.register_generator
def featuredreading():
    subjects = ['adventure', 'scifi', 'mystery']
    for subject in subjects:
        yield 'featuredreading', {'subject': subject}

@app.route('/subjects')
def subjects():
    return render_template('missing.jinja')

@app.route('/about')
def about():
    return render_template('about.jinja')

@app.route('/title/<int:id>')
def title(id):
    book_q = Catalog.query.get(id)
    return render_template('book.jinja', content=book_q, ebook=id)

@map.register_generator
def title():
    title_ids = Catalog.query.filter(Catalog.is_local==1).all()
    for title in title_ids:
        yield 'title', {'id':title.text_number}

@app.route('/search')
def search():
    return render_template('missing.jinja')

@app.route('/robots.txt')
def robots():
    title_ids = Catalog.query.filter(Catalog.is_local==1).all()

    base = 'User-agent: Twitterbot\nAllow: /\nDisallow:\nUser-agent: *\nAllow: /\n'
    disallow = 'Disallow:/gutenbergpress/catalog/\nDisallow:/gutenbergpress/datafunc\n'
    title_allowed = [f'Allow: /title/{i.text_number}\n' for i in title_ids]
    data = base + disallow 
    for i in title_allowed: data += i
    data +=  "Disallow: /title/\n"
    resp = make_response(data)
    resp.mimetype = 'application/text'
    print(data)
    return resp

@app.route('/about/walter/resume')
def resume():
    return render_template('resume.jinja')


# @app.route('/gutenbergpress/catalog/title/<book_id>')
# def getbook(book_id):
#     req = requests.get(f"https://www.gutenberg.org/ebooks/{book_id}.html.images")
#     content = req.text
#     return render_template('book.jinja', content=content)