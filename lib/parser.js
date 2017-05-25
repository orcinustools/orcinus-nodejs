var utils = require('./utils');
var yml = require('yamljs');
var bytes = require('bytes');

var parser = function(manifestData){
	if (!(this instanceof parser)) return new parser(manifestData);

	if(typeof(manifestData) == 'object'){
		this.manifest = manifestData;
	}
	else{
		console.log("Data is not object.");
	}
}

parser.prototype.stack = function(){
	return this.manifest.stack;
}

parser.prototype.volumes = function(){
    return this.manifest.volumes;
}

parser.prototype.services = function(){
var self = this;
var data = [];

Object.keys(this.manifest.services).forEach(function(service){
	var spec = { 
        "Name": null,
        "TaskTemplate": {
            "ContainerSpec": {
                "Image": null,
                "Mounts": []
            },
            "Resources": {
                "Limits": {},
                "Reservations": {}
            },
            "RestartPolicy": {
                "Condition": "any",
                "MaxAttempts": 0
            },
            "Placement": {}
        },
        "Mode": {
            "Replicated": {
                "Replicas": 1
            }
        },
        "UpdateConfig": {
            "Parallelism": 1,
            "FailureAction": "pause",
            "MaxFailureRatio": 0
        },
        "Networks": [],
        "EndpointSpec": {
            "Mode": "vip",
        }
    };

	var container = spec.TaskTemplate.ContainerSpec;
	var resource = spec.TaskTemplate.Resources.Limits;
	var restartPolicy = spec.TaskTemplate.RestartPolicy;
	var placement = spec.TaskTemplate.Placement;
	var replicas = spec.Mode.Replicated.Replicas;
	var network = spec.Networks;
    var endpoint = spec.EndpointSpec;

	var app = self.manifest.services[service];
    var volumes = self.volumes();
	var cmd = utils.obj(app);

	if(self.stack()){
		network.push({ "Target" : self.stack()});
	}

	spec.Name = service;
    container.Image = app.image;

    /* 
    	{ environtment : array } 
    */

    if(cmd.indexOf("environment") >= 0){
    	container.Env = app.environment;
    }

    /* 
    	{ hosts : array } 
    */

    if(cmd.indexOf("hosts") >= 0){
    	container.Hosts = app.hosts;
    }

    /* 
    	{ 
    		dns : {
				"Nameservers": [
					"8.8.8.8"
				],
				"Search": [
					"example.org"
				],
				"Options": [
					"timeout:3"
				]
			}
    	} 
    */
    if(cmd.indexOf("dns") >= 0){
    	container.DNSConfig = app.dns;
    }

    /* 
    	{ cpu : float } 
    */
    if(cmd.indexOf("cpu") >= 0){
        resource.NanoCPUs = app.cpu * 1000000000;
    }

    /* 
    	{ memory : int | [kb,mb,gb] } 
    */
    if(cmd.indexOf("memory") >= 0){
        resource.MemoryBytes = bytes(app.memory);
    }

    /*
		{
			restartPolicy : {
				"Condition": "on-failure",
				"Delay": 10000000000,
				"MaxAttempts": 10
			}
		}
    */

    if(cmd.indexOf("restartPolicy") >= 0){
        restartPolicy = app.restartPolicy;
    }

    /* 
    	{ constraints : array } 
    */

    if(cmd.indexOf("constraints") >= 0){
        placement.Constraints = app.constraints;
    }

    /* 
    	{ replicas : int } 
    */

    if(cmd.indexOf("replicas") >= 0){
        replicas = app.replicas;
    }
    /* 
        { ports : array(ex-port:int-port/tcp-or-udp) } 
    */
	if(cmd.indexOf("ports") >= 0){
        endpoint.Ports = [];
        app.ports.forEach(function(ports){
            var bootstrap = {
                "PublishMode": "ingress"
            };
            var proto = ports.split("/");
            var portend = proto[0].split(":");
            bootstrap.PublishedPort = parseInt(portend[0]);
            bootstrap.TargetPort = parseInt(portend[1]);
            if(proto.length == 2){
                bootstrap.Protocol = proto[1];
            }
            else{
                bootstrap.Protocol = "tcp";
            }
            endpoint.Ports.push(bootstrap);
        });
    }
    
    /* 
    	{ networks : array } 
    */

    if(cmd.indexOf("networks") >= 0){
      app.networks.forEach(function(v){
      	network.push({ "Target" : v});
      });
    }

    /*
        example :
        {
          "volumes": {
            "docker": {
              "type": "bind",
              "source": "/var/run/docker.sock",
              "target": "/var/run/docker.sock"
            },
            "yournfs": {
              "type": "nfs",
              "address": "192.168.7.11",
              "source": "/yournfs",
              "target": "/mnt"
            }
          }
        }
    */

    if(cmd.indexOf("volumes") >= 0){
      app.volumes.forEach(function(v){
        var volume = volumes[v];
        if(volume.type == "nfs"){
            var mount = {
                "Type": "volume",
                "Source": v,
                "Target": volume.target,
                "VolumeOptions": {
                    "DriverConfig": {
                        "Options": {
                            "device": ":"+volume.source,
                            "o": "addr="+volume.address,
                            "type": "nfs"
                        }
                    }
                }
            }
            container.Mounts.push(mount);
        }
        if(volume.type == "bind"){
            var mount = {
                "Type": "bind",
                "Source": volume.source,
                "Target": volume.target
            }
            container.Mounts.push(mount);
        }
      });
    }
    

    data.push(spec);
});
    return data;
}

module.exports = parser;