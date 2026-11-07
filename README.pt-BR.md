<p align="center">
  <img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/logo.svg" width="104" alt="sfx-tool logo">
</p>

<h1 align="center">sfx-tool</h1>

<p align="center">
  Sons suaves e discretos de digitação e interface para seus vídeos, feitos no seu próprio computador.<br>
  <sub>Um pequeno estúdio para ouvir e ajustar os sons, e um comando que transforma texto digitado em uma trilha pronta.</sub>
</p>

<p align="center"><a href="https://github.com/OpenRootdev/sfx-tool#readme">English</a> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.es.md">Español</a> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.de.md">Deutsch</a> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.fr.md">Français</a> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.ja.md">日本語</a> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.zh-CN.md">简体中文</a> · <b>Português</b></p>

<p align="center">
  <img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/preview.gif" width="760" alt="O Studio do sfx-tool: os controles de tom e duração mudam a forma de onda e o espectro, depois oito variações de uma batida de madeira">
</p>

<p align="center">
  <a href="https://github.com/OpenRootdev/sfx-tool/releases/latest/download/sfx-tool.zip"><b>Baixar</b></a> &nbsp;·&nbsp; <a href="#começar">Começar</a> &nbsp;·&nbsp; <a href="https://github.com/OpenRootdev/sfx-tool/blob/main/skill/SKILL.md">Skill para agentes</a>
</p>

<p align="center">
  <sub>Funciona com</sub><br>
  <img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/brands/nodedotjs.svg" height="16" alt="">&nbsp;Node.js &nbsp;·&nbsp; <img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/brands/claude.svg" height="16" alt="">&nbsp;Claude Code &nbsp;·&nbsp; <picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/brands/openai-dark.svg"><img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/brands/openai.svg" height="16" alt=""></picture>&nbsp;Codex &nbsp;·&nbsp; <img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/brands/ffmpeg.svg" height="16" alt="">&nbsp;FFmpeg
</p>

## O que faz

O sfx-tool traz 34 sons suaves: teclas abafadas, thocks graves, batidas de madeira, toques de feltro, keycaps, bolhas e um sininho de "pronto". Abra o Studio para ouvi-los, mova um controle para mudar um deles e transforme qualquer texto em uma trilha de digitação para colocar sob o seu vídeo.

- Baixinho de propósito, para ficar sob a música e a voz sem competir com elas.
- Cada tecla soa um pouco diferente, então nunca parece um loop.
- Sem conta, sem chave de API e sem créditos: tudo é feito no seu computador.

## Começar

1. Instale o <a href="https://nodejs.org">Node.js</a> 18 ou mais recente.
2. Abra um terminal na pasta do seu projeto de vídeo e rode o comando abaixo. Ele cria uma pasta <code>sfx/</code> com os 34 sons e abre o Studio no navegador.
3. Opcional: copie a pasta <code>skill/</code> para a pasta de skills do seu agente (no Claude Code: <code>~/.claude/skills/sfx-tool</code>) e peça com suas palavras, por exemplo <i>"Coloque sons suaves de digitação na cena do terminal."</i>

```bash
npx github:OpenRootdev/sfx-tool studio --open
```

## O que você precisa

- Node.js 18 ou mais recente. Nada mais para instalar.
- Um navegador para o Studio.
- Uma ferramenta de vídeo que aceite WAV: HyperFrames, Remotion, FFmpeg ou qualquer editor.

## O que vem dentro

- [`studio/`](https://github.com/OpenRootdev/sfx-tool/blob/main/studio/) · A página onde você ouve e ajusta os sons.
- [`bin/sfx-tool.js`](https://github.com/OpenRootdev/sfx-tool/blob/main/bin/sfx-tool.js) · O comando: abre o Studio, cria sons novos e gera trilhas de digitação.
- [`src/`](https://github.com/OpenRootdev/sfx-tool/blob/main/src/) · As receitas de som e o código que as produz.
- [`skill/SKILL.md`](https://github.com/OpenRootdev/sfx-tool/blob/main/skill/SKILL.md) · Instruções para um agente de IA criar e ajustar sons com você.

<sub>As imagens de prévia ficam no branch <a href="https://github.com/OpenRootdev/sfx-tool/tree/assets"><code>assets</code></a> e as traduções em <a href="https://github.com/OpenRootdev/sfx-tool/tree/translations"><code>translations</code></a>, então o <code>main</code> tem só a ferramenta.</sub>

---

<sub>Licença MIT · <a href="https://github.com/OpenRootdev">OpenRootdev</a></sub>
