
const test_input = `0 3 6 9 12 15
1 3 6 10 15 21
10 13 16 21 30 45`

function parse(text: string) {
    return text.split("\n").map((line) => line.split(" ").map((num) => parseInt(num)))
}

function solve(hists) {
    const nexts = hists.map((hist) => {
        const diffs: number[][] = [hist];
        while (!diffs[diffs.length-1].reduce((a, b) => a && b == 0, true)) {
            const diff = []
            for (let i=1;i<diffs[diffs.length-1].length;i++) {
                diff.push(diffs[diffs.length - 1][i] - diffs[diffs.length - 1][i - 1])
            }
            diffs.push(diff)
        }
        // console.log(diffs)
        const next = diffs.map((diff) => diff[0]).reverse().reduce((a, b) => b - a)
        // console.log(next)
        return next
    })
    return nexts.reduce((a, b) => a + b)
}

const text_input = await Deno.readTextFile("input/day9.txt")
const inp = parse(text_input)
console.log(solve(inp))