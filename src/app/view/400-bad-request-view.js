function badRequestView(req, res, { message }) {

  res.writeHead(400, 'Bad Request', {
    'Content-Type': 'text/plain; charset=UTF-8',
  })

  res.end(message)
}

module.exports = {
  badRequestView,
}
