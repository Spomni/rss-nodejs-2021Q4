function notImplementedView(req, res) {

  res.writeHead(501, 'Not Implemented', {
    'Content-Type': 'text/plain; charset=UTF-8',
  })

  res.end()
}

module.exports = {
  notImplementedView,
}
