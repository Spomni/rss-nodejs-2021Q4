describe('cipher', function {

  describe('exports', function () {
    it('Should export a function as cipher propety')
    it('Should export the CipherError class')
    it('Should export the MissedConfigError class')
    it('Should export the InvalidConfigError class')
    it('Should export the UnavaibleInputError class')
    it('Should export the UnavaibleOutputError class')
    it('All exported errors classes should extend the CipherError class')
  })
  
  describe('cipher()', function () {
  
    it('Should throw a MissedConfigError instance if the config option is not passed')
    it('Should throw a InvalidConfigError instance if the config option is not valid')

    it('Should read from the stdin if the input option is not passed')
    it('Should read from the file described on the input option')
    it('Should throw an UnavaibleInputError instance if input file is not accessed to reading')

    it('Should write to the stdout if the output option is not passed')
    it('Should write the file described on the output option')
    it('Should throw an UnavaibleOutputError instance if output file is not accessed to reading')

    it('Should append output to the file content')
    it('Should write to the output every times when input takes data')

    it('Should transform english alphabet symbols only')
    it(`Should transform lowercase and appercase`)
  })
})
