(function() {
  var CompositeDisposable, CursorModel, Emitter, ref;

  ref = require('atom'), Emitter = ref.Emitter, CompositeDisposable = ref.CompositeDisposable;

  module.exports = CursorModel = (function() {
    CursorModel.prototype.subscriptions = null;

    CursorModel.prototype.emitter = null;

    CursorModel.prototype.manager = null;

    CursorModel.prototype.cursor = null;

    function CursorModel(manager, cursor) {
      this.subscriptions = new CompositeDisposable;
      this.emitter = new Emitter;
      this.manager = manager;
      this.cursor = cursor;
      this.initialize();
      this.subscribe();
    }

    CursorModel.prototype.initialize = function() {
      return atom.views.getView(this);
    };

    CursorModel.prototype.getCursor = function() {
      return this.cursor;
    };

    CursorModel.prototype.subscribe = function() {
      this.subscriptions.add(this.manager.onDidDestroy(this.destroy.bind(this)));
      this.subscriptions.add(this.cursor.onDidDestroy(this.destroy.bind(this)));
      return this.subscriptions.add(this.cursor.onDidChangePosition(this.change.bind(this)));
    };

    CursorModel.prototype.onDidChange = function(fn) {
      return this.emitter.on('did-change', fn);
    };

    CursorModel.prototype.onDidDestroy = function(fn) {
      return this.emitter.on('did-destroy', fn);
    };

    CursorModel.prototype.change = function(event) {
      return this.emitter.emit('did-change', event.newScreenPosition);
    };

    CursorModel.prototype.destroy = function() {
      this.subscriptions.dispose();
      this.emitter.emit('did-destroy');
      return this.emitter.dispose();
    };

    return CursorModel;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2FuZ29hLy5hdG9tL3BhY2thZ2VzL3J1bGVyei9saWIvY3Vyc29yLW1vZGVsLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBaUMsT0FBQSxDQUFRLE1BQVIsQ0FBakMsRUFBQyxxQkFBRCxFQUFVOztFQUVWLE1BQU0sQ0FBQyxPQUFQLEdBQ007MEJBQ0osYUFBQSxHQUFlOzswQkFDZixPQUFBLEdBQVM7OzBCQUNULE9BQUEsR0FBUzs7MEJBQ1QsTUFBQSxHQUFROztJQUVLLHFCQUFDLE9BQUQsRUFBVSxNQUFWO01BQ1gsSUFBQyxDQUFBLGFBQUQsR0FBaUIsSUFBSTtNQUNyQixJQUFDLENBQUEsT0FBRCxHQUFpQixJQUFJO01BQ3JCLElBQUMsQ0FBQSxPQUFELEdBQWlCO01BQ2pCLElBQUMsQ0FBQSxNQUFELEdBQWlCO01BQ2pCLElBQUMsQ0FBQSxVQUFELENBQUE7TUFDQSxJQUFDLENBQUEsU0FBRCxDQUFBO0lBTlc7OzBCQVFiLFVBQUEsR0FBWSxTQUFBO2FBRVYsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLElBQW5CO0lBRlU7OzBCQUtaLFNBQUEsR0FBVyxTQUFBO2FBQ1QsSUFBQyxDQUFBO0lBRFE7OzBCQUlYLFNBQUEsR0FBVyxTQUFBO01BQ1QsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSxPQUFPLENBQUMsWUFBVCxDQUFzQixJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxJQUFkLENBQXRCLENBQW5CO01BQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBUixDQUFxQixJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxJQUFkLENBQXJCLENBQW5CO2FBQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSxNQUFNLENBQUMsbUJBQVIsQ0FBNEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFSLENBQWEsSUFBYixDQUE1QixDQUFuQjtJQUhTOzswQkFLWCxXQUFBLEdBQWEsU0FBQyxFQUFEO2FBQ1gsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksWUFBWixFQUEwQixFQUExQjtJQURXOzswQkFHYixZQUFBLEdBQWMsU0FBQyxFQUFEO2FBQ1osSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksYUFBWixFQUEyQixFQUEzQjtJQURZOzswQkFJZCxNQUFBLEdBQVEsU0FBQyxLQUFEO2FBQ04sSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsWUFBZCxFQUE0QixLQUFLLENBQUMsaUJBQWxDO0lBRE07OzBCQUlSLE9BQUEsR0FBUyxTQUFBO01BQ1AsSUFBQyxDQUFBLGFBQWEsQ0FBQyxPQUFmLENBQUE7TUFDQSxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxhQUFkO2FBQ0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxPQUFULENBQUE7SUFITzs7Ozs7QUExQ1giLCJzb3VyY2VzQ29udGVudCI6WyJ7RW1pdHRlciwgQ29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBDdXJzb3JNb2RlbFxuICBzdWJzY3JpcHRpb25zOiBudWxsXG4gIGVtaXR0ZXI6IG51bGxcbiAgbWFuYWdlcjogbnVsbFxuICBjdXJzb3I6IG51bGxcblxuICBjb25zdHJ1Y3RvcjogKG1hbmFnZXIsIGN1cnNvcikgLT5cbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQGVtaXR0ZXIgICAgICAgPSBuZXcgRW1pdHRlclxuICAgIEBtYW5hZ2VyICAgICAgID0gbWFuYWdlclxuICAgIEBjdXJzb3IgICAgICAgID0gY3Vyc29yXG4gICAgQGluaXRpYWxpemUoKVxuICAgIEBzdWJzY3JpYmUoKVxuXG4gIGluaXRpYWxpemU6IC0+XG4gICAgIyBUcmlnZ2VyIHRoZSBjcmVhdGlvbiBvZiB0aGUgYXNzb2NpYXRlZCBSdWxlclZpZXcuXG4gICAgYXRvbS52aWV3cy5nZXRWaWV3IEBcblxuICAjIFB1YmxpY1xuICBnZXRDdXJzb3I6IC0+XG4gICAgQGN1cnNvclxuXG4gICMgTGlzdGVuIGZvciBldmVudHMgZnJvbSB0aGUgQ3Vyc29yLlxuICBzdWJzY3JpYmU6IC0+XG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBtYW5hZ2VyLm9uRGlkRGVzdHJveSBAZGVzdHJveS5iaW5kKEApXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBjdXJzb3Iub25EaWREZXN0cm95IEBkZXN0cm95LmJpbmQoQClcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQGN1cnNvci5vbkRpZENoYW5nZVBvc2l0aW9uIEBjaGFuZ2UuYmluZChAKVxuXG4gIG9uRGlkQ2hhbmdlOiAoZm4pIC0+XG4gICAgQGVtaXR0ZXIub24gJ2RpZC1jaGFuZ2UnLCBmblxuXG4gIG9uRGlkRGVzdHJveTogKGZuKSAtPlxuICAgIEBlbWl0dGVyLm9uICdkaWQtZGVzdHJveScsIGZuXG5cbiAgIyBQcm94eSBhIGN1cnNvckRpZENoYW5nZVBvc2l0aW9uIGV2ZW50LCBwYXNzaW5nIGEgUG9pbnRcbiAgY2hhbmdlOiAoZXZlbnQpIC0+XG4gICAgQGVtaXR0ZXIuZW1pdCAnZGlkLWNoYW5nZScsIGV2ZW50Lm5ld1NjcmVlblBvc2l0aW9uXG5cbiAgIyBDbGVhbiB1cC5cbiAgZGVzdHJveTogLT5cbiAgICBAc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICBAZW1pdHRlci5lbWl0ICdkaWQtZGVzdHJveSdcbiAgICBAZW1pdHRlci5kaXNwb3NlKClcbiJdfQ==
