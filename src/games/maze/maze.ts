/* ==========================================================================
   A heart-shaped maze, generated with a depth-first carve over a
   point-in-polygon heart mask. Deterministic per seed so a round can be
   replayed, but random enough to feel fresh every time.
   ========================================================================== */

export interface MazeCell {
  x: number
  y: number
}

export interface HeartMaze {
  size: number
  cells: Set<string>
  /** wall between (x,y) and (x+1,y) */
  wallsV: Set<string>
  /** wall between (x,y) and (x,y+1) */
  wallsH: Set<string>
  start: MazeCell
  goal: MazeCell
  distance: Map<string, number>
}

const key = (x: number, y: number) => `${x},${y}`

/** Normalised outline of the classic parametric heart, centred on [-1,1]. */
function heartPolygon() {
  const raw: { x: number; y: number }[] = []
  const segments = 160
  for (let i = 0; i < segments; i++) {
    const t = (i / segments) * Math.PI * 2
    raw.push({
      x: 16 * Math.pow(Math.sin(t), 3),
      y: 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t),
    })
  }
  const minX = Math.min(...raw.map((p) => p.x))
  const maxX = Math.max(...raw.map((p) => p.x))
  const minY = Math.min(...raw.map((p) => p.y))
  const maxY = Math.max(...raw.map((p) => p.y))
  return raw.map((p) => ({
    x: ((p.x - minX) / (maxX - minX)) * 2 - 1,
    y: ((p.y - minY) / (maxY - minY)) * 2 - 1,
  }))
}

function pointInPolygon(poly: { x: number; y: number }[], x: number, y: number) {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x
    const yi = poly[i].y
    const xj = poly[j].x
    const yj = poly[j].y
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }
  return inside
}

function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function buildHeartMaze(size = 11, seed = 42): HeartMaze {
  const poly = heartPolygon()
  const cells = new Set<string>()

  for (let gy = 0; gy < size; gy++) {
    for (let gx = 0; gx < size; gx++) {
      const u = (gx / (size - 1)) * 2 - 1
      const v = (gy / (size - 1)) * 2 - 1
      if (pointInPolygon(poly, u, v)) cells.add(key(gx, gy))
    }
  }

  const wallsV = new Set<string>()
  const wallsH = new Set<string>()
  for (const k of cells) {
    const [x, y] = k.split(',').map(Number)
    if (cells.has(key(x + 1, y))) wallsV.add(key(x, y))
    if (cells.has(key(x, y + 1))) wallsH.add(key(x, y))
  }

  const random = mulberry32(seed)

  // Depth-first carve
  const start = findBottomTip(cells, size)
  const visited = new Set<string>([key(start.x, start.y)])
  const stack: MazeCell[] = [start]

  const directions: [number, number][] = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ]

  while (stack.length) {
    const current = stack[stack.length - 1]
    const options = directions
      .map(([dx, dy]) => ({ dx, dy, nx: current.x + dx, ny: current.y + dy }))
      .filter((o) => cells.has(key(o.nx, o.ny)) && !visited.has(key(o.nx, o.ny)))

    if (options.length === 0) {
      stack.pop()
      continue
    }
    const pick = options[Math.floor(random() * options.length)]
    // remove the wall between current and the chosen neighbour
    if (pick.dx === 1) wallsV.delete(key(current.x, current.y))
    if (pick.dx === -1) wallsV.delete(key(current.x - 1, current.y))
    if (pick.dy === 1) wallsH.delete(key(current.x, current.y))
    if (pick.dy === -1) wallsH.delete(key(current.x, current.y - 1))

    visited.add(key(pick.nx, pick.ny))
    stack.push({ x: pick.nx, y: pick.ny })
  }

  // BFS for distances + goal
  const distance = new Map<string, number>()
  distance.set(key(start.x, start.y), 0)
  const queue: MazeCell[] = [start]
  let goal = start
  while (queue.length) {
    const cell = queue.shift() as MazeCell
    const d = distance.get(key(cell.x, cell.y)) ?? 0
    if (d > (distance.get(key(goal.x, goal.y)) ?? 0)) goal = cell
    for (const [dx, dy] of directions) {
      const nx = cell.x + dx
      const ny = cell.y + dy
      if (!cells.has(key(nx, ny))) continue
      if (distance.has(key(nx, ny))) continue
      const blocked =
        (dx === 1 && wallsV.has(key(cell.x, cell.y))) ||
        (dx === -1 && wallsV.has(key(cell.x - 1, cell.y))) ||
        (dy === 1 && wallsH.has(key(cell.x, cell.y))) ||
        (dy === -1 && wallsH.has(key(cell.x, cell.y - 1)))
      if (blocked) continue
      distance.set(key(nx, ny), d + 1)
      queue.push({ x: nx, y: ny })
    }
  }

  return { size, cells, wallsV, wallsH, start, goal, distance }
}

function findBottomTip(cells: Set<string>, size: number): MazeCell {
  let best = { x: Math.floor(size / 2), y: 0 }
  let bestY = -1
  cells.forEach((k) => {
    const [x, y] = k.split(',').map(Number)
    if (y > bestY) {
      bestY = y
      best = { x, y }
    }
  })
  return best
}

export function canMove(maze: HeartMaze, from: MazeCell, dx: number, dy: number): boolean {
  const nx = from.x + dx
  const ny = from.y + dy
  if (!maze.cells.has(key(nx, ny))) return false
  if (dx === 1 && maze.wallsV.has(key(from.x, from.y))) return false
  if (dx === -1 && maze.wallsV.has(key(from.x - 1, from.y))) return false
  if (dy === 1 && maze.wallsH.has(key(from.x, from.y))) return false
  if (dy === -1 && maze.wallsH.has(key(from.x, from.y - 1))) return false
  return true
}

export function cellToWorld(maze: HeartMaze, cell: MazeCell, cellSize: number): [number, number] {
  const half = (maze.size - 1) / 2
  return [(cell.x - half) * cellSize, (half - cell.y) * cellSize]
}
