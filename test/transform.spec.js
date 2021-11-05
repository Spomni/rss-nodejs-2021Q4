const { Transform, Readable, Writable, PassThrough } = require('stream')
const { assert } = require('chai')

const {
  RotTransformer,
  CaesarEncoder,
  CaesarDecoder,
  Rot8Encoder,
  Rot8Decoder,
} = require('../lib/transform')

function testTransformer(transformer, input, check) {

  const read = new Readable({ read: () => {} })

  read
    .pipe(transformer)
    .pipe(new PassThrough())
      .on(`data`, (data) => check(data.toString()))

  read.push(input)
}

describe('transform', function () {

  const { RIGHT, LEFT } = RotTransformer.DIRECTION_
  const { RotTransformerError } = RotTransformer
  
  describe('exports', function () {
  
    it('Should export the RotTransformer class extending the Transform class of the stream module', function () {
      assert.instanceOf(new RotTransformer(1, RIGHT), Transform)
    })

    it('Should export the CaesarEncode class extending the RotTransformer one', () => {
      assert.instanceOf(new CaesarEncoder(), RotTransformer)
    })
    it('Should export the CaesarDecode class extending the RotTransformer one', () => {
      assert.instanceOf(new CaesarDecoder(), RotTransformer)
    })

    it('Should export the Rot8Encoder class extending the RotTransformer one', () => {
      assert.instanceOf(new Rot8Encoder(), RotTransformer)
    })
    it('Should export the Rot8Decoder class extending the RotTransformer one', () => {
      assert.instanceOf(new Rot8Decoder(), RotTransformer)
    })

    it('Should export the AtbashTransformer class extending the Transform class of the stream module')
  })
  
  describe('RotTransformer', () => {
  
    describe('static', function () {

      it('Should have the static property "DIRECTION_" that contains the propertirs "RIGHT" and "LEFT"', function () {
        assert.property(RotTransformer, 'DIRECTION_')
        assert.property(RotTransformer.DIRECTION_, 'LEFT')
        assert.property(RotTransformer.DIRECTION_, 'RIGHT')
      })
      
      it('Should has the property RotTransformerError that extends the Error class', function () {
        const { RotTransformerError } = RotTransformer
        assert.instanceOf(new RotTransformerError(), Error)
      })
    })
  
    describe('constructor()', function () {

      it('Should throw an error if the "shifting" option is not passed', function () {
        assert.throws(
          () => new RotTransformer(undefined, RIGHT),
          RotTransformerError
        )
      })

      it('Should throw an error if the "direction" option is not passed', function () {
        assert.throws(
          () => new RotTransformer(3),
          RotTransformerError
        )
      })
      
      it('Should return a transform stream')
    })
    
    describe('#shifting', function () {

      it('Should be read only', () => {
        const rot = new RotTransformer(1, RIGHT)
        rot.shifting = 0
        assert.strictEqual(rot.shifting, 1)
      })

      it('Should contains a value of the shifting passed to the constructor', () => {
        const rot = new RotTransformer(1, RIGHT)
        rot.shifting = 0
        assert.strictEqual(rot.shifting, 1)
      })
    })
    
    describe('#direction', function () {
      it('Should be read only', () => {
        const rot = new RotTransformer(1, RIGHT)
        rot.direction = 0
        assert.strictEqual(rot.direction, RIGHT)
      })

      it('Should contains a value of the shifting passed to the constructor', () => {
        const rot = new RotTransformer(1, RIGHT)
        rot.direction = 0
        assert.strictEqual(rot.direction, RIGHT)
      })
    })
    
    describe('._transform()', () => {

      it('Should replace each letter of the string with the letter that number in the alphabet differ by the shifting value', () => {
        
        testTransformer(
          new RotTransformer(1, RIGHT),
          'abc',
          (res) => assert.strictEqual(res, 'bcd')
        )
        
        testTransformer(
          new RotTransformer(1, LEFT),
          'xyz',
          (res) => assert.strictEqual(res, 'wxy')
        )
        
        testTransformer(
          new RotTransformer(3, LEFT),
          'NOP',
          (res) => assert.strictEqual(res, 'KLM')
        )
      })

      it('If the shifted number is out from the alphabet numbers count should continue shifting from the alphabet start or end', function () {
        
        testTransformer(
          new RotTransformer(3, RIGHT),
          'xyz',
          (res) => assert.strictEqual(res, 'abc')
        )
        
        testTransformer(
          new RotTransformer(2, LEFT),
          'abc',
          (res) => assert.strictEqual(res, 'yza')
        )
        
        testTransformer(
          new RotTransformer(3, RIGHT),
          'XYz',
          (res) => assert.strictEqual(res, 'ABc')
        )
      })

      it('Should work fine with lowercase and uppercase symbols', () => {
        testTransformer(
          new RotTransformer(3, RIGHT),
          'xYz',
          (res) => assert.strictEqual(res, 'aBc')
        )
      })
      
      it('Should not replace non-alphabet symbols', () => {

        testTransformer(
          new RotTransformer(3, RIGHT),
          'йцг',
          (res) => assert.strictEqual(res, 'йцг')
        )
      
        testTransformer(
          new RotTransformer(3, RIGHT),
          'x-z',
          (res) => assert.strictEqual(res, 'a-c')
        )
      })
    })
  })
  
  describe('CaesarEncoder', function () {
    describe('constructor()', function () {
      it('Should set the instance "shifting" value to 1', () => {
        const caesar = new CaesarEncoder()
        assert.strictEqual(caesar.shifting, 1)
      })
      
      it('Should set the instance "direction" value to "right"', () => {
        const caesar = new CaesarEncoder()
        assert.strictEqual(caesar.direction, RIGHT)
      })
    })
  })
  
  describe('CaesarDecoder', function () {
    describe('constructor()', function () {
      it('Should set the instance "sifting" value to 1', () => {
        const caesar = new CaesarDecoder()
        assert.strictEqual(caesar.shifting, 1)
      })
      
      it('Should set the instance "direction" value to "left"', () => {
        const caesar = new CaesarDecoder()
        assert.strictEqual(caesar.direction, LEFT)
      })
    })
  })
  
  describe('Rot8Encoder', function () {
    describe('constructor()', function () {
      it('Should set the instance "shifting" value to 8', () => {
        const rot8 = new Rot8Encoder()
        assert.strictEqual(rot8.shifting, 8)
      })

      it('Should set the instance "direction" value to "right"', () => {
        const rot8 = new Rot8Encoder()
        assert.strictEqual(rot8.direction, RIGHT)
      })
    })
  })
  
  describe('Rot8Decoder', function () {
    describe('constructor()', function () {
      it('Should set the instance "sifting" value to 8', () => {
        const rot8 = new Rot8Decoder()
        assert.strictEqual(rot8.shifting, 8)
      })
      
      it('Should set the instance "direction" value to "left"', () => {
        const rot8 = new Rot8Decoder()
        assert.strictEqual(rot8.direction, LEFT)
      })
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
