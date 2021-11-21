describe('validate-helpers.js', () => {

  describe('validateInput()', () => {
    it('Should throw an error if the function is called without arguments')
    it('Should throw an error if no access to read file')
    it('Should throw an error if passed file is direcvtory')
  });

  describe('validateOutput()', () => {
    it('Should throw an error if the function is called without arguments')
    it('Should throw an error if no access to write file')
    it('Should throw an error if passed file is direcvtory')
  });

  describe('validateConfig()', () => {
    it('Should throw an error if the function is called without arguments')
    it('Should throw an error if passed config is not string')
    it('Should throw an error if config starts from a dash')
    it('Should throw an error if config ends with a dash')
    it('Should throw an error if any config command has unknown cipher')
    it('Should throw an error if any config command has invalid ciphering direction')
    it('Should throw an error if any config command has invalid length')
  });
});
