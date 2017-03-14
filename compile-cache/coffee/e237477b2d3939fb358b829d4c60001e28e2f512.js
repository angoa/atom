(function() {
  var BackgroundRenderer, RegionRenderer,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  RegionRenderer = require('./region-renderer');

  module.exports = BackgroundRenderer = (function(superClass) {
    extend(BackgroundRenderer, superClass);

    function BackgroundRenderer() {
      return BackgroundRenderer.__super__.constructor.apply(this, arguments);
    }

    BackgroundRenderer.prototype.includeTextInRegion = true;

    BackgroundRenderer.prototype.render = function(colorMarker) {
      var color, colorText, i, l, len, region, regions;
      color = colorMarker != null ? colorMarker.color : void 0;
      if (color == null) {
        return {};
      }
      regions = this.renderRegions(colorMarker);
      l = color.luma;
      colorText = l > 0.43 ? 'black' : 'white';
      for (i = 0, len = regions.length; i < len; i++) {
        region = regions[i];
        if (region != null) {
          this.styleRegion(region, color.toCSS(), colorText);
        }
      }
      return {
        regions: regions
      };
    };

    BackgroundRenderer.prototype.styleRegion = function(region, color, textColor) {
      region.classList.add('background');
      region.style.backgroundColor = color;
      return region.style.color = textColor;
    };

    return BackgroundRenderer;

  })(RegionRenderer);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2FuZ29hLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi9yZW5kZXJlcnMvYmFja2dyb3VuZC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLGtDQUFBO0lBQUE7OztFQUFBLGNBQUEsR0FBaUIsT0FBQSxDQUFRLG1CQUFSOztFQUVqQixNQUFNLENBQUMsT0FBUCxHQUNNOzs7Ozs7O2lDQUNKLG1CQUFBLEdBQXFCOztpQ0FDckIsTUFBQSxHQUFRLFNBQUMsV0FBRDtBQUNOLFVBQUE7TUFBQSxLQUFBLHlCQUFRLFdBQVcsQ0FBRTtNQUVyQixJQUFpQixhQUFqQjtBQUFBLGVBQU8sR0FBUDs7TUFFQSxPQUFBLEdBQVUsSUFBQyxDQUFBLGFBQUQsQ0FBZSxXQUFmO01BRVYsQ0FBQSxHQUFJLEtBQUssQ0FBQztNQUVWLFNBQUEsR0FBZSxDQUFBLEdBQUksSUFBUCxHQUFpQixPQUFqQixHQUE4QjtBQUMxQyxXQUFBLHlDQUFBOztZQUEwRTtVQUExRSxJQUFDLENBQUEsV0FBRCxDQUFhLE1BQWIsRUFBcUIsS0FBSyxDQUFDLEtBQU4sQ0FBQSxDQUFyQixFQUFvQyxTQUFwQzs7QUFBQTthQUNBO1FBQUMsU0FBQSxPQUFEOztJQVhNOztpQ0FhUixXQUFBLEdBQWEsU0FBQyxNQUFELEVBQVMsS0FBVCxFQUFnQixTQUFoQjtNQUNYLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBakIsQ0FBcUIsWUFBckI7TUFFQSxNQUFNLENBQUMsS0FBSyxDQUFDLGVBQWIsR0FBK0I7YUFDL0IsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFiLEdBQXFCO0lBSlY7Ozs7S0Fma0I7QUFIakMiLCJzb3VyY2VzQ29udGVudCI6WyJSZWdpb25SZW5kZXJlciA9IHJlcXVpcmUgJy4vcmVnaW9uLXJlbmRlcmVyJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBCYWNrZ3JvdW5kUmVuZGVyZXIgZXh0ZW5kcyBSZWdpb25SZW5kZXJlclxuICBpbmNsdWRlVGV4dEluUmVnaW9uOiB0cnVlXG4gIHJlbmRlcjogKGNvbG9yTWFya2VyKSAtPlxuICAgIGNvbG9yID0gY29sb3JNYXJrZXI/LmNvbG9yXG5cbiAgICByZXR1cm4ge30gdW5sZXNzIGNvbG9yP1xuXG4gICAgcmVnaW9ucyA9IEByZW5kZXJSZWdpb25zKGNvbG9yTWFya2VyKVxuXG4gICAgbCA9IGNvbG9yLmx1bWFcblxuICAgIGNvbG9yVGV4dCA9IGlmIGwgPiAwLjQzIHRoZW4gJ2JsYWNrJyBlbHNlICd3aGl0ZSdcbiAgICBAc3R5bGVSZWdpb24ocmVnaW9uLCBjb2xvci50b0NTUygpLCBjb2xvclRleHQpIGZvciByZWdpb24gaW4gcmVnaW9ucyB3aGVuIHJlZ2lvbj9cbiAgICB7cmVnaW9uc31cblxuICBzdHlsZVJlZ2lvbjogKHJlZ2lvbiwgY29sb3IsIHRleHRDb2xvcikgLT5cbiAgICByZWdpb24uY2xhc3NMaXN0LmFkZCgnYmFja2dyb3VuZCcpXG5cbiAgICByZWdpb24uc3R5bGUuYmFja2dyb3VuZENvbG9yID0gY29sb3JcbiAgICByZWdpb24uc3R5bGUuY29sb3IgPSB0ZXh0Q29sb3JcbiJdfQ==
