<template lang="html">
  <div class="tableWrap" hidden>
    <table :id="1">
      <tr>
        <td v-for="(title, i) in tableTitle" :key="`${title.label}_${i}`">{{title.label}}</td>
      </tr>
      <tr v-for="(item, i) in tableData" :key="i">
        <td v-for="(t, j) in tableTitle" :key="`${t.prop}_${j}`">{{item[t.prop]}}</td>
      </tr>
    </table>
  </div>
</template>
<script>
/*
  download() 说明:
    1、调用此函数可以导出 excel 表格
    2、接收参数:
       title: 表头数组, // 例：
                             title: [{
                               label: '姓名' // 表头名称
                               prop: 'userName', // "姓名" 列的填充值（对应 tableData 中 object 的 'userName' 属性）
                               width: 100, // 改列的宽度，类型为 number
                             }]（单工作表）;
                             title: [[{
                               label: '姓名' // 表头名称
                               prop: 'userName', // "姓名" 列的填充值（对应 tableData 中 object 的 'userName' 属性）
                               width: 100, // 改列的宽度，类型为 number
                             }], [{
                               label: '类型' // 表头名称
                               prop: 'userName', // "姓名" 列的填充值（对应 tableData 中 object 的 'userName' 属性）
                               width: 100, // 改列的宽度，类型为 number
                             }]]（多工作表），其中 [{
                               label: '姓名' // 表头名称
                               prop: 'userName', // "姓名" 列的填充值（对应 tableData 中 object 的 'userName' 属性）
                               width: 100, // 改列的宽度，类型为 number
                             }] 为第一张工作表的表头，[{
                               label: '类型' // 表头名称
                               prop: 'userName', // "姓名" 列的填充值（对应 tableData 中 object 的 'userName' 属性）
                               width: 100, // 改列的宽度，类型为 number
                             }] 为第二张工作表的表头
       tableData: [], // 列表数据, 例：tableData = [{a: xxx}, {b: xxx}]（单工作表）；
                                      tableData = [[{a: xxx}, {b: xxx}], [{c: xxx}, {d: xxx}]，
                                      其中 [{a: xxx}, {b: xxx}] 为第一个工作表的数据，[{c: xxx}, {d: xxx}]
                                      为第二个工作表的数据
       filename: 'xxx.xlsx', // 导出的文件名称
       multipleSheet: true（多工作表）; false（单工作表）,
       sheetName: null, // 工作表名称，例：sheetName = '成绩表'（单工作表）；sheetName = ['成绩表', '学生表'],
       tablesID: [], // 导出的表格的 ID，也就是页面上存在的 talbe 表格的 ID，如果传入 tablesID，则 sheetName 必须为数组
*/
import XLSX from 'xlsx'
export default {
  name: 'downLoadExcel',
  components: {

  },
  data () {
    return {
    }
  },
  props: ['tableData', 'tableTitle', 'filename', 'multipleSheet', 'sheetName', 'tablesID'],
  methods: {
    dataToDownload () { // 根据数据直接导出
      const tableData = this.tableData || []
      const tableTitle = this.tableTitle || []
      const wb = XLSX.utils.book_new()
      if (!this.multipleSheet) {
        // 单工作表
        const data = [tableTitle.reduce((total, item) => {
          total.push(item.label)
          return total
        }, [])]
        const props = tableTitle.reduce((total, item) => {
          total.push(item.prop)
          return total
        }, [])
        // 每一列的宽度
        const widths = tableTitle.reduce((total, item) => {
          total.push(item.width)
          return total
        }, [])
        for (let i = 0; i < tableData.length; i++) {
          const arr = []
          for (var j = 0; j < props.length; j++) {
            arr.push(tableData[i][props[j]])
          }
          data.push(arr)
        }
        const ws = XLSX.utils.aoa_to_sheet(data)
        ws['!cols'] = widths.reduce((total, item) => {
          total.push({
            wpx: item
          })
          return total
        }, [])
        XLSX.utils.book_append_sheet(wb, ws, this.sheetName)
      } else {
        // 多工作表
        for (let i = 0; i < tableTitle.length; i++) {
          const data = [tableTitle[i].reduce((total, item) => {
            total.push(item.label)
            return total
          }, [])]
          const props = tableTitle[i].reduce((total, item) => {
            total.push(item.prop)
            return total
          }, [])
          // 每一列的宽度
          const widths = tableTitle[i].reduce((total, item) => {
            total.push(item.width)
            return total
          }, [])
          for (let j = 0; tableData[i] && j < tableData[i].length; j++) {
            const arr = []
            for (var k = 0; k < props.length; k++) {
              arr.push(tableData[i][j][props[k]])
            }
            data.push(arr)
          }
          const ws = XLSX.utils.aoa_to_sheet(data)
          ws['!cols'] = widths.reduce((total, item) => {
            total.push({
              wpx: item
            })
            return total
          }, [])
          XLSX.utils.book_append_sheet(wb, ws, this.sheetName[i])
        }
      }
      XLSX.writeFile(wb, this.filename || '下载.xls')
    },
    htmlToDownload () { // 页面的 table 元素导出
      const sheetName = this.sheetName || []
      const wb = XLSX.utils.book_new()
      for (let i = 0; i < this.tablesID.length; i++) {
        const elt = document.getElementById(this.tablesID[i])
        const ws = XLSX.utils.table_to_sheet(elt)
        XLSX.utils.book_append_sheet(wb, ws, sheetName[i])
      }
      XLSX.writeFile(wb, this.filename || '下载.xls')
    },
    download () {
      if (!this.tablesID) {
        this.dataToDownload()
      } else if (this.tablesID) {
        // 如果 tablesID 存在，则说明套导出的是页面上已经存在的 table 表格
        this.htmlToDownload()
      }
    }
  }
}
</script>

<style lang="css" scoped>
</style>
