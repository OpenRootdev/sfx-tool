<p align="center">
  <img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/logo.svg" width="104" alt="sfx-tool logo">
</p>

<h1 align="center">sfx-tool</h1>

<p align="center">
  面向 AI 智能体的音效工作台：智能体负责做声音，你来试听和打磨。<br>
  <sub>用平常的话描述一个声音，一秒后就能在 Studio 里听到，再凭耳朵微调到满意为止。一切都在你的电脑上运行。</sub>
</p>

<p align="center"><a href="https://github.com/OpenRootdev/sfx-tool#readme">English</a> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.es.md">Español</a> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.de.md">Deutsch</a> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.fr.md">Français</a> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.ja.md">日本語</a> · <b>简体中文</b> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.pt-BR.md">Português</a></p>

<p align="center">
  <img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/preview.gif" width="760" alt="sfx-tool Studio：拖动音高和长度滑块时，波形和频谱随之变化，随后显示一个声音的八个变体">
</p>

<p align="center">
  <a href="https://github.com/OpenRootdev/sfx-tool/releases/latest/download/sfx-tool.zip"><b>下载</b></a> &nbsp;·&nbsp; <a href="#快速开始">快速开始</a> &nbsp;·&nbsp; <a href="https://github.com/OpenRootdev/sfx-tool/blob/main/skill/SKILL.md">智能体技能</a>
</p>

<p align="center">
  <sub>适用于</sub><br>
  <img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/brands/claude.svg" height="16" alt="">&nbsp;Claude Code &nbsp;·&nbsp; <picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/brands/openai-dark.svg"><img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/brands/openai.svg" height="16" alt=""></picture>&nbsp;Codex &nbsp;·&nbsp; <img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/brands/nodedotjs.svg" height="16" alt="">&nbsp;Node.js &nbsp;·&nbsp; <img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/brands/ffmpeg.svg" height="16" alt="">&nbsp;FFmpeg
</p>

## 它能做什么

智能体把每个声音写成一个小小的配方文件，文件一变，Studio 就立即播放。你可以试听、拖动滑块，或从八个变体中挑一个，你的改动智能体也能看到。满意后，导出 WAV，或为视频生成一整条打字音轨。

- 描述一个声音（“更柔和”“更有木头感”“像真键盘一样”），智能体就会把它做出来，你不用写任何音频代码。
- 一切实时更新：你或智能体修改时，波形、频谱和响度检查都会随之变化。
- 在你的电脑上生成，无需账号、API 密钥或署名。自带 34 个示例音效（按键、敲击、气泡、提示音）作为起点。

## 快速开始

1. 安装 <a href="https://nodejs.org">Node.js</a> 18 或更高版本。
2. 把 <code>skill/</code> 文件夹复制到智能体的技能文件夹（Claude Code 为 <code>~/.claude/skills/sfx-tool</code>）。
3. 在项目文件夹中打开终端，运行下面的命令。它会创建 <code>sfx/</code> 文件夹，并在浏览器中打开 Studio。
4. 用平常的话告诉智能体，例如<i>“每打一个字加一声柔和的木质点击，一行结束时加一声轻柔的提示音。”</i>新声音会出现在 Studio 里，随时可以微调。

```bash
npx github:OpenRootdev/sfx-tool studio --open
```

## 你需要什么

- Node.js 18 或更高版本，无需安装其他东西。
- 能使用技能并运行命令的 AI 智能体，例如 Claude Code 或 Codex。Studio 也可以单独使用。
- 用来打开 Studio 的浏览器。

## 包含内容

- [`skill/SKILL.md`](https://github.com/OpenRootdev/sfx-tool/blob/main/skill/SKILL.md) · 智能体如何把描述变成声音，以及如何在 Studio 里与你配合。
- [`studio/`](https://github.com/OpenRootdev/sfx-tool/blob/main/studio/) · 试听和调整音效的页面。
- [`bin/sfx-tool.js`](https://github.com/OpenRootdev/sfx-tool/blob/main/bin/sfx-tool.js) · 智能体（或你）运行的命令：生成声音、变体和打字音轨。
- [`src/`](https://github.com/OpenRootdev/sfx-tool/blob/main/src/) · 声音模型和示例音效。

<sub>预览素材在 <a href="https://github.com/OpenRootdev/sfx-tool/tree/assets"><code>assets</code></a> 分支，翻译在 <a href="https://github.com/OpenRootdev/sfx-tool/tree/translations"><code>translations</code></a> 分支，所以 <code>main</code> 只包含工具本身。</sub>

---

<sub>MIT 许可证 · <a href="https://github.com/OpenRootdev">OpenRootdev</a></sub>
