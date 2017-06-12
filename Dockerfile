FROM node:alpine
MAINTAINER ibnu yahya <anak10thn@gmail.com>

ENV LANG=C.UTF-8 LC_ALL=C
ENV NODE_PATH=/usr/lib/node_modules

RUN mkdir -p /opt/orcinus		
COPY . /opt/orcinus
WORKDIR /opt/orcinus

RUN set -ex \
    && apk add --update --no-cache --virtual .build-deps \
    python \
		make \
		g++ \
		&& npm install -g node-gyp \
		&& npm install -g \
		&& apk del .build-deps


COPY entrypoint /entrypoint
RUN chmod +x /entrypoint

EXPOSE 4000
ENTRYPOINT ["/entrypoint"]
