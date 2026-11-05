#!/bin/bash
# claude-worker.sh — Claude Codeへ非対話でタスクを委任するラッパー
#
# 使い方（プロンプトは必ずstdinから渡す。シェル展開事故防止のため引数渡しは不可）:
#   新規: claude-worker.sh [-C workdir] [-m model | -F] < prompt.txt
#   継続: claude-worker.sh [-C workdir] [-m model | -F] -r <session_id> < prompt.txt
#
# 応答はJSON 1件を無加工で標準出力へ流す。session_id は応答JSONに含まれる。

set -euo pipefail

usage() {
  echo "usage: claude-worker.sh [-C workdir] [-r session_id] [-m model | -F] < prompt.txt" >&2
  exit 2
}

workdir=""
resume_id=""
model=""
fable_consult=0

while getopts ":C:r:m:Fh" opt; do
  case "$opt" in
    C) workdir=$OPTARG ;;
    r) resume_id=$OPTARG ;;
    m) model=$OPTARG ;;
    F) fable_consult=1 ;;
    h) usage ;;
    *) usage ;;
  esac
done
shift $((OPTIND - 1))
if [ "$fable_consult" -eq 1 ] && [ -n "$model" ]; then
  echo "claude-worker.sh: -F と -m は同時に指定できません" >&2
  usage
fi
if [ $# -ne 0 ]; then
  echo "claude-worker.sh: プロンプトは引数でなくstdinから渡してください" >&2
  usage
fi

if [ -t 0 ]; then
  echo "claude-worker.sh: stdinにプロンプトがありません（ヒアドキュメントかパイプで渡してください）" >&2
  exit 2
fi

if [ -n "$workdir" ]; then
  if [ ! -d "$workdir" ]; then
    echo "claude-worker.sh: 作業ディレクトリが存在しません: $workdir" >&2
    exit 2
  fi
  cd "$workdir"
fi

args=(-p --output-format json --permission-mode bypassPermissions)
if [ -n "$resume_id" ]; then
  args+=(--resume "$resume_id")
fi
if [ "$fable_consult" -eq 1 ]; then
  args+=(--model fable --effort medium --tools '')
elif [ -n "$model" ]; then
  args+=(--model "$model")
fi

# stdinをそのままclaudeに引き継ぐ（プロンプトはシェルを経由しない）
exec claude "${args[@]}"
