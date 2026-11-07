<p align="center">
  <img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/logo.svg" width="104" alt="sfx-tool logo">
</p>

<h1 align="center">sfx-tool</h1>

<p align="center">
  Soft, quiet typing and UI sounds for your videos, made on your own computer.<br>
  <sub>A small studio to hear and shape the sounds, plus a command that turns typed text into a ready sound track.</sub>
</p>

<p align="center"><b>English</b> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.es.md">Español</a> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.de.md">Deutsch</a> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.fr.md">Français</a> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.ja.md">日本語</a> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.zh-CN.md">简体中文</a> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.pt-BR.md">Português</a></p>

<p align="center">
  <img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/preview.gif" width="760" alt="The sfx-tool Studio: moving the pitch and length sliders reshapes the waveform and spectrum, then eight variations of a wooden knock">
</p>

<p align="center">
  <a href="https://github.com/OpenRootdev/sfx-tool/releases/latest/download/sfx-tool.zip"><b>Download</b></a> &nbsp;·&nbsp; <a href="#get-started">Get started</a> &nbsp;·&nbsp; <a href="skill/SKILL.md">Agent skill</a>
</p>

<p align="center">
  <sub>Works with</sub><br>
  <img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/brands/nodedotjs.svg" height="16" alt="">&nbsp;Node.js &nbsp;·&nbsp; <img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/brands/claude.svg" height="16" alt="">&nbsp;Claude Code &nbsp;·&nbsp; <picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/brands/openai-dark.svg"><img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/brands/openai.svg" height="16" alt=""></picture>&nbsp;Codex &nbsp;·&nbsp; <img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/brands/ffmpeg.svg" height="16" alt="">&nbsp;FFmpeg
</p>

## What it does

sfx-tool gives you 34 gentle sounds: dull key taps, deep thocks, wooden knocks, felt taps, keycaps, bubble pops and a soft "done" chime. Open the Studio to hear them, move a slider to change one, and turn any text into a typing track you can drop under your video.

- Quiet on purpose, so it sits under music and voice instead of fighting them.
- Every keystroke is a slightly different take, so it never sounds like a loop.
- No account, no API key and nothing to credit: every sound is made on your computer.

## Get started

1. Install <a href="https://nodejs.org">Node.js</a> 18 or newer.
2. Open a terminal in your video project's folder and run the command below. It adds an <code>sfx/</code> folder with all 34 sounds and opens the Studio in your browser.
3. Optional: copy the <code>skill/</code> folder into your agent's skills folder (for Claude Code: <code>~/.claude/skills/sfx-tool</code>) and ask in plain words, for example <i>"Add soft typing sounds to the terminal scene."</i>

```bash
npx github:OpenRootdev/sfx-tool studio --open
```

## What you need

- Node.js 18 or newer. Nothing else to install.
- A browser for the Studio.
- A video tool that takes a WAV file: HyperFrames, Remotion, FFmpeg or any editor.

## What's inside

- [`studio/`](studio/) · The page where you hear and shape the sounds.
- [`bin/sfx-tool.js`](bin/sfx-tool.js) · The command: open the Studio, make new sounds, build typing tracks.
- [`src/`](src/) · The sound recipes and the code that makes them.
- [`skill/SKILL.md`](skill/SKILL.md) · Instructions that let an AI agent make and tune sounds with you.

<sub>Preview media lives on the <a href="https://github.com/OpenRootdev/sfx-tool/tree/assets"><code>assets</code></a> branch and translations on <a href="https://github.com/OpenRootdev/sfx-tool/tree/translations"><code>translations</code></a>, so <code>main</code> holds only the tool.</sub>

---

<sub>MIT licence · <a href="https://github.com/OpenRootdev">OpenRootdev</a></sub>
