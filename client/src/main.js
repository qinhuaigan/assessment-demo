// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import $ from 'jquery' // 哪个模块需要使用Jquery，就在哪个模块单独引入即可
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import './assets/css/style.css'
// import './assets/css/animate.css'
import animated from 'animate.css'
import globalData from '../utils/globalData.js'
import store from '../store/index.js'

globalData.token = localStorage.getItem('token') || ''
globalData.applicationURL = localStorage.getItem('applicationURL')
const axios = require('axios')
const Message = ElementUI.Message

axios.defaults.baseURL = 'http://localhost:3000/api' // 本地环境
Vue.prototype.baseURL = 'http://localhost:3000/api' // 本地环境

// axios.defaults.baseURL = '' // 测试和正式环境
// Vue.prototype.baseURL = '' // 测试
// Vue.prototype.fileBaseURL = '/data/access/' // 测试和正式环境

Vue.prototype.globalData = globalData
Vue.prototype.$axios = axios
Vue.prototype.$querystring = require('querystring')
Vue.config.productionTip = false

Vue.use(ElementUI)
Vue.use(animated)

Vue.prototype.Loading = null
Vue.prototype.showLoading = function (text) {
  if (typeof text !== 'string') {
    text = '请稍后...'
  }
  this.Loading = this.$loading({
    // lock: true,
    text,
    background: 'rgba(0, 0, 0, 0.7)'
  })
}

Vue.prototype.hideLoading = function () {
  this.Loading.close()
}

// 下载文件
Vue.prototype.downloadFile = function (url) {
  $("<a id='downloadFile' hidden></a>").attr('href', url).appendTo('body')
  $('#downloadFile')[0].click()
  $('#downloadFile').remove()
}

/**
 * 将字节转换成对应的单位
 * @param {Object} size
 */
Vue.prototype.getFileSize = (size) => {
  if (!size) {
    return ''
  }

  var num = 1024.00 // byte

  if (size < num) { return size + 'B' }
  if (size < Math.pow(num, 2)) { return (size / num).toFixed(2) + 'K' } // kb
  if (size < Math.pow(num, 3)) { return (size / Math.pow(num, 2)).toFixed(2) + 'M' } // M
  if (size < Math.pow(num, 4)) { return (size / Math.pow(num, 3)).toFixed(2) + 'G' } // G
  return (size / Math.pow(num, 4)).toFixed(2) + 'T' // T
}

Vue.prototype.checkPermissionExist = function (id) {
  // 为了避免 "获取权限请求" 延时，导致按钮显示不出来的问题，添加 Promise() 来处理
  // 验证某权限是否存在，id 是要验证的权限的 id
  const userPermission = localStorage.getItem('authorityList')
  if (userPermission) {
    this.globalData.userPermission = userPermission.split(',')
    this.globalData.userPermission = this.globalData.userPermission.reduce((total, item) => {
      total.push(parseFloat(item))
      return total
    }, [])
  }
  if (this.globalData.userPermission && this.globalData.userPermission.includes(id)) {
    return true
  } else {
    return false
  }
}

// 上传文件，files 为源文件数组，例：files = [file1, file2]
Vue.prototype.uploadFile = async function (files) {
  if (!files || files.length === 0) {
    return []
  }
  const promiseArr = []
  for (let i = 0; i < files.length; i++) {
    promiseArr.push(
      new Promise((resolve) => {
        const form = new FormData()
        form.append('file', files[i])
        axios({
          method: 'post',
          url: `/file/upload?token=${this.globalData.token}`,
          data: form
        }).then((response) => {
          if (response.data.code === 0) {
            resolve(response.data.data.fileUrl)
          } else {
            resolve(false)
          }
        }).catch(() => {
          resolve(false)
        })
      })
    )
  }
  this.showLoading()
  let result = await Promise.all(promiseArr)
  result = result.filter((item) => {
    return item
  })
  this.hideLoading()
  return result
}

// 将 json 数据转成 formData
Vue.prototype.formatFormData = function (data) {
  const form = new FormData()
  if (data) {
    for (let key in data) {
      if (data[key] !== undefined && data[key] !== null) {
        form.append(key, data[key])
      }
    }
  }
  return form
}

Vue.prototype.formatDate = function (value, type) {
  // 日期格式过滤器
  if (!value) {
    return null
  }
  const date = new Date(value)
  let fmt = type || 'yyyy-MM-dd HH:mm:ss'
  var obj = {
    'y': date.getFullYear(), // 年份，注意必须用getFullYear
    'M': date.getMonth() + 1, // 月份，注意是从0-11
    'd': date.getDate(), // 日期
    'q': Math.floor((date.getMonth() + 3) / 3), // 季度
    'w': date.getDay(), // 星期，注意是0-6
    'H': date.getHours(), // 24小时制
    'h': date.getHours() % 12 === 0 ? 12 : date.getHours() % 12, // 12小时制
    'm': date.getMinutes(), // 分钟
    's': date.getSeconds(), // 秒
    'S': date.getMilliseconds() // 毫秒
  }
  var week = ['天', '一', '二', '三', '四', '五', '六']
  for (var i in obj) {
    fmt = fmt.replace(new RegExp(i + '+', 'g'), function (m) {
      var val = obj[i] + ''
      if (i === 'w') return (m.length > 2 ? '星期' : '周') + week[val]
      for (var j = 0, len = val.length; j < m.length - len; j++) val = '0' + val
      return m.length === 1 ? val : val.substring(val.length - m.length)
    })
  }
  return fmt
}

Vue.filter('formatDate', (value, type) => {
  // 日期格式过滤器
  if (!value) {
    return null
  }
  const date = new Date(value)
  let fmt = type || 'yyyy-MM-dd HH:mm:ss'
  var obj = {
    'y': date.getFullYear(), // 年份，注意必须用getFullYear
    'M': date.getMonth() + 1, // 月份，注意是从0-11
    'd': date.getDate(), // 日期
    'q': Math.floor((date.getMonth() + 3) / 3), // 季度
    'w': date.getDay(), // 星期，注意是0-6
    'H': date.getHours(), // 24小时制
    'h': date.getHours() % 12 === 0 ? 12 : date.getHours() % 12, // 12小时制
    'm': date.getMinutes(), // 分钟
    's': date.getSeconds(), // 秒
    'S': date.getMilliseconds() // 毫秒
  }
  var week = ['天', '一', '二', '三', '四', '五', '六']
  for (var i in obj) {
    fmt = fmt.replace(new RegExp(i + '+', 'g'), function (m) {
      var val = obj[i] + ''
      if (i === 'w') return (m.length > 2 ? '星期' : '周') + week[val]
      for (var j = 0, len = val.length; j < m.length - len; j++) val = '0' + val
      return m.length === 1 ? val : val.substring(val.length - m.length)
    })
  }
  return fmt
})

// 获取权限之前，需要清除缓存的权限信息
localStorage.removeItem('authorityList')
// 获取登录用户所拥有的权限
Vue.prototype.getGlobalUserPermission = function () {
  return new Promise((resolve) => {
    // const userPermission = localStorage.getItem('authorityList')
    // if (userPermission) {
    //   Vue.prototype.globalData.userPermission = userPermission.split(',')
    //   Vue.prototype.globalData.userPermission = Vue.prototype.globalData.userPermission.reduce((total, item) => {
    //     total.push(parseFloat(item))
    //     return total
    //   }, [])
    //   resolve(Vue.prototype.globalData.userPermission)
    //   return
    // }
    const token = localStorage.getItem('token')
    if (!token) {
      resolve([])
      return
    }
    axios({
      method: 'get',
      url: `/account/account/getPermissions?token=${token}`
    }).then((response) => {
      if (response.data.code === 0) {
        resolve(response.data.data.prems)
      } else {
        if (response.data.code === 400) {
          // token 已过期, 跳到登录页面
          localStorage.setItem('loginOverdue', true)
        }
        Message({
          type: 'error',
          message: `${response.data.msg}`
        })
        resolve([])
      }
    }).catch(() => {
      resolve([])
    })
  })
}

Vue.prototype.getUserInfo = function () { // 获取登录用户的信息
  return new Promise((resolve) => {
    if (!Vue.prototype.globalData.token) {
      resolve(false)
      return
    }
    axios({
      method: 'get',
      url: `/account/account/getUserByToken?token=${Vue.prototype.globalData.token}`
    }).then((response) => {
      if (response.data.code === 0) {
        store.commit('increment', {
          name: 'userInfo',
          value: response.data.data
        })
        Vue.prototype.globalData.isLogin = true
        resolve(response.data.data)
      } else {
        Message({
          type: 'error',
          message: response.data.msg
        })
        store.state.userInfo = null
        Vue.prototype.globalData.isLogin = false
        resolve(false)
      }
    }).catch(() => {
      store.state.userInfo = null
      Vue.prototype.globalData.isLogin = false
      resolve(false)
    })
  })
}

// 获取验证码
Vue.prototype.getSMSCode = function (phone, type) {
  return new Promise((resolve) => {
    if (!phone) {
      Message({
        type: 'warning',
        message: '请先输入手机号'
      })
      resolve(false)
      return
    } else if (!(/^1[3456789]\d{9}$/.test(phone))) {
      Message({
        type: 'warning',
        message: '手机号码有误'
      })
      resolve(false)
      return
    }
    const data = {
      phone,
      type
    }
    this.$axios({
      method: 'get',
      url: `/account/getVerificationCode?${this.$querystring.stringify(data)}`
    }).then(function (res) {
      if (res.data.code === 0) {
        Message({
          type: 'success',
          message: '验证码已发送'
        })
        resolve(true)
      } else {
        resolve(false)
        Message.error(res.data.extMsg || res.data.msg)
      }
    }).catch(() => {
      resolve(false)
    })
  })
}

Promise.all([]).then((result) => {
  /* eslint-disable no-new */
  new Vue({
    el: '#app',
    router,
    store,
    components: {
      App
    },
    template: '<App/>'
  })
})
