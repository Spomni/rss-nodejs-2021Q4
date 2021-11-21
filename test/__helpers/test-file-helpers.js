const path = require('path')
const fs = require('fs')

const testPath = path.resolve(__dirname, '../')
const srcPath = path.resolve(testPath, '../src/')
const fixturePath = path.join(testPath, './__fixture/')

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

  getIOFilesHelpers,
}
