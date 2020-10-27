<template lang="html">
  <div class="mt20px text-right">
    <el-pagination
      background
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="current"
      :page-sizes="[5, 10, 20, 100, 200]"
      :page-size="pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      :pager-count="5">
    </el-pagination>
  </div>
</template>

<script>
export default {
  name: 'pagination',
  props: ['pageSize', 'total', 'currentPage'],
  data () {
    return {
      current: this.currentPage || 1,
      size: this.pageSize || 10
    }
  },
  watch: {
    currentPage (val) {
      this.current = val
    },
    pageSize (val) {
      this.size = val
    }
  },
  methods: {
    handleSizeChange (val) {
      this.size = val
      this.current = 1
      this.change(this.current, this.size)
    },
    handleCurrentChange (val) {
      this.current = val
      this.change(this.current, this.size)
    },
    change (currentPage, pageSize) {
      this.$emit('change', currentPage, pageSize)
    }
  },
  created () {

  }
}
</script>

<style lang="css" scoped>
</style>
