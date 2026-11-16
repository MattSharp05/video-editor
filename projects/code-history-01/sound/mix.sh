#!/usr/bin/env bash
# Mix a voice over a music track for the film, then master to -14 LUFS / -1.5 dBTP.
# usage: ./mix.sh VOICE_KEY MUSIC_KEY MUSIC_START_S MUSIC_GAIN_DB OUT_NAME
# Music ~10-12 dB under speech with a gentle sidechain duck, fade in 1.5 s, out 2.5 s (studio-sound.md).
set -euo pipefail
V=../vo/full/$1/vo.wav; M=../music/full/$2.mp3; SS=$3; G=$4; OUT=$5
DUR=58.17
ffmpeg -v error -y -i "$V" -ss "$SS" -t "$DUR" -i "$M" -filter_complex "
[0:a]aformat=sample_rates=48000:channel_layouts=stereo,apad=whole_dur=$DUR,volume=12dB,asplit=2[vo][key];
[1:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=${G}dB,afade=t=in:d=1.5,afade=t=out:st=$(echo "$DUR-2.5"|bc):d=2.5[mus];
[mus][key]sidechaincompress=threshold=0.06:ratio=3:attack=60:release=700[duck];
[vo][duck]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[out]" -map "[out]" -ar 48000 "$OUT.wav"
# stems for measuring the voice-to-music gap
ffmpeg -v error -y -i "$V" -ss "$SS" -t "$DUR" -i "$M" -filter_complex "
[0:a]aformat=sample_rates=48000:channel_layouts=stereo,apad=whole_dur=$DUR,volume=12dB[key];
[1:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=${G}dB,afade=t=in:d=1.5[mus];
[mus][key]sidechaincompress=threshold=0.06:ratio=3:attack=60:release=700[duck]" -map "[duck]" "${OUT}_music_stem.wav"
