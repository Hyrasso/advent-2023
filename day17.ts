
let test_input = `2413432311323
3215453535623
3255245654254
3446585845452
4546657867536
1438598798454
4457876987766
3637877979653
4654967986887
4564679986453
1224686865563
2546548887735
4322674655533`

// test_input = `111111111111
// 999999999991
// 999999999991
// 999999999991
// 999999999991`

function parse(text: string) {
    const grid = {}
    text.split("\n").map((line, row) => line.split("").map((c, col) => grid[[row, col]] = parseInt(c)))
    return grid
}

function solve(grid) {
    const length_paths = {}
    let min_length = 0
    length_paths[0] = [[[0, 0], [0, 0], 0]]
    const visited = {}
    
    while (true) {
        // console.log(min_length, length_paths)
        if (length_paths[min_length] === undefined) {
            min_length += 1
            continue
        }
        if (length_paths[min_length].length == 0) {
            length_paths[min_length] = undefined
            continue
        }
        // console.log(min_length)
        let step = length_paths[min_length].pop()
        let [[row, col], last_dpos, count] = step
        if (visited[step] === undefined) {
            visited[step] = min_length
        } else {
            continue
        }
        // if (row == 12 && col == 12) {
        // if (row == 4 && col == 11) {
        if (row == 140 && col == 140) {
            // return visited
            return min_length
        }
        for (let [drow, dcol] of [[1, 0], [0, 1], [-1, 0], [0, -1]]) {
            // no going back
            if (last_dpos[0] == -drow && last_dpos[1] == -dcol) {
                continue
            }
            let next_pos = [row + drow, col + dcol]
            let new_count = (last_dpos[0] == drow && last_dpos[1] == dcol) ? count + 1 : 1
            let path_weight = grid[next_pos] + min_length
            while (new_count < 4) {
                next_pos = [next_pos[0] + drow, next_pos[1] + dcol]
                new_count += 1
                path_weight += grid[next_pos]
                // console.log(next_pos, grid[next_pos], path_weight)
            }
            if (new_count > 10) {
                continue
            }
            if (next_pos in grid) {
                let new_step = [next_pos, [drow, dcol], new_count]
                if (length_paths[path_weight] !== undefined) {
                    length_paths[path_weight].push(new_step)
                } else {
                    length_paths[path_weight] = [new_step]
                }
            }
        }
    }

}

const text_input = Deno.readTextFileSync("input/day17.txt")
const grid = parse(text_input)
// 682 too low
// 758 too high
// console.log(grid)
console.log(solve(grid))