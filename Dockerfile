FROM node:alpine
MAINTAINER ibnu yahya <anak10thn@gmail.com>

ENV LANG=C.UTF-8 LC_ALL=C
ENV NODE_PATH=/usr/lib/node_modules

COPY config/entrypoint /entrypoint
RUN chmod +x /entrypoint

RUN mkdir -p /opt/orcinus
COPY . /opt/orcinus
RUN cd /opt/orcinus/; npm install -g

EXPOSE 4000
ENTRYPOINT ["/entrypoint"]
