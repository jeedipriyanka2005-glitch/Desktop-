from __future__ import annotations

import html
import os
from datetime import datetime
from pathlib import Path
from typing import Optional
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile
from fastapi.responses import FileResponse, HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Assignment, Submission


router = APIRouter()

templates = Jinja2Templates(directory="app/templates")
# Provide a simple `now()` helper to templates
templates.env.globals["now"] = datetime.now
UPLOADS_DIR = Path("uploads")


@router.get("/assignments", response_class=HTMLResponse)
def list_assignments(request: Request, db: Session = Depends(get_db)):
    assignments = db.execute(select(Assignment).order_by(Assignment.created_at.desc())).scalars().all()
    return templates.TemplateResponse(
        "assignments_list.html", {"request": request, "assignments": assignments}
    )


@router.get("/assignments/new", response_class=HTMLResponse)
def new_assignment_form(request: Request):
    return templates.TemplateResponse("assignment_new.html", {"request": request})


@router.post("/assignments")
def create_assignment(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    due_date: Optional[str] = Form(None),
    db: Session = Depends(get_db),
):
    parsed_due: Optional[datetime] = None
    if due_date:
        # Accept both YYYY-MM-DDTHH:MM and ISO strings with seconds
        try:
            parsed_due = datetime.fromisoformat(due_date)
        except ValueError:
            try:
                parsed_due = datetime.fromisoformat(due_date + ":00")
            except ValueError:
                parsed_due = None

    assignment = Assignment(title=title.strip(), description=(description or "").strip() or None, due_date=parsed_due)
    db.add(assignment)
    db.commit()
    db.refresh(assignment)

    return RedirectResponse(url=f"/assignments/{assignment.id}", status_code=303)


@router.get("/assignments/{assignment_id}", response_class=HTMLResponse)
def assignment_detail(assignment_id: int, request: Request, db: Session = Depends(get_db)):
    assignment = db.get(Assignment, assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    submissions = db.execute(
        select(Submission).where(Submission.assignment_id == assignment_id).order_by(Submission.created_at.desc())
    ).scalars().all()

    return templates.TemplateResponse(
        "assignment_detail.html",
        {"request": request, "assignment": assignment, "submissions": submissions},
    )


@router.get("/assignments/{assignment_id}/submit", response_class=HTMLResponse)
def submit_form(assignment_id: int, request: Request, db: Session = Depends(get_db)):
    assignment = db.get(Assignment, assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return templates.TemplateResponse("submission_form.html", {"request": request, "assignment": assignment})


@router.post("/assignments/{assignment_id}/submit")
async def submit_assignment(
    assignment_id: int,
    student_name: str = Form(...),
    student_email: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    assignment = db.get(Assignment, assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    original_name = file.filename or "submission"
    safe_ext = Path(original_name).suffix
    unique_name = f"{assignment_id}-{uuid4().hex}{safe_ext}"
    destination = UPLOADS_DIR / unique_name

    # Persist the uploaded file without loading it fully into memory
    bytes_written = 0
    with destination.open("wb") as out_file:
        while True:
            chunk = await file.read(1024 * 1024)
            if not chunk:
                break
            out_file.write(chunk)
            bytes_written += len(chunk)

    submission = Submission(
        assignment_id=assignment_id,
        student_name=student_name.strip(),
        student_email=(student_email or "").strip() or None,
        original_filename=original_name,
        stored_filename=unique_name,
        file_size_bytes=bytes_written,
    )

    db.add(submission)
    db.commit()

    return RedirectResponse(url=f"/assignments/{assignment_id}", status_code=303)


@router.get("/submissions/{submission_id}/file")
def download_submission(submission_id: int, db: Session = Depends(get_db)):
    submission = db.get(Submission, submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    file_path = UPLOADS_DIR / submission.stored_filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found on server")

    return FileResponse(
        path=str(file_path),
        media_type="application/octet-stream",
        filename=submission.original_filename,
    )
