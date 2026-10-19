import { getThemeConfig } from '@sugarat/theme/node'
import type { Theme } from '@sugarat/theme'

const baseUrl = 'https://sugarat.top'

export const blogTheme = getThemeConfig({
  tabs: false,
  mermaid: false,
  timeline: false,
  themeColor: 'el-blue',
  author: '去码头整点薯条',
  // 评论配置示例（如需开启 Giscus 评论，可填入自己的仓库信息）
  // comment: {
  //   repo: 'owner/repo',
  //   repoId: '',
  //   category: 'Announcements',
  //   categoryId: '',
  //   inputPosition: 'top'
  // },
  search: {
    showDate: true,
    pageResultCount: 4
  },
  recommend: {
    showSelf: true,
    nextText: '下一页',
    style: 'sidebar',
    pageSize: 11
  },
  oml2d: {
    size: { width: 180, height: 180 },
    mobileSize: { width: 110, height: 110 },
    model: [
      {
        path: '/models/senko/senko.model3.json',
        offset: [0, 0.2]
      }
    ]
  },
  authorList: [
    {
      nickname: '去码头整点薯条',
      url: '/aboutme.html',
      des: '你的指尖,拥有改变世界的力量'
    }
  ],
  footer: {
    copyright: `去码头整点薯条 2024 - ${new Date().getFullYear()}`,
  },
  hotArticle: {
    pageSize: 12
  },
  works: {
    title: '个人作品展示',
    description: '独立开发与开源项目展示',
    topTitle: '精选开源项目',
    list: [
      {
        top: 1,
        title: '心愿纪 (WishCraft) — 在线生日贺卡互动工坊',
        description: '温暖明亮声光动效专属生日贺卡定制工坊。支持5大独立互动主题（吹蜡烛/放烟花/热气球/礼物盒/许愿瓶），仿真火漆拆信动效与八音盒旋律，一键导出纯单文件 HTML 或微信分享短链。',
        time: {
          start: '2026'
        },
        cover: '/logos/wishcraft.png',
        github: {
          owner: 'sweet77-zsx',
          repo: 'WishCraft'
        },
        status: {
          text: '开源项目',
          type: 'tip'
        },
        url: 'https://github.com/sweet77-zsx/WishCraft',
        tags: ['互动贺卡', '单文件HTML', '声光动效', '创意前端']
      },
      {
        top: 2,
        title: '轻匣 (SnapBox) — 纯前端现代化开发者工具箱',
        description: '极简轻量、隐私至上的纯前端现代化开发者工具箱，集成 XML 转义格式化、JSON 解析校验、JWT 编解码等高频开发工具，纯本地运行，零依赖离线可用。',
        time: {
          start: '2026'
        },
        cover: '/logos/snapbox.png',
        github: {
          owner: 'sweet77-zsx',
          repo: 'SnapBox'
        },
        status: {
          text: '开源项目',
          type: 'tip'
        },
        url: 'https://github.com/sweet77-zsx/SnapBox',
        tags: ['开发者工具', '纯前端', '离线可用', '隐私至上']
      },
      {
        top: 3,
        title: 'sugar-blog — VitePress 现代博客生态主题',
        description: '基于 VitePress 的现代化全栈开源博客生态主题框架，集成开箱即用的技术文档与个人博客系统、离线 Pagefind 全文检索、Live2D 桌宠及多款官方生态插件，参与开源贡献与 Pull Request。',
        time: {
          start: '2026'
        },
        cover: '/logos/sugar-blog.png',
        github: {
          owner: 'sweet77-zsx',
          repo: 'sugar-blog'
        },
        status: {
          text: '开源贡献',
          type: 'tip'
        },
        url: 'https://github.com/sweet77-zsx/sugar-blog',
        tags: ['VitePress', '博客主题', '开源贡献', 'Vue3']
      },
      {
        top: 4,
        title: '简储 — 纯静态 S3 图床',
        description: '纯静态 S3 图床，前端直连 S3 兼容存储（MinIO / 七牛 S3 网关 / AWS S3），拖拽粘贴一键上传图片，本地保存配置，个人自用轻量图床。',
        time: {
          start: '2024'
        },
        cover: '/logos/jianchu.png',
        github: {
          owner: 'sweet77-zsx',
          repo: 'jianchu-imagebed'
        },
        status: {
          text: '开源项目',
          type: 'tip'
        },
        url: 'https://github.com/sweet77-zsx/jianchu-imagebed',
        tags: ['纯静态', 'S3 图床', 'MinIO', 'AWS S3']
      },
      {
        top: 5,
        title: '校园宿舍零食配送小程序',
        description: '大学生自主创业小卖部送货上门，支持宿舍零食选购、在线下单与极速配送。',
        time: {
          start: '2024'
        },
        cover: '/logos/sshop.png',
        github: {
          owner: 'sweet77-zsx',
          repo: 'sshop'
        },
        status: {
          text: '开源项目',
          type: 'tip'
        },
        url: 'https://github.com/sweet77-zsx/sshop',
        tags: ['微信小程序', '电商配送', '校园创业', '送货上门']
      }
    ]
  }
})
