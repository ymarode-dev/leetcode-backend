from flask import Blueprint, request, jsonify
from ..models import User
from .. import db
from ..utils import hash_password, verify_password
from flask_jwt_extended import create_access_token

bp = Blueprint('auth', __name__, url_prefix='/auth')

@bp.route('/signup', methods=['POST'])
def signup():
    data = request.json
    if User.query.filter_by(username=data['username']).first():
        return jsonify({"msg": "User already exists"}), 400
    user = User(username=data['username'], password=hash_password(data['password']))
    db.session.add(user)
    db.session.commit()
    return jsonify({"msg": "User created"}), 201

@bp.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(username=data['username']).first()
    if not user or not verify_password(user.password, data['password']):
        return jsonify({"msg": "Invalid credentials"}), 401
    token = create_access_token(identity=user.id)
    return jsonify(access_token=token)
