import math
from numba import cuda
import numpy as np

from utils import parse_int, gpu_sum

NUM_THREADS = cuda.get_current_device().MAX_THREADS_PER_BLOCK

LINE_RETURN = ord("\n")
ZERO = ord("0")
NINE = ord("9")
R, G, B = map(ord, "rgb")

def parse(t):
    return list(map(ord, t + "\n"))

test_input = """Game 1: 3 blue, 4 red; 1 red, 2 green, 6 blue; 2 green
Game 2: 1 blue, 2 green; 3 green, 4 blue, 1 red; 1 green, 1 blue
Game 3: 8 green, 6 blue, 20 red; 5 blue, 4 red, 13 green; 5 green, 1 red
Game 4: 1 green, 3 red, 6 blue; 3 green, 6 red; 3 green, 15 blue, 14 red
Game 5: 6 red, 1 blue, 3 green; 2 blue, 1 red, 2 green"""

# python imple to check results
# inp = test_input
# with open("input/day2.txt") as fd:
#     inp = fd.read()

# total = 0
# game_powers = 0
# for line in inp.splitlines():
#     gid, games = line.split(":")
#     gid = int(gid[len("Game "):])
#     is_possible = True
#     counts = {"red": 0, "green": 0, "blue": 0}
#     for game in games.split(";"):
#         for draw in game.split(","):
#             count, color = draw[1:].split(" ")
#             count = int(count)
#             counts[color] = max(counts[color], count)
#             if color == "red" and count > 12:
#                 is_possible = False
#             if color == "green" and count > 13:
#                 is_possible = False
#             if color == "blue" and count > 14:
#                 is_possible = False
#     game_power = counts["green"] * counts["red"] * counts["blue"]
#     game_powers += game_power
#     if is_possible:
#         total += gid
# print(total, game_powers)

@cuda.jit(device=True)
def is_digit(v):
    return v >= ZERO and v <= NINE


# @cuda.jit()
# def parse_all_ints(arr, out):
#     idx = cuda.grid(1)
#     if is_digit(arr[idx]):
#         val = parse_int(arr[idx:])
#         if val > 10:
#             out[idx] = val
#             out[idx + 1] = val // 10

# test_input = "12 54 3ab45"
# gpu_input = cuda.to_device(np.array(parse(test_input)))
# out = cuda.to_device(np.zeros(len(gpu_input), dtype=int))
# parse_all_ints.forall(len(gpu_input))(gpu_input, out)
# print(out.copy_to_host())

@cuda.jit
def find_line_breaks(array, out):
    idx = cuda.grid(1)
    if idx < len(array):
        if array[idx] == LINE_RETURN:
            out[idx] = 1
        else:
            out[idx] = 0


@cuda.jit
def log_cum_sum(array, out, stride):
    p = cuda.grid(1)
    idx = len(array) - p

    if idx - stride >= 0:
        out[idx] = array[idx] + array[idx - stride]
    else:
        if idx >= 0:
            out[idx] = array[idx]

@cuda.jit
def offsets(mask, indices, dense_array):
    idx = cuda.grid(1)
    if idx < len(mask) and mask[idx] == 1:
        dense_array[indices[idx] - 1] = idx


def cum_sum(inp_array):
    """ Not the most efficient, launch log2(n) kernels that do N - 2 ** step operations at each step"""

    array = cuda.device_array_like(inp_array)
    array.copy_to_device(inp_array)
    stride = 1 
    out = cuda.device_array_like(array)
    while True:
        log_cum_sum.forall(len(array) - (stride // 2))(array, out, stride)
        stride *= 2
        if stride > len(array):
            break
        out, array = array, out
    return out

with open("input/day2.txt") as fd:
    test_input = fd.read()

test_data = parse(test_input)
gpu_data = cuda.to_device(np.array(test_data))
line_breaks_mask = cuda.to_device(np.zeros(len(gpu_data), dtype=int))
find_line_breaks.forall(len(gpu_data))(gpu_data, line_breaks_mask)
# print(line_breaks_mask.copy_to_host())
line_break_indices = cum_sum(line_breaks_mask)
# print(line_break_indices.copy_to_host())
offsets_array = cuda.device_array((line_break_indices[-1],), dtype=line_break_indices.dtype)
offsets.forall(len(line_breaks_mask))(line_breaks_mask, line_break_indices, offsets_array)
# print(line_break_indices.copy_to_host()[line_breaks_mask.copy_to_host() == 1])
# print(offsets_array.copy_to_host())


@cuda.jit
def process_line(text, line_ends, res, powers):
    idx = cuda.grid(1)
    if idx < len(line_ends):
        if idx > 0:
            c = line_ends[idx - 1] + 1
        else:
            c = 0
        c = c + len("Game ")
        c_off, game_idx = parse_int(text[c:])
        c += c_off
        c += 1 # skip :
        is_possible = True
        rm, gm, bm = 0, 0, 0
        while text[c] != LINE_RETURN:
            # space before count
            c += 1
            c_off, count = parse_int(text[c:])
            c += c_off
            c += 1 # space before color
            if text[c] == R:
                rm = max(rm, count)
                if count > 12:
                    is_possible = False
                c += len("red")
            if text[c] == G:
                gm = max(gm, count)
                if count > 13:
                    is_possible = False
                c += len("green")
            if text[c] == B:
                bm = max(bm, count)
                if count > 14:
                    is_possible = False
                c += len("blue")
            if text[c] == LINE_RETURN:
                break
            c += 1 # skip , or ;
        
        powers[idx] = rm * bm * gm
        if is_possible:
            res[idx] = game_idx
            

test_data = np.array(parse(test_input))
out = cuda.to_device(np.zeros_like(offsets_array, dtype=offsets_array.dtype))
powers = cuda.to_device(np.zeros_like(offsets_array, dtype=test_data.dtype))

process_line.forall(len(offsets_array))(cuda.to_device(test_data), offsets_array, out, powers)

print(gpu_sum(out))
# print(powers.copy_to_host())
print(gpu_sum(powers))
