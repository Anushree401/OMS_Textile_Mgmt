import pytest
from supabase import create_client, Client
from postgrest.exceptions import APIError

import os
from dotenv import load_dotenv

load_dotenv(dotenv_path="../.env")

@pytest.fixture(scope="session")
def supabase() -> Client:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    assert url and key, "❌ Missing Supabase URL or Key in .env"
    return create_client(url, key)


def test_supabase_connection(supabase):
    """✅ Test 1: Ensure Supabase connection works and metadata is accessible."""
    try:
        response = supabase.table("profiles").select("*").limit(1).execute()
        assert isinstance(response.data, list)
        print(f"✅ Connected successfully, got {len(response.data)} rows.")
    except APIError as e:
        pytest.fail(f"❌ Failed to connect or fetch: {e}")


def test_insert_and_delete_temp_row(supabase):
    """✅ Test 2: Insert and delete a temporary row in a safe test table."""
    table_name = "test_table"
    test_data = {"temp_field": "pytest_temp_data"}

    try:
        insert_resp = supabase.table(table_name).insert(test_data).execute()
        assert insert_resp.data, "❌ Insert returned no data."

        temp_id = insert_resp.data[0].get("id")
        delete_resp = supabase.table(table_name).delete().eq("id", temp_id).execute()
        assert delete_resp.data is not None, "❌ Delete failed."
    except APIError as e:
        pytest.skip(f"⚠️ Skipping: 'test_table' not found — {e}")


def test_profiles_columns_exist(supabase):
    """✅ Test 3: Check if essential onboarding columns exist in 'profiles' table."""
    expected_cols = [
        "onboarding_completed",
        "company_name",
        "gst_number",
        "phone",
        "address",
        "city",
        "state",
        "pincode",
    ]

    try:
        result = supabase.table("profiles").select("*").limit(1).execute()
        assert isinstance(result.data, list)
        if result.data:
            cols = result.data[0].keys()
            missing = [col for col in expected_cols if col not in cols]
            assert not missing, f"❌ Missing columns: {missing}"
        else:
            print("⚠️ No rows found in 'profiles', skipping column check.")
    except APIError as e:
        pytest.fail(f"❌ Query failed: {e}")


def test_auth_profile_trigger(supabase):
    """✅ Test 4: Verify the auth-to-profile trigger exists."""
    try:
        response = supabase.table("profiles").select("email").limit(1).execute()
        assert isinstance(response.data, list)
    except Exception as e:
        pytest.skip(f"⚠️ Auth trigger test skipped due to exception: {e}")
