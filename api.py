from gutenbergpress import app, utilities
from gutenbergpress.models import Catalog, Authors, db
from flask_restful import Resource, Api
from flask import jsonify, send_file
import json
import requests 
import os

gutenberg_api = Api(app)


class GetByLetter(Resource):
    def get(self, letter=''):
        query = Catalog.query.filter(Catalog.sortkey.like(f"{letter}%"))\
                                     .order_by(Catalog.title).all()
        content = [{'title':i.title, 'author': i.authors, 
                    '_id':str(i.text_number), 'sortkey':i.sortkey} for i in query]
        return jsonify(content)


class GetCatalogTitleIndex(Resource):
    def get(self, letter=''):
        query = db.session.query(Catalog.sortkey).order_by(Catalog.sortkey).all()
        index = {i.sortkey[0]:[] for i in query if i.sortkey and i.sortkey[0].isalpha()}
        
        for i in query:
            key = i.sortkey
            if key and key[0].isalpha() and key not in index[key[0]]:
                index[i.sortkey[0]].append(i.sortkey)
            
        return jsonify(index)


class GetCatalogAuthorIndex(Resource):
    def get(self):
        query = db.session.query(Catalog.authors).order_by(Catalog.authors).all()
        index = {i.authors[0]:[] for i in query if i.authors and i.authors[0].isalpha()}
        
        for i in query:
            key = i.authors[:2]
            if key and key[0].isalpha() and key not in index[key[0]]:
                index[i.authors[0]].append(i.authors)
        
        resp = jsonify(index)
        return resp


class GetAuthors(Resource):
    def get(self, letter=""):
        query = db.session.query(Authors).filter(Authors.last_name\
                                    .like(f"{letter}%")).distinct()
        resp = [{'last_name':i.last_name, 'first_name':i.first_name, 'id':i.id} for i in query.order_by(Authors.last_name).all()]
        
        return resp


class GetTitlesByAuthor(Resource):
    def get(self, author): 
    
        get_works = db.session.query(Authors).filter(Authors.id.like(author)).scalar()
        get_works = json.loads(get_works.works)
        
        query = Catalog.query.filter(Catalog.text_number.in_(get_works))\
                                    .order_by(Catalog.title).all()
        resp = [{'title':i.title, 'author': i.authors, 'id':i.text_number} for i in query]

        return jsonify(resp)


class RetrieveTitle(Resource):
    def get(self, id):
        book = utilities.EbookFetcher()
        
        resp = book.download(id)
        
        if not resp['existed']:
            entry = db.session.query(Catalog).get(id)
            entry.is_local = 1
            db.session.commit()

        return send_file(resp['book'])
        

# Add the endpoints for the api

api_root = '/gutenbergpress/catalog'
gutenberg_api.add_resource(GetByLetter, f'{api_root}/', f'{api_root}/<string:letter>')
gutenberg_api.add_resource(GetCatalogTitleIndex, f'{api_root}/getsortkey/', f'{api_root}/getsortkey/<string:letter>')
gutenberg_api.add_resource(GetCatalogAuthorIndex, f'{api_root}/authorsindex')
gutenberg_api.add_resource(GetAuthors, f'{api_root}/authors', f'{api_root}/authors/<string:letter>')
gutenberg_api.add_resource(GetTitlesByAuthor, f'{api_root}/title/author/<string:author>')
gutenberg_api.add_resource(RetrieveTitle, f'{api_root}/title/<int:id>.epub')

class SendResumePDF(Resource):
    def get(self):
        
        resp = os.path.join(os.getcwd(), 'gutenbergpress/static/walter_branning_resume.pdf')
        print(resp)
        return send_file(resp)

gutenberg_api.add_resource(SendResumePDF, '/about/walter/resume/walter_branning_resume.pdf')


"""Quick Utility Code Pen: used to call functions to work database"""

# import json 
# class DataBaseFunc(Resource):
#     def get(self):
#         query = db.session.query(Catalog.text_number, Catalog.authors).all()
#         # print(query)
#         authors = {i[1]:[] for i in query}
#         for i in query:
#             authors[i[1]].append(i[0])

#         new_index = {}
#         resp = []
#         for i in authors.keys():
#             splt = i.split(';')
#             if len(splt) > 0:
#                 for item in splt:
#                     if item in new_index.keys(): 
#                         new_index[item] += authors[i]
#                     else:
#                         new_index[item] = authors[i]
        
#         for author in new_index.keys():
#             brake_down = author.split(',')
#             brake_down = [i.strip() for i in brake_down]
#             if len(brake_down[0].strip()) == 0:
#                 brake_down[0] = 'undefined' 
            
#             if len(brake_down) > 1:
#                 resp.append({'last_name':brake_down[0], 'first_name':brake_down[1], 'raw_name': author, 'works':new_index[author]})
#             else:
#                 resp.append({'last_name':brake_down[0], 'first_name':'', 'raw_name': author,  'works':new_index[author]})

#         for i in resp:
#             x  = Authors()
#             print(i.keys())
#             x.first_name = i['first_name']
#             x.last_name = i['last_name']
#             x.raw_name = i['raw_name']
#             x.works = json.dumps(i['works'])
            
#             db.session.add(x)
#         db.session.commit()
#         return jsonify(resp)

# class DataBaseFunc(Resource):
#     def get(self):
#         ids = os.listdir('gutenbergpress/static/ebooks')
#         ids = [i.strip('.epub') for i in ids]
        
#         for i in ids:
#             print(i)
#             query = db.session.query(Catalog).get(i)
#             query.is_local = 1
#             db.session.commit()
    # print()

# gutenberg_api.add_resource(DataBaseFunc, '/gutenbergpress/datafunc')
    # def get(self, letter):
    #     from string import punctuation
    #     clean = lambda t: t.translate(str.maketrans('','', punctuation)).upper()
    #     query = Catalog.query.filter(Catalog.title.like("The %")).all()
    #     for i in query:
    #         i.sortkey = clean(i.title)[4:6].upper()
            
    # #     #     print(i.sortkey)
        
    # #     query = Catalog.query.order_by('title').all()
    
    # #     for i in query:
    # #         if i.title[:4] != 'The ':
    # #             i.sortkey = clean(i.title[:2])
    # #             if i.title[0] in punctuation:
    # #                 i.sortkey = clean(i.title[1:3])
    # #         print(i.sortkey)
    #     db.session.commit()

    