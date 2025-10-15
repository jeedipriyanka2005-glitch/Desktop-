# Assignment Submission App

Simple Node.js/Express app for managing assignments, student submissions, and teacher grading. Uses EJS for views and JSON files for storage.

## Prerequisites
- Node.js 18+ (tested with v22)

## Setup
```bash
npm install
npm run seed
npm run dev
```

Open `http://localhost:3000` (the port will be shown in the terminal).

## Login credentials
- Teacher: `teacher@example.com` / `teacher123`
- Student: `student@example.com` / `student123`

## Project structure
```
src/
  server.js
  routes/
    auth.js
    student.js
    teacher.js
  middleware/
    auth.js
  utils/
    storage.js
    seed.js
  views/
    partials/
      layout.ejs
public/
  css/
    styles.css
data/               # JSON data files (created on seed)
uploads/            # Uploaded files
```

## Notes
- Storage uses JSON files in `data/`. For production, replace with a database.
- File uploads are stored in `uploads/` and referenced by filename.
- Sessions are stored in memory by default; switch to a store for production.
