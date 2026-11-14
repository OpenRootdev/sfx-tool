# Plan format for `sfx-tool mix`

A plan is one JSON file. Paths are relative to the plan. Times are seconds (`12.5`), frames (`"375f"`, using
`fps`) or `"m:ss.s"` (`"1:02.5"`).

```json
{
  "fps": 30,
  "duration": 32,
  "sfx": "sfx",
  "tracks": [
    { "name": "music", "role": "music", "gain": -3,
      "clips": [ { "file": "music.mp3", "at": 0, "from": 12.0, "length": 32, "fadeOut": 2 } ],
      "automation": {
        "lowpass":  [[0, 380], [3.9, 380, "smooth"], [6, 20000]],
        "highpass": [[24, 10], [27.9, 650, "exp"], [28, 10]],
        "gain":     [[0, 0], [27.5, 0], [27.52, -120, "hold"], [28, 0]]
      },
      "duck": { "under": "voice", "amount": -12, "attack": 0.06, "release": 0.45, "hold": 0.3 } },
    { "name": "voice", "role": "voice", "highpass": 90,
      "clips": [ { "file": "vo.wav", "at": "240f" } ] },
    { "name": "ui", "role": "sfx", "gain": 4,
      "clips": [ { "typing": { "text": "ship it", "sound": "knock", "cps": 14, "endChime": true }, "at": 9.2 } ] },
    { "name": "hits", "role": "sfx", "reverb": { "mix": 0.2, "size": 0.7 },
      "clips": [ { "sound": "thock_01", "at": 28, "swell": 0.5 },
                 { "file": "sub.wav", "at": 28, "gain": -4 },
                 { "sound": "done_chime", "at": 31, "set": { "pitch": 659.26 } } ] }
  ],
  "master": { "lufs": -14, "ceiling": -1, "automation": { "lowpass": [[31, 20000], [32, 2000]] } }
}
```

## Track

| Key | Meaning |
|---|---|
| `name` | unique; used by `duck.under` and for `--stems-out` file names |
| `role` | `voice`, `music`, `stem`, `sfx`, `foley`, `ambience`: drives the report's checks |
| `gain` | dB, constant |
| `highpass` / `lowpass` | Hz, constant (or use automation) |
| `q` | filter resonance, default 0.707; 1.2–2 gives a sweep a noticeable "whistle" |
| `automation.gain` | dB offset over time, added to `gain` |
| `automation.lowpass` / `automation.highpass` | Hz over time, interpolated on a log scale |
| `duck` | `{ under: "voice" or ["voice","sfx"], amount: dB, threshold: dBFS (default −45), attack, release, hold, lookahead }` (seconds); add `band: [low Hz, high Hz]` to dip only that band (a voice pocket, e.g. `[1000, 4000]`) instead of the whole track |
| `reverb` | `0.2` or `{ mix, size 0–1, damp 0–1, predelay }` |
| `keyOnly` | used only as a sidechain key for `duck` (e.g. a kick stem driving a groove pump); not heard in the mix |
| `mute` / `solo` | skip this track / render only soloed tracks |

## Plan-level keys

| Key | Meaning |
|---|---|
| `fps` | frames per second for `"375f"` times |
| `duration` | length of the mix |
| `sfx` | folder of sound recipes for `sound` clips |
| `gaps` | `[[start, end], ...]`: silences you mean (a break the picture explains). The report does not warn about silence inside them. |

## Automation points

`[time, value, curve]`. The curve shapes the segment from this point to the next: `lin` (default), `smooth`
(ease in and out), `exp` (slow start, fast end: builds), `hold` (stay, then jump; jumps are smoothed over ~3 ms).
Before the first point and after the last, the value holds. A lowpass of 20000 or a highpass of 10 is treated as
fully open (no colouring).

## Clip

One source per clip:

| Source | Meaning |
|---|---|
| `file` | any audio (48 kHz WAV directly; mp3/m4a/other rates and video files via ffmpeg) |
| `sound` | a recipe name from the sfx folder (`sfx` key or `--dir`), with optional `set` overrides |
| `typing` | `{ text, sound, cps, per, seed, lufs, endChime }` or `{ events: [{t, sound}] }` |

| Key | Meaning |
|---|---|
| `at` | where the clip starts on the timeline |
| `from`, `length` | which part of the source to use |
| `gain` | dB |
| `fadeIn`, `fadeOut` | seconds (defaults 3 ms / 10 ms, so edits never click) |
| `pan` | −1 left … 1 right |
| `reverse` | play backwards |
| `semitones` | varispeed pitch shift (also changes length), for tuning SFX to the key |
| `swell`, `swellGain` | reverse-reverb lead-in of this many seconds ending at `at`; level in dB relative to the clip peak (default −6) |

## Master

`lufs` (default −14), `ceiling` in dBTP (default −1), `automation` with `gain`, `lowpass`, `highpass` (e.g. a
final low-pass close for the ending).

## Output

`mix.wav` (48 kHz, 16-bit stereo), `--stems-out dir` writes each processed track as `<name>.wav` (aligned, same
length) for editors, `--report file.json` writes loudness per track, ducking time, true peak and warnings.
