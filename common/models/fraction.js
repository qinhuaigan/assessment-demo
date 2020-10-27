'use strict';
const log4js = require('log4js');
log4js.configure(require('../../config/log4js'))
const log = log4js.getLogger('UserInformation');
const app = require('../../server/server');
const {
  postData
} = require('../../server/service/service.js')
module.exports = function(Fraction) {
  Fraction.getFractions = function(data, cb) {
    (async () => {
      const countWhere  = {}
      if (data.query) {
        countWhere.or = [{
          name: {
            like: data.query
          }
        }, {
          Class: {
            like: data.query
          }
        }]
      }
      const total = await postData('Fraction', 'count', countWhere)

      const current = (data.currentPage - 1) * data.pageSize
      const findWhere = {}
      if (data.query) {
        findWhere.or = [{
          name: {
            like: data.query
          }
        }, {
          Class: {
            like: data.query
          }
        }]
      }
      const result = await postData('Fraction', 'find', {
        where: findWhere,
        skip: current,
        limit: data.pageSize,
        order: 'createTime desc'
      })
      if (!result) {
        cb(null, {code: -1, msg: '获取失败'})
        return
      }
      cb(null, {code: 0, count: total, result})
    })()
  }

  Fraction.remoteMethod(
    'getFractions', {
      description: '获取成绩列表数据',
      http: {
        path: '/getFractions',
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

  Fraction.addFraction = function(data, cb) {
    (async function() {
      const insertdata = {
        createTime: new Date(),
        name: data.name, // 姓名
        Class: data.Class, // 班级
        Chinese: data.Chinese || 0, // 语文成绩
        Mathematics: data.Mathematics || 0, // 数学成绩
        English: data.English || 0, // 英语成绩
        Physics: data.Physics || 0, // 物理成绩
        Chemistry: data.Chemistry || 0, // 化学成绩
        Biology: data.Biology || 0 // 生物成绩
      }

      const result = await postData('Fraction', 'create', insertdata)
      if (!result) {
        cb(null, {code: -1, msg: '添加失败'})
        return
      }
      cb(null, {code: 0, result})
    })()
  }

  Fraction.remoteMethod(
    'addFraction', {
      description: '添加',
      http: {
        path: '/addFraction',
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

  Fraction.updateFraction = function(data, cb) {
    (async function() {
      if (!data || !data.id) {
        cb(null, {code: -1, msg: 'id 不能为空'})
        return
      }
      const updateData = {
        name: data.name, // 姓名
        Class: data.Class, // 班级
        Chinese: data.Chinese || 0, // 语文成绩
        Mathematics: data.Mathematics || 0, // 数学成绩
        English: data.English || 0, // 英语成绩
        Physics: data.Physics || 0, // 物理成绩
        Chemistry: data.Chemistry || 0, // 化学成绩
        Biology: data.Biology || 0 // 生物成绩
      }
      const result = await postData('Fraction', 'upsertWithWhere', {
        id: data.id
      }, updateData)
      cb(null, { code: 0, data: result })
    })()
  }

  Fraction.remoteMethod(
    'updateFraction', {
      description: '修改',
      http: {
        path: '/updateFraction',
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

  Fraction.deleteFraction = function(data, cb) {
    (async function() {
      const result = await postData('Fraction', 'destroyById', data.id)
      if (result) {
        cb(null, {code: 0, data: result})
      } else {
        cb(null, {code: -1, msg: '删除失败'})
      }
    })()
  }

  Fraction.remoteMethod(
    'deleteFraction', {
      description: '删除',
      http: {
        path: '/deleteFraction',
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
};
