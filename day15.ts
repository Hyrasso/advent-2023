
const test_input = `rn=1,cm-,qp=3,cm=2,qp-,pc=4,ot=9,ab=5,pc-,pc=6,ot=7`

function parse(text: string) {
    return text.split(",").map((block) => block.split("").map((c) => c.charCodeAt(0)))
}

function hash(s) {
    return s.reduce((acc, code) => ((acc + code) * 17) % 256, 0)
}
function solve(steps) {
    return steps.map(hash).reduce((a, b) => a + b)
}

const text_input = Deno.readTextFileSync("input/day15.txt")
const steps = parse(text_input)
console.log(solve(steps))