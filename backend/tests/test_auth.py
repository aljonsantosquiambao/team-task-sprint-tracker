
def test_register_user_successfully(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Test User",
            "email": "testuser@example.com",
            "password": "TestPassword123!",
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["email"] == "testuser@example.com"
    assert data["role"] == "MEMBER"
    assert "hashed_password" not in data


def test_register_duplicate_email(client):
    payload = {
        "full_name": "Duplicate User",
        "email": "duplicate@example.com",
        "password": "TestPassword123!",
    }

    first_response = client.post(
        "/api/v1/auth/register",
        json=payload,
    )

    second_response = client.post(
        "/api/v1/auth/register",
        json=payload,
    )

    assert first_response.status_code == 201
    assert second_response.status_code == 409


def test_login_successfully(client):
    client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Login Test",
            "email": "login@example.com",
            "password": "TestPassword123!",
        },
    )

    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "login@example.com",
            "password": "TestPassword123!",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["token_type"] == "bearer"
    assert data["access_token"]
    assert data["user"]["email"] == "login@example.com"


def test_login_with_wrong_password(client):
    client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Wrong Password Test",
            "email": "wrongpassword@example.com",
            "password": "CorrectPassword123!",
        },
    )

    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "wrongpassword@example.com",
            "password": "IncorrectPassword123!",
        },
    )

    assert response.status_code == 401
