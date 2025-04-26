from app import create_app, db
from app.models import Problem

app = create_app()

with app.app_context():
    db.drop_all()
    db.create_all()

    problems = [
        Problem(
            title="Two Sum",
            description="Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
            difficulty="easy",
        ),
        Problem(
            title="Reverse Integer",
            description="Given a signed 32-bit integer x, return x with its digits reversed. If reversing x causes the value to go outside signed 32-bit integer range, return 0.",
            difficulty="easy",
        ),
        Problem(
            title="Longest Substring Without Repeating Characters",
            description="Given a string s, find the length of the longest substring without repeating characters.",
            difficulty="medium",
        ),
        Problem(
            title="Median of Two Sorted Arrays",
            description="Given two sorted arrays nums1 and nums2, return the median of the two sorted arrays.",
            difficulty="hard",
        )
    ]

    # Set topics and test cases manually
    problems[0].set_topic_list(["Array", "HashMap"])
    problems[0].set_test_cases([
        {"input": {"nums": [2, 7, 11, 15], "target": 9}, "expected": [0, 1]},
        {"input": {"nums": [3, 2, 4], "target": 6}, "expected": [1, 2]},
        {"input": {"nums": [3, 3], "target": 6}, "expected": [0, 1]},
    ])

    problems[1].set_topic_list(["Math"])
    problems[1].set_test_cases([
        {"input": {"x": 123}, "expected": 321},
        {"input": {"x": -123}, "expected": -321},
        {"input": {"x": 120}, "expected": 21},
    ])

    problems[2].set_topic_list(["HashMap", "String", "Sliding Window"])
    problems[2].set_test_cases([
        {"input": {"s": "abcabcbb"}, "expected": 3},
        {"input": {"s": "bbbbb"}, "expected": 1},
        {"input": {"s": "pwwkew"}, "expected": 3},
    ])

    problems[3].set_topic_list(["Array", "Binary Search", "Divide and Conquer"])
    problems[3].set_test_cases([
        {"input": {"nums1": [1, 3], "nums2": [2]}, "expected": 2.0},
        {"input": {"nums1": [1, 2], "nums2": [3, 4]}, "expected": 2.5},
        {"input": {"nums1": [0, 0], "nums2": [0, 0]}, "expected": 0.0},
    ])

    db.session.bulk_save_objects(problems)
    db.session.commit()

    print("✅ Database seeded with dummy problems including topics and test cases!")
