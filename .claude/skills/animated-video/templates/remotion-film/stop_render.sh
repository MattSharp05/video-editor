#!/bin/bash
# Stop every render of one film and prove nothing survives (references/remotion-pipeline.md#gotchas).
# Killing the chunk loop alone is not enough: `npx remotion render` -> node -> compositor + chrome-headless-shell keep
# running, get reparented to pid 1, and an orphaned node renderer keeps writing frames from the OLD bundle into the
# output folder (Volcano 01: one did for 20 min at full CPU after a "stop", halving the restarted render's speed).
# usage: bash stop_render.sh [FILM_DIR]   (default: the current directory). Exits 1 if anything is still running.
DIR=$(cd "${1:-.}" && pwd)
# never kill this script or the shells that called it (they may sit in the film folder too)
SKIP=" "; p=$$; while [ "$p" -gt 1 ] 2>/dev/null; do SKIP="$SKIP$p "; p=$(awk '{print $4}' /proc/$p/stat 2>/dev/null || echo 1); done
pids() {  # every other process working in, or running from, the film folder: chunk loops, npx/node, compositor, chrome
  for d in /proc/[0-9]*; do
    p=${d#/proc/}; case "$SKIP" in *" $p "*) continue;; esac
    cmd=$(tr '\0' ' ' < $d/cmdline 2>/dev/null); case "$cmd" in *stop_render.sh*|"") continue;; esac
    cwd=$(readlink $d/cwd 2>/dev/null)
    case "$cwd/ $cmd" in *"$DIR/"*|*"$DIR "*) echo $p;; esac
  done
}
for sig in TERM KILL; do
  P=$(pids); [ -z "$P" ] && break
  kill -$sig $P 2>/dev/null; sleep 2
done
# headless chrome that lost its parent (ppid 1) from earlier stops, from any folder
ps -A -o pid=,ppid=,command= | awk '$2==1 && /chrome-headless-shell/ {print $1}' | xargs -r kill -9 2>/dev/null
left=$(pids)
if [ -n "$left" ]; then echo "STILL RUNNING:"; ps -o pid=,ppid=,etime=,command= -p $left | cut -c1-140; exit 1; fi
echo "no render processes left for $DIR"
