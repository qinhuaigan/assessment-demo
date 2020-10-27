<template lang="html">
  <div id="authority">
    <el-tree :check-on-click-node="true" ref="authorityTreeNode" :default-expand-all="true" :data="authorityData" :props="defaultProps" :node-key="nodeKey" :default-checked-keys="defaultChecked" :show-checkbox="true"></el-tree>
  </div>
</template>

<script>
export default {
  name: 'authority',
  components: {

  },
  props: ['authorityData', 'nodeKey', 'defaultChecked'],
  data () {
    return {
      defaultProps: {
        children: 'children',
        label: 'label'
      }
    }
  },
  methods: {
    getSelectedNodes () { // 获取选中的节点 key
      const keys = this.$refs.authorityTreeNode.getCheckedKeys()
      return keys || []
    }
  },
  created () {

  }
}
</script>

<style lang="css" scoped>
</style>
