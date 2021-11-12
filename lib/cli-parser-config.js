module.exports = {
  declare: [
    {
      name: '--config',
      alias: ['-c'],
      isRequired: true,
    },
    {
      name: '--input',
      alias: ['-i']
    },
    {
      name: '--output',
      alias: ['-o']
    },
    {
      name: '--debug',
      isFlag: true,
    }
  ]
}