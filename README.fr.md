<p align="center">
  <img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/logo.svg" width="104" alt="sfx-tool logo">
</p>

<h1 align="center">sfx-tool</h1>

<p align="center">
  Un espace de travail d'effets sonores pour agents IA : votre agent crée les sons, vous les écoutez et les façonnez.<br>
  <sub>Décrivez un son avec vos mots, écoutez-le dans le Studio une seconde plus tard et ajustez-le à l'oreille jusqu'à ce qu'il soit juste. Tout tourne sur votre ordinateur.</sub>
</p>

<p align="center"><a href="https://github.com/OpenRootdev/sfx-tool#readme">English</a> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.es.md">Español</a> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.de.md">Deutsch</a> · <b>Français</b> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.ja.md">日本語</a> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.zh-CN.md">简体中文</a> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.pt-BR.md">Português</a></p>

<p align="center">
  <img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/preview.gif" width="760" alt="Le Studio de sfx-tool : les curseurs de hauteur et de durée changent la forme d'onde et le spectre, puis huit variantes d'un son">
</p>

<p align="center">
  <a href="https://github.com/OpenRootdev/sfx-tool/releases/latest/download/sfx-tool.zip"><b>Télécharger</b></a> &nbsp;·&nbsp; <a href="#démarrer">Démarrer</a> &nbsp;·&nbsp; <a href="https://github.com/OpenRootdev/sfx-tool/blob/main/skill/SKILL.md">Skill pour agents</a>
</p>

<p align="center">
  <sub>Fonctionne avec</sub><br>
  <img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/brands/claude.svg" height="16" alt="">&nbsp;Claude Code &nbsp;·&nbsp; <picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/brands/openai-dark.svg"><img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/brands/openai.svg" height="16" alt=""></picture>&nbsp;Codex &nbsp;·&nbsp; <img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/brands/nodedotjs.svg" height="16" alt="">&nbsp;Node.js &nbsp;·&nbsp; <img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/brands/ffmpeg.svg" height="16" alt="">&nbsp;FFmpeg
</p>

## Ce que ça fait

Votre agent écrit chaque son sous forme d'un petit fichier recette, et le Studio le joue dès que le fichier change. Vous écoutez, bougez un curseur ou choisissez une des huit variantes, et l'agent voit aussi vos changements. Quand c'est bon, exportez un WAV ou une piste de frappe complète pour votre vidéo.

- Décrivez un son (« plus doux », « plus boisé », « comme un vrai clavier ») et votre agent le construit ; vous n'écrivez jamais de code audio.
- Tout est en direct : forme d'onde, spectre et contrôle du volume se mettent à jour quand vous ou l'agent modifiez.
- Créé sur votre ordinateur, sans compte, clé d'API ni mention. 34 sons d'exemple (frappes, coups, bulles, carillons) servent de point de départ.

## Démarrer

1. Installez <a href="https://nodejs.org">Node.js</a> 18 ou plus récent.
2. Copiez le dossier <code>skill/</code> dans le dossier des skills de votre agent (pour Claude Code : <code>~/.claude/skills/sfx-tool</code>).
3. Ouvrez un terminal dans le dossier de votre projet et lancez la commande ci-dessous. Elle crée un dossier <code>sfx/</code> et ouvre le Studio dans votre navigateur.
4. Demandez simplement à votre agent, par exemple <i>« Fais un petit clic boisé et doux pour chaque lettre tapée, et un carillon léger à la fin de la ligne. »</i> Les nouveaux sons apparaissent dans le Studio, prêts à être ajustés.

```bash
npx github:OpenRootdev/sfx-tool studio --open
```

## Ce qu'il vous faut

- Node.js 18 ou plus récent. Rien d'autre à installer.
- Un agent IA qui utilise des skills et lance des commandes, comme Claude Code ou Codex. Le Studio marche aussi seul.
- Un navigateur pour le Studio.

## Contenu

- [`skill/SKILL.md`](https://github.com/OpenRootdev/sfx-tool/blob/main/skill/SKILL.md) · Comment votre agent transforme une description en son et travaille avec vous dans le Studio.
- [`studio/`](https://github.com/OpenRootdev/sfx-tool/blob/main/studio/) · La page où vous écoutez et façonnez les sons.
- [`bin/sfx-tool.js`](https://github.com/OpenRootdev/sfx-tool/blob/main/bin/sfx-tool.js) · La commande que lance votre agent (ou vous) : créer des sons, des variantes et des pistes de frappe.
- [`src/`](https://github.com/OpenRootdev/sfx-tool/blob/main/src/) · Les modèles de son et les sons d'exemple.

<sub>Les images d'aperçu sont sur la branche <a href="https://github.com/OpenRootdev/sfx-tool/tree/assets"><code>assets</code></a> et les traductions sur <a href="https://github.com/OpenRootdev/sfx-tool/tree/translations"><code>translations</code></a> : <code>main</code> ne contient que l'outil.</sub>

---

<sub>Licence MIT · <a href="https://github.com/OpenRootdev">OpenRootdev</a></sub>
