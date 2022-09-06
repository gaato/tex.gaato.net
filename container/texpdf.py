#!/usr/local/bin/python

import base64
import os
import subprocess
import sys
import random

file_id = random.randrange(10 ** 10)

tex_source = sys.stdin.read()

with open(f'/tmp/{file_id}.tex', 'w') as f:
    f.write(tex_source)

try:
    uplatex = subprocess.run(['uplatex', '-halt-on-error', '-output-directory=/tmp', f'/tmp/{file_id}.tex'], stdout=subprocess.PIPE, timeout=10.0)
except subprocess.TimeoutExpired:
    exit(2)

if uplatex.returncode != 0:
    with open(f'/tmp/{file_id}.log', 'r') as f:
        error = '!' + f.read().split('!')[1].split('Here')[0]
    print(error)
    exit(1)

try:
    subprocess.run(['dvipdfmx', '-q','-o', f'/tmp/{file_id}.pdf', f'/tmp/{file_id}.dvi'], timeout=10.0)
except subprocess.TimeoutExpired:
    exit(2)

with open(f'/tmp/{file_id}.pdf', 'rb') as f:
    result_binary = f.read()

sys.stdout.buffer.write(base64.b64encode(result_binary))
