
const test_input = `#.##..##.
..#.##.#.
##......#
##......#
..#.##.#.
..##..##.
#.#.##.#.

#...##..#
#....#..#
..##..###
#####.##.
#####.##.
..##..###
#....#..#`

function solve(text: string) {
    return text.split("\n\n").map((block, idx) => {

        let lines = block.split("\n")
        for (let index = 0; index < lines.length - 1; index++) {
            let is_mirror = true
            for (let i=0;i<lines.length;i+=1) {
                if (index - i < 0 || index + i + 1 >= lines.length) {
                    break
                }
                if (lines[index - i] !== lines[index + i + 1]) {
                    is_mirror = false
                }
            }
            if (is_mirror) {
                return (index + 1) * 100
            }
        }
        let lines_transposed = []
        let ll = lines[0].length
        for (let index = 0; index < ll; index++) {
            lines_transposed.push(lines.map((line) => line[index]).join(""))
        }
        // console.log(lines)
        // console.log(lines_transposed)
        lines = lines_transposed
        for (let index = 0; index < lines.length - 1; index++) {
            let is_mirror = true
            for (let i=0;i<lines.length;i+=1) {
                if (index - i < 0 || index + i + 1 >= lines.length) {
                    break
                }
                if (lines[index - i] !== lines[index + i + 1]) {
                    is_mirror = false
                }
            }
            if (is_mirror) {
                return index + 1
            }
        }
        console.log("Uhhhhh")
        console.log(idx, lines)
        return undefined
    }).reduce((a, b) => a + b)
}

const text_input = Deno.readTextFileSync("input/day13.txt")
console.log(solve(text_input))