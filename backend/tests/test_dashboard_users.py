
def register_and_login(client, email, full_name):
    client.post(
        "/api/v1/auth/register",
        json={
            "full_name": full_name,
            "email": email,
            "password": "TestPassword123!",
        },
    )

    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": email,
            "password": "TestPassword123!",
        },
    )

    assert response.status_code == 200

    return response.json()["access_token"]


def test_member_dashboard_summary(client):
    token = register_and_login(
        client,
        "dashboard@example.com",
        "Dashboard User",
    )

    headers = {"Authorization": f"Bearer {token}"}

    client.post(
        "/api/v1/tasks/",
        headers=headers,
        json={
            "title": "Dashboard test task",
            "status": "TODO",
            "priority": "HIGH",
        },
    )

    response = client.get(
        "/api/v1/dashboard/summary",
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()["data"]

    assert data["total_tasks"] == 1
    assert data["completed_tasks"] == 0
    assert data["pending_tasks"] == 1
    assert data["overdue_tasks"] == 0


def test_member_cannot_access_users_api(client):
    token = register_and_login(
        client,
        "useraccess@example.com",
        "User Access Member",
    )

    response = client.get(
        "/api/v1/users/",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 403


def test_users_api_requires_authentication(client):
    response = client.get("/api/v1/users/")

    assert response.status_code == 401
