<p align="center">
  <img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/logo.svg" width="104" alt="sfx-tool logo">
</p>

<h1 align="center">sfx-tool</h1>

<p align="center">
  Un espacio de trabajo de efectos de sonido para agentes de IA: tu agente crea los sonidos y tú los escuchas y ajustas.<br>
  <sub>Pide un sonido con tus palabras, escúchalo en el Studio un segundo después y ajústalo de oído hasta que suene bien. Todo funciona en tu ordenador.</sub>
</p>

<p align="center"><a href="https://github.com/OpenRootdev/sfx-tool#readme">English</a> · <b>Español</b> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.de.md">Deutsch</a> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.fr.md">Français</a> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.ja.md">日本語</a> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.zh-CN.md">简体中文</a> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.pt-BR.md">Português</a></p>

<p align="center">
  <img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/preview.gif" width="760" alt="El Studio de sfx-tool: al mover los controles de tono y duración cambian la onda y el espectro, y luego ocho variaciones de un sonido">
</p>

<p align="center">
  <a href="https://github.com/OpenRootdev/sfx-tool/releases/latest/download/sfx-tool.zip"><b>Descargar</b></a> &nbsp;·&nbsp; <a href="#primeros-pasos">Primeros pasos</a> &nbsp;·&nbsp; <a href="https://github.com/OpenRootdev/sfx-tool/blob/main/skill/SKILL.md">Skill para agentes</a>
</p>

<p align="center">
  <sub>Funciona con</sub><br>
  <img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/brands/claude.svg" height="16" alt="">&nbsp;Claude Code &nbsp;·&nbsp; <picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/brands/openai-dark.svg"><img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/brands/openai.svg" height="16" alt=""></picture>&nbsp;Codex &nbsp;·&nbsp; <img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/brands/nodedotjs.svg" height="16" alt="">&nbsp;Node.js &nbsp;·&nbsp; <img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/brands/ffmpeg.svg" height="16" alt="">&nbsp;FFmpeg
</p>

## Qué hace

Tu agente escribe cada sonido como un pequeño archivo de receta, y el Studio lo reproduce en cuanto el archivo cambia. Tú escuchas, mueves un control o eliges una de ocho variaciones, y el agente también ve tus cambios. Cuando suene bien, exporta un WAV o una pista de tecleo completa para tu vídeo.

- Describe un sonido ("más suave", "más de madera", "como un teclado de verdad") y tu agente lo crea; nunca escribes código de audio.
- Todo cambia en directo: la onda, el espectro y las comprobaciones de volumen se actualizan cuando tú o el agente editáis.
- Se crea en tu ordenador, sin cuenta, clave de API ni atribución. Incluye 34 sonidos de ejemplo (teclas, golpes, burbujas, campanitas) para empezar.

## Primeros pasos

1. Instala <a href="https://nodejs.org">Node.js</a> 18 o posterior.
2. Copia la carpeta <code>skill/</code> en la carpeta de skills de tu agente (en Claude Code: <code>~/.claude/skills/sfx-tool</code>).
3. Abre una terminal en la carpeta de tu proyecto y ejecuta el comando de abajo. Crea una carpeta <code>sfx/</code> y abre el Studio en el navegador.
4. Pídeselo a tu agente con tus palabras, por ejemplo <i>"Haz un clic suave de madera para cada letra y una campanita suave al terminar la línea."</i> Los sonidos nuevos aparecen en el Studio, listos para ajustar.

```bash
npx github:OpenRootdev/sfx-tool studio --open
```

## Qué necesitas

- Node.js 18 o posterior. Nada más que instalar.
- Un agente de IA que use skills y ejecute comandos, como Claude Code o Codex. El Studio también funciona solo.
- Un navegador para el Studio.

## Qué incluye

- [`skill/SKILL.md`](https://github.com/OpenRootdev/sfx-tool/blob/main/skill/SKILL.md) · Cómo tu agente convierte una descripción en un sonido y cómo trabaja contigo en el Studio.
- [`studio/`](https://github.com/OpenRootdev/sfx-tool/blob/main/studio/) · La página donde escuchas y ajustas los sonidos.
- [`bin/sfx-tool.js`](https://github.com/OpenRootdev/sfx-tool/blob/main/bin/sfx-tool.js) · El comando que ejecuta tu agente (o tú): crea sonidos, variaciones y pistas de tecleo.
- [`src/`](https://github.com/OpenRootdev/sfx-tool/blob/main/src/) · Los modelos de sonido y los sonidos de ejemplo.

<sub>Las imágenes de muestra están en la rama <a href="https://github.com/OpenRootdev/sfx-tool/tree/assets"><code>assets</code></a> y las traducciones en <a href="https://github.com/OpenRootdev/sfx-tool/tree/translations"><code>translations</code></a>, así que <code>main</code> solo contiene la herramienta.</sub>

---

<sub>Licencia MIT · <a href="https://github.com/OpenRootdev">OpenRootdev</a></sub>
