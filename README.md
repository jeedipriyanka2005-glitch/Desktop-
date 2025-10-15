# Assignment Submission App

A minimal FastAPI web app for creating assignments and accepting student file uploads, backed by SQLite with simple Jinja templates.

## Features
- Create assignments with title, description, and optional due date
- Public submission form for each assignment
- Stores uploaded files on disk in `uploads/`
- Lists submissions and allows downloading the uploaded file

## Prerequisites
- Python 3.11+ (tested on 3.13)

## Setup
```bash
# From repository root
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install -r requirements.txt
```

## Run
```bash
uvicorn app.main:app --reload --port 8000
```
Open `http://localhost:8000` in your browser.

## Project layout
```
app/
  main.py             # FastAPI app wiring
  database.py         # SQLAlchemy engine/session
  models.py           # ORM models: Assignment, Submission
  routers/
    assignments.py    # Routes for listing, creating, submitting, downloading
  templates/
    base.html
    assignments_list.html
    assignment_new.html
    assignment_detail.html
    submission_form.html
  static/
    styles.css
uploads/               # Stored uploaded files
requirements.txt
README.md
```

## Notes
- SQLite database file `app.db` is created automatically on first start.
- Max upload size can be controlled at the proxy/server; app streams to disk.
- For production, serve behind a real ASGI server (e.g., `gunicorn -k uvicorn.workers.UvicornWorker`).
