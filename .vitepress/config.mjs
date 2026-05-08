import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "许定真的博客",
  description: "记录一些小事，分享个人生活小经历",
  lang: 'zh-CN',

  srcDir: 'src',
  cleanUrls: true,
  base: '/',

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
  ],

  themeConfig: {
    siteTitle: '许定真的博客',

    nav: [
      { text: '首页', link: '/' },
      { text: '文章', link: '/posts/' },
      { text: '关于', link: '/about' },
      { text: '管理', link: '/admin' },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Kurisu-g' },
    ],

    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索文章', buttonAriaLabel: '搜索博客文章' },
          modal: { noResultsText: '没有找到相关文章' },
        },
      },
    },

    footer: {
      message: '基于 VitePress 构建',
      copyright: '许定真 2026',
    },

    lastUpdated: {
      text: '最后更新于',
    },

    docFooter: {
      prev: '上一篇',
      next: '下一篇',
    },

    darkModeSwitchLabel: '主题切换',
    sidebarMenuLabel: '菜单',
    returnToTopLabel: '回到顶部',
  },
})
