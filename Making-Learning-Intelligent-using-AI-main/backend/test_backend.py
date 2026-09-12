import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def run_tests():
    print("--- 1. Testing Root and Health ---")
    r = client.get("/")
    assert r.status_code == 200, f"Root failed: {r.text}"
    print(" Root:", r.json()["platform"])

    print("\n--- 2. Testing Student Login (Arun) ---")
    r = client.post("/api/v1/auth/login", json={"email": "arun@learniq.com", "password": "password123"})
    assert r.status_code == 200, f"Login failed: {r.text}"
    token_student = r.json()["access_token"]
    student_id = r.json()["user_id"]
    print(f" Student login success: {r.json()['full_name']} (Role: {r.json()['role']})")

    print("\n--- 3. Testing Auth Me ---")
    r = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token_student}"})
    assert r.status_code == 200, f"Auth me failed: {r.text}"
    print(f" Current user: {r.json()['email']} (Learning Style: {r.json()['learning_style']})")

    print("\n--- 4. Testing AI Knowledge Profile ---")
    r = client.get(f"/api/v1/students/{student_id}/knowledge-profile")
    assert r.status_code == 200, f"Profile failed: {r.text}"
    profile = r.json()
    print(f" Overall Mastery: {profile['overall_mastery']}%")
    print(f" Weak Topics: {profile['weak_topics']}")
    print(f" Support Tier: {profile['support_tier']}")

    print("\n--- 5. Testing Risk Prediction with Explainability ---")
    r = client.get(f"/api/v1/students/{student_id}/risk")
    assert r.status_code == 200, f"Risk failed: {r.text}"
    risk = r.json()
    print(f" Risk Level: {risk['risk_level']} ({risk['risk_score']}%)")
    print(f" Reasons: {risk['reasons']}")

    print("\n--- 6. Testing Personalized Recommendations ---")
    r = client.get(f"/api/v1/students/{student_id}/recommendations")
    assert r.status_code == 200, f"Recommendations failed: {r.text}"
    rec = r.json()
    print(f" Recommended Next: {rec['recommended_next']}")
    print(f" Why: {rec['explanation']}")

    print("\n--- 7. Testing Intelligent Mentor Matching ---")
    r = client.get(f"/api/v1/mentors/match/{student_id}")
    assert r.status_code == 200, f"Match failed: {r.text}"
    matches = r.json()
    assert len(matches) > 0
    print(f" Top Match: {matches[0]['mentor_name']} ({matches[0]['match_score']}%)")
    print(f" Why Matched: {matches[0]['match_reasons']}")

    print("\n--- 8. Testing Teacher Login & Analytics ---")
    r = client.post("/api/v1/auth/login", json={"email": "sarah@learniq.com", "password": "password123"})
    assert r.status_code == 200
    t_token = r.json()["access_token"]
    t_id = r.json()["user_id"]
    print(f" Teacher login success: {r.json()['full_name']}")

    r = client.get(f"/api/v1/teacher-analytics/dashboard/{t_id}")
    assert r.status_code == 200
    analytics = r.json()
    print(f" Total Students: {analytics['total_students']}, High Risk: {analytics['high_risk_count']}")
    print(f" Class Average Mastery: {analytics['average_class_mastery']}%")

    print("\n--- 9. Testing High Risk Faculty Intervention Queue ---")
    r = client.get("/api/v1/interventions/high-risk")
    assert r.status_code == 200
    high_risk = r.json()
    print(f" High Risk Queue count: {len(high_risk)}")
    assert len(high_risk) > 0
    first_hr = high_risk[0]
    print(f" Target Student: {first_hr['student_name']}, Reason: {first_hr['trigger_reason'][:60]}...")

    print("\n--- 10. Testing Closed-Loop Reassessment ---")
    r = client.post(f"/api/v1/interventions/{first_hr['id']}/reassess", json={
        "intervention_id": first_hr["id"],
        "topic": "Arrays",
        "score": 85.0,
        "max_score": 100.0
    })
    assert r.status_code == 200
    reassess = r.json()
    print(f" Reassessment Outcome: {reassess['outcome']}")
    print(f" Before Mastery: {reassess['before_mastery']}% -> After: {reassess['after_mastery']}%")
    print(f" Before Risk: {reassess['before_risk']}% -> After: {reassess['after_risk']}%")
    print(f" Message: {reassess['message']}")

    print("\n ALL BACKEND APIS AND CLOSED-LOOP TESTS PASSED PERFECTLY!")

if __name__ == "__main__":
    run_tests()
