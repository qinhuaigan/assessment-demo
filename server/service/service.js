const app = require('../server.js');
const log4js = require('log4js');
log4js.configure(require('../../config/log4js'))
const log = log4js.getLogger('service.js');
function postData(model, fun, parm1, parm2) {
  return new Promise((resolve) => {
    if (parm1 && parm2) {
      try {
        app.models[model][fun](parm1, parm2, (err, response) => {
          try {
            if (err) {
              log.error(err)
              resolve(false)
            } else {
              resolve(response)
            }
          } catch (e) {
            log.error(e)
            //TODO handle the exception
          }
        })
      } catch (e) {
        log.error(e)
        resolve(false)
        //TODO handle the exception
      }
    } else {
      try {
        app.models[model][fun](parm1, (err, response) => {
          try {
            if(err) {
              console.log(err)
              log.error(err)
              resolve(false)
            } else {
              resolve(response)
            }
          } catch (e) {
            log.error(e)
            //TODO handle the exception
          }
        })
      } catch (e) {
        log.error(e)
        //TODO handle the exception
        resolve(false)
      }
    }
  })
}

function getFileByContainer(container) {
  return new Promise((resolve) => {
    app.models.Container.getFiles(`${container}`, (err, response) => {
      try{
        if (err) {
          log.error(err)
          log.error('log error in line:59')
          return resolve(false)
        }
        const result = []
        for (let i = 0; i < response.length; i++) {
          result.push({
            filename: response[i].filename,
            path: `/Containers/${container}/download/${response[i].filename}`,
            container: `${container}`,
          })
        }
        resolve(result)
      }catch(e){
        log.error(e)
        log.error('log catch in line:65')
        //TODO handle the exception
        resolve(false)
      }
    })
  })
}

module.exports = {
  postData,
  getFileByContainer
}
