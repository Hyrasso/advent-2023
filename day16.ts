type Ray = {
    pos: {row: number, col: number},
    direction: string
}

const test_input = `.|...\\....
|.-.\\.....
.....|-...
........|.
..........
.........\\
..../.\\\\..
.-.-/..|..
.|....-|.\\
..//.|....`

function parse(text: string) {
    return text.split("\n").map((line) => line.split(""))
}

function find_next_pos(ray: Ray) {
    if (ray.direction == 'E') {
        return {col: ray.pos.col + 1, row: ray.pos.row}
    } else if (ray.direction == 'S') {
        return {row: ray.pos.row + 1, col: ray.pos.col}
    } else if (ray.direction == 'W') {
        return {col: ray.pos.col - 1, row: ray.pos.row}
    } else /* if (ray.direction == 'N') */ {
        return {row: ray.pos.row - 1, col: ray.pos.col}
    }
}

function solve(mirrors: string[][], init_ray: Ray) {
    let rays: Ray[] = [init_ray]
    let energized = new Set()

    while (rays.length > 0) {
        let ray = rays.pop()
        // console.debug(ray, rays.length)
        if (energized.has(JSON.stringify(ray))) {
            // console.debug('already visited')
            continue
        }
        energized.add(JSON.stringify(ray))

        let next_pos = find_next_pos(ray)
        let mirror_row = mirrors[next_pos.row]
        if (mirror_row === undefined) {
            continue
        }
        let mirror = mirror_row[next_pos.col]
        if (mirror === undefined) {
            continue
        }

        if (mirror == ".") {
            rays.push({pos: next_pos, direction: ray.direction})
        } else if (mirror == '/') {
            const M = {"E": 'N', "N": "E", "W": "S", "S": "W"}
            rays.push({pos: next_pos, direction: M[ray.direction]})
        } else if (mirror == '\\') {
            const M = {"E": 'S', "N": "W", "W": "N", "S": "E"}
            rays.push({pos: next_pos, direction: M[ray.direction]})
        } else if (mirror == '|') {
            if (ray.direction == 'W' || ray.direction == 'E') {
                rays.push({pos: next_pos, direction: "N"})
                rays.push({pos: next_pos, direction: "S"})
            } else {
                rays.push({pos: next_pos, direction: ray.direction})
            }
        } else if (mirror == '-') {
            if (ray.direction == 'S' || ray.direction == 'N') {
                rays.push({pos: next_pos, direction: "E"})
                rays.push({pos: next_pos, direction: "W"})
            } else {
                rays.push({pos: next_pos, direction: ray.direction})
            }
        }
    }
    // console.log(energized)
    let c = new Set()
    for (let v of energized) {
        c.add(JSON.stringify([JSON.parse(v).pos.col, JSON.parse(v).pos.row]))
    }
    return c.size - 1
}

function solve2(mirrors: string[][]) {
    let max = 0
    for (let row=0;row < mirrors.length;row += 1) {
        max = Math.max(max, solve(mirrors, {pos: {col: -1, row: row}, direction: 'E'}))
        max = Math.max(max, solve(mirrors, {pos: {col: mirrors[0].length, row: row}, direction: 'W'}))
    }
    for (let col=0;col < mirrors[0].length;col += 1) {
        max = Math.max(max, solve(mirrors, {pos: {row: -1, col: col}, direction: 'S'}))
        max = Math.max(max, solve(mirrors, {pos: {row: mirrors.length, col: col}, direction: 'N'}))
    }
    return max
}
let text_input = Deno.readTextFileSync("input/day16.txt")
let mirrors = parse(text_input)
// console.log(solve(mirrors, {pos: {row: 0, col: -1}, direction: 'E'}))
console.log(solve2(mirrors))