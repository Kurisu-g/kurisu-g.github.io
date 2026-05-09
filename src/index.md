---
layout: home

hero:
  name: "许定真的博客"
  text: "技术、生活与思考"
  tagline: "记录一些小事，分享个人生活小经历"
  actions:
    - theme: brand
      text: 阅读文章
      link: /posts/
    - theme: alt
      text: 关于我
      link: /about
---

<script setup>
import { data } from './posts.data.js'
</script>

## 最新文章

<PostList :posts="data.slice(0, 5)" />
