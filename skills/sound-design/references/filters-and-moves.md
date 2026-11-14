# Filters and moves: what each does to the viewer, with numbers

Every move below is a few lines of automation in a plan (see plan-format.md). Times are seconds unless noted;
`"120f"` is frame 120. The numbers are starting points that usually work; move them to suit the music and the
picture. A move is strongest when it is rare: one or two per minute of video is typical, one per cut wears it out.

## Low-pass: distance, anticipation, "not yet"

A low-pass removes the top of the sound. Muffled music reads as *far away, behind a wall, underwater, in the
past, before it begins*. Opening it reads as *arrival*.

| Use | Cutoff | Shape |
|---|---|---|
| Intro "from the next room", opening on the title | 300–500 Hz → fully open (20000) | hold for the intro, then `smooth` over 1–2 bars, fully open on a downbeat |
| Flashback / memory / dream | 800–1200 Hz, plus reverb on that track | cut in on the transition, cut out on the return |
| Ducking out to make room for a moment (focus) | 1–2 kHz for 1–2 beats | quick `smooth` down and back |
| Pause / menu / "the world goes quiet" | 400–700 Hz + gain −6 dB | `smooth` 0.3–0.6 s |

```json
"automation": { "lowpass": [[0, 380], ["3.9", 380, "smooth"], [6, 20000]] }
```

## High-pass: lift, thinning, build-up

A high-pass removes the bottom. Rising it over a build makes the music feel lighter and more anxious, so when
the bass slams back on the drop it feels huge. This is the most used tension move in modern edits.

| Use | Cutoff | Shape |
|---|---|---|
| Build into a drop / reveal | 20 → 400–800 Hz over the last 2–8 bars | `exp` (slow start, fast end), snap back to 10 Hz exactly on the downbeat |
| Radio / phone / screen-in-screen | high-pass 300 Hz + low-pass 3000 Hz on that track | static |
| Make room under a voice | high-pass 120–200 Hz on music while the voice talks | `smooth` 0.2 s in/out |
| Small UI sounds that should feel light | 150–250 Hz on the SFX track | static |

```json
"automation": { "highpass": [[24, 10], [27.9, 650, "exp"], [28.0, 10]] }
```

## Silence before the hit (the "gap"), and longer breaks

A gap works because the brain predicts a beat that does not come, and the hit resolves it. It must feel like
a **held breath**, never like the audio broke:

- **Short.** ¼–½ beat (at 120 BPM: 125–250 ms). A whole beat or more only in slow, dramatic moments. A gap after a
  high-pass build already *feels* longer, because the low end has been gone for a while.
- **Usually not digital zero.** Cut the drums and bass, but let something carry through: the pad thinned out
  (high-pass ~700 Hz, −12 dB), the reverb tail of the last note, or a reverse swell / riser rising into the hit.
- **A longer near-silence needs a reason on screen.** A second or two of almost nothing can be the strongest
  moment in a music-led piece, when the picture pauses with it (a held frame, a beat before the next result), one
  small sound keeps it alive, and the groove comes back on a bar line together with the next picture change.
  Without that reason, complete silence sounds like a dropout or a buffering player, especially on phones. Mark
  the silences you mean in the plan's `gaps` so the report does not warn.
- **Cut on the grid.** Start the gap on a beat subdivision and land the hit exactly on the downbeat.
- **Picture holds its breath too.** Keep motion alive through the gap (a line still drawing, a slow push-in, an
  anticipation squash) rather than an empty frame; the gap is felt together with the picture.

```json
"drums/bass gain": [[13.70, 0], [13.75, -120, "hold"], [14.0, 0]],
"pad": { "highpass": [[13.7, 10], [13.75, 700, "hold"], [14.0, 10]], "gain": [[13.7, 0], [13.75, -12, "hold"], [14.0, 0]] },
"hit": { "sound": "thock_01", "at": 14.0, "swell": 0.25 }
```
(gain steps are smoothed over ~3 ms by the renderer, so they do not click)

Rule: one real gap per 30–60 s. More and it stops being a surprise. A break is also where a music edit hides:
the song can be cut or re-entered there and nobody hears the join.

## Swells, risers, downlifters

- **Reverse-reverb swell** (`"swell": 0.5` on a clip): the hit's own reverb, reversed, rising into it. Feels like
  a breath in. 0.3–0.8 s, or exactly one beat. Best on the first hit after a gap.
- **Riser**: a sound that climbs in pitch/brightness into a moment. Combine a high-pass sweep with rising gain
  on a noise/pad clip. End it on the downbeat, never after it.
- **Downlifter / tail**: after a big hit, something that falls away (low-pass closing, pitch falling, reverb
  tail) so the next section starts clean.

## Hits and impacts

Build impacts from parts that fuse into one: **transient** (click, knock, 0–20 ms) + **body** (thock, 50–300 Hz,
50–200 ms) + optional **tail** (reverb, sub drop). For "premium/ASMR" the transient is soft and close, the
body warm (200–500 Hz) and there is little 3–6 kHz harshness. Place on the contact frame or one frame late.

### Layering by frequency (weight and size)

One sound rarely carries a big moment; a deeper version of it still sounds thin. Stack layers that each own a
different band, like layers of a cake, and they read as one large event:

| Layer | Band | Gives |
|---|---|---|
| Low | 40–150 Hz (sub, boom, low rumble) | weight, size; felt more than heard |
| Body | 150 Hz–2 kHz (the swish, the thud, the material) | what the thing is |
| Top | 3–12 kHz (air, sparkle, crackle) | speed, detail, closeness |

- Line the layers up on the same peak frame (the contact, or the fastest point of a whoosh).
- Filter each into its band (low-pass the low layer, high-pass the top) so they do not pile up in the mids; each
  can then be quieter than one sound would need to be.
- Scale the stack to the motion: a small move gets one layer, a big dramatic one gets all three.
- Keep the layers from one world (same material language, same space), or the stack sounds assembled.
- Phones barely play below ~100 Hz, so the body layer has to carry the hit on its own there.

## Ducking (sidechain)

- Under voice: `"duck": { "under": "voice", "amount": -12, "attack": 0.06, "release": 0.45, "hold": 0.3 }`.
  −10 to −15 dB for music, −6 to −10 for ambience.
- Groove pump (subtle energy): duck a pad or bass stem under the kick (a drums stem, low-passed at ~150 Hz,
  marked `"keyOnly": true` if it should not be heard), `amount` −3 to −6, release ~one
  eighth note (`60 / BPM / 2`). Gives the "breathing" feel of modern electronic edits without more volume.
- Under a key SFX: duck music −3 to −6 dB for the length of a reveal hit so it cuts through without being loud.
- **Voice pocket (band ducking).** Instead of turning the whole song down under a voice, dip only the band the voice
  needs and leave the rest full: `"duck": { "under": "voice", "amount": -6, "band": [1000, 4000] }`. The music keeps
  its low end and air, the voice sits in the hole, and the mix sounds fuller than a broadband duck. −4 to −9 dB in
  the band is a starting point; high-pass the voice at 80–100 Hz so it does not fight the bass. If the music still
  crowds the words, lower the music track a few dB as well.

## Reverb and space

Dry and close = intimate, premium, "in your hands" (product, UI, ASMR, keyboards). Big reverb = scale, epic,
memory. Pick one space for the whole palette. Use `reverb: { "mix": 0.1–0.3, "size": 0.4–0.85 }` on a track,
more on accents and endings, none on fast typing.

**Reverb throw.** To end music that has no ending of its own: cut the dry music just before the next beat, and give
the last hit its own track with a large hall (`"reverb": { "mix": 0.5, "size": 0.9 }`) so it rings out after the cut.
The song then sounds like it chose to stop. Recipe in music.md, "Getting into and out of a song".

## Stutter, tape stop, filter "bump" (use rarely)

- Stutter: repeat a 1/16-note slice of the music 2–4 times before a cut (several clips of the same
  `from`/`length`).
- Tape stop / slow-down: `semitones` going down on a short final clip, combined with a low-pass closing.
- These are seasoning for energetic social edits. In calm or premium pieces, skip them.
