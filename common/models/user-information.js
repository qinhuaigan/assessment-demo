'use strict';
const log4js = require('log4js');
log4js.configure(require('../../config/log4js'))
const log = log4js.getLogger('UserInformation');
const app = require('../../server/server');
const {
  postData
} = require('../../server/service/service.js')
module.exports = function(UserInformation) {
  UserInformation.signUp = function(data, cb) {
    async function signUp() {
      const user = await postData('User', 'findOne', {
        where: {
          or: [{
            username: data.username
          }, {
            email: data.email
          }]
        }
      })
      if (user) {
        cb(null, {
          code: -1,
          msg: '该手机号或邮箱已注册'
        })
        return
      }
      const result = await postData('User', 'create', {
        username: data.username,
        password: data.password,
        chineseName: data.chineseName,
        email: data.email,
        identity: 2, // 1（管理员），2（普通用户）
      })
      if (result) {
        cb(null, {
          code: 0,
          data: result
        })
      } else {
        log.error('log error in line 19')
        cb(null, {
          code: -1,
          msg: '注册失败'
        })
      }
    }
    signUp()
  }

  UserInformation.remoteMethod(
    'signUp', {
      description: '注册',
      http: {
        path: '/signUp',
        verb: 'post'
      },
      accepts: [{
        arg: 'data',
        type: 'object',
        http: {
          source: 'body'
        }
      }],
      returns: {
        arg: 'result',
        type: 'object',
        root: true,
      }
    }
  );

  UserInformation.login = function(data, cb) {
    (async function() {
      // 通过手机号登录
      const result1 = await postData('User', 'login', {
        username: data.username,
        password: data.password
      })
      if (result1) {
        return cb(null, {
          code: 0,
          data: result1.id
        })
      }

      // 通过邮箱登录
      const result2 = await postData('User', 'login', {
        email: data.username,
        password: data.password
      })
      if (result2) {
        return cb(null, {
          code: 0,
          data: result2.id
        })
      }
      return cb(null, {
        code: -1,
        msg: '用户名或密码错误'
      })
    })()
  }

  UserInformation.remoteMethod(
    'login', {
      description: '注册',
      http: {
        path: '/login',
        verb: 'post'
      },
      accepts: [{
        arg: 'data',
        type: 'object',
        http: {
          source: 'body'
        }
      }],
      returns: {
        arg: 'result',
        type: 'object',
        root: true,
      }
    }
  );

  UserInformation.getUserInfoByToken = function(req, cb) {
    (async function() {
      const token = req.query.access_token
      const resolved = await postData('AccessToken', 'resolve', token)
      if (!resolved || !resolved.userId) {
        log.error('log error in line:132')
        cb(null, { code: -1, msg: 'token 已过期，请重新登录' })
        return
      }
      const result = await postData('User', 'findById', resolved.userId)
      if (!result) {
        log.error('log error in line:139')
        cb(null, { code: -1, msg: '用户不存在' })
        return
      }
      cb(null, { code: 0, data: result })
    })()
  }

  UserInformation.remoteMethod(
    'getUserInfoByToken', {
      description: '获取用户信息',
      http: {
        path: '/getUserInfoByToken',
        verb: 'post'
      },
      accepts: [{
        arg: 'req',
        type: 'object',
        http: {
          source: 'req'
        }
      }],
      returns: {
        arg: 'result',
        type: 'object',
        root: true,
      }
    }
  );
};
