PREFIX := /usr/share
SRC := $(PWD)

.PHONY: all clean build install prebuild

all: build

prebuild:
			npm install -g nexe

build:
			npm install
			nexe

install:
			cp -rf orcinus $(PREFIX)

clean:
			rm -rf build orcinus
