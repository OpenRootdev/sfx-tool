<p align="center">
  <img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/logo.svg" width="104" alt="sfx-tool logo">
</p>

<h1 align="center">sfx-tool</h1>

<p align="center">
  Des sons de frappe et d'interface doux et discrets pour vos vidéos, créés sur votre propre ordinateur.<br>
  <sub>Un petit studio pour écouter et façonner les sons, et une commande qui transforme un texte en piste de frappe prête à l'emploi.</sub>
</p>

<p align="center"><a href="https://github.com/OpenRootdev/sfx-tool#readme">English</a> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.es.md">Español</a> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.de.md">Deutsch</a> · <b>Français</b> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.ja.md">日本語</a> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.zh-CN.md">简体中文</a> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.pt-BR.md">Português</a></p>

<p align="center">
  <img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/preview.gif" width="760" alt="Le Studio de sfx-tool : les curseurs de hauteur et de durée changent la forme d'onde et le spectre, puis huit variantes d'un coup de bois">
</p>

<p align="center">
  <a href="https://github.com/OpenRootdev/sfx-tool/releases/latest/download/sfx-tool.zip"><b>Télécharger</b></a> &nbsp;·&nbsp; <a href="#démarrer">Démarrer</a> &nbsp;·&nbsp; <a href="https://github.com/OpenRootdev/sfx-tool/blob/main/skill/SKILL.md">Skill pour agents</a>
</p>

<p align="center">
  <sub>Fonctionne avec</sub><br>
  <img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/brands/nodedotjs.svg" height="16" alt="">&nbsp;Node.js &nbsp;·&nbsp; <img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/brands/claude.svg" height="16" alt="">&nbsp;Claude Code &nbsp;·&nbsp; <picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/brands/openai-dark.svg"><img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/brands/openai.svg" height="16" alt=""></picture>&nbsp;Codex &nbsp;·&nbsp; <img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/brands/ffmpeg.svg" height="16" alt="">&nbsp;FFmpeg
</p>

## Ce que ça fait

sfx-tool vous donne 34 sons doux : frappes étouffées, thocks graves, coups de bois, frappes feutrées, keycaps, bulles et un petit carillon « terminé ». Ouvrez le Studio pour les écouter, bougez un curseur pour en modifier un, et transformez n'importe quel texte en piste de frappe à placer sous votre vidéo.

- Discret exprès : il reste sous la musique et la voix sans les gêner.
- Chaque frappe est une prise un peu différente, donc jamais une boucle.
- Sans compte, sans clé d'API et sans mention : tout est créé sur votre ordinateur.

## Démarrer

1. Installez <a href="https://nodejs.org">Node.js</a> 18 ou plus récent.
2. Ouvrez un terminal dans le dossier de votre projet vidéo et lancez la commande ci-dessous. Elle crée un dossier <code>sfx/</code> avec les 34 sons et ouvre le Studio dans votre navigateur.
3. Facultatif : copiez le dossier <code>skill/</code> dans le dossier des skills de votre agent (pour Claude Code : <code>~/.claude/skills/sfx-tool</code>) et demandez simplement, par exemple <i>« Ajoute des bruits de frappe doux à la scène du terminal. »</i>

```bash
npx github:OpenRootdev/sfx-tool studio --open
```

## Ce qu'il vous faut

- Node.js 18 ou plus récent. Rien d'autre à installer.
- Un navigateur pour le Studio.
- Un outil vidéo qui accepte un fichier WAV : HyperFrames, Remotion, FFmpeg ou n'importe quel logiciel de montage.

## Contenu

- [`studio/`](https://github.com/OpenRootdev/sfx-tool/blob/main/studio/) · La page où vous écoutez et façonnez les sons.
- [`bin/sfx-tool.js`](https://github.com/OpenRootdev/sfx-tool/blob/main/bin/sfx-tool.js) · La commande : ouvrir le Studio, créer des sons, générer des pistes de frappe.
- [`src/`](https://github.com/OpenRootdev/sfx-tool/blob/main/src/) · Les recettes de sons et le code qui les produit.
- [`skill/SKILL.md`](https://github.com/OpenRootdev/sfx-tool/blob/main/skill/SKILL.md) · Les instructions qui permettent à un agent IA de créer et régler des sons avec vous.

<sub>Les images d'aperçu sont sur la branche <a href="https://github.com/OpenRootdev/sfx-tool/tree/assets"><code>assets</code></a> et les traductions sur <a href="https://github.com/OpenRootdev/sfx-tool/tree/translations"><code>translations</code></a> : <code>main</code> ne contient que l'outil.</sub>

---

<sub>Licence MIT · <a href="https://github.com/OpenRootdev">OpenRootdev</a></sub>
