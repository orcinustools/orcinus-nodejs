PREFIX := /usr/share
SRC := $(PWD)

.PHONY: all clean build install

all: build

build:
			npm install nexe -g
			npm install
			nexe

install:
			cp -rf orcinus $(PREFIX)

clean:
			rm -rf build orcinus
