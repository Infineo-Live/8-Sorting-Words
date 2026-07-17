# Shiva's Wisdom - Browser Game

A peaceful, spiritual 2D browser game where the player restores Lord Shiva's wisdom after one word from each teaching is carried away by the gentle waters of the River Ganga.

## Folder Structure

```text
shivas-wisdom/
├── index.html         # Main page and layout (including character and background SVGs)
├── css/
│   └── style.css      # Serene spiritual theme design tokens, layouts, and animations
├── js/
│   ├── teachings.js   # Word puzzle dataset (sentences, missing words, and distractors)
│   ├── audio.js       # Synthesizes Tibetan temple bell chimes using Web Audio API
│   ├── visual.js      # Controls camera panning, water ripples/splashes, and character states
│   └── game.js        # Main state controller (shuffling, scoring, auto-restore, screen transitions)
└── README.md          # Project instructions and documentation
```

## Features & Gameplay

- **Serene Aesthetics:** Sleek sunrise backdrop, layered Mount Kailash, and flowing waves of River Ganga.
- **Peaceful Audio:** Synthesized bell chime sounds play dynamically upon selecting a correct word (no external audio files required).
- **Responsive Layout:** Works seamlessly on Desktop, Mobile (Portrait & Landscape).
- **Zero Pressure:** No timers, no lives, and no game-overs. Positive reinforcement guides players.
- **Auto-Restoration:** If the player makes 3 incorrect attempts, the river sparkles, the correct word cloud rises from River Ganga, and Shiva restores the wisdom automatically.

## Running the Game

1. Navigate to the `shivas-wisdom/` directory.
2. Open `index.html` directly in any modern web browser (Google Chrome, Firefox, Safari, Microsoft Edge). No server setup is required.
