(function() {
  var RegionRenderer, UnderlineRenderer,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  RegionRenderer = require('./region-renderer');

  module.exports = UnderlineRenderer = (function(superClass) {
    extend(UnderlineRenderer, superClass);

    function UnderlineRenderer() {
      return UnderlineRenderer.__super__.constructor.apply(this, arguments);
    }

    UnderlineRenderer.prototype.render = function(colorMarker) {
      var color, i, len, region, regions;
      color = colorMarker != null ? colorMarker.color : void 0;
      if (color == null) {
        return {};
      }
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

    UnderlineRenderer.prototype.styleRegion = function(region, color) {
      region.classList.add('underline');
      return region.style.backgroundColor = color;
    };

    return UnderlineRenderer;

  })(RegionRenderer);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2FuZ29hLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi9yZW5kZXJlcnMvdW5kZXJsaW5lLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsaUNBQUE7SUFBQTs7O0VBQUEsY0FBQSxHQUFpQixPQUFBLENBQVEsbUJBQVI7O0VBRWpCLE1BQU0sQ0FBQyxPQUFQLEdBQ007Ozs7Ozs7Z0NBQ0osTUFBQSxHQUFRLFNBQUMsV0FBRDtBQUNOLFVBQUE7TUFBQSxLQUFBLHlCQUFRLFdBQVcsQ0FBRTtNQUNyQixJQUFpQixhQUFqQjtBQUFBLGVBQU8sR0FBUDs7TUFFQSxPQUFBLEdBQVUsSUFBQyxDQUFBLGFBQUQsQ0FBZSxXQUFmO0FBRVYsV0FBQSx5Q0FBQTs7WUFBK0Q7VUFBL0QsSUFBQyxDQUFBLFdBQUQsQ0FBYSxNQUFiLEVBQXFCLEtBQUssQ0FBQyxLQUFOLENBQUEsQ0FBckI7O0FBQUE7YUFDQTtRQUFDLFNBQUEsT0FBRDs7SUFQTTs7Z0NBU1IsV0FBQSxHQUFhLFNBQUMsTUFBRCxFQUFTLEtBQVQ7TUFDWCxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQWpCLENBQXFCLFdBQXJCO2FBRUEsTUFBTSxDQUFDLEtBQUssQ0FBQyxlQUFiLEdBQStCO0lBSHBCOzs7O0tBVmlCO0FBSGhDIiwic291cmNlc0NvbnRlbnQiOlsiUmVnaW9uUmVuZGVyZXIgPSByZXF1aXJlICcuL3JlZ2lvbi1yZW5kZXJlcidcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgVW5kZXJsaW5lUmVuZGVyZXIgZXh0ZW5kcyBSZWdpb25SZW5kZXJlclxuICByZW5kZXI6IChjb2xvck1hcmtlcikgLT5cbiAgICBjb2xvciA9IGNvbG9yTWFya2VyPy5jb2xvclxuICAgIHJldHVybiB7fSB1bmxlc3MgY29sb3I/XG5cbiAgICByZWdpb25zID0gQHJlbmRlclJlZ2lvbnMoY29sb3JNYXJrZXIpXG5cbiAgICBAc3R5bGVSZWdpb24ocmVnaW9uLCBjb2xvci50b0NTUygpKSBmb3IgcmVnaW9uIGluIHJlZ2lvbnMgd2hlbiByZWdpb24/XG4gICAge3JlZ2lvbnN9XG5cbiAgc3R5bGVSZWdpb246IChyZWdpb24sIGNvbG9yKSAtPlxuICAgIHJlZ2lvbi5jbGFzc0xpc3QuYWRkKCd1bmRlcmxpbmUnKVxuXG4gICAgcmVnaW9uLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IGNvbG9yXG4iXX0=
