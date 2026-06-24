# 彩虹任务岛

一年级语文、数学、英语的手机端 PWA 学习小游戏。

## 本地运行

```bash
npm install
npm run dev
```

## 构建检查

```bash
npm run lint
npm run build
```

## 长期免费发布

项目已经配置 GitHub Pages 自动发布。仓库推送到 GitHub 的 `main` 分支后，GitHub Actions 会构建 `dist` 并发布到：

```text
https://<github-username>.github.io/rainbow-quest-island/
```

首次发布后，在 iPhone Safari 打开该地址即可直接使用。需要桌面图标时，可在 Safari 中使用“分享”里的“添加到主屏幕”；iOS 不允许网页或电脑远程替用户自动添加。
