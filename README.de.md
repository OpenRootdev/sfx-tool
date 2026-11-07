<p align="center">
  <img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/logo.svg" width="104" alt="sfx-tool logo">
</p>

<h1 align="center">sfx-tool</h1>

<p align="center">
  Ein Arbeitsplatz für Soundeffekte mit KI-Agenten: Dein Agent erzeugt die Sounds, du hörst und formst sie.<br>
  <sub>Beschreib einen Sound in eigenen Worten, hör ihn eine Sekunde später im Studio und stimm ihn nach Gehör ab, bis er passt. Alles läuft auf deinem Rechner.</sub>
</p>

<p align="center"><a href="https://github.com/OpenRootdev/sfx-tool#readme">English</a> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.es.md">Español</a> · <b>Deutsch</b> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.fr.md">Français</a> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.ja.md">日本語</a> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.zh-CN.md">简体中文</a> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.pt-BR.md">Português</a></p>

<p align="center">
  <img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/preview.gif" width="760" alt="Das sfx-tool Studio: Tonhöhe und Länge werden verschoben, Wellenform und Spektrum ändern sich, danach acht Varianten eines Sounds">
</p>

<p align="center">
  <a href="https://github.com/OpenRootdev/sfx-tool/releases/latest/download/sfx-tool.zip"><b>Herunterladen</b></a> &nbsp;·&nbsp; <a href="#loslegen">Loslegen</a> &nbsp;·&nbsp; <a href="https://github.com/OpenRootdev/sfx-tool/blob/main/skill/SKILL.md">Agent-Skill</a>
</p>

<p align="center">
  <sub>Funktioniert mit</sub><br>
  <img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/brands/claude.svg" height="16" alt="">&nbsp;Claude Code &nbsp;·&nbsp; <picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/brands/openai-dark.svg"><img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/brands/openai.svg" height="16" alt=""></picture>&nbsp;Codex &nbsp;·&nbsp; <img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/brands/nodedotjs.svg" height="16" alt="">&nbsp;Node.js &nbsp;·&nbsp; <img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/brands/ffmpeg.svg" height="16" alt="">&nbsp;FFmpeg
</p>

## Was es macht

Dein Agent schreibt jeden Sound als kleine Rezeptdatei, und das Studio spielt ihn ab, sobald sich die Datei ändert. Du hörst zu, verschiebst einen Regler oder wählst eine von acht Varianten, und der Agent sieht deine Änderungen ebenfalls. Wenn es passt, exportierst du ein WAV oder eine ganze Tippspur für dein Video.

- Beschreib einen Sound („weicher“, „mehr Holz“, „wie eine echte Tastatur“), und dein Agent baut ihn – du schreibst nie Audio-Code.
- Alles ist live: Wellenform, Spektrum und Lautheitsprüfung aktualisieren sich, während du oder der Agent etwas ändert.
- Entsteht auf deinem Rechner, ohne Konto, API-Schlüssel oder Namensnennung. Zum Start gibt es 34 Beispielsounds (Tastenanschläge, Klopfen, Pops, Glöckchen).

## Loslegen

1. Installiere <a href="https://nodejs.org">Node.js</a> 18 oder neuer.
2. Kopiere den Ordner <code>skill/</code> in den Skill-Ordner deines Agenten (bei Claude Code: <code>~/.claude/skills/sfx-tool</code>).
3. Öffne ein Terminal im Ordner deines Projekts und führe den Befehl unten aus. Er legt einen Ordner <code>sfx/</code> an und öffnet das Studio im Browser.
4. Frag deinen Agenten ganz normal, zum Beispiel <i>„Mach für jeden getippten Buchstaben ein weiches Holzklicken und ein sanftes Glöckchen, wenn die Zeile fertig ist.“</i> Die neuen Sounds erscheinen im Studio, bereit zum Feinschliff.

```bash
npx github:OpenRootdev/sfx-tool studio --open
```

## Was du brauchst

- Node.js 18 oder neuer. Sonst nichts zu installieren.
- Einen KI-Agenten, der Skills nutzt und Befehle ausführt, etwa Claude Code oder Codex. Das Studio funktioniert auch allein.
- Einen Browser für das Studio.

## Was drin ist

- [`skill/SKILL.md`](https://github.com/OpenRootdev/sfx-tool/blob/main/skill/SKILL.md) · Wie dein Agent aus einer Beschreibung einen Sound macht und mit dir im Studio arbeitet.
- [`studio/`](https://github.com/OpenRootdev/sfx-tool/blob/main/studio/) · Die Seite, auf der du die Sounds hörst und formst.
- [`bin/sfx-tool.js`](https://github.com/OpenRootdev/sfx-tool/blob/main/bin/sfx-tool.js) · Der Befehl, den dein Agent (oder du) ausführt: Sounds, Varianten und Tippspuren erzeugen.
- [`src/`](https://github.com/OpenRootdev/sfx-tool/blob/main/src/) · Die Klangmodelle und die Beispielsounds.

<sub>Vorschaubilder liegen im Branch <a href="https://github.com/OpenRootdev/sfx-tool/tree/assets"><code>assets</code></a>, Übersetzungen in <a href="https://github.com/OpenRootdev/sfx-tool/tree/translations"><code>translations</code></a>. So enthält <code>main</code> nur das Tool.</sub>

---

<sub>MIT-Lizenz · <a href="https://github.com/OpenRootdev">OpenRootdev</a></sub>
