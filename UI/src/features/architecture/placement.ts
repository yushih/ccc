export type Positions = Record<string, { x: number; y: number }>
export function placeNodes(ids: string[], previous: Positions): Positions {
  return Object.fromEntries(ids.map((id, index) => [id, Object.hasOwn(previous, id) ? previous[id] : { x: (index % 2) * 240, y: Math.floor(index / 2) * 150 }]))
}
