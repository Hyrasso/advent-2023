
const test_input = `O....#....
O.OO#....#
.....##...
OO.#O....O
.O.....O#.
O.#..O.#.#
..O..#O..O
.......O..
#....###..
#OO..#....`

function parse(text:string) {
    const lines = text.split("\n")
    const cols = []
    for (let i=0;i < lines[0].length;i+=1) {
        cols.push(lines.map((line) => line[i]))
    }
    return cols
}

function solve(cols: string[][]) {
    return cols.map((col) => {
        let last_dot = undefined
        for (let i=0;i < col.length;i+=1) {
            const c = col[i]
            if (c == ".") {
                if (last_dot === undefined) {
                    last_dot = i
                }
            } else if (c == "#") {
                last_dot = undefined
            } else if (c == "O") {
                if (last_dot !== undefined) {
                    col[last_dot] = "O"
                    col[i] = "."
                    last_dot += 1
                }
            }
        }
        // console.log(load)
        return col
    }).reduce((acc, col) => acc + col.reverse().reduce((acc, c, i) => acc + ((c == "O") ? i + 1 : 0), 0), 0)
}

const text_input = Deno.readTextFileSync("input/day14.txt")
const cols = parse(text_input)

console.log(solve(cols))