<template>
  <div id="magnify" class="magnify">
    <div class="imgBoxWrap">
      <div class="preview-box" :style="{'background-image': `url('${previewImg}')`, 'height': `${previewImgHeight}px`}" @mousemove="move($event)"  @mouseout="out" ref="previewBox">
        <!-- <img width="100%" :src="previewImg" alt=""> -->
        <div class="hover-box" ref="hoverBox"></div>
      </div>
      <div class="zoom-box" v-show="zoomVisiable" ref="zoomBox">
        <img :src="previewImg" alt="" ref="bigImg">
      </div>
    </div>
    <div class="miniBox">
      <el-row>
        <el-col :span="2">
          <div class="myBtn" @click="prev()" :style="{'height': `${miniImageHeight}px`, 'line-height': `${miniImageHeight}px`}">
            <i class="el-icon-arrow-left fz20px"></i>
          </div>
        </el-col>
        <el-col :span="20">
          <div class="miniImageBox" :style="setMiniImageBoxWidth()">
            <ul class="miniImageList clearfix" :style="setMiniImageListStyle()">
              <li class="miniImageItem" :style="getMiniImageItemStyle(item)" v-for="(item, index) in images" :key="`${item}_${index}`" @mouseenter="changePreviewImg(item)"></li>
            </ul>
          </div>
        </el-col>
        <el-col :span="2">
          <div class="myBtn" @click="next()" :style="{'height': `${miniImageHeight}px`, 'line-height': `${miniImageHeight}px`}">
            <i class="el-icon-arrow-right fz20px"></i>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
/*
  images: 图片数组
  previewImgHeight: 图片高度
  miniImageHeight: 小图片高度
  showNum: 小图片显示个数
*/
import $ from 'jquery'
function offset (el) {
  let top = el.offsetTop
  let left = el.offsetLeft
  while (el.offsetParent) {
    el = el.offsetParent
    top += el.offsetTop
    left += el.offsetLeft
  }
  return {
    left: left,
    top: top
  }
}
export default {
  name: 'magnify',
  props: {
    images: {
      type: Array,
      default: null
    },
    miniImageHeight: {
      type: Number,
      default: 80
    },
    previewImgHeight: {
      type: Number,
      default: 400
    },
    showNum: {
      type: Number,
      default: 4
    }
  },
  data () {
    return {
      scrollIndex: 0,
      zoomVisiable: false,
      hoverVisiable: false,
      previewImg: {
        type: String,
        default: ''
      }
    }
  },
  methods: {
    setMiniImageBoxWidth () {
      const percentWidth = $('.miniImageBox').parent('div').width()
      return {
        'width': `${percentWidth}px`
      }
    },
    setMiniImageListStyle () {
      const percentWidth = $('.miniImageBox').width() || 0
      const w = percentWidth / this.showNum
      return {
        'width': `${w * this.images.length}px`
      }
    },
    prev () {
      const percentWidth = $('.miniImageBox').width()
      const w = percentWidth / this.showNum
      if (this.scrollIndex > 0) {
        this.scrollIndex -= 1
        $('.miniImageList').animate({
          'margin-left': `-${this.scrollIndex * w}px`
        }, 500)
      }
    },
    next () {
      const percentWidth = $('.miniImageBox').width()
      const w = percentWidth / this.showNum
      if (this.scrollIndex + this.showNum < this.images.length) {
        this.scrollIndex += 1
        $('.miniImageList').animate({
          'margin-left': `-${this.scrollIndex * w}px`
        }, 500)
      }
    },
    changePreviewImg (item) {
      this.previewImg = item
    },
    getMiniImageItemStyle (item) { // 设置 "小图片" 样式
      const percentWidth = $('.miniImageBox').width()
      const w = percentWidth / this.showNum
      return {
        'background-image': `url('${item}')`,
        'width': `${w - 10}px`,
        'margin': '0 5px',
        'border': `${this.previewImg === item ? '1px solid red' : 'none'}`,
        'height': `${this.miniImageHeight}px`
      }
    },
    out () {
      this.zoomVisiable = false
    },
    move (ev) {
      this.init()
      // 鼠标距离屏幕距离
      let moveX = ev.clientX
      let moveY = ev.clientY
      // 大盒子距离顶部的距离
      let offsetLeft = offset(this.oPreviewBox).left

      let offsetTop = offset(this.oPreviewBox).top
      let left = moveX - offsetLeft - this.houverWidth / 2
      let top
      if (this.scroll > 0) {
        top = moveY - offsetTop + this.scroll - this.houverHeight / 2
      } else {
        top = moveY - offsetTop - this.houverHeight / 2
      }
      let maxWidth = this.pWidth - this.houverWidth
      let maxHeight = this.pHeight - this.houverHeight
      left = left < 0 ? 0 : left > maxWidth ? maxWidth : left
      top = top < 0 ? 0 : top > maxHeight ? maxHeight : top
      let percentX = left / (maxWidth)
      let percentY = top / (maxHeight)
      this.oHoverBox.style.left = left + 'px'
      this.oHoverBox.style.top = top + 'px'
      this.oBigImg.style.left = percentX * (this.bWidth - this.imgWidth) + 'px'
      this.oBigImg.style.top = percentY * (this.bHeight - this.imgHeight) + 'px'
      this.$emit('move', ev)
      this.zoomVisiable = true
    },
    init () {
      this.oHoverBox = this.$refs.hoverBox
      this.oPreviewBox = this.$refs.previewBox
      this.oBigImg = this.$refs.bigImg
      this.imgBox = this.$refs.zoomBox
      this.houverWidth = this.oHoverBox.offsetWidth
      this.houverHeight = this.oHoverBox.offsetHeight
      this.pWidth = this.oPreviewBox.offsetWidth
      this.pHeight = this.oPreviewBox.offsetHeight
      this.imgWidth = this.oBigImg.offsetWidth
      this.imgHeight = this.oBigImg.offsetHeight
      this.bWidth = this.imgBox.offsetWidth
      this.bHeight = this.imgBox.offsetHeight
      this.scroll = document.documentElement.scrollTop || document.body.scrollTop
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.previewImg = this.images[0]
    })
  }
}
</script>

<style scoped>
  .imgBoxWrap {
    position: relative;
  }

.magnify {
    position: relative;
  }
  .preview-box {
    width: 100%;
    border: 1px solid #dededd;
    position: relative;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }
  .preview-box:hover .hover-box{
    display: block;
  }
  .preview-box .hover-box {
    position: absolute;
    display: none;
    left: 0;
    top: 0;
    width: 200px;
    height: 200px;
    cursor: move;
    user-select: none;
    background-color: rgba(0, 0, 0, 0.2);
  }
  .zoom-box {
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: absolute;
    left: 100%;
    border: 1px solid #ccc;
    top: 0;
    z-index: 1000;
    box-sizing: border-box;
  }
  .zoom-box img {
    position: absolute;
    top: 0;
    left: 0;
  }

  .miniBox {
    margin-top: 20px;
  }

  .miniBox .myBtn {
    width: 100%;
    height: 100px;
    line-height: 100px;
    text-align: center;
    box-sizing: border-box;
    border: 1px solid #ccc;
    cursor: pointer;
  }

  .miniImageBox {
    width: 100%;
    height: 100px;
    overflow: hidden;
    display: inline-block;
  }

  .miniImageList .miniImageItem {
    float: left;
    background-size: cover;
    background-position: center;
    box-sizing: border-box;
    cursor: pointer;
  }
</style>
