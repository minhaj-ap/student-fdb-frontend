# Student Feedback — Frontend

Student feedback portal built with Next.js and Tailwind CSS.

The application provides a compact feedback management system for both students and administrators/reviewers.

---

## Application Structure

The frontend is divided into two protected application areas:

### `/dashboard`

Student-facing dashboard.

Authenticated users can:

* Create feedback
* View their submitted feedback
* Edit feedback
* Delete feedback
* Track feedback status

Each dashboard session is scoped to the currently authenticated user.

---

### `/admin`

Administrator/reviewer panel.

Only authorized admin users can access this route.

Admins can:

* View all submitted feedback
* Review feedback entries
* Mark issues as resolved

---

## Route Protection & Authentication

The application uses JWT-based authentication with protected routing.

### Authentication Flow

* Users authenticate through the backend API.
* JWT tokens are stored securely using HTTP-only cookies.
* Protected routes validate the authenticated session before rendering content.

---

## Middleware-Based Protection

A centralized `proxy` middleware is used to protect sensitive routes.

The middleware:

* Intercepts incoming requests
* Ensures a proper access token exists
* Redirects unauthenticated users if not

Protected routes include:

```txt
/admin
/dashboard
```

---

## Layout-Level Authorization

Both route groups contain dedicated `layout.tsx` files responsible for:

* Authentication checks
* Session validation
* Role-based access control

### Admin Layout

Handles:

* Admin-only access validation
* Reviewer session management

### Dashboard Layout

Handles:

* Logged-in user validation
* User session persistence

---

## Tech Stack

* Next.js App Router
* Tailwind CSS
* TypeScript
* JWT Authentication
* Middleware-based Route Protection

---

## Quick Links

* Dashboard page: `app/dashboard/page.tsx`
* API helpers: `src/lib`
* Shared types: `types.ts`

---

## Development

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Build production version:

```bash
npm run build
npm run start
```
