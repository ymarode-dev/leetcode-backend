from flask import Blueprint, jsonify
from ..models import Problem

bp = Blueprint('problems', __name__, url_prefix='/problems')

@bp.route('/', methods=['GET'])
def list_problems():
    problems = Problem.query.all()
    return jsonify([{
        'id': p.id,
        'title': p.title,
        'difficulty': p.difficulty
    } for p in problems])

@bp.route('/<int:pid>', methods=['GET'])
def get_problem(pid):
    problem = Problem.query.get_or_404(pid)
    return jsonify({
        'id': problem.id,
        'title': problem.title,
        'description': problem.description,
        'difficulty': problem.difficulty
    })
