<p align="center">
  <img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/logo.svg" width="104" alt="sfx-tool logo">
</p>

<h1 align="center">sfx-tool</h1>

<p align="center">
  Sonidos suaves y discretos de teclado e interfaz para tus vídeos, creados en tu propio ordenador.<br>
  <sub>Un pequeño estudio para escuchar y ajustar los sonidos, y un comando que convierte un texto en una pista de tecleo lista.</sub>
</p>

<p align="center"><a href="https://github.com/OpenRootdev/sfx-tool#readme">English</a> · <b>Español</b> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.de.md">Deutsch</a> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.fr.md">Français</a> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.ja.md">日本語</a> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.zh-CN.md">简体中文</a> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.pt-BR.md">Português</a></p>

<p align="center">
  <img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/preview.gif" width="760" alt="El Studio de sfx-tool: al mover los controles de tono y duración cambian la onda y el espectro, y luego ocho variaciones de un golpe de madera">
</p>

<p align="center">
  <a href="https://github.com/OpenRootdev/sfx-tool/releases/latest/download/sfx-tool.zip"><b>Descargar</b></a> &nbsp;·&nbsp; <a href="#primeros-pasos">Primeros pasos</a> &nbsp;·&nbsp; <a href="https://github.com/OpenRootdev/sfx-tool/blob/main/skill/SKILL.md">Skill para agentes</a>
</p>

<p align="center">
  <sub>Funciona con</sub><br>
  <img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/brands/nodedotjs.svg" height="16" alt="">&nbsp;Node.js &nbsp;·&nbsp; <img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/brands/claude.svg" height="16" alt="">&nbsp;Claude Code &nbsp;·&nbsp; <picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/brands/openai-dark.svg"><img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/brands/openai.svg" height="16" alt=""></picture>&nbsp;Codex &nbsp;·&nbsp; <img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/brands/ffmpeg.svg" height="16" alt="">&nbsp;FFmpeg
</p>

## Qué hace

sfx-tool te da 34 sonidos suaves: teclas apagadas, golpes graves, golpes de madera, toques de fieltro, teclas mecánicas, burbujas y una campanita de "listo". Abre el Studio para escucharlos, mueve un control para cambiar uno y convierte cualquier texto en una pista de tecleo para tu vídeo.

- Discretos a propósito: quedan bajo la música y la voz sin competir con ellas.
- Cada pulsación suena un poco distinta, así que nunca parece un bucle.
- Sin cuenta, sin clave de API y sin atribución: todo se crea en tu ordenador.

## Primeros pasos

1. Instala <a href="https://nodejs.org">Node.js</a> 18 o posterior.
2. Abre una terminal en la carpeta de tu vídeo y ejecuta el comando de abajo. Crea una carpeta <code>sfx/</code> con los 34 sonidos y abre el Studio en el navegador.
3. Opcional: copia la carpeta <code>skill/</code> en la carpeta de skills de tu agente (en Claude Code: <code>~/.claude/skills/sfx-tool</code>) y pídelo con tus palabras, por ejemplo <i>"Añade sonidos de tecleo suaves a la escena del terminal."</i>

```bash
npx github:OpenRootdev/sfx-tool studio --open
```

## Qué necesitas

- Node.js 18 o posterior. Nada más que instalar.
- Un navegador para el Studio.
- Una herramienta de vídeo que acepte WAV: HyperFrames, Remotion, FFmpeg o cualquier editor.

## Qué incluye

- [`studio/`](https://github.com/OpenRootdev/sfx-tool/blob/main/studio/) · La página donde escuchas y ajustas los sonidos.
- [`bin/sfx-tool.js`](https://github.com/OpenRootdev/sfx-tool/blob/main/bin/sfx-tool.js) · El comando: abre el Studio, crea sonidos nuevos y genera pistas de tecleo.
- [`src/`](https://github.com/OpenRootdev/sfx-tool/blob/main/src/) · Las recetas de sonido y el código que los crea.
- [`skill/SKILL.md`](https://github.com/OpenRootdev/sfx-tool/blob/main/skill/SKILL.md) · Instrucciones para que un agente de IA cree y ajuste sonidos contigo.

<sub>Las imágenes de muestra están en la rama <a href="https://github.com/OpenRootdev/sfx-tool/tree/assets"><code>assets</code></a> y las traducciones en <a href="https://github.com/OpenRootdev/sfx-tool/tree/translations"><code>translations</code></a>, así que <code>main</code> solo contiene la herramienta.</sub>

---

<sub>Licencia MIT · <a href="https://github.com/OpenRootdev">OpenRootdev</a></sub>
