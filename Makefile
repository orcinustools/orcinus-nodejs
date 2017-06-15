CONFIG_DIRS := config
SRC := $(PWD)
VERSION := 0.2.7

.PHONY: all clean build frontend install prebuild docker production production-remove push run test

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
			@echo "===> Install orcinus CLI"
			@npm install -g

production: install
			@echo "===> Install orcinus webserver"
			@orcinus create -f ./production/webserver/orcinus.yml
			@echo "===> Install orcinus dashboard"
			@orcinus create -f ./production/dashboard/orcinus.yml
			@echo "===> Install orcinus repository"
			@orcinus create -f ./production/repository/orcinus.yml
			@echo "===> Install orcinus database"
			@orcinus create -f ./production/db/orcinus.yml

production-remove:
			@echo "===> Remove orcinus webserver"
			@orcinus rm -f ./production/webserver/orcinus.yml
			@echo "===> Remove orcinus dashboard"
			@orcinus rm -f ./production/dashboard/orcinus.yml
			@echo "===> Remove orcinus repository"
			@orcinus create -f ./production/repository/orcinus.yml
			@echo "===> Remove orcinus database"
			@orcinus create -f ./production/db/orcinus.yml

clean:
			rm -rf build bin www coverage

docker:
			docker build -t orcinus/orcinus:$(VERSION) .
			docker tag orcinus/orcinus:$(VERSION) orcinus/orcinus:latest

push:	docker
			docker push orcinus/orcinus:$(VERSION)
			docker push orcinus/orcinus:latest

run:
			echo "Dashboard starting.........."
			node cli.js dashboard
test:
			npm install
			npm run test
