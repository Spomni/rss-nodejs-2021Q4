function internalServerErrorView(req, res) {

  res.writeHead(500, 'Internal Server Error', {
    'Content-Type': 'text/plain; charset=UTF-8',
  })

  res.end('The server has encountered a situation it does not know how to handle.')
}

module.exports = {
  internalServerErrorView,
}
