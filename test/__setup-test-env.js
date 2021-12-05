const path = require('path')

const rootPath = path.resolve(__dirname, '../')
const scrPath = path.resolve(rootPath, './src')
const testPath = path.resolve(rootPath, './test')

function fromRoot(filename) {
  return rootPath
}

function fromSrc(filename) {
  return path.resolve(scrPath, filename)
}

function fromTest(filename) {
  return path.resolve(testPath, filename)
}

global.testEnv = {
  rootPath,
  scrPath,
  testPath,

  fromRoot,
  fromSrc,
  fromTest,
}
