from . import db
from datetime import datetime
import json

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)
    solved = db.Column(db.Integer, default=0)

    problems_solved = db.relationship('Problem', secondary='user_problem', backref=db.backref('solved_by', lazy='dynamic'))

    def get_solved_problem_count(self):
        return len(self.problems_solved)

    def get_difficulty_count(self):
        counts = {'easy': 0, 'medium': 0, 'hard': 0}
        for problem in self.problems_solved:
            counts[problem.difficulty.lower()] += 1
        return counts

    def get_solved_problems(self):
        return [{
            'id': problem.id,
            'title': problem.title,
            'difficulty': problem.difficulty,
            'topic': problem.get_topic_list()
        } for problem in self.problems_solved]


class Problem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100))
    description = db.Column(db.Text)
    difficulty = db.Column(db.String(10))  # 'easy', 'medium', 'hard'
    topic = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def get_topic_list(self):
        return json.loads(self.topic) if self.topic else []

    def set_topic_list(self, topics):
        self.topic = json.dumps(topics)

user_problem = db.Table('user_problem',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True),
    db.Column('problem_id', db.Integer, db.ForeignKey('problem.id'), primary_key=True),
    db.Column('solved_at', db.DateTime, default=datetime.utcnow)
)
