from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import User

bp = Blueprint('users', __name__, url_prefix='/users')

@bp.route('/me', methods=['GET'])
@jwt_required()
def user_info():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "username": user.username,
        "total_solved": user.get_total_solved(),
        "difficulty_wise": user.get_difficulty_wise_count(),
        "solved_problems": user.get_solved_problems()
    })
