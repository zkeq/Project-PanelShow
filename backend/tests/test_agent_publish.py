from io import StringIO
from pathlib import Path
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def panelshow(monkeypatch, tmp_path):
    config_path = Path(__file__).resolve().parents[1] / "config.yaml"
    template = config_path.with_name("config.example.yaml").read_text(encoding="utf-8")
    original_open = open

    def open_with_test_config(path, *args, **kwargs):
        if path == config_path:
            return StringIO(template)
        return original_open(path, *args, **kwargs)

    with patch("builtins.open", open_with_test_config):
        import auth
        import db
        import main
        import notifications

    async def ignore_notification(*args):
        pass

    monkeypatch.setattr(db, "DATA_DIR", tmp_path)
    monkeypatch.setattr(notifications, "notify_site_initialized", ignore_notification)
    monkeypatch.setattr(notifications, "notify_project_created", ignore_notification)
    monkeypatch.setattr(notifications, "notify_project_updated", ignore_notification)
    monkeypatch.setattr(notifications, "FRONTEND_BASE_URL", "https://projects.example.test")
    with TestClient(main.app, base_url="https://api.example.test") as client:
        def bind(identity, username):
            token = auth.create_access_token(
                {"auth_type": "github", "github_id": identity, "github_username": username}
            )
            headers = {"Authorization": f"Bearer {token}"}
            response = client.post("/api/auth/bind-username", headers=headers, json={"username": username})
            assert response.status_code == 200
            return headers

        yield client, bind, db


def issue(client, owner, target=None):
    response = client.post("/api/agent/keys", headers=owner, json={"project_id": target})
    assert response.status_code == 201
    assert response.headers["Cache-Control"] == "no-store"
    key = response.json()
    return key, {"Authorization": f"Bearer {key['token']}", "Idempotency-Key": "test-publication"}


def sample():
    return {
        "slug": "project-example",
        "name": "Example project",
        "description": "A reproducible example.",
        "introduction": "## Overview\n\nThe project has a verified workflow.",
        "highlights": [{"title": "Workflow", "description": "Run and inspect the result."}],
        "overview": [{"label": "Runtime", "value": "FastAPI", "icon": "lucide:server"}] + [
            {"label": f"Aspect {number}", "value": f"Verified {number}", "icon": "logos:vue"}
            for number in range(2, 25)
        ],
    }


def test_create_from_agent_and_retry(panelshow):
    client, bind, db = panelshow
    owner = bind("1", "first-site")
    assert client.get("/api/agent/onboarding", headers=owner).json() == {"show": True}
    assert client.get("/api/agent/v1/schema").json()["schema"]["title"] == "Submission"
    key, agent = issue(client, owner)
    assert client.get("/api/agent/onboarding", headers=owner).json() == {"show": False}
    image = b"\x89PNG\r\n\x1a\n" + bytes(25)
    uploaded = client.post(
        "/api/agent/v1/assets", headers=agent, files={"file": ("screen.png", image, "image/png")}
    )
    assert uploaded.status_code == 201
    body = sample()
    body["screenshots"] = [{
        "asset_id": uploaded.json()["asset_id"], "title": "Main screen", "caption": "The main screen"
    }]
    submitted = client.post("/api/agent/v1/publish", headers=agent, json=body)
    assert submitted.status_code == 200, submitted.text
    result = submitted.json()
    assert result["operation"] == "create"
    assert result["url"] == f"https://projects.example.test/project/first-site/{result['project_id']}"
    assert client.post("/api/agent/v1/publish", headers=agent, json=body).json() == result
    assert client.post("/api/agent/v1/publish", headers=agent, json={**body, "name": "Different"}).status_code == 409
    project = client.get(f"/api/projects/first-site/{result['project_id']}").json()["data"]
    assert project["screenshots"][0]["description"] == "The main screen"
    assert project["screenshots"][0]["name"] == "Main screen"
    assert project["heroAttributes"][0]["value"] == "FastAPI"
    assert project["heroAttributes"][0]["icon"] == "lucide:server"
    assert project["sidebarAttributes"][1]["icon"] == "logos:vue"
    assert len(project["projectInfos"]) == 24
    assert len(project["homeAttributes"]) == 4
    assert len(project["sidebarAttributes"]) == 8
    assert project["projectInfos"][8]["showInSidebar"] is False
    assert len(db.read_json("first-site", "projects.json")) == 1
    status = client.get("/api/agent/keys", headers=owner).json()["keys"][0]
    assert "token" not in status
    assert status["id"] == key["id"]
    assert status["result"] == result
    assert key["token"].encode() not in (db.DATA_DIR / "agent.sqlite3").read_bytes()


def test_agent_credentials_and_assets_are_scoped(panelshow):
    client, bind, _ = panelshow
    alice = bind("1", "first-site")
    bob = bind("2", "second-site")
    key, alice_agent = issue(client, alice)
    _, bob_agent = issue(client, bob)
    assert client.post("/api/projects/second-site", headers=alice_agent, json=sample()).status_code == 401
    assert client.post("/api/agent/v1/publish", headers=alice, json=sample()).status_code != 200
    assert client.delete(f"/api/agent/keys/{key['id']}", headers=bob).status_code == 404
    uploaded = client.post(
        "/api/agent/v1/assets",
        headers=alice_agent,
        files={"file": ("screen.png", b"\x89PNG\r\n\x1a\n" + bytes(25), "image/png")},
    ).json()
    body = {**sample(), "screenshots": [{"asset_id": uploaded["asset_id"], "caption": "Wrong owner"}]}
    assert client.post("/api/agent/v1/publish", headers=bob_agent, json=body).status_code == 422
    assert client.delete(f"/api/agent/keys/{key['id']}", headers=alice).status_code == 204
    assert client.post("/api/agent/v1/publish", headers=alice_agent, json=sample()).status_code == 401
    assert client.post("/api/agent/onboarding/dismiss", headers=bob).status_code == 204
    assert client.get("/api/agent/onboarding", headers=bob).json() == {"show": False}


def test_edit_preserves_existing_fields_and_detects_stale_keys(panelshow):
    client, bind, db = panelshow
    owner = bind("1", "first-site")
    db.write_json("first-site", "projects.json", [
        {"id": "existing", "name": "Original", "description": "Preserve me", "custom": ["legacy"], "order": 4}
    ])
    _, agent = issue(client, owner, "existing")
    stale = db.read_json("first-site", "projects.json")[0]
    assert client.put(
        "/api/projects/first-site/existing", headers=owner, json={**stale, "name": "Manual edit"}
    ).status_code == 200
    assert client.post("/api/agent/v1/publish", headers=agent, json={"name": "Stale edit"}).status_code == 409
    _, agent = issue(client, owner, "existing")
    submitted = client.post("/api/agent/v1/publish", headers=agent, json={"name": "Agent edit"})
    assert submitted.status_code == 200, submitted.text
    assert submitted.json()["operation"] == "update"
    project = db.read_json("first-site", "projects.json")[0]
    assert project["name"] == "Agent edit"
    assert project["description"] == "Preserve me"
    assert project["custom"] == ["legacy"]
    assert project["order"] == 4


def test_expired_key_and_invalid_content(panelshow):
    client, bind, db = panelshow
    owner = bind("1", "first-site")
    key, agent = issue(client, owner)
    assert client.post("/api/agent/v1/publish", headers=agent, json={
        **sample(), "introduction": "<img src=x>"
    }).status_code == 422
    assert client.post(
        "/api/agent/v1/assets", headers=agent, files={"file": ("fake.png", b"not a PNG", "image/png")}
    ).status_code == 415
    with db.project_write() as connection:
        connection.execute("UPDATE agent_keys SET expires_at = 0 WHERE id = ?", (key["id"],))
    assert client.post("/api/agent/v1/publish", headers=agent, json=sample()).status_code == 401


def test_overview_requires_24_distinct_items(panelshow):
    client, bind, _ = panelshow
    owner = bind("1", "first-site")
    _, agent = issue(client, owner)
    body = sample()
    assert client.post("/api/agent/v1/publish", headers=agent, json={
        **body, "overview": body["overview"][:-1]
    }).status_code == 422
    repeated = [body["overview"][0]] * 24
    assert client.post("/api/agent/v1/publish", headers=agent, json={
        **body, "overview": repeated
    }).status_code == 422

    body["overview"][0]["icon"] = "server"
    assert client.post("/api/agent/v1/publish", headers=agent, json=body).status_code == 422
    del body["overview"][0]["icon"]
    assert client.post("/api/agent/v1/publish", headers=agent, json=body).status_code == 422


def test_create_without_screenshots_goes_first(panelshow):
    client, bind, db = panelshow
    owner = bind("1", "first-site")
    db.write_json("first-site", "projects.json", [
        {"id": "formerly-first", "order": "-3"}, {"id": "legacy"}, {"id": "last", "order": 10}
    ])
    _, agent = issue(client, owner)
    response = client.post("/api/agent/v1/publish", headers=agent, json=sample())
    assert response.status_code == 200, response.text
    project_id = response.json()["project_id"]
    records = client.get("/api/projects/first-site").json()["data"]
    assert [record["id"] for record in records] == [project_id, "formerly-first", "legacy", "last"]
