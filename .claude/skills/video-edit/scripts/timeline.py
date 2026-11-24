#!/usr/bin/env python3
"""Validate, describe and render a timeline.json edit with FFmpeg.

    timeline.py validate FILM/timeline.json
    timeline.py describe FILM/timeline.json
    timeline.py render   FILM/timeline.json [--out OUT.mp4] [--dry-run] [--keep-work] [--work DIR]
    timeline.py still    FILM/timeline.json FRAME [FRAME ...] [--out-dir DIR]

The schema, units, examples and traps are in references/timeline.md. In short: integer
frames at the timeline's fps for at/length/in/fadeIn/fadeOut and keyframe frames; gain in
dB, opacity and scale in percent, position [x, y] px of the clip centre. Later picture
tracks draw on top; clips that overlap on one track crossfade. Paths are relative to the
folder holding timeline.json (the film folder).

render writes the picture and a float mix in one FFmpeg pass, then masters the mix to
mix.loudness / mix.truePeak (default -14 LUFS / -1.5 dBTP) by linear gain (plus a limiter
only when the peak needs it) and re-measures the encoded MP4 until it is inside both.
Captions reuse make_captions.py (words + the voice track's clips become its cutlist) and
text clips reuse text_overlay.py. Standard library only; needs ffmpeg and ffprobe.
"""
import argparse
import json
import math
import re
import shlex
import shutil
import subprocess
import sys
import tempfile
from fractions import Fraction
from pathlib import Path

HERE = Path(__file__).resolve().parent
MAKE_CAPTIONS = HERE / "make_captions.py"
TEXT_OVERLAY = HERE / "text_overlay.py"
ROLES = ("picture", "captions", "voice", "music", "effects")
SOUND_ROLES = ("voice", "music", "effects")
IMAGE_EXT = {".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tif", ".tiff"}
SR = 48000
TOP_KEYS = {"version", "fps", "width", "height", "duration", "acts", "tracks", "mix", "name", "note"}
TRACK_KEYS = {"id", "role", "clips", "note"}
CLIP_KEYS = {"id", "at", "length", "media", "in", "gain", "opacity", "position", "scale", "fit", "sound",
             "dialogue", "fadeIn", "fadeOut", "effects", "follows", "captions", "note"}
PICTURE_ONLY = {"opacity", "position", "scale", "fit"}
MIX_KEYS = {"loudness", "truePeak", "duck"}
DUCK_KEYS = {"mode", "reduceDb", "fadeSeconds", "threshold", "ratio", "attack", "release"}
# studio-sound.md: "a gentle sidechain duck (sidechaincompress=threshold=0.06:ratio=3:attack=60:release=700)"
DUCK_DEFAULTS = {"mode": "sidechain", "threshold": 0.06, "ratio": 3, "attack": 60, "release": 700,
                 "reduceDb": 10, "fadeSeconds": 0.3}


class Problems:
    def __init__(self):
        self.errors, self.warnings = [], []

    def err(self, where, msg):
        self.errors.append(f"{where}: {msg}")

    def warn(self, where, msg):
        self.warnings.append(f"{where}: {msg}")


def is_int(v):
    return isinstance(v, int) and not isinstance(v, bool)


def is_num(v):
    return isinstance(v, (int, float)) and not isinstance(v, bool)


def num(x):
    """A number for an FFmpeg expression (no exponent, no trailing zeros)."""
    s = f"{float(x):.9f}".rstrip("0").rstrip(".")
    return s if s not in ("", "-0") else "0"


def probe(path):
    """{duration, video, audio, width, height} or None when ffprobe cannot read it."""
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries",
                        "stream=codec_type,width,height:format=duration", "-of", "json", str(path)],
                       capture_output=True, text=True)
    if r.returncode:
        return None
    j = json.loads(r.stdout or "{}")
    streams = j.get("streams", [])
    v = next((s for s in streams if s.get("codec_type") == "video"), None)
    dur = j.get("format", {}).get("duration")
    return {"duration": float(dur) if dur not in (None, "N/A") else None,
            "video": v is not None, "audio": any(s.get("codec_type") == "audio" for s in streams),
            "width": v.get("width") if v else None, "height": v.get("height") if v else None}


# ---------------------------------------------------------------- validation

def keyframes(value, where, p, length, kind):
    """Normalize a static value or [{frame, value}] to [(frame, value)]; None when absent."""
    if value is None:
        return None
    ok_value = (lambda v: isinstance(v, list) and len(v) == 2 and all(is_num(c) for c in v)) \
        if kind == "position" else is_num
    if ok_value(value):
        return [(0, value)]
    if not isinstance(value, list) or not value or not all(isinstance(k, dict) for k in value):
        p.err(where, f"{kind} must be a {'[x, y]' if kind == 'position' else 'number'} or a list of "
                     "{frame, value} keyframes")
        return None
    out, last = [], -1
    for k in value:
        if set(k) - {"frame", "value"} or not is_int(k.get("frame")) or not ok_value(k.get("value")):
            p.err(where, f"{kind} keyframe {k} needs integer frame and a valid value")
            return None
        if k["frame"] <= last:
            p.err(where, f"{kind} keyframe frames must increase ({k['frame']} after {last})")
            return None
        if k["frame"] < 0 or k["frame"] >= length:
            p.err(where, f"{kind} keyframe frame {k['frame']} is outside the clip (0..{length - 1}); "
                         "keyframe frames count from the clip's start")
        last = k["frame"]
        out.append((k["frame"], k["value"]))
    return out


def load(path, check_media=True):
    """Parse and validate. Returns (timeline, problems); timeline is normalized when no errors."""
    p = Problems()
    path = Path(path).resolve()
    try:
        tl = json.loads(path.read_text())
    except (OSError, json.JSONDecodeError) as e:
        p.err(str(path), f"cannot read JSON: {e}")
        return None, p
    base = path.parent
    if not isinstance(tl, dict):
        p.err("timeline", "must be an object")
        return None, p
    for k in set(tl) - TOP_KEYS:
        p.err("timeline", f"unknown key {k!r} (not supported; see references/timeline.md)")
    if tl.get("version") != 1:
        p.err("timeline", "version must be 1")
    fps = tl.get("fps")
    if is_int(fps) and fps > 0:
        rate = Fraction(fps)
    elif isinstance(fps, dict) and set(fps) == {"num", "den"} and is_int(fps["num"]) and is_int(fps["den"]) \
            and fps["num"] > 0 and fps["den"] > 0:
        rate = Fraction(fps["num"], fps["den"])
    else:
        p.err("timeline", "fps must be a positive integer or {num, den}")
        rate = Fraction(30)
    for k in ("width", "height"):
        if not (is_int(tl.get(k)) and tl[k] > 0 and tl[k] % 2 == 0):
            p.err("timeline", f"{k} must be a positive even integer (yuv420p)")
    dur = tl.get("duration")
    if not (is_int(dur) and dur > 0):
        p.err("timeline", "duration must be a positive integer number of frames")
        dur = 1
    W, H = tl.get("width") or 2, tl.get("height") or 2
    ids = {}

    def claim(i, where):
        if not isinstance(i, str) or not i:
            p.err(where, "id must be a non-empty string")
        elif i in ids:
            p.err(where, f"id {i!r} already used by {ids[i]} (acts, tracks and clips share one namespace)")
        else:
            ids[i] = where

    acts = tl.get("acts", [])
    if not isinstance(acts, list):
        p.err("acts", "must be a list")
        acts = []
    prev_end = 0
    for i, a in enumerate(acts):
        w = f"acts[{i}]"
        if not isinstance(a, dict) or set(a) - {"id", "from", "to", "note"}:
            p.err(w, "act is {id, from, to}")
            continue
        claim(a.get("id"), w)
        if not (is_int(a.get("from")) and is_int(a.get("to")) and 0 <= a["from"] < a["to"] <= dur):
            p.err(w, f"needs integer 0 <= from < to <= duration ({dur})")
        elif a["from"] < prev_end:
            p.warn(w, "overlaps the previous act")
        else:
            prev_end = a["to"]

    tracks = tl.get("tracks")
    if not isinstance(tracks, list) or not tracks:
        p.err("tracks", "must be a non-empty list")
        tracks = []
    norm_tracks, probes = [], {}
    for ti, t in enumerate(tracks):
        tw = f"tracks[{ti}]"
        if not isinstance(t, dict):
            p.err(tw, "must be an object")
            continue
        for k in set(t) - TRACK_KEYS:
            p.err(tw, f"unknown key {k!r}")
        claim(t.get("id"), tw)
        tw = f"track {t.get('id')!r}"
        role = t.get("role")
        if role not in ROLES:
            p.err(tw, f"role must be one of {', '.join(ROLES)}")
            continue
        clips = t.get("clips")
        if not isinstance(clips, list):
            p.err(tw, "clips must be a list")
            continue
        nclips = []
        for ci, c in enumerate(clips):
            cw = f"{tw} clips[{ci}]"
            if not isinstance(c, dict):
                p.err(cw, "must be an object")
                continue
            claim(c.get("id"), cw)
            cw = f"clip {c.get('id')!r}"
            for k in set(c) - CLIP_KEYS:
                p.err(cw, f"unknown key {k!r} (not supported; see references/timeline.md)")
            at, length = c.get("at"), c.get("length")
            if not (is_int(at) and at >= 0):
                p.err(cw, "at must be an integer frame >= 0")
                continue
            if not (is_int(length) and length > 0):
                p.err(cw, "length must be a positive integer number of frames")
                continue
            if at + length > dur:
                p.err(cw, f"ends at frame {at + length}, after the timeline's duration {dur}")
            n = {"id": c["id"], "at": at, "length": length, "role": role, "track": t.get("id")}
            if role != "picture":
                for k in PICTURE_ONLY & set(c):
                    p.err(cw, f"{k} only applies to picture clips")
            for k in ("fadeIn", "fadeOut"):
                v = c.get(k, 0)
                if not (is_int(v) and 0 <= v <= length):
                    p.err(cw, f"{k} must be an integer number of frames within the clip")
                    v = 0
                n[k] = v
            if n["fadeIn"] + n["fadeOut"] > length:
                p.err(cw, "fadeIn + fadeOut is longer than the clip")
            if c.get("in") is not None and not (is_int(c["in"]) and c["in"] >= 0):
                p.err(cw, "in must be an integer frame >= 0 (source seconds x timeline fps)")
            n["in"] = c.get("in") or 0
            for k in ("sound", "dialogue"):
                if k in c and not isinstance(c[k], bool):
                    p.err(cw, f"{k} must be true or false")
            n["dialogue"] = bool(c.get("dialogue", role == "voice"))
            n["sound"] = role in SOUND_ROLES or bool(c.get("sound")) or (role == "picture" and n["dialogue"])
            n["effects"] = []
            for e in c.get("effects", []) or []:
                if isinstance(e, dict) and set(e) == {"ffmpeg"} and isinstance(e["ffmpeg"], str) and e["ffmpeg"].strip():
                    n["effects"].append(e["ffmpeg"].strip())
                else:
                    p.err(cw, f"effect {e!r} not supported: only {{\"ffmpeg\": \"<filter chain>\"}} "
                              "(applied to the clip's picture on picture tracks, its sound on sound tracks)")
            n["gain"] = keyframes(c.get("gain"), cw, p, length, "gain")
            for f, v in n["gain"] or []:
                if v > 24:
                    p.warn(cw, f"gain {v} dB at frame {f} is very high; gain is dB, not percent")
            media = c.get("media")
            if not isinstance(media, dict):
                p.err(cw, "media must be an object ({file}, {text, args} or {words})")
                continue
            if role == "picture":
                n["opacity"] = keyframes(c.get("opacity"), cw, p, length, "opacity")
                for f, v in n["opacity"] or []:
                    if not 0 <= v <= 100:
                        p.err(cw, f"opacity {v} at frame {f} is outside 0..100 (percent)")
                n["scale"] = keyframes(c.get("scale"), cw, p, length, "scale")
                for f, v in n["scale"] or []:
                    if v <= 5:
                        p.err(cw, f"scale {v} at frame {f}: scale is percent, so {v} draws a dot; "
                                  "100 is the fitted size")
                n["position"] = keyframes(c.get("position"), cw, p, length, "position")
                fit = c.get("fit", "contain")
                if fit not in ("contain", "cover", "none"):
                    p.err(cw, "fit must be contain, cover or none")
                n["fit"] = fit
                if set(media) - {"file", "text", "args"}:
                    p.err(cw, f"picture media takes file, or text with args; got {sorted(media)}")
                if "text" in media:
                    if "file" in media or not isinstance(media["text"], str):
                        p.err(cw, "text media is {text: \"line|*key*\", args: [text_overlay.py options]}")
                        continue
                    args = media.get("args", [])
                    if not (isinstance(args, list) and all(isinstance(a, str) for a in args)):
                        p.err(cw, "media.args must be a list of strings")
                        continue
                    font = args[args.index("--font") + 1] if "--font" in args[:-1] else None
                    if font is None and not Path("/System/Library/Fonts/Avenir Next Condensed.ttc").exists():
                        p.err(cw, "text_overlay.py's default font (macOS Avenir Next Condensed) is missing here; "
                                  "add \"--font\", \"/path/to/font\" to media.args")
                    elif font and not (base / font).exists():
                        p.err(cw, f"font {font} not found")
                    n["text"], n["args"] = media["text"], [str(base / font) if a == font else a for a in args]
                    if font and Path(font).suffix.lower() not in (".ttc", ".otc") and "--index" not in args:
                        n["args"] += ["--index", "0"]  # text_overlay.py's default face 5 exists only in a collection
                    n["image"] = True
                    if n["in"]:
                        p.err(cw, "in has no meaning for text")
                    if n["sound"]:
                        p.err(cw, "text has no sound")
                    nclips.append(n)
                    continue
            elif role == "captions":
                if n["gain"] or n["fadeIn"] or n["fadeOut"] or n["effects"] or n["in"]:
                    p.err(cw, "captions clips take only at, length, media, follows, captions")
                n["sound"] = False
                if set(media) == {"words"} and isinstance(media["words"], str):
                    n["words"] = base / media["words"]
                    if not n["words"].exists():
                        p.err(cw, f"words file {media['words']} not found (paths are relative to the film folder)")
                    n["follows"] = c.get("follows")
                    if not isinstance(n["follows"], str):
                        p.err(cw, "a words caption needs follows: the id of the track whose clips are the speech")
                    opts = c.get("captions", {})
                    if not isinstance(opts, dict) or set(opts) - {"fix", "drop_word_before", "capitalize_first",
                                                                   "style"}:
                        p.err(cw, "captions options are make_captions.py's fix, drop_word_before, "
                                  "capitalize_first, style")
                        opts = {}
                    n["captions"] = opts
                elif set(media) == {"file"} and str(media["file"]).lower().endswith(".ass"):
                    n["ass"] = base / media["file"]
                    if not n["ass"].exists():
                        p.err(cw, f"{media['file']} not found (paths are relative to the film folder)")
                    if "follows" in c or "captions" in c:
                        p.err(cw, "follows and captions apply to words captions only")
                else:
                    p.err(cw, "captions media is {words: \"words.json\"} with follows, or {file: \"x.ass\"}")
                nclips.append(n)
                continue
            if set(media) != {"file"} and role != "picture":
                p.err(cw, "sound media is {file}")
                continue
            f = media.get("file")
            if not isinstance(f, str):
                p.err(cw, "media.file must be a path string")
                continue
            n["file"] = (base / f)
            n["image"] = n["file"].suffix.lower() in IMAGE_EXT
            if n["image"] and (n["in"] or n["sound"]):
                p.err(cw, "an image has no in point or sound")
            if check_media:
                if not n["file"].exists():
                    p.err(cw, f"{f} not found (paths are relative to the film folder {base})")
                else:
                    info = probes.get(n["file"]) or probe(n["file"])
                    probes[n["file"]] = info
                    if info is None:
                        p.err(cw, f"ffprobe cannot read {f}")
                    else:
                        n["probe"] = info
                        if role == "picture" and not info["video"]:
                            p.err(cw, f"{f} has no picture")
                        if n["sound"] and not info["audio"]:
                            p.err(cw, f"{f} has no audio stream (sound/dialogue/role {role})")
                        need = float(Fraction(n["in"] + length) / rate)
                        if not n["image"] and info["duration"] is not None \
                                and need > info["duration"] + 0.5 / float(rate):
                            p.err(cw, f"needs source up to {need:.3f} s (in {n['in']} + length {length} frames "
                                      f"at {float(rate):g} fps) but {f} lasts {info['duration']:.3f} s")
            nclips.append(n)
        # overlaps on one track: allowed only as a crossfade between neighbours
        nclips.sort(key=lambda n: n["at"])
        for a, b in zip(nclips, nclips[1:]):
            ov = a["at"] + a["length"] - b["at"]
            if ov <= 0:
                continue
            if role == "captions":
                p.err(f"clip {b['id']!r}", f"overlaps caption clip {a['id']!r}; captions on one track take turns")
            elif ov >= min(a["length"], b["length"]) or b["at"] + b["length"] <= a["at"] + a["length"]:
                p.err(f"clip {b['id']!r}", f"overlaps {a['id']!r} by {ov} frames; a crossfade must be shorter "
                                           "than both clips (put a full overlap on another track)")
        for a, c in zip(nclips, nclips[2:]):
            if a["at"] + a["length"] > c["at"]:
                p.err(f"clip {c['id']!r}", f"three clips overlap on track {t.get('id')!r}")
        norm_tracks.append({"id": t.get("id"), "role": role, "clips": nclips})

    track_ids = {t["id"]: t for t in norm_tracks}
    for t in norm_tracks:
        for c in t["clips"]:
            if "follows" in c and isinstance(c["follows"], str):
                ft = track_ids.get(c["follows"])
                if ft is None or ft["role"] not in ("voice", "picture"):
                    p.err(f"clip {c['id']!r}", f"follows {c['follows']!r} must name a voice or picture track")
                elif not speech_clips(ft):
                    p.err(f"clip {c['id']!r}", f"track {ft['id']!r} has no voice or dialogue clips to caption")
                else:
                    files = {str(x.get("file")) for x in speech_clips(ft)}
                    if len(files) > 1:
                        p.err(f"clip {c['id']!r}", f"track {ft['id']!r} uses {len(files)} media files; one words "
                                                   "file needs one source (split the captions per source)")

    mix = tl.get("mix") or {}
    if not isinstance(mix, dict):
        p.err("mix", "must be an object")
        mix = {}
    for k in set(mix) - MIX_KEYS:
        p.err("mix", f"unknown key {k!r}")
    loud = mix.get("loudness", -14)
    tp = mix.get("truePeak", -1.5)
    if loud is not None and not (is_num(loud) and -40 < loud < 0):
        p.err("mix", "loudness is integrated LUFS (e.g. -14), or null to skip mastering")
    if not (is_num(tp) and -12 < tp <= 0):
        p.err("mix", "truePeak is dBTP (e.g. -1.5)")
    duck = mix.get("duck")
    if duck is not None:
        if not isinstance(duck, dict) or set(duck) - DUCK_KEYS:
            p.err("mix.duck", f"keys are {sorted(DUCK_KEYS)}")
            duck = None
        else:
            duck = {**DUCK_DEFAULTS, **duck}
            if duck["mode"] not in ("sidechain", "keyframes"):
                p.err("mix.duck", "mode is sidechain or keyframes")
            if not any(t["role"] == "music" for t in norm_tracks):
                p.warn("mix.duck", "no music track to duck")
            if not any(c["dialogue"] for t in norm_tracks for c in t["clips"]):
                p.warn("mix.duck", "no voice track or dialogue clip to duck under")
    out = {"path": path, "base": base, "fps": rate, "width": W, "height": H, "duration": dur,
           "acts": acts, "tracks": norm_tracks,
           "mix": {"loudness": loud, "truePeak": tp, "duck": duck}, "name": tl.get("name") or path.stem}
    return out, p


# ---------------------------------------------------------------- describe

def describe(tl):
    fps = tl["fps"]
    s = lambda f: f"{float(Fraction(f) / fps):.3f}s"
    fr = f"{fps.numerator}/{fps.denominator}" if fps.denominator != 1 else str(fps.numerator)
    lines = [f"{tl['name']}: {tl['width']}x{tl['height']} at {fr} fps, {tl['duration']} frames ({s(tl['duration'])})"]
    for a in tl["acts"]:
        lines.append(f"  act {a['id']}: {a['from']}-{a['to']} ({s(a['from'])}-{s(a['to'])})")
    for i, t in enumerate(tl["tracks"]):
        layer = f", layer {sum(1 for x in tl['tracks'][:i] if x['role'] == 'picture')}" if t["role"] == "picture" else ""
        lines.append(f"track {t['id']} ({t['role']}{layer}, {len(t['clips'])} clips)")
        for c in t["clips"]:
            end = c["at"] + c["length"]
            src = (c.get("file") and Path(c["file"]).name) or (c.get("text") and f"text {c['text']!r}") \
                or (c.get("words") and f"words {Path(c['words']).name} following {c.get('follows')}") \
                or (c.get("ass") and Path(c["ass"]).name)
            bits = [f"  {c['id']:<14} {c['at']:>6}-{end:<6} ({s(c['at'])}-{s(end)}, {c['length']} f)  {src}"]
            if c.get("in"):
                bits.append(f"in {c['in']} ({s(c['in'])})")
            for k in ("fadeIn", "fadeOut"):
                if c.get(k):
                    bits.append(f"{k} {c[k]}")
            for k in ("gain", "opacity", "scale", "position"):
                v = c.get(k)
                if v:
                    bits.append(f"{k} {v[0][1]}" if len(v) == 1 else
                                f"{k} " + " ".join(f"{f}:{val}" for f, val in v))
            if c["role"] == "picture" and (c["sound"] or c["dialogue"]):
                bits.append("dialogue" if c["dialogue"] else "sound")
            if c.get("effects"):
                bits.append(f"effects {c['effects']}")
            lines.append("  ".join(bits))
        for a, b in zip(t["clips"], t["clips"][1:]):
            ov = a["at"] + a["length"] - b["at"]
            if ov > 0:
                lines.append(f"  crossfade {a['id']} -> {b['id']}: {ov} frames from {b['at']} ({s(b['at'])})")
    m = tl["mix"]
    duck = m["duck"]
    lines.append(f"mix: loudness {m['loudness']} LUFS, true peak {m['truePeak']} dBTP (measured on the MP4)"
                 + (f", duck {duck['mode']}" if duck else ", no duck"))
    return "\n".join(lines)


# ---------------------------------------------------------------- render plan

def kf_expr(kfs, var, fps, scale=1.0, index=None):
    """Piecewise-linear keyframes as an FFmpeg expression of `var` (seconds from the clip's start),
    held before the first and after the last keyframe."""
    val = (lambda v: v[index]) if index is not None else (lambda v: v)
    e = num(val(kfs[0][1]) * scale)
    for (fa, va), (fb, vb) in zip(kfs, kfs[1:]):
        sa, sb = float(Fraction(fa) / fps), float(Fraction(fb) / fps)
        dv = (val(vb) - val(va)) * scale
        if dv:
            e += f"+{num(dv)}*clip(({var}-{num(sa)})/{num(sb - sa)},0,1)"
    return e


def speech_clips(track):
    """The clips a words caption follows: every voice clip, or a picture track's dialogue clips."""
    return [x for x in track["clips"] if track["role"] == "voice" or x["dialogue"]]


def crossfades(tl):
    """Per clip: (picture fade in, audio fade in, audio fade out) in frames, adding the crossfade overlaps."""
    out = {}
    for t in tl["tracks"]:
        for c in t["clips"]:
            out[c["id"]] = [c["fadeIn"], c["fadeIn"], c["fadeOut"]]
        for a, b in zip(t["clips"], t["clips"][1:]):
            ov = a["at"] + a["length"] - b["at"]
            if ov > 0:
                out[b["id"]][0] = out[b["id"]][0] or ov
                out[b["id"]][1] = out[b["id"]][1] or ov
                out[a["id"]][2] = out[a["id"]][2] or ov
    return out


def plan(tl, work, video=True, audio=True):
    """Build (pre-steps, ffmpeg input args, filtergraph lines, has_audio). pre-steps are commands
    that must run first (text PNGs, captions) as (argv, description)."""
    fps, W, H, D = tl["fps"], tl["width"], tl["height"], tl["duration"]
    rate = f"{fps.numerator}/{fps.denominator}"
    sec = lambda f: float(Fraction(f) / fps)
    total_samples = round(Fraction(D) / fps * SR)
    pre, inputs, g = [], [], []
    fades = crossfades(tl)

    def add_input(args):
        inputs.extend(args)
        return sum(1 for a in inputs if a == "-i") - 1

    clip_input = {}
    for t in tl["tracks"]:
        for c in t["clips"]:
            if t["role"] == "captions":
                continue
            need_v = t["role"] == "picture" and video
            need_a = c["sound"] and audio
            if not (need_v or need_a):
                continue
            if c.get("text"):
                png = work / f"text-{c['id']}.png"
                pre.append(([sys.executable, str(TEXT_OVERLAY), str(png), c["text"], *c["args"]],
                            f"text clip {c['id']}"))
                c = dict(c, file=png)
            if c.get("image"):
                args = ["-loop", "1", "-framerate", rate, "-t", num(sec(c["length"])), "-i", str(c["file"])]
            else:
                args = (["-ss", num(sec(c["in"]))] if c["in"] else []) + \
                       ["-t", num(sec(c["length"] + 1)), "-i", str(c["file"])]
            clip_input[c["id"]] = add_input(args)

    labels = iter(f"x{i}" for i in range(10 ** 6))
    if video:
        g.append(f"color=c=black:s={W}x{H}:r={rate}:d={num(sec(D))},format=yuv420p[base]")
        cur = "base"
        for t in tl["tracks"]:
            if t["role"] != "picture":
                continue
            for c in t["clips"]:
                k, L = clip_input[c["id"]], c["length"]
                f = [f"fps={rate}", f"trim=end_frame={L}", "setpts=PTS-STARTPTS"] + c["effects"]
                f.append("format=yuva420p")
                op = c["opacity"]
                if op and len(op) > 1:
                    f.append(f"geq=lum='lum(X,Y)':cb='cb(X,Y)':cr='cr(X,Y)':a='alpha(X,Y)*({kf_expr(op, 'T', fps, 0.01)})'")
                elif op and op[0][1] < 100:
                    f.append(f"colorchannelmixer=aa={num(op[0][1] / 100)}")
                vin, _, _ = fades[c["id"]]
                if vin:
                    f.append(f"fade=t=in:st=0:d={num(sec(vin))}:alpha=1")
                if c["fadeOut"]:
                    f.append(f"fade=t=out:st={num(sec(L - c['fadeOut']))}:d={num(sec(c['fadeOut']))}:alpha=1")
                # scale last: filters after a per-frame scale (colorchannelmixer, geq) keep the first frame's size
                fit = {"contain": f"min({W}/iw,{H}/ih)", "cover": f"max({W}/iw,{H}/ih)", "none": "1"}[c["fit"]]
                sc = c["scale"] or [(0, 100)]
                anim = len(sc) > 1
                S = kf_expr(sc, "t", fps, 0.01)
                if anim or c["fit"] != "none" or sc[0][1] != 100:
                    # even sizes; per-frame evaluation only when scale is keyframed (rounds to whole pixels)
                    f.append(f"scale=w='max(2,trunc(iw*{fit}*({S})/2)*2)':h='max(2,trunc(ih*{fit}*({S})/2)*2)'"
                             + (":eval=frame" if anim else "") + ":flags=bicubic,format=yuva420p")
                f.append(f"setpts=PTS+{c['at']}")  # timebase is 1/fps after the fps filter
                lab = next(labels)
                g.append(f"[{k}:v]" + ",".join(f) + f"[{lab}]")
                pos = c["position"] or [(0, [W / 2, H / 2])]
                u = f"(t-{num(sec(c['at']))})"
                x = kf_expr(pos, u, fps, index=0) if len(pos) > 1 else num(pos[0][1][0])
                y = kf_expr(pos, u, fps, index=1) if len(pos) > 1 else num(pos[0][1][1])
                nxt = next(labels)
                g.append(f"[{cur}][{lab}]overlay=x='{x}-overlay_w/2':y='{y}-overlay_h/2':eof_action=pass"
                         + (":eval=frame" if len(pos) > 1 or anim else ":eval=init") + f"[{nxt}]")
                cur = nxt
        for t in tl["tracks"]:
            if t["role"] != "captions":
                continue
            for c in t["clips"]:
                ass = work / f"captions-{c['id']}.ass"
                if c.get("words"):
                    ft = next(x for x in tl["tracks"] if x["id"] == c["follows"])
                    cut = dict(c["captions"], segments=[
                        {"src_start": sec(x["in"]), "src_end": sec(x["in"] + x["length"]), "out_start": sec(x["at"])}
                        for x in speech_clips(ft)])
                    cutfile = work / f"captions-{c['id']}.cutlist.json"
                    pre.append((("write", cutfile, json.dumps(cut, indent=1)), f"cutlist for captions {c['id']}"))
                    pre.append(([sys.executable, str(MAKE_CAPTIONS), str(c["words"]), str(cutfile), str(ass)],
                                f"captions {c['id']} from {Path(c['words']).name}"))
                    pre.append((("clamp", ass, ass, 0.0, sec(c["at"]), sec(c["at"] + c["length"])),
                                f"keep captions {c['id']} inside its clip"))
                else:
                    pre.append((("clamp", c["ass"], ass, sec(c["at"]), sec(c["at"]), sec(c["at"] + c["length"])),
                                f"shift {Path(c['ass']).name} to frame {c['at']}"))
                nxt = next(labels)
                g.append(f"[{cur}]subtitles=filename='{ass.name}'[{nxt}]")  # ffmpeg runs in the work dir
                cur = nxt
        g.append(f"[{cur}]format=yuv420p[vout]")

    has_audio = False
    if audio:
        buses = {"dialogue": [], "music": [], "other": []}
        for t in tl["tracks"]:
            for c in t["clips"]:
                if not c["sound"]:
                    continue
                k, L = clip_input[c["id"]], c["length"]
                n = round(Fraction(L) / fps * SR)
                f = [f"aresample={SR}", "aformat=sample_fmts=fltp:channel_layouts=stereo",
                     f"apad=whole_len={n}", f"atrim=end_sample={n}", "asetpts=PTS-STARTPTS"]
                f += c["effects"] if t["role"] != "picture" else []
                gk = c["gain"]
                if gk and len(gk) > 1:
                    f.append(f"volume='pow(10,({kf_expr(gk, 't', fps)})/20)':eval=frame")
                elif gk and gk[0][1]:
                    f.append(f"volume={num(gk[0][1])}dB")
                _, ain, aout = fades[c["id"]]
                # a hard edge gets technical.md's micro-fades (5 ms in, 8 ms out) against clicks
                ain_s, aout_s = (sec(ain) if ain else 0.005), (sec(aout) if aout else 0.008)
                f.append(f"afade=t=in:st=0:d={num(ain_s)}")
                f.append(f"afade=t=out:st={num(sec(L) - aout_s)}:d={num(aout_s)}")
                d = round(Fraction(c["at"]) / fps * SR)
                if d:
                    f.append(f"adelay=delays={d}S:all=1")
                f += [f"apad=whole_len={total_samples}", f"atrim=end_sample={total_samples}"]
                lab = next(labels)
                g.append(f"[{k}:a]" + ",".join(f) + f"[{lab}]")
                bus = "dialogue" if c["dialogue"] else "music" if t["role"] == "music" else "other"
                buses[bus].append(lab)
        out = {}
        for name, labs in buses.items():
            if not labs:
                continue
            out[name] = labs[0] if len(labs) == 1 else next(labels)
            if len(labs) > 1:
                g.append("".join(f"[{x}]" for x in labs) + f"amix=inputs={len(labs)}:normalize=0:duration=longest[{out[name]}]")
        duck = tl["mix"]["duck"]
        if duck and "music" in out and "dialogue" in out:
            m = next(labels)
            if duck["mode"] == "sidechain":
                dl, key = next(labels), next(labels)
                g.append(f"[{out['dialogue']}]asplit=2[{dl}][{key}]")
                g.append(f"[{out['music']}][{key}]sidechaincompress=threshold={num(duck['threshold'])}:"
                         f"ratio={num(duck['ratio'])}:attack={num(duck['attack'])}:release={num(duck['release'])}"
                         f":makeup=1[{m}]")
                out["dialogue"] = dl
            else:
                g.append(f"[{out['music']}]volume='{duck_expr(tl, duck)}':eval=frame[{m}]")
            out["music"] = m
        if out:
            has_audio = True
            labs = list(out.values())
            mixf = (("".join(f"[{x}]" for x in labs) + f"amix=inputs={len(labs)}:normalize=0:duration=longest,")
                    if len(labs) > 1 else f"[{labs[0]}]")
            g.append(mixf + f"atrim=end_sample={total_samples}[aout]")
    return pre, inputs, g, has_audio


def duck_expr(tl, duck):
    """Music gain (linear) that dips duck.reduceDb over every dialogue clip, ramping fadeSeconds
    before its start and after its end. Dialogue spans closer than two ramps merge."""
    fps, fade = tl["fps"], float(duck["fadeSeconds"])
    spans = sorted((float(Fraction(c["at"]) / fps), float(Fraction(c["at"] + c["length"]) / fps))
                   for t in tl["tracks"] for c in t["clips"] if c["dialogue"] and c["sound"])
    merged = []
    for a, b in spans:
        if merged and a - merged[-1][1] < 2 * fade:
            merged[-1][1] = max(merged[-1][1], b)
        else:
            merged.append([a, b])
    if fade <= 0:
        terms = [f"between(t,{num(a)},{num(b)})" for a, b in merged]
    else:
        terms = [f"clip((t-{num(a - fade)})/{num(fade)},0,1)*clip(({num(b + fade)}-t)/{num(fade)},0,1)"
                 for a, b in merged]
    return f"pow(10,-{num(duck['reduceDb'])}*({'+'.join(terms) or '0'})/20)"


def clamp_ass(src, dst, shift, lo, hi):
    """Copy an ASS file, shifting Dialogue times by `shift` s and keeping them inside [lo, hi)."""
    def parse(ts):
        h, m, s = ts.split(":")
        return int(h) * 3600 + int(m) * 60 + float(s)

    def fmt(t):
        cs = round(t * 100)
        return f"{cs // 360000}:{cs // 6000 % 60:02d}:{cs // 100 % 60:02d}.{cs % 100:02d}"

    out, dropped = [], 0
    for line in Path(src).read_text().splitlines(keepends=True):
        m = re.match(r"^(Dialogue:\s*[^,]*,)([^,]+),([^,]+),(.*)$", line, re.S)
        if m:
            a, b = parse(m.group(2)) + shift, parse(m.group(3)) + shift
            a, b = max(a, lo), min(b, hi)
            if b - a < 0.01:
                dropped += 1
                continue
            line = f"{m.group(1)}{fmt(a)},{fmt(b)},{m.group(4)}"
        out.append(line)
    Path(dst).write_text("".join(out))
    return dropped


def ffmpeg_version():
    r = subprocess.run(["ffmpeg", "-version"], capture_output=True, text=True)
    m = re.search(r"ffmpeg version n?(\d+)", r.stdout)
    return int(m.group(1)) if m else 0


def script_flag():
    # FFmpeg 7 reads a filter file with -/filter_complex; 6.x with -filter_complex_script
    return "-/filter_complex" if ffmpeg_version() >= 7 else "-filter_complex_script"


def run_pre(pre, dry):
    for step, desc in pre:
        if step[0] == "write":
            if dry:
                print(f"# {desc}: write {step[1]}\n{step[2]}")
            else:
                Path(step[1]).write_text(step[2])
        elif step[0] == "clamp":
            if dry:
                print(f"# {desc}: {Path(step[1]).name} -> {Path(step[2]).name}, shift {step[3]:.3f} s, "
                      f"keep {step[4]:.3f}-{step[5]:.3f} s")
            else:
                clamp_ass(*step[1:])
        else:
            print(f"# {desc}\n{shlex.join(step)}")
            if not dry:
                r = subprocess.run(step, capture_output=True, text=True)
                sys.stdout.write(r.stdout)
                if r.returncode:
                    sys.exit(f"{desc} failed:\n{r.stderr}")
                if "FIX BEFORE BURNING" in r.stdout:
                    sys.exit(f"{desc}: make_captions.py reports overlapping captions; fix timing before burning")


def measure(path):
    """Integrated loudness (LUFS) and true peak (dBTP) of the first audio stream."""
    r = subprocess.run(["ffmpeg", "-nostdin", "-hide_banner", "-i", str(path), "-map", "0:a:0",
                        "-af", "loudnorm=print_format=json", "-f", "null", "-"], capture_output=True, text=True)
    j = json.loads(r.stderr[r.stderr.rindex("{"):r.stderr.rindex("}") + 1])
    return float(j["input_i"]), float(j["input_tp"])


# ---------------------------------------------------------------- commands

def render(tl, out, work, dry):
    pre, inputs, g, has_audio = plan(tl, work)
    graph = work / "graph.txt"
    pic = work / "picture.mp4"
    wav = work / "mix.wav"
    rate = f"{tl['fps'].numerator}/{tl['fps'].denominator}"
    cmd = ["ffmpeg", "-nostdin", "-v", "error", "-stats", "-y", *inputs, script_flag(), graph.name,
           "-map", "[vout]", "-frames:v", str(tl["duration"]), "-r", rate, "-c:v", "libx264", "-crf", "19",
           "-preset", "medium", "-pix_fmt", "yuv420p", pic.name]
    if has_audio:
        cmd += ["-map", "[aout]", "-c:a", "pcm_f32le", wav.name]
    print(f"# work dir (ffmpeg runs here so caption paths resolve): {work}")
    run_pre(pre, dry)
    if dry:
        print(f"# filtergraph {graph.name}:\n" + ";\n".join(g))
        print("# picture + mix\n" + f"cd {shlex.quote(str(work))} && " + shlex.join(cmd))
    else:
        graph.write_text(";\n".join(g))
        subprocess.run(cmd, cwd=work, check=True)
    target, ceiling = tl["mix"]["loudness"], tl["mix"]["truePeak"]
    mux = lambda af, dst: ["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", str(pic), "-i", str(wav), "-map", "0:v",
                           "-map", "1:a", "-c:v", "copy", "-af", af, "-c:a", "aac", "-b:a", "192k", "-ar", str(SR),
                           "-movflags", "+faststart", str(dst)]
    if not has_audio:
        cmd = ["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", str(pic), "-c", "copy", "-movflags", "+faststart",
               str(out)]
        print("# no sound clips: picture only\n" + shlex.join(cmd))
        if not dry:
            subprocess.run(cmd, check=True)
            return {"out": str(out), "audio": None}
        return None
    if dry:
        print(f"# master: measure {wav.name}, then linear gain to {target} LUFS (a limiter only when the true peak "
              f"needs it), AAC 192k, re-measured on the MP4 until <= {ceiling} dBTP\n"
              + shlex.join(mux("volume=GAINdB[,alimiter=limit=LIN:level=0:latency=1]", out)))
        return None
    if target is None:
        subprocess.run(mux("anull", out), check=True)
        i, tp = measure(out)
        return {"out": str(out), "loudness": i, "truePeak": tp, "mastered": False}
    i0, tp0 = measure(wav)
    if not math.isfinite(i0):
        sys.exit("the mix is silent; check gains and sound clips")
    gain, limit, tries = target - i0, ceiling - 0.3, []
    for attempt in range(5):
        af = f"volume={gain:.3f}dB"
        limited = tp0 + gain > limit
        if limited:  # sample-peak limiter, latency compensated, no auto-level (technical.md)
            af += f",alimiter=limit={10 ** (limit / 20):.5f}:attack=5:release=50:level=0:latency=1"
        subprocess.run(mux(af, out), check=True)
        i, tp = measure(out)
        tries.append({"gain_db": round(gain, 2), "limiter_dbfs": round(limit, 2) if limited else None,
                      "loudness": i, "truePeak": tp})
        if abs(i - target) <= 0.5 and tp <= ceiling:
            break
        if tp > ceiling:
            limit -= tp - ceiling + 0.2
        if abs(i - target) > 0.5:
            gain += target - i
    else:
        print(f"WARNING: mastering did not converge: {tries[-1]}", file=sys.stderr)
    return {"out": str(out), "loudness": i, "truePeak": tp, "mastered": True, "attempts": tries,
            "ok": abs(i - target) <= 0.5 and tp <= ceiling}


def stills(tl, frames, out_dir, work, dry):
    bad = [f for f in frames if not 0 <= f < tl["duration"]]
    if bad:
        sys.exit(f"frames {bad} outside 0..{tl['duration'] - 1}")
    pre, inputs, g, _ = plan(tl, work, audio=False)
    sel = "+".join(f"eq(n\\,{f})" for f in sorted(set(frames)))
    g[-1] = g[-1].replace("[vout]", f",trim=end_frame={max(frames) + 1},select='{sel}'[vout]")
    graph = work / "graph.txt"
    cmd = ["ffmpeg", "-nostdin", "-v", "error", "-y", *inputs, script_flag(), graph.name, "-map", "[vout]",
           "-fps_mode", "passthrough", "-frames:v", str(len(set(frames))), "still-%05d.png"]
    run_pre(pre, dry)
    if dry:
        print(f"# filtergraph {graph.name}:\n" + ";\n".join(g))
        print(f"cd {shlex.quote(str(work))} && " + shlex.join(cmd))
        return []
    graph.write_text(";\n".join(g))
    subprocess.run(cmd, cwd=work, check=True)
    out_dir.mkdir(parents=True, exist_ok=True)
    written = []
    for i, f in enumerate(sorted(set(frames)), 1):
        dst = out_dir / f"{tl['name']}-f{f:05d}.png"
        shutil.move(str(work / f"still-{i:05d}.png"), dst)
        written.append(str(dst))
    return written


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    for name in ("validate", "describe", "render", "still"):
        s = sub.add_parser(name)
        s.add_argument("timeline")
        if name in ("render", "still"):
            s.add_argument("--dry-run", action="store_true", help="print the commands and filtergraph; run nothing")
            s.add_argument("--work", help="work directory (default: a temp dir, removed unless --keep-work)")
            s.add_argument("--keep-work", action="store_true")
        if name == "render":
            s.add_argument("--out", help="default: PROJECT/renders/<name>.mp4 (the film folder's parent)")
        if name == "still":
            s.add_argument("frames", nargs="+", type=int)
            s.add_argument("--out-dir", help="default: PROJECT/stills/")
    a = ap.parse_args(argv)
    tl, p = load(a.timeline)
    for w in p.warnings:
        print(f"warning: {w}", file=sys.stderr)
    if p.errors:
        for e in p.errors:
            print(f"error: {e}", file=sys.stderr)
        sys.exit(f"{len(p.errors)} error(s) in {a.timeline}")
    if a.cmd == "validate":
        print(f"ok: {sum(len(t['clips']) for t in tl['tracks'])} clips on {len(tl['tracks'])} tracks, "
              f"{tl['duration']} frames")
        return
    if a.cmd == "describe":
        print(describe(tl))
        return
    if shutil.which("ffmpeg") is None or shutil.which("ffprobe") is None:
        sys.exit("ffmpeg and ffprobe are required")
    work = Path(a.work).resolve() if a.work else Path(tempfile.mkdtemp(prefix="timeline-"))
    work.mkdir(parents=True, exist_ok=True)
    try:
        if a.cmd == "render":
            out = Path(a.out).resolve() if a.out else tl["base"].parent / "renders" / f"{tl['name']}.mp4"
            if not a.dry_run:
                out.parent.mkdir(parents=True, exist_ok=True)
            res = render(tl, out, work, a.dry_run)
            if res:
                r = subprocess.run(["ffprobe", "-v", "error", "-count_frames", "-select_streams", "v:0",
                                    "-show_entries", "stream=nb_read_frames,width,height", "-of", "json", str(out)],
                                   capture_output=True, text=True, check=True)
                st = json.loads(r.stdout)["streams"][0]
                res.update(frames=int(st["nb_read_frames"]), size=[st["width"], st["height"]])
                if res["frames"] != tl["duration"]:
                    res["ok"] = False
                    print(f"WARNING: {res['frames']} frames written, timeline has {tl['duration']}", file=sys.stderr)
                print(json.dumps(res, indent=1))
                if res.get("ok") is False:
                    sys.exit(1)
        else:
            out_dir = Path(a.out_dir).resolve() if a.out_dir else tl["base"].parent / "stills"
            for f in stills(tl, a.frames, out_dir, work, a.dry_run):
                print(f)
    finally:
        if a.keep_work or a.dry_run and a.work:
            print(f"# work kept: {work}", file=sys.stderr)
        else:
            shutil.rmtree(work, ignore_errors=True)


if __name__ == "__main__":
    main()
