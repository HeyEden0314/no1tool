# no1tool

中文 AI 工具导航。线上地址：[https://www.no1tool.com/](https://www.no1tool.com/)（与 [https://no1tool.vercel.app/](https://no1tool.vercel.app/) 同一份静态部署）。

本仓库是纯静态站点：`index.html` / `list.html` / `tools/*.html` + `app.js` / `list.js` + `style.css` + `data.json` + `images/`。没有框架。改完 `data.json` 后运行：

```bash
python3 scripts/build_pages.py
```

会为每条 `published` 工具生成 `tools/{slug}.html`，并更新 `sitemap.xml`。

## 如何改数据

工具列表全部在根目录的 `data.json`。每条字段：

```json
{
  "title": "工具名称",
  "subtitle": "一句话简介",
  "href": "https://example.com",
  "img": "images/001-example.png",
  "category": "AI开发",
  "status": "published",
  "slug": "001-example"
}
```

`slug` 由 `python3 scripts/build_pages.py` 根据封面文件名生成，详情页地址是 `/tools/{slug}.html`。

`category` 必须是首页芯片之一：AI写作、AI图像、AI视频、AI办公、AI聊天、AI开发、AI音频、AI内容、AI学习、AI搜索。列表页按该字段筛选。

`status` 为 `unpublished` 的条目不会出现在站点上（外链未核实等）。投稿请用 GitHub Issue 模板「提交工具」。

1. 直接编辑 `data.json`（保持 UTF-8、合法 JSON）。
2. 封面放到 `images/`，`img` 写成相对路径，例如 `images/401-new-tool.png`。缺图时列表页会回退到 `images/placeholder.svg`。
3. 本地预览：

```bash
python3 -m http.server 8080
```

打开 http://127.0.0.1:8080/ 看首页，http://127.0.0.1:8080/list.html 看全部工具，详情页例如 http://127.0.0.1:8080/tools/001-muset.html 。

抓取封面的脚本在 `scripts/download_images.py`，不要放到站点根目录，也不要当成线上接口。

## 部署到 Vercel

站点托管在 **Vercel**（不是 GitHub Pages）。根目录即静态资源，无需 Framework Preset / 构建命令。

1. 在 [Vercel](https://vercel.com/) 导入本 GitHub 仓库 `HeyEden0314/no1tool`。
2. Framework Preset 选 Other；Build Command 留空；Output Directory 留空（发布仓库根目录）。
3. 生产域名指向 `www.no1tool.com`。推送 `main` 后由 Vercel 自动发布。

本地可用 `npx vercel` 做预览部署；不要把 GitHub Pages 或 `CNAME` 当成当前托管方式。仓库里的 `CNAME` 只是线上遗留文件，保留以便与现网一致。

## 许可证

MIT License
