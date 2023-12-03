import math
from numba import cuda
import numpy as np

from utils import gpu_sum

NUM_THREADS = cuda.get_current_device().MAX_THREADS_PER_BLOCK

test_input = """1abc2
pqr3stu8vwx
a1b2c3d4e5f
treb7uchet"""

test_input2 = """two1nine
eightwothree
abcone2threexyz
xtwone3four
4nineeightseven2
zoneight234
7pqrstsixteen"""

def parse(t):
    return list(map(ord, t + "\n"))


LINE_RETURN = ord("\n")
ZERO = ord("0")
NINE = ord("9")

@cuda.jit
def word_to_digit(X, Y, numbers):
    idx = cuda.grid(1)
    for ni in range(numbers.shape[0]):
        is_digit = 1
        for off in range(numbers.shape[1]):
            if X[idx + off] != numbers[ni, off] and numbers[ni, off] != 0:
                is_digit = 0
        if is_digit == 1:
            Y[idx] = ni + ZERO + 1
        if (X[idx] >= ZERO and X[idx] <= NINE) or X[idx] == LINE_RETURN:
            Y[idx] = X[idx]

@cuda.jit
def find_pairs(X, Y):
    idx = cuda.grid(1)
    n = len(X)

    if idx < n and (idx == 0 or X[idx - 1] == LINE_RETURN):
        first, last = 0, 0
        while X[idx] != LINE_RETURN and idx < n:
            if X[idx] >= ZERO and X[idx] <= NINE:
                if first == 0:
                    first = X[idx]
                    last = X[idx]
                else:
                    last = X[idx]
            idx += 1
        Y[idx] = (first - ZERO) * 10 + last - ZERO


test_data = parse(test_input)
# print(test_data)
with open("input/day1.txt") as fd:
    data = parse(fd.read())

# part 1
# inp = cuda.to_device(np.array(test_data))
inp = cuda.to_device(np.array(data))
out = cuda.device_array_like(np.zeros(len(inp)))

num_blocks = math.ceil(len(inp) / NUM_THREADS)
find_pairs[num_blocks, NUM_THREADS](inp, out)
res = gpu_sum(out)

print(res)

# part 2
test_data2 = parse(test_input2)
preproc = cuda.to_device(np.array(data))
inp = cuda.device_array_like(np.zeros(len(preproc)))
numbers = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine"]
numbers = [list(map(ord, n)) for n in numbers]
numbers_array = np.zeros((len(numbers), max(map(len, numbers))))
for i, n in enumerate(numbers):
    numbers_array[i, :len(n)] = n
# print(numbers_array)
numbers_array = cuda.to_device(numbers_array)
num_blocks = math.ceil(len(inp) / NUM_THREADS)
word_to_digit[num_blocks, NUM_THREADS](preproc, inp, numbers_array)

out = cuda.device_array_like(np.zeros(len(preproc)))
num_blocks = math.ceil(len(inp) / NUM_THREADS)
find_pairs[num_blocks, NUM_THREADS](inp, out)
res = gpu_sum(out)

print(res)