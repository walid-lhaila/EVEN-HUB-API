
CREATE TYPE user_role AS ENUM ('admin', 'staff');

CREATE TYPE event_status AS ENUM (
    'draft',
    'published',
    'cancelled'
);

CREATE TYPE registration_status AS ENUM (
    'pending',
    'confirmed',
    'cancelled'
);


CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'staff',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    location VARCHAR(255) NOT NULL,
    event_date TIMESTAMPTZ NOT NULL,
    max_participants INTEGER NOT NULL CHECK (max_participants > 0),
    status event_status NOT NULL DEFAULT 'draft',
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE TABLE participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(30),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE TABLE registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    status registration_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT unique_event_participant
        UNIQUE (event_id, participant_id)
);


CREATE INDEX idx_events_status_date
    ON events(status, event_date);

CREATE INDEX idx_events_created_by
    ON events(created_by);

CREATE INDEX idx_registrations_event_status
    ON registrations(event_id, status);

CREATE INDEX idx_registrations_participant
    ON registrations(participant_id);
