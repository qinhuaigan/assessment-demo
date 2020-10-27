'use strict';

const log4js = require('log4js');
log4js.configure(require('../../config/log4js'))
const log = log4js.getLogger('UserInformation');
const app = require('../../server/server');
const formidable = require("formidable");
const FormData = require('form-data');
const fs = require("fs");
const axios = require('axios')
const path = require("path")
axios.defaults.baseURL = require('../../config/axios')['baseURL']
const {
  postData,
  getFileByContainer
} = require('../../server/service/service.js')
module.exports = function(Carousel) {
  Carousel.addCarousel = function(ctx, req, cb) {
    (async () => {
      const form = new formidable.IncomingForm(); //既处理表单，又处理文件上传
      const data = await new Promise((resolve) => {
        form.parse(req, (err, fields, files) => {
          resolve({
            fields,
            files
          })
        });
      })

      // 添加 "Carousel" 表数据
      const carousel = await postData('Carousel', 'create', {
        title: data.fields.title || '',
        description: data.fields.description || '',
        sort: data.fields.sort || 0,
        createTime: new Date(),
        updateTime: new Date()
      })

      if (!carousel) {
        log.error('log error in line:27')
        return cb(null, {
          code: -1,
          msg: '添加轮播图失败'
        })
      }

      // 上传文件
      const file = await new Promise((resolve) => {
        const oldPath = data.files.file.path; // 这里的路径是图片的本地路径
        const newPath = path.join(path.dirname(oldPath), data.files.file.name); // 这里的路径是图片的新的本地路径
        // 重命名文件
        fs.rename(oldPath, newPath, (err) => {
          const formData = new FormData()
          const headers = formData.getHeaders(); //这个不能少
          formData.append('file', fs.createReadStream(newPath)); // 'file'是服务器接受的key，创建文件流
          // 调用 pc 端的 "上传接口"，实现 "文件上传"
          axios({
            method: 'post',
            url: `/storages/uploadFile?container=${carousel.id}`,
            headers,
            data: formData,
            maxContentLength: Infinity
          }).then((response) => {
            if (response.data) {
              resolve(response.data)
            } else {
              resolve(false)
            }
          }).catch((error) => {
            log.error('log catch in line 85')
            log.error(error)
            resolve(false)
          })
        })
      })
      if (!file) {
        log.error('log error in line:52')
        return cb(null, {
          code: -1,
          msg: '文件上传失败'
        })
      }

      const result = {
        id: carousel.id,
        title: carousel.title,
        description: carousel.description,
        sort: data.sort,
        path: `/Containers/${carousel.id}/download/${file[0].filename}`,
        filename: file[0].filename
      }
      cb(null, {
        code: 0,
        data: result
      })
    })()
  }

  Carousel.remoteMethod(
    'addCarousel', {
      description: '新增轮播图',
      http: {
        path: '/addCarousel',
        verb: 'post'
      },
      accepts: [{
        arg: 'ctx',
        type: 'object',
        http: {
          source: 'context'
        }
      }, {
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

  Carousel.getCarousel = function(cb) {
    (async () => {
      const carouselList = await postData('Carousel', 'find', { order: 'sort asc' })
      const promises = []
      for (let i = 0; i < carouselList.length; i++) {
        promises.push(getFileByContainer(carouselList[i].id))
      }
      Promise.all(promises).then((response) => {
        carouselList.forEach((item, index) => {
          if (response[index] && response[index].length > 0) {
            item.filename = response[index][0].filename
            item.path = response[index][0].path
          } else {
            item.filename = null
            item.path = null
          }
        })
        cb(null, { code: 0, data: carouselList})
      })
    })()
  }

  Carousel.remoteMethod(
    'getCarousel', {
      description: '获取轮播图',
      http: {
        path: '/getCarousel',
        verb: 'post'
      },
      accepts: [],
      returns: {
        arg: 'result',
        type: 'object',
        root: true,
      }
    }
  );

  Carousel.upfateCarousel = function(ctx, req, cb) {
    (async () => {
      const form = new formidable.IncomingForm(); //既处理表单，又处理文件上传
      const data = await new Promise((resolve) => {
        form.parse(req, (err, fields, files) => {
          resolve({
            fields,
            files
          })
        });
      })

      if (data.files.file) {
        // 删除原先的图片
        const removeCount = await postData('Container', 'removeFile', data.fields.id, data.fields.filename)
      }

      // 添加 "Carousel" 表数据
      const carousel = await postData('Carousel', 'upsertWithWhere', {
        id: data.fields.id
      }, {
        title: data.fields.title || '',
        description: data.fields.description || '',
        sort: data.fields.sort || 0,
        updateTime: new Date()
      })

      if (!carousel) {
        log.error('log error in line:27')
        return cb(null, {
          code: -1,
          msg: '编辑轮播图失败'
        })
      }
      let file = null
      if (data.files.file) {
        // 上传文件
        file = await new Promise((resolve) => {
          const oldPath = data.files.file.path; // 这里的路径是图片的本地路径
          const newPath = path.join(path.dirname(oldPath), data.files.file.name); // 这里的路径是图片的新的本地路径
          // 重命名文件
          fs.rename(oldPath, newPath, (err) => {
            const formData = new FormData()
            const headers = formData.getHeaders(); //这个不能少
            formData.append('file', fs.createReadStream(newPath)); // 'file'是服务器接受的key，创建文件流
            // 调用 pc 端的 "上传接口"，实现 "文件上传"
            axios({
              method: 'post',
              url: `/storages/uploadFile?container=${carousel.id}`,
              headers,
              data: formData
            }).then((response) => {
              if (response.data) {
                resolve(response.data)
              } else {
                resolve(false)
              }
            }).catch((error) => {
              log.error('log catch in line 85')
              log.error(error)
              resolve(false)
            })
          })
        })
        if (!file) {
          log.error('log error in line:52')
          return cb(null, {
            code: -1,
            msg: '文件上传失败'
          })
        }
      }

      const result = {
        id: carousel.id,
        title: carousel.title,
        description: carousel.description,
        sort: data.sort,
        path: data.files.file ? `/Containers/${carousel.id}/download/${file[0].filename}` : data.fields.path,
        filename: data.files.file ? file[0].filename : data.fields.path
      }
      cb(null, {
        code: 0,
        data: result
      })
    })()
  }

  Carousel.remoteMethod(
    'upfateCarousel', {
      description: '编辑轮播图',
      http: {
        path: '/upfateCarousel',
        verb: 'post'
      },
      accepts: [{
        arg: 'ctx',
        type: 'object',
        http: {
          source: 'context'
        }
      }, {
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

  Carousel.removeCarousel = function (data, cb) {
    (async () => {
      const resolved = await postData('AccessToken', 'resolve', data.token)
      if (!resolved) {
        cb(null, {
          code: 401,
          msg: '您没有权限操作'
        })
        return
      }

      // 删除图片文件
      await postData('Container', 'destroyContainer', data.id)

      const result = await postData('Carousel', 'destroyById', data.id)
      if (result.count >= 0) {
        cb(null, {
          code: 0
        })
      } else {
        cb(null, {
          code: -1,
          msg: '删除失败'
        })
      }
    })()
  }

  Carousel.remoteMethod(
    'removeCarousel', {
      description: '删除轮播图',
      http: {
        path: '/removeCarousel',
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
