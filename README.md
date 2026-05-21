# DevPulse

An internal tech issue and feature tracker for development teams. Contributors can report bugs and suggest features; maintainers can triage, update, and resolve issues.

---

## Tech Stack

- **Runtime:** Node.js LTS (v24+)
- **Language:** TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL (via native `pg` driver — raw SQL only, no ORM)
- **Auth:** JSON Web Tokens (`jsonwebtoken`) + password hashing (`bcryptjs`)

---

## Features

- User registration and JWT-based authentication
- Role-based access control (`contributor` / `maintainer`)
- Full issue lifecycle management (create, read, update, delete)
- Filter issues by `type` and `status`; sort by newest or oldest
- Reporter details embedded in issue responses (via separate queries — no SQL JOINs)

---

## Getting Started

### Prerequisites

- Node.js v24+
- A PostgreSQL database (e.g. [Neon](https://neon.tech), [Supabase](https://supabase.com), [ElephantSQL](https://elephantsql.com))

### Installation

```bash
git clone https://github.com/YOUR_USERNAME/devpulse.git
cd devpulse/backend
npm install
```

### Environment Variables

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
DB_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
JWT_SECRET=your_jwt_secret_here
```

### Run (development)

```bash
npm run dev
```

Tables are created automatically on first start in non-production environments.

### Build & Run (production)

```bash
npm run build
npm start
```

---

## Database Schema

### `users`

| Column       | Type         | Notes                              |
|--------------|--------------|------------------------------------|
| `id`         | UUID (PK)    | Auto-generated                     |
| `name`       | VARCHAR(100) | Required                           |
| `email`      | VARCHAR(255) | Unique, required                   |
| `password`   | TEXT         | bcrypt-hashed                      |
| `role`       | VARCHAR(20)  | `contributor` (default) / `maintainer` |
| `created_at` | TIMESTAMP    | Auto-set                           |
| `updated_at` | TIMESTAMP    | Auto-set                           |

### `issues`

| Column        | Type         | Notes                                          |
|---------------|--------------|------------------------------------------------|
| `id`          | UUID (PK)    | Auto-generated                                 |
| `title`       | VARCHAR(150) | Required, max 150 chars                        |
| `description` | TEXT         | Required, min 20 chars                         |
| `type`        | VARCHAR(20)  | `bug` / `feature_request`                      |
| `status`      | VARCHAR(20)  | `open` (default) / `in_progress` / `resolved`  |
| `reporter_id` | UUID (FK)    | References `users.id`, cascades on delete      |
| `created_at`  | TIMESTAMP    | Auto-set                                       |
| `updated_at`  | TIMESTAMP    | Auto-set on update                             |

---

## API Endpoints

Base URL: `/api`

### Auth

#### `POST /api/auth/signup`

Register a new user.

**Request body:**
```json
{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "secret123"
}
```

**Response `201`:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "uuid",
    "name": "Alice",
    "email": "alice@example.com",
    "role": "contributor",
    "created_at": "...",
    "updated_at": "..."
  }
}
```

---

#### `POST /api/auth/login`

Authenticate and receive a JWT.

**Request body:**
```json
{
  "email": "alice@example.com",
  "password": "secret123"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": { "token": "<jwt>" }
}
```

---

### Issues

> Authenticated endpoints require the header:
> ```
> Authorization: <token>
> ```

#### `GET /api/issues`

Get all issues. Public.

**Query params (all optional):**

| Param    | Values                                  |
|----------|-----------------------------------------|
| `sort`   | `newest` (default) / `oldest`           |
| `type`   | `bug` / `feature_request`               |
| `status` | `open` / `in_progress` / `resolved`     |

**Response `200`:** Array of issue objects, each including a `reporter` field.

---

#### `GET /api/issues/:id`

Get a single issue by ID. Public.

**Response `200`:** Issue object with `reporter` field.
**Response `404`:** Issue not found.

---

#### `POST /api/issues`

Create a new issue. Requires authentication.

**Request body:**
```json
{
  "title": "Login button broken",
  "description": "The login button does not respond on mobile Safari.",
  "type": "bug"
}
```

**Response `201`:** Created issue object.

---

#### `PATCH /api/issues/:id`

Update an issue. Requires authentication.

- **Maintainer:** Can update any issue (title, description, type, status).
- **Contributor:** Can only update their own `open` issues; cannot change `status`.

**Request body (all fields optional):**
```json
{
  "title": "Updated title",
  "description": "Updated description with enough detail.",
  "type": "feature_request",
  "status": "in_progress"
}
```

**Response `200`:** Updated issue object.

---

#### `DELETE /api/issues/:id`

Delete an issue. Requires **maintainer** role.

**Response `200`:** Deleted issue object.
**Response `404`:** Issue not found.

---

## Roles

| Action                          | Contributor | Maintainer |
|---------------------------------|:-----------:|:----------:|
| Register / Login                | ✓           | ✓          |
| Create issue                    | ✓           | ✓          |
| View all / single issues        | ✓           | ✓          |
| Update own open issues          | ✓           | ✓          |
| Update any issue / change status| ✗           | ✓          |
| Delete issues                   | ✗           | ✓          |

---

## Deployment

The project is configured for deployment on [Vercel](https://vercel.com) with a managed PostgreSQL database (Neon / Supabase).

Live API: **https://YOUR_DEPLOYMENT_URL**