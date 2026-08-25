-- Optional production persistence for the hackathon prototype.
create extension if not exists postgis;

create type public.issue_status as enum ('reported','acknowledged','in_progress','awaiting_confirmation','confirmed','contested');
create type public.issue_category as enum ('Roads','Waste','Water','Lighting','Drainage');

create table public.issues (
  id uuid primary key default gen_random_uuid(),
  public_id text unique not null,
  category public.issue_category not null,
  title_en text not null,
  title_hi text not null,
  description_en text not null,
  description_hi text not null,
  approximate_location geography(point, 4326) not null,
  public_address text not null,
  status public.issue_status not null default 'reported',
  severity text not null check (severity in ('low','medium','high')),
  department text not null,
  responsible_role text not null,
  escalation_contact text not null,
  expected_by timestamptz,
  created_at timestamptz not null default now()
);

create table public.evidence (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references public.issues on delete cascade,
  storage_path text not null,
  source_type text not null check (source_type in ('report','completion','contest')),
  ai_extraction jsonb,
  captured_at timestamptz not null default now()
);

create table public.reporters (
  id uuid primary key default gen_random_uuid(),
  contact_encrypted text not null,
  public_alias text,
  created_at timestamptz not null default now()
);

create table public.supports (
  issue_id uuid references public.issues on delete cascade,
  reporter_id uuid references public.reporters on delete cascade,
  created_at timestamptz not null default now(),
  primary key (issue_id, reporter_id)
);

create table public.status_events (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references public.issues on delete cascade,
  previous_status public.issue_status,
  new_status public.issue_status not null,
  public_note_en text,
  public_note_hi text,
  evidence_id uuid references public.evidence,
  created_at timestamptz not null default now()
);

create table public.confirmations (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references public.issues on delete cascade,
  reporter_id uuid not null references public.reporters,
  decision text not null check (decision in ('fixed','contested')),
  evidence_id uuid references public.evidence,
  created_at timestamptz not null default now()
);

alter table public.issues enable row level security;
alter table public.evidence enable row level security;
alter table public.reporters enable row level security;
alter table public.supports enable row level security;
alter table public.status_events enable row level security;
alter table public.confirmations enable row level security;

create policy "Public can read issues" on public.issues for select using (true);
create policy "Public can read status events" on public.status_events for select using (true);
create policy "Public can count supports" on public.supports for select using (true);
-- Reporter/contact writes intentionally have no client policy. Validated server routes
-- using the service role perform these operations so private identity data is never public.
