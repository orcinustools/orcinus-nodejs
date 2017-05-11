var EventEmitter = require('events').EventEmitter,
  Modem = require('docker-modem'),
  tar = require('tar-fs'),
  zlib = require('zlib'),
  fs = require('fs'),
  concat = require('concat-stream'),
  path = require('path'),
  Container = require('./libs/container'),
  Image = require('./libs/image'),
  Volume = require('./libs/volume'),
  Network = require('./libs/network'),
  Service = require('./libs/service'),
  Plugin = require('./libs/plugin'),
  Secret = require('./libs/secret'),
  Task = require('./libs/task'),
  Node = require('./libs/node'),
  Exec = require('./libs/exec'),
  util = require('./libs/util'),
  extend = util.extend;

var orcinus = function(opts) {
  if (!(this instanceof orcinus)) return new orcinus(opts);

  var plibrary = global.Promise;

  if (opts && opts.Promise) {
    plibrary = opts.Promise;

    if (Object.keys(opts).length === 1) {
      opts = undefined;
    }
  }

  this.modem = new Modem(opts);
  this.modem.Promise = plibrary;
};


orcinus.prototype.createContainer = function(opts, callback) {
  var self = this;
  var optsf = {
    path: '/containers/create?',
    method: 'POST',
    options: opts,
    authconfig: opts.authconfig,
    statusCodes: {
      200: true,
      201: true,
      404: 'no such container',
      406: 'impossible to attach',
      500: 'server error'
    }
  };

  delete opts.authconfig;

  if (callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(self.getContainer(data.Id));
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      if (err) return callback(err, data);
      callback(err, self.getContainer(data.Id));
    });
  }
};


orcinus.prototype.createImage = function(auth, opts, callback) {
  var self = this;
  if (!callback && typeof opts === 'function') {
    callback = opts;
    opts = auth;
    auth = opts.authconfig || undefined;
  } else if (!callback && !opts) {
    opts = auth;
    auth = opts.authconfig;
  }

  var optsf = {
    path: '/images/create?',
    method: 'POST',
    options: opts,
    authconfig: auth,
    isStream: true,
    statusCodes: {
      200: true,
      500: 'server error'
    }
  };

  if (callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      callback(err, data);
    });
  }
};


orcinus.prototype.loadImage = function(file, opts, callback) {
  var self = this;
  if (!callback && typeof opts === 'function') {
    callback = opts;
    opts = null;
  }

  var optsf = {
    path: '/images/load?',
    method: 'POST',
    options: opts,
    file: file,
    isStream: true,
    statusCodes: {
      200: true,
      500: 'server error'
    }
  };

  if (callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      callback(err, data);
    });
  }
};


orcinus.prototype.importImage = function(file, opts, callback) {
  var self = this;
  if (!callback && typeof opts === 'function') {
    callback = opts;
    opts = {};
  }

  opts.fromSrc = '-';

  var optsf = {
    path: '/images/create?',
    method: 'POST',
    options: opts,
    file: file,
    isStream: true,
    statusCodes: {
      200: true,
      500: 'server error'
    }
  };

  if (callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      callback(err, data);
    });
  }
};


orcinus.prototype.checkAuth = function(opts, callback) {
  var self = this;
  var optsf = {
    path: '/auth',
    method: 'POST',
    options: opts,
    statusCodes: {
      200: true,
      204: true,
      500: 'server error'
    }
  };

  if (callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      callback(err, data);
    });
  }
};


orcinus.prototype.buildImage = function(file, opts, callback) {
  var self = this;
  var pack = tar.pack();
  var content;

  if (!callback && typeof opts === 'function') {
    callback = opts;
    opts = null;
  }

  function build(file) {
    var optsf = {
      path: '/build?',
      method: 'POST',
      file: file,
      options: opts,
      isStream: true,
      statusCodes: {
        200: true,
        500: 'server error'
      }
    };

    if (opts) {
      if (opts.registryconfig) {
        optsf.registryconfig = optsf.options.registryconfig;
        delete optsf.options.registryconfig;
      }

      //undocumented?
      if (opts.authconfig) {
        optsf.authconfig = optsf.options.authconfig;
        delete optsf.options.authconfig;
      }
    }

    if (callback === undefined) {
      return new self.modem.Promise(function(resolve, reject) {
        self.modem.dial(optsf, function(err, data) {
          if (err) {
            return reject(err);
          }
          resolve(data);
        });
      });
    } else {
      self.modem.dial(optsf, function(err, data) {
        callback(err, data);
      });
    }
  }

  if (file.context) {
    file.src.forEach(function(filePath) {
      content = fs.readFileSync(path.join(file.context, filePath));
      pack.entry({
        name: filePath
      }, content);
    });
    pack.finalize();
    return build(pack.pipe(zlib.createGzip()));
  } else {
    return build(file);
  }
};


orcinus.prototype.getContainer = function(id) {
  return new Container(this.modem, id);
};


orcinus.prototype.getImage = function(name) {
  return new Image(this.modem, name);
};


orcinus.prototype.getVolume = function(name) {
  return new Volume(this.modem, name);
};


orcinus.prototype.getPlugin = function(name, remote) {
  return new Plugin(this.modem, name, remote);
};


orcinus.prototype.getService = function(id) {
  return new Service(this.modem, id);
};


orcinus.prototype.getTask = function(id) {
  return new Task(this.modem, id);
};


orcinus.prototype.getNode = function(id) {
  return new Node(this.modem, id);
};


orcinus.prototype.getNetwork = function(id) {
  return new Network(this.modem, id);
};


orcinus.prototype.getSecret = function(id) {
  return new Secret(this.modem, id);
};


orcinus.prototype.getExec = function(id) {
  return new Exec(this.modem, id);
};


orcinus.prototype.listContainers = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/containers/json?',
    method: 'GET',
    options: args.opts,
    statusCodes: {
      200: true,
      400: 'bad parameter',
      500: 'server error'
    }
  };

  if (args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};


orcinus.prototype.listImages = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/images/json?',
    method: 'GET',
    options: args.opts,
    statusCodes: {
      200: true,
      400: 'bad parameter',
      500: 'server error'
    }
  };

  if (args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};


orcinus.prototype.listServices = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/services?',
    method: 'GET',
    options: args.opts,
    statusCodes: {
      200: true,
      500: 'server error',
      503: 'node is not part of a Orcinus'
    }
  };

  if (args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};

orcinus.prototype.listNodes = function(callback) {
  var self = this;
  var optsf = {
    path: '/nodes',
    method: 'GET',
    statusCodes: {
      200: true,
      500: 'server error'
    }
  };

  if (callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      callback(err, data);
    });
  }
};

orcinus.prototype.listTasks = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/tasks?',
    method: 'GET',
    options: args.opts,
    statusCodes: {
      200: true,
      500: 'server error'
    }
  };

  if (args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};

orcinus.prototype.createSecret = function(opts, callback) {
  var args = util.processArgs(opts, callback);
  var self = this;
  var optsf = {
    path: '/secrets/create?',
    method: 'POST',
    options: args.opts,
    statusCodes: {
      200: true, // unofficial, but proxies may return it
      201: true,
      406: 'server error or node is not part of a swarm',
      409: 'name conflicts with an existing object',
      500: 'server error'
    }
  };


  if (args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(self.getSecret(data.ID));
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      if (err) return args.callback(err, data);
      args.callback(err, self.getSecret(data.ID));
    });
  }
};

orcinus.prototype.listSecrets = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/secrets?',
    method: 'GET',
    options: args.opts,
    statusCodes: {
      200: true,
      500: 'server error'
    }
  };

  if (args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};

orcinus.prototype.createPlugin = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);
  var optsf = {
    path: '/plugins/create?',
    method: 'POST',
    options: args.opts,
    statusCodes: {
      200: true, // unofficial, but proxies may return it
      204: true,
      500: 'server error'
    }
  };


  if (args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(self.getPlugin(args.opts.name));
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      if (err) return args.callback(err, data);
      args.callback(err, self.getPlugin(args.opts.name));
    });
  }
};


orcinus.prototype.listPlugins = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/plugins?',
    method: 'GET',
    options: args.opts,
    statusCodes: {
      200: true,
      500: 'server error'
    }
  };

  if (args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};


orcinus.prototype.pruneImages = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/images/prune?',
    method: 'POST',
    options: args.opts,
    statusCodes: {
      200: true,
      500: 'server error'
    }
  };

  if (args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};


orcinus.prototype.pruneContainers = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/containers/prune?',
    method: 'POST',
    options: args.opts,
    statusCodes: {
      200: true,
      500: 'server error'
    }
  };

  if (args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};


orcinus.prototype.pruneVolumes = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/volumes/prune?',
    method: 'POST',
    options: args.opts,
    statusCodes: {
      200: true,
      500: 'server error'
    }
  };

  if (args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};


orcinus.prototype.pruneNetworks = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/networks/prune?',
    method: 'POST',
    options: args.opts,
    statusCodes: {
      200: true,
      500: 'server error'
    }
  };

  if (args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};


orcinus.prototype.createVolume = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);
  var optsf = {
    path: '/volumes/create?',
    method: 'POST',
    options: args.opts,
    statusCodes: {
      200: true, // unofficial, but proxies may return it
      201: true,
      500: 'server error'
    }
  };


  if (args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(self.getVolume(data.Name));
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      if (err) return args.callback(err, data);
      args.callback(err, self.getVolume(data.Name));
    });
  }
};

orcinus.prototype.createService = function(auth, opts, callback) {
  if (!callback && typeof opts === 'function') {
    callback = opts;
    opts = auth;
    auth = opts.authconfig || undefined;
  } else if (!opts && !callback) {
    opts = auth;
  }


  var self = this;
  var optsf = {
    path: '/services/create',
    method: 'POST',
    options: opts,
    authconfig: auth,
    statusCodes: {
      200: true,
      201: true,
      500: 'server error'
    }
  };


  if (callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(self.getService(data.ID || data.Id));
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      if (err) return callback(err, data);
      callback(err, self.getService(data.ID || data.Id));
    });
  }
};

orcinus.prototype.listVolumes = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/volumes?',
    method: 'GET',
    options: args.opts,
    statusCodes: {
      200: true,
      400: 'bad parameter',
      500: 'server error'
    }
  };

  if (args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};

orcinus.prototype.createNetwork = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);
  var optsf = {
    path: '/networks/create?',
    method: 'POST',
    options: args.opts,
    statusCodes: {
      200: true, // unofficial, but proxies may return it
      201: true,
      404: 'driver not found',
      500: 'server error'
    }
  };


  if (args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(self.getNetwork(data.Id));
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      if (err) return args.callback(err, data);
      args.callback(err, self.getNetwork(data.Id));
    });
  }
};

orcinus.prototype.listNetworks = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/networks?',
    method: 'GET',
    options: args.opts,
    statusCodes: {
      200: true,
      400: 'bad parameter',
      500: 'server error'
    }
  };

  if (args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};

orcinus.prototype.searchImages = function(opts, callback) {
  var self = this;
  var optsf = {
    path: '/images/search?',
    method: 'GET',
    options: opts,
    statusCodes: {
      200: true,
      500: 'server error'
    }
  };

  if (callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      callback(err, data);
    });
  }
};

orcinus.prototype.info = function(callback) {
  var self = this;
  var opts = {
    path: '/info',
    method: 'GET',
    statusCodes: {
      200: true,
      500: 'server error'
    }
  };


  if (callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(opts, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(opts, function(err, data) {
      callback(err, data);
    });
  }
};

orcinus.prototype.version = function(callback) {
  var self = this;
  var opts = {
    path: '/version',
    method: 'GET',
    statusCodes: {
      200: true,
      500: 'server error'
    }
  };

  if (callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(opts, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(opts, function(err, data) {
      callback(err, data);
    });
  }
};

orcinus.prototype.ping = function(callback) {
  var self = this;
  var optsf = {
    path: '/_ping',
    method: 'GET',
    statusCodes: {
      200: true,
      500: 'server error'
    }
  };

  if (callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      callback(err, data);
    });
  }
};

orcinus.prototype.getEvents = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/events?',
    method: 'GET',
    options: args.opts,
    isStream: true,
    statusCodes: {
      200: true,
      500: 'server error'
    }
  };

  if (args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};

orcinus.prototype.pull = function(repoTag, opts, callback, auth) {
  var args = util.processArgs(opts, callback);

  var imageSrc = util.parseRepositoryTag(repoTag);
  args.opts.fromImage = imageSrc.repository;
  args.opts.tag = imageSrc.tag;

  var argsf = [args.opts, args.callback];
  if (auth) {
    argsf = [auth, args.opts, args.callback];
  }
  return this.createImage.apply(this, argsf);
};


orcinus.prototype.run = function(image, cmd, streamo, createOptions, startOptions, callback) {
  if (typeof arguments[arguments.length - 1] === 'function') {
    return this.runCallback(image, cmd, streamo, createOptions, startOptions, callback);
  } else {
    return this.runPromise(image, cmd, streamo, createOptions, startOptions);
  }
};


orcinus.prototype.runCallback = function(image, cmd, streamo, createOptions, startOptions, callback) {
  if (!callback && typeof createOptions === 'function') {
    callback = createOptions;
    createOptions = {};
    startOptions = {};
  } else if (!callback && typeof startOptions === 'function') {
    callback = startOptions;
    startOptions = {};
  }

  var hub = new EventEmitter();

  function handler(err, container) {
    if (err) return callback(err, null, container);

    hub.emit('container', container);

    container.attach({
      stream: true,
      stdout: true,
      stderr: true
    }, function handler(err, stream) {
      if (err) return callback(err, null, container);

      hub.emit('stream', stream);

      if (streamo) {
        if (streamo instanceof Array) {
          stream.on('end', function() {
            try {
              streamo[0].end();
            } catch (e) {}
            try {
              streamo[1].end();
            } catch (e) {}
          });
          container.modem.demuxStream(stream, streamo[0], streamo[1]);
        } else {
          stream.setEncoding('utf8');
          stream.pipe(streamo, {
            end: true
          });
        }
      }

      container.start(startOptions, function(err, data) {
        if (err) return callback(err, data, container);
        hub.emit('start', container);

        container.wait(function(err, data) {
          hub.emit('data', data);
          callback(err, data, container);
        });
      });
    });
  }

  var optsc = {
    'Hostname': '',
    'User': '',
    'AttachStdin': false,
    'AttachStdout': true,
    'AttachStderr': true,
    'Tty': true,
    'OpenStdin': false,
    'StdinOnce': false,
    'Env': null,
    'Cmd': cmd,
    'Image': image,
    'Volumes': {},
    'VolumesFrom': []
  };

  extend(optsc, createOptions);

  this.createContainer(optsc, handler);

  return hub;
};

orcinus.prototype.runPromise = function(image, cmd, streamo, createOptions, startOptions) {
  var self = this;

  createOptions = createOptions || {};
  startOptions = startOptions || {};

  var optsc = {
    'Hostname': '',
    'User': '',
    'AttachStdin': false,
    'AttachStdout': true,
    'AttachStderr': true,
    'Tty': true,
    'OpenStdin': false,
    'StdinOnce': false,
    'Env': null,
    'Cmd': cmd,
    'Image': image,
    'Volumes': {},
    'VolumesFrom': []
  };

  extend(optsc, createOptions);

  var containero;

  return new this.modem.Promise(function(resolve, reject) {
    self.createContainer(optsc).then(function(container) {
      containero = container;
      return container.attach({
        stream: true,
        stdout: true,
        stderr: true
      });
    }).then(function(stream) {
      if (streamo) {
        if (streamo instanceof Array) {
          stream.on('end', function() {
            try {
              streamo[0].end();
            } catch (e) {}
            try {
              streamo[1].end();
            } catch (e) {}
          });
          containero.modem.demuxStream(stream, streamo[0], streamo[1]);
        } else {
          stream.setEncoding('utf8');
          stream.pipe(streamo, {
            end: true
          });
        }
      }
      return containero.start();
    }).then(function(container) {
      return container.wait();
    }).then(function(data) {
      containero.output = data;
      resolve(containero);
    }).catch(function(err) {
      reject(err);
    });
  });
};

/* Cluster management */

orcinus.prototype.cluster = function(callback) {
  var self = this;
  var opts = {
    path: '/swarm',
    method: 'GET',
    statusCodes: {
      200: true,
      400: 'no suck Orcinus',
      500: 'server error',
      503: 'node is not part a Orcinus'
    }
  };


  if (callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(opts, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(opts, function(err, data) {
      callback(err, data);
    });
  }
};

orcinus.prototype.clusterInit = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/swarm/init',
    method: 'POST',
    statusCodes: {
      200: true,
      400: 'bad parameter',
      500: 'server error',
      503: 'node is already part of a Orcinus'
    },
    options: args.opts
  };

  if (args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};

orcinus.prototype.clusterJoin = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/swarm/join',
    method: 'POST',
    statusCodes: {
      200: true,
      400: 'bad parameter',
      406: 'node is already part of a Orcinus'
    },
    options: args.opts
  };

  if (args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};

orcinus.prototype.clusterLeave = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/swarm/leave?',
    method: 'POST',
    statusCodes: {
      200: true,
      406: 'node is not part of a Orcinus'
    },
    options: args.opts
  };

  if (args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};


orcinus.prototype.clusterUpdate = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/swarm/update?',
    method: 'POST',
    statusCodes: {
      200: true,
      400: 'bad parameter',
      406: 'node is already part of a Orcinus'
    },
    options: args.opts
  };

  if (args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};

orcinus.prototype.clusterInspect = function(callback) {
  var self = this;
  var optsf = {
    path: '/swarm',
    method: 'GET',
    statusCodes: {
      200: true,
      406: 'This node is not a swarm manager',
      500: 'server error'
    }
  };

  if (callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      callback(err, data);
    });
  }
};

orcinus.Container = Container;
orcinus.Image = Image;
orcinus.Volume = Volume;
orcinus.Network = Network;
orcinus.Service = Service;
orcinus.Plugin = Plugin;
orcinus.Secret = Secret;
orcinus.Task = Task;
orcinus.Node = Node;
orcinus.Exec = Exec;

module.exports = orcinus;