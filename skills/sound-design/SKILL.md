---
name: sound-design
description: Sound design and music for videos made by creative agents - what makes a video sound professional, and how to get there in launch films, explainers, tutorials, demos, social clips, showcases, trailers, 3D and motion graphics. Covers matching sound to the picture, choosing and cutting music, hooks, silence and contrast, filter sweeps, risers, hits, layering, ducking and voice pockets, keeping SFX in the music's key and tempo, stems and loudness. Includes a plan-to-mix renderer (sfx-tool mix), a music analyser (sfx-tool analyse) and a video spotter (sfx-tool spot) for scoring a finished video or learning from a reference video. Use whenever a video (HyperFrames, Remotion, ffmpeg, any editor) needs music, sound effects or a final mix, when a finished video needs better sound, when audio feels flat, crowded or cheap, or when the user asks for sound design, a soundtrack, SFX timing or "make it feel professional", even if they don't say "sound design".
---

# Sound design for agent-made video

Sound is the other half of a video. Picture tells people what is happening; sound tells them how to feel about it,
where to look and whether to keep watching. People rarely notice good sound, but they notice right away when it is
missing or cheap.

This skill describes **what professional sound has** and **the techniques that get you there**, with when each one
helps and when it gets in the way. None of the techniques is required. A quiet tutorial and a loud launch film share
the same qualities but use almost none of the same moves. Decide from the video in front of you, and be able to say
why each sound is there.

You are usually the creative agent making the whole video, so picture and sound can be designed together: the
music can shape the animation as much as the animation shapes the sound. When the picture is already finished (the
user's own edit, a screen recording, a render you cannot change), the sound fits around it instead:
[references/finished-video.md](references/finished-video.md).

You cannot hear. You can measure, plan precisely and tell the user exactly where to listen. Say "measured", not
"sounds great", and give timestamps for the moments that need a human ear.

## What professional sound has

These hold across genres. Use them to judge your own mix.

1. **Intention.** Every sound is there for a reason the viewer would feel: to make a moment land, to set a place, to
   carry a transition, to add weight. A sound with no reason is noise, however nice it is.
2. **Contrast over time.** Loud means something only after quiet; full only after thin. Amateur mixes sit at one
   level from start to end. Professional ones have a shape: an opening, tension, a release, an ending. The shape can
   follow the story's cause and effect: thin while something is set up or asked for, full when the result arrives.
   Short held breaths before big moments are one of the strongest tools there is (the brain expects a beat, and the
   hit that follows resolves it).
3. **Clarity.** People can follow about two separate sound streams at once (Walter Murch's "two and a half"). The
   most important thing at each moment (usually a voice, otherwise the hero moment) must be clearly audible, and
   everything else makes room for it.
4. **Coherence.** The sounds come from one world: the same space (all close and dry, or all big and roomy), the same
   material language, and a small set of sounds reused and varied rather than a new library sound for each moment.
   Mismatched sounds are what make a video feel assembled rather than designed.
5. **Belonging to the picture.** A sound tells the viewer what a thing is made of, how big it is and how it moves:
   glass sounds glassy, big things are low and long, fast things are bright and short, and a sound lasts as long as
   the motion it scores. When the brand or hero has a signature sound, its return pays off.
6. **Musicality.** When there is music, sound effects agree with it: hits on the beat grid (or deliberately off it),
   tonal sounds in the music's key, cuts on bar lines, an ending that lands on a downbeat and rings out.
7. **Clean delivery.** The right loudness for the platform, no clipping, no clicks, no accidental silence, nothing
   chopped mid-phrase.

## Facts and taste

Keep these two apart. Facts are worth following every time; taste depends on the video.

**Facts** (measurable, and breaking them sounds broken):
- Online platforms normalise to about −14 LUFS integrated; keep true peak at or below −1 dBTP. Broadcast uses
  −23 LUFS (EBU R128). [references/mixing.md](references/mixing.md)
- Sound early by more than ~45 ms looks wrong; up to ~100 ms late is tolerated. Put hits on the contact frame or
  one frame late.
- Speech must stay intelligible; anything competing with it in 2–4 kHz, or within ~10 dB of it, hurts.
- Music needs a licence that covers the use.

**Taste** (every number in the references is a starting point): the genre, the palette, how many sounds, how
much reverb, how deep a filter sweep goes, whether there is music at all. Derive these from the brief, brand and
audience each time. Don't carry a favourite style from one video into the next.

Silence is taste too, with conditions. A near-silence in the middle of a video works when the picture explains it (a
held frame, a pause before a reveal, a question before its answer), when it is short (around a second or two), and
when it ends on the beat with something that lands. Silence nobody chose reads as a broken player. List the ones you
mean in the plan's `gaps` so the mix report knows.

## What usually matters, by kind of video

| Video | Usually matters most | Usually leave out |
|---|---|---|
| Tutorial, talking head, narration | voice clarity, music ducked low and steady, a few soft UI sounds | big hits, risers, sweeps under speech |
| Calm explainer, brand story | one warm palette, music with space in it, gentle transitions, a clear ending | hard impacts, busy drums |
| Product launch, feature film | music-first edit, a build and a release, a signature sound for the product, a confident ending | sounds on every cut, wall-to-wall energy |
| UI or product demo | small, tight interface sounds matched to each interaction, quiet bed | cinematic whooshes, sound on every pixel moving |
| Showcase, product reel, motion graphics (music-led, no voice) | a hook that repeats and sticks, a tempo that suits the pace of the picture, the arrangement following the story (thin while setting up, full on the results), one or two breaks the picture explains | a sound on every visual move, a busy melody fighting the picture |
| Social short (5–30 s) | an immediate hook in the first second, tight sync to the beat, a loop-friendly or punchy end | long intros, slow builds |
| Trailer, game, 3D or motion piece | world-building ambience, a strong dynamic arc, silence before the reveal, physical weight | constant layering that flattens the arc |
| Data or chart video | sounds that track the data (rising pitch with a rising line), restraint | sounds that compete with the numbers |

Many videos sit between rows; take what fits. Some need no sound effects at all, only music shaped well.

## The toolbox

What each move does to the viewer, so you can decide whether you need it. Numbers and recipes are in
[references/filters-and-moves.md](references/filters-and-moves.md).

| Move | What it does | Helps when | Gets in the way when |
|---|---|---|---|
| Low-pass on the music | distance, "behind glass", anticipation | intros, flashbacks, a subject not yet arrived | the music needs to be clear |
| Rising high-pass | thins the music, builds tension | the bars before a drop or reveal | there is no release after it |
| A short gap (held breath) | makes the next hit land | right before the biggest moment, once or twice, when the picture explains it | used often, or nothing on screen gives a reason |
| Riser, swell, reverse | pulls the viewer into a moment | leading into a cut or reveal, ending exactly on it | it ends early or late, or every transition has one |
| Hit, sub, impact | weight and finality | the reveal, the logo, the last frame | everything is an impact |
| Layering by frequency | one event that sounds big: a low layer for weight, a body, a bright top for detail | big moves, reveals, a logo landing | small UI moments, or every sound is huge |
| Ducking | makes room for what matters | under voice, under a hero sound | it pumps audibly with no reason |
| Voice pocket (band ducking) | the music dips only where the voice lives (about 1–4 kHz) and stays full around it | narration over full music | no voice, or the music is already sparse |
| Arrangement as story | the music thins and fills with cause and effect | a setup and its payoff, an input and its result | a calm piece that wants one steady bed |
| A hook (a short riff that repeats) | makes a piece memorable and lets the picture move freely over a steady groove | showcases, motion graphics, social | under narration, or in calm and serious pieces |
| Getting into and out of a song | no jolt where music starts, ends or changes | starts, endings, a second song, the return after a break | (rarely) |
| A metaphor sound in place of the literal one | says how something feels rather than what it is | a story with a message, a mood piece | demos and tutorials, where the literal sound is information |
| Reverb and space | puts everything in one place | glueing a palette, ending tails | it blurs fast sounds or speech |
| Signature sound (leitmotif) | identity, payoff | a brand or hero that returns | there is nothing to return to |
| Foley, UI and typing sounds | makes on-screen actions physical | interactions, typing, objects touching | they cover the music or the voice |
| Stems | use only the parts of a song you need | under voice, intros, endings | (rarely) |

How to match sounds to what is on screen (material, size, colour, motion, transformations, counterpoint):
[references/creative-matching.md](references/creative-matching.md). Choosing, cutting and keying music:
[references/music.md](references/music.md).

## A way of working

This order works well; change it when the video calls for it. Details: [references/workflow.md](references/workflow.md).

1. **Sonic identity.** One line from this brief: palette, music direction, tempo and key, e.g. "warm felt piano and
   paper foley, 84 BPM, D major" for a calm explainer. Then a **sound map**: the video's key elements and the sound
   each one gets.
2. **Music first or picture first.** Edits cut to music (launches, montages, social) work best with the track
   chosen first: `sfx-tool analyse music.mp3 --fps 30 --beats-out beats.json` gives tempo, beat grid and key to
   time the picture to. When a voice or footage sets the timing, lock that first and fit the music to it. When the
   picture is finished, take its moments from its source if you made it (exact, small changes included); without
   source, `sfx-tool spot video.mp4` lists its cuts, moves and holds to score against. Lock the few
   structural moments (the first result, the return after a break, the ending) to bar lines; the rest of the motion
   can move freely over the groove.
3. **Spot it.** A cue sheet: each moment, what the viewer should feel, and the move (if any) that does it. Most
   moments need nothing; usually 3–6 matter.
4. **Place sounds on the final picture**, shaped like the motion they belong to, then write the plan and render:
   `sfx-tool mix plan.json -o mix.wav --report report.json` ([references/plan-format.md](references/plan-format.md)).
5. **Measure, mux and hand over** with a listen list: 3–5 timestamps and what to listen for.

## Tools

[sfx-tool](https://github.com/OpenRootdev/sfx-tool) (Node 18+, no other dependencies): `npx github:OpenRootdev/sfx-tool <command>`,
or `node bin/sfx-tool.js <command>` in a clone. Any other DAW, library or tool works with the same ideas.

| Need | Use |
|---|---|
| Tempo, beat grid, key, notes for SFX, energy per second | `sfx-tool analyse <music>` (estimates: half/double tempo is possible; relative major/minor share notes) |
| Small tuned SFX: taps, thocks, knocks, pops, chimes | `sfx-tool new` / Studio (`sfx-tool studio --open`); the `sfx-tool` skill |
| Typing / text-appear tracks | `typing` clips in the plan, or `sfx-tool track` |
| A finished or reference video: cuts, moves, holds; its soundtrack's bands, breaks, tempo, groove; how they line up. A song or soundtrack alone: its sections against bar lines | `sfx-tool spot video.mp4 --sheet sheet.png --events-out events.json`, or `sfx-tool spot song.mp3` (needs ffmpeg) |
| Mix: clips, automation, filters, ducking and voice pockets, reverb, swells, loudness | `sfx-tool mix plan.json -o mix.wav` |
| Stems (drums, bass, vocals, other) from any song | Demucs, local and free: `python -m demucs -n htdemucs song.mp3` |
| Music bed when none is supplied | a licensed library track, the user's own, or local generation (MusicGen); check the licence |
| Mux and final loudness check | `ffmpeg -i video.mp4 -i mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k out.mp4`; `-af ebur128=peak=true -f null -` |

## Before you hand it over

Ask yourself:
- Can I say why each sound is there? Does anything play just because it could?
- Does the soundtrack have a shape: an opening, a peak, an ending that resolves?
- At every moment, is the most important thing clearly audible?
- Do the sounds come from one world, and does each fit what it scores?
- If there is music, are hits on its grid and tonal sounds in its key?
- Facts: loudness within 1 LU of the target, true peak ≤ −1 dBTP, no silence nobody chose (intended ones listed in
  `gaps`), report warnings fixed or explained, voice never masked.
- The listen list for the user, and which calls are taste they should judge (is the beat too busy, does the palette
  fit the brand).
