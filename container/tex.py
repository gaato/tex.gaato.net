#!/usr/local/bin/python

import argparse
import base64
import subprocess
import sys
import random


file_id = random.randrange(10 ** 10)

parser = argparse.ArgumentParser()
parser.add_argument('-p', '--plain',
                     help='render without gather environment',
                     action='store_true')
args = parser.parse_args()

stdin = sys.stdin.read()

if args.plain:
    with open(f'tex-template/texp.tex', 'r') as f:
        tex_source = f.read()
else:
    with open(f'tex-template/tex.tex', 'r') as f:
        tex_source = f.read()

tex_source = tex_source.replace('[REPLACE]', stdin)

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

subprocess.run(['pdfcrop', f'/tmp/{file_id}.pdf', '--margins', '4 4 4 4'], stdout=subprocess.PIPE)

pdftoppm = subprocess.run(['pdftoppm', '-png', '-r', '400', f'/tmp/{file_id}-crop.pdf'], stdout=subprocess.PIPE)

sys.stdout.buffer.write(base64.b64encode(pdftoppm.stdout))
