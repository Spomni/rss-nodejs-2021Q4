function personDeletedView(req, res) {

  res.writeHead(204, 'No Content', {
    'Content-Type': 'text/plain; charset=UTF-8',
  })

  res.end()
}

module.exports = {
  personDeletedView,
}
