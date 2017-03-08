(function() {
  var CompositeDisposable, RulerManager;

  CompositeDisposable = require('atom').CompositeDisposable;

  RulerManager = require('./ruler-manager.coffee');

  module.exports = {
    activate: function() {
      return this.rulerzManager = new RulerManager();
    },
    deactivate: function() {
      var ref;
      if ((ref = this.rulerzManager) != null) {
        ref.destroy();
      }
      return this.rulerzManager = null;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2FuZ29hLy5hdG9tL3BhY2thZ2VzL3J1bGVyei9saWIvbWFpbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUjs7RUFDeEIsWUFBQSxHQUFlLE9BQUEsQ0FBUSx3QkFBUjs7RUFFZixNQUFNLENBQUMsT0FBUCxHQUVFO0lBQUEsUUFBQSxFQUFVLFNBQUE7YUFDUixJQUFDLENBQUEsYUFBRCxHQUFxQixJQUFBLFlBQUEsQ0FBQTtJQURiLENBQVY7SUFHQSxVQUFBLEVBQVksU0FBQTtBQUNWLFVBQUE7O1dBQWMsQ0FBRSxPQUFoQixDQUFBOzthQUNBLElBQUMsQ0FBQSxhQUFELEdBQWlCO0lBRlAsQ0FIWjs7QUFMRiIsInNvdXJjZXNDb250ZW50IjpbIntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5SdWxlck1hbmFnZXIgPSByZXF1aXJlICcuL3J1bGVyLW1hbmFnZXIuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5cbiAgYWN0aXZhdGU6IC0+XG4gICAgQHJ1bGVyek1hbmFnZXIgPSBuZXcgUnVsZXJNYW5hZ2VyKClcblxuICBkZWFjdGl2YXRlOiAtPlxuICAgIEBydWxlcnpNYW5hZ2VyPy5kZXN0cm95KClcbiAgICBAcnVsZXJ6TWFuYWdlciA9IG51bGxcbiJdfQ==
