
const test_input = `px{a<2006:qkq,m>2090:A,rfg}
pv{a>1716:R,A}
lnx{m>1548:A,A}
rfg{s<537:gd,x>2440:R,A}
qs{s>3448:A,lnx}
qkq{x<1416:A,crn}
crn{x>2662:A,R}
in{s<1351:px,qqz}
qqz{s>2770:qs,m<1801:hdj,R}
gd{a>3333:R,R}
hdj{m>838:A,pv}

{x=787,m=2655,a=1222,s=2876}
{x=1679,m=44,a=2067,s=496}
{x=2036,m=264,a=79,s=2244}
{x=2461,m=1339,a=466,s=291}
{x=2127,m=1623,a=2188,s=1013}`

function parse(text: string) {
    let [workflow, parts] = text.split("\n\n")
    let workflows = {}
    workflow.split("\n").forEach((line) => {
        let [label, wf] = line.split("{")
        let checks = wf.slice(0, -1).split(",")
        let dflt = checks[checks.length - 1]
        let conds = checks.slice(0, -1)
        workflows[label] = {
            conds: conds.map((c) => {
                let [cond, target] = c.split(":")
                return {key: cond.at(0), cmp: cond.at(1), val: parseInt(cond.slice(2)), target: target}
            }),
            default: dflt
        }
    })
    parts = parts.split("\n").map((line) => line.slice(1, -1).split(",").map((ke) => ke.split("=")).reduce((o, p) => {
            o[p[0]] = parseInt(p[1])
            return o
        }, {}))
    return [workflows, parts]
}

function solve(workflow, parts) {
    return parts.map((part) => {
        let state = "in"
        process_loop:
        while (state != "A" && state != "R") {
            console.log(part, state)
            let wf = workflow[state]

            for (let cond of wf.conds) {
                // console.log(part[cond.key], cond)
                if (cond.cmp == "<" && part[cond.key] < cond.val) {
                    state = cond.target

                    continue process_loop
                }
                if (cond.cmp == ">" && part[cond.key] > cond.val) {
                    state = cond.target
                    continue process_loop
                }
            }
            state = wf.default
        }
        if (state == "A") {
            return Object.values(part).reduce((a, b) => a + b)
        } else {
            return 0
        }

    }).reduce((a, b) => a + b)
}

function split_range(range, cond) {
    function inner_split_range(range, cond) {
        let insup = range[cond.key]
        if (insup === undefined) {
            return [undefined, undefined]
        }
        if (cond.cmp == "<") {
            if (cond.val > insup[1]) {
                return [[], insup]
            } else if (cond.val < insup[0]) {
                return [insup, []]
            } else {
                return [[cond.val, insup[1]], [insup[0], cond.val - 1]]
            }
        } else if (cond.cmp == ">") {
            if (cond.val > insup[1]) {
                return [insup, []]
            } else if (cond.val < insup[0]) {
                return [[], insup]
            } else {
                return [[insup[0], cond.val], [cond.val + 1, insup[1]]]
            }
        }
    }
    let left = {...range}
    let right = {...range}
    let [f, t] = inner_split_range(range, cond)
    left[cond.key] = f
    right[cond.key] = t
    return [left, right]
}


function solve2(workflow) {
    let ranges = {}
    let accepted = []
    ranges["in"] = {x: [1, 4000], m: [1, 4000], a: [1, 4000], s: [1, 4000]}
    let to_visit = ["in"]
    while (to_visit.length > 0) {
        let wf_label = to_visit.pop()
        let range = ranges[wf_label]
        let wf = workflow[wf_label]
        let true_range = undefined
        for (let cond of wf.conds) {
            [range, true_range] = split_range(range, cond)
            if (cond.target == "A") {
                accepted.push(true_range)
            } else if (cond.target != "R") {
                ranges[cond.target] = true_range
                to_visit.push(cond.target)
            }
        }
        if (wf.default == "A") {
            accepted.push(range)
        } else if (wf.default != "R") {
            ranges[wf.default] = range
            to_visit.push(wf.default)
        }
    }
    // console.log(accepted)
    return accepted.map((p) => (p.x[1] - p.x[0] + 1) * (p.m[1] - p.m[0] + 1) * (p.a[1] - p.a[0] + 1) * (p.s[1] - p.s[0] + 1)).reduce((a, b) => a + b)
}

const text_input = Deno.readTextFileSync("input/day19.txt")
let [wf, parts] = parse(text_input)
console.log(wf)
// console.log(parts)
console.log(solve2(wf, parts))
// console.log(solve(wf, parts))
