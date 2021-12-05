const { chainPrototype } = require('../../src/lib/chain-prototype')

function createPrototypeChain(...siblings) {

  siblings.forEach((parent, index) => {
    if (index === 0) return
    
    const child = siblings[index - 1]
    Object.setPrototypeOf(child, parent)
  })
  
  return siblings[0]
}

describe('chain-prototype', () => {

  describe('chainPrototype()', () => {
    
    it('should return object passed as child option', function () {
      const child = {}
      expect(chainPrototype(child, {})).toBe(child)
    })

    it('should add parent as child prototype', function () {
      const child = {}
      const parent = { parent: 'i am' }
      
      chainPrototype(child, parent)

      const proto = Object.getPrototypeOf(child)

      expect(proto).toBe(parent)
    })

    it('should add parent as prototype of original proto with number shifting plus one', function () {

      const siblings = [{}, {}, {}, {}, {}]
      const child = createPrototypeChain(...siblings)
      const parent = {}
      const shifting = 1

      chainPrototype(child, parent, shifting)
      
      const proto = Object.getPrototypeOf(siblings[shifting])
      
      expect(proto).toBe(parent)
    })

    it('should add parent as last prototype in chain if shifting options is greater than cain length', function () {
      const siblings = [{}, {}, {}, {}, {}]
      const child = createPrototypeChain(...siblings)
      const parent = {}
      const shifting = 6
      
      chainPrototype(child, parent, shifting)
      
      const proto = Object.getPrototypeOf(siblings[siblings.length - 1])
      
      expect(proto).toBe(parent)
    })
  })
})