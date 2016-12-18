# Orcinus
Tools service management for docker swarm mode.

## Compose File
Orcinus compose compatible with docker compose format.
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

```
