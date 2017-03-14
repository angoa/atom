(function() {
  var ExpressionsRegistry, PathScanner, VariableExpression, VariableScanner, async, fs;

  async = require('async');

  fs = require('fs');

  VariableScanner = require('../variable-scanner');

  VariableExpression = require('../variable-expression');

  ExpressionsRegistry = require('../expressions-registry');

  PathScanner = (function() {
    function PathScanner(filePath, scope, registry) {
      this.filePath = filePath;
      this.scanner = new VariableScanner({
        registry: registry,
        scope: scope
      });
    }

    PathScanner.prototype.load = function(done) {
      var currentChunk, currentLine, currentOffset, lastIndex, line, readStream, results;
      currentChunk = '';
      currentLine = 0;
      currentOffset = 0;
      lastIndex = 0;
      line = 0;
      results = [];
      readStream = fs.createReadStream(this.filePath);
      readStream.on('data', (function(_this) {
        return function(chunk) {
          var i, index, lastLine, len, result, v;
          currentChunk += chunk.toString();
          index = lastIndex;
          while (result = _this.scanner.search(currentChunk, lastIndex)) {
            result.range[0] += index;
            result.range[1] += index;
            for (i = 0, len = result.length; i < len; i++) {
              v = result[i];
              v.path = _this.filePath;
              v.range[0] += index;
              v.range[1] += index;
              v.definitionRange = result.range;
              v.line += line;
              lastLine = v.line;
            }
            results = results.concat(result);
            lastIndex = result.lastIndex;
          }
          if (result != null) {
            currentChunk = currentChunk.slice(lastIndex);
            line = lastLine;
            return lastIndex = 0;
          }
        };
      })(this));
      return readStream.on('end', function() {
        emit('scan-paths:path-scanned', results);
        return done();
      });
    };

    return PathScanner;

  })();

  module.exports = function(arg) {
    var paths, registry;
    paths = arg[0], registry = arg[1];
    registry = ExpressionsRegistry.deserialize(registry, VariableExpression);
    return async.each(paths, function(arg1, next) {
      var p, s;
      p = arg1[0], s = arg1[1];
      return new PathScanner(p, s, registry).load(next);
    }, this.async());
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2FuZ29hLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi90YXNrcy9zY2FuLXBhdGhzLWhhbmRsZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxLQUFBLEdBQVEsT0FBQSxDQUFRLE9BQVI7O0VBQ1IsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUNMLGVBQUEsR0FBa0IsT0FBQSxDQUFRLHFCQUFSOztFQUNsQixrQkFBQSxHQUFxQixPQUFBLENBQVEsd0JBQVI7O0VBQ3JCLG1CQUFBLEdBQXNCLE9BQUEsQ0FBUSx5QkFBUjs7RUFFaEI7SUFDUyxxQkFBQyxRQUFELEVBQVksS0FBWixFQUFtQixRQUFuQjtNQUFDLElBQUMsQ0FBQSxXQUFEO01BQ1osSUFBQyxDQUFBLE9BQUQsR0FBZSxJQUFBLGVBQUEsQ0FBZ0I7UUFBQyxVQUFBLFFBQUQ7UUFBVyxPQUFBLEtBQVg7T0FBaEI7SUFESjs7MEJBR2IsSUFBQSxHQUFNLFNBQUMsSUFBRDtBQUNKLFVBQUE7TUFBQSxZQUFBLEdBQWU7TUFDZixXQUFBLEdBQWM7TUFDZCxhQUFBLEdBQWdCO01BQ2hCLFNBQUEsR0FBWTtNQUNaLElBQUEsR0FBTztNQUNQLE9BQUEsR0FBVTtNQUVWLFVBQUEsR0FBYSxFQUFFLENBQUMsZ0JBQUgsQ0FBb0IsSUFBQyxDQUFBLFFBQXJCO01BRWIsVUFBVSxDQUFDLEVBQVgsQ0FBYyxNQUFkLEVBQXNCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxLQUFEO0FBQ3BCLGNBQUE7VUFBQSxZQUFBLElBQWdCLEtBQUssQ0FBQyxRQUFOLENBQUE7VUFFaEIsS0FBQSxHQUFRO0FBRVIsaUJBQU0sTUFBQSxHQUFTLEtBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxDQUFnQixZQUFoQixFQUE4QixTQUE5QixDQUFmO1lBQ0UsTUFBTSxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQWIsSUFBbUI7WUFDbkIsTUFBTSxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQWIsSUFBbUI7QUFFbkIsaUJBQUEsd0NBQUE7O2NBQ0UsQ0FBQyxDQUFDLElBQUYsR0FBUyxLQUFDLENBQUE7Y0FDVixDQUFDLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBUixJQUFjO2NBQ2QsQ0FBQyxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQVIsSUFBYztjQUNkLENBQUMsQ0FBQyxlQUFGLEdBQW9CLE1BQU0sQ0FBQztjQUMzQixDQUFDLENBQUMsSUFBRixJQUFVO2NBQ1YsUUFBQSxHQUFXLENBQUMsQ0FBQztBQU5mO1lBUUEsT0FBQSxHQUFVLE9BQU8sQ0FBQyxNQUFSLENBQWUsTUFBZjtZQUNULFlBQWE7VUFiaEI7VUFlQSxJQUFHLGNBQUg7WUFDRSxZQUFBLEdBQWUsWUFBYTtZQUM1QixJQUFBLEdBQU87bUJBQ1AsU0FBQSxHQUFZLEVBSGQ7O1FBcEJvQjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdEI7YUF5QkEsVUFBVSxDQUFDLEVBQVgsQ0FBYyxLQUFkLEVBQXFCLFNBQUE7UUFDbkIsSUFBQSxDQUFLLHlCQUFMLEVBQWdDLE9BQWhDO2VBQ0EsSUFBQSxDQUFBO01BRm1CLENBQXJCO0lBbkNJOzs7Ozs7RUF1Q1IsTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBQyxHQUFEO0FBQ2YsUUFBQTtJQURpQixnQkFBTztJQUN4QixRQUFBLEdBQVcsbUJBQW1CLENBQUMsV0FBcEIsQ0FBZ0MsUUFBaEMsRUFBMEMsa0JBQTFDO1dBQ1gsS0FBSyxDQUFDLElBQU4sQ0FDRSxLQURGLEVBRUUsU0FBQyxJQUFELEVBQVMsSUFBVDtBQUNFLFVBQUE7TUFEQSxhQUFHO2FBQ0MsSUFBQSxXQUFBLENBQVksQ0FBWixFQUFlLENBQWYsRUFBa0IsUUFBbEIsQ0FBMkIsQ0FBQyxJQUE1QixDQUFpQyxJQUFqQztJQUROLENBRkYsRUFJRSxJQUFDLENBQUEsS0FBRCxDQUFBLENBSkY7RUFGZTtBQWpEakIiLCJzb3VyY2VzQ29udGVudCI6WyJhc3luYyA9IHJlcXVpcmUgJ2FzeW5jJ1xuZnMgPSByZXF1aXJlICdmcydcblZhcmlhYmxlU2Nhbm5lciA9IHJlcXVpcmUgJy4uL3ZhcmlhYmxlLXNjYW5uZXInXG5WYXJpYWJsZUV4cHJlc3Npb24gPSByZXF1aXJlICcuLi92YXJpYWJsZS1leHByZXNzaW9uJ1xuRXhwcmVzc2lvbnNSZWdpc3RyeSA9IHJlcXVpcmUgJy4uL2V4cHJlc3Npb25zLXJlZ2lzdHJ5J1xuXG5jbGFzcyBQYXRoU2Nhbm5lclxuICBjb25zdHJ1Y3RvcjogKEBmaWxlUGF0aCwgc2NvcGUsIHJlZ2lzdHJ5KSAtPlxuICAgIEBzY2FubmVyID0gbmV3IFZhcmlhYmxlU2Nhbm5lcih7cmVnaXN0cnksIHNjb3BlfSlcblxuICBsb2FkOiAoZG9uZSkgLT5cbiAgICBjdXJyZW50Q2h1bmsgPSAnJ1xuICAgIGN1cnJlbnRMaW5lID0gMFxuICAgIGN1cnJlbnRPZmZzZXQgPSAwXG4gICAgbGFzdEluZGV4ID0gMFxuICAgIGxpbmUgPSAwXG4gICAgcmVzdWx0cyA9IFtdXG5cbiAgICByZWFkU3RyZWFtID0gZnMuY3JlYXRlUmVhZFN0cmVhbShAZmlsZVBhdGgpXG5cbiAgICByZWFkU3RyZWFtLm9uICdkYXRhJywgKGNodW5rKSA9PlxuICAgICAgY3VycmVudENodW5rICs9IGNodW5rLnRvU3RyaW5nKClcblxuICAgICAgaW5kZXggPSBsYXN0SW5kZXhcblxuICAgICAgd2hpbGUgcmVzdWx0ID0gQHNjYW5uZXIuc2VhcmNoKGN1cnJlbnRDaHVuaywgbGFzdEluZGV4KVxuICAgICAgICByZXN1bHQucmFuZ2VbMF0gKz0gaW5kZXhcbiAgICAgICAgcmVzdWx0LnJhbmdlWzFdICs9IGluZGV4XG5cbiAgICAgICAgZm9yIHYgaW4gcmVzdWx0XG4gICAgICAgICAgdi5wYXRoID0gQGZpbGVQYXRoXG4gICAgICAgICAgdi5yYW5nZVswXSArPSBpbmRleFxuICAgICAgICAgIHYucmFuZ2VbMV0gKz0gaW5kZXhcbiAgICAgICAgICB2LmRlZmluaXRpb25SYW5nZSA9IHJlc3VsdC5yYW5nZVxuICAgICAgICAgIHYubGluZSArPSBsaW5lXG4gICAgICAgICAgbGFzdExpbmUgPSB2LmxpbmVcblxuICAgICAgICByZXN1bHRzID0gcmVzdWx0cy5jb25jYXQocmVzdWx0KVxuICAgICAgICB7bGFzdEluZGV4fSA9IHJlc3VsdFxuXG4gICAgICBpZiByZXN1bHQ/XG4gICAgICAgIGN1cnJlbnRDaHVuayA9IGN1cnJlbnRDaHVua1tsYXN0SW5kZXguLi0xXVxuICAgICAgICBsaW5lID0gbGFzdExpbmVcbiAgICAgICAgbGFzdEluZGV4ID0gMFxuXG4gICAgcmVhZFN0cmVhbS5vbiAnZW5kJywgLT5cbiAgICAgIGVtaXQoJ3NjYW4tcGF0aHM6cGF0aC1zY2FubmVkJywgcmVzdWx0cylcbiAgICAgIGRvbmUoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IChbcGF0aHMsIHJlZ2lzdHJ5XSkgLT5cbiAgcmVnaXN0cnkgPSBFeHByZXNzaW9uc1JlZ2lzdHJ5LmRlc2VyaWFsaXplKHJlZ2lzdHJ5LCBWYXJpYWJsZUV4cHJlc3Npb24pXG4gIGFzeW5jLmVhY2goXG4gICAgcGF0aHMsXG4gICAgKFtwLCBzXSwgbmV4dCkgLT5cbiAgICAgIG5ldyBQYXRoU2Nhbm5lcihwLCBzLCByZWdpc3RyeSkubG9hZChuZXh0KVxuICAgIEBhc3luYygpXG4gIClcbiJdfQ==
