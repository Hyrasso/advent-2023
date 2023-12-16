type Lens = {
    label: number[],
    focal: number
}

const test_input = `rn=1,cm-,qp=3,cm=2,qp-,pc=4,ot=9,ab=5,pc-,pc=6,ot=7`

function parse(text: string) {
    return text.split(",").map((block) => block.split("").map((c) => c.charCodeAt(0)))
}

function hash(s) {
    return s.reduce((acc, code) => ((acc + code) * 17) % 256, 0)
}
function solve(steps: number[][]) {
    let boxes: Lens[][] = new Array(256)
    for (let i = 0 ; i < 256; i += 1) {
        boxes[i] = []
    }
    for (let step of steps) {
        // console.log(step.map((c) => String.fromCharCode(c)))
        if (step[step.length - 1] == "-".charCodeAt(0)) {
            let label = step.slice(0, -1)
            let bidx = hash(label)
            boxes[bidx] = boxes[bidx].filter((lens) => !lens.label.every((c, idx) => c == label[idx]))

        } else {
            let label = step.slice(0, -2)
            let bidx = hash(label)
            let focal = step[step.length - 1]
            let is_replaced = false
            for (let lens of boxes[bidx]) {
                if (lens.label.every((c, idx) => c == label[idx])) {
                    lens.focal = focal
                    is_replaced = true
                }
            }
            if (!is_replaced) {
                boxes[bidx].push({label: label, focal: focal})
            }
        }
        // console.log(boxes.map((b, i) => [b, i]).filter(([lenses, i]) => lenses.length > 0))
    }
    return boxes.flatMap((box, i) => box.map((lens, li) => (1 + i) * (li + 1) * (lens.focal - "0".charCodeAt(0)))).reduce((a, b) => a + b)
}

const text_input = Deno.readTextFileSync("input/day15.txt")
const steps = parse(text_input)
console.log(solve(steps))