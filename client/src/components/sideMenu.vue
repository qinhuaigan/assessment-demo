<template lang="html">
  <div id="sideMenu" class="sideWrap" :style="{width: width, top: top}">
    <el-menu :mode="mode" @select="selectTab" :style="{height: '100%'}" class="el-menu-demo" @open="handleOpen" @close="handleClose"
      :background-color="`${bgColor || '#4451B0'}`" :text-color="`${textColor || '#fff'}`" :router="false"
      :unique-opened="true" :active-text-color="activeTextColor" menu-trigger="hover" :default-active="isActive">
      <el-menu-item v-for="(item, index) in showBars" :key="`${item.path}_${index}`" :index="`${item.path}_${index}`"
        v-if="!item.children || item.children.length == 0  ">
        <router-link :to="{path: item.path, query: item.query, params: item.params}" class="link-style" :style="setActiveColor(`${item.path}_${index}`)">
          <i :class="item.icon" :style="{color: isActive === `${item.path}_${index}` ? activeTextColor : textColor}"></i>
          <span>{{item.title}}</span>
        </router-link>
      </el-menu-item>
      <el-submenu :index="`${item.path}_${index}`" v-else>
        <template slot="title">
          <i :class="item.icon" :style="{color: isActive === `${item.path}_${index}` ? activeTextColor : textColor}"></i>
          <span>{{item.title}}</span>
        </template>
        <el-menu-item :index="`${child.path}_${i}`"  v-for="(child, i) in item.children" :key="`${child.path}_${i}`">
          <router-link :to="{path: child.path, query: child.query, params: child.params}" class="link-style" :style="setActiveColor(`${child.path}_${i}`)">
            <i :class="child.icon" :style="{color: isActive === `${child.path}_${i}` ? activeTextColor : textColor}"></i>
            <span>{{child.title}}</span>
          </router-link>
        </el-menu-item>
      </el-submenu>
    </el-menu>
  </div>
</template>

<script>
import $ from 'jquery'
export default {
  // 参数说明：
  // width：菜单栏的宽度
  // top：菜单栏到父级元素的顶部距离
  // bars：菜单栏数据
  // defaultActive：默认激活的 tab
  // mode：模式（可选值：horizontal -> 横向；vertical -> 竖向）
  // bgColor：自定义背景色
  // activeTextColor：自定义激活文字颜色
  // autoLoad：是否自动跳转到第一个可用的页面
  name: 'sideMenu',
  components: {

  },
  props: ['width', 'top', 'bars', 'defaultActive', 'mode', 'bgColor', 'activeTextColor', 'textColor', 'autoLoad', 'icoColor'],
  data () {
    return {
      showBars: [],
      isActive: null,
      userPermission: []
      // bars: [{
      //   title: '导航一',
      //   icon: 'el-icon-location',
      //   path: '/page_1'
      //   query: {},
      //   params: {}
      //   permissionArr: [], // 显示该菜单所需要的权限
      // }, {
      //   title: '导航二',
      //   icon: 'el-icon-menu',
      //   path: '/',
      //   children: [{
      //     title: '选项一',
      //     path: '/page_2',
      //     icon: 'el-icon-s-comment'
      //   }, {
      //     title: '选项二',
      //     path: '/page4',
      //     icon: 'el-icon-s-claim'
      //   }]
      // }]
    }
  },
  watch: {
    '$route': 'routeChange',
    bars () {
      this.setMenuShow()
    }
  },
  methods: {
    handleOpen () {},
    handleClose () {},
    selectTab (e) {
      // this.isActive = e;
    },
    routeChange () {
      const that = this
      this.isActive = null
      if (!that.showBars || that.showBars.length === 0) {
        this.setMenuShow()
      }
      // 路由改变时，设置菜单栏的选中项
      const path = that.$route.path
      let stop = false // 用于标记是否停止遍历
      function ergodicTree (node) {
        if (!stop && node.children && node.children.length > 0) {
          for (let i = 0; i < node.children.length; i++) {
            if (stop) {
              return
            }
            if (node.children[i].path === path) {
              that.isActive = `${path}_${i}`
              stop = true
              break
            } else {
              ergodicTree(node.children[i])
            }
          }
        }
      }
      for (let i = 0; that.showBars && i < that.showBars.length; i++) {
        if (stop) {
          return
        }
        if (that.showBars[i].path === path) {
          that.isActive = `${path}_${i}`
          stop = true
          break
        } else {
          ergodicTree(that.showBars[i])
        }
      }
    },
    setActiveColor (currentPath) {
      if (this.isActive === currentPath) {
        // 设置自定义的激活文字颜色
        return {
          color: this.activeTextColor
        }
      } else {
        // 设置自定义的文字颜色
        return {
          color: this.textColor || '#fff'
        }
      }
    },
    setMenuShow () {
      if (this.bars) {
        this.showBars = JSON.parse(JSON.stringify(this.bars))
      }
      for (let i = 0; this.showBars && i < this.showBars.length; i++) {
        if (this.showBars[i].permissionArr) {
          // 该菜单设置的可访问的权限，则验证当前用户是否拥有权限访问
          let result = false // 用户判断是否有必须继续验证该菜单的子菜单
          if (!this.userPermission || this.userPermission.length === 0) {
            // 当期用户一个权限都没有
            this.showBars.splice(i, 1)
            i -= 1
            continue
          }
          for (let j = 0; j < this.userPermission.length; j++) {
            if (this.showBars[i].permissionArr.includes(this.userPermission[j])) {
              // 当前用户拥有访问的权限
              result = true
              break
            } else if (j === this.userPermission.length - 1) {
              this.showBars.splice(i, 1)
              i -= 1
            }
          }
          if (result && this.showBars[i].children) {
            for (let j = 0; this.showBars[i].children && j < this.showBars[i].children.length; j++) {
              if (this.showBars[i].children[j].permissionArr) {
                for (let k = 0; this.userPermission && k < this.userPermission.length; k++) {
                  if (this.showBars[i].children[j].permissionArr.includes(this.userPermission[k])) {
                    // 有权访问
                    break
                  } else if (k === this.userPermission.length - 1) {
                    // 无权访问
                    this.showBars[i].children.splice(j, 1)
                    j -= 1
                  }
                }
              }
            }
          }
        }
      }
      return this.showBars
    }
  },
  mounted () {
    const h = $(document).height()
    this.$nextTick(() => {
      $('.sideWrap').height(`${h - 60}px`)
    })
  },
  async created () {
    this.userPermission = this.globalData.userPermission
    this.routeChange()
    this.setMenuShow()
    if (this.autoLoad) {
      // 自动跳转到第一个可用的页面
      if (this.showBars && this.showBars.length > 0) {
        if (this.showBars[0].children && this.showBars[0].children.length > 0 && this.$route.path !== this.showBars[0].children[0].path) {
          this.$router.push({
            path: this.showBars[0].children[0].path
          })
        } else if (this.$route.path !== this.showBars[0].path) {
          this.$router.push({
            path: this.showBars[0].path
          })
        }
      }
    }
  }
}
</script>
<style>
  #sideMenu .sideWrap {
    overflow: auto;
  }

  #sideMenu .link-style {
    color: #fff;
    display: block;
  }
  #sideMenu .icoColor {
    color:white
  }

  #sideMenu .el-menu-item, .el-submenu__title {
    height: 40px;
    line-height: 40px;
  }

  #sideMenu .el-submenu .el-menu-item {
    height: 40px;
    line-height: 40px;
  }
</style>
