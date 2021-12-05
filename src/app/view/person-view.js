function getStatusMessageByCode(statusCode) {

  switch (statusCode) {

    case 200:
      return 'OK'

    case 201:
      return 'Created'
  }
}

function personView(req, res, {
  person = null,
  personList = null,
  statusCode = 200
}) {

  const statusMessage = getStatusMessageByCode(statusCode)

  res.writeHead(statusCode, statusMessage, {
    'Content-Type': 'application/json; charset=UTF-8',
  })

  const body = (person)
    ? JSON.stringify(person)
    : JSON.stringify(personList)

  res.end(body)
}

module.exports = {
  personView,
}
