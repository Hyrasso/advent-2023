
const test_input = `R 6 (#70c710)
D 5 (#0dc571)
L 2 (#5713f0)
D 2 (#d2c081)
R 2 (#59c680)
D 2 (#411b91)
L 5 (#8ceee2)
U 2 (#caa173)
L 1 (#1b58a2)
U 2 (#caa171)
R 2 (#7807d2)
U 3 (#a77fa3)
L 2 (#015232)
U 2 (#7a21e3)`

function parse(text: string) {
    const graph = {}
    graph[[0, 0]] = "init"
    let pos = {row: 0, col: 0}
    const D = {
        "R": [0, 1],
        "D": [1, 0],
        "L": [0, -1],
        "U": [-1, 0],
    }
    text.split("\n").map((line) => {
        let [dir, count, color] = line.split(" ")
        count = parseInt(count)
        let [drow, dcol] = D[dir]
        for (let i=0;i < count;i+=1) {
            pos.row += drow
            pos.col += dcol
            graph[[pos.row, pos.col]] = color
        }

    })
    return graph
}

function solve1(graph) {
    const visited = {}
    const to_visit = [[1, 1]]
    while (to_visit.length > 0) {
        const pos = to_visit.pop()
        visited[pos] = true
        for (let [drow, dcol] of [[0, 1], [1, 0], [-1, 0], [0, -1]]) {
            let next_pos = [pos[0] + drow, pos[1] + dcol] 
            if (visited[next_pos] !== undefined || graph[next_pos] !== undefined) {
                continue
            }
            to_visit.push(next_pos)
        }
    }
    // console.log(visited)
    return Object.keys(visited).length + Object.keys(graph).length
}

const text_input = Deno.readTextFileSync("input/day18.txt")
const graph = parse(text_input)
// console.log(graph)
console.log(solve1(graph))