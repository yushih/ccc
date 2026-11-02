import { expect, it } from 'vitest'
import { placeNodes } from './placement'
it('keeps dragged positions and places new IDs deterministically', () => {
  const positions = { owner: { x: 45, y: 90 } }
  const result = placeNodes(['owner', 'wallet'], positions)
  expect(result.owner).toEqual({ x: 45, y: 90 })
  expect(result.wallet).toEqual(placeNodes(['owner', 'wallet'], positions).wallet)
  expect(placeNodes(['wallet'], result)).not.toHaveProperty('owner')
})
it('does not treat inherited object properties as node positions', () => {
  expect(placeNodes(['constructor', '__proto__'], {})).toEqual({ constructor: { x: 0, y: 0 }, ['__proto__']: { x: 240, y: 0 } })
})
