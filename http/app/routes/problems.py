from flask import Blueprint, jsonify, request
from ..models import Problem
from .. import db

bp = Blueprint('problems', __name__, url_prefix='/problems')

@bp.route('/', methods=['GET'])
def list_problems():
    difficulty = request.args.get('difficulty')
    topic = request.args.get('topic')

    query = Problem.query

    if difficulty:
        query = query.filter(Problem.difficulty.ilike(difficulty.lower())) 
    
    if topic:
        query = query.filter(Problem.topic.ilike(f'%{topic}%'))  

    problems = query.all()

    return jsonify([{
        'id': p.id,
        'title': p.title,
        'difficulty': p.difficulty,
        'topic': p.get_topic_list()
    } for p in problems])

@bp.route('/<int:pid>', methods=['GET'])
def get_problem(pid):
    problem = Problem.query.get_or_404(pid)
    return jsonify({
        'id': problem.id,
        'title': problem.title,
        'description': problem.description,
        'difficulty': problem.difficulty,
        'topic': problem.get_topic_list(),
        'test_cases': problem.get_test_cases() 
    })
