import { defineConfig } from 'vitepress'
import llmstxt, { copyOrDownloadAsMarkdownButtons } from 'vitepress-plugin-llms'
import { blogTheme } from './blog-theme.ts'

export default defineConfig({
  extends: blogTheme,
  srcExclude: ['CHANGELOG.md', 'redirect-tag.md'],
  markdown: {
    image: {
      lazyLoad: true
    },
    config(md) {
      md.use(copyOrDownloadAsMarkdownButtons)
    }
  },
  ignoreDeadLinks: true,
  sitemap: {
    hostname: 'https://sugarat.top',
  },
  lang: 'zh-cn',
  title: '去码头整点薯条',
  description:
    '去码头整点薯条的个人博客，记录随笔与学习笔记，大前端相关的知识，高频面试题，个人面经等',
  head: [
    ['meta', { name: 'theme-color', content: '#ffffff' }],
    ['link', { rel: 'icon', href: '/favicon.ico', type: 'image/png' }],
    [
      'link',
      {
        rel: 'alternate icon',
        href: '/favicon.ico',
        type: 'image/png',
        sizes: '16x16'
      }
    ],
    ['meta', { name: 'author', content: '去码头整点薯条' }],
    ['link', { rel: 'mask-icon', href: '/favicon.ico', color: '#ffffff' }],
    [
      'link',
      { rel: 'apple-touch-icon', href: '/favicon.ico', sizes: '180x180' }
    ],
  ],
  vite: {
    plugins: [
      // 生成 llms.txt / llms-full.txt 以及每个页面的 Markdown 版本
      // https://github.com/okineadev/vitepress-plugin-llms
      llmstxt({
        domain: 'https://sugarat.top'
      })
    ]
  },
  vue: {
    template: {
      compilerOptions: {
        // https://github.com/vuejs/vitepress/discussions/468
        isCustomElement: (tag) => {
          return ['center'].includes(tag.toLocaleLowerCase())
        }
      }
    }
  },
  lastUpdated: true,
  themeConfig: {
    outline: {
      level: [2, 3],
      label: '目录'
    },
    // 页面「复制/下载 Markdown」按钮文案
    llms: {
      copyText: '复制本页',
      copiedText: '已复制',
      viewMarkdownText: '查看 Markdown',
      openInAIText: '在 {provider} 中打开'
    },
    // search: {
    //   provider: 'algolia',
    //   options: {
    //     appId: 'F919JCK8WY',
    //     apiKey: '3eca209ad24bdfc26db63382dd5e4490',
    //     indexName: 'sugarat_top',
    //     placeholder: '请输入要搜索的内容...'
    //   }
    // },
    lastUpdated: {
      text: '上次更新于',
    },
    logo: '/logo.png',
    // editLink: {
    //   pattern:
    //     'https://github.com/ATQQ/sugar-blog/tree/master/packages/blogpress/:path',
    //   text: '去 GitHub 上编辑内容'
    // },
    nav: [
      {
        text: '首页',
        link: '/'
      },
      {
        text: '文章',
        link: '/posts/',
        activeMatch: '^/posts/'
      },
      {
        text: '作品',
        link: '/work',
        activeMatch: '^/work'
      },
      {
        text: '关于我',
        link: '/aboutme'
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/sweet77-zsx' },
      {
        icon: {
          svg: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="4" fill="#FC5531"/><text x="50%" y="54%" dominant-baseline="central" text-anchor="middle" fill="#FFFFFF" font-family="-apple-system,BlinkMacSystemFont,PingFang SC,sans-serif" font-size="7" font-weight="900">CSDN</text></svg>'
        },
        link: 'https://blog.csdn.net/m0_73774439',
        ariaLabel: 'CSDN'
      }
    ]
  }
})
