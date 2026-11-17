# BabaUke

**Play ukulele for your baby.** أغاني يوكليلي لحبيب بابا

BabaUke is a small web app for parents who are learning ukulele. Pick a kids' song in Arabic or English, and the app plays it while the chords and the words light up in time, so you can strum and sing along.

It was made by a dad for his son Zain. It is free and open source.

## What it does

- **Play-along songs.** The app strums the ukulele part and plays the tune. Each word is highlighted as it is sung, in the colour of the chord you should be holding.
- **Arabic and English.** Arabic songs read right to left, with whole words highlighted so the letters stay joined. The Arabic songs are in Egyptian dialect.
- **Chords you can read at a glance.** Every chord has its own colour. You see the fingering for the chord you are on, the one coming next, and a bar that shows how long until the change.
- **Strumming pattern.** One bar of arrows (or string names for fingerpicking) that lights up on the beat.
- **Practice tools.** Slow a song down to half speed, repeat one part, turn on a click or a count-in, or mute the ukulele so yours is the only one playing.
- **Day songs and night songs.** Lullabies open on dark paper so the screen stays gentle in a dim room. You can switch any song to dark paper yourself.
- **The whole song at a glance.** Each song is drawn as a strip of chord colours, so you can see how many chords it has and how often they change. The same strip is the seek bar.
- **Chord sheet.** Every chord used in the songs, with fingering. Tap one to hear it.
- **Tuner.** Tune to G, C, E, A with your microphone, or by ear with reference notes. Audio never leaves your device.

## Run it

You need [Node.js](https://nodejs.org) 20 or newer and [pnpm](https://pnpm.io).

```bash
pnpm install
```

```bash
pnpm dev
```

Then open http://localhost:3000.

Other commands:

| Command | What it does |
| --- | --- |
| `pnpm validate` | Checks every song: beats add up, chords exist, notes parse |
| `pnpm lint` | Lints the code |
| `pnpm build` | Production build |

To deploy, import the repository into [Netlify](https://www.netlify.com) or [Vercel](https://vercel.com). Both detect Next.js and need no extra settings; a `netlify.toml` is included. There is no database and there are no secrets to configure. If you use your own domain, set `NEXT_PUBLIC_SITE_URL` to it (for example `https://example.com`) so link previews point to the right place.

## Add a song

A song is one TypeScript file in [`src/songs`](src/songs). Copy an existing one, such as [`twinkle.ts`](src/songs/twinkle.ts), then add it to the list in [`src/songs/index.ts`](src/songs/index.ts).

Each line of a song has two strings:

```ts
{
  chords: "C:4 F:2 C:2",
  lyric: "Twin-@C4:1 kle,@C4:1 twin-@G4:1 kle,@G4:1 lit-@A4:1 tle@A4:1 star,@G4:2",
}
```

- `chords` is a list of `Name:beats`. Here: C for 4 beats, F for 2, C for 2.
- `lyric` is a list of words. `word@C4:1` means sing "word" on the note C4 for 1 beat.
  - A word can span several notes: `word@C4:.5+D4:.5`.
  - A trailing `-` joins a syllable to the next one, so `Twin-` and `kle` show as one word.
  - `_` inside a word is shown as a space.
  - `~2` is a rest of 2 beats.
- The beats in `lyric` must add up to the beats in `chords`. `pnpm validate` tells you which line is off.
- Leave `lyric` out for an instrumental line. The app shows a dot for each beat instead.

The rest of the file sets the title, tempo (`bpm`), beats per bar (3 or 4), the strumming pattern and whether it is a `day` or `night` song. The strumming pattern is one bar on an eighth-note grid: `D` down, `U` up, `d` and `u` for soft strums, `1` to `4` to pluck a single string, `-` for a rest. So `D-DU-UDU` is the classic island strum.

The full format is documented in [`src/lib/music/types.ts`](src/lib/music/types.ts).

### Please only add songs you are allowed to share

This repository is public, so songs must be either your own work or in the public domain (words and tune). "You Are My Sunshine" is included as a **chord chart only**, without its words or melody, because that song is still under copyright. You can do the same for any song: leave `lyric` out, and sing the words you know.

## How it is built

- [Next.js](https://nextjs.org) and [Tailwind CSS](https://tailwindcss.com).
- Sound comes from [smplr](https://github.com/danigb/smplr), which plays sampled instruments in the browser. The ukulele part uses nylon-string guitar samples played in ukulele tuning, because the General MIDI sample sets have no ukulele. The samples are downloaded from smplr's sample host the first time you press play. If they cannot be downloaded, a small built-in synth takes over so the app still works.
- Timing is scheduled on the Web Audio clock ([`src/lib/audio/player.ts`](src/lib/audio/player.ts)), so the highlighting stays in step with the sound.
- The tuner detects pitch in the browser ([`src/lib/audio/pitch.ts`](src/lib/audio/pitch.ts)).
- The icons and the chord boxes are drawn in the project itself, so there is no icon library.
- Type is [Zain](https://fonts.google.com/specimen/Zain) for text and [Rakkas](https://fonts.google.com/specimen/Rakkas) for headings. Both cover Arabic and Latin and are licensed under the SIL Open Font License. The copies in [`assets/fonts`](assets/fonts) are used to draw link-preview images.

## Songs

The original songs (words and music) were written for this project and are released with it. The traditional songs use public-domain words. "ننّه نام" uses the traditional Egyptian lullaby words with a simple arrangement of the tune, since every family sings it a little differently.

## Licence

[MIT](LICENSE)
