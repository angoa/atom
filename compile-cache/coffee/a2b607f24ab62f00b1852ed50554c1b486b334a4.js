(function() {
  var GitRepository, Minimatch, PathLoader, PathsChunkSize, async, fs, path,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  async = require('async');

  fs = require('fs');

  path = require('path');

  GitRepository = require('atom').GitRepository;

  Minimatch = require('minimatch').Minimatch;

  PathsChunkSize = 100;

  PathLoader = (function() {
    function PathLoader(rootPath1, config) {
      var ignoreVcsIgnores, repo;
      this.rootPath = rootPath1;
      this.timestamp = config.timestamp, this.sourceNames = config.sourceNames, ignoreVcsIgnores = config.ignoreVcsIgnores, this.traverseSymlinkDirectories = config.traverseSymlinkDirectories, this.ignoredNames = config.ignoredNames, this.knownPaths = config.knownPaths;
      if (this.knownPaths == null) {
        this.knownPaths = [];
      }
      this.paths = [];
      this.lostPaths = [];
      this.scannedPaths = [];
      this.repo = null;
      if (ignoreVcsIgnores) {
        repo = GitRepository.open(this.rootPath, {
          refreshOnWindowFocus: false
        });
        if ((repo != null ? repo.relativize(path.join(this.rootPath, 'test')) : void 0) === 'test') {
          this.repo = repo;
        }
      }
    }

    PathLoader.prototype.load = function(done) {
      return this.loadPath(this.rootPath, (function(_this) {
        return function() {
          var i, len, p, ref, ref1;
          ref = _this.knownPaths;
          for (i = 0, len = ref.length; i < len; i++) {
            p = ref[i];
            if (indexOf.call(_this.scannedPaths, p) < 0 && p.indexOf(_this.rootPath) === 0) {
              _this.lostPaths.push(p);
            }
          }
          _this.flushPaths();
          if ((ref1 = _this.repo) != null) {
            ref1.destroy();
          }
          return done();
        };
      })(this));
    };

    PathLoader.prototype.isSource = function(loadedPath) {
      var i, len, ref, relativePath, sourceName;
      relativePath = path.relative(this.rootPath, loadedPath);
      ref = this.sourceNames;
      for (i = 0, len = ref.length; i < len; i++) {
        sourceName = ref[i];
        if (sourceName.match(relativePath)) {
          return true;
        }
      }
    };

    PathLoader.prototype.isIgnored = function(loadedPath, stats) {
      var i, ignoredName, len, ref, ref1, relativePath;
      relativePath = path.relative(this.rootPath, loadedPath);
      if ((ref = this.repo) != null ? ref.isPathIgnored(relativePath) : void 0) {
        return true;
      } else {
        ref1 = this.ignoredNames;
        for (i = 0, len = ref1.length; i < len; i++) {
          ignoredName = ref1[i];
          if (ignoredName.match(relativePath)) {
            return true;
          }
        }
        return false;
      }
    };

    PathLoader.prototype.isKnown = function(loadedPath) {
      return indexOf.call(this.knownPaths, loadedPath) >= 0;
    };

    PathLoader.prototype.hasChanged = function(loadedPath, stats) {
      if (stats && (this.timestamp != null)) {
        return stats.ctime >= this.timestamp;
      } else {
        return false;
      }
    };

    PathLoader.prototype.pathLoaded = function(loadedPath, stats, done) {
      this.scannedPaths.push(loadedPath);
      if (this.isSource(loadedPath) && !this.isIgnored(loadedPath, stats)) {
        if (this.isKnown(loadedPath)) {
          if (this.hasChanged(loadedPath, stats)) {
            this.paths.push(loadedPath);
          }
        } else {
          this.paths.push(loadedPath);
        }
      } else {
        if (indexOf.call(this.knownPaths, loadedPath) >= 0) {
          this.lostPaths.push(loadedPath);
        }
      }
      if (this.paths.length + this.lostPaths.length === PathsChunkSize) {
        this.flushPaths();
      }
      return done();
    };

    PathLoader.prototype.flushPaths = function() {
      if (this.paths.length) {
        emit('load-paths:paths-found', this.paths);
      }
      if (this.lostPaths.length) {
        emit('load-paths:paths-lost', this.lostPaths);
      }
      this.paths = [];
      return this.lostPaths = [];
    };

    PathLoader.prototype.loadPath = function(pathToLoad, done) {
      if (this.isIgnored(pathToLoad)) {
        return done();
      }
      return fs.lstat(pathToLoad, (function(_this) {
        return function(error, stats) {
          if (error != null) {
            return done();
          }
          if (stats.isSymbolicLink()) {
            return fs.stat(pathToLoad, function(error, stats) {
              if (error != null) {
                return done();
              }
              if (stats.isFile()) {
                return _this.pathLoaded(pathToLoad, stats, done);
              } else if (stats.isDirectory()) {
                if (_this.traverseSymlinkDirectories) {
                  return _this.loadFolder(pathToLoad, done);
                } else {
                  return done();
                }
              }
            });
          } else if (stats.isDirectory()) {
            return _this.loadFolder(pathToLoad, done);
          } else if (stats.isFile()) {
            return _this.pathLoaded(pathToLoad, stats, done);
          } else {
            return done();
          }
        };
      })(this));
    };

    PathLoader.prototype.loadFolder = function(folderPath, done) {
      return fs.readdir(folderPath, (function(_this) {
        return function(error, children) {
          if (children == null) {
            children = [];
          }
          return async.each(children, function(childName, next) {
            return _this.loadPath(path.join(folderPath, childName), next);
          }, done);
        };
      })(this));
    };

    return PathLoader;

  })();

  module.exports = function(config) {
    var error, i, ignore, j, len, len1, newConf, ref, ref1, source;
    newConf = {
      ignoreVcsIgnores: config.ignoreVcsIgnores,
      traverseSymlinkDirectories: config.traverseSymlinkDirectories,
      knownPaths: config.knownPaths,
      ignoredNames: [],
      sourceNames: []
    };
    if (config.timestamp != null) {
      newConf.timestamp = new Date(Date.parse(config.timestamp));
    }
    ref = config.sourceNames;
    for (i = 0, len = ref.length; i < len; i++) {
      source = ref[i];
      if (source) {
        try {
          newConf.sourceNames.push(new Minimatch(source, {
            matchBase: true,
            dot: true
          }));
        } catch (error1) {
          error = error1;
          console.warn("Error parsing source pattern (" + source + "): " + error.message);
        }
      }
    }
    ref1 = config.ignoredNames;
    for (j = 0, len1 = ref1.length; j < len1; j++) {
      ignore = ref1[j];
      if (ignore) {
        try {
          newConf.ignoredNames.push(new Minimatch(ignore, {
            matchBase: true,
            dot: true
          }));
        } catch (error1) {
          error = error1;
          console.warn("Error parsing ignore pattern (" + ignore + "): " + error.message);
        }
      }
    }
    return async.each(config.paths, function(rootPath, next) {
      return new PathLoader(rootPath, newConf).load(next);
    }, this.async());
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2FuZ29hLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi90YXNrcy9sb2FkLXBhdGhzLWhhbmRsZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxxRUFBQTtJQUFBOztFQUFBLEtBQUEsR0FBUSxPQUFBLENBQVEsT0FBUjs7RUFDUixFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBQ0wsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNOLGdCQUFpQixPQUFBLENBQVEsTUFBUjs7RUFDakIsWUFBYSxPQUFBLENBQVEsV0FBUjs7RUFFZCxjQUFBLEdBQWlCOztFQUVYO0lBQ1Usb0JBQUMsU0FBRCxFQUFZLE1BQVo7QUFDWixVQUFBO01BRGEsSUFBQyxDQUFBLFdBQUQ7TUFDWixJQUFDLENBQUEsbUJBQUEsU0FBRixFQUFhLElBQUMsQ0FBQSxxQkFBQSxXQUFkLEVBQTJCLDBDQUEzQixFQUE2QyxJQUFDLENBQUEsb0NBQUEsMEJBQTlDLEVBQTBFLElBQUMsQ0FBQSxzQkFBQSxZQUEzRSxFQUF5RixJQUFDLENBQUEsb0JBQUE7O1FBRTFGLElBQUMsQ0FBQSxhQUFjOztNQUNmLElBQUMsQ0FBQSxLQUFELEdBQVM7TUFDVCxJQUFDLENBQUEsU0FBRCxHQUFhO01BQ2IsSUFBQyxDQUFBLFlBQUQsR0FBZ0I7TUFFaEIsSUFBQyxDQUFBLElBQUQsR0FBUTtNQUNSLElBQUcsZ0JBQUg7UUFDRSxJQUFBLEdBQU8sYUFBYSxDQUFDLElBQWQsQ0FBbUIsSUFBQyxDQUFBLFFBQXBCLEVBQThCO1VBQUEsb0JBQUEsRUFBc0IsS0FBdEI7U0FBOUI7UUFDUCxvQkFBZ0IsSUFBSSxDQUFFLFVBQU4sQ0FBaUIsSUFBSSxDQUFDLElBQUwsQ0FBVSxJQUFDLENBQUEsUUFBWCxFQUFxQixNQUFyQixDQUFqQixXQUFBLEtBQWtELE1BQWxFO1VBQUEsSUFBQyxDQUFBLElBQUQsR0FB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LEdBQUEsRUFBSyxJQUF0QjtXQUFsQixDQUE3QixFQURGO1NBQUEsY0FBQTtVQUVNO1VBQ0osT0FBTyxDQUFDLElBQVIsQ0FBYSxnQ0FBQSxHQUFpQyxNQUFqQyxHQUF3QyxLQUF4QyxHQUE2QyxLQUFLLENBQUMsT0FBaEUsRUFIRjs7O0FBREY7QUFNQTtBQUFBLFNBQUEsd0NBQUE7O1VBQXVDO0FBQ3JDO1VBQ0UsT0FBTyxDQUFDLFlBQVksQ0FBQyxJQUFyQixDQUE4QixJQUFBLFNBQUEsQ0FBVSxNQUFWLEVBQWtCO1lBQUEsU0FBQSxFQUFXLElBQVg7WUFBaUIsR0FBQSxFQUFLLElBQXRCO1dBQWxCLENBQTlCLEVBREY7U0FBQSxjQUFBO1VBRU07VUFDSixPQUFPLENBQUMsSUFBUixDQUFhLGdDQUFBLEdBQWlDLE1BQWpDLEdBQXdDLEtBQXhDLEdBQTZDLEtBQUssQ0FBQyxPQUFoRSxFQUhGOzs7QUFERjtXQU1BLEtBQUssQ0FBQyxJQUFOLENBQ0UsTUFBTSxDQUFDLEtBRFQsRUFFRSxTQUFDLFFBQUQsRUFBVyxJQUFYO2FBQ00sSUFBQSxVQUFBLENBQVcsUUFBWCxFQUFxQixPQUFyQixDQUE2QixDQUFDLElBQTlCLENBQW1DLElBQW5DO0lBRE4sQ0FGRixFQUlFLElBQUMsQ0FBQSxLQUFELENBQUEsQ0FKRjtFQXZCZTtBQXhHakIiLCJzb3VyY2VzQ29udGVudCI6WyJhc3luYyA9IHJlcXVpcmUgJ2FzeW5jJ1xuZnMgPSByZXF1aXJlICdmcydcbnBhdGggPSByZXF1aXJlICdwYXRoJ1xue0dpdFJlcG9zaXRvcnl9ID0gcmVxdWlyZSAnYXRvbSdcbntNaW5pbWF0Y2h9ID0gcmVxdWlyZSAnbWluaW1hdGNoJ1xuXG5QYXRoc0NodW5rU2l6ZSA9IDEwMFxuXG5jbGFzcyBQYXRoTG9hZGVyXG4gIGNvbnN0cnVjdG9yOiAgKEByb290UGF0aCwgY29uZmlnKSAtPlxuICAgIHtAdGltZXN0YW1wLCBAc291cmNlTmFtZXMsIGlnbm9yZVZjc0lnbm9yZXMsIEB0cmF2ZXJzZVN5bWxpbmtEaXJlY3RvcmllcywgQGlnbm9yZWROYW1lcywgQGtub3duUGF0aHN9ID0gY29uZmlnXG5cbiAgICBAa25vd25QYXRocyA/PSBbXVxuICAgIEBwYXRocyA9IFtdXG4gICAgQGxvc3RQYXRocyA9IFtdXG4gICAgQHNjYW5uZWRQYXRocyA9IFtdXG5cbiAgICBAcmVwbyA9IG51bGxcbiAgICBpZiBpZ25vcmVWY3NJZ25vcmVzXG4gICAgICByZXBvID0gR2l0UmVwb3NpdG9yeS5vcGVuKEByb290UGF0aCwgcmVmcmVzaE9uV2luZG93Rm9jdXM6IGZhbHNlKVxuICAgICAgQHJlcG8gPSByZXBvIGlmIHJlcG8/LnJlbGF0aXZpemUocGF0aC5qb2luKEByb290UGF0aCwgJ3Rlc3QnKSkgaXMgJ3Rlc3QnXG5cbiAgbG9hZDogKGRvbmUpIC0+XG4gICAgQGxvYWRQYXRoIEByb290UGF0aCwgPT5cbiAgICAgIGZvciBwIGluIEBrbm93blBhdGhzXG4gICAgICAgIGlmIHAgbm90IGluIEBzY2FubmVkUGF0aHMgYW5kIHAuaW5kZXhPZihAcm9vdFBhdGgpIGlzIDBcbiAgICAgICAgICBAbG9zdFBhdGhzLnB1c2gocClcblxuICAgICAgQGZsdXNoUGF0aHMoKVxuICAgICAgQHJlcG8/LmRlc3Ryb3koKVxuICAgICAgZG9uZSgpXG5cbiAgaXNTb3VyY2U6IChsb2FkZWRQYXRoKSAtPlxuICAgIHJlbGF0aXZlUGF0aCA9IHBhdGgucmVsYXRpdmUoQHJvb3RQYXRoLCBsb2FkZWRQYXRoKVxuICAgIGZvciBzb3VyY2VOYW1lIGluIEBzb3VyY2VOYW1lc1xuICAgICAgcmV0dXJuIHRydWUgaWYgc291cmNlTmFtZS5tYXRjaChyZWxhdGl2ZVBhdGgpXG5cbiAgaXNJZ25vcmVkOiAobG9hZGVkUGF0aCwgc3RhdHMpIC0+XG4gICAgcmVsYXRpdmVQYXRoID0gcGF0aC5yZWxhdGl2ZShAcm9vdFBhdGgsIGxvYWRlZFBhdGgpXG4gICAgaWYgQHJlcG8/LmlzUGF0aElnbm9yZWQocmVsYXRpdmVQYXRoKVxuICAgICAgdHJ1ZVxuICAgIGVsc2VcbiAgICAgIGZvciBpZ25vcmVkTmFtZSBpbiBAaWdub3JlZE5hbWVzXG4gICAgICAgIHJldHVybiB0cnVlIGlmIGlnbm9yZWROYW1lLm1hdGNoKHJlbGF0aXZlUGF0aClcblxuICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgaXNLbm93bjogKGxvYWRlZFBhdGgpIC0+IGxvYWRlZFBhdGggaW4gQGtub3duUGF0aHNcblxuICBoYXNDaGFuZ2VkOiAobG9hZGVkUGF0aCwgc3RhdHMpIC0+XG4gICAgaWYgc3RhdHMgYW5kIEB0aW1lc3RhbXA/XG4gICAgICBzdGF0cy5jdGltZSA+PSBAdGltZXN0YW1wXG4gICAgZWxzZVxuICAgICAgZmFsc2VcblxuICBwYXRoTG9hZGVkOiAobG9hZGVkUGF0aCwgc3RhdHMsIGRvbmUpIC0+XG4gICAgQHNjYW5uZWRQYXRocy5wdXNoKGxvYWRlZFBhdGgpXG4gICAgaWYgQGlzU291cmNlKGxvYWRlZFBhdGgpIGFuZCAhQGlzSWdub3JlZChsb2FkZWRQYXRoLCBzdGF0cylcbiAgICAgIGlmIEBpc0tub3duKGxvYWRlZFBhdGgpXG4gICAgICAgIEBwYXRocy5wdXNoKGxvYWRlZFBhdGgpIGlmIEBoYXNDaGFuZ2VkKGxvYWRlZFBhdGgsIHN0YXRzKVxuICAgICAgZWxzZVxuICAgICAgICBAcGF0aHMucHVzaChsb2FkZWRQYXRoKVxuICAgIGVsc2VcbiAgICAgIEBsb3N0UGF0aHMucHVzaChsb2FkZWRQYXRoKSBpZiBsb2FkZWRQYXRoIGluIEBrbm93blBhdGhzXG5cbiAgICBAZmx1c2hQYXRocygpIGlmIEBwYXRocy5sZW5ndGggKyBAbG9zdFBhdGhzLmxlbmd0aCBpcyBQYXRoc0NodW5rU2l6ZVxuICAgIGRvbmUoKVxuXG4gIGZsdXNoUGF0aHM6IC0+XG4gICAgZW1pdCgnbG9hZC1wYXRoczpwYXRocy1mb3VuZCcsIEBwYXRocykgaWYgQHBhdGhzLmxlbmd0aFxuICAgIGVtaXQoJ2xvYWQtcGF0aHM6cGF0aHMtbG9zdCcsIEBsb3N0UGF0aHMpIGlmIEBsb3N0UGF0aHMubGVuZ3RoXG4gICAgQHBhdGhzID0gW11cbiAgICBAbG9zdFBhdGhzID0gW11cblxuICBsb2FkUGF0aDogKHBhdGhUb0xvYWQsIGRvbmUpIC0+XG4gICAgcmV0dXJuIGRvbmUoKSBpZiBAaXNJZ25vcmVkKHBhdGhUb0xvYWQpXG4gICAgZnMubHN0YXQgcGF0aFRvTG9hZCwgKGVycm9yLCBzdGF0cykgPT5cbiAgICAgIHJldHVybiBkb25lKCkgaWYgZXJyb3I/XG4gICAgICBpZiBzdGF0cy5pc1N5bWJvbGljTGluaygpXG4gICAgICAgIGZzLnN0YXQgcGF0aFRvTG9hZCwgKGVycm9yLCBzdGF0cykgPT5cbiAgICAgICAgICByZXR1cm4gZG9uZSgpIGlmIGVycm9yP1xuICAgICAgICAgIGlmIHN0YXRzLmlzRmlsZSgpXG4gICAgICAgICAgICBAcGF0aExvYWRlZChwYXRoVG9Mb2FkLCBzdGF0cywgZG9uZSlcbiAgICAgICAgICBlbHNlIGlmIHN0YXRzLmlzRGlyZWN0b3J5KClcbiAgICAgICAgICAgIGlmIEB0cmF2ZXJzZVN5bWxpbmtEaXJlY3Rvcmllc1xuICAgICAgICAgICAgICBAbG9hZEZvbGRlcihwYXRoVG9Mb2FkLCBkb25lKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICBkb25lKClcbiAgICAgIGVsc2UgaWYgc3RhdHMuaXNEaXJlY3RvcnkoKVxuICAgICAgICBAbG9hZEZvbGRlcihwYXRoVG9Mb2FkLCBkb25lKVxuICAgICAgZWxzZSBpZiBzdGF0cy5pc0ZpbGUoKVxuICAgICAgICBAcGF0aExvYWRlZChwYXRoVG9Mb2FkLCBzdGF0cywgZG9uZSlcbiAgICAgIGVsc2VcbiAgICAgICAgZG9uZSgpXG5cbiAgbG9hZEZvbGRlcjogKGZvbGRlclBhdGgsIGRvbmUpIC0+XG4gICAgZnMucmVhZGRpciBmb2xkZXJQYXRoLCAoZXJyb3IsIGNoaWxkcmVuPVtdKSA9PlxuICAgICAgYXN5bmMuZWFjaChcbiAgICAgICAgY2hpbGRyZW4sXG4gICAgICAgIChjaGlsZE5hbWUsIG5leHQpID0+XG4gICAgICAgICAgQGxvYWRQYXRoKHBhdGguam9pbihmb2xkZXJQYXRoLCBjaGlsZE5hbWUpLCBuZXh0KVxuICAgICAgICBkb25lXG4gICAgICApXG5cbm1vZHVsZS5leHBvcnRzID0gKGNvbmZpZykgLT5cbiAgbmV3Q29uZiA9XG4gICAgaWdub3JlVmNzSWdub3JlczogY29uZmlnLmlnbm9yZVZjc0lnbm9yZXNcbiAgICB0cmF2ZXJzZVN5bWxpbmtEaXJlY3RvcmllczogY29uZmlnLnRyYXZlcnNlU3ltbGlua0RpcmVjdG9yaWVzXG4gICAga25vd25QYXRoczogY29uZmlnLmtub3duUGF0aHNcbiAgICBpZ25vcmVkTmFtZXM6IFtdXG4gICAgc291cmNlTmFtZXM6IFtdXG5cbiAgaWYgY29uZmlnLnRpbWVzdGFtcD9cbiAgICBuZXdDb25mLnRpbWVzdGFtcCA9IG5ldyBEYXRlKERhdGUucGFyc2UoY29uZmlnLnRpbWVzdGFtcCkpXG5cbiAgZm9yIHNvdXJjZSBpbiBjb25maWcuc291cmNlTmFtZXMgd2hlbiBzb3VyY2VcbiAgICB0cnlcbiAgICAgIG5ld0NvbmYuc291cmNlTmFtZXMucHVzaChuZXcgTWluaW1hdGNoKHNvdXJjZSwgbWF0Y2hCYXNlOiB0cnVlLCBkb3Q6IHRydWUpKVxuICAgIGNhdGNoIGVycm9yXG4gICAgICBjb25zb2xlLndhcm4gXCJFcnJvciBwYXJzaW5nIHNvdXJjZSBwYXR0ZXJuICgje3NvdXJjZX0pOiAje2Vycm9yLm1lc3NhZ2V9XCJcblxuICBmb3IgaWdub3JlIGluIGNvbmZpZy5pZ25vcmVkTmFtZXMgd2hlbiBpZ25vcmVcbiAgICB0cnlcbiAgICAgIG5ld0NvbmYuaWdub3JlZE5hbWVzLnB1c2gobmV3IE1pbmltYXRjaChpZ25vcmUsIG1hdGNoQmFzZTogdHJ1ZSwgZG90OiB0cnVlKSlcbiAgICBjYXRjaCBlcnJvclxuICAgICAgY29uc29sZS53YXJuIFwiRXJyb3IgcGFyc2luZyBpZ25vcmUgcGF0dGVybiAoI3tpZ25vcmV9KTogI3tlcnJvci5tZXNzYWdlfVwiXG5cbiAgYXN5bmMuZWFjaChcbiAgICBjb25maWcucGF0aHMsXG4gICAgKHJvb3RQYXRoLCBuZXh0KSAtPlxuICAgICAgbmV3IFBhdGhMb2FkZXIocm9vdFBhdGgsIG5ld0NvbmYpLmxvYWQobmV4dClcbiAgICBAYXN5bmMoKVxuICApXG4iXX0=
