<template lang="html">
  <div class="clearfix">
    <ul class="clearfix fl">
      <li class="searchItem" v-for="(item, index) in searchDatas" :key="`${item.placeholder}_${index}`">
        <div class="el-input el-input--prefix" v-if="item.type == 'input'" :style="{width: item.width}">
          <input class="el-input__inner" type="text" @keyup="change(index)" v-model="models[index]" :placeholder="item.placeholder">
          <span class="el-input__prefix">
            <i class="el-input__icon el-icon-search"></i>
          </span>
        </div>
        <el-select filterable @change="change(index)" :style="{width: item.width}" v-else-if="item.type == 'select'" v-model="models[index]"
          :placeholder="item.placeholder">
          <el-option v-for="(option, index) in item.options" :key="index" :label="option.label" :value="option.value">
          </el-option>
        </el-select>
        <el-date-picker @change="change(index)" :style="{width: item.width}" v-model="models[index]" v-else-if="item.type == 'year'" type="year"
          format="yyyy 年" value-format="yyyy" :placeholder="item.placeholder" :size='item.size'>
        </el-date-picker>
        <el-date-picker @change="change(index)" :style="{width: item.width}" v-model="models[index]" v-else-if="item.type == 'datetimerange'" type="datetimerange" :picker-options="item.pickerOptions" range-separator="至"
          start-placeholder="开始日期" end-placeholder="结束日期" align="right">
        </el-date-picker>
      </li>
      <li class="searchItem ">
        <el-button class="fl" icon="el-icon-search" type="primary" @click="search()">搜索</el-button>
        <el-button class="fl" icon="el-icon-delete" @click="clear()">清空</el-button>
      </li>
    </ul>
  </div>

</template>

<script>
import {
  debounce
} from '../../utils/public'
  /*
    参数示例：
      searchDatas：[{
        type：'input', // 'input' 输入框，'select' 下拉框，
        placeholder：输入框的提示信息
        options：'select' 下拉框的内容，{ label: 'A', value: 'A'},
        pickerOptions:'pickerOptions'时间段
        width：宽度，可通过传入 width ，空值输入框或下拉框的宽度
      }],
      change()：搜索栏的值发生变化时触发
      clear()：清空搜索栏的值
      search()：点击 "搜索" 触发，点击 "清空" 按钮也会触发
  */
export default {
  name: 'search',
  props: ['searchDatas', 'dataModels'],
  data () {
    return {
      models: []
    }
  },
  watch: {
    searchDatas () {
      this.models = []
    },
    dataModels () {
      this.models = this.dataModels || []
    }
  },
  methods: {
    change: debounce(function (index) {
      // 搜索栏变化时触发
      this.$emit('change', this.models, index)
    }),
    search () {
      this.$emit('search', this.models)
    },
    clear () {
      this.models = []
      this.$emit('search', this.models)
    }
  },
  created () {
    this.models = this.dataModels || []
  }
}
</script>

<style lang="css" scoped>
  .searchItem {
    float: left;
    margin-right: 10px;
    margin-bottom: 10px;
  }

  .inputStyle {
    -webkit-appearance: none;
    background-color: #FFF;
    background-image: none;
    border-radius: 4px;
    border: 1px solid #DCDFE6;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    color: #606266;
    display: inline-block;
    font-size: inherit;
    height: 40px;
    line-height: 40px;
    outline: 0;
    padding: 0 15px;
    -webkit-transition: border-color .2s cubic-bezier(.645, .045, .355, 1);
    transition: border-color .2s cubic-bezier(.645, .045, .355, 1);
    width: 100%;
  }
</style>
