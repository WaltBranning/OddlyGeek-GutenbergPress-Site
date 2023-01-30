import os
import wget
from gutenbergpress import app

# Utilities and helpers for oddlygeek and GutenbergPress API

class EbookFetcher:
    def __init__(self):
        self.source = 'https://www.gutenberg.org/ebooks/'
        self.default_ebook = '.epub.images'
        self.dest = os.path.join(os.getcwd(), 'gutenbergpress/static/ebooks/')

    def download(self, book_id):
        book_id = str(book_id)
        get_book = lambda url: wget.download(url,self.dest+book_id+'.epub')
        
        #Check if book already exists, if True don't download
        if f"{book_id}.epub" in os.listdir(self.dest):
            # print(f"Book {book_id} exists at: {self.dest}\n")
            return {'existed': True, 'book':self.dest+book_id+'.epub'}
        else:
            url = ''.join([self.source, str(book_id), self.default_ebook])
            get_book(url)
        
        return {'existed': False, 'book':self.dest+book_id+'.epub'}

