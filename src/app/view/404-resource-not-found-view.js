function resourceNotFoundView(req, res) {

  res.writeHead(404, 'Resource Not Found', {
    'Content-Type': 'text/plain; charset=UTF-8',
  })

  res.end(`resource is not found by url ${req.url}`)
}

module.exports = {
  resourceNotFoundView,
}
