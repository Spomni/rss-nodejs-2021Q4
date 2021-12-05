class StorableInterface {
  toPlain() {
    throw new Error('it is not implemented')
  }
}

function doesImplementStorableInterface(value) {

  if (!(value instanceof StorableInterface)) {
    return false
  }

  if (value.toPlain === StorableInterface.prototype.toPlain) {
    return false;
  }
  
  if (typeof value.toPlain !== 'function') {
    return false
  }
  
  return true
}

module.exports = {
  StorableInterface,
  doesImplementStorableInterface,
}
