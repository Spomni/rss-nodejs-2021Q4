describe('transform', function () {
  
  describe('exports', function () {
  
    it('Should export the RotTransformer class extending the Transform class of the stream module')

    it('Should export the CaesarEncode class extending the RotTransformer one')
    it('Should export the CaesarDecode class extending the RotTransformer one')

    it('Should export the Rot8Encode class extending the RotTransformer one')
    it('Should export the Rot8Decode class extending the RotTransformer one')

    it('Should export the AtbashTransformer class extending the Transform class of the stream module')
  })
  
  describe('RotTransformer', () => {
  
    describe('constructor()', function () {
      it('Should throw an error if the "shifting" option is not passed')
      it('Should throw an error if the "direction" option is not passed')
      it('Should return a transform stream')
    })
    
    describe('#shifting', function () => {
      it('Should be read only')
      it('Should contains a value of the shifting passed to the constructor')
    })
    
    describe('#direction', function () => {
      it('Should be read only')
      it('Should contains a value of the shifting passed to the constructor')
    })
    
    describe('._transform()', () => {
      it('Should replace each letter of the string with the letter that number in the alphabet differ by the shifting value')
      it('If the shifted number is out from the alphabet numbers count should continue shifting from the alphabet start')
      it('Should work fine with lowercase and uppercase symbols')
      it('Should not replace non-alphabet symbols')
    })
  })
  
  describe('CaesarEncoder', function () {
    describe('constructor()', function () {
      it('Should set the instance "sifting" value to 1')
      it('Should set the instance "direction" value to "right"')
    })
  })
  
  describe('CaesarDecoder', function () {
    describe('constructor()', function () {
      it('Should set the instance "sifting" value to 1')
      it('Should set the instance "direction" value to "left"')
    })
  })
  
  describe('Rot8Encoder', function () {
    describe('constructor()', function () {
      it('Should set the instance "sifting" value to 8')
      it('Should set the instance "direction" value to "right"')
    })
  })
  
  describe('Rot8Decoder', function () {
    describe('constructor()', function () {
      it('Should set the instance "sifting" value to 8')
      it('Should set the instance "direction" value to "left"')
    })
  })
  
  describe('AtbashTransformer', function () {
    describe('._transform()', () => {
      it('Should replace each letter of the string with the letter that number is reversed')
      it('Should work fine with lowercase and uppercase symbols')
      it('Should not replace non-alphabet symbols')
    })
  })
})
