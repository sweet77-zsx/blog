---
description: 介绍如何在存量VitePress中引入使用或者使用主题中的部分功能
readingTime: false
tag:
 - 配置
top: 3
recommend: 2
outline: [2,3]
---
# ⭐️存量VitePress项目中引入

:::tip 本小节主要介绍
1. 如何在已有的VitePress项目中引入主题使用
2. 如何只使用主题中部分能力

依赖管理工具推荐使用 [pnpm](https://pnpm.io/zh/cli/run)
:::
## VitePress 单独引入
### 安装依赖
安装主题
```sh
pnpm add @sugarat/theme
```

安装主题依赖的一些第三方库
```sh
# 内置搜索依赖，如果关闭内置搜索则不需要安装
pnpm add pagefind
```

### 引入主题
① 在配置文件`.vitepress/config.ts` (.js,mts等等均可) 中引入主题配置
```js
import { defineConfig } from 'vitepress'

// 导入生成配置工具方法 // [!code focus]
import { getThemeConfig } from '@sugarat/theme/node' // [!code focus]

// 主题独有配置，所有配置项，详见文档: https://theme.sugarat.top/ // [!code focus]
const blogTheme = getThemeConfig({}) // [!code focus]

export default defineConfig({
  // 继承博客主题配置 // [!code focus]
  extends: blogTheme, // [!code focus]
  // 省略VitePress其他配置
})
```

② 在布局配置文件`.vitepress/theme/index.ts`中引入主题布局
```ts
import BlogTheme from '@sugarat/theme'

export default BlogTheme
```

此时启动项目就可以看见初步的效果了

![](https://img.cdn.sugarat.top/mdImg/MTY5NTk5NjYzMDU5MQ==695996630591~fmt.webp)


## 只使用部分能力
可能主题内置的一些功能并不是你想要的，或者首页你不喜欢，你就想用图片预览，公告栏等能力，这时候就可以只使用部分能力

### 关闭一些功能
```ts
getThemeConfig({
  // 关闭博客模式
  blog: false,
  // 关闭内置搜索
  search: false,
  article: {
    // 不展示阅读时间
    readingTime: false,
  }
})
```

一些例如背景图等样式可以参考[🔧 主题配置 - 样式配置](./style.md) 进行修改

### 开启一些功能
详细的功能参考[主题配置相关文档](https://theme.sugarat.top/?tag=%E9%85%8D%E7%BD%AE&type=info)
```ts
getThemeConfig({
  // 页脚
  footer: {
    // message: '下面 的内容和图标都是可以修改的噢（当然本条内容也是可以隐藏的）',
    copyright: 'MIT License | 去码头整点薯条',
    // icpRecord: {
    //   name: '鄂ICP备2026000700号',
    //   link: 'https://beian.miit.gov.cn/'
    // },
    // securityRecord: {
    //   name: '公网安备xxxxx',
    //   link: 'https://www.beian.gov.cn/portal/index.do'
    // },
  },

  // 公告
  popover: {
    title: '公告',
    body: [
      { type: 'text', content: '👇公众号👇---👇 微信 👇' },
      {
        type: 'image',
        src: 'https://img.cdn.sugarat.top/mdImg/MTYxNTAxODc2NTIxMA==615018765210~fmt.webp'
      },
      {
        type: 'text',
        content: '欢迎大家加群&私信交流'
      },
      {
        type: 'text',
        content: '文章首/文尾有群二维码',
        style: 'padding-top:0'
      },
      {
        type: 'button',
        content: '作者博客',
        link: 'https://sugarat.top'
      },
      {
        type: 'button',
        content: '加群交流',
        props: {
          type: 'success'
        },
        link: 'https://theme.sugarat.top/group.html',
      }
    ],
    duration: 0
  },
})
```

## 最后
如有不满足的诉求，欢迎右上角公告加群交流。