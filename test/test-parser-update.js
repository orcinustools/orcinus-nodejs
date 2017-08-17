var a = require('../lib/parser.js');
var b = new a({
    "update" : {
      "service": {
        "constraint": "node.role==manager",
        "replicas": 1,
        "cpu": "1",
        "memory": "1gb"
      }
    },
    "spec" : {
      "ID": "nbnmprtihem49tcfkh5ciiljo",
      "Version": {
        "Index": 1289
      },
      "CreatedAt": "2017-05-27T12:01:01.855717598Z",
      "UpdatedAt": "2017-05-27T12:01:01.881683349Z",
      "Spec": {
        "Name": "app",
        "TaskTemplate": {
          "ContainerSpec": {
            "Image": "manomarks/visualizer:latest@sha256:e37a1349a680964b58033bdcfaec04abccd9294acf112b6043871ff5b4dbcaba",
            "Mounts": [
              {
                "Type": "bind",
                "Source": "/var/run/docker.sock",
                "Target": "/var/run/docker.sock"
              }
            ]
          },
          "Resources": {
            "Limits": {
              "NanoCPUs": 2000000000,
              "MemoryBytes": 536870912
            },
            "Reservations": {}
          },
          "RestartPolicy": {
            "Condition": "any",
            "MaxAttempts": 0
          },
          "Placement": {},
          "ForceUpdate": 0
        },
        "Mode": {
          "Replicated": {
            "Replicas": 3
          }
        },
        "UpdateConfig": {
          "Parallelism": 1,
          "FailureAction": "pause",
          "MaxFailureRatio": 0
        },
        "Networks": [
          {
            "Target": "yb1klwjt0ujjv2xfsidzjdfwa"
          }
        ],
        "EndpointSpec": {
          "Mode": "vip"
        }
      },
      "Endpoint": {
        "Spec": {
          "Mode": "vip"
        },
        "VirtualIPs": [
          {
            "NetworkID": "yb1klwjt0ujjv2xfsidzjdfwa",
            "Addr": "10.0.0.2/24"
          }
        ]
      },
      "UpdateStatus": {
        "StartedAt": "0001-01-01T00:00:00Z",
        "CompletedAt": "0001-01-01T00:00:00Z"
      }
    }
  

});

console.log(JSON.stringify(b.update()));
