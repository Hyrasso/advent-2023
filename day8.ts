const test_input = `LR

11A = (11B, XXX)
11B = (XXX, 11Z)
11Z = (11B, XXX)
22A = (22B, XXX)
22B = (22C, 22C)
22C = (22Z, 22Z)
22Z = (22B, 22B)
XXX = (XXX, XXX)`

function parse(text: string) {
    const [directions, lines] = text.split("\n\n")
    const graph = {}
    for (const line of lines.split("\n")) {
        const [from, to] = line.split(" = ")
        const [to_left, to_right] = to.slice(1, -1).split(", ")
        graph[from] = [to_left, to_right]
    }
    return [directions, graph]
}

const gcd = (a, b) => b == 0 ? a : gcd (b, a % b)
const lcm = (a, b) =>  a / gcd (a, b) * b

function solve(directions: string, graph) {
    let nodes = Object.keys(graph).filter((value) => value[2] == "A")
    console.log(nodes)
    let cycles = nodes.map((n) => findCycleLength(n, directions, graph))
    console.log(cycles)
    const res = cycles.map(([l, c]) => l).reduce(lcm)
    return res
}

function findCycleLength(node, directions, graph) {
    let step = 0
    const cache = {}
    while (!((cache[[node, step % directions.length]] !== undefined) && node[2] == "Z")) {
        cache[[node, step % directions.length]] = step
        node = (directions[step % directions.length] == "L") ? graph[node][0] : graph[node][1]
        step += 1
    }
    return [step - cache[[node, step % directions.length]], cache]
}

const text_input = await Deno.readTextFile("input/day8.txt")
const [directions, graph] = parse(text_input)

// console.log("digraph {")
// for (let key of Object.keys(graph)) {
//     console.log(key, "->", graph[key][0], ";")
//     console.log(key, "->", graph[key][1], ";")
// }
// console.log("}")
console.log(solve(directions, graph))

