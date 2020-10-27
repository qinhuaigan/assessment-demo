<template lang="html">
  <div class="clearfix">
    <div class="tableContent">
      <el-table @selection-change="selectChange" border @select-all="selectAll" @select="selectRow" :data="datas" ref="multipleTable"
        slot="empty" stripe :cell-style="setStyle">
        <el-table-column align="center" type="selection" width="55" v-if="multipleShow"></el-table-column>
        <el-table-column align="center" fixed="left" type="index" width="55" label="序号" v-if="!hideNumber"></el-table-column>
        <el-table-column :align="item.align || 'center'" v-for="(item, i) in titles" :label="item.label" :width="item.width" :minWidth="item.minWidth" :key="`${item.prop}_${i}`">
          <template slot-scope="scope">
            <el-image v-if="item.type == 'image'" style="width: 100%; height: 100%; vertical-align: middle;" :src="`${fileBaseURL}${scope.row[item.prop]}`"
              :preview-src-list="[`${fileBaseURL}${scope.row[item.prop]}`]">
            </el-image>
            <el-switch v-else-if="item.type == 'switch'" v-model="scope.row[item.prop]" @change="change(scope.row)"></el-switch>
            <div class="customizeDiv cell" :class="{ 'el-tooltip': !showAll}" v-else :style="customizeStyle(scope.row, item.prop)">{{scope.row[item.prop]}}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作" :align="operateBtnAlign || 'left'" fixed="right" :width="operateWidth" v-if="btns && btns.length > 0">
          <template slot-scope="scope">
            <div v-if="operateBtnBlock">
              <div :class="{mb5px: i < btns.length - 1}" v-for="(btn, i) in btns" :key="`${btn.text}_${scope.$index}_${i}`" v-if="getBtnShow(scope.row.hiddenBtns, btn)">
                <el-button :style="{width: btn.width}" :type="btn.type" size="mini" @click="handleClick(btn.fun, scope.$index, scope.row)">{{btn.text}}</el-button>
              </div>
            </div>
            <div v-else>
              <el-button :style="{width: btn.width}" v-for="(btn, i) in btns" :key="`${btn.text}_${scope.$index}_${i}`" v-if="getBtnShow(scope.row.hiddenBtns, btn)"
                :type="btn.type" size="mini" @click="handleClick(btn.fun, scope.$index, scope.row)">
                <span></span>{{btn.text}}
                </el-button>
            </div>
          </template>
        </el-table-column>
        <div class="emptyStyle" slot="empty">
          <div class="emptyIcon"></div>
          <div class="emptyText mt10px mb20px">无法查找到数据</div>
        </div>
      </el-table>
    </div>
    <pagination v-if="showPagination" :total="total || 0" @change="pageChange" :currentPage="current" :pageSize="size"></pagination>
  </div>
</template>

<script>
import $ from 'jquery'
import pagination from './pagination'
/*
    组件使用说明：
        1、titles 参数说明：label（表格列名称），prop（表格列填充值参数），width（列的宽度），minWidth（列的最小宽度）
           type（内容显示方式，如果显示的内容是图片，则 type = 'image'；如果现显示的是滑动开关，则 type = "switch"），align（内容对其方式：center，left，right）
        2、tableData 特定参数说明：style（该参数为 object 类型，可自定义设置该列样式）
           例：style: { pass: 'red'}，'pass' 表示 tableData 数组中，数组元素中的 'pass' 字段的自定义
           样式为 'red'，如果当前组件 tableList 中的 allClass（预设样式）中没有 'red' 样式，则需要添加
           'red' 样式后，方能起效；
           hiddenBtns：传入该数据，可指定当前行隐藏对应的按钮（按钮名称：text 属性），例：hiddenBtns = ['编辑']，可隐藏 "btns" 中的 "编辑" 按钮
        3、btns 参数说明（表格组件具备的按钮）：permissionArr（显示该按钮所需拥有的权限数组），width（按钮宽度），text（按钮文字），fun（该按钮所调用的函数），type（按钮的类型，具体参考 elememtUi 的说明）
           特别强调：在使用该组件时，有 btns 值时，必须设定 handleClick() 函数，具体如下：
           <tableList :tableData="tableData" :titles="titles" :btns="btns" @handleClick="handleClick"></tableList>；
           在使用 <tableList></tableList> 的页面中，添加函数
           handleClick(fun, index, data) {
             this[fun](index, data);
           },
           btns 中 fun 参数定义的函数，需要在调用 tableList 组件的 methods 中定义好
        4、multipleShow 参数说明：是否显示多选框
        5、operateWidth 参数说明：操作列的宽度
        6、getSelect 函数说明：获取当前选中的行
        7、img参数说明：是否显示轮播图
        8、hideNumber（true：隐藏序号列，false：显示序号列）
        9、showPagination（true：显示分页插件，false：不显示）
        10、total（分页插件的总条数）
        11、currentPage（分页插件当前页）
        12、pageSize（分页插件每页显示条数）
        13、pageChange() // 分页插件变化时触发
        14、getAllSelectData()，调用该函数可获取所有页码选择的所有数据
        15、特别注意：根据具体情况，适时调用 clearAllSelect() 函数（例：切换到 "新的企业" 时，必须清空，不然2个不同企业的数据会混到一起）
        16、showAll：超出内容不显示 "..."，即换行显示
        17、operateBtnBlock：操作按钮不同行显示
        18、operateBtnAlign：按钮对其方式（center、left、right）
  */
export default {
  name: 'tableList',
  props: ['tableData', 'titles', 'btns', 'multipleShow', 'operateWidth', 'img', 'hideNumber',
    'showPagination', 'total', 'currentPage', 'pageSize', 'showAll', 'operateBtnBlock', 'operateBtnAlign'
  ],
  components: {
    pagination
  },
  data () {
    return {
      operateBtns: [], // 列表的按钮
      selectedData: [], // 所有选中的值,各页下所有选中的总和
      selectRows: [],
      current: 1,
      size: 10,
      datas: [],
      allClass: {
        green: 'color:#67C23A',
        red: 'color:red',
        warning: 'color:#E6A23C',
        brand: 'color:#409EFF'
      },
      srcList: []
    }
  },
  watch: {
    tableData () {
      this.datas = this.tableData
      this.removeCellClass()
      this.getSelectRows(true)
    },
    currentPage (val) {
      this.current = val
    },
    pageSize (val) {
      this.size = val
    }
    // btns () {
    //   this.setOperateBtns()
    // }
  },
  methods: {
    change (data) { // 数据更新，如 "switch" 开关的值放生了变化
      this.$emit('change', data)
    },
    getBtnShow (hiddenBtns, btn) {
      if (btn.permissionArr && btn.permissionArr.length > 0) {
        // 该按钮需要相应权限才可显示
        // 判断当前用户是否有权限使用该 "功能"
        let check = true // 默认为 true
        if (this.globalData.userPermission && this.globalData.userPermission.length > 0) {
          for (let j = 0; j < this.globalData.userPermission.length; j++) {
            if (btn.permissionArr.includes(this.globalData.userPermission[j])) {
              check = true
              break
            } else if (j === this.globalData.userPermission.length - 1) {
              // 拥有没有相应权限，该按钮不显示
              check = false
              break
            }
          }
        } else {
          // 该用户一个权限都没有
          this.operateBtns = this.operateBtns.filter((item) => {
            return !item.permissionArr || item.permissionArr.length === 0
          })
        }
        if (!check) {
          return false
        }
      }

      // 该按钮在此刻是否需要 "隐藏" （由 hiddenBtns 决定，hiddenBtns 为此刻需要隐藏的按钮）
      if (hiddenBtns && hiddenBtns.length > 0 && hiddenBtns.includes(btn.text)) {
        return false
      } else {
        return true
      }
    },
    setOperateBtns () { // 设置可用的按钮，权限挂钩
      this.operateBtns = this.btns ? JSON.parse(JSON.stringify(this.btns)) : []
      for (let i = 0; i < this.operateBtns.length; i++) {
        if (this.operateBtns[i].permissionArr) {
          // 该按钮需要拥有相应权限才能显示，验证用户是否拥有相应的权限
          if (this.globalData.userPermission && this.globalData.userPermission.length > 0) {
            for (let j = 0; j < this.globalData.userPermission.length; j++) {
              if (this.operateBtns[i].permissionArr.includes(this.globalData.userPermission[j])) {
                break
              } else if (j === this.globalData.userPermission.length - 1) {
                // 拥有没有相应权限，该按钮不显示
                this.operateBtns.splice(i, 1)
                i -= 1
                break
              }
            }
          } else {
            // 该用户一个权限都没有
            this.operateBtns = this.operateBtns.filter((item) => {
              return !item.permissionArr || item.permissionArr.length === 0
            })
          }
        }
      }
    },
    getSelectRows (selected) {
      this.$nextTick(() => {
        this.selectRows = []
        for (let i = 0; i < this.selectedData.length; i++) {
          for (let j = 0; j < this.datas.length; j++) {
            if (JSON.stringify(this.selectedData[i]) === JSON.stringify(this.datas[j])) {
              this.selectRows.push(this.datas[j])
              break
            }
          }
        }
        this.toggleSelection(this.selectRows, selected)
      })
    },
    getAllSelectData () { // 获取所有选中的数据，各分页总的数据
      this.$emit('getAllSelectData', this.selectedData)
      return this.selectedData
    },
    clearAllSelect () {
      // 清空所有选择的数据，看具体情况调用，避免选择到不属于同一领域的数据，
      // 如：切换到 "新的企业" 时，必须清空，不然2个不同企业的数据会混到一起
      this.selectedData = []
      this.getSelectRows(false)
    },
    selectDataChange (selection) { // 选中数据回调
      const selectionID = selection.reduce((total, item) => {
        total.push(JSON.stringify(item))
        return total
      }, []) // 获取当前列表选中项的
      const selecteData = this.selectedData.reduce((total, item) => {
        total.push(JSON.stringify(item))
        return total
      }, []) // 获取原来已经选中的
      const newInsertArr = selection.reduce((total, item) => {
        if (!selecteData.includes(JSON.stringify(item))) {
          total.push(item)
        }
        return total
      }, []) // 新添加的项
      const deleteArr = []
      for (let i = 0; i < this.datas.length; i++) {
        if (!selectionID.includes(JSON.stringify(this.datas[i])) && this.selectRows && this.selectRows.length > 0) {
          for (let j = 0; j < this.selectRows.length; j++) {
            if (JSON.stringify(this.selectRows[j]) === JSON.stringify(this.datas[i])) {
              break
            } else if (j === this.selectRows.length - 1) {
              deleteArr.push(JSON.stringify(this.datas[i]))
            }
          }
        } else if (!selectionID.includes(JSON.stringify(this.datas[i]))) {
          deleteArr.push(JSON.stringify(this.datas[i]))
        }
      }
      this.selectedData = this.selectedData.filter((item) => {
        return !deleteArr.includes(JSON.stringify(item))
      }) // 过滤掉 "已移除" 的项
      this.selectedData = [...this.selectedData, ...newInsertArr]
      this.selectRows = this.selectRows.filter((item) => {
        return !selectionID.includes(JSON.stringify(item))
      })
    },
    pageChange (currentPage, pageSize) {
      this.current = currentPage
      this.size = pageSize
      this.datas = []
      this.$emit('pageChange', currentPage, pageSize)
    },
    removeCellClass () {
      this.$nextTick(() => {
        $('.customizeDiv').parent('div').removeClass('cell')
      })
    },
    handleClick (fun, index, data) {
      this.$emit('handleClick', fun, index, data)
    },
    selectRow (selection, row) {
      // 勾选某一行
      this.$emit('selectRow', selection, row)
    },
    customizeStyle (row, prop) {
      if (row.style) {
        return this.allClass[row.style[prop]]
      }
    },
    selectAll (selection) {
      // 全选
      this.selection = selection || []
      this.$emit('selectChange', selection)
      this.selectDataChange(selection)
      this.getAllSelectData()
    },
    setStyle ({
      row,
      column,
      rowIndex,
      columnIndex
    }) {
      // 设置列表的样式
      if (row.style) {
        /*
              给单元个添加特定的样式：
                1、找到当前列对应的标题填充字段
                2、从当前行 row.style 中找到当前列对应字段的样式
                3、设置当前列的样式
            */
        let currentLabelKey // 填充当前列的字段 prop
        for (let i = 0; this.titles && i < this.titles.length; i++) {
          if (this.titles[i].label === column.label) {
            currentLabelKey = this.titles[i].prop
            break
          }
        }
        const styleKey = row.style[currentLabelKey] // 当前列样式的 key 值
        return this.allClass[styleKey]
      }
    },
    selectChange (selection) {
      this.selection = selection || []
      this.$emit('selectChange', selection)
      // 更新 selectRows 的值
      this.selectRows = selection
      this.selectDataChange(selection)
      this.getAllSelectData()
    },
    getSelect (selection) {
      // selection 所有选中的行
      this.$emit('getSelect', this.selection)
      return this.selection
    },
    toggleSelection (rows, selected) {
      // 切换多选框选中状态
      if (rows && rows.length > 0) {
        rows.forEach(row => {
          this.$refs.multipleTable.toggleRowSelection(row, selected)
        })
      } else {
        const cancel = this.datas ? this.datas.reduce((total, item) => {
          total.push(JSON.stringify(item))
          return total
        }, []) : []
        this.selectedData = this.selectedData.filter((item) => {
          return !cancel.includes(JSON.stringify(item))
        })
        this.$refs.multipleTable.clearSelection()
      }
    }
  },
  created () {
    this.current = this.currentPage || 1
    this.size = this.pageSize || 10
    this.datas = this.tableData
    this.removeCellClass()
    this.setOperateBtns()
  }
}
</script>

<style lang="css" scoped>
  .tableContent {
    border: 1px solid #EBEEF5;
    border-top: none;
    border-bottom: none;
    box-sizing: border-box;
    position: relative;
  }

  .emptyIcon {
    width: 100px;
    margin: 0 auto;
    margin-top: 80px;
    height: auto;
    content: url(../assets/img/file.png);
  }

  .emptyStyle {
    line-height: normal;
    margin-bottom: 50px;
  }

  .fz60px {
    font-size: 60px;
  }

  .page img {
    width: 100%;
  }
</style>
