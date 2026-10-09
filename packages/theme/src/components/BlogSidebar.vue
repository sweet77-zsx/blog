<script lang="ts" setup>
import { computed } from 'vue'
import { useRecommendConfig, useShowRecommend } from '../composables/config/blog'
import BlogRecommendArticle from './BlogRecommendArticle.vue'

const recommend = useRecommendConfig()
const show = useShowRecommend()
const sidebarStyle = computed(() =>
  recommend.value?.style || 'sidebar'
)
</script>

<template>
  <div v-if="show" class="sidebar" :class="{ card: sidebarStyle === 'card' }" data-pagefind-ignore="all">
    <BlogRecommendArticle />
  </div>
</template>

<style scoped>
.sidebar {
  margin-top: 0;
}
.sidebar.card {
  margin-top: 0;
}
</style>
