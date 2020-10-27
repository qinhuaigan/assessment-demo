<template lang="html">
  <div class="batchEntryResult">
    <el-dialog :closeOnClickModal='false' :title="`导入结果（${dialogTitle}）`" :visible.sync="dialogVisible" width="80%">
      <div class="">
        <span>本次导入的结果：</span>
        <span>共导入</span>
        <span class="fz18px">{{((totalSuccess || 0) + tableData.length) || 0}}</span>
        <span>条，其中成功导入</span>
        <span class="fz18px successColor">{{totalSuccess || 0}}</span>
        <span>条数据，失败</span>
        <span class="fz18px failColor">{{tableData.length || 0}}</span>
        <span>条数据</span>
      </div>
      <div class="clearfix">
        <div class="fl lineHeight32px">导入结果</div>
        <div class="fr">
          <el-button size="small" type="primary" @click="downBatchEntryResult()">导出数据</el-button>
        </div>
      </div>
      <div class="mt20px">
        <tableList :titles="titles" :tableData="tableData"></tableList>
      </div>
    </el-dialog>
    <!-- 导出 excel 组件 -->
    <downLoadExcel ref="downLoadExcel" :sheetName="sheetName" :filename="filename" :tableTitle="titles" :tableData="tableData"></downLoadExcel>
  </div>
</template>

<script>
import tableList from './tableList'
import downLoadExcel from './downLoadExcel'
export default {
  /*
  说明：所有 '批量导入' 通用模块
  tableData：导入结果弹框的列表数据，跟 tableList 组件的数据类型、用法一样
  titles：导入结果弹框列表的表头，跟 tableList 组件的数据类型、用法一样
  total: 共导入的数据条数
  totalSuccess：共成功导入的数据条数
  totalFail：导入失败的数据条数
  downloadURL：导出数据的请求 url
  open()：调用本组件的 open() 函数，可以打开导入结果弹框
  */
  name: 'batchEntryResult',
  props: ['tableData', 'titles', 'total', 'totalSuccess', 'totalFail', 'downloadURL', 'dialogTitle', 'filename',
    'sheetName'
  ],
  components: {
    tableList,
    downLoadExcel
  },
  data () {
    return {
      dialogVisible: false
    }
  },
  methods: {
    open () {
      this.dialogVisible = true
    },
    downBatchEntryResult () {
      this.$refs.downLoadExcel.download()
    }
  }
}
</script>

<style lang="css" scoped>
</style>
