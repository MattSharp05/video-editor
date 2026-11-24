#!/usr/bin/env python3
"""Check timeline.py: validation traps, describe, dry-run, and a measured end-to-end render on
synthetic media (ffmpeg color/sine sources) in a temp dir. Needs ffmpeg; standard library only.

    python3 test_timeline.py [--keep DIR]     # --keep writes the media, timeline and render to DIR
"""
import json
import math
import shutil
import struct
import subprocess
import sys
import tempfile
from pathlib import Path

SCRIPT = Path(__file__).with_name("timeline.py")
FONT = next((f for f in ("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
                         "/System/Library/Fonts/Avenir Next Condensed.ttc") if Path(f).exists()), None)
W, H, FPS = 360, 640, 30


def ff(*args):
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", *args], check=True)


def run(*args, ok=True):
    r = subprocess.run([sys.executable, str(SCRIPT), *map(str, args)], capture_output=True, text=True, timeout=600)
    if ok and r.returncode:
        raise AssertionError(f"timeline.py {args[0]} failed:\n{r.stdout}\n{r.stderr}")
    return r


def media(d):
    ff("-f", "lavfi", "-i", f"color=red:s={W}x{H}:r={FPS}:d=4", "-f", "lavfi", "-i", "sine=f=440:d=4:sample_rate=48000",
       "-shortest", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", str(d / "cam_a.mp4"))
    ff("-f", "lavfi", "-i", f"color=blue:s={W}x{H}:r={FPS}:d=4", "-c:v", "libx264", "-pix_fmt", "yuv420p",
       str(d / "cam_b.mp4"))
    ff("-f", "lavfi", "-i", "color=0x00FF00:s=100x100:d=1", "-frames:v", "1", str(d / "logo.png"))
    ff("-f", "lavfi", "-i", "sine=f=220:d=6:sample_rate=48000", str(d / "music.wav"))
    # word times in cam_a's seconds; the clip starts at source 0.5 s (in = 15 frames)
    (d / "words.json").write_text(json.dumps({"segments": [{"words": [
        {"word": " Hello", "start": 0.8, "end": 1.2}, {"word": " world.", "start": 1.25, "end": 1.7},
        {"word": " Unused", "start": 3.5, "end": 3.9}]}]}))


def timeline(duck={"mode": "sidechain"}, text=True):
    tracks = [
        {"id": "camera", "role": "picture", "clips": [
            {"id": "a", "at": 0, "length": 80, "in": 15, "media": {"file": "cam_a.mp4"}, "dialogue": True,
             "fadeIn": 10, "gain": 10},
            {"id": "b", "at": 70, "length": 80, "media": {"file": "cam_b.mp4"}}]},
        {"id": "overlay", "role": "picture", "clips": [
            {"id": "logo", "at": 30, "length": 60, "media": {"file": "logo.png"}, "fit": "none", "opacity": 50,
             "position": [{"frame": 0, "value": [100, 200]}, {"frame": 59, "value": [260, 200]}],
             "scale": [{"frame": 0, "value": 100}, {"frame": 59, "value": 200}]}]},
        {"id": "music", "role": "music", "clips": [
            {"id": "bed", "at": 0, "length": 150, "media": {"file": "music.wav"}, "gain": -6, "fadeOut": 15}]},
        {"id": "subs", "role": "captions", "clips": [
            {"id": "subs-1", "at": 0, "length": 150, "media": {"words": "words.json"}, "follows": "camera",
             "captions": {"style": {"play_res": [W, H], "size": 40, "margin_v": 60}}}]},
    ]
    if text and FONT:
        tracks.insert(2, {"id": "title", "role": "picture", "clips": [
            {"id": "hook", "at": 100, "length": 40, "media": {"text": "HOOK LINE",
                                                                 "args": ["--y", "0.12", "--font", FONT]}}]})
    return {"version": 1, "fps": FPS, "width": W, "height": H, "duration": 150,
            "acts": [{"id": "open", "from": 0, "to": 80}, {"id": "close", "from": 80, "to": 150}],
            "tracks": tracks, "mix": {"loudness": -14, "truePeak": -1.5, **({"duck": duck} if duck else {})}}


def frame_rgb(video, n, x, y, w=1, h=1):
    """Pixels (r, g, b) of a w x h box at (x, y) in frame n."""
    r = subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-i", str(video), "-vf",
                        f"select=eq(n\\,{n}),format=rgb24,crop={w}:{h}:{x}:{y}", "-frames:v", "1", "-f", "rawvideo",
                        "-pix_fmt", "rgb24", "-"], capture_output=True, check=True)
    d = r.stdout
    return [tuple(d[i:i + 3]) for i in range(0, len(d), 3)]


def mean(px):
    return tuple(sum(p[i] for p in px) / len(px) for i in range(3))


def band_db(video, hz, a, b):
    """RMS level (dBFS) of a narrow band around `hz` between a and b seconds."""
    r = subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-i", str(video), "-vn", "-af",
                        f"atrim={a}:{b},bandpass=f={hz}:width_type=q:w=8,bandpass=f={hz}:width_type=q:w=8",
                        "-ac", "1", "-f", "f32le", "-"], capture_output=True, check=True)
    s = struct.unpack(f"<{len(r.stdout) // 4}f", r.stdout)
    return 10 * math.log10(sum(v * v for v in s) / len(s) + 1e-20)


def check_validation(d):
    bad = timeline()
    bad["tracks"][1]["clips"][0]["scale"] = 2
    bad["tracks"][0]["clips"][1]["lenght"] = 3
    bad["tracks"][0]["clips"].append({"id": "c", "at": 140, "length": 20, "media": {"file": "nope.mp4"}})
    bad["tracks"][2]["clips"][0]["id"] = "a"
    bad["tracks"][0]["clips"][0]["in"] = 100  # 100 + 80 frames = 6 s of a 4 s source
    (d / "bad.json").write_text(json.dumps(bad))
    r = run("validate", d / "bad.json", ok=False)
    assert r.returncode != 0
    for needle in ("scale is percent", "unknown key 'lenght'", "nope.mp4 not found", "after the timeline's duration",
                   "id 'a' already used", "lasts 4.0"):
        assert needle in r.stderr, (needle, r.stderr)
    three = timeline(text=False)
    three["tracks"][0]["clips"].append({"id": "c", "at": 75, "length": 10, "media": {"file": "cam_b.mp4"}})
    (d / "three.json").write_text(json.dumps(three))
    assert "three clips overlap" in run("validate", d / "three.json", ok=False).stderr
    print("ok validation")


def check_describe_and_dry_run(d, tl):
    out = run("describe", tl).stdout
    assert "360x640 at 30 fps, 150 frames (5.000s)" in out, out
    assert "70-150" in out and "(2.333s-5.000s" in out and "crossfade a -> b: 10 frames" in out, out
    ntsc = json.loads(tl.read_text())
    ntsc["fps"] = {"num": 30000, "den": 1001}
    (d / "ntsc.json").write_text(json.dumps(ntsc))
    assert "(5.005s)" in run("describe", d / "ntsc.json").stdout
    dry = run("render", tl, "--dry-run", "--out", d / "never.mp4").stdout
    assert "ffmpeg" in dry and "overlay=" in dry and "sidechaincompress" in dry and "subtitles=" in dry, dry
    assert "make_captions.py" in dry and not (d / "never.mp4").exists()
    print("ok describe, dry-run")


def check_render(d, tl):
    out = d / "render.mp4"
    res = json.loads(_json_tail(run("render", tl, "--out", out).stdout))
    assert res["frames"] == 150 and res["size"] == [W, H], res
    assert abs(res["loudness"] + 14) <= 0.5 and res["truePeak"] <= -1.5, res
    print(f"ok render: {res['frames']} frames, {res['loudness']} LUFS, {res['truePeak']} dBTP on the MP4")

    r0 = mean(frame_rgb(out, 0, 170, 500, 10, 10))
    assert max(r0) < 30, r0  # fadeIn from black
    ra = mean(frame_rgb(out, 40, 170, 500, 10, 10))
    assert ra[0] > 200 and ra[2] < 60, ra  # camera a: red
    rx = mean(frame_rgb(out, 75, 170, 500, 10, 10))
    assert 80 < rx[0] < 180 and 80 < rx[2] < 180, rx  # crossfade midpoint: red and blue
    rb = mean(frame_rgb(out, 100, 170, 500, 10, 10))
    assert rb[2] > 200 and rb[0] < 60, rb  # camera b: blue
    print(f"ok picture: frame 0 {r0}, a {ra}, crossfade {rx}, b {rb}")

    def logo(n):  # green-tinted columns on row 200 (logo at 50% over red/blue)
        row = frame_rgb(out, n, 0, 200, W, 1)
        cols = [i for i, p in enumerate(row) if p[1] > 90]
        return cols, row
    c1, row1 = logo(31)
    c2, _ = logo(89)
    w1, w2 = len(c1), len(c2)
    m1, m2 = (c1[0] + c1[-1]) / 2, (c2[0] + c2[-1]) / 2
    assert 96 <= w1 <= 108 and abs(m1 - 103) <= 4, (w1, m1)  # frame 1 of 60: x 100 -> 260, 100% -> 200%
    assert 192 <= w2 <= 202 and abs(m2 - 260) <= 4, (w2, m2)
    g = mean([row1[i] for i in c1[5:-5]])
    assert 90 < g[1] < 170 and 90 < g[0] < 170, g  # 50% green over red
    print(f"ok overlay: width {w1} -> {w2} px, centre {m1} -> {m2}, colour {g}")

    def white(n, y0, y1):
        px = frame_rgb(out, n, 0, y0, W, y1 - y0)
        return sum(1 for p in px if min(p) > 200)
    assert white(20, 440, 600) > 200 and white(130, 440, 600) == 0  # caption at 0.67 s, none at 4.3 s
    if FONT:
        assert white(120, 50, 110) > 100 and white(60, 50, 110) == 0  # text clip at frames 100-140
    print("ok captions" + (" and text" if FONT else " (no font for the text clip)"))

    voice_on, voice_off = band_db(out, 440, 0.5, 2.3), band_db(out, 440, 3.0, 3.8)
    assert voice_on - voice_off > 30, (voice_on, voice_off)  # dialogue only on clip a
    print(f"ok voice: 440 Hz {voice_on:.1f} dB in clip a, {voice_off:.1f} dB after")
    return out


def _json_tail(stdout):
    return stdout[stdout.index("{"):]


def check_duck(d):
    levels = {}
    for mode, duck in (("none", None), ("sidechain", {"mode": "sidechain"}),
                       ("keyframes", {"mode": "keyframes", "reduceDb": 12, "fadeSeconds": 0.2})):
        tl = d / f"duck-{mode}.json"
        tl.write_text(json.dumps(timeline(duck, text=False)))
        out = d / f"duck-{mode}.mp4"
        run("render", tl, "--out", out)
        # music under the voice (0.5-2.3 s) relative to music in the pause (3.0-3.8 s)
        levels[mode] = band_db(out, 220, 0.5, 2.3) - band_db(out, 220, 3.0, 3.8)
    dip_sc = levels["none"] - levels["sidechain"]
    dip_kf = levels["none"] - levels["keyframes"]
    assert dip_sc > 3, levels
    assert abs(dip_kf - 12) < 1.0, levels
    print(f"ok duck: music under voice vs pause {levels['none']:.1f} dB unducked, "
          f"sidechain dips {dip_sc:.1f} dB, keyframes dip {dip_kf:.1f} dB (asked 12)")


def check_limiter_and_still(d):
    # quiet tone with near-full-scale clicks: -14 LUFS by gain alone would put the clicks far over -1.5 dBTP
    ff("-f", "lavfi", "-i", "aevalsrc='0.05*sin(2*PI*300*t)+if(lt(mod(t\\,0.5)\\,0.004)\\,0.9*sin(2*PI*2000*t)\\,0)'"
       ":s=48000:d=3", str(d / "clicks.wav"))
    tl = {"version": 1, "fps": FPS, "width": W, "height": H, "duration": 90,
          "tracks": [{"id": "pic", "role": "picture", "clips": [
                          {"id": "p1", "at": 0, "length": 90, "media": {"file": "cam_b.mp4"}, "fit": "cover"}]},
                     {"id": "fx", "role": "effects", "clips": [
                          {"id": "clicks", "at": 0, "length": 90, "media": {"file": "clicks.wav"}}]}]}
    (d / "peaks.json").write_text(json.dumps(tl))
    res = json.loads(_json_tail(run("render", d / "peaks.json", "--out", d / "peaks.mp4").stdout))
    assert res["ok"] and res["truePeak"] <= -1.5 and abs(res["loudness"] + 14) <= 0.5, res
    assert res["attempts"][-1]["limiter_dbfs"] is not None, res
    print(f"ok limiter: {res['loudness']} LUFS, {res['truePeak']} dBTP after {len(res['attempts'])} encode(s)")
    lines = run("still", d / "timeline.json", "40", "100", "--out-dir", d / "stills").stdout.splitlines()
    out = [x for x in lines if x.endswith(".png") and not x.startswith("#")]
    assert len(out) == 2 and out[0].endswith("-f00040.png") and all(Path(p).exists() for p in out), lines
    a, b = mean(frame_rgb(out[0], 0, 170, 500, 10, 10)), mean(frame_rgb(out[1], 0, 170, 500, 10, 10))
    assert a[0] > 200 > a[2] and b[2] > 200 > b[0], (a, b)  # the same frames as the render: red, then blue
    print("ok still")


def main():
    keep = Path(sys.argv[sys.argv.index("--keep") + 1]) if "--keep" in sys.argv else None
    root = keep or Path(tempfile.mkdtemp(prefix="test-timeline-"))
    root.mkdir(parents=True, exist_ok=True)
    try:
        media(root)
        tl = root / "timeline.json"
        tl.write_text(json.dumps(timeline(), indent=1))
        assert "ok:" in run("validate", tl).stdout
        check_validation(root)
        check_describe_and_dry_run(root, tl)
        check_render(root, tl)
        check_duck(root)
        check_limiter_and_still(root)
    finally:
        if not keep:
            shutil.rmtree(root, ignore_errors=True)
    print("timeline checks passed")


if __name__ == "__main__":
    main()
