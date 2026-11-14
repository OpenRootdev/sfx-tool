# Finished videos and reference videos

Two situations where you do not make the picture: the cut is already locked and only the sound should get better,
or the user shares a video whose sound they like and wants that quality in theirs. In both, start by measuring the
video, then look at it.

## Measure and look

```
sfx-tool spot video.mp4 --sheet sheet.png --events-out events.json --report spot.json
```

It needs ffmpeg and ffprobe. It reports:

| Part | What it finds |
|---|---|
| Picture | **cuts** (most of the frame changes in one frame), **pops** (part of the frame changes in one frame: a card, an image or a word appears or swaps), **moves** (motion peaks that stand out from the motion around them), **holds** (the picture rests for 0.5 s or more), motion per second |
| Sound already there | loudness, energy by band, **breaks** (15 dB or more under the usual level), where the **low end comes in**, tempo, key, the groove on a 16-step grid, how much the harmony repeats, and any place the beat grid shifts (a music edit) |
| Together | how often cuts, pops and moves land on a beat, an 8th or a 16th compared with chance, and which picture event and bar line sits nearest each break and entry |

Then open `sheet.png` (one frame every second or two, with times) and look. The numbers find candidates; what they
are is your call. Limits: the picture is read from a small grey copy, so a change only in colour, or in a very small
element (a cursor, small text), can be missed, and a crossfade shows up as a move rather than a cut. These limits
matter for videos without source; when you made the video, its code has every moment exactly (next section). Tempo can read
at half or double speed, and relative major and minor keys share their notes.

## When the picture is finished

The picture cannot move, so everything fits around it.

**If you made the video, read its source first.** A HyperFrames, Remotion or raea project already holds every cut,
entrance and keyframe to the frame, small ones included (a cursor blink, a colour change, one word appearing). Take
the moments from the composition's timeline or code: they are exact where `spot` estimates. Use `spot` there only
for what code can't tell you (how busy the picture feels, how existing audio behaves). For videos without source
(the user's own edit, a screen recording, a reference), `spot` is the way in.

1. **Decide what stays.** A voice or dialogue stays and becomes the anchor: everything else makes room for it (a
   voice pocket, `duck.band`). Production sound can stay under new sounds. Put the video's own audio in the plan as
   a `file` clip (`mix` reads video files) on its own track, so you can duck, filter or replace it. If the user
   wants new music, check that the music they have in mind is licensed for the use.
2. **Read the structure from the picture.** Sections run between the big changes; holds are where a breath, a
   ring-out or an end card can go. Mark the 3–6 moments that matter (the first result, a reveal, the turn in the
   story, the end) and which are setups and which are payoffs.
3. **Fit the music to the picture.** Choose a tempo that suits the pace (when big changes come every ~2 s, a bar at
   120 BPM is 2 s). Then slide the song: choose the `from` offset that puts the most structural moments on bar
   lines, cut whole bars to fit, and back-time the song's ending to the last frame. A break in the music can sit on a
   hold in the picture, and that break is also where a music edit hides.

   ```js
   // the music offset (seconds into the song) that lands the most moments within 40 ms of a bar line
   const bars = beats.filter((_, i) => i % 4 === downbeatIndex);   // beats from analyse --beats-out
   const moments = [2.8, 18.0, 31.0];                              // your structural moments, from events.json
   let best = { off: 0, n: -1 };
   for (let off = 0; off < 60; off += 0.005) {
     const n = moments.filter((m) => bars.some((b) => Math.abs(b - off - m) < 0.04)).length;
     if (n > best.n) best = { off, n };
   }
   ```
4. **Spot the sounds from the events.** `events.json` lists candidates, not instructions; most need nothing. Cuts
   and pops are candidates for hits on their frame, moves for whooshes peaking at that time (the fastest point),
   holds for space. Pick the few that carry the story, then give them sounds from one palette
   (creative-matching.md).
5. **Mix and deliver** as usual: plan, `sfx-tool mix`, mux, check loudness (workflow.md). The report warns about
   silence; list breaks you mean in `gaps`.

## Learning from a reference video

- **Get the file with permission.** Ask before downloading; keep it in a scratch folder outside the project; don't
  redistribute it, and don't reuse its music or recordings in the user's video.
- **Spot it**, then turn the numbers into craft in words:

| What spot reports | What it tells you |
|---|---|
| tempo, key, bar-to-bar harmony | the pace, and whether the bed is a loop over one chord (a hook) or moves through changes |
| energy by band | where the weight sits: a sub-heavy groove, a bright top, a mid-range bed |
| groove: hits on a 16th, hits per bar, empty steps | how tight and busy it is, and where it breathes |
| breaks, and the picture event nearest each | the held breaths, and whether the picture explains them |
| where the low end comes in | the payoffs, and which picture moments they belong to |
| picture events on the grid vs chance | whether the edit was cut to the beat or moves freely over it |
| grid shifts | where the music was edited |

- **Design your own from the traits.** Same principles, your own riff, sounds and arrangement, chosen for the
  user's video and brand. Tell the user what was measured and what is your reading of it.

## Worked example: a 35-second product showcase

Measured with `spot` on a music-led showcase with no voice:

- **Picture.** A prompt is typed (0–2.7 s), then generated images arrive one after another: cards sliding in,
  carousel steps, a few full-frame changes. In the middle the picture holds for about 1.7 s while a second prompt is
  typed, and it ends on about five seconds of still title and logo cards.
- **Bed.** About 110 BPM; harmony that does not change from bar to bar (similarity 0.99); 42 % of the energy below
  80 Hz and about 70 % below 250 Hz; nearly 90 % of hits on a 16th-note grid.
- **The arrangement follows the story.** Typing over a thin bed with no bass; the bass enters within 40 ms of the
  first image. While the second prompt is typed, the bed drops to near silence for about 1.2 s with one hit inside
  it; the groove returns on a bar line together with that prompt's result. The bed rides under the rest and rings
  out over the end cards.
- **Picture vs grid.** The many cards and moves landed on beats no more often than chance would; the two structural
  moments (the first result, the second result after the break) were on bar lines.
- **The edit hides in the break.** After the silence the groove sits a 16th note off the old grid, so the music was
  probably cut there, and nobody hears it.

What carries over to other videos is the method, not the style: a repeating hook over one chord can carry a fast
montage without beat-locked animation; the arrangement grows from setup to payoff; one short silence that the
picture explains can be the strongest moment; and a break is a good place to edit music.
