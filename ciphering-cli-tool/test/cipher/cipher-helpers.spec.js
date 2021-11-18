describe('cipher-helpers', () => {
  
  describe('getInputStream():', function () {
    it.todo('Should return an instance of the InputSteam class')
  })
  
  describe('getOutputStream():', function () {
    it.todo('Should return an instance of the OutputSteam class')
  })
  
  describe('getTransformList():', function () {
    it.todo('Should return an array of transform streams')
    it.todo('Should place an AtbashTransformer instance at the same position where acommand "A" is')
    it.todo('Should place an CaesarEncoder instance at the same position where a command "C1" is')
    it.todo('Should place an CaesarDecoder instance at the same position where a command "C0" is')
    it.todo('Should place an Rot8Encoder instance at the same position where a command "R1" is')
    it.todo('Should place an Rot8Decoder instance at the same position where a command "R0" is')
  })
})
