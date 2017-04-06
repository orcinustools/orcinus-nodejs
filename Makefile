PREFIX := /usr/local/bin
CONFIG_DIRS := config
SRC := $(PWD)

.PHONY: all clean build frontend install prebuild orcinusd docker push run

all: build

prebuild:
			npm install -g nexe

frontend:
			rm -rf www
			if [ ! -d "dashboard" ]; then git clone https://github.com/orcinustools/dashboard.git;cd dashboard;npm install;npm run build:prod;cd $(SRC); else cd dashboard;npm install;npm run build:prod;cd $(SRC); fi
			mv ./dashboard/dist www
			rm -rf dashboard

build: frontend
			npm install
			nexe

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
			docker build -t orcinus/orcinus:latest .

push:
			docker push orcinus/orcinus:latest

run:
			echo "Dashboard starting.........."
			node cli.js dashboard
