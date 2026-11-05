#!/usr/bin/env bash
# Keep official spawn/delivery semantics, using an on-demand detached tmux PTY.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
command -v tmux >/dev/null || { echo 'agmsg: tmux is required for quiet spawning' >&2; exit 1; }
check=0
if [ "${1:-}" = --check ]; then check=1; shift; fi
if [ "$check" = 0 ] && [ "$#" -lt 2 ]; then
  echo 'Usage: spawn-quiet.sh <type> <name> [spawn.sh options]' >&2; exit 1
fi
# Explicit visible placement is opt-in; otherwise every call owns its server.
if [ "$check" = 0 ]; then
  for arg in "$@"; do
    case "$arg" in
      --terminal|--terminal-driver|--window|--split)
        echo 'agmsg: quiet spawn manages placement; use spawn.sh for an explicit visible placement' >&2; exit 1 ;;
    esac
  done
fi
job_dir="$(mktemp -d "${TMPDIR:-/tmp}/agmsg-quiet.XXXXXX")"
socket_name="agmsg-quiet-$$"
channel="finished-$$"
trap 'rm -rf "$job_dir"' EXIT
{
  printf '#!/usr/bin/env bash\nset +e\nunset CODEX_INTERNAL_ORIGINATOR_OVERRIDE\n'
  printf 'cd %q\n' "$PWD"
  if [ "$check" = 1 ]; then
    printf 'bash %q >%q 2>&1\n' "$SCRIPT_DIR/where.sh" "$job_dir/output"
  else
    printf 'bash %q' "$SCRIPT_DIR/spawn.sh"
    printf ' %q' "$@"
    printf ' --window --terminal-driver tmux >%q 2>&1\n' "$job_dir/output"
  fi
  printf 'printf "%%s\\n" "$?" >%q\n' "$job_dir/result"
  printf 'tmux wait-for -S %q\n' "$channel"
  printf 'tmux wait-for %q\n' "$channel-ack"
} > "$job_dir/run.sh"
# tmux creates real TMUX/TMUX_PANE markers in this process; none are fabricated.
tmux -L "$socket_name" new-session -d -s agmsg -n launcher bash "$job_dir/run.sh"
tmux -L "$socket_name" wait-for "$channel"
cat "$job_dir/output"
result="$(cat "$job_dir/result")"
tmux -L "$socket_name" wait-for -S "$channel-ack"
exit "$result"
