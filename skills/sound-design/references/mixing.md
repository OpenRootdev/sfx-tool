# Mixing: levels, space and the final check

## Targets

| Destination | Integrated loudness | True peak |
|---|---|---|
| YouTube, Instagram, TikTok, X, LinkedIn, web | −14 LUFS (platforms turn louder mixes down) | ≤ −1 dBTP |
| Podcasts / voice-led | −16 LUFS | ≤ −1 dBTP |
| Broadcast TV (EBU R128 / ATSC A/85) | −23 LUFS / −24 LKFS | ≤ −1 / −2 dBTP |
| Background loop on a website | −20 to −24 LUFS | ≤ −1 dBTP |

Set them with `"master": { "lufs": -14, "ceiling": -1 }`. Verify with
`ffmpeg -i mix.wav -af ebur128=peak=true -f null -`.

## Relative levels (starting points, by ear later)

Measure each track's loudness in the report and aim for:

| Track | Relative to voice (or to the music when there is no voice) |
|---|---|
| Voice-over / dialogue | the anchor |
| Music under voice | −12 to −20 LU (duck −10 to −15 dB while speaking) |
| Music with no voice | anchor itself |
| Key hits / reveals | peak briefly near the music's level, never far above |
| UI, typing, small foley | −10 to −16 LU below the music; felt more than heard |
| Ambience / room tone | −20 to −30 LU; just enough that silence never feels like a dropout |

Typing tracks from sfx-tool are rendered at −30 LUFS on purpose; in a −14 LUFS mix they sit well with
`"gain": 0` to `+6`.

## Frequency slots

Give each element its own band so they do not mask each other:

| Element | Lives in | Keep out of it |
|---|---|---|
| Voice | 150 Hz–5 kHz, intelligibility 1–4 kHz | high-pass at 80–100 Hz |
| Music (under voice) | everything, but dip 1–4 kHz (a voice pocket: `duck.band`) or high-pass 120–200 Hz while voice talks | — |
| Thocks, knocks, warm UI | 150–600 Hz body, soft top | low-pass 4–8 kHz for "soft" |
| Clicks, ticks, sparkle | 2–8 kHz, very short | keep level low; this band is where ears are most sensitive |
| Sub hits | 40–80 Hz | use sparingly; phones cannot play it, so also give the hit a 100–200 Hz body |

## Space and width

Keep low end and voice centred. Spread small SFX a little (sfx-tool tracks already do ±20 %). One reverb space for
the palette. Dry = close and premium; wet = big and distant.

## Report warnings and how to fix them

| Warning | Fix |
|---|---|
| music within 8 LU of voice | carve a voice pocket (`duck.band: [1000, 4000]`), a deeper `duck.amount`, a high-pass on the music while the voice talks, or lower the music track |
| the mix is silent for … s | if the silence is meant (a break the picture explains), list it in the plan's `gaps`; if not, keep a tail, a thinned pad or a swell carrying through |
| more than 3 foreground sounds overlap | drop the least important, or move it to the next beat |
| limiter working hard (> 6 dB) | lower the loudest track (often a hit or the music drop) instead of relying on the limiter |
| loudness misses the target | peaks too high relative to average: tame the loudest hits, or accept a quieter target for very dynamic pieces |

## Final listen list for the user

Give 3–5 timestamps: the first second (does it hook?), the first voice line (clear?), the build and drop/reveal
(does the gap land?), one dense moment (crowded?), the ending (does it ring out cleanly?). Recommend checking once
on headphones and once on a phone speaker: if the hits disappear on the phone, they need more 100–300 Hz body.
