<p align="center">
  <img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/logo.svg" width="104" alt="sfx-tool logo">
</p>

<h1 align="center">sfx-tool</h1>

<p align="center">
  Leise, sanfte Tipp- und UI-Sounds für deine Videos, direkt auf deinem eigenen Rechner erzeugt.<br>
  <sub>Ein kleines Studio zum Anhören und Formen der Sounds, dazu ein Befehl, der getippten Text in eine fertige Tonspur verwandelt.</sub>
</p>

<p align="center"><a href="https://github.com/OpenRootdev/sfx-tool#readme">English</a> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.es.md">Español</a> · <b>Deutsch</b> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.fr.md">Français</a> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.ja.md">日本語</a> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.zh-CN.md">简体中文</a> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.pt-BR.md">Português</a></p>

<p align="center">
  <img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/preview.gif" width="760" alt="Das sfx-tool Studio: Tonhöhe und Länge werden verschoben, Wellenform und Spektrum ändern sich, danach acht Varianten eines Holzklopfens">
</p>

<p align="center">
  <a href="https://github.com/OpenRootdev/sfx-tool/releases/latest/download/sfx-tool.zip"><b>Herunterladen</b></a> &nbsp;·&nbsp; <a href="#loslegen">Loslegen</a> &nbsp;·&nbsp; <a href="https://github.com/OpenRootdev/sfx-tool/blob/main/skill/SKILL.md">Agent-Skill</a>
</p>

<p align="center">
  <sub>Funktioniert mit</sub><br>
  <img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/brands/nodedotjs.svg" height="16" alt="">&nbsp;Node.js &nbsp;·&nbsp; <img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/brands/claude.svg" height="16" alt="">&nbsp;Claude Code &nbsp;·&nbsp; <picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/brands/openai-dark.svg"><img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/brands/openai.svg" height="16" alt=""></picture>&nbsp;Codex &nbsp;·&nbsp; <img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/brands/ffmpeg.svg" height="16" alt="">&nbsp;FFmpeg
</p>

## Was es macht

sfx-tool bringt 34 sanfte Sounds mit: dumpfe Tastenanschläge, tiefe Thocks, Holzklopfen, Filz-Taps, Keycaps, Blasen-Pops und ein leises „Fertig“-Glöckchen. Im Studio hörst du sie, verschiebst einen Regler, um einen zu ändern, und machst aus beliebigem Text eine Tippspur für dein Video.

- Absichtlich leise, damit es unter Musik und Stimme liegt, statt mit ihnen zu konkurrieren.
- Jeder Anschlag klingt ein wenig anders, also nie wie eine Schleife.
- Kein Konto, kein API-Schlüssel, keine Namensnennung: Jeder Sound entsteht auf deinem Rechner.

## Loslegen

1. Installiere <a href="https://nodejs.org">Node.js</a> 18 oder neuer.
2. Öffne ein Terminal im Ordner deines Videoprojekts und führe den Befehl unten aus. Er legt einen Ordner <code>sfx/</code> mit allen 34 Sounds an und öffnet das Studio im Browser.
3. Optional: Kopiere den Ordner <code>skill/</code> in den Skill-Ordner deines Agenten (bei Claude Code: <code>~/.claude/skills/sfx-tool</code>) und frag ganz normal, zum Beispiel <i>„Füge der Terminal-Szene leise Tippgeräusche hinzu.“</i>

```bash
npx github:OpenRootdev/sfx-tool studio --open
```

## Was du brauchst

- Node.js 18 oder neuer. Sonst nichts zu installieren.
- Einen Browser für das Studio.
- Ein Videotool, das WAV-Dateien nimmt: HyperFrames, Remotion, FFmpeg oder ein beliebiger Editor.

## Was drin ist

- [`studio/`](https://github.com/OpenRootdev/sfx-tool/blob/main/studio/) · Die Seite, auf der du die Sounds hörst und formst.
- [`bin/sfx-tool.js`](https://github.com/OpenRootdev/sfx-tool/blob/main/bin/sfx-tool.js) · Der Befehl: Studio öffnen, neue Sounds anlegen, Tippspuren bauen.
- [`src/`](https://github.com/OpenRootdev/sfx-tool/blob/main/src/) · Die Sound-Rezepte und der Code, der sie erzeugt.
- [`skill/SKILL.md`](https://github.com/OpenRootdev/sfx-tool/blob/main/skill/SKILL.md) · Anleitung, mit der ein KI-Agent mit dir Sounds erstellt und abstimmt.

<sub>Vorschaubilder liegen im Branch <a href="https://github.com/OpenRootdev/sfx-tool/tree/assets"><code>assets</code></a>, Übersetzungen in <a href="https://github.com/OpenRootdev/sfx-tool/tree/translations"><code>translations</code></a>. So enthält <code>main</code> nur das Tool.</sub>

---

<sub>MIT-Lizenz · <a href="https://github.com/OpenRootdev">OpenRootdev</a></sub>
