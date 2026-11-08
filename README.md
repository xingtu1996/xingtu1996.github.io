# 行途 XingTu · GitHub Pages 公开名片

本仓库维护 GitHub Pages 的轻量公开入口，品牌名称为 **行途 XingTu**（公众号：「行途技术手记」）。这里不是全量项目的权威目录，也不承载内部工程资料。

## 三个入口的职责

| 入口 | 地址 | 用途 |
| --- | --- | --- |
| GitHub Profile | https://github.com/xingtu1996 | 对外开源导航 |
| GitHub Pages（本仓） | https://xingtu1996.github.io | 轻量名片、文章导航、独立展示页 |
| 作品集站 | https://xingtu1996.pages.dev | 完整的文章/项目展示；发布状态需单独核验 |

**公开项目的统一清单**：[xingtu1996/OPEN_SOURCE_MATRIX.md](https://github.com/xingtu1996/xingtu1996/blob/main/OPEN_SOURCE_MATRIX.md)。

## 本仓内容

- `index.html`：品牌名片与精选入口。
- `articles.html`：文章星图，公开文章详情最终以 [xingtu-articles](https://github.com/xingtu1996/xingtu-articles) 及其原始发布链接为准。
- `ai-role-card.html`、`self-check-card.html`：独立展示页；页面中的观点和示例需单独维护。
- `assets/` 与静态图标：本站自有视觉资源。

## 维护和发布边界

1. 页面仅展示已经公开、经过脱敏核验的名称、案例与链接。**不展示私人邮箱、电话、真实姓名、雇主、客户识别信息或未授权证据**。
2. 任何改动先走分支和 PR；审核通过后再合并。代码合并不等于已确认 GitHub Pages/CDN 实际更新，需核对 Pages 部署结果与线上链接。
3. 文章、项目数字、技能数、运行状态等易过期信息优先链接权威仓库，不在三处入口长期手工复制。
4. 发现公开历史提交里有个人信息时，先删除当前展示入口并记录风险；**历史记录与缓存需单独评估和处理**，不要擅自强推重写历史。
5. 本站不负责 Cloudflare Pages 的构建与配置；两个站点的内容同步要通过明确的发布检查单进行。

## 快速本地预览

```bash
python3 -m http.server 8000
```

> 目前这次矩阵治理只涉及公开名片源码与文档。不要把 PR 提交等同于线上版本已更新。
