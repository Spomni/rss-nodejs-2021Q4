const defaultDeclaration = {
  isFlag: false,
  isArray: false,
  isRequired: false,
}

const isObject = (value) => typeof value === 'object' && value !== null
const isArray = (value) => value instanceof Array

function isOptionName(value) {
  return /(^-\w$)|(^--\w[\-\w]+$)/.test(value)
}

function isOptionNamesArray(value) {
  return isArray(value) && value.every((alias) => isOptionName(alias))
}

// TODO: write jsdoc for the function completeOption()
function completeOption(declaration) {
  return Object.assign(
    {},
    defaultDeclaration,
    declaration,
    {
      value: null,
      alias: declaration.alias || [],
    },
  )
}

/**
 * Get all items that is starting from a dash and is not valid option name
 *
 * @param {string[]} array
 *
 * @returns {array}
 */
function getInvalidOptions(array) {
  return [...array].splice(2, array.length)
    .filter((item) => item[0] === '-' && !isOptionName(item))
}

// TODO: rename the "argv" option to the "array" one
/**
 * Read option value from the "argv" array starting from the "start" index to the index of the next option item or end of array
 *
 * Return an array [ value, nextIndex ] where "value" is readed value and the "nextIndex" is the next index after value
 *
 * Return undefined as value if the next item is option or end of the array
 *
 * Return an array as valie if the value contains more then one items
 *
 * @param {string[]} argv
 * @param {number} start
 *
 * @returns {array}
 */
function readOptionValue(argv, start) {
  let value = null
  let index = start
  let item = argv[index]

  while (item && !isOptionName(item)) {

    if (/(^'.*'$)|(^".*"$)/.test(item)) {
      item = item.replace(/(^('|"))|(('|")$)/g, '')
    }

    if (!value) {
      value = item
    } else {
      if (!isArray(value)) value = [value]
      value.push(item)
    }

    index += 1
    item = argv[index]
  }

  return [ value, index ]
}

module.exports = {
  defaultDeclaration,
  isObject,
  isArray,
  isOptionName,
  isOptionNamesArray,
  completeOption,
  getInvalidOptions,
  readOptionValue,
}