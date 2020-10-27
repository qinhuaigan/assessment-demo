import Vue from 'vue'
import Router from 'vue-router'
import {
  Message
} from 'element-ui'
import check from '../../utils/check.js'
const Route = Router
Vue.use(Router)

const router = new Route({
  routes: [{
    path: '/',
    name: 'HelloWorld'
  }]
})

router.beforeEach(async (to, from, next) => {
  // 判断登录是否已过期,过期则跳转到登录页面
  const loginOverdue = localStorage.getItem('loginOverdue')
  if (loginOverdue) {
    localStorage.removeItem('loginOverdue')
    next('/enterpriseLogin_M0')
    return
  }
  /* 检测是否拥有访问当前页面的权限 */
  const checkResult = await check.checkRouter(to)
  if (checkResult) {
    next()
  } else {
    Message({
      type: 'error',
      message: '对不起，您暂无权限访问当前页面'
    })
  }
})

export default router
