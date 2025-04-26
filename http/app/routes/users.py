from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import User

bp = Blueprint('users', __name__, url_prefix='/users')

@bp.route('/me', methods=['GET'])
@jwt_required()
def user_info():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    return jsonify({
        'username': user.username,
        'solved': user.solved
    })
