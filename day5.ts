const text = await Deno.readTextFile("input/day5.txt")
const test_text = `seeds: 79 14 55 13

seed-to-soil map:
50 98 2
52 50 48

soil-to-fertilizer map:
0 15 37
37 52 2
39 0 15

fertilizer-to-water map:
49 53 8
0 11 42
42 0 7
57 7 4

water-to-light map:
88 18 7
18 25 70

light-to-temperature map:
45 77 23
81 45 19
68 64 13

temperature-to-humidity map:
0 69 1
1 0 69

humidity-to-location map:
60 56 37
56 93 4`

// console.log(text)

function solve(text:string,) {
    const [seeds_line, ...blocks] = text.split("\n\n")
    let seeds = seeds_line.slice(7).split(" ").map((val) => parseInt(val))
    for (const block of blocks) {
        const [, ...range_lines] = block.split("\n")
        const ranges = range_lines.map((line) => line.split(" ").map((val) => parseInt(val))) 
        seeds = seeds.map((val) => {
            for (const [dest_start, source_start, width] of ranges) {
                if (val >= source_start && val < source_start + width) {
                    return dest_start + val - source_start
                }
            }
            return val
        })
    }
    return seeds.reduce((prev, current) => (prev < current) ? prev : current)
}

function solve2(text:string,) {
    const [seeds_line, ...blocks] = text.split("\n\n")
    let seeds = seeds_line.slice(7).split(" ").map((val) => parseInt(val))
    let [seed_ranges, p] = seeds.reduce(([res, prev], current) => {
        prev.push(current)
        if (prev.length == 2) {
            res.push(prev)
            prev = []
        }

        return [res, prev]
    }, [[], []])
    console.log(seed_ranges)
    for (const block of blocks) {
        const [, ...range_lines] = block.split("\n")
        const ranges = range_lines.map((line) => line.split(" ").map((val) => parseInt(val))).sort((a, b) => a[1] - b[1])
        seed_ranges = seed_ranges.map(([start, width]) => {
            let new_ranges = []
            for (const [dest_start, source_start, dest_width] of ranges) {
                let overlap_start = Math.max(source_start, start)
                let overlap_end = Math.min(source_start + dest_width, start + width)
                if (overlap_start < overlap_end) {
                    if (overlap_start > start) {
                        new_ranges.push([start, overlap_start - start])
                    }
                    new_ranges.push([overlap_start - source_start + dest_start, overlap_end - overlap_start])
                    width = start + width - overlap_end
                    start = overlap_end
                    if (overlap_end < start + width) {
                        width = start + width - overlap_end
                        start = overlap_end
                    }               
                }
            }
            if (width > 0) {
                new_ranges.push([start, width])
            }
            return new_ranges
        }).reduce((acc, val) => acc.concat(val), [])
    }
    return seed_ranges.reduce((prev, current) => (prev < current[0]) ? prev : current[0], Infinity)
}
console.log(`Part 1: ${solve(text)}`)
console.log(`Part 2: ${solve2(text, true)}`)
