describe('cli', function () {

  describe('Should print to the stderr human friendly errors and should exit with non-zero code:', function () {

    it('if no option is passed')
    it('if invalid option name is passed')
    it('if any unknown option is passed')
    it('if any value passed to the --debug option')
    it('if more than one value passed to the other options')
    it('if the option --config is missed')
    it('if no value is passed to option --config, --input or --output')
    it('if any option or its alias is passed more than one times')

    it('if input option lead to a non-existent file')
    it('if input option lead to a directory')
    it('if output option lead to a non-existent file')
    it('if input option lead to a directory')

    it('if the --config option is started with dash')
    it('if the --config option is ended with dash')
    it('if any command of the --config option has wrong length')

    it('if the --config option has unknown cipher')
    it('if the --config option has no direction for the C or R cipher')
    it('if the --config option has a direction for the A cipher')
    it('if the --config option has a direction other than 0 or 1')
  })

  describe('input', function(){
    it('Should read from the file if --input or -i option is passed')
    it('Should read from the stdin if the --input option is not passed')
    it('Should allow to enter more than one line if reading from standard input')
    it('Should exit with code 0 if the application is stopped by SIGINT on reading from stdin')
  });

  describe('output', function () {
    it('Should write to the file if --output or -o options is passed')
    it('Should not overwrite existing file content')
    it('Should write to the stdout if the --output option is not passed')
  })

  describe('ciphering', function () {
    it('Should cipher only english alphabet symbols')
  })

  describe('examples', function () {
    it('c "C1-C1-R0-A" -i "./input.txt" -o "./output.txt"')
    it('-c "C1-C0-A-R1-R0-A-R0-R0-C1-A" -i "./input.txt" -o "./output.txt"')
    it('-c "A-A-A-R1-R0-R0-R0-C1-C1-A" -i "./input.txt" -o "./output.txt"')
    it('-c "C1-R1-C0-C0-A-R0-R1-R1-A-C1" -i "./input.txt" -o "./output.txt"')
  })
})