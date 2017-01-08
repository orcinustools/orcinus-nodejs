# Orcinus
Container orchestration management tools for docker swarm mode.

# Quick Start

## Requirements
* Linux 64 bit
* Docker 1.12+
* Nodejs (optional)

## Installation

#### Use NPM

```bash
$ npm install orcinus -g
```
#### Standalone binary

```bash
$ curl -L http://dl.aksaramaya.id/orcinus/stable/orcinus-linux-x86_64.bin -o /usr/bin/orcinus
$ chmod +x /usr/bin/orcinus
```

## Cluster Setup

### Prerequisites

* One or more linux 64 bit machines. Example :
  - 1 manager with ip address : 192.168.7.11.
  - 1 worker with ip address : 192.168.7.12.
* Full network connectivity between all machines in the cluster (public or private network is fine).
* Install orcinus to each machines.

### Setup manager
* SSH into the machine and become **root** if you are not already (for example, run `sudo su -`).
* Initializing your machine as manager.
```bash
[root@192.168.7.11 ~]$ orcinus cluster init [IP ADDRESS MACHINE]
[root@192.168.7.11 ~]$ orcinus cluster init 192.168.7.11
Add a worker to this manager.

  Token : eyJhZGRyIjoiMTkyLjE2OC43LjExOjIzNzciLCJ0b2tlbiI6IlNXTVRLTi0xLTVqbmZ3b3ltbW1haW5nb3poNnh2Y3ZreDA0N3NlOTJrYmF2dXlscTlkbDF5b3czcWliLTUzM2dwbjN4b2lxeWJkOHN2NXl2bzg2anFcbiJ9

  or run the following command:
           orcinus cluster join eyJhZGRyIjoiMTkyLjE2OC43LjExOjIzNzciLCJ0b2tlbiI6IlNXTVRLTi0xLTVqbmZ3b3ltbW1haW5nb3poNnh2Y3ZreDA0N3NlOTJrYmF2dXlscTlkbDF5b3czcWliLTUzM2dwbjN4b2lxeWJkOHN2NXl2bzg2anFcbiJ9
# Get manager token
[root@192.168.7.11 ~]$ orcinus cluster token
```

### Setup Worker
If you want to add any new machines as worker to your cluster, for each machine:
* SSH into the machine and become **root** if you are not already (for example, run `sudo su -`).
* Initializing your machine as a worker.
```bash
[root@192.168.7.12 ~]$ orcinus cluster join [TOKEN]
[root@192.168.7.12 ~]$ orcinus cluster join eyJhZGRyIjoiMTkyLjE2OC43LjExOjIzNzciLCJ0b2tlbiI6IlNXTVRLTi0xLTVqbmZ3b3ltbW1haW5nb3poNnh2Y3ZreDA0N3NlOTJrYmF2dXlscTlkbDF5b3czcWliLTUzM2dwbjN4b2lxeWJkOHN2NXl2bzg2anFcbiJ9
This node joined a cluster as a worker.
```

### Get all nodes information
Get information all nodes cluster.
* SSH into the manager machine and become **root** if you are not already (for example, run `sudo su -`).
```bash
[root@192.168.7.11 ~]$ orcinus cluster ls
ID                           HOSTNAME  STATUS  AVAILABILITY  MANAGER STATUS
6hbhi274x0gslf1bfuu1ei91r *  ak1       Ready   Active        Leader
ecyy1uswuciolsfve4vn38h8m    ak2       Ready   Active
# Inspect node
[root@192.168.7.11 ~]$ orcinus cluster inspect ak1
ID:			6hbhi274x0gslf1bfuu1ei91r
Hostname:		ak1
Joined at:		2017-01-08 09:11:56.313485437 +0000 utc
Status:
 State:			Ready
 Availability:		Active
Manager Status:
 Address:		192.168.7.11:2377
 Raft Status:		Reachable
 Leader:		Yes
Platform:
 Operating System:	linux
 Architecture:		x86_64
Resources:
 CPUs:			1
 Memory:		489 MiB
Plugins:
  Network:		bridge, host, null, overlay
  Volume:		local
Engine Version:		1.12.3
```

### Deploy Services
Deploy your first service.
```bash
# orcinus compose
[root@192.168.7.11 ~]$ mkdir test/
[root@192.168.7.11 test]$ ls
orcinus.yml
[root@192.168.7.11 test]$ cat orcinus.yml
stack: "mystack"
services:
  web1:
    image: "aksaramaya/docker-http-server:v1"
    ports:
    - "80:80"
    replicas: 4
    cpu: "2"
    memory: "512mb"
  web2:
    image: "nginx"
    cpu: "2"
    memory: "512mb"
# create service
[root@192.168.7.11 test]$ orcinus create
Service web2 created
2cct8xzckyfwkmhlfprxy8tj3

Service web1 created
50a7ftc5f1jjvsz09h1bwt487
# list Services
[root@192.168.7.11 test]$ orcinus ls
2cct8xzckyfw  web2  0/1       nginx  

50a7ftc5f1jj  web1  3/3       aksaramaya/docker-http-server
# remove service
root@192.168.7.11 test]$ orcinus rm
```
