from copy import deepcopy

import pytest
from fastapi.testclient import TestClient

import src.app as app_module


@pytest.fixture
def client():
    original_activities = deepcopy(app_module.activities)

    yield TestClient(app_module.app)

    app_module.activities.clear()
    app_module.activities.update(original_activities)
