describe('RotTransformer', () => {

  describe('static', () => {
    describe('DIRECTION_', () => {
      it.todo('Should return an object')
      it.todo('Should have a property RIGHT')
      it.todo('Should have a property LEFT')
    });
  });

  describe('constructor()', () => {
    it.todo('Should throw an error if invalid shifting is passed')
    it.todo('Should throw an error if invalid direction is passed')
    it.todo('should return a Transform stream')
  });

  describe('shifting', () => {
    it.todo('Should return value passed to the constructor')
  });

  describe('direction', () => {
    it.todo('should return value passed to the constructor')
  });

  describe('_transform', () => {
    it.todo('Should increase codes by shifting if direction is RIGHT')
    it.todo('Should decrease codes by shifting if direction is LEFT')
    it.todo('Should change only codes of the english alphabet')
  });
});