PREFIX := /usr/local/bin
CONFIG_DIRS := config
SRC := $(PWD)
VERSION := 0.1.4

.PHONY: all clean build frontend install prebuild orcinusd docker push run test

all: build

prebuild:
			npm install -g nexe

frontend:
			rm -rf www
			if [ ! -d "dashboard" ]; then git clone https://github.com/orcinustools/dashboard.git;cd dashboard;npm install;npm run build:prod;cd $(SRC); else cd dashboard;npm install;npm run build:prod;cd $(SRC); fi
			mv ./dashboard/dist www
			rm -rf dashboard

build:
			npm install
			nexe
			mkdir bin
			mv orcinus bin/orcinus

install:
			cp -rf orcinus $(PREFIX)

clean:
			rm -rf build orcinus www

orcinusd:
			systemctl stop docker
			systemctl disable docker
			cp $(CONFIG_DIRS)/orcinusd.service /lib/systemd/system
			chmod 644 /lib/systemd/system/orcinusd.service
			systemctl enable orcinusd
			systemctl start orcinusd

docker:
			docker build -t orcinus/orcinus:$(VERSION) .
			docker tag orcinus/orcinus:$(VERSION) orcinus/orcinus:latest

push:
			docker push orcinus/orcinus:$(VERSION)
			docker push orcinus/orcinus:latest

run:
			echo "Dashboard starting.........."
			node cli.js dashboard
test:
			npm install
			npm run test
