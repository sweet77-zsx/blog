---
title: 页面跳转中
publish: false
recommend: false
pagefind-indexed: false
---

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vitepress'
const router = useRouter()
onMounted(() => {
  router.go('/posts/')
})
</script>

正在前往 [文章列表](/posts/)...
