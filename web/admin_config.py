"""
================================================================================
CandyEstimator SitePro - Administrator Configuration & Maintenance Script
================================================================================
Use this Python script to view, edit, and update descriptions, rates,
main activities, and project settings directly from Python or the command line.

Only for Administrator Access.
================================================================================
"""

import json
import os
import sys
from datetime import datetime

STATE_FILE = os.path.join(os.path.dirname(__file__), "candy_state_backup.json")

def load_data():
    """Load the current application backup data."""
    if os.path.exists(STATE_FILE):
        try:
            with open(STATE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"[!] Error loading {STATE_FILE}: {e}")
    return get_default_data()

def save_data(data):
    """Save the updated application backup data."""
    try:
        with open(STATE_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"[✓] Successfully saved changes to {STATE_FILE}")
        return True
    except Exception as e:
        print(f"[!] Error saving data: {e}")
        return False

def get_default_data():
    """Default structure if no state file exists yet."""
    return {
        "projects": [
            {
                "id": "prj-1",
                "code": "PRJ-AW-001",
                "name": "Al Wasl Phase 2 Landscape & Civil Works",
                "client": "Meraas Holding / Parsons",
                "startDate": "2026-01-15",
                "targetEndDate": "2026-11-30",
                "fixedActivities": [
                    {
                        "id": "act-1",
                        "code": "22110001",
                        "division": "SL",
                        "zone": "Zone 1",
                        "subActivity": "Red dune sand (Sweet Soil Filling) filling Ground Covers and in shrubs /SUC,grasses",
                        "unit": "m3",
                        "totalQty": 14040,
                        "allowableRate": 11.08,
                        "workoutQty": 200,
                        "mainActivityCode": "S00100",
                        "mainActivityDesc": "Red Dune sand filling in ground covers/succulents/grasses."
                    },
                    {
                        "id": "act-2",
                        "code": "22110002",
                        "division": "SL",
                        "zone": "Zone 1",
                        "subActivity": "Supply and backfilling sweet soil for palm trees (2.5m pit)",
                        "unit": "No",
                        "totalQty": 850,
                        "allowableRate": 45.00,
                        "workoutQty": 10,
                        "mainActivityCode": "S00102",
                        "mainActivityDesc": "Red Dune sand filling in tree pits"
                    }
                ]
            }
        ],
        "mainActivities": [
            {
                "code": "S00100",
                "description": "Red Dune sand filling in ground covers/succulents/grasses.",
                "defaultBatchQty": 200
            },
            {
                "code": "S00147 (A,B,C)",
                "description": "Sweeting Sand filling in ground covers/ succulents/grasses",
                "defaultBatchQty": 200
            },
            {
                "code": "S00102",
                "description": "Red Dune sand filling in tree pits",
                "defaultBatchQty": 150
            },
            {
                "code": "S00105",
                "description": "Planting specimen trees and palms complete with sweet soil backfill",
                "defaultBatchQty": 10
            }
        ],
        "divisions": [
            {"code": "SL", "name": "SL - Soft Landscaping"},
            {"code": "HL", "name": "HL - Hard Landscaping"},
            {"code": "IR", "name": "IR - Irrigation Works"},
            {"code": "CW", "name": "CW - Civil Works"},
            {"code": "EW", "name": "EW - Earthworks & Excavation"}
        ],
        "auditTrail": []
    }

def list_activities():
    """Print all fixed activities with their codes, descriptions, and parent Main Activities."""
    data = load_data()
    print("\n=======================================================")
    print("      CONFIGURED FIXED CANDY ACTIVITIES")
    print("=======================================================")
    for prj in data.get("projects", []):
        print(f"\n[Project: {prj.get('code')} - {prj.get('name')}]")
        activities = prj.get("fixedActivities", [])
        if not activities:
            print("  (No activities configured)")
            continue
        for idx, act in enumerate(activities, 1):
            main_code = act.get("mainActivityCode") or "(None - Standalone)"
            print(f"  {idx}. Code: {act.get('code'):<12} | Div: {act.get('division'):<4} | Main: {main_code}")
            print(f"     Desc: {act.get('subActivity')}")
            print(f"     Qty:  {act.get('totalQty')} {act.get('unit')} | Allowable: {act.get('allowableRate')} AED")
            print()

def list_main_activities():
    """Print all configured Main Activities (Candy hierarchy)."""
    data = load_data()
    print("\n=======================================================")
    print("      CONFIGURED MAIN ACTIVITIES (CANDY HIERARCHY)")
    print("=======================================================")
    for m in data.get("mainActivities", []):
        print(f"  Code: {m.get('code'):<18} | Batch Qty: {m.get('defaultBatchQty')}")
        print(f"  Desc: {m.get('description')}")
        print("-" * 55)

def update_activity_description(code_or_id, new_description):
    """Update the description of an activity by code or ID."""
    data = load_data()
    found = False
    for prj in data.get("projects", []):
        for act in prj.get("fixedActivities", []):
            if act.get("code") == code_or_id or act.get("id") == code_or_id:
                old_desc = act.get("subActivity")
                act["subActivity"] = new_description
                found = True
                print(f"[✓] Updated Activity {act.get('code')}:")
                print(f"    Old: {old_desc}")
                print(f"    New: {new_description}")
                log_audit(data, "UPDATE_DESCRIPTION", f"Activity {act.get('code')}", f"Changed to: {new_description}")
    if found:
        save_data(data)
    else:
        print(f"[!] Activity with code or ID '{code_or_id}' was not found.")

def update_main_activity(code, new_description=None, new_batch_qty=None):
    """Update or create a Main Activity description and batch quantity."""
    data = load_data()
    mains = data.setdefault("mainActivities", [])
    item = next((m for m in mains if m.get("code") == code), None)
    if item:
        if new_description:
            item["description"] = new_description
        if new_batch_qty is not None:
            item["defaultBatchQty"] = new_batch_qty
        print(f"[✓] Updated Main Activity {code}")
    else:
        new_item = {
            "code": code,
            "description": new_description or "Main Activity",
            "defaultBatchQty": new_batch_qty or 100
        }
        mains.append(new_item)
        print(f"[✓] Added new Main Activity {code}")
    
    # Also update child references in fixed activities if description changed
    if new_description:
        for prj in data.get("projects", []):
            for act in prj.get("fixedActivities", []):
                if act.get("mainActivityCode") == code:
                    act["mainActivityDesc"] = new_description

    log_audit(data, "UPDATE_MAIN_ACTIVITY", code, new_description or "Updated Main Activity")
    save_data(data)

def log_audit(data, action, target, details):
    """Record an audit trail action."""
    trail = data.setdefault("auditTrail", [])
    trail.insert(0, {
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "user": "Administrator (Python Script)",
        "action": action,
        "target": target,
        "details": details
    })
    if len(trail) > 200:
        data["auditTrail"] = trail[:200]

def view_audit_trail():
    """Print the complete audit trail history."""
    data = load_data()
    trail = data.get("auditTrail", [])
    print("\n=======================================================")
    print("      AUDIT TRAIL & SYSTEM ACTIVITY LOG")
    print("=======================================================")
    if not trail:
        print("  (No audit actions recorded yet)")
        return
    for item in trail[:30]:
        print(f"[{item.get('timestamp')}] {item.get('user')}")
        print(f"  Action: {item.get('action')} on {item.get('target')}")
        print(f"  Details: {item.get('details')}")
        print("-" * 55)

def interactive_menu():
    """Run an interactive CLI menu for the administrator."""
    while True:
        print("\n" + "=" * 55)
        print("  CandyEstimator SitePro - Admin Configuration Console")
        print("=" * 55)
        print("  1. List All Fixed Activities")
        print("  2. Change Sub-Activity Description")
        print("  3. List All Main Activities (Candy Hierarchy)")
        print("  4. Add / Update Main Activity Description")
        print("  5. View Audit Trail (Who Did What)")
        print("  6. Exit")
        choice = input("\nSelect an option (1-6): ").strip()
        
        if choice == "1":
            list_activities()
        elif choice == "2":
            code = input("Enter Activity Candy Code (e.g. 22110001): ").strip()
            desc = input("Enter New Description: ").strip()
            if code and desc:
                update_activity_description(code, desc)
        elif choice == "3":
            list_main_activities()
        elif choice == "4":
            code = input("Enter Main Activity Code (e.g. S00147 (A,B,C)): ").strip()
            desc = input("Enter Main Activity Description: ").strip()
            qty = input("Enter Default Batch Qty (press Enter for 200): ").strip()
            qty_num = float(qty) if qty else 200
            if code and desc:
                update_main_activity(code, desc, qty_num)
        elif choice == "5":
            view_audit_trail()
        elif choice == "6":
            print("Exiting Admin Console. Goodbye!")
            break
        else:
            print("Invalid option. Please try again.")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        cmd = sys.argv[1].lower()
        if cmd == "list":
            list_activities()
        elif cmd == "mains":
            list_main_activities()
        elif cmd == "audit":
            view_audit_trail()
        elif cmd == "update" and len(sys.argv) >= 4:
            update_activity_description(sys.argv[2], sys.argv[3])
        else:
            print("Usage:")
            print("  python admin_config.py                (Interactive Menu)")
            print("  python admin_config.py list           (List Activities)")
            print("  python admin_config.py mains          (List Main Activities)")
            print("  python admin_config.py audit          (View Audit Trail)")
            print("  python admin_config.py update <code> <new_desc>")
    else:
        interactive_menu()
