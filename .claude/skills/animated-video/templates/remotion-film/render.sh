#!/bin/bash
# Full render + two-pass loudness-normalize to -14 LUFS / -1.5 dBTP (Instagram), with an input-hash cache.
# usage: [CONCURRENCY=n] ./render.sh <name> [--fresh] [extra remotion render args, e.g. --props='{"captions":false}']
# Video is capped at 6 Mbit/s so a 60 s Reel lands near 40 MB, under the 50 MB limit (Matthew's rule for every Reel).
#
# Cache: the inputs (src/, public/, package.json, package-lock.json, remotion.config.ts, tsconfig.json, this script,
# the render arguments, a --props file's contents, Node/Remotion/FFmpeg versions) are hashed. When an earlier
# render in out/ has the same hash and its MP4 is byte-identical to what it wrote, that MP4 is reused (copied to
# out/<name>.mp4 if the name differs) and the script says "reused". --fresh always re-renders.
# Next to each render: out/<name>.inputs.sha256 ("inputs <hash>" and "output <sha256> <name>.mp4") and
# out/<name>.inputs.txt (the hashed list; a miss prints which entries changed). Anything the film reads at render
# time must live in src/ or public/, or the cache can't see it changing.
set -e; cd "$(dirname "$0")"
n=reel; fresh=0; extra=()
for a in "$@"; do
  case "$a" in --fresh) fresh=1 ;; -*) extra+=("$a") ;; *) n=$a ;; esac
done
mkdir -p out

list_inputs() {
  for f in package.json package-lock.json remotion.config.ts tsconfig.json render.sh; do [ -f "$f" ] && sha256sum "$f"; done
  find src public -type f ! -name .DS_Store -print0 2>/dev/null | LC_ALL=C sort -z | xargs -0 -r sha256sum
  for a in "${extra[@]}"; do   # a --props=FILE changes the film when the file does
    p=${a#--props=}; [ "$p" != "$a" ] && [ -f "$p" ] && sha256sum "$p"
  done
  echo "args: Film --codec h264 --crf 18 --encoding-max-rate=6M --encoding-buffer-size=12M ${extra[*]}"
  echo "node: $(node --version 2>/dev/null)"
  echo "remotion: $(node -e "const p=require('path'),fs=require('fs');for(const m of ['remotion','@remotion/cli']){let d;try{d=p.dirname(require.resolve(m))}catch{console.log(m+'@none');continue}let j;while(d!==p.dirname(d)&&!(fs.existsSync(p.join(d,'package.json'))&&(j=JSON.parse(fs.readFileSync(p.join(d,'package.json')))).name===m))d=p.dirname(d);console.log(m+'@'+j.version)}" 2>/dev/null | tr '\n' ' ')"
  echo "ffmpeg: $(ffmpeg -version 2>/dev/null | head -1)"
}
list_inputs > out/$n.inputs.new
h=$(sha256sum < out/$n.inputs.new | cut -d' ' -f1)

if [ $fresh = 0 ]; then
  for s in out/$n.inputs.sha256 out/*.inputs.sha256; do   # this name first, then any earlier render
    [ -f "$s" ] && [ "$(sed -n 's/^inputs //p' "$s")" = "$h" ] || continue
    prev=out/$(sed -n 's/^output [0-9a-f]* //p' "$s")
    [ -f "$prev" ] && [ "$(sha256sum < "$prev" | cut -d' ' -f1)" = "$(sed -n 's/^output \([0-9a-f]*\) .*/\1/p' "$s")" ] || continue
    if [ "$prev" != out/$n.mp4 ]; then
      cp "$prev" out/$n.mp4; cp "${s%.sha256}.txt" out/$n.inputs.txt 2>/dev/null || true
      printf 'inputs %s\noutput %s %s\n' "$h" "$(sha256sum < out/$n.mp4 | cut -d' ' -f1)" "$n.mp4" > out/$n.inputs.sha256
    fi
    rm -f out/$n.inputs.new
    echo "reused: true  out/$n.mp4 = $prev (inputs unchanged, ${h:0:12}); ./render.sh $n --fresh to re-render"
    echo "out/$n.mp4 $(( $(stat -c%s out/$n.mp4) / 1000000 )) MB"; exit 0
  done
  if [ -f out/$n.inputs.txt ]; then
    c=$(awk 'function k(){ return length($1)==64 ? substr($0,67) : $1 } NR==FNR{o[k()]=$0; next}
      {s[k()]=1; if(!(k() in o)) print "  new: " k(); else if(o[k()]!=$0) print "  changed: " k()}
      END{for(x in o) if(!(x in s)) print "  removed: " x}' out/$n.inputs.txt out/$n.inputs.new | head -12)
    [ -n "$c" ] && printf 'inputs changed since out/%s.mp4:\n%s\n' "$n" "$c" || echo "inputs unchanged, but out/$n.mp4 is not the file the last render wrote: re-rendering"
  fi
fi
rm -f out/$n.inputs.sha256   # a failed render leaves no hash pointing at a stale file

npx tsc -p .
npx remotion render src/index.ts Film out/$n.raw.mp4 --codec h264 --crf 18 --encoding-max-rate=6M --encoding-buffer-size=12M --concurrency=${CONCURRENCY:-2} --log=error "${extra[@]}"
# Pass 1 measures; pass 2 applies one linear gain (no pumping). linear=true alone can overshoot
# the peak target, so an oversampled limiter at -2.5 dB catches peaks (measured -2.5 dBTP after AAC).
m=$(ffmpeg -hide_banner -nostats -i out/$n.raw.mp4 -af loudnorm=I=-14:TP=-2:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
v() { printf '%s' "$m" | python3 -c "import json,sys; print(json.load(sys.stdin)['$1'])"; }
# loudnorm pads its output to a 100 ms boundary: trim the audio back to the picture's length.
d=$(ffprobe -v error -select_streams v:0 -show_entries stream=duration -of csv=p=0 out/$n.raw.mp4)
ffmpeg -y -v error -i out/$n.raw.mp4 -c:v copy -af "loudnorm=I=-14:TP=-2:LRA=11:measured_I=$(v input_i):measured_TP=$(v input_tp):measured_LRA=$(v input_lra):measured_thresh=$(v input_thresh):offset=$(v target_offset):linear=true,aresample=192000,alimiter=limit=0.75:attack=1:release=50:level=false,aresample=48000,atrim=0:$d" -ar 48000 -c:a aac -b:a 192k out/$n.mp4 && rm out/$n.raw.mp4
mb=$(( $(stat -c%s out/$n.mp4) / 1000000 )); echo "out/$n.mp4 ${mb} MB"
[ "$mb" -lt 50 ] || { echo "over 50 MB: lower --encoding-max-rate" >&2; exit 1; }
mv out/$n.inputs.new out/$n.inputs.txt
printf 'inputs %s\noutput %s %s\n' "$h" "$(sha256sum < out/$n.mp4 | cut -d' ' -f1)" "$n.mp4" > out/$n.inputs.sha256
echo "reused: false  inputs ${h:0:12} -> out/$n.inputs.sha256"
