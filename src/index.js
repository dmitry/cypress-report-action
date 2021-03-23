const core = require('@actions/core')
const fs = require('fs')
const path = require('path')
const {report} = require('./utils')

async function run() {
  try {
    const pathname = core.getInput('pathname', {required: true})

    const fullPathname = path.resolve(
      process.env.GITHUB_WORKSPACE,
      pathname
    );

    core.info(fullPathname);

    try {
      fs.accessSync(fullPathname, fs.constants.R_OK)
    } catch (err) {
      core.warning(`${fullPathname}: access error!`)
      return
    }

    const result = require(fullPathname)

    await report(result)

  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
