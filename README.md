<p align="center">
  <img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/logo.svg" width="104" alt="sfx-tool logo">
</p>

<h1 align="center">sfx-tool</h1>

<p align="center">
  A sound effects workspace for AI agents: your agent makes the sounds, you hear and shape them.<br>
  <sub>Ask for a sound in plain words, hear it in the Studio a second later, and nudge it by ear until it is right. Everything runs on your computer.</sub>
</p>

<p align="center"><b>English</b> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.es.md">Español</a> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.de.md">Deutsch</a> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.fr.md">Français</a> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.ja.md">日本語</a> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.zh-CN.md">简体中文</a> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.pt-BR.md">Português</a></p>

<p align="center">
  <img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/preview.gif" width="760" alt="The sfx-tool Studio: moving the pitch and length sliders reshapes the waveform and spectrum, then eight variations of a sound">
</p>

<p align="center">
  <a href="https://github.com/OpenRootdev/sfx-tool/releases/latest/download/sfx-tool.zip"><b>Download</b></a> &nbsp;·&nbsp; <a href="#get-started">Get started</a> &nbsp;·&nbsp; <a href="skill/SKILL.md">Agent skill</a>
</p>

<p align="center">
  <sub>Works with</sub><br>
  <img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/brands/claude.svg" height="16" alt="">&nbsp;Claude Code &nbsp;·&nbsp; <picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/brands/openai-dark.svg"><img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/brands/openai.svg" height="16" alt=""></picture>&nbsp;Codex &nbsp;·&nbsp; <img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/brands/nodedotjs.svg" height="16" alt="">&nbsp;Node.js &nbsp;·&nbsp; <img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/brands/ffmpeg.svg" height="16" alt="">&nbsp;FFmpeg
</p>

## What it does

Your agent writes each sound as a small recipe file, and the Studio plays it the moment the file changes. You listen, move a slider or pick one of eight variations, and the agent sees your changes too. When it sounds right, export a WAV or a whole typing track for your video.

- Describe a sound ("softer", "more wooden", "like a real keyboard") and your agent builds it; you never write audio code.
- Every change is live: waveform, spectrum and loudness checks update as you or the agent edit.
- Made on your computer, with no account, API key or credit needed. It starts with 34 example sounds (key taps, knocks, pops, chimes) to build from.

## Get started

1. Install <a href="https://nodejs.org">Node.js</a> 18 or newer.
2. Copy the <code>skill/</code> folder into your agent's skills folder (for Claude Code: <code>~/.claude/skills/sfx-tool</code>).
3. Open a terminal in your project's folder and run the command below. It creates an <code>sfx/</code> folder and opens the Studio in your browser.
4. Ask your agent in plain words, for example <i>"Make a soft, wooden click for each typed letter, and a gentle chime when the line is done."</i> The new sounds appear in the Studio, ready to tweak.

```bash
npx github:OpenRootdev/sfx-tool studio --open
```

## What you need

- Node.js 18 or newer. Nothing else to install.
- An AI agent that can use skills and run commands, such as Claude Code or Codex. The Studio also works on its own.
- A browser for the Studio.

## What's inside

- [`skill/SKILL.md`](skill/SKILL.md) · How your agent turns a description into a sound, and how it works with you in the Studio.
- [`studio/`](studio/) · The page where you hear and shape the sounds.
- [`bin/sfx-tool.js`](bin/sfx-tool.js) · The command your agent (or you) runs: make sounds, variations and typing tracks.
- [`src/`](src/) · The sound models and the example sounds.

<sub>Preview media lives on the <a href="https://github.com/OpenRootdev/sfx-tool/tree/assets"><code>assets</code></a> branch and translations on <a href="https://github.com/OpenRootdev/sfx-tool/tree/translations"><code>translations</code></a>, so <code>main</code> holds only the tool.</sub>

---

<sub>MIT licence · <a href="https://github.com/OpenRootdev">OpenRootdev</a></sub>
