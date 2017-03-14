(function() {
  var DotRenderer, SquareDotRenderer,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  DotRenderer = require('./dot');

  module.exports = SquareDotRenderer = (function(superClass) {
    extend(SquareDotRenderer, superClass);

    function SquareDotRenderer() {
      return SquareDotRenderer.__super__.constructor.apply(this, arguments);
    }

    SquareDotRenderer.prototype.render = function(colorMarker) {
      var properties;
      properties = SquareDotRenderer.__super__.render.apply(this, arguments);
      properties["class"] += ' square';
      return properties;
    };

    return SquareDotRenderer;

  })(DotRenderer);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2FuZ29hLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi9yZW5kZXJlcnMvc3F1YXJlLWRvdC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDhCQUFBO0lBQUE7OztFQUFBLFdBQUEsR0FBYyxPQUFBLENBQVEsT0FBUjs7RUFFZCxNQUFNLENBQUMsT0FBUCxHQUNNOzs7Ozs7O2dDQUNKLE1BQUEsR0FBUSxTQUFDLFdBQUQ7QUFDTixVQUFBO01BQUEsVUFBQSxHQUFhLCtDQUFBLFNBQUE7TUFDYixVQUFVLEVBQUMsS0FBRCxFQUFWLElBQW9CO2FBQ3BCO0lBSE07Ozs7S0FEc0I7QUFIaEMiLCJzb3VyY2VzQ29udGVudCI6WyJEb3RSZW5kZXJlciA9IHJlcXVpcmUgJy4vZG90J1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBTcXVhcmVEb3RSZW5kZXJlciBleHRlbmRzIERvdFJlbmRlcmVyXG4gIHJlbmRlcjogKGNvbG9yTWFya2VyKSAtPlxuICAgIHByb3BlcnRpZXMgPSBzdXBlclxuICAgIHByb3BlcnRpZXMuY2xhc3MgKz0gJyBzcXVhcmUnXG4gICAgcHJvcGVydGllc1xuIl19
