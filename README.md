# CivicConnect – Community Issue Reporting System

A responsive mini web application for reporting and tracking neighbourhood issues. Built to demonstrate the concepts in Unit I (HTML/CSS/responsive design) and Unit II (JavaScript/DOM/events/Fetch API/JSON/error handling), with a Node.js + Express backend.

## Requirements
- Node.js (LTS recommended)
- Visual Studio Code
- Internet connection for the Tailwind CSS CDN and Google Fonts (the app's custom CSS still works without fonts)

## Run in VS Code (local)

1. Extract the ZIP file.
2. Open the extracted **CivicConnect** folder in VS Code.
3. Open **Terminal → New Terminal**.
4. Run:

   ```bash
   npm install
   npm start
   ```

5. Open **http://localhost:3000** in your browser.

Do not open `index.html` directly. Run the Node server and visit the localhost address so the API works.

## Features
- Create a community issue report.
- View all reports and dashboard totals.
- Search by title, category, location or description.
- Filter by status.
- Update status to Pending, In Progress or Resolved (demo/admin functionality).
- Store reports in `data/issues.json` on the server.
- Server-side validation, client-side validation, loading state and error handling.

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check server |
| GET | `/api/issues` | Get all reports as JSON |
| POST | `/api/issues` | Create a report |
| PATCH | `/api/issues/:id` | Update report status |

Example POST JSON:

```json
{
  "title": "Pothole near bus stop",
  "category": "Roads",
  "location": "Main Road, Bengaluru",
  "description": "A large pothole needs repair."
}
```

## How this project covers your syllabus

### Unit I – Core Web Foundations
- HTML5 semantic elements: `header`, `nav`, `main`, `section`, `article`, `footer`.
- Forms, labels, required fields, accessible names and live status messages.
- Flexbox: navigation, buttons, toolbars and card alignment.
- CSS Grid: dashboard, main content and responsive layouts.
- Responsive design: mobile-first breakpoints in `styles.css`.
- Tailwind CSS: CDN included in `index.html`.
- Web concepts: browser sends HTTP requests to the local Express server; server returns JSON responses.

### Unit II – JavaScript and Dynamic UI Development
- JavaScript fundamentals: variables, functions, arrays and objects.
- DOM selection and updates with `getElementById`, `querySelector` and `innerHTML`.
- Events: submit, input and change.
- Form validation on the client and server.
- Fetch API with GET, POST and PATCH.
- JSON request and response handling.
- Async/await, loading indicator and error handling.
- Problem decomposition into small functions.

## Important deployment note: sharing a live link with your lecturer

`http://localhost:3000` works only on your computer. It is **not** a public link.

For a public link, deploy the project to a Node.js hosting service such as Render:
1. Create a GitHub repository and upload this project.
2. In Render, create a **New Web Service** and connect that repository.
3. Set **Build Command** to `npm install`.
4. Set **Start Command** to `npm start`.
5. Deploy. Render will provide a public URL you can share with your lecturer.

**Data note:** This starter project stores data in a local JSON file. Some free hosting services use temporary filesystems, so reports may reset after redeployment/restart. For a production system, use a persistent database or disk. This is a classroom demonstration, not an official municipal complaint service.
