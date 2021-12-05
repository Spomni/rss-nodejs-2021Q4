function getActualSiblings(child, shifting) {
  
  let actualShifting = 0
  let actualChild = child
  let actualParent = Object.getPrototypeOf(child)
  let nextParent;
    
  while (actualShifting < shifting) {
  
    nextParent = Object.getPrototypeOf(actualParent)
    
    if (nextParent) {
      actualChild = actualParent
      actualParent = nextParent
      actualShifting += 1
    } else {
      actualShifting = shifting
    }
  }
  
  return { actualChild, actualParent }
}

function chainPrototype(child, newParent, shifting = 0, { inject = false } = {}) {

  const {
    actualChild,
    actualParent
  } = getActualSiblings(child, shifting)

  Object.setPrototypeOf(actualChild, newParent)

  // TODO: test this branch
  if (inject) {
    Object.setPrototypeOf(newParent, actualParent)
  }

  return child
}

module.exports = {
  chainPrototype,
}