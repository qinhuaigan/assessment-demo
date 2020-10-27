<template>
  <div class="scrollPage">
    <div class="pageHtml" style="background: #00C1DE;" v-if="currentShow == 1 || upScrollSHow == 1" :class="getClass(1)">页面一</div>
    <div class="pageHtml" style="background: #1A8BFD;" v-if="currentShow == 2 || upScrollSHow == 2" :class="getClass(2)">页面二</div>
    <div class="pageHtml" style="background: #2C3E50;" v-if="currentShow == 3 || upScrollSHow == 3" :class="getClass(3)">页面三</div>
    <div class="pageHtml" style="background: #42B983;" v-if="currentShow == 4 || upScrollSHow == 4" :class="getClass(4)">页面四</div>
    <ul class="navigationList">
      <li v-for="item in totalPage" @click="gotoPage(item)" :class="{itemActive: currentShow == item}" :key="item"></li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'scrollPage',
  components: {},
  props: ['datas'],
  data () {
    return {
      currentShow: 1, // 当前显示的页面
      totalPage: 4,
      upScrollHide: 0, // 调用向上隐藏的 css
      upScrollSHow: 0, // 调用向上显示的 css
      stopScroll: false,
      direction: null, // 滚动方向
      isFirefox: null,
      mousewheel: null
    }
  },
  methods: {
    getClass (index) {
      return {
        upMoveHide: this.upScrollHide === index && this.direction === 'up',
        upMoveShow: this.upScrollSHow === index && this.direction === 'up',
        downMoveHide: this.upScrollHide === index && this.direction === 'down',
        downMoveShow: this.upScrollSHow === index && this.direction === 'down'
      }
    },
    gotoPage (index) {
      // 跳转到指定页面
      if (this.stopScroll || this.currentShow === index) {
        return
      }
      this.upScrollSHow = index
      this.upScrollHide = this.currentShow
      this.stopScroll = true
      if (index > this.currentShow) {
        // 跳到当前页面的后一个页面
        this.direction = 'up'
      } else {
        // 跳到当前页面的前一个页面
        this.direction = 'down'
      }
      setTimeout(() => {
        this.upScrollHide = 0
        this.upScrollSHow = 0
        this.currentShow = index
        this.stopScroll = false
      }, 1000)
    },
    scrollFunc (event) {
      if (this.stopScroll) {
        return
      }
      var e = event || window.event
      // 当鼠标在子系统区域内时：屏蔽窗口滚轮-滚动滚动条事件；
      // 此时才调用子系统滚动方法
      if (e.stopPropagation) {
        e.stopPropagation()
      } else {
        e.cancelBubble = true
      }
      if (e.preventDefault) {
        e.preventDefault()
      } else {
        e.returnValue = false
      }
      if (this.isFirefox) {
        if (e.detail === -3) {
          // 向上滚动
          if (this.currentShow > 1) {
            this.gotoPage(this.currentShow - 1)
          }
        } else {
          // 向下滚动
          if (this.currentShow < this.totalPage) {
            this.gotoPage(this.currentShow + 1)
          }
        }
      } else {
        if (e.wheelDelta === 120) {
          // 向上滚动
          if (this.currentShow > 1) {
            this.gotoPage(this.currentShow - 1)
          }
        } else {
          // 向下滚动
          if (this.currentShow < this.totalPage) {
            this.gotoPage(this.currentShow + 1)
          }
        }
      }
    }
  },
  created () {
    // 鼠标滚轮事件
    this.isFirefox = navigator.userAgent.indexOf('Firefox') !== -1
    // Firefox事件：DOMMouseScroll、IE/Opera/Chrome事件：mousewheel
    this.mousewheel = this.isFirefox ? 'DOMMouseScroll' : 'mousewheel'
    try {
      document.addEventListener(this.mousewheel, this.scrollFunc, {
        passive: false
      })
    } catch (err) {
      window.onmousewheel = document.onmousewheel = this.scrollFunc
    }
  }
}
</script>

<style lang="css" scoped>
  .listItem {
    list-style: none;
    padding-left: 10px;
  }

  .pageHtml {
    width: 100%;
    height: 100%;
    position: fixed;
    left: 0;
    top: 0;
    overflow: hidden;
  }

  .nextPage {
    top: 100%;
  }

  @keyframes upMoveHide {
    from {
      transform: translateY(0);
    }

    to {
      transform: translateY(-100%);
    }
  }

  @keyframes upMoveShow {
    from {
      transform: translateY(100%);
    }

    to {
      transform: translateY(0);
    }
  }

  @keyframes downMoveHide {
    from {
      transform: translateY(0);
    }

    to {
      transform: translateY(100%);
    }
  }

  @keyframes downMoveShow {
    from {
      transform: translateY(-100%);
    }

    to {
      transform: translateY(0);
    }
  }

  .upMoveHide {
    animation: upMoveHide 1s forwards;
  }

  .upMoveShow {
    animation: upMoveShow 1s forwards;
  }

  .downMoveHide {
    animation: downMoveHide 1s forwards;
  }

  .downMoveShow {
    animation: downMoveShow 1s forwards;
  }

  .navigationList {
    position: fixed;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
  }

  .navigationList li {
    list-style: none;
    width: 10px;
    height: 10px;
    border: 1px solid #fff;
    border-radius: 50%;
    margin-top: 5px;
    cursor: pointer;
  }

  .navigationList .itemActive {
    background: #3F6BF3;
  }
</style>
