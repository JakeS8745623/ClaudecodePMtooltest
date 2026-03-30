-- TSA IT Unified Operating Model — Supabase Schema
-- Run once in the Supabase SQL editor (Dashboard → SQL Editor → New Query)

-- ─── CONFIG ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS config (
  id         SERIAL PRIMARY KEY,
  key        TEXT UNIQUE NOT NULL,
  value      TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── MILESTONES ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS milestones (
  id         SERIAL PRIMARY KEY,
  label      TEXT NOT NULL,
  date       DATE NOT NULL,
  sort_order INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── WORKSTREAMS ──────────────────────────────────────────────────────────────
-- stream_id links to a roadmap stream (nullable — not all workstreams need one)
CREATE TABLE IF NOT EXISTS workstreams (
  id           SERIAL PRIMARY KEY,
  name         TEXT NOT NULL,
  subtitle     TEXT,
  status_label TEXT,
  status_color TEXT DEFAULT 'default',
  stream_id    INT,
  sort_order   INT DEFAULT 0,
  updated_at   TIMESTAMPTZ DEFAULT now()
);

-- ─── ATTENTION ITEMS ──────────────────────────────────────────────────────────
-- priority: 'NOW' | 'THIS WEEK' | 'WATCH'
CREATE TABLE IF NOT EXISTS attention_items (
  id         SERIAL PRIMARY KEY,
  priority   TEXT NOT NULL DEFAULT 'WATCH',
  text       TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── PROGRESS ITEMS ───────────────────────────────────────────────────────────
-- bar_color: 'auto' (red/yellow/green by value) or a CSS hex/named colour
CREATE TABLE IF NOT EXISTS progress_items (
  id         SERIAL PRIMARY KEY,
  label      TEXT NOT NULL,
  percentage INT DEFAULT 0,
  bar_color  TEXT DEFAULT 'auto',
  sort_order INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── CONTACTS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contacts (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  title      TEXT,
  sort_order INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── ROADMAP STREAMS ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS streams (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── ROADMAP TASKS ────────────────────────────────────────────────────────────
-- status: complete | in_progress | planned | at_risk | on_hold | behind | blocked
CREATE TABLE IF NOT EXISTS tasks (
  id               SERIAL PRIMARY KEY,
  stream_id        INT REFERENCES streams(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  start_date       DATE NOT NULL,
  end_date         DATE NOT NULL,
  percent_complete INT DEFAULT 0,
  status           TEXT DEFAULT 'planned',
  is_milestone     BOOLEAN DEFAULT false,
  sort_order       INT DEFAULT 0,
  updated_at       TIMESTAMPTZ DEFAULT now()
);

-- ─── DISABLE ROW LEVEL SECURITY (single-user local app) ──────────────────────
ALTER TABLE config          DISABLE ROW LEVEL SECURITY;
ALTER TABLE milestones      DISABLE ROW LEVEL SECURITY;
ALTER TABLE workstreams     DISABLE ROW LEVEL SECURITY;
ALTER TABLE attention_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE progress_items  DISABLE ROW LEVEL SECURITY;
ALTER TABLE contacts        DISABLE ROW LEVEL SECURITY;
ALTER TABLE streams         DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks           DISABLE ROW LEVEL SECURITY;
