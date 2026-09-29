# CandyEstimator SitePro - Daily Site Productivity & Profit/Loss Optimization System

A comprehensive enterprise web platform built for construction site managers, project directors, planning engineers, and commercial estimators to track **Daily Site Productivity**, monitor **Profit / Loss Percentage**, and manage Candy CCS baselines with full customization and access control.

---

## 🌟 Key Features & Architecture

### 1. Multi-Project Architecture & Data Persistence
- Manage multiple independent construction projects (e.g. *Dubai Hills Estate*, *Palm Jumeirah Gardens*, etc.).
- Robust multi-tier persistence across `localStorage` with JSON state backups.
- Includes **"Who Did What" Audit Trail** tracking user changes, baseline edits, deletions, and customizations.

### 2. Flexible Fixed Baseline & Candy Budgeting
- **Standalone vs Grouped Activities**: Activities can exist either as standalone items (no parent) or grouped under a Main Activity code (e.g., `S00100`, `S00147 (A,B,C)`) rendered in bold **RED** font matching Candy format.
- **Dynamic Labour Trades & Plant**: Add custom trades or machines on the fly directly inside the Fixed Activity modal or in Settings.
- **Custom Units & Divisions**: Freely add and edit engineering divisions (`SL`, `HL`, `IR`, `CW`, `EW`, `MEP`, `ST`, etc.) and measurement units.

### 3. Daily Site Productivity Tracker & Dashboard Date Explorer
- **Date Filter & Dual View**: Choose any date on the Executive Dashboard to see that day's specific values alongside overall project metrics.
  - **Selected Date Results**: Daily Earned Value, Daily Actual Cost, Daily Net Profit/Loss (AED & %), Daily Productivity Index (PI), Daily Output Qty, and a dedicated table of activities executed on that chosen date.
  - **Overall Project Performance**: Full contract BOQ budget, cumulative earned value, total spend, cumulative profit/loss, and physical progress %.
  - **Quick Presets**: "Overall (All Dates)", "Today", "Latest Entry", and day-by-day step navigation ($\leftarrow$ Prev Day, Next Day $\rightarrow$).
- Real-time computation of:
  - **Earned Value** ($Q_{\text{actual}} \times \text{Budget Unit Rate}$)
  - **Actual Unit Cost** vs. **Candy Standard Rate**
  - **Daily & Cumulative Profit/Loss (AED & %)**
  - **Productivity Index (PI)**: $\frac{\text{Budget Rate}}{\text{Actual Unit Cost}}$

### 4. 🧠 Smart Engineering Solutions & Loss Diagnostics
- Automated detection of labour inefficiency or machinery idling.
- One-click solution drawer with gang re-balancing, cycle optimization, and shift re-allocations.

### 5. Settings Hub (7 Sub-Tabs with Admin Access Control)
1. **Main Activities**: Add/edit main activity codes, descriptions, and default batch sizes.
2. **Resource Rates & Masters**:
   - Master hourly rates for Labour & Plant.
   - Units of measure master list.
   - Divisions master list (add/edit custom engineering divisions).
3. **Project & Shift**: Project metadata, shift hours (8h/10h/12h), and loss sensitivity threshold.
4. **Dashboard Headings Customizer**: Edit system title, tagline, KPI card titles/subtitles, and navigation tab labels.
5. **User Access & Credentials**: Manage Admin and Site User accounts with credential expiry protection.
6. **Backup Audit Trail ("Who Did What")**: Complete tamper-evident audit history showing user, role, action, target, timestamp, and details with CSV/JSON export.
7. **Python Code Access & Admin Studio**:
   - Live In-Browser Quick-Editor for descriptions and codes.
   - `admin_config.py` CLI script for offline automation and bulk script editing.
   - Sync JSON state directly between browser and Python.

### 6. Excel (.XLSX) Export Engine (Matching Candy Image 2)
The Excel export generates a 4-sheet master workbook:
- **Sheet 1 (`Candy Baseline & Actuals`)**: Matches the Candy CCS spreadsheet format with merged titles, `BGT` baseline rows, bold red Main Activity banners, and yellow `Act` daily execution logs.
- **Sheet 2 (`Daily Site Actuals`)**: Complete daily site logs register with variance and PI.
- **Sheet 3 (`Executive Summary`)**: High-level financial KPIs, earned value, and contract metrics.
- **Sheet 4 (`Audit Trail`)**: Full "Who Did What" audit log for compliance and commercial records.

---

## 🛠️ Python Automation (`admin_config.py`)

Administrators can inspect and modify descriptions or rates from the command line:

```bash
# List all activities and main activities
python admin_config.py --list

# Edit a sub-activity description
python admin_config.py --edit-desc 22110001 "New Sub Activity Description"

# Edit a main activity description
python admin_config.py --edit-main S00100 "New Main Activity Description"

# View audit history
python admin_config.py --audit
```

---

## 🚀 Quick Launch

1. Double-click `launch.bat` or open `index.html` in any modern web browser (Edge, Chrome, Brave, Firefox).
2. Works 100% offline with zero external network dependencies.
