import math
from numba import cuda
import numpy as np

from utils import parse_int, is_digit, parse, gpu_sum, NUM_THREADS

DOT = ord(".")
GEAR = ord("*")

@cuda.jit
def is_symbol(arr, x, y):
    return x > 0 and x < arr.shape[1] and y > 0 and y < arr.shape[0] and not is_digit(arr[y][x]) and arr[y][x] != DOT


@cuda.jit
def part_numbers(schem, out, gears_info):
    y, x = cuda.grid(2)

    if y < schem.shape[0] and x < schem.shape[1]:
        if is_digit(schem[y][x]) and (x == 0 or not is_digit(schem[y][x - 1])):
            s, value = parse_int(schem[y][x:])

            is_part = False

            for dx in range(-1, s + 1):
                for dy in (-1, 0, 1):
                    if is_symbol(schem, x + dx, y + dy):
                        is_part = True
                        if schem[y+dy][x+dx] == GEAR:
                            gidx = (dy + 1) * 2 + int(dx < 0)
                            gears_info[y+dy][x+dx][gidx] = value
            
            if is_part:
                out[y][x] = value


test_input = """467..114..
...*......
..35..633.
......#...
617*......
.....+.58.
..592.....
......755.
...$.*....
.664.598.."""

with open("input/day3.txt") as fd:
    text_input = fd.read()
# text_input = test_input

line_length = text_input.find("\n")
inp = parse(text_input)
inp_data = np.array(inp).reshape(-1, line_length + 1)[:, :-1]
# print(np.vectorize(chr)(inp_data))

@cuda.jit
def find_symbols(schem, out):
    y, x = cuda.grid(2)
    out[y][x] = is_symbol(schem, x, y)

gpu_inp = cuda.to_device(np.copy(inp_data))
out = cuda.to_device(np.zeros(gpu_inp.shape, dtype=int))
gears_info = cuda.to_device(np.zeros(gpu_inp.shape + (6,), dtype=int))

thread_x = math.ceil(NUM_THREADS ** .5)
block_x = math.ceil(gpu_inp.shape[0] / thread_x)
# print(thread_x, block_x)
part_numbers[(block_x, block_x), (thread_x, thread_x)](gpu_inp, out, gears_info)

s = gpu_sum(out.reshape(-1))
print(s)

@cuda.jit
def count_num(arr, out):
    y, x = cuda.grid(2)
    c = 0
    m = 1
    for i in range(6):
        if arr[y][x][i] != 0:
            c += 1
            m *= arr[y][x][i]
    if c == 2:
        out[y][x] = m
    else:
        out[y][x] = 0


# print(gears_info.copy_to_host())
gear_count = cuda.device_array_like(out)
count_num[(block_x, block_x), (thread_x, thread_x)](gears_info, gear_count)
a = gear_count.copy_to_host()
print(gpu_sum(gear_count.reshape(-1)))
