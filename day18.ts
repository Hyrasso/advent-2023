
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
    const segments = []
    let pos = {row: 0, col: 0}
    const D2 = {
        "0": [0, 1],
        "1": [1, 0],
        "2": [0, -1],
        "3": [-1, 0],
    }
    const D1 = {
        "R": [0, 1],
        "D": [1, 0],
        "L": [0, -1],
        "U": [-1, 0],
    }
    text.split("\n").map((line) => {
        let [dir, rcount, color] = line.split(" ")
        // let count = parseInt(rcount)
        // let [drow, dcol] = D1[dir]
        let count = parseInt(color.slice(2, 7), 16)
        let [drow, dcol] = D2[color.at(7)]
        let next_pos = {row: pos.row + drow * count, col: pos.col + dcol * count}
        segments.push([[pos.row, pos.col], [next_pos.row, next_pos.col]])
        pos = next_pos
    })
    return segments
}

function solve(segments: number[][]) {
    let rows = new Set(segments.map((seg) => seg[0][0]))
    rows = Array.from(rows.values()).toSorted((a, b) => a - b)
    let vertical_segments = segments.filter((seg) => seg[0][1] == seg[1][1]).toSorted((seg_1, seg_2) => seg_1[0][1] - seg_2[1][1])
    // downward segments
    vertical_segments = vertical_segments.map((seg) => seg.sort((a, b) => a[0] - b[0]))
    // console.log(vertical_segments)
    // console.log(rows)
    let surface = 0
    for (let rowi=0;rowi < rows.length - 1;rowi+=1) {
        let row_start = rows[rowi]
        let row_max = rows[rowi + 1]
        let prev_vseg = undefined
        for (let vseg of vertical_segments) {
            if (vseg[0][0] < row_start + 0.5 && vseg[1][0] > row_start + 0.5) {
                if (prev_vseg !== undefined) {
                    let width = vseg[0][1] - prev_vseg[0][1] - 1
                    // discount border by finding the distance of horizontal segment on the border

                    let horizontal_border_length = segments.map((hseg) => {
                        let overlap = 0
                        if (hseg[0][0] == row_start && hseg[1][0] == row_start) {
                            overlap = Math.min(Math.max(hseg[0][1], hseg[1][1]), vseg[0][1]) - Math.max(Math.min(hseg[0][1], hseg[1][1]), prev_vseg[0][1])
                            // console.log("removing", hseg, overlap)
                        }
                        return Math.max(0, overlap)
                    }).reduce((a, b) => a + b)
                    let height = row_max - row_start
                    let surface_inc = width * height - horizontal_border_length
                    // console.log(width, height, horizontal_border_length)
                    // console.log(vseg, prev_vseg, surface_inc)
                    surface += surface_inc
                    prev_vseg = undefined
                } else {
                    prev_vseg = vseg
                }
            }
        }
    }
    let border = segments.map((seg) => Math.abs(seg[1][0] - seg[0][0]) + Math.abs(seg[1][1] - seg[0][1])).reduce((acc, b) => acc + b)
    // console.log(border, surface, border + surface)
    return surface + border + 1 // no idea where this one off comes from
}

const text_input = Deno.readTextFileSync("input/day18.txt")
const segments = parse(text_input)
// console.log(segments)
console.log(solve(segments))