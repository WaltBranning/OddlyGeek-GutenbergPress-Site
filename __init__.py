from flask import Flask
from gutenbergpress.config import DefaultConfig


def create_app(config=DefaultConfig):
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object(config)
    return app

app  = create_app()
from gutenbergpress import views