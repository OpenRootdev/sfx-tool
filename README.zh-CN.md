<p align="center">
  <img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/logo.svg" width="104" alt="sfx-tool logo">
</p>

<h1 align="center">sfx-tool</h1>

<p align="center">
  为视频准备的轻柔、安静的打字声和界面音效，全部在你自己的电脑上生成。<br>
  <sub>一个用来试听和调整音效的小工作室，外加一条把文字直接变成打字音轨的命令。</sub>
</p>

<p align="center"><a href="https://github.com/OpenRootdev/sfx-tool#readme">English</a> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.es.md">Español</a> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.de.md">Deutsch</a> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.fr.md">Français</a> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.ja.md">日本語</a> · <b>简体中文</b> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.pt-BR.md">Português</a></p>

<p align="center">
  <img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/preview.gif" width="760" alt="sfx-tool Studio：拖动音高和长度滑块时，波形和频谱随之变化，随后显示木头敲击声的八个变体">
</p>

<p align="center">
  <a href="https://github.com/OpenRootdev/sfx-tool/releases/latest/download/sfx-tool.zip"><b>下载</b></a> &nbsp;·&nbsp; <a href="#快速开始">快速开始</a> &nbsp;·&nbsp; <a href="https://github.com/OpenRootdev/sfx-tool/blob/main/skill/SKILL.md">智能体技能</a>
</p>

<p align="center">
  <sub>适用于</sub><br>
  <img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/brands/nodedotjs.svg" height="16" alt="">&nbsp;Node.js &nbsp;·&nbsp; <img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/brands/claude.svg" height="16" alt="">&nbsp;Claude Code &nbsp;·&nbsp; <picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/brands/openai-dark.svg"><img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/brands/openai.svg" height="16" alt=""></picture>&nbsp;Codex &nbsp;·&nbsp; <img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/brands/ffmpeg.svg" height="16" alt="">&nbsp;FFmpeg
</p>

## 它能做什么

sfx-tool 自带 34 种柔和的音效：闷声按键、低沉的 thock、木头敲击、毛毡轻敲、键帽声、气泡声，以及一声轻轻的“完成”提示音。打开 Studio 试听，拖动滑块修改音色，还能把任意文字变成可以直接放进视频的打字音轨。

- 刻意做得很安静，垫在音乐和人声下面，不会抢戏。
- 每一次按键都略有不同，听起来绝不像循环。
- 无需账号、无需 API 密钥、无需署名：所有声音都在你的电脑上生成。

## 快速开始

1. 安装 <a href="https://nodejs.org">Node.js</a> 18 或更高版本。
2. 在视频项目文件夹中打开终端，运行下面的命令。它会创建一个包含全部 34 种音效的 <code>sfx/</code> 文件夹，并在浏览器中打开 Studio。
3. 可选：把 <code>skill/</code> 文件夹复制到智能体的技能文件夹（Claude Code 为 <code>~/.claude/skills/sfx-tool</code>），然后用平常的话提出需求，例如<i>“给终端那一幕加上轻柔的打字声。”</i>

```bash
npx github:OpenRootdev/sfx-tool studio --open
```

## 你需要什么

- Node.js 18 或更高版本，无需安装其他东西。
- 用来打开 Studio 的浏览器。
- 能导入 WAV 文件的视频工具：HyperFrames、Remotion、FFmpeg 或任意剪辑软件。

## 包含内容

- [`studio/`](https://github.com/OpenRootdev/sfx-tool/blob/main/studio/) · 试听和调整音效的页面。
- [`bin/sfx-tool.js`](https://github.com/OpenRootdev/sfx-tool/blob/main/bin/sfx-tool.js) · 命令行：打开 Studio、新建音效、生成打字音轨。
- [`src/`](https://github.com/OpenRootdev/sfx-tool/blob/main/src/) · 音效配方和生成它们的代码。
- [`skill/SKILL.md`](https://github.com/OpenRootdev/sfx-tool/blob/main/skill/SKILL.md) · 让 AI 智能体和你一起制作、调整音效的说明。

<sub>预览素材在 <a href="https://github.com/OpenRootdev/sfx-tool/tree/assets"><code>assets</code></a> 分支，翻译在 <a href="https://github.com/OpenRootdev/sfx-tool/tree/translations"><code>translations</code></a> 分支，所以 <code>main</code> 只包含工具本身。</sub>

---

<sub>MIT 许可证 · <a href="https://github.com/OpenRootdev">OpenRootdev</a></sub>
