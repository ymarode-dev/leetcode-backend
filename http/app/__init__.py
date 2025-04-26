from flask import Flask
from .db import db
from flask_jwt_extended import JWTManager

jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///../database.db'
    app.config['SECRET_KEY'] = 'supersecret'
    app.config['JWT_SECRET_KEY'] = 'jwt-secret'

    db.init_app(app)
    jwt.init_app(app)

    from .routes import auth, problems, users
    app.register_blueprint(auth.bp)
    app.register_blueprint(problems.bp)
    app.register_blueprint(users.bp)

    with app.app_context():
        from . import models
        db.create_all()

    return app
