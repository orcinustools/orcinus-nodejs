# Orcinus
Service management for docker swarm mode.

## Compose File
Orcinus compose compatible with docker compose format.

app.yml :
```yaml
version: '2'
services:
  app1:
    image: "aksaramaya/docker-http-server:v2"
    ports:
    - "80:80"
    - "81:80"
    environment:
    - "AKU=false"
    - "KAMU=false"
    replicas: 4
    cpu: "2"
    memory: "512mb"
```

## Create Services
```bash
$ orcinus create app.yml
Service web2 created
2cct8xzckyfwkmhlfprxy8tj3

Service web1 created
50a7ftc5f1jjvsz09h1bwt487
```

## List all Services
```bash
$ orcinus ls app.yml
2cct8xzckyfw  web2  0/1       nginx  

50a7ftc5f1jj  web1  3/3       aksaramaya/docker-http-server
```

## List Process
```bash
$ orcinus ps app.yml
```

## Remove Services
```bash
$ orcinus rm app.yml
```

## Scaling Service
```bash
$ orcinus scale web1=5
```

## Rolling Update
```bash
$ orcinus update app.yml
```

## Inspect all service
```bash
$ orcinus inspect app.yml
```
