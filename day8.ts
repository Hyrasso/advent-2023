const test_input = `LLR

AAA = (BBB, BBB)
BBB = (AAA, ZZZ)
ZZZ = (ZZZ, ZZZ)`

function parse(text: string) {
    const [directions, lines] = text.split("\n\n")
    const graph = {}
    for (const line of lines.split("\n")) {
        const [from, to] = line.split(" = ")
        console.log(from, to)
        const [to_left, to_right] = to.slice(1, -1).split(", ")
        graph[from] = [to_left, to_right]
    }
    return [directions, graph]
}

function solve(directions: string, graph: Graph) {
    let node = "AAA"
    let steps = 0
    while (node != "ZZZ") {
        node = (directions[steps % directions.length] == "L") ? graph[node][0] : graph[node][1]
        steps += 1
    }
    return steps
}

const text_input = await Deno.readTextFile("input/day8.txt")
const [directions, graph] = parse(text_input)

console.log(solve(directions, graph))

