# BEAT THE TIME

A browser multiplayer party game for 2–8 players.

## Latest build

This build adds the cinematic opening-page direction and a rebuilt 3D game room:

- Cinematic game-room landing page with real Create Room / Join Room controls
- 3D wooden table, chairs, room decor, window, shelves, plants and lighting
- Procedural 3D cartoon characters in seated poses around the table
- Active-player glow and eliminated-player dimming
- Server-authoritative multiplayer gameplay
- 24 validated categories / 1,592 curated entries
- Contra is included in Video Games; Controller is rejected there
- Duplicate player names are allowed and disambiguated by the server

## Run locally

```bash
npm install
npm run test:categories
npm start
```

Then open `http://localhost:3000`.

### Category validation

Expected output:

```text
Category validation passed: 24 categories, 1592 curated entries.
```

## Important

Three.js is served locally from `node_modules/three` at `/vendor/three.min.js`. This avoids depending on a public CDN at runtime.

If the 3D layer cannot load, the game shows a diagnostic banner instead of silently displaying an empty arena.

## V14 visual/audio update
- Home screen uses the 3840x2160 4K artwork as its poster/fallback.
- Home screen now has an actual looping MP4 motion layer (`public/assets/home-character-motion.mp4`) with localized character bob/breathing motion and a subtle cinematic light sweep.
- Background music replaced with a newly generated 60-second upbeat party-game loop (`public/assets/beat-the-time-party-v2.wav`).
- Native audio looping is used; the previous ended-event restart was removed to avoid restart churn.
- Existing gameplay rules, random categories, character selection, table branding, and room setup were left unchanged.


## V16 home screen
- Removed the home-page motion/video layer completely.
- Removed the character conversation/speech-bubble video layer.
- The opening screen is now a static 4K 3840x2160 artwork with no camera drift, blinking, light sweep, or speech text over characters.
- Gameplay, room setup, character selection, random categories, table branding, and game rules are unchanged.
