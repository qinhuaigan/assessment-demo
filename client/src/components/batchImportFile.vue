<template lang="html">
  <div class="">
    <div class="text-right clearfix">
      <div class="fr ">
        <el-button type="warning" @click="downloadFile(`${baseURL}/account/account/export`)">下载模板</el-button>
      </div>
      <div class="fr mr10px">
        <el-upload ref="uploadFile" :on-error="uploadFail" :show-file-list="false" :data="importData" :before-upload="beforeUpload"
          class="upload-demo" :on-success="uploadSuccess" accept=".xls,.xlsx" :action="url" :limit="1">
          <el-button type="primary">开始导入</el-button>
        </el-upload>
      </div>
    </div>
    <div class="progressBarBg" v-if="progressBarShow">
      <div class="progressBarBox">
        <el-progress type="circle" :percentage="showtext"></el-progress>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'batchImportFile',
  components: {

  },
  props: ['url', 'importData', 'getScheduleURL'],
  data () {
    return {
      progressBarShow: false,
      showtext: 0
    }
  },
  methods: {
    uploadFail () {
      this.hideLoading()
      this.$refs.uploadFile.clearFiles()
    },
    beforeUpload () {
      this.showLoading()
    },
    progressBar () {
      this.progressBarShow = true
      const that = this
      let max = 100
      const data = {
        analysisScheduleKey: that.analysisScheduleKey
      }
      let url
      if (!this.getScheduleURL) {
        url =
            `/information/ehcache/getExcelAnalysis?token=${that.globalData.token}&${that.$querystring.stringify(data)}`
      } else {
        url = `${this.getScheduleURL}?token=${that.globalData.token}&${that.$querystring.stringify(data)}`
      }
      const t = setInterval(() => {
        if (max === 0) {
          clearInterval(t)
        } else {
          that.$axios({
            method: 'get',
            url
          }).then((response) => {
            if (response.data.code === 0) {
              that.showtext = response.data.data.analysisSchedule
              if (that.showtext === '1.000') {
                clearInterval(t)
                that.progressBarShow = false
                that.importComplete(response.data.data)
              }
              that.showtext = Math.round(that.showtext * 100)
            } else {
              clearInterval(t)
              that.importComplete()
              that.progressBarShow = false
              that.$message({
                type: 'error',
                message: `${response.data.extMsg || response.data.msg}`
              })
            }
            max--
          }).catch((error) => {
            max--
            console.log(error)
          })
        }
      }, 2000)
    },
    uploadSuccess (response, file, fileList) {
      // 清空文件列表
      this.$refs.uploadFile.clearFiles()
      this.hideLoading()
      const that = this
      if (response.code === 0) {
        if (!response.data.analysisScheduleKey) { // 当没有analysisScheduleKey的时候
          // 直接上传成功，不需要监听进度
          this.importComplete(response.data)
        } else if (response.data.analysisScheduleKey) {
          // 数据量较大，需要监听进度
          this.analysisScheduleKey = response.data.analysisScheduleKey
          that.progressBar()
        }
      } else {
        this.$message({
          type: 'error',
          message: `${response.extMsg || response.msg}`
        })
      }
    },
    importComplete (data) {
      // 导入完成后的回调
      data = data || {}
      this.$emit('importComplete', data)
    }
  },
  created () {

  }
}
</script>

<style lang="css" scoped>
  .progressBarBg {
    z-index: 9999;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5)
  }

  .progressBarBg .progressBarBox {
    left: 50%;
    top: 50%;
    position: absolute;
    width: 100px;
    height: 100px;
    text-align: center;
    transform: translate(-50%, -50%);
  }
</style>
