# Workflow: from brief to finished mix

## Audio first or picture first?

| Situation | Order |
|---|---|
| Motion graphics, launch film, montage, social clip, anything "cut to music" | **Music first**: analyse it, build the picture on its beat grid, then spot SFX |
| Voice-over explainer | **Voice first** (record or generate VO), then picture to the voice, then music under it, SFX last |
| Footage-led (interview, vlog, tutorial screen recording) | **Picture first**, then music chosen to fit the cut, SFX last |
| UI demo / product walkthrough | Picture first; music optional; UI sounds (sfx-tool) spotted to the clicks |
| A finished video you are only scoring | **Picture fixed**: `sfx-tool spot` it, fit music and SFX around it (finished-video.md) |

When an agent makes both picture and sound, music first usually gives the strongest result: motion that lands on
the beat feels intentional for free. Picture first gives more control over the story. Either way, **SFX are
always placed last, on the final picture**, because any re-time breaks their sync.

## The sound map, then the cue sheet

First the sound map (see creative-matching.md): each key creative element and the sound that belongs to it,
plus the hero's signature sound. The cue sheet then draws on those sounds; a new sound for each moment breaks the sense of one world.

## The cue sheet (spotting)

Write it before placing sounds. One row per moment that matters; most of the video has no row.

| Time / frame | On screen | Feeling wanted | Move | Sound |
|---|---|---|---|---|
| 0:00 / 0f | black → logo fades in | curiosity | music low-passed 380 Hz, opens over 2 bars | music |
| 0:03.9 / 117f | title lands | arrival | filter fully open on downbeat; soft thock + swell | thock_01 + swell 0.5 |
| 0:08 / 240f | VO starts | clarity | duck music −12 | — |
| 0:21.5 / 645f | last line before reveal | held breath | high-pass rises 2 bars; ½-beat silence | — |
| 0:22 / 660f | product reveal | release | all stems back on downbeat; layered hit | knock + sub |
| 0:30 / 900f | end card | resolution | chime on tonic, music last downbeat rings out | chime in key |

Then translate the sheet into a plan (plan-format.md). Keep the sheet; it is how you explain the design to the user.

## Building the picture on the grid

- From `analyse`: `framesPerBeat` and `firstBeat`. Scene lengths in whole bars (4 × framesPerBeat).
- Lock the structural moments to bar lines: the first result or reveal, the return after a break, a scene change
  that starts a new section, the ending.
- Inside a section, motion does not need to hit beats. Over a steady groove, freely timed moves feel natural; a
  measured music-led showcase had its picture moves land on beats no more often than chance, yet felt in sync
  because its few big moments were on bar lines.
- In HyperFrames/Remotion, compute frames from the beats file rather than typing numbers by hand.

## Placing SFX on picture

- Find the frame where the motion's contact/arrival happens (look at frames, not at the keyframe list: easing
  moves the visual contact).
- Whoosh: starts 6–12 frames before the motion's fastest point, peaks there. Hit: on the contact frame (+0–1).
- Typing: generate events from the actual text reveal timing (`typing` clip, or `sfx-tool track --times`).
- After placing, list every SFX with its frame and check density: 1–2 foreground sounds per moment.

## Rendering and delivery

1. `sfx-tool mix plan.json -o mix.wav --stems-out stems/ --report report.json`
2. Fix warnings, re-render.
3. Mux: `ffmpeg -i video.mp4 -i mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest out.mp4`
4. Verify: `ffmpeg -i out.mp4 -af ebur128=peak=true -f null -` (loudness and true peak after AAC encoding).
5. Hand over: the video, the stems (for anyone re-editing), the cue sheet and the listen list.

## Working with the user

Taste decisions are theirs: the music direction, how busy the beat is, how much SFX. Offer two clear options
(for example "minimal: 4 hits + music" vs "rich: UI sounds on every interaction") with the cue sheet for each,
and render the one they pick. When they say "more punch" or "softer", map it to a concrete move: punch = more
100–300 Hz body and a short gap before; softer = low-pass 4–6 kHz, slower attacks, −3 dB.
