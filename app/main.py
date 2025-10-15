from __future__ import annotations

from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles

from .database import Base, engine
from .routers.assignments import router as assignments_router


app = FastAPI(title="Assignment Submission App")


# Create tables on startup
@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)


# Mount static assets (CSS, images, etc.)
app.mount("/static", StaticFiles(directory="app/static"), name="static")


# Include feature routers
app.include_router(assignments_router)


@app.get("/", include_in_schema=False)
async def root() -> RedirectResponse:
    return RedirectResponse(url="/assignments", status_code=307)
