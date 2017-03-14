(function() {
  var Task;

  Task = null;

  module.exports = {
    startTask: function(paths, registry, callback) {
      var results, taskPath;
      if (Task == null) {
        Task = require('atom').Task;
      }
      results = [];
      taskPath = require.resolve('./tasks/scan-paths-handler');
      this.task = Task.once(taskPath, [paths, registry.serialize()], (function(_this) {
        return function() {
          _this.task = null;
          return callback(results);
        };
      })(this));
      this.task.on('scan-paths:path-scanned', function(result) {
        return results = results.concat(result);
      });
      return this.task;
    },
    terminateRunningTask: function() {
      var ref;
      return (ref = this.task) != null ? ref.terminate() : void 0;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2FuZ29hLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi9wYXRocy1zY2FubmVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsSUFBQSxHQUFPOztFQUVQLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxTQUFBLEVBQVcsU0FBQyxLQUFELEVBQVEsUUFBUixFQUFrQixRQUFsQjtBQUNULFVBQUE7O1FBQUEsT0FBUSxPQUFBLENBQVEsTUFBUixDQUFlLENBQUM7O01BRXhCLE9BQUEsR0FBVTtNQUNWLFFBQUEsR0FBVyxPQUFPLENBQUMsT0FBUixDQUFnQiw0QkFBaEI7TUFFWCxJQUFDLENBQUEsSUFBRCxHQUFRLElBQUksQ0FBQyxJQUFMLENBQ04sUUFETSxFQUVOLENBQUMsS0FBRCxFQUFRLFFBQVEsQ0FBQyxTQUFULENBQUEsQ0FBUixDQUZNLEVBR04sQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ0UsS0FBQyxDQUFBLElBQUQsR0FBUTtpQkFDUixRQUFBLENBQVMsT0FBVDtRQUZGO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUhNO01BUVIsSUFBQyxDQUFBLElBQUksQ0FBQyxFQUFOLENBQVMseUJBQVQsRUFBb0MsU0FBQyxNQUFEO2VBQ2xDLE9BQUEsR0FBVSxPQUFPLENBQUMsTUFBUixDQUFlLE1BQWY7TUFEd0IsQ0FBcEM7YUFHQSxJQUFDLENBQUE7SUFqQlEsQ0FBWDtJQW1CQSxvQkFBQSxFQUFzQixTQUFBO0FBQ3BCLFVBQUE7NENBQUssQ0FBRSxTQUFQLENBQUE7SUFEb0IsQ0FuQnRCOztBQUhGIiwic291cmNlc0NvbnRlbnQiOlsiVGFzayA9IG51bGxcblxubW9kdWxlLmV4cG9ydHMgPVxuICBzdGFydFRhc2s6IChwYXRocywgcmVnaXN0cnksIGNhbGxiYWNrKSAtPlxuICAgIFRhc2sgPz0gcmVxdWlyZSgnYXRvbScpLlRhc2tcblxuICAgIHJlc3VsdHMgPSBbXVxuICAgIHRhc2tQYXRoID0gcmVxdWlyZS5yZXNvbHZlKCcuL3Rhc2tzL3NjYW4tcGF0aHMtaGFuZGxlcicpXG5cbiAgICBAdGFzayA9IFRhc2sub25jZShcbiAgICAgIHRhc2tQYXRoLFxuICAgICAgW3BhdGhzLCByZWdpc3RyeS5zZXJpYWxpemUoKV0sXG4gICAgICA9PlxuICAgICAgICBAdGFzayA9IG51bGxcbiAgICAgICAgY2FsbGJhY2socmVzdWx0cylcbiAgICApXG5cbiAgICBAdGFzay5vbiAnc2Nhbi1wYXRoczpwYXRoLXNjYW5uZWQnLCAocmVzdWx0KSAtPlxuICAgICAgcmVzdWx0cyA9IHJlc3VsdHMuY29uY2F0KHJlc3VsdClcblxuICAgIEB0YXNrXG5cbiAgdGVybWluYXRlUnVubmluZ1Rhc2s6IC0+XG4gICAgQHRhc2s/LnRlcm1pbmF0ZSgpXG4iXX0=
