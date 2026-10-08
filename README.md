<h1 align="center"> 去码头整点薯条 </h1>
<p align="center">你的指尖,拥有改变世界的力量</p>
<p align="center">博客主题：<a href="https://theme.sugarat.top/" target="_blank">@sugarat/theme</a></p>
<p align="center">
    <a href="https://github.com/ATQQ/vitepress-blog-sugar-template" target="_blank">主题示例仓库</a> | <a href="https://github.com/ATQQ/vitepress-plugins-tests" target="_blank">插件测试仓库</a>
</p>

## 仓库介绍

这是一个 monorepo 仓库，包含如下内容
* [blogpress](./packages/blogpress/)：博客内容本身
* [@sugarat/theme](./packages/theme/)：博客分离出的通用 `VitePress` 主题
* [@sugarat/theme-shared](./packages/shared/)：`VitePress` 主题相关的工具方法
* [@sugarat/create-theme](./packages/create-theme/)：用于快速创建和作者一样风格的博客
* VitePress 插件相关：
  * [vitepress-plugin-image-preview](./packages/vitepress-plugin-image-preview/)：为 `VitePress` 站点添加图片预览功能。
  * [vitepress-plugin-pagefind](./packages/vitepress-plugin-pagefind/)：基于 pagefind 实现的 `VitePress` 离线全文搜索支持插件
  * [vitepress-plugin-rss](./packages/vitepress-plugin-rss/)：基于 feed 实现的 `VitePress` RSS 支持插件
  * [vitepress-plugin-51la](./packages/vitepress-plugin-51la/)：为 `VitePress` 站点引入 [51.la](https://v6.51.la/) 的网站数据统计能力。
  * [vitepress-plugin-announcement](./packages/vitepress-plugin-announcement/)：为 `VitePress` 创建一个全局公告窗口。
  * [vitepress-plugin-artalk](./packages/vitepress-plugin-artalk/)：为 `VitePress` 站点引入 [Artalk](https://artalk.js.org/) 的评论系统。
  * [vitepress-plugin-giscus](./packages/vitepress-plugin-giscus/)：为 `VitePress` 站点引入 [Giscus](https://giscus.app/) 的评论系统。
  * [vitepress-plugin-back2top](./packages/vitepress-plugin-back2top/)：为 `VitePress` 站点添加返回顶部按钮。
  * [vitepress-plugin-product-card](./packages/vitepress-plugin-product-card/)：为 `VitePress` 站点添加产品/项目/作品卡片组件。
  * [vitepress-plugin-slot-inject-template](./template/vitepress-plugin-slot-inject-template/)：`VitePress` 插件开发模板。

## 快速创建博客模板
支持多种包管理工具
```sh
# With PNPM:
pnpm create @sugarat/theme

# With NPM:
npm create @sugarat/theme@latest

# With Yarn:
yarn create @sugarat/theme

# With Bun
bun create @sugarat/theme
```
## 运行本项目
这是一个 monorepo 仓库，博客基于[vitepress](https://vitepress.dev/)搭建，运行前需先安装依赖，构建主题包

① 先安装 `pnpm`
```sh
npm i -g pnpm
# 安装依赖
pnpm install
```

② 构建依赖包的npm包
```sh
pnpm buildlib
```

③ 运行
```sh
# 运行博客
pnpm dev

# 运行主题包文档
pnpm dev:theme
```

## :pencil:关于内容
大前端开发相关知识，包含但不限于前端

记录面试中所遇的问题，并整理相关知识点，分模块进行了梳理

## :heart: 致谢与原作者

本项目基于原作者优秀的开源博客项目进行二次开发与个性化定制。

在此特别鸣谢原作者 [@ATQQ](https://github.com/ATQQ) 开源的现代化 VitePress 博客系统及 [@sugarat/theme](https://theme.sugarat.top/) 插件生态！

* **原作者**：[ATQQ (大粽子)](https://github.com/ATQQ)
* **原作者仓库**：[https://github.com/ATQQ/sugar-blog](https://github.com/ATQQ/sugar-blog)
* **主题官方文档**：[https://theme.sugarat.top/](https://theme.sugarat.top/)