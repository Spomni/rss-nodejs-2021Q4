module.exports = {

  FIRST_ARG_ERR: /FirstArgumentError: application can not be called without options\n/,
  INVALID_OPT_ERR: /InvalidOptionsError: invalid option ".+" was found\n/,
  UNKNOWN_OPT_ERR: /UnknownOptionsNameError: unknown option ".+" was found\n/,
  FLAG_VALUE_ERR: /FlagOptionValueError: the ".+" option is a flag and can not have any value\n/,
  UNEXPECTED_VAL_ARR_ERR: /UnexpectedValuesArrayError: the option ".+" must be assigned with one value only\n/,
  MISS_REQUIRED_OPT_ERR: /MissedRequiredOptionError: the option ".+" must not be missed\n/,
  MISS_OPT_VAL_ERR: /MissedOptionValueError: the option ".+" must has a value\n/,
  DUPLICATED_OPT_ERR: /DuplicatedOptionError: the option ".+" can not be duplicatied\n/,
  NO_READ_ACCESS_ERR: /NoAccessToReadError: file ".+" can not be readed: check if it exists and you have access to read\n/,
  INPUT_IS_DIR_ERR: /InputIsDirectoryError: passed input file ".+" is a directory\n/,
  NO_WRITE_ACCESS_ERR: /NoAccessToWriteError: file ".+" can not be written: check if it exists and you have access to write\n/,
  OUTPUT_IS_DIR_ERR: /OutputIsDirectoryError: passed output file ".+" is a directory\n/,

  DASHED_CONF_START_ERR: /DashAtConfigStartError: value of the option "--config" must not start with a dash symbol\n/,
  DASHED_CONF_END_ERR: /DashAtConfigEndError: value of the option "--config" must not be ended with a dash symbol\n/,
  TOO_LONG_COMMAND_ERR: /InvalidCommandLengthError: too long command ".+" was found on the config command with number \d+.\n\tThe ciphering command should have only two symbol for the Caesar and ROT-8 ciphers and only one symbol for the cipher Atbash\n/,
  UNKNOWN_CIPHER_ERR: /UnknownCipherError: unknown cipher type was found on the config command ".+" with number \d+. \n\tA command should start with the letter that represents a cipher type. \n\tPossible cipher types:\n\t\tC - Caesar\n\t\tR - ROT-8\n\t\tA - Atbash\n/,
  INVALID_DIRECTION_ERR: /InvalidCipheringDirectionError: unknown ciphering direction was found on the config command ".+" with number \d+.\n\tThe second symbol of the chained command must be a correct ciphering direction: 1 - encoding, 0 - decoding.\n\tThe Atbash cipher command \(A\) should not have any ciphering direction symbol\n/,
}