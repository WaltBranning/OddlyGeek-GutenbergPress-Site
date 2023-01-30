from gutenbergpress import app
from flask_sqlalchemy import SQLAlchemy

# The SQLAlchemy model description classes
 
db = SQLAlchemy()
db.init_app(app)


class Catalog(db.Model):
    __tablename__ = 'catalog'

    text_number = db.Column(db.Integer, primary_key=True)
    type =        db.Column(db.String)
    issued =      db.Column(db.String)
    title =       db.Column(db.String)
    authors =     db.Column(db.String)
    language =    db.Column(db.String)
    subjects =    db.Column(db.String)
    locc =        db.Column(db.String)
    bookshelves = db.Column(db.String)
    sortkey =     db.Column(db.String)
    starred =     db.Column(db.Integer)
    has_cover =   db.Column(db.Integer)
    interesting = db.Column(db.Integer)
    genre =       db.Column(db.String)
    author_id =   db.Column(db.String)
    is_local =    db.Column(db.Integer)


class Authors(db.Model):
    __tablename__ = 'authors'

    id =          db.Column(db.Integer, primary_key=True)
    last_name =   db.Column(db.String)
    first_name =  db.Column(db.String)
    raw_name =    db.Column(db.String)
    years =       db.Column(db.String)
    works =       db.Column(db.String)
    bio =         db.Column(db.String)
    associates =  db.Column(db.String)
    genres =      db.Column(db.String)
    index_key =   db.Column(db.String)
    featured =    db.Column(db.Integer)