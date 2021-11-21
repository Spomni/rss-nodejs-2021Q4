const path = require('path')
const fs = require('fs')

const testPath = path.resolve(__dirname, '../')
const srcPath = path.resolve(testPath, '../src/')
const fixturePath = path.join(testPath, 'fixture/')

function fromSrc(file) {
  return path.join(srcPath, file)
}

function fromTest(file) {
  return path.join(testPath, file)
}

function fromFixture(file) {
  return path.join(fixturePath, file)
}

function getIOFilesHelpers(testName) {

  const inputPath = path.join(fixturePath, `${testName}-input`)
  const outputPath = path.join(fixturePath, `${testName}-output`)

  return {

    inputPath,
    outputPath,

    clearIOFiles: function () {
      fs.writeFileSync(inputPath, '')
      fs.writeFileSync(outputPath, '')
    },

    removeIOFiles: function () {
      fs.unlinkSync(inputPath)
      fs.unlinkSync(outputPath)
    },
  }
}

module.exports = {

  srcPath,
  testPath,
  fixturePath,

  fromSrc,
  fromTest,
  fromFixture,

  getIOFilesHelpers,
}
