# tony@stark:~$ — terminal portfolio

A full-screen, typeable terminal window. Boots with a short Stark-Industries-style
sequence, then accepts real commands: `help`, `about`, `skills`, `projects`,
`contact`, `whoami`, `jarvis`, `clear`. No build step — plain HTML/CSS/JS.

## Structure

```
tony-terminal/
├── index.html
└── assets/
    ├── style.css
    └── script.js
```

## Deploy to GitHub Pages

1. Delete the old files in your repo (or start a fresh repo).
2. Upload the contents of this folder so `index.html` sits at the repo root.
3. Settings → Pages → Source: `main` branch, `/ (root)`. (If you already set this
   up before, you don't need to redo it — just wait for the new build.)
4. Hard-refresh the live URL after a minute or two (Ctrl+Shift+R) to see the update.

## Customize

- All the command output (bio, skills, projects, contact links) lives in the
  `COMMANDS` object near the top of `assets/script.js` — edit the strings there.
- Project links are placeholders (`href="mailto:..."`, `github.com/`, etc.) —
  swap in your real ones before sharing this.
- Colors (gold/red on near-black) are CSS variables at the top of `assets/style.css`.
- The boot sequence text is in the `boot()` function at the bottom of `script.js`.
