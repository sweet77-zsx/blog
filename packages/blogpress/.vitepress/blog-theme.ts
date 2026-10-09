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
    pageSize: 15
  },
  oml2d: {
    size: { width: 180, height: 180 },
    mobileSize: { width: 110, height: 110 },
    model: [
      {
        path: 'https://registry.npmmirror.com/oml2d-models/latest/files/models/Senko_Normals/senko.model3.json',
        offset: [0, 0.2]
      }
    ]
  },
  authorList: [
    {
      nickname: '去码头整点薯条',
      url: '/aboutme',
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
        title: '简储 — 纯静态 S3 图床',
        description: '纯静态 S3 图床，前端直连 S3 兼容存储（MinIO / 七牛 S3 网关 / AWS S3），拖拽粘贴一键上传图片，本地保存配置，个人自用轻量图床。',
        time: {
          start: '2024'
        },
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
        top: 2,
        title: '校园宿舍零食配送小程序',
        description: '大学生自主创业小卖部送货上门，支持宿舍零食选购、在线下单与极速配送。',
        time: {
          start: '2024'
        },
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
