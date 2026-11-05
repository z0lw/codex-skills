#!/usr/bin/env python3
"""Generate or check the first Codex RRULE firing for a dated local time."""

import argparse
import sqlite3
from pathlib import Path
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo


def next_daily_fire(rrule: str, created: datetime, scheduler_zone: ZoneInfo) -> datetime:
    if not rrule.startswith("RRULE:"):
        raise ValueError("Expected RRULE: prefix")
    fields = dict(part.split("=", 1) for part in rrule[6:].split(";") if "=" in part)
    if fields.get("FREQ") != "DAILY":
        raise ValueError("Only daily RRULEs are supported")
    hours = [int(value) for value in fields["BYHOUR"].split(",")]
    minutes = [int(value) for value in fields["BYMINUTE"].split(",")]
    if any(not 0 <= hour < 24 for hour in hours) or any(not 0 <= minute < 60 for minute in minutes):
        raise ValueError("Invalid hour or minute")
    start = created.astimezone(scheduler_zone)
    candidates = []
    for day in (start.date(), start.date() + timedelta(days=1)):
        for hour in hours:
            for minute in minutes:
                value = datetime(day.year, day.month, day.day, hour, minute, tzinfo=scheduler_zone)
                if value > start:
                    candidates.append(value)
    return min(candidates).astimezone(timezone.utc)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--at", required=True, help="Desired local time, YYYY-MM-DDTHH:MM")
    parser.add_argument("--zone", required=True, help="Desired IANA time zone, e.g. Asia/Tokyo")
    parser.add_argument("--scheduler-zone", required=True, help="Observed RRULE interpretation zone")
    parser.add_argument("--created-at", help="Automation creation instant, ISO 8601; defaults to now")
    parser.add_argument("--check-rrule", help="Saved RRULE to verify instead of generating one")
    parser.add_argument("--automation-id", help="Saved automation ID; required for verification")
    parser.add_argument("--database", type=Path, default=Path.home() / ".codex/sqlite/codex-dev.db", help="Native scheduler database, opened read-only")
    args = parser.parse_args()

    local_zone = ZoneInfo(args.zone)
    scheduler_zone = ZoneInfo(args.scheduler_zone)
    desired = datetime.fromisoformat(args.at).replace(tzinfo=local_zone)
    if args.check_rrule:
        if not args.automation_id:
            parser.error("verification requires --automation-id; a recalculated RRULE is not scheduler evidence")
        try:
            with sqlite3.connect(args.database.resolve().as_uri() + "?mode=ro", uri=True) as db:
                row = db.execute("SELECT rrule, status, next_run_at FROM automations WHERE id = ?", (args.automation_id,)).fetchone()
        except sqlite3.Error as exc:
            parser.error(f"cannot read scheduler evidence: {exc}")
        if row is None or row[0] != args.check_rrule or row[1] != "ACTIVE" or row[2] is None:
            parser.error("missing, changed, inactive, or unscheduled automation; verification incomplete")
        first = datetime.fromtimestamp(row[2] / 1000, timezone.utc)
        print("Scheduler next run:", first.astimezone(local_zone).isoformat())
        if first != desired.astimezone(timezone.utc):
            print("MISMATCH: saved scheduler next run differs from requested time")
            return 1
        print("MATCH: saved next run only; actual firing and delivery remain to be verified")
        return 0
    if args.automation_id:
        parser.error("--automation-id requires --check-rrule")
    if args.created_at:
        created = datetime.fromisoformat(args.created_at)
        if created.tzinfo is None:
            parser.error("--created-at needs a UTC offset")
    else:
        created = datetime.now(timezone.utc)
    if desired <= created:
        parser.error("requested time is not after automation creation")

    scheduled = desired.astimezone(scheduler_zone)
    rrule = args.check_rrule or (
        f"RRULE:FREQ=DAILY;COUNT=1;BYHOUR={scheduled.hour};BYMINUTE={scheduled.minute}"
    )
    first = next_daily_fire(rrule, created, scheduler_zone)
    print("RRULE:", rrule)
    print("First fire:", first.astimezone(local_zone).isoformat())
    if first != desired.astimezone(timezone.utc):
        print("MISMATCH: first fire differs from requested time")
        return 1
    print("CANDIDATE ONLY: save through the native tool, then verify with --check-rrule and --automation-id")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
