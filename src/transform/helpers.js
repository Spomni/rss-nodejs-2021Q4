const CODE_ = {
  LOWER_A: 97,
  LOWER_Z: 122,
  UPPER_A: 65,
  UPPER_Z: 90,
}

function isLowerCode(code) {
  return code >= CODE_.LOWER_A && code <= CODE_.LOWER_Z
}

function isUpperCode(code) {
  return code >= CODE_.UPPER_A && code <= CODE_.UPPER_Z
}

module.exports = {
  CODE_,
  isLowerCode,
  isUpperCode,
}
