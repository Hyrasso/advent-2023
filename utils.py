import math
import numpy as np
from numba import cuda

NUM_THREADS = cuda.get_current_device().MAX_THREADS_PER_BLOCK

def parse(t):
    return list(map(ord, t + "\n"))


LINE_RETURN = ord("\n")
ZERO = ord("0")
NINE = ord("9")

@cuda.jit(device=True)
def is_digit(v):
    return v >= ZERO and v <= NINE


@cuda.jit(device=True)
def parse_int(a):
    res = 0
    i = 0
    for i in range(len(a)):
        if is_digit(a[i]):
            res = res * 10 + a[i] - ZERO
        else: break
    return i, res


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

# @cuda.jit
# def parse_all(arr, out):
#     idx = cuda.grid(1)
#     if is_digit(arr[idx]):
#         s, val = parse_int(arr[idx:])
#         out[idx, 0] = s
#         out[idx, 1] = val
