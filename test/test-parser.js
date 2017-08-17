var a = require('../lib/parser.js');
var b = new a({
  "stack": "mystack",
  "services": {
    "web1": {
      "image": "aksaramaya/docker-http-server:v1",
      "ports": [
        "80:80"
      ],
      "replicas": 4,
      "cpu": "2",
      "memory": "512mb"
    },
    "visualizer": {
	    "image": "manomarks/visualizer",
	    "ports": [
	      "5000:8080"
	    ],
	    "constraint": ["node.role==manager"],
	    "volumes": [
	      "docker",
	      "yournfs"
	    ]
	},
	"web2": {
      "image": "aksaramaya/docker-http-server:v1",
      "replicas": 4,
      "cpu": "2",
      "memory": "512mb"
    }
  },
  "volumes": {
    "yournfs": {
      "type": "nfs",
      "address": "192.168.7.11",
      "source": "/yournfs",
      "target": "/mnt"
    },
    "docker": {
      "type": "bind",
      "source": "/yournfs",
      "target": "/mnt"
    }
  }

});

console.log(JSON.stringify(b.services()));
