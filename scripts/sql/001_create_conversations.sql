-- Enable UUIDs
create extension if not exists "pgcrypto";

-- Conversations table
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null, -- set later when auth added
  title text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- Messages table
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role text not null check (role in ('system','user','assistant')),
  content text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- Policies (no auth yet; service role bypasses RLS from server API)
drop policy if exists "conversations_owner_select" on public.conversations;
drop policy if exists "conversations_owner_change" on public.conversations;
drop policy if exists "messages_owner_select" on public.messages;
drop policy if exists "messages_owner_change" on public.messages;

create policy "conversations_owner_select"
  on public.conversations for select
  using (user_id is not distinct from auth.uid());

create policy "conversations_owner_change"
  on public.conversations for all
  using (user_id is not distinct from auth.uid())
  with check (user_id is not distinct from auth.uid());

create policy "messages_owner_select"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and c.user_id is not distinct from auth.uid()
    )
  );

create policy "messages_owner_change"
  on public.messages for all
  using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and c.user_id is not distinct from auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and c.user_id is not distinct from auth.uid()
    )
  );
