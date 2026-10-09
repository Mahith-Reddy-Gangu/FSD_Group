# CampusLoop

## Smart Campus Community and Resource Exchange Platform

CampusLoop is a full-stack web application that helps students exchange useful resources and stay connected with important campus services. It combines resource sharing with four additional campus-focused features:

1. Campus announcements
2. Lost and found
3. Campus events calendar
4. Campus help and maintenance requests

The platform reduces student expenses, improves communication, and gives students a simple way to report and track campus issues.

## Run locally

### Prerequisites

- Node.js 20.19 or newer in the 20.x line, 22.12 or newer in the 22.x line, or a later major release
- npm, included with Node.js
- Git, if cloning the repository

### Get the project

```sh
git clone https://github.com/Mahith-Reddy-Gangu/FSD_Group.git
cd FSD_Group
```

### Windows

Double-click `Start-CampusLoop.bat`. It installs dependencies from the committed lockfile the first time, then starts the API and website and opens the website in your browser. Later runs reuse the installed dependencies.

### macOS or Linux

```sh
npm ci
npm run dev:full
```

Open <http://localhost:5173>. Stop the development server with `Ctrl+C`.

### Data on each laptop

The API creates `server/data.json` for local persistence. This file is intentionally ignored by Git, so each person gets their own local accounts and data; pushing or pulling the repository does not sync accounts or app data. The app currently uses this local JSON file rather than a shared hosted database.

## Problem Statement

Students often purchase items they need only temporarily, miss important campus updates, struggle to recover lost belongings, and do not have a clear way to report infrastructure problems. CampusLoop brings these activities together in one organized platform.

## Objectives

- Allow students to list, search, borrow, and exchange resources.
- Provide a central location for official campus announcements.
- Help students report and recover lost or found items.
- Allow students to discover and register for campus events.
- Make maintenance complaints trackable from submission to resolution.
- Provide administrators with tools to manage users and campus content.

## Main Modules

### 1. Resource Exchange

Students can share books, calculators, notes, electronics, lab equipment, sports equipment, and other useful items.

Features:

- Add, edit, and delete resource listings
- Upload resource images
- Search and filter resources by category
- Send borrow or exchange requests
- Approve or reject requests
- Mark resources as returned
- Rate users after a completed exchange

### 2. Campus Announcements

Students can view important academic, administrative, club, and general campus notices.

Features:

- Admin creates and manages announcements
- Categorize announcements
- Pin important announcements
- Search announcements
- Display publication date and author

### 3. Lost and Found

Students can report lost or found belongings and connect with other students to recover them.

Features:

- Report a lost or found item
- Add item image, description, location, and date
- Search and filter reports
- Contact the person who posted the report
- Mark an item as resolved

### 4. Campus Events Calendar

Students can discover and register for seminars, workshops, club activities, sports events, and cultural programs.

Features:

- Admin or authorized users create events
- Display event date, time, location, and description
- Filter events by category and date
- Register or cancel event registration
- View the list of registered participants

### 5. Campus Help and Maintenance Requests

Students can report problems such as broken lights, damaged furniture, Wi-Fi issues, water problems, or cleanliness concerns.

Features:

- Submit a maintenance request
- Add category, location, description, and image
- Track request status
- Admin assigns or updates requests
- Status flow: Submitted, In Progress, Resolved
- Student can confirm whether the issue was resolved

## User Roles

### Student

- Register and log in
- Manage profile
- Use the resource exchange
- View announcements
- Create lost and found reports
- Browse and register for events
- Submit and track maintenance requests
- Give ratings after resource exchanges

### Administrator

- Manage students and user accounts
- Manage resource categories
- Moderate resource and lost and found listings
- Publish announcements
- Create and manage events
- Review and update maintenance requests
- View dashboard statistics

## Technology Stack

### Frontend

- React.js
- Vite
- GSAP and Framer Motion
- Three.js and Vanta.js

### Backend

- Node.js
- Express.js
- REST API
- JSON Web Tokens for authentication
- bcryptjs for password hashing

### Database and Storage

- Local JSON persistence in `server/data.json`

### Development and Deployment Tools

- Visual Studio Code
- Git and GitHub

## System Architecture

```text
React + Vite Frontend
      |
      | HTTP requests
      v
Express.js REST API
      |
      | Local JSON persistence
      v
server/data.json
```

## Local persistence

The Express API persists application state in `server/data.json`. That file is created and maintained locally and is excluded from Git; the API implementation in `server/index.js` is the source of truth for the data structure.

## Main Pages

- Home page
- Register page
- Login page
- Student dashboard
- Admin dashboard
- Resource listing page
- Resource details page
- Add resource page
- My requests page
- Announcements page
- Lost and found page
- Report lost or found item page
- Events calendar page
- Event details page
- Maintenance requests page
- Submit maintenance request page
- Profile page

## REST API Endpoints

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Resource Exchange

```text
GET    /api/resources
POST   /api/resources
GET    /api/resources/:id
PUT    /api/resources/:id
DELETE /api/resources/:id
POST   /api/requests
GET    /api/requests/my
PUT    /api/requests/:id/approve
PUT    /api/requests/:id/reject
PUT    /api/requests/:id/return
```

### Announcements

```text
GET    /api/announcements
POST   /api/announcements
PUT    /api/announcements/:id
DELETE /api/announcements/:id
```

### Lost and Found

```text
GET    /api/lost-found
POST   /api/lost-found
GET    /api/lost-found/:id
PUT    /api/lost-found/:id
DELETE /api/lost-found/:id
PUT    /api/lost-found/:id/resolve
```

### Events

```text
GET  /api/events
POST /api/events
GET  /api/events/:id
POST /api/events/:id/register
DELETE /api/events/:id/register
```

### Maintenance

```text
GET  /api/maintenance
POST /api/maintenance
GET  /api/maintenance/my
PUT  /api/maintenance/:id/status
```

### Reviews

```text
POST /api/reviews
GET  /api/users/:id/reviews
```

## Recommended Folder Structure

```text
campusloop/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── services/
│   │   ├── context/
│   │   └── App.jsx
│   └── package.json
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   └── package.json
└── README.md
```

## Complete Demonstration Flow

1. Register as a student.
2. Add a textbook or calculator to the resource exchange.
3. Log in as another student and send a borrow request.
4. Approve the request from the owner account.
5. View a campus announcement.
6. Report a lost item.
7. Register for a campus event.
8. Submit a broken-facility maintenance request.
9. Log in as an administrator.
10. Update the maintenance request to In Progress and then Resolved.
11. Mark the borrowed resource as returned.

## Security Features

- Passwords are hashed using bcrypt.
- JWT is used for authenticated sessions.
- Role-based access protects administrator routes.
- Users can edit or delete only their own submissions.
- Server-side validation checks all request data.
- Uploaded files are restricted to supported image types.

## Future Enhancements

- College email verification
- In-app messaging
- Email and push notifications
- QR code handover for resource exchanges
- Mobile application
- Analytics for frequently requested resources
- Location-based campus services

## Conclusion

CampusLoop is a complete full-stack campus platform that combines resource exchange, communication, event participation, lost item recovery, and maintenance reporting. It solves practical student problems while demonstrating authentication, CRUD operations, database relationships, file uploads, role-based access, REST APIs, and deployment.