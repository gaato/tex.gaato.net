FROM python:3

LABEL maintainer="Gakuto Furuya"

RUN apt update \
  && apt install -y --fix-missing texlive-full \
  xpdf

COPY ./tex.py /usr/local/bin
COPY ./texpdf.py /usr/local/bin
COPY ./tex-template /tex-template

RUN chmod +x /usr/local/bin/tex.py \
  && chmod +x /usr/local/bin/texpdf.py

RUN kanji-config-updmap-sys haranoaji
