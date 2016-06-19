/**
 * \libs\list
 */

const inquirer = require('inquirer')

const Prompt = () => {
  const proto = {
    list: (list, obj, cb) => {
      inquirer.prompt([
        {
          type: 'list',
          name: obj.name,
          message: obj.message,
          choices: list
        }
      ]).then(res => {
        cb(res)
      })
    }
  }

  return Object.create(proto)
}

module.exports = Prompt()
