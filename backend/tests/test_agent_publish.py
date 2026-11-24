from io import StringIO
from pathlib import Path
from time import time
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
        import agent_publish
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
    monkeypatch.setattr(agent_publish, "build_cos_key", lambda *parts: "/".join(parts))
    monkeypatch.setattr(agent_publish, "public_cos_url", lambda key: f"https://images.example.test/{key}")
    monkeypatch.setattr(agent_publish, "sign_cos_upload", lambda key, content_type, size, expires_in: {
        "method": "PUT", "url": f"https://bucket.example.test/{key}", "headers": {"Content-Type": content_type},
    })
    monkeypatch.setattr(agent_publish, "cos_upload_matches", lambda key, content_type, size: True)
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
            for number in range(2, 21)
        ],
    }


def reserve_image(client, agent):
    return client.post("/api/agent/v1/assets", headers=agent, json={"content_type": "image/png", "size": 33})


def complete_image(client, agent, asset_id):
    return client.post(f"/api/agent/v1/assets/{asset_id}/complete", headers=agent)


def test_create_from_agent_and_retry(panelshow):
    client, bind, db = panelshow
    owner = bind("1", "first-site")
    assert client.get("/api/agent/onboarding", headers=owner).json() == {"show": True}
    assert client.get("/api/agent/v1/schema").json()["schema"]["title"] == "Submission"
    key, agent = issue(client, owner)
    assert client.get("/api/agent/onboarding", headers=owner).json() == {"show": False}
    reserved = reserve_image(client, agent)
    assert reserved.status_code == 201, reserved.text
    assert reserved.headers["Cache-Control"] == "no-store"
    asset_id = reserved.json()["asset_id"]
    object_path = f"first-site/agent-projects/{asset_id}.png"
    assert reserved.json()["upload"]["url"] == f"https://bucket.example.test/{object_path}"
    body = sample()
    body["screenshots"] = [{
        "asset_id": asset_id, "title": "Main screen", "caption": "The main screen"
    }]
    assert client.post("/api/agent/v1/publish", headers=agent, json=body).status_code == 422
    assert complete_image(client, agent, asset_id).status_code == 200
    assert complete_image(client, agent, asset_id).status_code == 200
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
    assert project["screenshots"][0]["url"] == f"https://images.example.test/{object_path}"
    assert not (db.DATA_DIR / "uploads").exists()
    assert project["heroAttributes"][0]["value"] == "FastAPI"
    assert project["heroAttributes"][0]["icon"] == "lucide:server"
    assert project["sidebarAttributes"][1]["icon"] == "logos:vue"
    assert len(project["projectInfos"]) == 20
    assert len(project["homeAttributes"]) == 4
    assert len(project["sidebarAttributes"]) == 8
    assert project["projectInfos"][8]["showInSidebar"] is False
    assert len(db.read_json("first-site", "projects.json")) == 1
    status = client.get("/api/agent/keys", headers=owner).json()["keys"][0]
    assert "token" not in status
    assert status["id"] == key["id"]
    assert status["status"] == "ready"
    assert status["result"] == result
    assert int(time()) + 7 * 86400 - 10 <= key["expires_at"] <= int(time()) + 7 * 86400
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
    asset_id = reserve_image(client, alice_agent).json()["asset_id"]
    assert complete_image(client, bob_agent, asset_id).status_code == 404
    assert complete_image(client, alice_agent, asset_id).status_code == 200
    body = {**sample(), "screenshots": [{"asset_id": asset_id, "caption": "Wrong owner"}]}
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
    second_headers = {**agent, "Idempotency-Key": "another-edit"}
    second = client.post("/api/agent/v1/publish", headers=second_headers, json={"name": "Later agent edit"})
    assert second.status_code == 200, second.text
    assert second.json()["project_id"] == "existing"
    assert db.read_json("first-site", "projects.json")[0]["name"] == "Later agent edit"


def test_same_site_key_creates_and_updates_by_project_id(panelshow):
    client, bind, db = panelshow
    owner = bind("1", "first-site")
    other = bind("2", "second-site")
    db.write_json("first-site", "projects.json", [{"id": "original", "name": "Original", "order": 3}])
    db.write_json("second-site", "projects.json", [{"id": "other-project", "name": "Other", "order": 1}])
    key, agent = issue(client, owner)

    path = "/api/agent/v1/publish"
    created = client.post(path, headers=agent, json=sample())
    assert created.status_code == 200, created.text
    assert created.json()["operation"] == "create"
    new_id = created.json()["project_id"]
    edited = {"project_id": "original", "description": "Updated card", "introduction": "## Revised architecture"}
    edit_headers = {**agent, "Idempotency-Key": "test-shared-key-update"}
    updated = client.post(path, headers=edit_headers, json=edited)
    assert updated.status_code == 200, updated.text
    assert updated.json() == {
        "project_id": "original", "operation": "update", "url": "https://projects.example.test/project/first-site/original"
    }
    assert client.post(path, headers=edit_headers, json=edited).json() == updated.json()
    assert client.post(path, headers=edit_headers, json={**edited, "project_id": new_id}).status_code == 409

    foreign_attempt = {**agent, "Idempotency-Key": "test-foreign-update"}
    assert client.post(path, headers=foreign_attempt, json={"project_id": "other-project", "name": "Wrong site"}).status_code == 404
    _, other_agent = issue(client, other)
    assert client.post(path, headers=other_agent, json=edited).status_code == 404
    _, legacy_agent = issue(client, owner, "original")
    assert client.post(path, headers=legacy_agent, json={"project_id": new_id, "name": "Wrong project"}).status_code == 403

    records = client.get("/api/projects/first-site").json()["data"]
    assert [record["id"] for record in records] == [new_id, "original"]
    assert records[1]["name"] == "Original" and records[1]["order"] == 3
    assert records[1]["description"] == edited["description"]
    assert records[1]["projectIntroduction"] == edited["introduction"]
    assert db.read_json("second-site", "projects.json")[0]["name"] == "Other"
    shared_key = next(item for item in client.get("/api/agent/keys", headers=owner).json()["keys"] if item["id"] == key["id"])
    assert shared_key["project_id"] is None and shared_key["status"] == "ready"


def test_hidden_projects_are_unlisted_but_accessible_by_link(panelshow):
    client, bind, db = panelshow
    owner = bind("1", "first-site")
    visitor = bind("2", "second-site")
    projects_url = "/api/projects/first-site"
    timeline_url = "/api/timeline/first-site"
    stacks_url = "/api/tech-stacks/first-site"
    hidden_project = {"id": "share-by-link", "name": "Hidden", "hidden": True}
    assert client.post(projects_url, headers=owner, json={"id": "public", "name": "Public"}).status_code == 200
    assert client.post(projects_url, headers=owner, json=hidden_project).status_code == 200
    db.write_json("first-site", "timeline.json", [
        {"id": "public-log", "project_id": "public"}, {"id": "hidden-log", "project_id": "share-by-link"},
    ])
    db.write_json("first-site", "settings_techStacks.json", {"categories": [{
        "id": "backend", "label": "Backend", "children": [{
            "id": "python", "label": "Python", "projectIds": ["public", "share-by-link"],
        }],
    }]})

    public_list = client.get(projects_url).json()
    assert public_list["total"] == 1
    assert [project["id"] for project in public_list["data"]] == ["public"]
    assert [item["id"] for item in client.get(timeline_url).json()["data"]] == ["public-log"]
    assignments = client.get(stacks_url).json()["data"]["projectAssignments"]
    assert set(assignments) == {"public"}

    detail = client.get(f"{projects_url}/share-by-link")
    assert detail.status_code == 200
    assert detail.headers["X-Robots-Tag"] == "noindex, nofollow"
    assert detail.json()["data"]["hidden"] is True
    assert [item["id"] for item in detail.json()["data"]["timeline_items"]] == ["hidden-log"]

    for url in (projects_url, timeline_url, stacks_url):
        private_url = f"{url}?include_hidden=true"
        assert client.get(private_url).status_code == 401
        assert client.get(private_url, headers=visitor).status_code == 403
        private_response = client.get(private_url, headers=owner)
        assert private_response.status_code == 200
        assert private_response.headers["Cache-Control"] == "private, no-store"
        assert "Authorization" in private_response.headers["Vary"]
        assert "share-by-link" in private_response.text

    detail_url = f"{projects_url}/share-by-link"
    assert client.put(detail_url, headers=owner, json={"name": "Renamed"}).json()["data"]["hidden"] is True
    assert client.get(projects_url).json()["total"] == 1
    assert client.put(detail_url, headers=owner, json={"name": "Renamed", "hidden": "false"}).status_code == 422
    assert client.put(detail_url, headers=owner, json={"name": "Renamed", "hidden": False}).status_code == 200
    assert client.get(projects_url).json()["total"] == 2
    assert "X-Robots-Tag" not in client.get(detail_url).headers


def test_agent_can_publish_hidden_project_and_make_it_listed(panelshow):
    client, bind, _ = panelshow
    owner = bind("1", "first-site")
    _, key_headers = issue(client, owner)
    publish_url = "/api/agent/v1/publish"
    assert client.post(publish_url, headers=key_headers, json={**sample(), "hidden": "true"}).status_code == 422
    submission = client.post(publish_url, headers=key_headers, json={**sample(), "hidden": True})
    assert submission.status_code == 200, submission.text
    project_id = submission.json()["project_id"]
    projects_url = "/api/projects/first-site"
    assert client.get(projects_url).json()["total"] == 0
    assert client.get(f"{projects_url}/{project_id}").json()["data"]["hidden"] is True

    updated = client.post(publish_url, headers={**key_headers, "Idempotency-Key": "make-listed"}, json={
        "project_id": project_id, "hidden": False,
    })
    assert updated.status_code == 200, updated.text
    assert client.get(projects_url).json()["data"][0]["id"] == project_id


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
    assert client.post(
        "/api/agent/v1/assets", headers=agent, json={"content_type": "text/html", "size": 33}
    ).status_code == 422
    assert client.post(
        "/api/agent/v1/assets", headers=agent, json={"content_type": "image/png", "size": 64 * 1024 * 1024 + 1}
    ).status_code == 422
    assert client.post(
        "/api/agent/v1/assets", headers=agent, json={"content_type": "image/png", "size": 64 * 1024 * 1024}
    ).status_code == 201
    with db.project_write() as connection:
        connection.execute("UPDATE agent_keys SET expires_at = 0 WHERE id = ?", (key["id"],))
    assert client.post("/api/agent/v1/publish", headers=agent, json=sample()).status_code == 401


def test_overview_requires_20_distinct_items(panelshow):
    client, bind, _ = panelshow
    owner = bind("1", "first-site")
    _, agent = issue(client, owner)
    body = sample()
    assert client.post("/api/agent/v1/publish", headers=agent, json={
        **body, "overview": body["overview"][:-1]
    }).status_code == 422
    repeated = [body["overview"][0]] * 20
    assert client.post("/api/agent/v1/publish", headers=agent, json={
        **body, "overview": repeated
    }).status_code == 422
    assert client.post("/api/agent/v1/publish", headers=agent, json={
        **body, "overview": body["overview"] + [{"label": "Extra", "value": "Extra", "icon": "lucide:plus"}]
    }).status_code == 422

    body["overview"][0]["icon"] = "server"
    assert client.post("/api/agent/v1/publish", headers=agent, json=body).status_code == 422
    del body["overview"][0]["icon"]
    assert client.post("/api/agent/v1/publish", headers=agent, json=body).status_code == 422


def test_project_overview_accepts_public_api_values(panelshow):
    client, bind, _ = panelshow
    owner = bind("1", "first-site")
    _, agent = issue(client, owner)
    body = sample()
    metric = body["overview"][0]
    metric["value_api"] = {"url": "https://api.example.test/metrics", "json_path": ["data", "stars"], "suffix": " stars"}
    for invalid_url in ("http://api.example.test/metrics", "https://127.0.0.1/", "https://service.internal/", "https://user@api.example.test/"):
        invalid = {**metric, "value_api": {**metric["value_api"], "url": invalid_url}}
        assert client.post("/api/agent/v1/publish", headers=agent, json={
            **body, "overview": [invalid, *body["overview"][1:]]
        }).status_code == 422

    result = client.post("/api/agent/v1/publish", headers=agent, json=body)
    assert result.status_code == 200, result.text
    project = client.get(f"/api/projects/first-site/{result.json()['project_id']}").json()["data"]
    for collection in ("projectInfos", "homeAttributes", "sidebarAttributes", "heroAttributes"):
        saved = project[collection][0]
        assert saved["value"] == metric["value"] and saved["valueCode"] == ""
        assert saved["valueApi"] == {"prefix": "", **metric["value_api"]}


def test_create_without_screenshots_goes_first(panelshow):
    client, bind, db = panelshow
    owner = bind("1", "first-site")
    db.write_json("first-site", "projects.json", [
        {"id": "formerly-first", "order": "-3"}, {"id": "legacy"}, {"id": "last", "order": 10}
    ])
    assert client.get("/api/agent/onboarding", headers=owner).json() == {"show": False}
    _, agent = issue(client, owner)
    response = client.post("/api/agent/v1/publish", headers=agent, json=sample())
    assert response.status_code == 200, response.text
    project_id = response.json()["project_id"]
    records = client.get("/api/projects/first-site").json()["data"]
    assert [record["id"] for record in records] == [project_id, "formerly-first", "legacy", "last"]


def test_key_can_reuse_upload_and_publish_without_losing_previous_receipts(panelshow, monkeypatch):
    import agent_publish

    client, bind, _ = panelshow
    monkeypatch.setattr(agent_publish, "MAX_ASSETS", 1)
    owner = bind("1", "first-site")
    _, agent = issue(client, owner)
    reserved = reserve_image(client, agent)
    assert reserved.status_code == 201
    assert reserve_image(client, agent).status_code == 409
    asset_id = reserved.json()["asset_id"]
    monkeypatch.setattr(agent_publish, "cos_upload_matches", lambda key, content_type, size: False)
    assert complete_image(client, agent, asset_id).status_code == 409
    monkeypatch.setattr(agent_publish, "cos_upload_matches", lambda key, content_type, size: True)
    assert complete_image(client, agent, asset_id).status_code == 200
    body = {**sample(), "screenshots": [{"asset_id": asset_id, "caption": "First screenshot"}]}
    first = client.post("/api/agent/v1/publish", headers=agent, json=body)
    assert first.status_code == 200
    assert reserve_image(client, agent).status_code == 201
    another = client.post(
        "/api/agent/v1/publish", headers={**agent, "Idempotency-Key": "another-publication"}, json=sample()
    )
    assert another.status_code == 200
    assert another.json()["project_id"] != first.json()["project_id"]
    assert client.post("/api/agent/v1/publish", headers=agent, json=body).json() == first.json()
    latest = client.get("/api/agent/keys", headers=owner).json()["keys"][0]
    assert latest["status"] == "ready"
    assert latest["result"] == another.json()


def test_only_owner_can_recover_current_key(panelshow):
    client, bind, _ = panelshow
    owner = bind("1", "first-site")
    other = bind("2", "second-site")
    key, _ = issue(client, owner)
    path = f"/api/agent/keys/{key['id']}/secret"
    status = client.get("/api/agent/keys", headers=owner).json()["keys"][0]
    assert status["recoverable"] is True and "token" not in status
    result = client.get(path, headers=owner)
    assert result.json()["token"] == key["token"]
    assert result.headers["Cache-Control"] == "no-store"
    assert client.get(path, headers=other).status_code == 404
    assert client.delete(f"/api/agent/keys/{key['id']}", headers=owner).status_code == 204
    assert client.get(path, headers=owner).status_code == 404


def test_legacy_agent_image_redirects_and_project_json_compresses(panelshow):
    client, bind, db = panelshow
    bind("1", "first-site")
    path = "/uploads/first-site/agent-projects/old.png"
    cos_url = "https://images.example.test/first-site/agent-projects/old.png"
    db.write_json("_system", "agent_cos_redirects.json", {path: cos_url})
    for method in ("GET", "HEAD"):
        response = client.request(method, path, follow_redirects=False)
        assert response.status_code == 308
        assert response.headers["location"] == cos_url
    assert client.get(path.replace("old.png", "unknown.png")).status_code == 404
    db.write_json("first-site", "projects.json", [{"id": "existing", "projectIntroduction": "正文" * 1000}])
    endpoint = "/api/projects/first-site"
    packed = client.get(endpoint, headers={"Accept-Encoding": "gzip"})
    plain = client.get(endpoint, headers={"Accept-Encoding": "identity"})
    assert packed.headers["content-encoding"] == "gzip"
    assert packed.json() == plain.json()
