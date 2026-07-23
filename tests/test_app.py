import src.app as app_module


def test_get_activities_returns_activity_catalog(client):
    response = client.get("/activities")

    assert response.status_code == 200
    data = response.json()

    assert isinstance(data, dict)
    assert "Chess Club" in data
    assert data["Chess Club"]["max_participants"] == 12
    assert "michael@mergington.edu" in data["Chess Club"]["participants"]


def test_signup_for_activity_success(client):
    activity_name = "Chess Club"
    email = "newstudent@mergington.edu"

    response = client.post(
        f"/activities/{activity_name}/signup?email={email}"
    )

    assert response.status_code == 200
    assert response.json()["message"] == f"Signed up {email} for {activity_name}"

    activities = client.get("/activities").json()
    assert email in activities[activity_name]["participants"]


def test_duplicate_signup_returns_400(client):
    activity_name = "Chess Club"
    email = "michael@mergington.edu"

    response = client.post(
        f"/activities/{activity_name}/signup?email={email}"
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Student is already signed up"


def test_signup_when_activity_is_full_returns_400(client):
    activity_name = "Full Test Activity"
    app_module.activities[activity_name] = {
        "description": "A test activity that is already full",
        "schedule": "Mondays, 4:00 PM - 5:00 PM",
        "max_participants": 1,
        "participants": ["existing@mergington.edu"],
    }

    response = client.post(
        f"/activities/{activity_name}/signup?email=another@mergington.edu"
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Activity is full"


def test_unregister_participant_removes_email_from_activity(client):
    activity_name = "Chess Club"
    email = "michael@mergington.edu"

    response = client.delete(
        f"/activities/{activity_name}/unregister?email={email}"
    )

    assert response.status_code == 200
    assert response.json()["message"] == f"Unregistered {email} from {activity_name}"

    activities = client.get("/activities").json()
    assert email not in activities[activity_name]["participants"]
