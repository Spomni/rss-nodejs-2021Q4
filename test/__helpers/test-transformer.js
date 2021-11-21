const {Readable, PassThrough } = require('stream')

async function testTransformer(transformer, inputData, callback) {
  return new Promise((resolve, reject) => {

    const input = new Readable({ read: () => {} })
    const output = new PassThrough()

    output.on(`data`, (data) => {
      try {
        callback(data)
        resolve()
      } catch (error) {
        reject(error)
      }
    })

    input
      .pipe(transformer)
      .pipe(output)

    input.push(inputData)
  })
}

module.exports = {
  testTransformer,
}