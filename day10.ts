const test_input_1 = `..F7.
.FJ|.
SJ.L7
|F--J
LJ...`

const test_input_2 = `FF7FSF7F7F7F7F7F---7
L|LJ||||||||||||F--J
FL-7LJLJ||||||LJL-77
F--JF--7||LJLJ7F7FJ-
L---JF-JLJ.||-FJLJJ7
|F|F-JF---7F7-L7L|7|
|FFJF7L7F-JF7|JL---7
7-L-JL7||F7|L7F-7F7|
L.L7LFJ|||||FJL7||LJ
L7JLJL-JLJLJL--JLJ.L`

const neighbors = {
    "|" : (i, j) => [[i - 1, j], [i + 1, j]],
    "-" : (i, j) => [[i, j-1], [i, j+1]],
    "L" : (i, j) => [[i-1, j], [i, j+1]],
    "J" : (i, j) => [[i-1, j], [i, j-1]],
    "7" : (i, j) => [[i, j-1], [i+1, j]],
    "F" : (i, j) => [[i, j+1], [i+1, j]],
    "." : (i, j) => undefined,
}

function parse(text) {
    const graph = {}
    let start = [undefined, undefined]
    text.split("\n").forEach((row, i) => row.split("").forEach((pipe, j) => {
        if (pipe == "S") {
            start = [i, j]
        }
        graph[[i, j]] = pipe
        // graph[[i, j]] = neighbors[pipe](i, j)
    }))
    // infer shape for start
    let candidates = ["|", "-", "L", "J", "7", "F"]
    if (new Set(["|", "7", "F"]).has(graph[[start[0] - 1, start[1]]] || "")) {
        candidates = candidates.filter((c) => !new Set(["-", "7", "F"]).has(c))
    }
    if (new Set(["|", "L", "J"]).has(graph[[start[0] + 1, start[1]]] || "")) {
        candidates = candidates.filter((c) => !new Set(["-", "L", "J"]).has(c))
    }
    if (new Set(["-", "L", "F"]).has(graph[[start[0], start[1] - 1]] || "")) {
        candidates = candidates.filter((c) => !new Set(["|", "L", "F"]).has(c))
    }
    if (new Set(["-", "J", "7"]).has(graph[[start[0], start[1] + 1]] || "")) {
        candidates = candidates.filter((c) => !new Set(["|", "J", "7"]).has(c))
    }
    console.log("S is", candidates)
    graph[start] = candidates[0]
    return [graph, start]
}

function solve(graph, start) {
    const dists = {}
    dists[start] = 0
    let [left, right] = neighbors[graph[start]](...start)
    let dist = 0

    const next_neighbor = (pipe) => {
        const [left, right] = neighbors[graph[pipe]](...pipe)
        return (left in dists) ? right : left
    }
    while (true) {
        dist += 1
        dists[left] = dist
        dists[right] = dist
        // console.log(dists)
        // console.log(left, right, dist)
        if (left[0] === right[0] && left[1] === right[1]) {
            break
        }
        left = next_neighbor(left)
        right = next_neighbor(right)
    }
    // part 2
    const min_row = Object.keys(dists).map((pos) => parseInt(pos.split(",")[0])).reduce((acc, pos) => acc < pos ? acc: pos)
    const min_col = Object.keys(dists).map((pos) => parseInt(pos.split(",")[1])).reduce((acc, pos) => acc < pos ? acc: pos)
    const max_row = Object.keys(dists).map((pos) => parseInt(pos.split(",")[0])).reduce((acc, pos) => acc > pos ? acc: pos)
    const max_col = Object.keys(dists).map((pos) => parseInt(pos.split(",")[1])).reduce((acc, pos) => acc > pos ? acc: pos)
    // console.log(dists)
    // console.log(min_col, min_row, max_col, max_row)
    let in_count = 0
    for (let rowi = min_row; rowi <= max_row;rowi+=1) {
        // +-1 to start outside the loop
        let is_in = 0
        // to check if an actual cross or just LJ / F7
        let last_pipe = 0
        for (let colj = min_col - 1;colj <= max_col;colj += 1) {
            if (dists[[rowi, colj]] !== undefined) {
                // console.log(rowi, colj, graph[[rowi, colj]], is_in, last_pipe)
                if (graph[[rowi, colj]] == "|") {
                    is_in = 1 - is_in
                } else if (graph[[rowi, colj]] == "L") {
                    last_pipe = -1
                } else if (graph[[rowi, colj]] == "F") {
                    last_pipe = 1
                } else if (graph[[rowi, colj]] == "J") {
                    if (last_pipe == 1) {
                        is_in = 1 - is_in
                    }
                    last_pipe = 0
                } else if (graph[[rowi, colj]] == "7") {
                    if (last_pipe == -1) {
                        is_in = 1 - is_in
                    }
                    last_pipe = 0
                } else if (graph[[rowi, colj]] == "-") {
                    // do nothing
                }
            } else {
                in_count += is_in
            }
        }
    }
    return [dist, in_count]
}

const text_input = await Deno.readTextFile("input/day10.txt")
const [graph, start] = parse(text_input)
console.log(solve(graph, start))