# Creative matching: sound that belongs to the picture

You are not a mixing engineer who receives a finished picture. You are the creative agent making the video, so
picture and sound are one design. Every key creative element on screen should have a sonic counterpart that
feels inevitable, as if the object could only make that sound. When it works, viewers stop noticing "the music"
and "the effects" and just feel the idea.

## 1. Find the key elements, then give each a sound

Before choosing any music, list what the video is made of (from the brief, storyboard or script):

| Element | Ask | Example → sonic counterpart |
|---|---|---|
| **Hero object / subject** | What is it made of? How heavy is it? Where does it live? | a glass app icon → glass taps, airy pad; a wooden toy → marimba + wood knocks |
| **Materials and textures** | Paper, metal, glass, fabric, liquid, light, code? | paper cards → paper flicks and soft felt; neon → electric hum and buzz |
| **Colour and light** | Bright or dark? Warm or cold? Saturated or muted? | bright, saturated → high register, major, short attacks; dark, muted → low register, low-passed, minor, long tails |
| **Shape language** | Rounded or angular? Soft or sharp corners? | rounded, bouncy UI → sine plucks, bubble pops; sharp grid, hard cuts → clicks, ticks, gated hits |
| **Motion verbs** | Does it drop, slide, snap, unfold, grow, spin, breathe? | snap → short transient; slide → filtered whoosh with the same easing; unfold → paper rustle that lasts as long as the unfold |
| **Scale and space** | Close-up or wide? Tiny or monumental? Inside or outside? | macro close-up → dry, close, ASMR detail; wide/epic → reverb, sub, slow attacks |
| **Pace and rhythm** | How fast do things change? Is there a repeating pattern (a grid, a list, a loop)? | a list of 4 items → 4 hits in a rising pattern; a fast montage → cuts on every beat |
| **The idea / message** | What should the viewer believe at the end? | "effortless" → nothing strains, no big risers; "powerful" → weight, sub, a real drop |

Write it as a short **sound map** next to the cue sheet:

```
hero: keycap (plastic, rounded, heavy-ish, close)  → thock family, tuned to the tonic
cards: paper-thin panels sliding in                 → soft felt taps on the beat, pitched up a fifth per card
line/graph growing                                  → high-pass rising with it, ends on the downbeat
brand colour: muted green                           → warm, low-passed music, no bright hats
idea: "sound makes video feel finished"             → before: flat and crowded; after: space, then one big release
```

## 2. Match the motion, not just the moment

Sound has a shape over time; give it the same shape as the motion it belongs to.

- **Easing = envelope.** An ease-out landing (fast then settling) gets a sharp attack and a short decay; an
  ease-in departure gets a sound that swells into the exit. A spring overshoot gets a tiny second tick at the
  bounce frame.
- **Duration matches.** A 0.6 s unfold gets ~0.6 s of rustle, not a 0.1 s click. A held pose holds the sound
  (a sustained pad note, a room tone) or lets it ring out.
- **Speed = pitch and brightness.** Faster motion → higher, brighter, shorter. A whoosh peaks at the fastest frame,
  not at the start or end of the move. Things that slow down can pitch down (tape-stop, varispeed).
- **Size = pitch and weight.** Big objects are lower and longer, small ones higher and drier. When an object grows
  on screen, let its sound deepen or open a filter as it grows.
- **Distance = level, filter and reverb.** Far away: quieter, low-passed, wetter. Pushing in: louder, brighter,
  drier. A camera dolly-in is a filter opening.
- **Direction = pan and pitch.** Left-to-right moves pan left-to-right (gently, ±0.3). Up moves can rise in pitch,
  falling moves fall.
- **Count = pattern.** Repeated elements (three cards, five list items) get a related sound each time, varied in a
  musical way: step up the chord (tonic → third → fifth → octave) so the sequence feels like it is going somewhere.

## 3. Leitmotif: one sound that *is* the brand or the hero

Give the hero element one signature sound (a chime in the key, a specific thock, a two-note motif) and use it
only when that element appears or does its thing. By the end the viewer links the sound to the thing. Vary it
with the story: muted/low-passed when the hero is hidden or early, full and bright at the reveal, the resolved
version (tonic, long tail) at the end card.

## 4. Transformations: when the picture changes state, the sound changes the same way

- Blur → sharp: low-pass opening. Dark → light: minor → major voicing, or low-pass → open.
- Chaos → order: busy, random-timed sounds that lock to the beat grid as the layout snaps into place.
- Analogue → digital (paper becomes UI): paper foley crossfades into clean blips at the same rhythm.
- Before → after: the "before" state can use a deliberately worse version of the same palette, so the change is
  audible as well as visible.

## 5. Let sound change the picture too

Because you make both, the music can shape the animation, not only the other way round:

- If the groove swings, let elements land with a little swing (a 1–2 frame late landing on off-beats).
- If the track has a gap before the drop, design a held pose or a slow push-in for those frames.
- If a melody note rises, an element can rise with it. If the bass hits, the frame can flex (scale 1.01–1.03).
- Animate visualisers, glows and pulses from the real mix (`sfx-tool analyse` energy, or the beat grid), so the
  picture literally moves with the sound.

## 6. The arrangement tells the story

When a video shows cause and effect (a prompt and its result, a problem and its fix, a click and what it opens),
the music can follow it without a word: thin while the cause plays out (a light top line, no bass), full when the
effect arrives (the low end and the full groove enter with it). Viewers feel the payoff because the sound fills up
at the moment the picture delivers. Measured in a music-led product showcase: the prompt was typed over a thin
bed with no bass, the bass came in within 40 ms of the first result appearing, and when a second prompt was typed
the bed dropped almost to silence for about a second, then came back with its result.

Ask of each section: is this a setup or a payoff? Setups get less, payoffs get more. Keep the change on a bar line.

## 7. Counterpoint (use rarely, on purpose)

Sometimes the strongest choice contradicts the picture: silence over a huge explosion, a tiny music-box tune over
something enormous, a calm pad under chaos. It works only as a single deliberate moment with a reason (irony,
shock, emotion). Say why in the cue sheet.

**Swapping literal sounds for a metaphor.** A quieter form of counterpoint scores how something *feels* rather than
what it *is*. A film that compares an everyday task to a bigger idea can replace each literal sound with one from
the idea's world: in a film about making coffee as a picture of the creative process, grinding becomes cracking
ice and a pour becomes a wave. To make it work:
- Pick one family for the swaps (nature, machines, an orchestra) and stay in it: that is what makes it read as a
  choice and not a mistake.
- Keep the literal action's timing and envelope (the crack lands where the grinder bites, the wave lasts as long as
  the pour). Sync is what lets the viewer accept the new sound.
- Use it where the message matters more than information. In demos and tutorials the literal sound *is* the
  information, so keep it.

## 8. Check the match

For each key element in the sound map, answer: if the viewer heard this sound with their eyes closed, would they
guess the material, size and motion? If not, change the sound (or the picture). Then give the user the listen
list with what each sound is meant to say, so they can judge the taste, not only the timing.
