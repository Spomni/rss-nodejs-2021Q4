function fromSrc(filename) {
  return global.testEnv.fromSrc(filename)
}

function fromTest(filename) {
  return global.testEnv.fromTest(filename)
}

jest.mock(fromSrc('app/model/storage'), () => ({
  storage: [],
}))

const uuid = require(fromSrc('app/lib/uuid'))
const { storage } = require(fromSrc('app/model/storage'))
const personApi = require(fromSrc('app/model/crud/person-api'))

const defaultPersonLike = {
  id: uuid.generate(),
  name: 'Joe',
  age: 19,
  hobbies: ['singing']
}

describe('person-api', () => {

  beforeEach(() => {
    storage.splice(0, storage.length)
  })

  afterEach(() => jest.resetAllMocks())

  describe('getAll()', () => {

    it('should return all stored persons', () => {

      const fixture = [
        Object.assign({}, defaultPersonLike, { id: uuid.generate() }),
        Object.assign({}, defaultPersonLike, { id: uuid.generate() }),
        Object.assign({}, defaultPersonLike, { id: uuid.generate() }),
      ]

      storage.push(...fixture)

      const result = personApi.getAll()

      expect(result).toEqual(fixture)
    });

    it('should return empty array if storage is empty', () => {
      const result = personApi.getAll()
      expect(result).toEqual([])
    });
  });

  describe('getById()', () => {

    it('should throw an error if passed id is not a valid person id', () => {
      const id = 'not-uuid'
      const callGetById = () => personApi.getById(id)
      expect(callGetById).toThrow('invalid id')
    });

    it('should return a person object with passed id', () => {

      const personLike = {
        id: uuid.generate(),
        name: 'Max',
        age: 34,
        hobbies: ['piano playing']
      }

      storage.push(
        Object.assign({}, defaultPersonLike, { id: uuid.generate() }),
        Object.assign({}, defaultPersonLike, { id: uuid.generate() }),
        Object.assign({}, defaultPersonLike, { id: uuid.generate() }),
        personLike,
      )

      const person = personApi.getById(personLike.id)

      expect(person).toEqual(personLike)
    });

    it('should return null if a storage does not contain person with passed id', () => {

      storage.push(
        Object.assign({}, defaultPersonLike, { id: uuid.generate() }),
        Object.assign({}, defaultPersonLike, { id: uuid.generate() }),
        Object.assign({}, defaultPersonLike, { id: uuid.generate() }),
      )

      const id = uuid.generate()

      expect(personApi.getById(id)).toBe(null)
    });
  });

  describe('create()', () => {

    describe('should throw an error if some field of passed value is an invalid person field', () => {

      it.each(
        [
          ['invalid name', { name: ['Joe', 'Pit'] }],
          ['invalid age', { age: 'nineteen' }],
          ['invalid hobbies', { hobbies: "singing" }],
        ]
      )('%s', (caseName, extendWith) => {

        const personLike = Object.assign({}, defaultPersonLike, extendWith)

        const callCreate = () => personApi.create(personLike)

        expect(callCreate).toThrow(caseName)
      })
    });

    it('should throw an error if passed value is not object', () => {
      const callCreate = () => personApi.create(true)
      expect(callCreate).toThrow('invalid')
    });

    it('should add person to the storage', () => {

      const personLike = {
        name: 'Max',
        age: 34,
        hobbies: ['piano playing']
      }

      personApi.create(personLike)

      Object.entries(storage[0]).forEach(([key, value]) => {
        if (!key === 'id') {
          expect(value).toBe(personLike[key])
        }
      })
    });

    it('should should return new person object', () => {

      const personLike = {
        name: 'Max',
        age: 34,
        hobbies: ['piano playing']
      }

      const person = personApi.create(personLike)
      personLike.id = person.id

      expect(person).not.toBe(personLike)
      expect(person).toEqual(personLike)
    });
  });

  describe('update()', () => {

    describe('should throw an error if some field of passed value is an invalid person field', () => {

      it.each(
        [
          ['invalid id', { id: 'not-uuid' }],
          ['invalid name', { name: ['Joe', 'Pit'] }],
          ['invalid age', { age: 'nineteen' }],
          ['invalid hobbies', { hobbies: "singing" }],
        ]
      )('%s', (caseName, extendWith) => {

        storage.push(Object.assign({}, defaultPersonLike))

        const personLike = Object.assign({}, defaultPersonLike, extendWith)
        const callUpdate = () => personApi.update(personLike)

        expect(callUpdate).toThrow(caseName)
      })
    });

    it('should return null if a storage does not contain person with passed id', () => {

      const result = personApi.update({ id: uuid.generate() })
      expect(result).toBe(null)
    });

    it('should update a person in storage', () => {

      storage.push(Object.assign({}, defaultPersonLike))

      const personLike = Object.assign({}, defaultPersonLike)

      const updated = personApi.update(personLike)

      expect(updated).not.toBe(personLike)
      expect(updated).toEqual(personLike)
      expect(personApi.getById(personLike.id)).toEqual(personLike)
    });
  });

  describe('delete()', () => {

    it('should throw an error if passed id is not a valid person id', () => {
      const callDelete = () => personApi.delete({ id: 'not-uuid' })
      expect(callDelete).toThrow('invalid id')
    });

    it('should return null if a storage does not contain person with passed id', () => {

      const result = personApi.delete({ id: uuid.generate() })
      expect(result).toBe(null)
    });

    it('should remove person with passed id from the storage', () => {

      storage.push(Object.assign({}, defaultPersonLike))

      const id = defaultPersonLike.id
      const result = personApi.delete({ id })
      expect(result).toBe(true)
      expect(personApi.getById(id)).toBe(null)
    });
  });
});