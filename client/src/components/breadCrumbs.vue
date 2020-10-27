<template lang="html">
  <div class="breadCrumbsContent" v-if="breadData && breadData.length > 0">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item v-if="item.path" v-for="(item, index) in breadData" :key="`${item.path}_${index}`" :to="{ path: item.path }">{{item.name}}</el-breadcrumb-item>
      <el-breadcrumb-item v-else :key="`${item.path}_${index}`">{{item.name}}</el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script>
export default {
  name: 'breadCrumbs',
  props: ['breadcrumbData'],
  components: {

  },
  data () {
    return {
      breadData: []
    }
  },
  watch: {
    '$route': 'routeChange',
    breadcrumbData () {
      this.breadData = this.breadcrumbData
    }
  },
  methods: {
    routeChange () {
      if (this.breadcrumbData) {
        return
      }
      this.breadData = this.globalData.breadCrumbsConfig[this.$route.path] || []
    }
  },
  created () {
    this.breadData = this.breadcrumbData
    this.routeChange()
  }
}
</script>

<style lang="css" scoped>
  .breadCrumbsContent {
    border-bottom: 1px solid #C5C5C5;
    padding-bottom: 10px;
  }
</style>
