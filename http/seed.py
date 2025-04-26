from app import create_app, db
from app.models import Problem
import json

app = create_app()

with app.app_context():
    # Drop all existing tables and create new ones
    db.drop_all()
    db.create_all()

    # Define a list of problems to be inserted into the database
    problems = [
        Problem(
            title="Two Sum",
            description="Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
            difficulty="easy",
            topic=json.dumps(["Array", "HashMap"])  # Convert list to JSON string
        ),
        Problem(
            title="Reverse Integer",
            description="Given a signed 32-bit integer x, return x with its digits reversed.",
            difficulty="easy",
            topic=json.dumps(["Math"])  # Convert list to JSON string
        ),
        Problem(
            title="Longest Substring Without Repeating Characters",
            description="Given a string s, find the length of the longest substring without repeating characters.",
            difficulty="medium",
            topic=json.dumps(["String", "Sliding Window"])  # Convert list to JSON string
        ),
        Problem(
            title="Median of Two Sorted Arrays",
            description="Given two sorted arrays nums1 and nums2, return the median of the two sorted arrays.",
            difficulty="hard",
            topic=json.dumps(["Array", "Binary Search"])  # Convert list to JSON string
        )
    ]

    # Insert the problems into the database
    db.session.bulk_save_objects(problems)
    db.session.commit()

    print("✅ Database seeded with dummy problems!")
