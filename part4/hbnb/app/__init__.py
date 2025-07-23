from flask import Flask
from flask_restx import Api
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from hbnb.app.extensions import db
from flask_cors import CORS
from flask import render_template
import os

bcrypt = Bcrypt()
jwt = JWTManager()

def create_app(config_class="config.DevelopmentConfig"):
    app = Flask(
    __name__,
    template_folder=os.path.abspath("templates"),
    static_folder=os.path.abspath("static")
    )
    app.config.from_object(config_class)

    CORS(app, supports_credentials=True, resources={r"/api/*": {"origins": "*"}})

    bcrypt.init_app(app)
    jwt.init_app(app)
    db.init_app(app)

    from hbnb.app.api.v1.users import api as users_ns
    from hbnb.app.api.v1.amenities import api as amenities_ns
    from hbnb.app.api.v1.places import api as places_ns
    from hbnb.app.api.v1.reviews import api as review_ns
    from hbnb.app.api.v1.auth import api as auth_ns
    from hbnb.app.api.v1.protected import api as protected_ns

    # Simple API setup with Bearer token support for Swagger testing
    authorizations = {
        'Bearer': {
            'type': 'apiKey',
            'in': 'header',
            'name': 'Authorization',
            'description': 'Enter: Bearer <your_token>'
        }
    }

    api = Api(
        app,
        version='1.0',
        title='HBnB API',
        description='HBnB Application API',
        doc='/api_docs',
        authorizations=authorizations,
        security='Bearer'
    )

    api.add_namespace(users_ns, path='/api/v1/users')
    api.add_namespace(amenities_ns, path='/api/v1/amenities')
    api.add_namespace(places_ns, path='/api/v1/places')
    api.add_namespace(review_ns, path='/api/v1/reviews')
    api.add_namespace(auth_ns, path='/api/v1/auth')
    api.add_namespace(protected_ns, path='/api/v1/protected')

    @app.route('/index')
    def index():
        return render_template('index.html')

    @app.route('/login')
    def login():
        return render_template('login.html')

    @app.route('/place')
    def place():
        return render_template('place.html')

    @app.route('/add_review')
    def add_review():
        return render_template('add_review.html')

    return app

