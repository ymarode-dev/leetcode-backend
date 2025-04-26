from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import User

bp = Blueprint('users', __name__, url_prefix='/users')

@bp.route('/me', methods=['GET'])
@jwt_required()
def user_info():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if user is None:
        return jsonify({"error": "User not found"}), 404

    total_solved = user.get_solved_problem_count()
    difficulty_count = user.get_difficulty_count()

    solved_problems = user.get_solved_problems()

    return jsonify({
        'username': user.username,
        'total_solved': total_solved,
        'difficulty_count': difficulty_count,
        'problems': solved_problems
    })
