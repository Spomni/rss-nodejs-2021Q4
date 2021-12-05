const { fromSrc } = global.testEnv

jest.mock(fromSrc('./app/lib/uuid'))

const { generate, validate } = require(fromSrc('./app/lib/uuid'))
const { StorableInterface } = require(fromSrc('./app/model/storable-interface'))
const { createPerson, Person, isPerson } = require(fromSrc('app/model/person'))

const defaultPersonLike = {
  id: 'uuid',
  name: 'some',
  age: 23,
  hobbies: ['swimming']
}

function createDefaultPerson() {
  return createPerson(defaultPersonLike)
}

describe('person', () => {

  beforeEach(() => validate.mockReturnValue(true))
  afterEach(() => jest.resetAllMocks())

  describe('createPerson()', () => {
    it('should return a new Person instance', () => {

      const personLike = {
        id: 'uuid',
        name: 'some',
        age: 23,
        hobbies: ['swimming']
      }

      const person = createPerson(personLike)

      expect(person).toBeInstanceOf(Person)
    })
  })

  describe('Person', () => {

    describe('constructor()', () => {

      it('should throw an error if options are not passed', () => {
        const callCreatePerson = () => createPerson()
        expect(callCreatePerson).toThrow()
      })

      it('should throw an error if the id option is not valid',
       () => {

          validate.mockReturnValue(false)

          const personLike = {
            id: 'uuid',
            name: 'some',
            age: 23,
            hobbies: ['swimming']
          }

          const callCreatePerson = () => createPerson(personLike)

          expect(callCreatePerson).toThrow('invalid id')
       })

      it('should throw an error if the name option is not valid', () => {

        const personLike = {
          id: 'uuid',
          name: {},
          age: 23,
          hobbies: ['swimming']
        }

        const callCreatePerson = () => createPerson(personLike)

        expect(callCreatePerson).toThrow('invalid name')
      })

      it('should throw an error if the age option is not valid', () => {

        const personLike = {
          id: 'uuid',
          name: 'some',
          age: {},
          hobbies: ['swimming']
        }

        const callCreatePerson = () => createPerson(personLike)

        expect(callCreatePerson).toThrow('invalid age')
      })

      it('should throw an error if the hobbies option is not valid', () => {

        const fixture = [
          'swimming',
          [1, 2, 3]
        ]

        fixture.forEach((hobbies) => {
          const personLike = {
            hobbies,
            id: 'uuid',
            name: 'some',
            age: 23,
          }

          const callCreatePerson = () => createPerson(personLike)

          expect(callCreatePerson).toThrow('invalid hobbies')
        })
      })

      it('should attach passed values to the matching properties of this', () => {

        const personLike = {
          id: 'uuid',
          name: 'some',
          age: 23,
          hobbies: []
        }

        const person = createPerson(personLike)

        Object.entries(personLike).forEach(([key, value]) => {
          if (key !== 'hobbies') {
            expect(person[key]).toBe(value)
          } else {
            expect(person[key]).not.toBe(value)
            expect(person[key]).toEqual(value)
          }
        })
      })

      it('should implement StorableInterface', () => {
        const person = createDefaultPerson()
        expect(person).toBeInstanceOf(StorableInterface)
      })
    })

    describe(`#id`, () => {

      it('should has an id value', () => {
        const person = createDefaultPerson()
        expect(person.id).toBe(defaultPersonLike.id)
      })

      it('should throw an error if passed value is not valid', () => {
        validate.mockReturnValueOnce(false)
        const callCreatePerson = () => createPerson(defaultPersonLike)
        expect(callCreatePerson).toThrowError('invalid id')
      })
    })

    describe(`#name`, () => {

      it('should has a name value', () => {
        const person = createDefaultPerson()
        expect(person.name).toBe(defaultPersonLike.name)
      })

      it('should throw an error if passed value is not valid', () => {
        const personLike = Object.assign({}, defaultPersonLike, { name: {} })
        const callCreatePerson = () => createPerson(personLike)
        expect(callCreatePerson).toThrowError('invalid name')
      })
    })

    describe(`#age`, () => {

      it('should has an age value', () => {
        const person = createDefaultPerson()
        expect(person.age).toBe(defaultPersonLike.age)
      })

      it('should throw an error if passed value is not valid', () => {
        const personLike = Object.assign({}, defaultPersonLike, { age: {} })
        const callCreatePerson = () => createPerson(personLike)
        expect(callCreatePerson).toThrowError('invalid age')
      })
    })

    describe(`#hobbies`, () => {
      it('should has a copy of hobbies value', () => {
        const person = createDefaultPerson()
        expect(person.hobbies).not.toBe(defaultPersonLike.hobbies)
      })

      it('should throw an error if passed value is not valid', () => {
        const personLike = Object.assign({}, defaultPersonLike, { hobbies: {} })
        const callCreatePerson = () => createPerson(personLike)
        expect(callCreatePerson).toThrowError('invalid hobbies')
      })

      it('should not be changed if an array passed to the constructor is changed', () => {
        const hobbies = ['one', 'two']
        const personLike = Object.assign({}, defaultPersonLike, { hobbies })
        const person = createPerson(personLike)
        hobbies[0] = 'three'
        expect(person.hobbies).not.toEqual(hobbies)
      });
    })

    describe('#toPlain()', () => {

      it('should return a plain object', () => {
        const person = createDefaultPerson()
        const plain = person.toPlain()
        const plainProto = Object.getPrototypeOf(plain)
        const expectedProto = Object.getPrototypeOf({})

        expect(plainProto).toBe(expectedProto)
      })

      it('should return object with properties corresponding to original person instance', () => {
        const person = createDefaultPerson()
        const plain = person.toPlain()

        const plainEntries = Object.entries(plain)
        const expectedEntries = Object.entries(defaultPersonLike)

        expect(plainEntries).toEqual(expectedEntries)
      })
    })
  })

  describe('isPerson()', () => {

    it('should return true if passed value is an instance of Person', () => {
      const person = createDefaultPerson()
      expect(isPerson(person)).toBe(true)
    })

    it('should return false if passed value is not an instance of Person', () => {
      expect(isPerson(defaultPersonLike)).toBe(false)
    })
  })
})
