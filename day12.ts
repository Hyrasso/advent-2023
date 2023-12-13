type LineSpring = {
    springs: string[],
    mask: object,
    groups: number[],
    missing_springs: number
}

const test_input = `???.### 1,1,3
.??..??...?##. 1,1,3
?#?#?#?#?#?#?#? 1,3,1,6
????.#...#... 4,1,1
????.######..#####. 1,6,5
?###???????? 3,2,1`

function parse(text:string) {
    return text.split("\n").map((line) => {
        let [springs, groups] = line.split(" ")
        groups = groups.split(",").map((val) => parseInt(val))
        springs = springs.split("")
        springs = [...springs, "?", ...springs, "?", ...springs, "?", ...springs, "?", ...springs]
        groups = [...groups, ...groups, ...groups, ...groups, ...groups]
        let qindices = springs.reduce((acc, s, idx) => {
            if (s == "?") {
                acc.push(idx)
            }
            return acc
        }, [])
        return {
            springs: springs,
            groups: groups,
            mask: qindices,
            missing_springs: groups.reduce((a, b) => a + b) -  springs.filter((s) => s == "#").length
        }
    })
}


function valid_state(state: number[], line_spring: LineSpring) {
    let gcount = 0
    let gidx = 0
    let in_group = false
    let state_idx = -1
    for (let idx=0;idx < line_spring.springs.length;idx += 1) {
        const s = line_spring.springs[idx]
        if (s == "?") {
            state_idx += 1
            if (state[state_idx] == -1) {
                // console.log(gidx, gcount)
                return gidx == line_spring.groups.length || gcount <= line_spring.groups[gidx]
            }
        }
        if (s == "#" || (s == "?" && state[state_idx] == 1)) {
            in_group = true
            gcount += 1
        } else if (in_group) {
            if (gcount != line_spring.groups[gidx]) {
                return false
            }
            // console.log(gcount, gidx)
            in_group = false
            gcount = 0
            gidx += 1
        }
    }
    // console.log(gidx, gcount)
    return (gidx == line_spring.groups.length && gcount == 0) ||
           (gidx == line_spring.groups.length - 1 && gcount == line_spring.groups[gidx])
}


function search(line_spring: LineSpring) {
    const num_qm = line_spring.springs.filter((s) => s == "?").length
    const state = Array<number>(num_qm).fill(-1)
    // start search
    // console.log(line_spring)
    // console.log(state)
    const cache = {}
    return inner_search(line_spring, state, cache)
}

function inner_search(line_spring: LineSpring, state, cache) {
    // find first available state
    let valid_change_idx = state.reduce((idx, val, cidx) => {
        if (idx == -1 && val == -1) {
            return cidx
        }
        return idx
    }, -1)
    if (valid_change_idx == -1) {
        // console.log(state, line_spring.springs.join(""))
        return 1
    }
    let valid_count = 0
    const idx = valid_change_idx
    state[idx] = 1
    // console.log(state, line_spring.springs.join(""))
    if (valid_state(state, line_spring)) {
        // console.log("Left", state)
        let group_size = 0
        let state_idx = idx
        for (let lidx = line_spring.mask[idx];lidx >=0;lidx -= 1) {
            if (line_spring.springs[lidx] == "#") {
                group_size += 1
            } else if (line_spring.springs[lidx] == "?") {
                if (state[state_idx] == 1) {
                    group_size += 1
                    state_idx -=1
                } else {
                    break;
                }
            } else {
                break
            }
        }
        // cache is not the same when adding one for eg: #01001? and #01010?
        let cache_idx = [idx, state.reduce((acc, b) => acc += (b == 1)), group_size]
        let val = cache[cache_idx]
        if (val !== undefined) {
            valid_count += val
        } else {
            val = inner_search(line_spring, state, cache)
            cache[cache_idx] = val
            valid_count += val
        }
    }
    state[idx] = 0
    // console.log(state, line_spring.springs.join(""))
    if (valid_state(state, line_spring)) {
        // console.log("Right", state)
        let val = cache[[idx, state.reduce((acc, b) => acc += (b == 1)), 0]]
        if (val !== undefined) {
            valid_count += val
        } else {
            val = inner_search(line_spring, state, cache)
            cache[[idx, state.reduce((acc, b) => acc += (b == 1)), 0]] = val
            valid_count += val
        }
    }
    state[idx] = -1
    return valid_count
}


const text_input = await Deno.readTextFile("input/day12.txt")
const sp = parse(text_input)
console.log(sp.map((s, idx) => search(s)).reduce((a, b) => a + b))
