(function() {
  var OutlineRenderer, RegionRenderer,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  RegionRenderer = require('./region-renderer');

  module.exports = OutlineRenderer = (function(superClass) {
    extend(OutlineRenderer, superClass);

    function OutlineRenderer() {
      return OutlineRenderer.__super__.constructor.apply(this, arguments);
    }

    OutlineRenderer.prototype.render = function(colorMarker) {
      var color, i, len, range, region, regions, rowSpan;
      range = colorMarker.getScreenRange();
      color = colorMarker.color;
      if (range.isEmpty() || (color == null)) {
        return {};
      }
      rowSpan = range.end.row - range.start.row;
      regions = this.renderRegions(colorMarker);
      for (i = 0, len = regions.length; i < len; i++) {
        region = regions[i];
        if (region != null) {
          this.styleRegion(region, color.toCSS());
        }
      }
      return {
        regions: regions
      };
    };

    OutlineRenderer.prototype.styleRegion = function(region, color) {
      region.classList.add('outline');
      return region.style.borderColor = color;
    };

    return OutlineRenderer;

  })(RegionRenderer);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2FuZ29hLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi9yZW5kZXJlcnMvb3V0bGluZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLCtCQUFBO0lBQUE7OztFQUFBLGNBQUEsR0FBaUIsT0FBQSxDQUFRLG1CQUFSOztFQUVqQixNQUFNLENBQUMsT0FBUCxHQUNNOzs7Ozs7OzhCQUNKLE1BQUEsR0FBUSxTQUFDLFdBQUQ7QUFDTixVQUFBO01BQUEsS0FBQSxHQUFRLFdBQVcsQ0FBQyxjQUFaLENBQUE7TUFDUixLQUFBLEdBQVEsV0FBVyxDQUFDO01BQ3BCLElBQWEsS0FBSyxDQUFDLE9BQU4sQ0FBQSxDQUFBLElBQXVCLGVBQXBDO0FBQUEsZUFBTyxHQUFQOztNQUVBLE9BQUEsR0FBVSxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQVYsR0FBZ0IsS0FBSyxDQUFDLEtBQUssQ0FBQztNQUN0QyxPQUFBLEdBQVUsSUFBQyxDQUFBLGFBQUQsQ0FBZSxXQUFmO0FBRVYsV0FBQSx5Q0FBQTs7WUFBK0Q7VUFBL0QsSUFBQyxDQUFBLFdBQUQsQ0FBYSxNQUFiLEVBQXFCLEtBQUssQ0FBQyxLQUFOLENBQUEsQ0FBckI7O0FBQUE7YUFDQTtRQUFDLFNBQUEsT0FBRDs7SUFUTTs7OEJBV1IsV0FBQSxHQUFhLFNBQUMsTUFBRCxFQUFTLEtBQVQ7TUFDWCxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQWpCLENBQXFCLFNBQXJCO2FBQ0EsTUFBTSxDQUFDLEtBQUssQ0FBQyxXQUFiLEdBQTJCO0lBRmhCOzs7O0tBWmU7QUFIOUIiLCJzb3VyY2VzQ29udGVudCI6WyJSZWdpb25SZW5kZXJlciA9IHJlcXVpcmUgJy4vcmVnaW9uLXJlbmRlcmVyJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBPdXRsaW5lUmVuZGVyZXIgZXh0ZW5kcyBSZWdpb25SZW5kZXJlclxuICByZW5kZXI6IChjb2xvck1hcmtlcikgLT5cbiAgICByYW5nZSA9IGNvbG9yTWFya2VyLmdldFNjcmVlblJhbmdlKClcbiAgICBjb2xvciA9IGNvbG9yTWFya2VyLmNvbG9yXG4gICAgcmV0dXJuIHt9IGlmIHJhbmdlLmlzRW1wdHkoKSBvciBub3QgY29sb3I/XG5cbiAgICByb3dTcGFuID0gcmFuZ2UuZW5kLnJvdyAtIHJhbmdlLnN0YXJ0LnJvd1xuICAgIHJlZ2lvbnMgPSBAcmVuZGVyUmVnaW9ucyhjb2xvck1hcmtlcilcblxuICAgIEBzdHlsZVJlZ2lvbihyZWdpb24sIGNvbG9yLnRvQ1NTKCkpIGZvciByZWdpb24gaW4gcmVnaW9ucyB3aGVuIHJlZ2lvbj9cbiAgICB7cmVnaW9uc31cblxuICBzdHlsZVJlZ2lvbjogKHJlZ2lvbiwgY29sb3IpIC0+XG4gICAgcmVnaW9uLmNsYXNzTGlzdC5hZGQoJ291dGxpbmUnKVxuICAgIHJlZ2lvbi5zdHlsZS5ib3JkZXJDb2xvciA9IGNvbG9yXG4iXX0=
