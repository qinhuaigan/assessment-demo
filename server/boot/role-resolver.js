const log4js = require('log4js');
log4js.configure(require('../../config/log4js'))
const requireData = require('../../json/requireData')
const {
  postData
} = require('../service/service.js')
module.exports = function(app) {
  const Role = app.models.Role;
  const AccessToken = app.models.AccessToken;
  const User = app.models.User;
  Role.registerResolver('$owner', function(role, context, cb) {
    (async function() {
      const error = new Error()
      error.message = '需要授权'
      error.statusCode = 401
      // 验证权限之前，先验证必填字段是否完整
      const checkData = requireData[context.modelName] ? requireData[context.modelName][context.method] : null
      if (checkData) {
        // 存在需要 "必填字段" 约束，所以，需要验证
        const keys = Object.keys(checkData)
        const data = context.remotingContext.req.body
        let msg = ''
        for (const key in checkData) {
          if (checkData[key].required && !data[key]) {
            msg += `${checkData[key].description}、`
          }
        }
        if (msg) {
          error.message = `${msg.substr(0, msg.length - 1)}不能为空`
          return cb(error, false)
        }
      }

      // 当前账号是否属于 "$owner" 角色
      const token = context.remotingContext.req.query.access_token
      if (!token) {
        return cb(error, false)
      }
      const resolved = await postData('AccessToken', 'resolve', token)
      if (!resolved || !resolved.userId) {
        return cb(error, false)
      }

      const user = await postData('User', 'findById', resolved.userId)
      if (user && user.identity === 1) {
        // 身份符合（管理员身份）
        return cb(null, true);
      } else {
        return cb(error, false)
      }
    })()
  });

  Role.registerResolver('$general', function(role, context, cb) {
    // 所有用户
    (async function() {
      const error = new Error()
      error.message = '需要授权'
      error.statusCode = 401
      // 验证权限之前，先验证必填字段是否完整
      const checkData = requireData[context.modelName] ? requireData[context.modelName][context.method] : null
      if (checkData) {
        // 存在需要 "必填字段" 约束，所以，需要验证
        const keys = Object.keys(checkData)
        const data = context.remotingContext.req.body
        let msg = ''
        for (const key in checkData) {
          if (checkData[key].required && !data[key]) {
            msg += `${checkData[key].description}、`
          }
        }
        if (msg) {
          error.message = `${msg.substr(0, msg.length - 1)}不能为空`
          return cb(error, false)
        }
      }

      // 当前账号是否属于 "$general" 角色（注册过的账号）
      const token = context.remotingContext.req.query.access_token
      if (!token) {
        return cb(error, false)
      }

      const resolved = await postData('AccessToken', 'resolve', token)
      if (!resolved || !resolved.userId) {
        return cb(error, false)
      }

      const user = await postData('User', 'findById', resolved.userId)
      if (user && user.identity >= 1) {
        // 身份符合（管理员身份）
        return cb(null, true);
      } else {
        return cb(error, false)
      }
    })()
  });

  Role.registerResolver('$everyone', function(role, context, cb) {
    // 所有用户（包括非游客）
    (async function() {
      const error = new Error()
      error.message = '需要授权'
      error.statusCode = 401
      // 验证权限之前，先验证必填字段是否完整
      const checkData = requireData[context.modelName] ? requireData[context.modelName][context.method] : null
      if (checkData) {
        // 存在需要 "必填字段" 约束，所以，需要验证
        const keys = Object.keys(checkData)
        const data = context.remotingContext.req.body
        let msg = ''
        for (const key in checkData) {
          if (checkData[key].required && !data[key]) {
            msg += `${checkData[key].description}、`
          }
        }
        if (msg) {
          error.message = `${msg.substr(0, msg.length - 1)}不能为空`
          return cb(error, false)
        }
      }
      return cb(null, true)
    })()
  });
};
