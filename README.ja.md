<p align="center">
  <img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/logo.svg" width="104" alt="sfx-tool logo">
</p>

<h1 align="center">sfx-tool</h1>

<p align="center">
  AI エージェントのための効果音ワークスペース。音はエージェントが作り、あなたは聴いて整えます。<br>
  <sub>ふつうの言葉で音を頼むと、1秒後には Studio で聴けます。あとは耳で確かめながら仕上げるだけ。すべて自分のパソコンで動きます。</sub>
</p>

<p align="center"><a href="https://github.com/OpenRootdev/sfx-tool#readme">English</a> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.es.md">Español</a> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.de.md">Deutsch</a> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.fr.md">Français</a> · <b>日本語</b> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.zh-CN.md">简体中文</a> · <a href="https://github.com/OpenRootdev/sfx-tool/blob/translations/README.pt-BR.md">Português</a></p>

<p align="center">
  <img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/preview.gif" width="760" alt="sfx-tool Studio の画面。ピッチと長さのスライダーを動かすと波形とスペクトルが変わり、続いて1つの音の8つのバリエーションが表示される">
</p>

<p align="center">
  <a href="https://github.com/OpenRootdev/sfx-tool/releases/latest/download/sfx-tool.zip"><b>ダウンロード</b></a> &nbsp;·&nbsp; <a href="#はじめかた">はじめかた</a> &nbsp;·&nbsp; <a href="https://github.com/OpenRootdev/sfx-tool/blob/main/skill/SKILL.md">エージェント用スキル</a>
</p>

<p align="center">
  <sub>対応</sub><br>
  <img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/brands/claude.svg" height="16" alt="">&nbsp;Claude Code &nbsp;·&nbsp; <picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/brands/openai-dark.svg"><img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/brands/openai.svg" height="16" alt=""></picture>&nbsp;Codex &nbsp;·&nbsp; <img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/brands/nodedotjs.svg" height="16" alt="">&nbsp;Node.js &nbsp;·&nbsp; <img src="https://raw.githubusercontent.com/OpenRootdev/sfx-tool/assets/brands/ffmpeg.svg" height="16" alt="">&nbsp;FFmpeg
</p>

## できること

エージェントは音を小さなレシピファイルとして書き、Studio はファイルが変わった瞬間にそれを再生します。あなたは聴いて、スライダーを動かしたり8つのバリエーションから選んだりでき、その変更はエージェントにも伝わります。納得のいく音になったら、WAV や動画用のタイピング音トラックとして書き出せます。

- 「もっと柔らかく」「もっと木の感じ」「本物のキーボードみたいに」と伝えるだけで、エージェントが音を作ります。音声のコードを書く必要はありません。
- すべてリアルタイム。あなたやエージェントが編集すると、波形・スペクトル・音量チェックがすぐ更新されます。
- 音は自分のパソコンで作られ、アカウントも API キーもクレジット表記も不要。たたき台として34種類のサンプル音（キー音、ノック、ポップ、チャイム）が付いています。

## はじめかた

1. <a href="https://nodejs.org">Node.js</a> 18 以降をインストールします。
2. <code>skill/</code> フォルダーをエージェントのスキルフォルダー（Claude Code なら <code>~/.claude/skills/sfx-tool</code>）にコピーします。
3. プロジェクトのフォルダーでターミナルを開き、下のコマンドを実行します。<code>sfx/</code> フォルダーが作られ、ブラウザで Studio が開きます。
4. エージェントにふつうの言葉で頼みます。例：<i>「1文字打つごとに柔らかい木のクリック音を、行が終わったら控えめなチャイムを付けて」</i> 新しい音が Studio に現れ、すぐに調整できます。

```bash
npx github:OpenRootdev/sfx-tool studio --open
```

## 必要なもの

- Node.js 18 以降。ほかに必要なものはありません。
- スキルを使いコマンドを実行できる AI エージェント（Claude Code や Codex など）。Studio だけでも使えます。
- Studio を開くためのブラウザ。

## 中身

- [`skill/SKILL.md`](https://github.com/OpenRootdev/sfx-tool/blob/main/skill/SKILL.md) · エージェントが説明から音を作り、Studio であなたと一緒に作業するための手順書。
- [`studio/`](https://github.com/OpenRootdev/sfx-tool/blob/main/studio/) · 音を聴いて調整するページ。
- [`bin/sfx-tool.js`](https://github.com/OpenRootdev/sfx-tool/blob/main/bin/sfx-tool.js) · エージェント（またはあなた）が実行するコマンド。音、バリエーション、タイピング音トラックを作ります。
- [`src/`](https://github.com/OpenRootdev/sfx-tool/blob/main/src/) · 音のモデルとサンプル音。

<sub>プレビュー画像は <a href="https://github.com/OpenRootdev/sfx-tool/tree/assets"><code>assets</code></a> ブランチ、翻訳は <a href="https://github.com/OpenRootdev/sfx-tool/tree/translations"><code>translations</code></a> ブランチにあります。<code>main</code> にはツール本体だけが入っています。</sub>

---

<sub>MIT ライセンス · <a href="https://github.com/OpenRootdev">OpenRootdev</a></sub>
