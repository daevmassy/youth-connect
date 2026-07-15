import os
import psycopg2
import psycopg2.extras
from contextlib import contextmanager

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL must be set.")


def get_connection():
    return psycopg2.connect(DATABASE_URL, cursor_factory=psycopg2.extras.RealDictCursor)


@contextmanager
def db_cursor(commit: bool = False):
    conn = get_connection()
    try:
        cur = conn.cursor()
        yield cur
        if commit:
            conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def create_tables():
    """Ensure all tables exist (idempotent)."""
    ddl = """
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        bio TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS devotionals (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        scripture_ref TEXT NOT NULL,
        scripture_text TEXT NOT NULL,
        body TEXT NOT NULL,
        publish_date TIMESTAMP DEFAULT NOW() NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reading_plans (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reading_plan_days (
        id SERIAL PRIMARY KEY,
        plan_id INTEGER NOT NULL,
        day_number INTEGER NOT NULL,
        passage TEXT NOT NULL,
        reflection TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS reading_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        plan_day_id INTEGER NOT NULL,
        completed BOOLEAN DEFAULT TRUE NOT NULL,
        completed_at TIMESTAMP DEFAULT NOW() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS prayer_requests (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        is_anonymous BOOLEAN DEFAULT TRUE NOT NULL,
        pray_count INTEGER DEFAULT 0 NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS prayer_prays (
        id SERIAL PRIMARY KEY,
        prayer_request_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        location TEXT DEFAULT '',
        starts_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS event_rsvps (
        id SERIAL PRIMARY KEY,
        event_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        room TEXT NOT NULL,
        user_id INTEGER NOT NULL,
        display_name TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        ticket_code TEXT NOT NULL,
        content TEXT NOT NULL,
        answer TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        answered_at TIMESTAMP
    );
    """
    with db_cursor(commit=True) as cur:
        cur.execute(ddl)
