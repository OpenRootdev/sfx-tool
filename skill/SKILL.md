---
name: sfx-tool
description: Make, shape and place subtle typing and UI sound effects with sfx-tool - dull key taps (tap, thock, tick, wood knock, felt, two-stage keycap), soft bubble pops, line pops and gentle completion chimes - all synthesized locally, no account or API key. Use when a video (HyperFrames, Remotion, an HTML page rendered to MP4 with Playwright + ffmpeg) needs typing, text-appear or UI pop sounds; when the user wants a new sound described in words ("softer", "more wooden", "like a real keyboard"); or when the user is working in the sfx-tool Studio and wants help tuning sounds.
---

# sfx-tool

Sounds are **recipes**: small JSON files in a project's sound folder (default `./sfx`). Each one names a
family, a model, a seed and only the settings that differ from the family's defaults. WAVs are always
rendered from recipes (`sfx/wav/<name>.wav`), so editing a recipe *is* editing the sound.

```json
{ "name": "soft_knock", "family": "knock", "model": "tap", "seed": 71,
  "params": { "pitch": 280, "muffle": 1100, "noise": 0.03 }, "description": "Softer knock" }
```

Command: `npx github:OpenRootdev/sfx-tool …` runs it without installing; in a clone use `node bin/sfx-tool.js …`,
or `npm link` once to get a plain `sfx-tool` command. Node 18+, no other dependencies.

## The Studio and you work on the same folder

`sfx-tool studio [dir] --open` starts a local page (http://localhost:5178) where the user hears every sound,
moves sliders and sees the waveform, spectrum and click/harshness checks update live. Their slider moves are
saved into the recipe files. **Anything you change in those files (by CLI or by editing JSON) appears in the
open Studio within a second**, with a notice and the sound highlighted. So the loop is:

1. Start the Studio in the background for the user (it keeps running; one per folder).
2. The user says what they want ("knock_02 but duller and shorter").
3. You change the recipe with `sfx-tool set` / `sfx-tool new` (below). They press Space in the Studio to hear it.
4. Run `sfx-tool check` and say what the numbers say. You cannot hear: say the sound was measured, not heard.

Never overwrite a sound the user tuned by hand without asking. Make a new one (`new … --from`) or variants instead.

## Commands

```bash
sfx-tool init [dir]                             # default 34-sound pack into ./sfx
sfx-tool list [dir]                             # what's there
sfx-tool params knock                           # every setting for a family/model, with ranges and defaults
sfx-tool new soft_knock --from knock_01 --set muffle=1100 pitch=280 --desc "Softer knock"
sfx-tool new my_tick --from tick                # from a family's defaults
sfx-tool set soft_knock noise=0.03 length=0.05  # change settings (also seed=, description=)
sfx-tool variants soft_knock --count 4          # soft_knock_v1..v4 with new seeds, to audition
sfx-tool render [dir]                           # re-render WAVs (the Studio and set/new do this already)
sfx-tool check sfx/wav                          # clicks, clipping, harshness, loudness; exit 1 on problems
sfx-tool track --text 'npm i sfx-tool' --start 1 --cps 18 --sound knock --end-chime -o typing.wav
sfx-tool track --times events.json --fps 30 --sound tap --duration 12 -o sfx.wav
```

## Words to settings

| They say | Change |
|---|---|
| deeper / heavier / thockier | `pitch` down (thock ≈ 200–260 Hz), `length` up a little |
| lighter / smaller / tickier | `pitch` up (tick ≈ 520–650), `length` down |
| softer / duller / more muted | `muffle` down (felt ≈ 800), `softness` up, `noise` down |
| crisper / more clicky | `noise` up, `softness` down, `muffle` up (stay under ~2800 for taps) |
| more wooden / hollow | `h1Ratio` ≈ 2.7–2.8, `h1Amp` up (0.3–0.4), `h2Ratio` ≈ 5.4 |
| shorter / tighter / drier | `length` down, `ring` (damping) up |
| rings longer / boomier | `ring` down, `length` up |
| more like a real keyboard | keycap: `preGain` 0.3–0.6, `preGapMs` 8–18 |
| bubblier (pops) | `rise` up, `riseTime` down |
| varied but same character | `sfx-tool variants`, or a new `seed` |

Keep every sound passing `check`. If it flags harsh above 4 kHz, lower `muffle` or `noise`/`noiseHi`. If it flags a click, raise `softness`.

## Tracks for videos

One track per video beats many audio tags. `track` gives each event a fresh take with ±6 ms timing,
±1 semitone pitch and ±1.5 dB level drift and a slight stereo spread, shortens hits in fast runs, drops hits
closer than 40 ms, and normalises to **−30 LUFS** with a **−12 dBFS** peak ceiling (the ceiling wins for sparse tracks).
`--sound` takes a sound name or a family (each event picks a random sound from that family).

Take timestamps from the animation itself (the same `t` the typewriter uses), as `.txt`, `.csv` or `.json`:
`[0.5, 0.56]` or `[{"t": 12, "sound": "line_01"}, {"t": 20, "pitch": 300, "gain": 0.8}, {"t": 45, "sound": "chime"}]`; `--fps` reads frames.

- **HyperFrames:** `<audio id="typing-sfx" src="assets/audio/typing.wav" data-start="0" data-volume="1" data-audio-group="sfx"></audio>` (every `<audio>` needs an id; `data-start` is local to its composition).
- **Remotion:** `<Audio src={staticFile('typing.wav')} />`, or `<Sequence from={42}><Audio src={staticFile('sfx/wav/line_01.wav')} /></Sequence>` for one hit. Build times from `startFrame + i * framesPerChar` and pass `--fps`.
- **HTML → frames → MP4:** `ffmpeg -i demo.mp4 -i typing.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest out.mp4`. With music: `-filter_complex "[1:a][2:a]amix=inputs=2:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11[a]"`. GIFs have no sound.

Level guide: −30 LUFS reads as texture under a −16 LUFS music bed. Without music use `--lufs -26`. Under a voice, use the felt or soft families.

## Model reference

- **tap** (tap, thock, tick, knock, felt, keycap): damped body whose pitch drops at the hit (`settle`, `settleMs`), two inharmonic overtones (`h1/h2 Ratio, Amp, Decay`; decay 0 = follows the body), a band-passed contact noise (`noise`, `noiseLo/Hi`, `noiseMs`), an optional key-down hit (`preGain`, `preRatio`, `preGapMs`).
- **bubble** (pop, soft, line): sine whose pitch rises as it decays (`rise`, `riseTime`), `h2` overtone, optional second bubble (`doubleGain`, `doubleRatio`, `doubleLength`, `doubleOffsetMs`).
- **chime**: two soft bell notes (`interval` 1.5 = a fifth, `delayMs`, `secondGain`, `bright`).
- All: `length`, `softness` (attack ms), `ring` (damping), `muffle` (low-pass Hz), `highpass`, `loudness` (file level, pack standard −28 LUFS), `variation` (how far the seed moves pitch, length and muffle).
