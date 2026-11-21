


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


def test_create_task_successfully(client):
    token = register_and_login(
        client,
        "taskcreator@example.com",
        "Task Creator",
    )

    response = client.post(
        "/api/v1/tasks/",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "title": "Create automated tests",
            "description": "Test task creation.",
            "status": "TODO",
            "priority": "HIGH",
        },
    )

    assert response.status_code == 201

    data = response.json()["data"]

    assert data["title"] == "Create automated tests"
    assert data["status"] == "TODO"
    assert data["priority"] == "HIGH"


def test_list_tasks_only_shows_member_tasks(client):
    token = register_and_login(
        client,
        "tasklist@example.com",
        "Task List User",
    )

    client.post(
        "/api/v1/tasks/",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "title": "My private task",
            "status": "TODO",
            "priority": "MEDIUM",
        },
    )

    response = client.get(
        "/api/v1/tasks/",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200

    data = response.json()

    assert data["meta"]["total"] == 1
    assert data["data"][0]["title"] == "My private task"


def test_member_cannot_delete_task(client):
    token = register_and_login(
        client,
        "taskmember@example.com",
        "Task Member",
    )

    create_response = client.post(
        "/api/v1/tasks/",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "title": "Task for deletion test",
            "status": "TODO",
            "priority": "LOW",
        },
    )

    task_id = create_response.json()["data"]["id"]

    delete_response = client.delete(
        f"/api/v1/tasks/{task_id}",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert delete_response.status_code == 403


def test_task_filter_by_priority(client):
    token = register_and_login(
        client,
        "taskfilter@example.com",
        "Task Filter User",
    )

    headers = {"Authorization": f"Bearer {token}"}

    client.post(
        "/api/v1/tasks/",
        headers=headers,
        json={
            "title": "High priority task",
            "status": "TODO",
            "priority": "HIGH",
        },
    )

    client.post(
        "/api/v1/tasks/",
        headers=headers,
        json={
            "title": "Low priority task",
            "status": "TODO",
            "priority": "LOW",
        },
    )

    response = client.get(
        "/api/v1/tasks/?priority=HIGH",
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["meta"]["total"] == 1
    assert data["data"][0]["priority"] == "HIGH"
