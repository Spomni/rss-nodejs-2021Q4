const path = require('path')

const config = {

  mode: "production",

  entry: path.resolve(__dirname, 'src/index.js'),

  output: {
    path: path.resolve(__dirname, 'dist'),
  },

  target: 'node',
}

module.exports = config