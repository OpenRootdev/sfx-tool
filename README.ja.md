<p align="center">
  <img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/logo.svg" width="104" alt="sfx-tool logo">
</p>

<h1 align="center">sfx-tool</h1>

<p align="center">
  動画向けの、やわらかく控えめなタイピング音と UI 効果音。すべて自分のパソコンで作れます。<br>
  <sub>音を聴いて調整できる小さなスタジオと、入力したテキストをそのままタイピング音のトラックにするコマンドのセットです。</sub>
</p>

<p align="center"><a href="https://github.com/OpenRootdev/sfx-tool#readme">English</a> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.es.md">Español</a> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.de.md">Deutsch</a> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.fr.md">Français</a> · <b>日本語</b> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.zh-CN.md">简体中文</a> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.pt-BR.md">Português</a></p>

<p align="center">
  <img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/preview.gif" width="760" alt="sfx-tool Studio の画面。ピッチと長さのスライダーを動かすと波形とスペクトルが変わり、続いて木を叩く音の8つのバリエーションが表示される">
</p>

<p align="center">
  <a href="https://github.com/OpenRootdev/sfx-tool/releases/latest/download/sfx-tool.zip"><b>ダウンロード</b></a> &nbsp;·&nbsp; <a href="#はじめかた">はじめかた</a> &nbsp;·&nbsp; <a href="https://github.com/OpenRootdev/sfx-tool/blob/main/skill/SKILL.md">エージェント用スキル</a>
</p>

<p align="center">
  <sub>対応</sub><br>
  <img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/brands/nodedotjs.svg" height="16" alt="">&nbsp;Node.js &nbsp;·&nbsp; <img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/brands/claude.svg" height="16" alt="">&nbsp;Claude Code &nbsp;·&nbsp; <picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/brands/openai-dark.svg"><img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/brands/openai.svg" height="16" alt=""></picture>&nbsp;Codex &nbsp;·&nbsp; <img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/brands/ffmpeg.svg" height="16" alt="">&nbsp;FFmpeg
</p>

## できること

sfx-tool には34種類のやさしい音が入っています。こもったキー音、低いソック音、木を叩く音、フェルトのタップ、キーキャップ、泡がはじける音、そして控えめな「完了」チャイム。Studio で聴き、スライダーで音を変え、どんなテキストでも動画に重ねられるタイピング音のトラックにできます。

- わざと小さめの音量なので、音楽やナレーションの邪魔をしません。
- 1打ごとに少しずつ違う音になるので、ループのように聞こえません。
- アカウントも API キーもクレジット表記も不要。音はすべてあなたのパソコンで作られます。

## はじめかた

1. <a href="https://nodejs.org">Node.js</a> 18 以降をインストールします。
2. 動画プロジェクトのフォルダーでターミナルを開き、下のコマンドを実行します。34種類の音が入った <code>sfx/</code> フォルダーが作られ、ブラウザで Studio が開きます。
3. 任意：<code>skill/</code> フォルダーをエージェントのスキルフォルダー（Claude Code なら <code>~/.claude/skills/sfx-tool</code>）にコピーし、ふつうの言葉で頼みます。例：<i>「ターミナルの場面にやわらかいタイピング音を付けて」</i>

```bash
npx github:OpenRootdev/sfx-tool studio --open
```

## 必要なもの

- Node.js 18 以降。ほかに必要なものはありません。
- Studio を開くためのブラウザ。
- WAV ファイルを読み込める動画ツール（HyperFrames、Remotion、FFmpeg、または任意の編集ソフト）。

## 中身

- [`studio/`](https://github.com/OpenRootdev/sfx-tool/blob/main/studio/) · 音を聴いて調整するページ。
- [`bin/sfx-tool.js`](https://github.com/OpenRootdev/sfx-tool/blob/main/bin/sfx-tool.js) · コマンド本体。Studio を開く、新しい音を作る、タイピング音のトラックを作る。
- [`src/`](https://github.com/OpenRootdev/sfx-tool/blob/main/src/) · 音のレシピと、それを鳴らすコード。
- [`skill/SKILL.md`](https://github.com/OpenRootdev/sfx-tool/blob/main/skill/SKILL.md) · AI エージェントが一緒に音を作って調整するための手順書。

<sub>プレビュー画像は <a href="https://github.com/OpenRootdev/sfx-tool/tree/assets"><code>assets</code></a> ブランチ、翻訳は <a href="https://github.com/OpenRootdev/sfx-tool/tree/translations"><code>translations</code></a> ブランチにあります。<code>main</code> にはツール本体だけが入っています。</sub>

---

<sub>MIT ライセンス · <a href="https://github.com/OpenRootdev">OpenRootdev</a></sub>
