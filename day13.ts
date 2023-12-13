
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

        let lines = block.split("\n").map((line) => line.split(""))
        for (let index = 0; index < lines.length - 1; index++) {
            let smudge = 0
            for (let i=0;i<lines.length;i+=1) {
                if (index - i < 0 || index + i + 1 >= lines.length) {
                    break
                }
                const count_diff = lines[index - i].reduce((acc, val, cidx) => acc + (val != lines[index + i + 1][cidx]), 0)
                // console.log(count_diff, lines[index - i], lines[index + i + 1])
                smudge += count_diff
            }
            // console.log(index, smudge)
            if (smudge == 1) {
                return (index + 1) * 100
            }
        }
        let lines_transposed = []
        let ll = lines[0].length
        for (let index = 0; index < ll; index++) {
            lines_transposed.push(lines.map((line) => line[index]))
        }
        // console.log(lines)
        // console.log(lines_transposed)
        lines = lines_transposed
        for (let index = 0; index < lines.length - 1; index++) {
            let smudge = 0
            for (let i=0;i<lines.length;i+=1) {
                if (index - i < 0 || index + i + 1 >= lines.length) {
                    break
                }
                const count_diff = lines[index - i].reduce((acc, val, cidx) => acc + (val != lines[index + i + 1][cidx]), 0)
                // console.log(count_diff, lines[index - i], lines[index + i + 1])
                smudge += count_diff
            }
            if (smudge == 1) {
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