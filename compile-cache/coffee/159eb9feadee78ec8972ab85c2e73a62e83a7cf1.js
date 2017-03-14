(function() {
  var Task;

  Task = null;

  module.exports = {
    startTask: function(config, callback) {
      var dirtied, removed, task, taskPath;
      if (Task == null) {
        Task = require('atom').Task;
      }
      dirtied = [];
      removed = [];
      taskPath = require.resolve('./tasks/load-paths-handler');
      task = Task.once(taskPath, config, function() {
        return callback({
          dirtied: dirtied,
          removed: removed
        });
      });
      task.on('load-paths:paths-found', function(paths) {
        return dirtied.push.apply(dirtied, paths);
      });
      task.on('load-paths:paths-lost', function(paths) {
        return removed.push.apply(removed, paths);
      });
      return task;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2FuZ29hLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi9wYXRocy1sb2FkZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxJQUFBLEdBQU87O0VBRVAsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLFNBQUEsRUFBVyxTQUFDLE1BQUQsRUFBUyxRQUFUO0FBQ1QsVUFBQTs7UUFBQSxPQUFRLE9BQUEsQ0FBUSxNQUFSLENBQWUsQ0FBQzs7TUFFeEIsT0FBQSxHQUFVO01BQ1YsT0FBQSxHQUFVO01BQ1YsUUFBQSxHQUFXLE9BQU8sQ0FBQyxPQUFSLENBQWdCLDRCQUFoQjtNQUVYLElBQUEsR0FBTyxJQUFJLENBQUMsSUFBTCxDQUNMLFFBREssRUFFTCxNQUZLLEVBR0wsU0FBQTtlQUFHLFFBQUEsQ0FBUztVQUFDLFNBQUEsT0FBRDtVQUFVLFNBQUEsT0FBVjtTQUFUO01BQUgsQ0FISztNQU1QLElBQUksQ0FBQyxFQUFMLENBQVEsd0JBQVIsRUFBa0MsU0FBQyxLQUFEO2VBQVcsT0FBTyxDQUFDLElBQVIsZ0JBQWEsS0FBYjtNQUFYLENBQWxDO01BQ0EsSUFBSSxDQUFDLEVBQUwsQ0FBUSx1QkFBUixFQUFpQyxTQUFDLEtBQUQ7ZUFBVyxPQUFPLENBQUMsSUFBUixnQkFBYSxLQUFiO01BQVgsQ0FBakM7YUFFQTtJQWhCUyxDQUFYOztBQUhGIiwic291cmNlc0NvbnRlbnQiOlsiVGFzayA9IG51bGxcblxubW9kdWxlLmV4cG9ydHMgPVxuICBzdGFydFRhc2s6IChjb25maWcsIGNhbGxiYWNrKSAtPlxuICAgIFRhc2sgPz0gcmVxdWlyZSgnYXRvbScpLlRhc2tcblxuICAgIGRpcnRpZWQgPSBbXVxuICAgIHJlbW92ZWQgPSBbXVxuICAgIHRhc2tQYXRoID0gcmVxdWlyZS5yZXNvbHZlKCcuL3Rhc2tzL2xvYWQtcGF0aHMtaGFuZGxlcicpXG5cbiAgICB0YXNrID0gVGFzay5vbmNlKFxuICAgICAgdGFza1BhdGgsXG4gICAgICBjb25maWcsXG4gICAgICAtPiBjYWxsYmFjayh7ZGlydGllZCwgcmVtb3ZlZH0pXG4gICAgKVxuXG4gICAgdGFzay5vbiAnbG9hZC1wYXRoczpwYXRocy1mb3VuZCcsIChwYXRocykgLT4gZGlydGllZC5wdXNoKHBhdGhzLi4uKVxuICAgIHRhc2sub24gJ2xvYWQtcGF0aHM6cGF0aHMtbG9zdCcsIChwYXRocykgLT4gcmVtb3ZlZC5wdXNoKHBhdGhzLi4uKVxuXG4gICAgdGFza1xuIl19
