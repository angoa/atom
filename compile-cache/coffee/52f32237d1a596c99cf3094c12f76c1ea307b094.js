(function() {
  var CompositeDisposable, CursorModel, Emitter, RulerManager, RulerView, ref;

  ref = require('atom'), Emitter = ref.Emitter, CompositeDisposable = ref.CompositeDisposable;

  CursorModel = require('./cursor-model.coffee');

  RulerView = require('./ruler-view.coffee');

  module.exports = RulerManager = (function() {
    RulerManager.prototype.subscriptions = null;

    RulerManager.prototype.emitter = null;

    function RulerManager() {
      this.subscriptions = new CompositeDisposable;
      this.emitter = new Emitter;
      this.models = [];
      this.initialize();
      this.handleEvents();
    }

    RulerManager.prototype.initialize = function() {
      return atom.views.addViewProvider(CursorModel, function(model) {
        return new RulerView().initialize(model);
      });
    };

    RulerManager.prototype.handleEvents = function() {
      return this.subscriptions.add(atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          return _this.subscriptions.add(editor.observeCursors(function(cursor) {
            return new CursorModel(_this, cursor);
          }));
        };
      })(this)));
    };

    RulerManager.prototype.onDidDestroy = function(fn) {
      return this.emitter.on('did-destroy', fn);
    };

    RulerManager.prototype.destroy = function() {
      this.subscriptions.dispose();
      this.subscriptions = null;
      this.emitter.emit('did-destroy');
      this.emitter.dispose();
      return this.emitter = null;
    };

    return RulerManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2FuZ29hLy5hdG9tL3BhY2thZ2VzL3J1bGVyei9saWIvcnVsZXItbWFuYWdlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE1BQWlDLE9BQUEsQ0FBUSxNQUFSLENBQWpDLEVBQUMscUJBQUQsRUFBVTs7RUFDVixXQUFBLEdBQWlDLE9BQUEsQ0FBUSx1QkFBUjs7RUFDakMsU0FBQSxHQUFpQyxPQUFBLENBQVEscUJBQVI7O0VBRWpDLE1BQU0sQ0FBQyxPQUFQLEdBQ007MkJBQ0osYUFBQSxHQUFlOzsyQkFDZixPQUFBLEdBQVM7O0lBRUksc0JBQUE7TUFDWCxJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFJO01BQ3JCLElBQUMsQ0FBQSxPQUFELEdBQWlCLElBQUk7TUFDckIsSUFBQyxDQUFBLE1BQUQsR0FBaUI7TUFDakIsSUFBQyxDQUFBLFVBQUQsQ0FBQTtNQUNBLElBQUMsQ0FBQSxZQUFELENBQUE7SUFMVzs7MkJBT2IsVUFBQSxHQUFZLFNBQUE7YUFFVixJQUFJLENBQUMsS0FBSyxDQUFDLGVBQVgsQ0FBMkIsV0FBM0IsRUFBd0MsU0FBQyxLQUFEO2VBQ2xDLElBQUEsU0FBQSxDQUFBLENBQVcsQ0FBQyxVQUFaLENBQXVCLEtBQXZCO01BRGtDLENBQXhDO0lBRlU7OzJCQU1aLFlBQUEsR0FBYyxTQUFBO2FBQ1osSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxTQUFTLENBQUMsa0JBQWYsQ0FBa0MsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLE1BQUQ7aUJBQ25ELEtBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixNQUFNLENBQUMsY0FBUCxDQUFzQixTQUFDLE1BQUQ7bUJBQ25DLElBQUEsV0FBQSxDQUFZLEtBQVosRUFBZSxNQUFmO1VBRG1DLENBQXRCLENBQW5CO1FBRG1EO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFsQyxDQUFuQjtJQURZOzsyQkFLZCxZQUFBLEdBQWMsU0FBQyxFQUFEO2FBQ1osSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksYUFBWixFQUEyQixFQUEzQjtJQURZOzsyQkFJZCxPQUFBLEdBQVMsU0FBQTtNQUNQLElBQUMsQ0FBQSxhQUFhLENBQUMsT0FBZixDQUFBO01BQ0EsSUFBQyxDQUFBLGFBQUQsR0FBaUI7TUFDakIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsYUFBZDtNQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsT0FBVCxDQUFBO2FBQ0EsSUFBQyxDQUFBLE9BQUQsR0FBVztJQUxKOzs7OztBQS9CWCIsInNvdXJjZXNDb250ZW50IjpbIntFbWl0dGVyLCBDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5DdXJzb3JNb2RlbCAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuL2N1cnNvci1tb2RlbC5jb2ZmZWUnXG5SdWxlclZpZXcgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuL3J1bGVyLXZpZXcuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBSdWxlck1hbmFnZXJcbiAgc3Vic2NyaXB0aW9uczogbnVsbFxuICBlbWl0dGVyOiBudWxsXG5cbiAgY29uc3RydWN0b3I6IC0+XG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBlbWl0dGVyICAgICAgID0gbmV3IEVtaXR0ZXJcbiAgICBAbW9kZWxzICAgICAgICA9IFtdXG4gICAgQGluaXRpYWxpemUoKVxuICAgIEBoYW5kbGVFdmVudHMoKVxuXG4gIGluaXRpYWxpemU6IC0+XG4gICAgIyBMaW5rIEN1cnNvck1vZGVsIHdpdGggUnVsZXJWaWV3LlxuICAgIGF0b20udmlld3MuYWRkVmlld1Byb3ZpZGVyIEN1cnNvck1vZGVsLCAobW9kZWwpIC0+XG4gICAgICBuZXcgUnVsZXJWaWV3KCkuaW5pdGlhbGl6ZShtb2RlbClcblxuICAjIEV2ZXJ5IEN1cnNvciBpbiBldmVyeSBUZXh0RWRpdG9yIGdldHMgYSBtb2RlbCB0byBwcm94eSBldmVudHMgZm9yIHRoZSByZXNwZWN0aXZlIHZpZXcuXG4gIGhhbmRsZUV2ZW50czogLT5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVRleHRFZGl0b3JzIChlZGl0b3IpID0+XG4gICAgICBAc3Vic2NyaXB0aW9ucy5hZGQgZWRpdG9yLm9ic2VydmVDdXJzb3JzIChjdXJzb3IpID0+XG4gICAgICAgIG5ldyBDdXJzb3JNb2RlbCBALCBjdXJzb3JcblxuICBvbkRpZERlc3Ryb3k6IChmbikgLT5cbiAgICBAZW1pdHRlci5vbiAnZGlkLWRlc3Ryb3knLCBmblxuXG4gICMgQ2xlYW4gdXAuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgQHN1YnNjcmlwdGlvbnMgPSBudWxsXG4gICAgQGVtaXR0ZXIuZW1pdCAnZGlkLWRlc3Ryb3knXG4gICAgQGVtaXR0ZXIuZGlzcG9zZSgpXG4gICAgQGVtaXR0ZXIgPSBudWxsXG4iXX0=
