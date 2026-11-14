# Music: choosing it, cutting it, matching it

## Pick by energy curve, not by genre name

Sketch the video's energy over time (calm intro → build → reveal → explain → finale). Choose a track whose own
energy curve (`sfx-tool analyse` prints dBFS per second) can be cut to match, or which has stems so you can
build the curve yourself.

| Video | Tempo | Typical direction |
|---|---|---|
| Calm explainer, tutorial, documentary | 80–100 BPM | soft piano/pads, lo-fi, ambient pulse |
| Product / tech / motion graphics | 105–125 BPM | minimal electronic, light house, clean plucks, foley percussion |
| Launch, hype, sport, fast social | 125–150 BPM | punchy electronic, big drums, risers and drops |
| Luxury / premium / ASMR feel | 70–100 BPM or none | sparse, close, dry; few elements, lots of air |
| Playful / kids / consumer app | 100–130 BPM | ukulele, marimba, claps, bouncy plucks, cartoon pops |
| Cinematic / story / documentary | free time or 60–90 BPM | strings, piano, low drones, big hits and long tails |

These are starting points, not a house style. Choose from the brief, the brand and the platform, and when the
user has a taste or reference track, follow it.

### Palettes: music and SFX from one world

The strongest edits use SFX that sound like they belong to the music. Pick the music first, then build the SFX
palette from the same materials. Some examples:

| Palette | Music | SFX | Search terms |
|---|---|---|---|
| Close and tactile | quiet groove of dry organic percussion (key thocks, wood knocks, clicks) over a soft kick and warm bass | keyboard taps, thocks, knocks (sfx-tool's tap families) | minimal tech, foley percussion beat, micro house, clicks and cuts |
| Glassy tech | clean synth plucks, airy pads, tight hats | glass taps, digital blips, filtered whooshes | future garage, tech minimal, UI sound kit |
| Warm analogue | felt piano, tape-saturated drums | paper, pencil, soft felt, cloth | lo-fi, felt piano, chillhop |
| Big and cinematic | strings, braams, taiko | impacts with sub drops, risers, reverse swells | trailer, cinematic hits, hybrid orchestral |
| Bright and playful | marimba, claps, whistles | bubble pops, boings, plucks | quirky, upbeat ukulele, cartoon |

Whatever the palette, the same rules apply: one world, tuned to the key, on the grid.

## Hooks and loops: why some beds stick

A bed that stays in people's heads after a showcase or motion-graphics piece usually has these traits, all of which
`sfx-tool spot` and `analyse` can measure in a reference:

- **A short riff that repeats** (one or two bars) over harmony that barely moves: one chord or a pedal note. The
  repetition is the hook; the picture supplies the variety.
- **A tight rhythmic grid.** Nearly every hit lands on a 16th note, with a few steps left empty (often just before
  the downbeat) so the loop breathes and the next bar lands harder.
- **The groove lives in the low end.** Sub and bass carry the pulse; the top stays light, which leaves room for the
  picture's own sounds.
- **A tempo that suits the subject.** Brisk enough to feel like progress (often 105–125 BPM for product and motion
  pieces), slow enough that each new image gets a moment.
- **The arrangement changes, the riff does not.** Layers drop out and return with the story (thin for a setup,
  full for a result, one break) instead of new melodies arriving.

The picture does not have to hit every beat over a hook. A steady groove lets the motion move freely; lock only the
structural moments (the first result, the return after a break, the end) to bar lines.

It gets in the way under narration (a hook competes with words for attention), in calm or serious pieces, and over
long videos, where an unchanging loop wears out: vary the layers every 4–8 bars or let the bed thin out under talk.

Learn from references by measuring them (`sfx-tool spot reference.mp4`), then build your own riff, sound and
arrangement from the traits. Don't copy the reference's melody or recording.

## Tempo and the beat grid

- `sfx-tool analyse music.mp3 --fps 30 --beats-out beats.json` → BPM, first beat, frames per beat, all beat times.
- Bars: 4 beats in most music. Big changes go on bar starts (beat 1); medium ones on beats; nothing between beats
  unless it is a deliberate syncopation.
- Frame of beat *n*: `round((firstBeat + n * 60 / BPM) * fps)`.
- Tempo detection can land on half or double; check that the reported beat feels like the one a listener taps.

## Key: make SFX and music agree

- `analyse` prints the key, its scale and three "safe" notes (tonic, fifth, third) with frequencies.
- Tune tonal SFX (chimes, plucks, risers' end notes, bass hits, swells) to those notes:
  `sfx-tool new done_chime --from chime --set pitch=E5` or `semitones` on a clip.
- Relative keys (C major / A minor) share all their notes, so tuning works for either.
- Two tracks in one video: use the same key, or neighbours on the Camelot wheel (same number ±1, or A↔B of the
  same number). Otherwise separate them with a gap or a non-tonal transition (hit, whoosh).
- Untuned noises (clicks, taps, whooshes) do not need tuning; keep them out of the music's busiest band instead.

## Stems: use parts of a song, not all of it

Separate any track locally (free, MIT): `pip install demucs` then

```
python -m demucs -n htdemucs song.mp3            # → separated/htdemucs/song/{drums,bass,other,vocals}.wav
python -m demucs -n htdemucs --two-stems vocals song.mp3   # vocals / no_vocals
```

Give each stem its own track in the plan (role `stem`) with the same `at` and `from`, then arrange with gain
automation:

| Section | Stems |
|---|---|
| Intro / title | `other` only, low-passed |
| Under voice-over | `bass` + `other`, drums and vocals out (sung words fight spoken ones for the same attention) |
| Build | add `drums`, rising high-pass on everything |
| Drop / reveal | all stems, filters open |
| Outro | `other` + last drum hit, reverb tail |

Stems also let you **move a part**: use a song's chorus melody (the `other` stem from 1:12) under your intro
while the original drums carry on, as long as both are in the same key and tempo.

## Cutting music to length

- Cut on bar boundaries (both sides of the cut on beat 1), with a 10–30 ms crossfade (`fadeIn`/`fadeOut`).
- Shorten by removing whole bars (often 4 or 8), never partial ones.
- Make the music end with the video: find the track's ending, place it so its last downbeat lands on the final
  frame, and cut earlier material to fit. Start the edit there if you have to ("back-timing").
- Loop a section by repeating its clip with `from`/`length` = exactly n bars.

## Getting into and out of a song

Starting or stopping a song where it was not written to start or stop sounds like slamming the brakes. These
recipes make the join sound designed:

**Into a song.**
- If the song has no lead-in, make one from the song itself: take its first beat (or first bar), reverse it, and
  place it so it ends exactly on the song's first downbeat. It rises into the music in the song's own sound.
  `{ "file": "song.mp3", "from": 0, "length": 0.55, "reverse": true, "at": 3.45 }` ahead of the song starting at
  `4.0` (length = one beat at the song's tempo).
- If the first beat does not reverse well, reverse the song's tail instead (its last ringing chord).
- The same trick re-enters a song after a break or quiet section, and brings in a second song.

**Out of a song.**
- Cut just before a beat, so the last thing heard is a whole hit, never half of one.
- Put that last hit on its own track with a large hall reverb (`"reverb": { "mix": 0.5, "size": 0.9 }`) so it rings
  out after the dry music stops. Optionally fade the dry track a little early and let the reverb copy carry under it.

**Layer sounds on the join.** Risers, swells or suck-backs (reversed cymbals) under the way in make it seamless;
impacts, slams or a sub hit on the way out make an ending land with weight. Keep them from the same palette as the
music.

## Where music comes from

User-supplied, a licensed library (check the licence covers the platform), or generated locally (e.g. MusicGen)
when nothing else is available. Generated music gives less control over structure: generate, analyse, then cut it
to the edit like any other track. Never use commercial songs without a licence.
