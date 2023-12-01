import math
from numba import cuda
import numpy as np

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
            if X[idx + off] != numbers[ni][off] and numbers[ni][off] != 0:
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


@cuda.jit
def reduce_sum(arr, out):
    x = cuda.grid(1)
    bid = cuda.blockIdx.x
    tid = cuda.threadIdx.x
    shr = cuda.shared.array(NUM_THREADS, np.int32)
    if x < len(arr):
        shr[tid] = arr[x]
    else:
        shr[tid] = 0
    cuda.syncthreads()
    s = NUM_THREADS // 2
    while s > 0:
        if tid < s:
            shr[tid] = shr[tid] + shr[tid + s]
        s //= 2
        cuda.syncthreads()
    if tid == 0:
        out[bid] = shr[0]

def gpu_sum(arr):
    n = len(arr)
    if n > NUM_THREADS:
        num_blocks = math.ceil(n / NUM_THREADS)
        out = cuda.device_array(num_blocks, dtype=int)
        reduce_sum[num_blocks, NUM_THREADS](arr, out)
        reduce_sum[1, NUM_THREADS](out, out)
    else:
        out = cuda.device_array(1, dtype=int)
        reduce_sum[1, NUM_THREADS](arr, out)
    return out.copy_to_host()[0]

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