# Supabase Cron Setup (Reminders)

Last updated: 2026-02-10

This app uses two Edge Functions to send reminder emails/notifications:

- `exchange-reminders`
- `sports-event-reminders`

Both functions:

- are designed to run on a schedule
- send reminders when the current time is within a 5-minute window of a configured reminder time
- require a scheduler authorization secret

## Recommended Schedule

Use `*/5 * * * *` (every 5 minutes).

Running every 1 minute also works, but is unnecessary load and will be largely deduped by the idempotency guard.

## Required Header

Set this header on the scheduled invocation:

- Header name: `x-scheduler-secret`
- Header value: the value of the Supabase secret `SCHEDULER_SECRET`

## Supabase Dashboard Steps

1. Open Supabase Dashboard for your project.
2. Go to Edge Functions.
3. Open `exchange-reminders`.
4. Create a schedule:
   - Cron: `*/5 * * * *`
   - Method: `POST`
   - Headers: `x-scheduler-secret: <SCHEDULER_SECRET>`
5. Repeat for `sports-event-reminders` with the same schedule.

## Notes

- These scheduled calls should not send an `Origin` header; the functions explicitly allow origin-less server-to-server calls.
- If schedules fire twice, the functions should safely skip duplicate invocations within the same minute.
