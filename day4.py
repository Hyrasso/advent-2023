import math
from numba import cuda
import numpy as np

from utils import parse, ZERO, gpu_sum

test_input = """Card 1: 41 48 83 86 17 | 83 86  6 31 17  9 48 53
Card 2: 13 32 20 16 61 | 61 30 68 82 17 32 24 19
Card 3:  1 21 53 59 44 | 69 82 63 72 16 21 14  1
Card 4: 41 92 73 84 69 | 59 84 76 51 58  5 54 83
Card 5: 87 83 26 28 32 | 88 30 70 12 93 22 82 36
Card 6: 31 18 13 56 72 | 74 77 10 23 35 67 36 11"""


@cuda.jit
def parse_numbers(text, winning_numbers, scratched, line_start, winning_count, scratch_count):
    line, num = cuda.grid(2)
    total_num = winning_count + scratch_count
    line_length = total_num * 3 + len(" |") + line_start + len("\n")
    if num >= winning_count:
        num_start = line_start + line * line_length + len(" |") + num * 3
        num_start += 1 # space
        if num_start + 1 < len(text):
            value = max(0, (text[num_start] - ZERO) * 10) + text[num_start + 1] - ZERO
            scratched[line, num - winning_count] = value
    else:
        num_start = line_start + line * line_length + num * 3
        num_start += 1 # space
        if num_start + 1 < len(text):
            value = max(0, (text[num_start] - ZERO)) * 10 + text[num_start + 1] - ZERO
            winning_numbers[line, num] = value

@cuda.jit
def keep_winning_scores(winning, scratched, winning_scratched):
    line, idx = cuda.grid(2)
    if line < scratched.shape[0] and idx < scratched.shape[1]:
        scratch = scratched[line, idx]
        winning_scratched[line, idx] = 0
        for i in range(winning.shape[1]):
            if scratch == winning[line, i]:
                winning_scratched[line, idx] = scratch

@cuda.jit
def compute_scores(winning_scratched, scores):
    line = cuda.grid(1)
    score = 0
    for i in range(winning_scratched.shape[1]):
        if winning_scratched[line, i] != 0:
            if score == 0:
                score = 1
            else:
                score = score * 2
    scores[line] = score

text = test_input
with open("input/day4.txt") as fd:
    text = fd.read()
line_start = text.find(":")
bar = text.find("|")
line_length = text.find("\n")
winning_count = (bar - line_start - 2) // 3
scratch_count = (line_length - bar - 1) // 3
num_lines = (len(text) + 1) // (line_length + 1)
print(text[:line_length])
print(line_length, winning_count, scratch_count, num_lines)
data = np.array(parse(text))
gpu_data = cuda.to_device(data)
winning_numbers = cuda.device_array((num_lines, winning_count), dtype=np.int32)
scratched= cuda.device_array((num_lines, scratch_count), dtype=np.int32)

# not the most optimal, but avoids discrepances between test and actual input
blocks, threads = (num_lines, 1), (1, winning_count + scratch_count)
parse_numbers[blocks, threads](gpu_data, winning_numbers, scratched, line_start + 1, winning_count, scratch_count)

winning_scratched = cuda.device_array_like(scratched)
keep_winning_scores[(winning_scratched.shape[0], 1), (1, winning_scratched.shape[1])](winning_numbers, scratched, winning_scratched)
# print(winning_scratched.copy_to_host())
scores = cuda.device_array((scratched.shape[0],), dtype=np.int32)
# print((2 ** (winning_scratched.copy_to_host() != 0).sum(axis=1) // 2).sum())
compute_scores.forall(len(scores))(winning_scratched, scores)
# print(scores.copy_to_host().sum())
print(gpu_sum(scores))

wins = (winning_scratched.copy_to_host() != 0).sum(axis=1)
num_cards = np.ones_like(wins)
for i, nw in enumerate(wins):
    num_cards[i+1:i+1+nw] += num_cards[i]
print(num_cards.sum())