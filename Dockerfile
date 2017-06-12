FROM node:alpine
MAINTAINER ibnu yahya <anak10thn@gmail.com>

ENV LANG=C.UTF-8 LC_ALL=C
ENV NODE_PATH=/usr/lib/node_modules

RUN set -ex \
    && apk add --no-cache --virtual .build-deps \
    gcc libc-dev git python2 make 

COPY entrypoint /entrypoint.sh
RUN chmod +x /entrypoint

RUN mkdir -p /opt/orcinus
COPY . /opt/orcinus
RUN cd /opt/orcinus/; npm install -g; cd /; rm -rf /opt/orcinus

RUN apk del .build-deps

EXPOSE 4000
ENTRYPOINT ["/entrypoint"]
