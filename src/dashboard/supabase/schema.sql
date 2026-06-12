-- LaMenstruacion.mc Dashboard Schema
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/ufcufpdtedvvvwcwwywg/sql

-- tasks
create table if not exists public.tasks (
  id          text primary key,
  title       text not null,
  status      text not null default 'pending',
  assignee    text,
  completed_date date,
  result      text,
  pending_action text,
  steps       jsonb default '[]'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  date
);

-- skills
create table if not exists public.skills (
  id            serial primary key,
  human         text not null,
  skill         text not null,
  evidence      text,
  autonomy      text default 'high',
  observed_date date,
  created_at    timestamptz not null default now()
);

-- sessions
create table if not exists public.sessions (
  id                serial primary key,
  session_date      date not null,
  duration          text,
  tasks_completed   jsonb default '[]'::jsonb,
  skills_observed   jsonb default '[]'::jsonb,
  next_priorities   jsonb default '[]'::jsonb,
  created_at        timestamptz not null default now()
);

-- ecosystem_stats
create table if not exists public.ecosystem_stats (
  id                      serial primary key,
  sessions_logged         int not null default 0,
  skills_detected_socio1  int not null default 0,
  skills_detected_socio2  int not null default 0,
  last_updated            timestamptz not null default now()
);

-- Enable realtime
alter publication supabase_realtime add table public.tasks;
alter publication supabase_realtime add table public.skills;
alter publication supabase_realtime add table public.sessions;
alter publication supabase_realtime add table public.ecosystem_stats;

-- RLS
alter table public.tasks enable row level security;
alter table public.skills enable row level security;
alter table public.sessions enable row level security;
alter table public.ecosystem_stats enable row level security;

create policy "auth read tasks"      on public.tasks      for select using (auth.role() = 'authenticated');
create policy "auth write tasks"     on public.tasks      for all    using (auth.role() = 'authenticated');
create policy "auth read skills"     on public.skills     for select using (auth.role() = 'authenticated');
create policy "auth write skills"    on public.skills     for all    using (auth.role() = 'authenticated');
create policy "auth read sessions"   on public.sessions   for select using (auth.role() = 'authenticated');
create policy "auth write sessions"  on public.sessions   for all    using (auth.role() = 'authenticated');
create policy "auth read ecosystem"  on public.ecosystem_stats for select using (auth.role() = 'authenticated');
create policy "auth write ecosystem" on public.ecosystem_stats for all    using (auth.role() = 'authenticated');

-- Seed initial data
insert into public.tasks (id, title, status, assignee, completed_date, result, pending_action, updated_at)
values
  ('001', 'Install and configure Obsidian', 'completed', 'Socio1', '2026-06-05',
   'Obsidian 1.12.7 installed. Vault config at obsidian_brain/.obsidian/. Dark theme, graph, tags, daily-notes, CSS snippet deployed.',
   'Socio1 must open vault: \\wsl$\kali-linux\home\lapromocion\proyecto-conjunto\obsidian_brain',
   '2026-06-05'),
  ('003', 'Build LaMenstruacion.mc Dashboard', 'in_progress', 'Socio2', null, null,
   'Monitor TASK-003 progress.', '2026-06-09')
on conflict (id) do nothing;

insert into public.skills (human, skill, evidence, autonomy, observed_date)
values
  ('Socio1', 'environment_infrastructure_setup', 'Configured Kali WSL with ZSH, Oh My Zsh, and Powerlevel10k.', 'high', '2026-05-31'),
  ('Socio1', 'strategic_briefing_orchestration', 'Requested creation of CLAUDE.md, defining core project identity.', 'high', '2026-06-02'),
  ('Socio1', 'full_stack_product_shipping', 'Shipped diary app migration from IndexedDB to Supabase end-to-end in one session.', 'high', '2026-06-05'),
  ('Socio1', 'rapid_task_pivoting', 'Cancelled obsolete onboarding task and dispatched Dashboard mission.', 'high', '2026-06-08'),
  ('Socio2', 'system_architecture_orchestration', 'Defined AI Behavioral Rules, Token Economy, and Skill Detection framework.', 'high', '2026-05-31')
on conflict do nothing;

insert into public.sessions (session_date, duration, tasks_completed, skills_observed, next_priorities)
values
  ('2026-06-08', '15min',
   '["Cancelled ONBOARDING-SOCIO2 task.", "Dispatched TASK-003 (Dashboard) to Socio2 via Discord.", "Closed session per human request."]'::jsonb,
   '["Socio1: rapid_task_pivoting"]'::jsonb,
   '["Monitor TASK-003 progress."]'::jsonb),
  ('2026-06-05', '20min',
   '["Task 001 DONE: Obsidian 1.12.7 installed (Windows)"]'::jsonb,
   '["Socio1: windows_toolchain_integration"]'::jsonb,
   '["Open vault in Obsidian", "Onboard Socio2"]'::jsonb)
on conflict do nothing;

insert into public.ecosystem_stats (sessions_logged, skills_detected_socio1, skills_detected_socio2, last_updated)
values (5, 4, 1, now())
on conflict do nothing;
