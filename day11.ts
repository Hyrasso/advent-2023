const test_input = `...#......
.......#..
#.........
..........
......#...
.#........
.........#
..........
.......#..
#...#.....`;

function parse(text: string) {
    let space_rows = text.split("\n").reduce((acc, row, idx) => {
        if (row.split("").reduce((acc, c) => c == "." && acc, true)) {
            acc.push(idx)
        }
        return acc
    }, [])

    let num_cols = text.split("\n")[0].length
    let space_cols = []
    for (let i = 0; i < num_cols; i++) {
        let is_space = true
        for (let idx = i;idx < text.length;idx += (num_cols + 1)) {
            is_space = is_space && text.charAt(idx) == "."
        }
        if (is_space)
            space_cols.push(i)
    }

    let galaxies = []
    text.split("\n").forEach((row, i) => row.split("").forEach((c, j) => {
        if (c == "#") {
            const row_offset = space_rows.filter((val) => val < i).length * 999999
            const col_offset = space_cols.filter((val) => val < j).length * 999999
            galaxies.push([i + row_offset, j + col_offset])
        }
    }))
    return galaxies
}

function solve(galaxies: number[][]) {
    let dists = []
    galaxies.forEach((galaxy_a, idx_a) => {
        galaxies.forEach((galaxy_b, idx_b) => {
            if (idx_a < idx_b) {
                let drow = Math.abs(galaxy_a[0] - galaxy_b[0])
                let dcol = Math.abs(galaxy_a[1] - galaxy_b[1])
                dists.push(drow + dcol)
            }
        })
    })
    // console.log(dists)
    return dists.reduce((a, b) => a + b)
}

const text_input = await Deno.readTextFile("input/day11.txt")
const galaxies = parse(text_input)
console.log(solve(galaxies))

