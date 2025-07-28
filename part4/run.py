from hbnb.app import create_app
from hbnb.app.extensions import db
import os

if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))

    app = create_app("config.DevelopmentConfig")

    with app.app_context():
        db.create_all()

    app.run(debug=True, host="127.0.0.1", port=5000)
