(function() {
  var ColorMarker, CompositeDisposable, fill, ref;

  ref = [], CompositeDisposable = ref[0], fill = ref[1];

  module.exports = ColorMarker = (function() {
    function ColorMarker(arg) {
      this.marker = arg.marker, this.color = arg.color, this.text = arg.text, this.invalid = arg.invalid, this.colorBuffer = arg.colorBuffer;
      if (CompositeDisposable == null) {
        CompositeDisposable = require('atom').CompositeDisposable;
      }
      this.id = this.marker.id;
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(this.marker.onDidDestroy((function(_this) {
        return function() {
          return _this.markerWasDestroyed();
        };
      })(this)));
      this.subscriptions.add(this.marker.onDidChange((function(_this) {
        return function() {
          if (_this.marker.isValid()) {
            _this.invalidateScreenRangeCache();
            return _this.checkMarkerScope();
          } else {
            return _this.destroy();
          }
        };
      })(this)));
      this.checkMarkerScope();
    }

    ColorMarker.prototype.destroy = function() {
      if (this.destroyed) {
        return;
      }
      return this.marker.destroy();
    };

    ColorMarker.prototype.markerWasDestroyed = function() {
      var ref1;
      if (this.destroyed) {
        return;
      }
      this.subscriptions.dispose();
      ref1 = {}, this.marker = ref1.marker, this.color = ref1.color, this.text = ref1.text, this.colorBuffer = ref1.colorBuffer;
      return this.destroyed = true;
    };

    ColorMarker.prototype.match = function(properties) {
      var bool;
      if (this.destroyed) {
        return false;
      }
      bool = true;
      if (properties.bufferRange != null) {
        bool && (bool = this.marker.getBufferRange().isEqual(properties.bufferRange));
      }
      if (properties.color != null) {
        bool && (bool = properties.color.isEqual(this.color));
      }
      if (properties.match != null) {
        bool && (bool = properties.match === this.text);
      }
      if (properties.text != null) {
        bool && (bool = properties.text === this.text);
      }
      return bool;
    };

    ColorMarker.prototype.serialize = function() {
      var out;
      if (this.destroyed) {
        return;
      }
      out = {
        markerId: String(this.marker.id),
        bufferRange: this.marker.getBufferRange().serialize(),
        color: this.color.serialize(),
        text: this.text,
        variables: this.color.variables
      };
      if (!this.color.isValid()) {
        out.invalid = true;
      }
      return out;
    };

    ColorMarker.prototype.checkMarkerScope = function(forceEvaluation) {
      var e, range, ref1, scope, scopeChain;
      if (forceEvaluation == null) {
        forceEvaluation = false;
      }
      if (this.destroyed || (this.colorBuffer == null)) {
        return;
      }
      range = this.marker.getBufferRange();
      try {
        scope = this.colorBuffer.editor.scopeDescriptorForBufferPosition != null ? this.colorBuffer.editor.scopeDescriptorForBufferPosition(range.start) : this.colorBuffer.editor.displayBuffer.scopeDescriptorForBufferPosition(range.start);
        scopeChain = scope.getScopeChain();
        if (!scopeChain || (!forceEvaluation && scopeChain === this.lastScopeChain)) {
          return;
        }
        this.ignored = ((ref1 = this.colorBuffer.ignoredScopes) != null ? ref1 : []).some(function(scopeRegExp) {
          return scopeChain.match(scopeRegExp);
        });
        return this.lastScopeChain = scopeChain;
      } catch (error) {
        e = error;
        return console.error(e);
      }
    };

    ColorMarker.prototype.isIgnored = function() {
      return this.ignored;
    };

    ColorMarker.prototype.getBufferRange = function() {
      return this.marker.getBufferRange();
    };

    ColorMarker.prototype.getScreenRange = function() {
      var ref1;
      return this.screenRangeCache != null ? this.screenRangeCache : this.screenRangeCache = (ref1 = this.marker) != null ? ref1.getScreenRange() : void 0;
    };

    ColorMarker.prototype.invalidateScreenRangeCache = function() {
      return this.screenRangeCache = null;
    };

    ColorMarker.prototype.convertContentToHex = function() {
      return this.convertContentInPlace('hex');
    };

    ColorMarker.prototype.convertContentToRGB = function() {
      return this.convertContentInPlace('rgb');
    };

    ColorMarker.prototype.convertContentToRGBA = function() {
      return this.convertContentInPlace('rgba');
    };

    ColorMarker.prototype.convertContentToHSL = function() {
      return this.convertContentInPlace('hsl');
    };

    ColorMarker.prototype.convertContentToHSLA = function() {
      return this.convertContentInPlace('hsla');
    };

    ColorMarker.prototype.copyContentAsHex = function() {
      return atom.clipboard.write(this.convertContent('hex'));
    };

    ColorMarker.prototype.copyContentAsRGB = function() {
      return atom.clipboard.write(this.convertContent('rgb'));
    };

    ColorMarker.prototype.copyContentAsRGBA = function() {
      return atom.clipboard.write(this.convertContent('rgba'));
    };

    ColorMarker.prototype.copyContentAsHSL = function() {
      return atom.clipboard.write(this.convertContent('hsl'));
    };

    ColorMarker.prototype.copyContentAsHSLA = function() {
      return atom.clipboard.write(this.convertContent('hsla'));
    };

    ColorMarker.prototype.convertContentInPlace = function(mode) {
      return this.colorBuffer.editor.getBuffer().setTextInRange(this.marker.getBufferRange(), this.convertContent(mode));
    };

    ColorMarker.prototype.convertContent = function(mode) {
      if (fill == null) {
        fill = require('./utils').fill;
      }
      switch (mode) {
        case 'hex':
          return '#' + fill(this.color.hex, 6);
        case 'rgb':
          return "rgb(" + (Math.round(this.color.red)) + ", " + (Math.round(this.color.green)) + ", " + (Math.round(this.color.blue)) + ")";
        case 'rgba':
          return "rgba(" + (Math.round(this.color.red)) + ", " + (Math.round(this.color.green)) + ", " + (Math.round(this.color.blue)) + ", " + this.color.alpha + ")";
        case 'hsl':
          return "hsl(" + (Math.round(this.color.hue)) + ", " + (Math.round(this.color.saturation)) + "%, " + (Math.round(this.color.lightness)) + "%)";
        case 'hsla':
          return "hsla(" + (Math.round(this.color.hue)) + ", " + (Math.round(this.color.saturation)) + "%, " + (Math.round(this.color.lightness)) + "%, " + this.color.alpha + ")";
      }
    };

    return ColorMarker;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2FuZ29hLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi9jb2xvci1tYXJrZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxNQUE4QixFQUE5QixFQUFDLDRCQUFELEVBQXNCOztFQUV0QixNQUFNLENBQUMsT0FBUCxHQUNNO0lBQ1MscUJBQUMsR0FBRDtNQUFFLElBQUMsQ0FBQSxhQUFBLFFBQVEsSUFBQyxDQUFBLFlBQUEsT0FBTyxJQUFDLENBQUEsV0FBQSxNQUFNLElBQUMsQ0FBQSxjQUFBLFNBQVMsSUFBQyxDQUFBLGtCQUFBO01BQ2hELElBQThDLDJCQUE5QztRQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUixzQkFBeEI7O01BRUEsSUFBQyxDQUFBLEVBQUQsR0FBTSxJQUFDLENBQUEsTUFBTSxDQUFDO01BQ2QsSUFBQyxDQUFBLGFBQUQsR0FBaUIsSUFBSTtNQUNyQixJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUFSLENBQXFCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFBRyxLQUFDLENBQUEsa0JBQUQsQ0FBQTtRQUFIO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFyQixDQUFuQjtNQUNBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsTUFBTSxDQUFDLFdBQVIsQ0FBb0IsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ3JDLElBQUcsS0FBQyxDQUFBLE1BQU0sQ0FBQyxPQUFSLENBQUEsQ0FBSDtZQUNFLEtBQUMsQ0FBQSwwQkFBRCxDQUFBO21CQUNBLEtBQUMsQ0FBQSxnQkFBRCxDQUFBLEVBRkY7V0FBQSxNQUFBO21CQUlFLEtBQUMsQ0FBQSxPQUFELENBQUEsRUFKRjs7UUFEcUM7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXBCLENB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b3NhYmxlLCBmaWxsXSA9IFtdXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIENvbG9yTWFya2VyXG4gIGNvbnN0cnVjdG9yOiAoe0BtYXJrZXIsIEBjb2xvciwgQHRleHQsIEBpbnZhbGlkLCBAY29sb3JCdWZmZXJ9KSAtPlxuICAgIHtDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nIHVubGVzcyBDb21wb3NpdGVEaXNwb3NhYmxlP1xuXG4gICAgQGlkID0gQG1hcmtlci5pZFxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQG1hcmtlci5vbkRpZERlc3Ryb3kgPT4gQG1hcmtlcldhc0Rlc3Ryb3llZCgpXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBtYXJrZXIub25EaWRDaGFuZ2UgPT5cbiAgICAgIGlmIEBtYXJrZXIuaXNWYWxpZCgpXG4gICAgICAgIEBpbnZhbGlkYXRlU2NyZWVuUmFuZ2VDYWNoZSgpXG4gICAgICAgIEBjaGVja01hcmtlclNjb3BlKClcbiAgICAgIGVsc2VcbiAgICAgICAgQGRlc3Ryb3koKVxuXG4gICAgQGNoZWNrTWFya2VyU2NvcGUoKVxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgcmV0dXJuIGlmIEBkZXN0cm95ZWRcbiAgICBAbWFya2VyLmRlc3Ryb3koKVxuXG4gIG1hcmtlcldhc0Rlc3Ryb3llZDogLT5cbiAgICByZXR1cm4gaWYgQGRlc3Ryb3llZFxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIHtAbWFya2VyLCBAY29sb3IsIEB0ZXh0LCBAY29sb3JCdWZmZXJ9ID0ge31cbiAgICBAZGVzdHJveWVkID0gdHJ1ZVxuXG4gIG1hdGNoOiAocHJvcGVydGllcykgLT5cbiAgICByZXR1cm4gZmFsc2UgaWYgQGRlc3Ryb3llZFxuXG4gICAgYm9vbCA9IHRydWVcblxuICAgIGlmIHByb3BlcnRpZXMuYnVmZmVyUmFuZ2U/XG4gICAgICBib29sICYmPSBAbWFya2VyLmdldEJ1ZmZlclJhbmdlKCkuaXNFcXVhbChwcm9wZXJ0aWVzLmJ1ZmZlclJhbmdlKVxuICAgIGJvb2wgJiY9IHByb3BlcnRpZXMuY29sb3IuaXNFcXVhbChAY29sb3IpIGlmIHByb3BlcnRpZXMuY29sb3I/XG4gICAgYm9vbCAmJj0gcHJvcGVydGllcy5tYXRjaCBpcyBAdGV4dCBpZiBwcm9wZXJ0aWVzLm1hdGNoP1xuICAgIGJvb2wgJiY9IHByb3BlcnRpZXMudGV4dCBpcyBAdGV4dCBpZiBwcm9wZXJ0aWVzLnRleHQ/XG5cbiAgICBib29sXG5cbiAgc2VyaWFsaXplOiAtPlxuICAgIHJldHVybiBpZiBAZGVzdHJveWVkXG4gICAgb3V0ID0ge1xuICAgICAgbWFya2VySWQ6IFN0cmluZyhAbWFya2VyLmlkKVxuICAgICAgYnVmZmVyUmFuZ2U6IEBtYXJrZXIuZ2V0QnVmZmVyUmFuZ2UoKS5zZXJpYWxpemUoKVxuICAgICAgY29sb3I6IEBjb2xvci5zZXJpYWxpemUoKVxuICAgICAgdGV4dDogQHRleHRcbiAgICAgIHZhcmlhYmxlczogQGNvbG9yLnZhcmlhYmxlc1xuICAgIH1cbiAgICBvdXQuaW52YWxpZCA9IHRydWUgdW5sZXNzIEBjb2xvci5pc1ZhbGlkKClcbiAgICBvdXRcblxuICBjaGVja01hcmtlclNjb3BlOiAoZm9yY2VFdmFsdWF0aW9uPWZhbHNlKSAtPlxuICAgIHJldHVybiBpZiBAZGVzdHJveWVkIG9yICFAY29sb3JCdWZmZXI/XG4gICAgcmFuZ2UgPSBAbWFya2VyLmdldEJ1ZmZlclJhbmdlKClcblxuICAgIHRyeVxuICAgICAgc2NvcGUgPSBpZiBAY29sb3JCdWZmZXIuZWRpdG9yLnNjb3BlRGVzY3JpcHRvckZvckJ1ZmZlclBvc2l0aW9uP1xuICAgICAgICBAY29sb3JCdWZmZXIuZWRpdG9yLnNjb3BlRGVzY3JpcHRvckZvckJ1ZmZlclBvc2l0aW9uKHJhbmdlLnN0YXJ0KVxuICAgICAgZWxzZVxuICAgICAgICBAY29sb3JCdWZmZXIuZWRpdG9yLmRpc3BsYXlCdWZmZXIuc2NvcGVEZXNjcmlwdG9yRm9yQnVmZmVyUG9zaXRpb24ocmFuZ2Uuc3RhcnQpXG4gICAgICBzY29wZUNoYWluID0gc2NvcGUuZ2V0U2NvcGVDaGFpbigpXG5cbiAgICAgIHJldHVybiBpZiBub3Qgc2NvcGVDaGFpbiBvciAoIWZvcmNlRXZhbHVhdGlvbiBhbmQgc2NvcGVDaGFpbiBpcyBAbGFzdFNjb3BlQ2hhaW4pXG5cbiAgICAgIEBpZ25vcmVkID0gKEBjb2xvckJ1ZmZlci5pZ25vcmVkU2NvcGVzID8gW10pLnNvbWUgKHNjb3BlUmVnRXhwKSAtPlxuICAgICAgICBzY29wZUNoYWluLm1hdGNoKHNjb3BlUmVnRXhwKVxuXG4gICAgICBAbGFzdFNjb3BlQ2hhaW4gPSBzY29wZUNoYWluXG4gICAgY2F0Y2ggZVxuICAgICAgY29uc29sZS5lcnJvciBlXG5cbiAgaXNJZ25vcmVkOiAtPiBAaWdub3JlZFxuXG4gIGdldEJ1ZmZlclJhbmdlOiAtPiBAbWFya2VyLmdldEJ1ZmZlclJhbmdlKClcblxuICBnZXRTY3JlZW5SYW5nZTogLT4gQHNjcmVlblJhbmdlQ2FjaGUgPz0gQG1hcmtlcj8uZ2V0U2NyZWVuUmFuZ2UoKVxuXG4gIGludmFsaWRhdGVTY3JlZW5SYW5nZUNhY2hlOiAtPiBAc2NyZWVuUmFuZ2VDYWNoZSA9IG51bGxcblxuICBjb252ZXJ0Q29udGVudFRvSGV4OiAtPiBAY29udmVydENvbnRlbnRJblBsYWNlKCdoZXgnKVxuXG4gIGNvbnZlcnRDb250ZW50VG9SR0I6IC0+IEBjb252ZXJ0Q29udGVudEluUGxhY2UoJ3JnYicpXG5cbiAgY29udmVydENvbnRlbnRUb1JHQkE6IC0+IEBjb252ZXJ0Q29udGVudEluUGxhY2UoJ3JnYmEnKVxuXG4gIGNvbnZlcnRDb250ZW50VG9IU0w6IC0+IEBjb252ZXJ0Q29udGVudEluUGxhY2UoJ2hzbCcpXG5cbiAgY29udmVydENvbnRlbnRUb0hTTEE6IC0+IEBjb252ZXJ0Q29udGVudEluUGxhY2UoJ2hzbGEnKVxuXG4gIGNvcHlDb250ZW50QXNIZXg6IC0+IGF0b20uY2xpcGJvYXJkLndyaXRlKEBjb252ZXJ0Q29udGVudCgnaGV4JykpXG5cbiAgY29weUNvbnRlbnRBc1JHQjogLT4gYXRvbS5jbGlwYm9hcmQud3JpdGUoQGNvbnZlcnRDb250ZW50KCdyZ2InKSlcblxuICBjb3B5Q29udGVudEFzUkdCQTogLT4gYXRvbS5jbGlwYm9hcmQud3JpdGUoQGNvbnZlcnRDb250ZW50KCdyZ2JhJykpXG5cbiAgY29weUNvbnRlbnRBc0hTTDogLT4gYXRvbS5jbGlwYm9hcmQud3JpdGUoQGNvbnZlcnRDb250ZW50KCdoc2wnKSlcblxuICBjb3B5Q29udGVudEFzSFNMQTogLT4gYXRvbS5jbGlwYm9hcmQud3JpdGUoQGNvbnZlcnRDb250ZW50KCdoc2xhJykpXG5cbiAgY29udmVydENvbnRlbnRJblBsYWNlOiAobW9kZSkgLT5cbiAgICBAY29sb3JCdWZmZXIuZWRpdG9yLmdldEJ1ZmZlcigpLnNldFRleHRJblJhbmdlKEBtYXJrZXIuZ2V0QnVmZmVyUmFuZ2UoKSwgQGNvbnZlcnRDb250ZW50KG1vZGUpKVxuXG4gIGNvbnZlcnRDb250ZW50OiAobW9kZSkgLT5cbiAgICB7ZmlsbH0gPSByZXF1aXJlICcuL3V0aWxzJyB1bmxlc3MgZmlsbD9cblxuICAgIHN3aXRjaCBtb2RlXG4gICAgICB3aGVuICdoZXgnXG4gICAgICAgICcjJyArIGZpbGwoQGNvbG9yLmhleCwgNilcbiAgICAgIHdoZW4gJ3JnYidcbiAgICAgICAgXCJyZ2IoI3tNYXRoLnJvdW5kIEBjb2xvci5yZWR9LCAje01hdGgucm91bmQgQGNvbG9yLmdyZWVufSwgI3tNYXRoLnJvdW5kIEBjb2xvci5ibHVlfSlcIlxuICAgICAgd2hlbiAncmdiYSdcbiAgICAgICAgXCJyZ2JhKCN7TWF0aC5yb3VuZCBAY29sb3IucmVkfSwgI3tNYXRoLnJvdW5kIEBjb2xvci5ncmVlbn0sICN7TWF0aC5yb3VuZCBAY29sb3IuYmx1ZX0sICN7QGNvbG9yLmFscGhhfSlcIlxuICAgICAgd2hlbiAnaHNsJ1xuICAgICAgICBcImhzbCgje01hdGgucm91bmQgQGNvbG9yLmh1ZX0sICN7TWF0aC5yb3VuZCBAY29sb3Iuc2F0dXJhdGlvbn0lLCAje01hdGgucm91bmQgQGNvbG9yLmxpZ2h0bmVzc30lKVwiXG4gICAgICB3aGVuICdoc2xhJ1xuICAgICAgICBcImhzbGEoI3tNYXRoLnJvdW5kIEBjb2xvci5odWV9LCAje01hdGgucm91bmQgQGNvbG9yLnNhdHVyYXRpb259JSwgI3tNYXRoLnJvdW5kIEBjb2xvci5saWdodG5lc3N9JSwgI3tAY29sb3IuYWxwaGF9KVwiXG4iXX0=
