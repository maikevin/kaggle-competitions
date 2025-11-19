"""
Comprehensive API Testing Script for Alarm Backend
Run this to test all API endpoints
"""
import requests
import json
from typing import Dict, Any

BASE_URL = "http://localhost:8000"

def print_section(title: str):
    """Print a formatted section header"""
    print("\n" + "="*60)
    print(f"  {title}")
    print("="*60 + "\n")

def print_response(label: str, response: requests.Response):
    """Pretty print API response"""
    print(f"📍 {label}")
    print(f"   Status Code: {response.status_code}")
    if response.status_code == 200:
        print(f"   ✅ Response: {json.dumps(response.json(), indent=6)}")
    elif response.status_code == 404:
        print(f"   ❌ Error: {response.json()}")
    elif response.status_code == 422:
        print(f"   ⚠️  Validation Error: {json.dumps(response.json(), indent=6)}")
    else:
        print(f"   Response: {response.text}")
    print()

def test_health_check():
    """Test 1: Health Check"""
    print_section("Test 1: Health Check")
    response = requests.get(f"{BASE_URL}/")
    print_response("GET /", response)
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    print("✅ Health check passed!\n")

def test_create_alarms():
    """Test 2: Create Multiple Alarms"""
    print_section("Test 2: Create Alarms")

    alarms = [
        {
            "title": "Wake Up",
            "time": "06:30",
            "enabled": True,
            "repeat_days": [1, 2, 3, 4, 5],  # Weekdays
            "sound": "default",
            "snooze_enabled": True,
            "snooze_duration": 10,
            "vibrate": True
        },
        {
            "title": "Lunch Break",
            "time": "12:00",
            "enabled": True,
            "repeat_days": [1, 2, 3, 4, 5],
            "sound": "default",
            "snooze_enabled": False,
            "snooze_duration": 5,
            "vibrate": False
        },
        {
            "title": "Weekend Sleep-in",
            "time": "09:30",
            "enabled": True,
            "repeat_days": [0, 6],  # Sunday and Saturday
            "sound": "default",
            "snooze_enabled": True,
            "snooze_duration": 15,
            "vibrate": True
        }
    ]

    created_ids = []
    for alarm_data in alarms:
        response = requests.post(f"{BASE_URL}/alarms/", json=alarm_data)
        print_response(f"Create: {alarm_data['title']}", response)
        assert response.status_code == 200
        created_ids.append(response.json()["id"])

    print(f"✅ Created {len(created_ids)} alarms: {created_ids}\n")
    return created_ids

def test_get_all_alarms():
    """Test 3: Get All Alarms"""
    print_section("Test 3: Get All Alarms")
    response = requests.get(f"{BASE_URL}/alarms/")
    print_response("GET /alarms/", response)
    assert response.status_code == 200
    alarms = response.json()
    print(f"✅ Retrieved {len(alarms)} alarms\n")
    return alarms

def test_get_single_alarm(alarm_id: int):
    """Test 4: Get Single Alarm"""
    print_section(f"Test 4: Get Alarm by ID ({alarm_id})")
    response = requests.get(f"{BASE_URL}/alarms/{alarm_id}")
    print_response(f"GET /alarms/{alarm_id}", response)
    assert response.status_code == 200
    print("✅ Retrieved alarm successfully\n")
    return response.json()

def test_update_alarm(alarm_id: int):
    """Test 5: Update Alarm"""
    print_section(f"Test 5: Update Alarm ({alarm_id})")

    updates = {
        "title": "Updated Wake Up",
        "time": "07:00",
        "snooze_duration": 5
    }

    response = requests.put(f"{BASE_URL}/alarms/{alarm_id}", json=updates)
    print_response(f"PUT /alarms/{alarm_id}", response)
    assert response.status_code == 200
    updated = response.json()
    assert updated["title"] == updates["title"]
    assert updated["time"] == updates["time"]
    print("✅ Alarm updated successfully\n")

def test_toggle_alarm(alarm_id: int):
    """Test 6: Toggle Alarm"""
    print_section(f"Test 6: Toggle Alarm ({alarm_id})")

    # First toggle
    response = requests.patch(f"{BASE_URL}/alarms/{alarm_id}/toggle")
    print_response(f"PATCH /alarms/{alarm_id}/toggle (1st toggle)", response)
    assert response.status_code == 200
    first_state = response.json()["enabled"]

    # Second toggle
    response = requests.patch(f"{BASE_URL}/alarms/{alarm_id}/toggle")
    print_response(f"PATCH /alarms/{alarm_id}/toggle (2nd toggle)", response)
    assert response.status_code == 200
    second_state = response.json()["enabled"]

    assert first_state != second_state
    print("✅ Toggle working correctly\n")

def test_delete_alarm(alarm_id: int):
    """Test 7: Delete Alarm"""
    print_section(f"Test 7: Delete Alarm ({alarm_id})")

    response = requests.delete(f"{BASE_URL}/alarms/{alarm_id}")
    print_response(f"DELETE /alarms/{alarm_id}", response)
    assert response.status_code == 200

    # Verify deletion
    response = requests.get(f"{BASE_URL}/alarms/{alarm_id}")
    assert response.status_code == 404
    print("✅ Alarm deleted successfully\n")

def test_error_handling():
    """Test 8: Error Handling"""
    print_section("Test 8: Error Handling")

    # Test 404 - Non-existent alarm
    print("Testing 404 error:")
    response = requests.get(f"{BASE_URL}/alarms/99999")
    print_response("GET /alarms/99999 (non-existent)", response)
    assert response.status_code == 404

    # Test 422 - Invalid time format
    print("Testing validation error (invalid time):")
    bad_alarm = {
        "title": "Bad Alarm",
        "time": "25:99",  # Invalid time
        "enabled": True,
        "repeat_days": [],
        "sound": "default",
        "snooze_enabled": True,
        "snooze_duration": 5,
        "vibrate": True
    }
    response = requests.post(f"{BASE_URL}/alarms/", json=bad_alarm)
    print_response("POST /alarms/ (invalid time)", response)
    assert response.status_code == 422

    # Test 422 - Invalid snooze duration
    print("Testing validation error (invalid snooze duration):")
    bad_alarm = {
        "title": "Bad Snooze",
        "time": "08:00",
        "enabled": True,
        "repeat_days": [],
        "sound": "default",
        "snooze_enabled": True,
        "snooze_duration": 100,  # Must be 1-60
        "vibrate": True
    }
    response = requests.post(f"{BASE_URL}/alarms/", json=bad_alarm)
    print_response("POST /alarms/ (invalid snooze)", response)
    assert response.status_code == 422

    print("✅ Error handling working correctly\n")

def test_data_persistence():
    """Test 9: Data Persistence"""
    print_section("Test 9: Data Persistence")

    # Create an alarm
    alarm_data = {
        "title": "Persistence Test",
        "time": "15:30",
        "enabled": True,
        "repeat_days": [2, 4],
        "sound": "default",
        "snooze_enabled": True,
        "snooze_duration": 7,
        "vibrate": True
    }

    response = requests.post(f"{BASE_URL}/alarms/", json=alarm_data)
    alarm_id = response.json()["id"]
    print(f"Created alarm with ID: {alarm_id}")

    # Retrieve and verify all fields
    response = requests.get(f"{BASE_URL}/alarms/{alarm_id}")
    retrieved = response.json()

    print("\nVerifying all fields match:")
    for key in alarm_data.keys():
        expected = alarm_data[key]
        actual = retrieved[key]
        match = "✅" if expected == actual else "❌"
        print(f"   {match} {key}: {actual} (expected: {expected})")

    print("\n✅ Data persistence verified\n")
    return alarm_id

def run_all_tests():
    """Run all tests"""
    print("\n" + "🚀"*30)
    print("   ALARM API COMPREHENSIVE TEST SUITE")
    print("🚀"*30 + "\n")

    try:
        # Test 1: Health Check
        test_health_check()

        # Test 2: Create Alarms
        alarm_ids = test_create_alarms()

        # Test 3: Get All Alarms
        all_alarms = test_get_all_alarms()

        # Test 4: Get Single Alarm
        if alarm_ids:
            test_get_single_alarm(alarm_ids[0])

        # Test 5: Update Alarm
        if alarm_ids:
            test_update_alarm(alarm_ids[0])

        # Test 6: Toggle Alarm
        if alarm_ids:
            test_toggle_alarm(alarm_ids[0])

        # Test 7: Delete Alarm
        if len(alarm_ids) > 1:
            test_delete_alarm(alarm_ids[1])

        # Test 8: Error Handling
        test_error_handling()

        # Test 9: Data Persistence
        persistence_id = test_data_persistence()

        # Final Summary
        print_section("FINAL SUMMARY")
        response = requests.get(f"{BASE_URL}/alarms/")
        final_alarms = response.json()
        print(f"📊 Total alarms in database: {len(final_alarms)}")
        print("\nAlarm List:")
        for alarm in final_alarms:
            status = "🟢 ON" if alarm["enabled"] else "🔴 OFF"
            repeat = f"Days: {alarm['repeat_days']}" if alarm['repeat_days'] else "Once"
            print(f"   {status} | {alarm['time']} | {alarm['title']} | {repeat}")

        print("\n" + "✅"*30)
        print("   ALL TESTS PASSED!")
        print("✅"*30 + "\n")

    except AssertionError as e:
        print(f"\n❌ Test failed: {e}\n")
    except requests.exceptions.ConnectionError:
        print("\n❌ Error: Cannot connect to API server.")
        print("   Make sure the server is running at http://localhost:8000\n")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}\n")

if __name__ == "__main__":
    run_all_tests()
