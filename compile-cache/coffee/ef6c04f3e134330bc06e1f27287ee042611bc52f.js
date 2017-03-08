(function() {
  var CompositeDisposable, Emitter, File, fs, path, ref, repoForPath;

  path = require('path');

  fs = require('fs-plus');

  ref = require('event-kit'), CompositeDisposable = ref.CompositeDisposable, Emitter = ref.Emitter;

  repoForPath = require('./helpers').repoForPath;

  module.exports = File = (function() {
    function File(arg) {
      var fullPath, realpathCache, useSyncFS;
      this.name = arg.name, fullPath = arg.fullPath, this.symlink = arg.symlink, realpathCache = arg.realpathCache, useSyncFS = arg.useSyncFS, this.stats = arg.stats;
      this.destroyed = false;
      this.emitter = new Emitter();
      this.subscriptions = new CompositeDisposable();
      this.path = fullPath;
      this.realPath = this.path;
      this.subscribeToRepo();
      this.updateStatus();
      if (useSyncFS) {
        this.realPath = fs.realpathSync(this.path);
      } else {
        fs.realpath(this.path, realpathCache, (function(_this) {
          return function(error, realPath) {
            if (_this.destroyed) {
              return;
            }
            if (realPath && realPath !== _this.path) {
              _this.realPath = realPath;
              return _this.updateStatus();
            }
          };
        })(this));
      }
    }

    File.prototype.destroy = function() {
      this.destroyed = true;
      this.subscriptions.dispose();
      return this.emitter.emit('did-destroy');
    };

    File.prototype.onDidDestroy = function(callback) {
      return this.emitter.on('did-destroy', callback);
    };

    File.prototype.onDidStatusChange = function(callback) {
      return this.emitter.on('did-status-change', callback);
    };

    File.prototype.subscribeToRepo = function() {
      var repo;
      repo = repoForPath(this.path);
      if (repo == null) {
        return;
      }
      this.subscriptions.add(repo.onDidChangeStatus((function(_this) {
        return function(event) {
          if (_this.isPathEqual(event.path)) {
            return _this.updateStatus(repo);
          }
        };
      })(this)));
      return this.subscriptions.add(repo.onDidChangeStatuses((function(_this) {
        return function() {
          return _this.updateStatus(repo);
        };
      })(this)));
    };

    File.prototype.updateStatus = function() {
      var newStatus, repo, status;
      repo = repoForPath(this.path);
      if (repo == null) {
        return;
      }
      newStatus = null;
      if (repo.isPathIgnored(this.path)) {
        newStatus = 'ignored';
      } else {
        status = repo.getCachedPathStatus(this.path);
        if (repo.isStatusModified(status)) {
          newStatus = 'modified';
        } else if (repo.isStatusNew(status)) {
          newStatus = 'added';
        }
      }
      if (newStatus !== this.status) {
        this.status = newStatus;
        return this.emitter.emit('did-status-change', newStatus);
      }
    };

    File.prototype.isPathEqual = function(pathToCompare) {
      return this.path === pathToCompare || this.realPath === pathToCompare;
    };

    return File;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2FuZ29hLy5hdG9tL3BhY2thZ2VzL3RyZWUtdmlldy9saWIvZmlsZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVI7O0VBQ0wsTUFBaUMsT0FBQSxDQUFRLFdBQVIsQ0FBakMsRUFBQyw2Q0FBRCxFQUFzQjs7RUFDckIsY0FBZSxPQUFBLENBQVEsV0FBUjs7RUFFaEIsTUFBTSxDQUFDLE9BQVAsR0FDTTtJQUNTLGNBQUMsR0FBRDtBQUNYLFVBQUE7TUFEYSxJQUFDLENBQUEsV0FBQSxNQUFNLHlCQUFVLElBQUMsQ0FBQSxjQUFBLFNBQVMsbUNBQWUsMkJBQVcsSUFBQyxDQUFBLFlBQUE7TUFDbkUsSUFBQyxDQUFBLFNBQUQsR0FBYTtNQUNiLElBQUMsQ0FBQSxPQUFELEdBQWUsSUFBQSxPQUFBLENBQUE7TUFDZixJQUFDLENBQUEsYUFBRCxHQUFxQixJQUFBLG1CQUFBLENBQUE7TUFFckIsSUFBQyxDQUFBLElBQUQsR0FBUTtNQUNSLElBQUMsQ0FBQSxRQUFELEdBQVksSUFBQyxDQUFBO01BRWIsSUFBQyxDQUFBLGVBQUQsQ0FBQTtNQUNBLElBQUMsQ0FBQSxZQUFELENBQUE7TUFFQSxJQUFHLFNBQUg7UUFDRSxJQUFDLENBQUEsUUFBRCxHQUFZLEVBQUUsQ0FBQyxZQUFILENBQWdCLElBQUMsQ0FBQSxJQUFqQixFQURkO09BQUEsTUFBQTtRQUdFLEVBQUUsQ0FBQyxRQUFILENBQVksSUFBQyxDQUFBLElBQWIsRUFBbUIsYUFBbkIsRUFBa0MsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQyxLQUFELEVBQVEsUUFBUjtZQUNoQyxJQUFVLEtBQUMsQ0FBQSxTQUFYO0FBQUEscUJBQUE7O1lBQ0EsSUFBRyxRQUFBLElBQWEsUUFBQSxLQUFjLEtBQUMsQ0FBQSxJQUEvQjtjQUNFLEtBQUMsQ0FBQSxRQUFELEdBQVk7cUJBQ1osS0FBQyxDQUFBLFlBQUQsQ0FBQSxFQUZGOztVQUZnQztRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbEMsRUFIRjs7SUFYVzs7bUJBb0JiLE9BQUEsR0FBUyxTQUFBO01BQ1AsSUFBQyxDQUFBLFNBQUQsR0FBYTtNQUNiLElBQUMsQ0FBQSxhQUFhLENBQUMsT0FBZixDQUFBO2FBQ0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsYUFBZDtJQUhPOzttQkFLVCxZQUFBLEdBQWMsU0FBQyxRQUFEO2FBQ1osSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksYUFBWixFQUEyQixRQUEzQjtJQURZOzttQkFHZCxpQkFBQSxHQUFtQixTQUFDLFFBQUQ7YUFDakIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksbUJBQVosRUFBaUMsUUFBakM7SUFEaUI7O21CQUluQixlQUFBLEdBQWlCLFNBQUE7QUFDZixVQUFBO01BQUEsSUFBQSxHQUFPLFdBQUEsQ0FBWSxJQUFDLENBQUEsSUFBYjtNQUNQLElBQWMsWUFBZDtBQUFBLGVBQUE7O01BRUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxpQkFBTCxDQUF1QixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsS0FBRDtVQUN4QyxJQUF1QixLQUFDLENBQUEsV0FBRCxDQUFhLEtBQUssQ0FBQyxJQUFuQixDQUF2QjttQkFBQSxLQUFDLENBQUEsWUFBRCxDQUFjLElBQWQsRUFBQTs7UUFEd0M7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXZCLENBQW5CO2FBRUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxtQkFBTCxDQUF5QixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQzFDLEtBQUMsQ0FBQSxZQUFELENBQWMsSUFBZDtRQUQwQztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBekIsQ0FBbkI7SUFOZTs7bUJBVWpCLFlBQUEsR0FBYyxTQUFBO0FBQ1osVUFBQTtNQUFBLElBQUEsR0FBTyxXQUFBLENBQVksSUFBQyxDQUFBLElBQWI7TUFDUCxJQUFjLFlBQWQ7QUFBQSxlQUFBOztNQUVBLFNBQUEsR0FBWTtNQUNaLElBQUcsSUFBSSxDQUFDLGFBQUwsQ0FBbUIsSUFBQyxDQUFBLElBQXBCLENBQUg7UUFDRSxTQUFBLEdBQVksVUFEZDtPQUFBLE1BQUE7UUFHRSxNQUFBLEdBQVMsSUFBSSxDQUFDLG1CQUFMLENBQXlCLElBQUMsQ0FBQSxJQUExQjtRQUNULElBQUcsSUFBSSxDQUFDLGdCQUFMLENBQXNCLE1BQXRCLENBQUg7VUFDRSxTQUFBLEdBQVksV0FEZDtTQUFBLE1BRUssSUFBRyxJQUFJLENBQUMsV0FBTCxDQUFpQixNQUFqQixDQUFIO1VBQ0gsU0FBQSxHQUFZLFFBRFQ7U0FOUDs7TUFTQSxJQUFHLFNBQUEsS0FBZSxJQUFDLENBQUEsTUFBbkI7UUFDRSxJQUFDLENBQUEsTUFBRCxHQUFVO2VBQ1YsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsbUJBQWQsRUFBbUMsU0FBbkMsRUFGRjs7SUFkWTs7bUJBa0JkLFdBQUEsR0FBYSxTQUFDLGFBQUQ7YUFDWCxJQUFDLENBQUEsSUFBRCxLQUFTLGFBQVQsSUFBMEIsSUFBQyxDQUFBLFFBQUQsS0FBYTtJQUQ1Qjs7Ozs7QUFuRWYiLCJzb3VyY2VzQ29udGVudCI6WyJwYXRoID0gcmVxdWlyZSAncGF0aCdcbmZzID0gcmVxdWlyZSAnZnMtcGx1cydcbntDb21wb3NpdGVEaXNwb3NhYmxlLCBFbWl0dGVyfSA9IHJlcXVpcmUgJ2V2ZW50LWtpdCdcbntyZXBvRm9yUGF0aH0gPSByZXF1aXJlICcuL2hlbHBlcnMnXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIEZpbGVcbiAgY29uc3RydWN0b3I6ICh7QG5hbWUsIGZ1bGxQYXRoLCBAc3ltbGluaywgcmVhbHBhdGhDYWNoZSwgdXNlU3luY0ZTLCBAc3RhdHN9KSAtPlxuICAgIEBkZXN0cm95ZWQgPSBmYWxzZVxuICAgIEBlbWl0dGVyID0gbmV3IEVtaXR0ZXIoKVxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuXG4gICAgQHBhdGggPSBmdWxsUGF0aFxuICAgIEByZWFsUGF0aCA9IEBwYXRoXG5cbiAgICBAc3Vic2NyaWJlVG9SZXBvKClcbiAgICBAdXBkYXRlU3RhdHVzKClcblxuICAgIGlmIHVzZVN5bmNGU1xuICAgICAgQHJlYWxQYXRoID0gZnMucmVhbHBhdGhTeW5jKEBwYXRoKVxuICAgIGVsc2VcbiAgICAgIGZzLnJlYWxwYXRoIEBwYXRoLCByZWFscGF0aENhY2hlLCAoZXJyb3IsIHJlYWxQYXRoKSA9PlxuICAgICAgICByZXR1cm4gaWYgQGRlc3Ryb3llZFxuICAgICAgICBpZiByZWFsUGF0aCBhbmQgcmVhbFBhdGggaXNudCBAcGF0aFxuICAgICAgICAgIEByZWFsUGF0aCA9IHJlYWxQYXRoXG4gICAgICAgICAgQHVwZGF0ZVN0YXR1cygpXG5cbiAgZGVzdHJveTogLT5cbiAgICBAZGVzdHJveWVkID0gdHJ1ZVxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIEBlbWl0dGVyLmVtaXQoJ2RpZC1kZXN0cm95JylcblxuICBvbkRpZERlc3Ryb3k6IChjYWxsYmFjaykgLT5cbiAgICBAZW1pdHRlci5vbignZGlkLWRlc3Ryb3knLCBjYWxsYmFjaylcblxuICBvbkRpZFN0YXR1c0NoYW5nZTogKGNhbGxiYWNrKSAtPlxuICAgIEBlbWl0dGVyLm9uKCdkaWQtc3RhdHVzLWNoYW5nZScsIGNhbGxiYWNrKVxuXG4gICMgU3Vic2NyaWJlIHRvIHRoZSBwcm9qZWN0J3MgcmVwbyBmb3IgY2hhbmdlcyB0byB0aGUgR2l0IHN0YXR1cyBvZiB0aGlzIGZpbGUuXG4gIHN1YnNjcmliZVRvUmVwbzogLT5cbiAgICByZXBvID0gcmVwb0ZvclBhdGgoQHBhdGgpXG4gICAgcmV0dXJuIHVubGVzcyByZXBvP1xuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIHJlcG8ub25EaWRDaGFuZ2VTdGF0dXMgKGV2ZW50KSA9PlxuICAgICAgQHVwZGF0ZVN0YXR1cyhyZXBvKSBpZiBAaXNQYXRoRXF1YWwoZXZlbnQucGF0aClcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgcmVwby5vbkRpZENoYW5nZVN0YXR1c2VzID0+XG4gICAgICBAdXBkYXRlU3RhdHVzKHJlcG8pXG5cbiAgIyBVcGRhdGUgdGhlIHN0YXR1cyBwcm9wZXJ0eSBvZiB0aGlzIGRpcmVjdG9yeSB1c2luZyB0aGUgcmVwby5cbiAgdXBkYXRlU3RhdHVzOiAtPlxuICAgIHJlcG8gPSByZXBvRm9yUGF0aChAcGF0aClcbiAgICByZXR1cm4gdW5sZXNzIHJlcG8/XG5cbiAgICBuZXdTdGF0dXMgPSBudWxsXG4gICAgaWYgcmVwby5pc1BhdGhJZ25vcmVkKEBwYXRoKVxuICAgICAgbmV3U3RhdHVzID0gJ2lnbm9yZWQnXG4gICAgZWxzZVxuICAgICAgc3RhdHVzID0gcmVwby5nZXRDYWNoZWRQYXRoU3RhdHVzKEBwYXRoKVxuICAgICAgaWYgcmVwby5pc1N0YXR1c01vZGlmaWVkKHN0YXR1cylcbiAgICAgICAgbmV3U3RhdHVzID0gJ21vZGlmaWVkJ1xuICAgICAgZWxzZSBpZiByZXBvLmlzU3RhdHVzTmV3KHN0YXR1cylcbiAgICAgICAgbmV3U3RhdHVzID0gJ2FkZGVkJ1xuXG4gICAgaWYgbmV3U3RhdHVzIGlzbnQgQHN0YXR1c1xuICAgICAgQHN0YXR1cyA9IG5ld1N0YXR1c1xuICAgICAgQGVtaXR0ZXIuZW1pdCgnZGlkLXN0YXR1cy1jaGFuZ2UnLCBuZXdTdGF0dXMpXG5cbiAgaXNQYXRoRXF1YWw6IChwYXRoVG9Db21wYXJlKSAtPlxuICAgIEBwYXRoIGlzIHBhdGhUb0NvbXBhcmUgb3IgQHJlYWxQYXRoIGlzIHBhdGhUb0NvbXBhcmVcbiJdfQ==
