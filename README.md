# EventHub Backend

REST API for **EventHub**, an event management and registration
application built with Node.js, Express, and PostgreSQL.

The backend supports authentication, role-based access, event
management, participant management, registrations, and dashboard
statistics.

> **Implementation note:** This README follows the EventHub
> technical-test requirements. Replace example environment variable
> names, scripts, migration commands, and endpoint details if your code
> uses different names or tools.

## Contents

-   [Features](#features)
-   [Technology](#technology)
-   [Architecture](#architecture)
-   [Requirements](#requirements)
-   [Getting started](#getting-started)
-   [Environment variables](#environment-variables)
-   [Database](#database)
-   [Authentication and
    authorization](#authentication-and-authorization)
-   [API reference](#api-reference)
-   [Business rules](#business-rules)
-   [Seed data](#seed-data)
-   [Error responses](#error-responses)
-   [Development](#development)
-   [Suggested project structure](#suggested-project-structure)

## Features

-   JWT-based authentication and password hashing with bcrypt.
-   Role-based access for `admin` and `staff`.
-   Create, view, update, and publish/cancel events.
-   Create, search, view, and update participants.
-   Register participants for published events.
-   Track registration statuses.
-   Dashboard statistics:
    -   Total number of events.
    -   Number of published events.
    -   Registrations created today.
    -   Top five events by occupancy.
-   Input validation and consistent HTTP error responses.
-   PostgreSQL constraints and indexes to protect data integrity.

## Technology

-   Node.js
-   Express
-   PostgreSQL
-   JWT (`jsonwebtoken` or equivalent)
-   `bcrypt` / `bcryptjs`
-   Request validation with Zod, Joi, or express-validator

Use the actual libraries from your `package.json` as the source of
truth.

## Architecture

The backend exposes a REST API under `/api`. The Express application
receives HTTP requests, validates input, checks authentication and
permissions, runs business logic, and reads or writes data in
PostgreSQL.

Typical responsibilities:

-   **Routes:** map HTTP methods and URLs to controllers.
-   **Middleware:** authentication, role checks, validation, and error
    handling.
-   **Controllers:** handle HTTP input/output.
-   **Services:** enforce business rules and coordinate operations.
-   **Database layer:** execute queries and manage transactions.
-   **Database:** persist users, events, participants, and
    registrations.

## Requirements

-   Node.js (use the version supported by the project).
-   npm.
-   PostgreSQL.
-   Git.

## Getting started

### 1. Clone the repository

``` bash
git clone <BACKEND_REPOSITORY_URL>
cd <BACKEND_DIRECTORY>
```

### 2. Install dependencies

``` bash
npm install
```

### 3. Create the database

Create a PostgreSQL database, for example:

``` sql
CREATE DATABASE eventhub;
```

Use your preferred PostgreSQL client or command-line tool.

### 4. Configure environment variables

Create a `.env` file in the backend root. See [Environment
variables](#environment-variables).

### 5. Apply the schema or migrations

Run the migration command configured by your project. For example, if
the project uses a SQL file:

``` bash
psql -U <DB_USER> -d eventhub -f ./database/schema.sql
```

If your project uses a migration tool, run its migration command
instead. Do not run both approaches unless your setup requires it.

### 6. Seed the database

If a seed script is configured, run the matching command from
`package.json`, for example:

``` bash
npm run seed
```

### 7. Start the server

Use the scripts actually defined in your `package.json`. Common examples
are:

``` bash
npm run dev
```

or:

``` bash
npm start
```

The API base URL will usually be:

``` text
http://localhost:3000/api
```

Change the port or URL to match your configuration.

## Environment variables

Create a `.env` file and configure the names expected by your
application. The following is a suggested template, not a guarantee of
your current variable names:

``` env
NODE_ENV=development
PORT=3000

DATABASE_URL=postgresql://<DB_USER>:<DB_PASSWORD>@localhost:5432/eventhub

JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=1d
BCRYPT_SALT_ROUNDS=10

FRONTEND_URL=http://localhost:5173
```

Notes:

-   Never commit `.env` or real secrets to version control.
-   Use a strong, unique `JWT_SECRET`.
-   If your application uses separate PostgreSQL variables (`DB_HOST`,
    `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`) rather than
    `DATABASE_URL`, document those instead.
-   Configure CORS to allow the frontend origin used in your
    environment.

## Database

The technical-test specification calls for these core tables:

  Table             Purpose
  ----------------- ------------------------------------------------
  `users`           Staff/admin accounts and their roles
  `events`          Event details, publication status, and creator
  `participants`    People who can register for events
  `registrations`   Join table connecting participants and events

### Suggested relationships

-   One user can create many events.
-   One event can have many registrations.
-   One participant can have many registrations.
-   `registrations` connects `events` and `participants` in a
    many-to-many relationship.

### Important constraints

-   `participants.email` must be unique.
-   `(registrations.event_id, registrations.participant_id)` must be
    unique to prevent duplicate registrations.
-   Required fields should be `NOT NULL`.
-   Event and registration statuses should be constrained to the allowed
    values.
-   Foreign keys should connect registrations to valid events and
    participants, and events to their creator.
-   UUIDs are recommended by the specification.
-   Add indexes for frequently filtered fields, such as event
    status/date and registration event/status fields.

### Event fields

Minimum event data:

-   `title`
-   `description`
-   `location`
-   `event_date`
-   `max_participants`
-   `status`: `draft`, `published`, or `cancelled`
-   `created_by`

### Participant fields

Minimum participant data:

-   `full_name`
-   `email`
-   `phone` (optional)
-   `created_at`

### Registration fields

Minimum registration data:

-   `event_id`
-   `participant_id`
-   `status`: `pending`, `confirmed`, or `cancelled`
-   `created_at`

Adapt naming to the schema actually used in the project.

## Authentication and authorization

### Authentication endpoints

-   `POST /api/auth/login` --- authenticate a user and return a JWT.
-   `GET /api/auth/me` --- return the currently authenticated user.

Protected endpoints should require a valid bearer token:

``` http
Authorization: Bearer <JWT>
```

### Roles

-   **Admin:** full management of events and users.
-   **Staff:** event management and registration management.

Apply role checks on the server. Hiding a button in the frontend is not
authorization.

## API reference

All routes below are relative to `/api`. Protected routes require a
valid JWT unless your implementation explicitly makes them public.

### Authentication

  Method   Endpoint        Purpose
  -------- --------------- ------------------
  `POST`   `/auth/login`   Sign in
  `GET`    `/auth/me`      Get current user

### Events

  -------------------------------------------------------------------------
  Method                  Endpoint                  Purpose
  ----------------------- ------------------------- -----------------------
  `POST`                  `/events`                 Create an event

  `GET`                   `/events?status=&date=`   List events; optional
                                                    status/date filters

  `GET`                   `/events/:id`             Get event details

  `PUT`                   `/events/:id`             Update an event

  `PATCH`                 `/events/:id/status`      Change event status,
                                                    such as publish or
                                                    cancel
  -------------------------------------------------------------------------

### Participants

  -------------------------------------------------------------------------
  Method                  Endpoint                  Purpose
  ----------------------- ------------------------- -----------------------
  `POST`                  `/participants`           Create a participant

  `GET`                   `/participants?search=`   List/search
                                                    participants by name or
                                                    email

  `PUT`                   `/participants/:id`       Update a participant
  -------------------------------------------------------------------------

If the implementation includes additional participant CRUD endpoints,
document them here too.

### Registrations

  -----------------------------------------------------------------------------------
  Method                  Endpoint                            Purpose
  ----------------------- ----------------------------------- -----------------------
  `POST`                  `/registrations`                    Register a participant
                                                              for an event

  `GET`                   `/registrations?eventId=&status=`   List registrations with
                                                              optional filters

  `PATCH`                 `/registrations/:id/status`         Update a registration
                                                              status
  -----------------------------------------------------------------------------------

### Dashboard

The dashboard must expose the statistics required by the specification.
Document the actual dashboard route and response shape implemented by
the project here; the specification does not prescribe a specific URL.

Suggested response fields:

``` json
{
  "totalEvents": 0,
  "publishedEvents": 0,
  "registrationsToday": 0,
  "topEventsByOccupancy": []
}
```

This is an illustrative response shape, not a claim about the current
implementation.

## Business rules

The API must enforce the following rules on the server:

1.  A participant cannot register for an event unless the event is
    `published`.
2.  The same participant cannot register for the same event more than
    once.
3.  An event cannot exceed `max_participants`; reject new registrations
    when capacity is reached.
4.  When an event becomes `cancelled`, all registrations for that event
    must become `cancelled`.
5.  Event and registration status values must be restricted to their
    allowed values.
6.  Participant email addresses must be unique.

For capacity checks and registration creation, use a database
transaction or another concurrency-safe approach so two simultaneous
requests cannot exceed event capacity.

## Seed data

The technical-test specification asks for:

-   1 admin user and 1 staff user.
-   5 events with a mixture of `draft`, `published`, and `cancelled`
    statuses.
-   10 participants.
-   20 registrations with different statuses.

Use development-only credentials for seeded users. If credentials are
documented for reviewers, clearly label them as local demo credentials
and never reuse them in production.

## Error responses

Return clear and consistent errors. Expected status codes include:

  -----------------------------------------------------------------------
  Status                              Meaning
  ----------------------------------- -----------------------------------
  `400 Bad Request`                   Invalid input or a business-rule
                                      violation

  `401 Unauthorized`                  Missing, invalid, or expired
                                      authentication token

  `403 Forbidden`                     Authenticated user lacks permission

  `404 Not Found`                     Requested resource does not exist

  `409 Conflict`                      Duplicate registration or
                                      unique-constraint conflict, if used
                                      by the implementation

  `500 Internal Server Error`         Unexpected server error
  -----------------------------------------------------------------------

Suggested error body:

``` json
{
  "message": "A clear description of the error"
}
```

Keep internal stack traces and database details out of production
responses.

## Development

Useful commands depend on the scripts configured in `package.json`.
Typical examples:

``` bash
npm run dev
npm run seed
```

Only run commands that exist in the repository. Add the real test, lint,
migration, and seed commands here.
