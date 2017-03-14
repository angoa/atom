(function() {
  var Palette;

  module.exports = Palette = (function() {
    Palette.deserialize = function(state) {
      return new Palette(state.variables);
    };

    function Palette(variables) {
      this.variables = variables != null ? variables : [];
    }

    Palette.prototype.getTitle = function() {
      return 'Palette';
    };

    Palette.prototype.getURI = function() {
      return 'pigments://palette';
    };

    Palette.prototype.getIconName = function() {
      return "pigments";
    };

    Palette.prototype.sortedByColor = function() {
      return this.variables.slice().sort((function(_this) {
        return function(arg, arg1) {
          var a, b;
          a = arg.color;
          b = arg1.color;
          return _this.compareColors(a, b);
        };
      })(this));
    };

    Palette.prototype.sortedByName = function() {
      var collator;
      collator = new Intl.Collator("en-US", {
        numeric: true
      });
      return this.variables.slice().sort(function(arg, arg1) {
        var a, b;
        a = arg.name;
        b = arg1.name;
        return collator.compare(a, b);
      });
    };

    Palette.prototype.getColorsNames = function() {
      return this.variables.map(function(v) {
        return v.name;
      });
    };

    Palette.prototype.getColorsCount = function() {
      return this.variables.length;
    };

    Palette.prototype.eachColor = function(iterator) {
      var i, len, ref, results, v;
      ref = this.variables;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        v = ref[i];
        results.push(iterator(v));
      }
      return results;
    };

    Palette.prototype.compareColors = function(a, b) {
      var aHue, aLightness, aSaturation, bHue, bLightness, bSaturation, ref, ref1;
      ref = a.hsl, aHue = ref[0], aSaturation = ref[1], aLightness = ref[2];
      ref1 = b.hsl, bHue = ref1[0], bSaturation = ref1[1], bLightness = ref1[2];
      if (aHue < bHue) {
        return -1;
      } else if (aHue > bHue) {
        return 1;
      } else if (aSaturation < bSaturation) {
        return -1;
      } else if (aSaturation > bSaturation) {
        return 1;
      } else if (aLightness < bLightness) {
        return -1;
      } else if (aLightness > bLightness) {
        return 1;
      } else {
        return 0;
      }
    };

    Palette.prototype.serialize = function() {
      return {
        deserializer: 'Palette',
        variables: this.variables
      };
    };

    return Palette;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2FuZ29hLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi9wYWxldHRlLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQTtBQUFBLE1BQUE7O0VBQUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtJQUNKLE9BQUMsQ0FBQSxXQUFELEdBQWMsU0FBQyxLQUFEO2FBQWUsSUFBQSxPQUFBLENBQVEsS0FBSyxDQUFDLFNBQWQ7SUFBZjs7SUFFRCxpQkFBQyxTQUFEO01BQUMsSUFBQyxDQUFBLGdDQUFELFlBQVc7SUFBWjs7c0JBRWIsUUFBQSxHQUFVLFNBQUE7YUFBRztJQUFIOztzQkFFVixNQUFBLEdBQVEsU0FBQTthQUFHO0lBQUg7O3NCQUVSLFdBQUEsR0FBYSxTQUFBO2FBQUc7SUFBSDs7c0JBRWIsYUFBQSxHQUFlLFNBQUE7YUFDYixJQUFDLENBQUEsU0FBUyxDQUFDLEtBQVgsQ0FBQSxDQUFrQixDQUFDLElBQW5CLENBQXdCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxHQUFELEVBQVksSUFBWjtBQUEwQixjQUFBO1VBQWxCLElBQVAsSUFBQztVQUFpQixJQUFQLEtBQUM7aUJBQWEsS0FBQyxDQUFBLGFBQUQsQ0FBZSxDQUFmLEVBQWlCLENBQWpCO1FBQTFCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF4QjtJQURhOztzQkFHZixZQUFBLEdBQWMsU0FBQTtBQUNaLFVBQUE7TUFBQSxRQUFBLEdBQWUsSUFBQSxJQUFJLENBQUMsUUFBTCxDQUFjLE9BQWQsRUFBdUI7UUFBQSxPQUFBLEVBQVMsSUFBVDtPQUF2QjthQUNmLElBQUMsQ0FBQSxTQUFTLENBQUMsS0FBWCxDQUFBLENBQWtCLENBQUMsSUFBbkIsQ0FBd0IsU0FBQyxHQUFELEVBQVcsSUFBWDtBQUF3QixZQUFBO1FBQWpCLElBQU4sSUFBQztRQUFlLElBQU4sS0FBQztlQUFZLFFBQVEsQ0FBQyxPQUFULENBQWlCLENBQWpCLEVBQW1CLENBQW5CO01BQXhCLENBQXhCO0lBRlk7O3NCQUlkLGNBQUEsR0FBZ0IsU0FBQTthQUFHLElBQUMsQ0FBQSxTQUFTLENBQUMsR0FBWCxDQUFlLFNBQUMsQ0FBRDtlQUFPLENBQUMsQ0FBQztNQUFULENBQWY7SUFBSDs7c0JBRWhCLGNBQUEsR0FBZ0IsU0FBQTthQUFHLElBQUMsQ0FBQSxTQUFTLENBQUM7SUFBZDs7c0JBRWhCLFNBQUEsR0FBVyxTQUFDLFFBQUQ7QUFBYyxVQUFBO0FBQUE7QUFBQTtXQUFBLHFDQUFBOztxQkFBQSxRQUFBLENBQVMsQ0FBVDtBQUFBOztJQUFkOztzQkFFWCxhQUFBLEdBQWUsU0FBQyxDQUFELEVBQUcsQ0FBSDtBQUNiLFVBQUE7TUFBQSxNQUFrQyxDQUFDLENBQUMsR0FBcEMsRUFBQyxhQUFELEVBQU8sb0JBQVAsRUFBb0I7TUFDcEIsT0FBa0MsQ0FBQyxDQUFDLEdBQXBDLEVBQUMsY0FBRCxFQUFPLHFCQUFQLEVBQW9CO01BQ3BCLElBQUcsSUFBQSxHQUFPLElBQVY7ZUFDRSxDQUFDLEVBREg7T0FBQSxNQUVLLElBQUcsSUFBQSxHQUFPLElBQVY7ZUFDSCxFQURHO09BQUEsTUFFQSxJQUFHLFdBQUEsR0FBYyxXQUFqQjtlQUNILENBQUMsRUFERTtPQUFBLE1BRUEsSUFBRyxXQUFBLEdBQWMsV0FBakI7ZUFDSCxFQURHO09BQUEsTUFFQSxJQUFHLFVBQUEsR0FBYSxVQUFoQjtlQUNILENBQUMsRUFERTtPQUFBLE1BRUEsSUFBRyxVQUFBLEdBQWEsVUFBaEI7ZUFDSCxFQURHO09BQUEsTUFBQTtlQUdILEVBSEc7O0lBYlE7O3NCQWtCZixTQUFBLEdBQVcsU0FBQTthQUNUO1FBQ0UsWUFBQSxFQUFjLFNBRGhCO1FBRUcsV0FBRCxJQUFDLENBQUEsU0FGSDs7SUFEUzs7Ozs7QUEzQ2IiLCJzb3VyY2VzQ29udGVudCI6WyJcbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFBhbGV0dGVcbiAgQGRlc2VyaWFsaXplOiAoc3RhdGUpIC0+IG5ldyBQYWxldHRlKHN0YXRlLnZhcmlhYmxlcylcblxuICBjb25zdHJ1Y3RvcjogKEB2YXJpYWJsZXM9W10pIC0+XG5cbiAgZ2V0VGl0bGU6IC0+ICdQYWxldHRlJ1xuXG4gIGdldFVSSTogLT4gJ3BpZ21lbnRzOi8vcGFsZXR0ZSdcblxuICBnZXRJY29uTmFtZTogLT4gXCJwaWdtZW50c1wiXG5cbiAgc29ydGVkQnlDb2xvcjogLT5cbiAgICBAdmFyaWFibGVzLnNsaWNlKCkuc29ydCAoe2NvbG9yOmF9LCB7Y29sb3I6Yn0pID0+IEBjb21wYXJlQ29sb3JzKGEsYilcblxuICBzb3J0ZWRCeU5hbWU6IC0+XG4gICAgY29sbGF0b3IgPSBuZXcgSW50bC5Db2xsYXRvcihcImVuLVVTXCIsIG51bWVyaWM6IHRydWUpXG4gICAgQHZhcmlhYmxlcy5zbGljZSgpLnNvcnQgKHtuYW1lOmF9LCB7bmFtZTpifSkgLT4gY29sbGF0b3IuY29tcGFyZShhLGIpXG5cbiAgZ2V0Q29sb3JzTmFtZXM6IC0+IEB2YXJpYWJsZXMubWFwICh2KSAtPiB2Lm5hbWVcblxuICBnZXRDb2xvcnNDb3VudDogLT4gQHZhcmlhYmxlcy5sZW5ndGhcblxuICBlYWNoQ29sb3I6IChpdGVyYXRvcikgLT4gaXRlcmF0b3IodikgZm9yIHYgaW4gQHZhcmlhYmxlc1xuXG4gIGNvbXBhcmVDb2xvcnM6IChhLGIpIC0+XG4gICAgW2FIdWUsIGFTYXR1cmF0aW9uLCBhTGlnaHRuZXNzXSA9IGEuaHNsXG4gICAgW2JIdWUsIGJTYXR1cmF0aW9uLCBiTGlnaHRuZXNzXSA9IGIuaHNsXG4gICAgaWYgYUh1ZSA8IGJIdWVcbiAgICAgIC0xXG4gICAgZWxzZSBpZiBhSHVlID4gYkh1ZVxuICAgICAgMVxuICAgIGVsc2UgaWYgYVNhdHVyYXRpb24gPCBiU2F0dXJhdGlvblxuICAgICAgLTFcbiAgICBlbHNlIGlmIGFTYXR1cmF0aW9uID4gYlNhdHVyYXRpb25cbiAgICAgIDFcbiAgICBlbHNlIGlmIGFMaWdodG5lc3MgPCBiTGlnaHRuZXNzXG4gICAgICAtMVxuICAgIGVsc2UgaWYgYUxpZ2h0bmVzcyA+IGJMaWdodG5lc3NcbiAgICAgIDFcbiAgICBlbHNlXG4gICAgICAwXG5cbiAgc2VyaWFsaXplOiAtPlxuICAgIHtcbiAgICAgIGRlc2VyaWFsaXplcjogJ1BhbGV0dGUnXG4gICAgICBAdmFyaWFibGVzXG4gICAgfVxuIl19
