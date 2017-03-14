(function() {
  var ColorMarkerElement, CompositeDisposable, Emitter, EventsDelegation, RENDERERS, SPEC_MODE, ref, ref1, registerOrUpdateElement,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = [], CompositeDisposable = ref[0], Emitter = ref[1];

  ref1 = require('atom-utils'), registerOrUpdateElement = ref1.registerOrUpdateElement, EventsDelegation = ref1.EventsDelegation;

  SPEC_MODE = atom.inSpecMode();

  RENDERERS = {
    'background': require('./renderers/background'),
    'outline': require('./renderers/outline'),
    'underline': require('./renderers/underline'),
    'dot': require('./renderers/dot'),
    'square-dot': require('./renderers/square-dot')
  };

  ColorMarkerElement = (function(superClass) {
    extend(ColorMarkerElement, superClass);

    function ColorMarkerElement() {
      return ColorMarkerElement.__super__.constructor.apply(this, arguments);
    }

    EventsDelegation.includeInto(ColorMarkerElement);

    ColorMarkerElement.prototype.renderer = new RENDERERS.background;

    ColorMarkerElement.prototype.createdCallback = function() {
      var ref2;
      if (Emitter == null) {
        ref2 = require('atom'), CompositeDisposable = ref2.CompositeDisposable, Emitter = ref2.Emitter;
      }
      this.emitter = new Emitter;
      return this.released = true;
    };

    ColorMarkerElement.prototype.attachedCallback = function() {};

    ColorMarkerElement.prototype.detachedCallback = function() {};

    ColorMarkerElement.prototype.onDidRelease = function(callback) {
      return this.emitter.on('did-release', callback);
    };

    ColorMarkerElement.prototype.setContainer = function(bufferElement1) {
      this.bufferElement = bufferElement1;
    };

    ColorMarkerElement.prototype.getModel = function() {
      return this.colorMarker;
    };

    ColorMarkerElement.prototype.setModel = function(colorMarker1) {
      var ref2;
      this.colorMarker = colorMarker1;
      if (!this.released) {
        return;
      }
      if (CompositeDisposable == null) {
        ref2 = require('atom'), CompositeDisposable = ref2.CompositeDisposable, Emitter = ref2.Emitter;
      }
      this.released = false;
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(this.colorMarker.marker.onDidDestroy((function(_this) {
        return function() {
          return _this.release();
        };
      })(this)));
      this.subscriptions.add(this.colorMarker.marker.onDidChange((function(_this) {
        return function(data) {
          var isValid;
          isValid = data.isValid;
          if (isValid) {
            return _this.bufferElement.requestMarkerUpdate([_this]);
          } else {
            return _this.release();
          }
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.markerType', (function(_this) {
        return function(type) {
          if (!_this.bufferElement.useNativeDecorations()) {
            return _this.bufferElement.requestMarkerUpdate([_this]);
          }
        };
      })(this)));
      this.subscriptions.add(this.subscribeTo(this, {
        click: (function(_this) {
          return function(e) {
            var colorBuffer;
            colorBuffer = _this.colorMarker.colorBuffer;
            if (colorBuffer == null) {
              return;
            }
            return colorBuffer.selectColorMarkerAndOpenPicker(_this.colorMarker);
          };
        })(this)
      }));
      return this.render();
    };

    ColorMarkerElement.prototype.destroy = function() {
      var ref2, ref3;
      if ((ref2 = this.parentNode) != null) {
        ref2.removeChild(this);
      }
      if ((ref3 = this.subscriptions) != null) {
        ref3.dispose();
      }
      return this.clear();
    };

    ColorMarkerElement.prototype.render = function() {
      var bufferElement, cls, colorMarker, i, k, len, ref2, ref3, region, regions, renderer, style, v;
      if (!((this.colorMarker != null) && (this.colorMarker.color != null) && (this.renderer != null))) {
        return;
      }
      ref2 = this, colorMarker = ref2.colorMarker, renderer = ref2.renderer, bufferElement = ref2.bufferElement;
      if (bufferElement.editor.isDestroyed()) {
        return;
      }
      this.innerHTML = '';
      ref3 = renderer.render(colorMarker), style = ref3.style, regions = ref3.regions, cls = ref3["class"];
      regions = (regions || []).filter(function(r) {
        return r != null;
      });
      if ((regions != null ? regions.some(function(r) {
        return r != null ? r.invalid : void 0;
      }) : void 0) && !SPEC_MODE) {
        return bufferElement.requestMarkerUpdate([this]);
      }
      for (i = 0, len = regions.length; i < len; i++) {
        region = regions[i];
        this.appendChild(region);
      }
      if (cls != null) {
        this.className = cls;
      } else {
        this.className = '';
      }
      if (style != null) {
        for (k in style) {
          v = style[k];
          this.style[k] = v;
        }
      } else {
        this.style.cssText = '';
      }
      return this.lastMarkerScreenRange = colorMarker.getScreenRange();
    };

    ColorMarkerElement.prototype.checkScreenRange = function() {
      if (!((this.colorMarker != null) && (this.lastMarkerScreenRange != null))) {
        return;
      }
      if (!this.lastMarkerScreenRange.isEqual(this.colorMarker.getScreenRange())) {
        return this.render();
      }
    };

    ColorMarkerElement.prototype.isReleased = function() {
      return this.released;
    };

    ColorMarkerElement.prototype.release = function(dispatchEvent) {
      var marker;
      if (dispatchEvent == null) {
        dispatchEvent = true;
      }
      if (this.released) {
        return;
      }
      this.subscriptions.dispose();
      marker = this.colorMarker;
      this.clear();
      if (dispatchEvent) {
        return this.emitter.emit('did-release', {
          marker: marker,
          view: this
        });
      }
    };

    ColorMarkerElement.prototype.clear = function() {
      this.subscriptions = null;
      this.colorMarker = null;
      this.released = true;
      this.innerHTML = '';
      this.className = '';
      return this.style.cssText = '';
    };

    return ColorMarkerElement;

  })(HTMLElement);

  module.exports = ColorMarkerElement = registerOrUpdateElement('pigments-color-marker', ColorMarkerElement.prototype);

  ColorMarkerElement.isNativeDecorationType = function(type) {
    return type === 'gutter' || type === 'native-background' || type === 'native-outline' || type === 'native-underline' || type === 'native-dot' || type === 'native-square-dot';
  };

  ColorMarkerElement.setMarkerType = function(markerType) {
    if (ColorMarkerElement.isNativeDecorationType(markerType)) {
      return;
    }
    if (RENDERERS[markerType] == null) {
      return;
    }
    this.prototype.rendererType = markerType;
    return this.prototype.renderer = new RENDERERS[markerType];
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2FuZ29hLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi9jb2xvci1tYXJrZXItZWxlbWVudC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDRIQUFBO0lBQUE7OztFQUFBLE1BQWlDLEVBQWpDLEVBQUMsNEJBQUQsRUFBc0I7O0VBRXRCLE9BQThDLE9BQUEsQ0FBUSxZQUFSLENBQTlDLEVBQUMsc0RBQUQsRUFBMEI7O0VBRTFCLFNBQUEsR0FBWSxJQUFJLENBQUMsVUFBTCxDQUFBOztFQUNaLFNBQUEsR0FDRTtJQUFBLFlBQUEsRUFBYyxPQUFBLENBQVEsd0JBQVIsQ0FBZDtJQUNBLFNBQUEsRUFBVyxPQUFBLENBQVEscUJBQVIsQ0FEWDtJQUVBLFdBQUEsRUFBYSxPQUFBLENBQVEsdUJBQVIsQ0FGYjtJQUdBLEtBQUEsRUFBTyxPQUFBLENBQVEsaUJBQVIsQ0FIUDtJQUlBLFlBQUEsRUFBYyxPQUFBLENBQVEsd0JBQVIsQ0FKZDs7O0VBTUk7Ozs7Ozs7SUFDSixnQkFBZ0IsQ0FBQyxXQUFqQixDQUE2QixrQkFBN0I7O2lDQUVBLFFBQUEsR0FBVSxJQUFJLFNBQVMsQ0FBQzs7aUNBRXhCLGVBQUEsR0FBaUIsU0FBQTtBQUNmLFVBQUE7TUFBQSxJQUF1RCxlQUF2RDtRQUFBLE9BQWlDLE9BQUEsQ0FBUSxNQUFSLENBQWpDLEVBQUMsOENBQUQsRUFBc0IsdUJBQXRCOztNQUVBLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBSTthQUNmLElBQUMsQ0FBQSxRQUFELEdBQVk7SUFKRzs7aUNBTWpCLGdCQUFBLEdBQWtCLFNBQUEsR0FBQTs7aUNBRWxCLGdCQUFBLEdBQWtCLFNBQUEsR0FBQTs7aUNBRWxCLFlBQUEsR0FBYyxTQUFDLFFBQUQ7YUFDWixJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxhQUFaLEVBQTJCLFFBQTNCO0lBRFk7O2lDQUdkLFlBQUEsR0FBYyxTQUFDLGNBQUQ7TUFBQyxJQUFDLENBQUEsZ0JBQUQ7SUFBRDs7aUNBRWQsUUFBQSxHQUFVLFNBQUE7YUFBRyxJQUFDLENBQUE7SUFBSjs7aUNBRVYsUUFBQSxHQUFVLFNBQUMsWUFBRDtBQUNSLFVBQUE7TUFEUyxJQUFDLENBQUEsY0FBRDtNQUNULElBQUEsQ0FBYyxJQUFDLENBQUEsUUFBZjtBQUFBLGVBQUE7O01BQ0EsSUFBdUQsMkJBQXZEO1FBQUEsT0FBaUMsT0FBQSxDQUFRLE1BQVIsQ0FBakMsRUFBQyw4Q0FBRCxFQUFzQix1QkFBdEI7O01BRUEsSUFBQyxDQUFBLFFBQUQsR0FBWTtNQUNaLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQUk7TUFDckIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSxXQUFXLENBQUMsTUFBTSxDQUFDLFlBQXBCLENBQWlDLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFBRyxLQUFDLENBQUEsT0FBRCxDQUFBO1FBQUg7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWpDLENBQW5CO01BQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSxXQUFXLENBQUMsTUFBTSxDQUFDLFdBQXBCLENBQWdDLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxJQUFEO0FBQ2pELGNBQUE7VUFBQyxVQUFXO1VBQ1osSUFBRyxPQUFIO21CQUFnQixLQUFDLENBQUEsYUFBYSxDQUFDLG1CQUFmLENBQW1DLENBQUMsS0FBRCxDQUFuQyxFQUFoQjtXQUFBLE1BQUE7bUJBQWdFLEtBQUMsQ0FBQSxPQUFELENBQUEsRUFBaEU7O1FBRmlEO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFoQyxDQUFuQjtNQUlBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQVosQ0FBb0IscUJBQXBCLEVBQTJDLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxJQUFEO1VBQzVELElBQUEsQ0FBa0QsS0FBQyxDQUFBLGFBQWEsQ0FBQyxvQkFBZixDQUFBLENBQWxEO21CQUFBLEtBQUMsQ0FBQSxhQUFhLENBQUMsbUJBQWYsQ0FBbUMsQ0FBQyxLQUFELENBQW5DLEVBQUE7O1FBRDREO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEzQyxDQUFuQjtNQUdBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsV0FBRCxDQUFhLElBQWIsRUFDakI7UUFBQSxLQUFBLEVBQU8sQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQyxDQUFEO0FBQ0wsZ0JBQUE7WUFBQSxXQUFBLEdBQWMsS0FBQyxDQUFBLFdBQVcsQ0FBQztZQUUzQixJQUFjLG1CQUFkO0FBQUEscUJBQUE7O21CQUVBLFdBQVcsQ0FBQyw4QkFBWixDQUEyQyxLQUFDLENBQUEsV0FBNUM7VUFMSztRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBUDtPQURpQixDQUFuQjthQVFBLElBQUMsQ0FBQSxNQUFELENBQUE7SUF0QlE7O2lDQXdCVixPQUFBLEdBQVMsU0FBQTtBQUNQLFVBQUE7O1lBQVcsQ0FBRSxXQUFiLENBQXlCLElBQXpCOzs7WUFDYyxDQUFFLE9BQWhCLENBQUE7O2FBQ0EsSUFBQyxDQUFBLEtBQUQsQ0FBQTtJQUhPOztpQ0FLVCxNQUFBLEdBQVEsU0FBQTtBQUNOLFVBQUE7TUFBQSxJQUFBLENBQUEsQ0FBYywwQkFBQSxJQUFrQixnQ0FBbEIsSUFBMEMsdUJBQXhELENBQUE7QUFBQSxlQUFBOztNQUVBLE9BQXlDLElBQXpDLEVBQUMsOEJBQUQsRUFBYyx3QkFBZCxFQUF3QjtNQUV4QixJQUFVLGFBQWEsQ0FBQyxNQUFNLENBQUMsV0FBckIsQ0FBQSxDQUFWO0FBQUEsZUFBQTs7TUFDQSxJQUFDLENBQUEsU0FBRCxHQUFhO01BQ2IsT0FBK0IsUUFBUSxDQUFDLE1BQVQsQ0FBZ0IsV0FBaEIsQ0FBL0IsRUFBQyxrQkFBRCxFQUFRLHNCQUFSLEVBQXdCLFlBQVA7TUFFakIsT0FBQSxHQUFVLENBQUMsT0FBQSxJQUFXLEVBQVosQ0FBZSxDQUFDLE1BQWhCLENBQXVCLFNBQUMsQ0FBRDtlQUFPO01BQVAsQ0FBdkI7TUFFVix1QkFBRyxPQUFPLENBQUUsSUFBVCxDQUFjLFNBQUMsQ0FBRDsyQkFBTyxDQUFDLENBQUU7TUFBVixDQUFkLFdBQUEsSUFBcUMsQ0FBQyxTQUF6QztBQUNFLGVBQU8sYUFBYSxDQUFDLG1CQUFkLENBQWtDLENBQUMsSUFBRCxDQUFsQyxFQURUOztBQUdBLFdBQUEseUNBQUE7O1FBQUEsSUFBQyxDQUFBLFdBQUQsQ0FBYSxNQUFiO0FBQUE7TUFDQSxJQUFHLFdBQUg7UUFDRSxJQUFDLENBQUEsU0FBRCxHQUFhLElBRGY7T0FBQSxNQUFBO1FBR0UsSUFBQyxDQUFBLFNBQUQsR0FBYSxHQUhmOztNQUtBLElBQUcsYUFBSDtBQUNFLGFBQUEsVUFBQTs7VUFBQSxJQUFDLENBQUEsS0FBTSxDQUFBLENBQUEsQ0FBUCxHQUFZO0FBQVosU0FERjtPQUFBLE1BQUE7UUFHRSxJQUFDLENBQUEsS0FBSyxDQUFDLE9BQVAsR0FBaUIsR0FIbkI7O2FBS0EsSUFBQyxDQUFBLHFCQUFELEdBQXlCLFdBQVcsQ0FBQyxjQUFaLENBQUE7SUF6Qm5COztpQ0EyQlIsZ0JBQUEsR0FBa0IsU0FBQTtNQUNoQixJQUFBLENBQUEsQ0FBYywwQkFBQSxJQUFrQixvQ0FBaEMsQ0FBQTtBQUFBLGVBQUE7O01BQ0EsSUFBQSxDQUFPLElBQUMsQ0FBQSxxQkFBcUIsQ0FBQyxPQUF2QixDQUErQixJQUFDLENBQUEsV0FBVyxDQUFDLGNBQWIsQ0FBQSxDQUEvQixDQUFQO2VBQ0UsSUFBQyxDQUFBLE1BQUQsQ0FBQSxFQURGOztJQUZnQjs7aUNBS2xCLFVBQUEsR0FBWSxTQUFBO2FBQUcsSUFBQyxDQUFBO0lBQUo7O2lDQUVaLE9BQUEsR0FBUyxTQUFDLGFBQUQ7QUFDUCxVQUFBOztRQURRLGdCQUFjOztNQUN0QixJQUFVLElBQUMsQ0FBQSxRQUFYO0FBQUEsZUFBQTs7TUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLE9BQWYsQ0FBQTtNQUNBLE1BQUEsR0FBUyxJQUFDLENBQUE7TUFDVixJQUFDLENBQUEsS0FBRCxDQUFBO01BQ0EsSUFBc0QsYUFBdEQ7ZUFBQSxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxhQUFkLEVBQTZCO1VBQUMsUUFBQSxNQUFEO1VBQVMsSUFBQSxFQUFNLElBQWY7U0FBN0IsRUFBQTs7SUFMTzs7aUNBT1QsS0FBQSxHQUFPLFNBQUE7TUFDTCxJQUFDLENBQUEsYUFBRCxHQUFpQjtNQUNqQixJQUFDLENBQUEsV0FBRCxHQUFlO01BQ2YsSUFBQyxDQUFBLFFBQUQsR0FBWTtNQUNaLElBQUMsQ0FBQSxTQUFELEdBQWE7TUFDYixJQUFDLENBQUEsU0FBRCxHQUFhO2FBQ2IsSUFBQyxDQUFBLEtBQUssQ0FBQyxPQUFQLEdBQWlCO0lBTlo7Ozs7S0E1RndCOztFQW9HakMsTUFBTSxDQUFDLE9BQVAsR0FDQSxrQkFBQSxHQUNBLHVCQUFBLENBQXdCLHVCQUF4QixFQUFpRCxrQkFBa0IsQ0FBQyxTQUFwRTs7RUFFQSxrQkFBa0IsQ0FBQyxzQkFBbkIsR0FBNEMsU0FBQyxJQUFEO1dBQzFDLElBQUEsS0FDRSxRQURGLElBQUEsSUFBQSxLQUVFLG1CQUZGLElBQUEsSUFBQSxLQUdFLGdCQUhGLElBQUEsSUFBQSxLQUlFLGtCQUpGLElBQUEsSUFBQSxLQUtFLFlBTEYsSUFBQSxJQUFBLEtBTUU7RUFQd0M7O0VBVTVDLGtCQUFrQixDQUFDLGFBQW5CLEdBQW1DLFNBQUMsVUFBRDtJQUNqQyxJQUFVLGtCQUFrQixDQUFDLHNCQUFuQixDQUEwQyxVQUExQyxDQUFWO0FBQUEsYUFBQTs7SUFDQSxJQUFjLDZCQUFkO0FBQUEsYUFBQTs7SUFFQSxJQUFDLENBQUEsU0FBUyxDQUFDLFlBQVgsR0FBMEI7V0FDMUIsSUFBQyxDQUFBLFNBQVMsQ0FBQyxRQUFYLEdBQXNCLElBQUksU0FBVSxDQUFBLFVBQUE7RUFMSDtBQTlIbkMiLCJzb3VyY2VzQ29udGVudCI6WyJbQ29tcG9zaXRlRGlzcG9zYWJsZSwgRW1pdHRlcl0gPSBbXVxuXG57cmVnaXN0ZXJPclVwZGF0ZUVsZW1lbnQsIEV2ZW50c0RlbGVnYXRpb259ID0gcmVxdWlyZSAnYXRvbS11dGlscydcblxuU1BFQ19NT0RFID0gYXRvbS5pblNwZWNNb2RlKClcblJFTkRFUkVSUyA9XG4gICdiYWNrZ3JvdW5kJzogcmVxdWlyZSAnLi9yZW5kZXJlcnMvYmFja2dyb3VuZCdcbiAgJ291dGxpbmUnOiByZXF1aXJlICcuL3JlbmRlcmVycy9vdXRsaW5lJ1xuICAndW5kZXJsaW5lJzogcmVxdWlyZSAnLi9yZW5kZXJlcnMvdW5kZXJsaW5lJ1xuICAnZG90JzogcmVxdWlyZSAnLi9yZW5kZXJlcnMvZG90J1xuICAnc3F1YXJlLWRvdCc6IHJlcXVpcmUgJy4vcmVuZGVyZXJzL3NxdWFyZS1kb3QnXG5cbmNsYXNzIENvbG9yTWFya2VyRWxlbWVudCBleHRlbmRzIEhUTUxFbGVtZW50XG4gIEV2ZW50c0RlbGVnYXRpb24uaW5jbHVkZUludG8odGhpcylcblxuICByZW5kZXJlcjogbmV3IFJFTkRFUkVSUy5iYWNrZ3JvdW5kXG5cbiAgY3JlYXRlZENhbGxiYWNrOiAtPlxuICAgIHtDb21wb3NpdGVEaXNwb3NhYmxlLCBFbWl0dGVyfSA9IHJlcXVpcmUgJ2F0b20nIHVubGVzcyBFbWl0dGVyP1xuXG4gICAgQGVtaXR0ZXIgPSBuZXcgRW1pdHRlclxuICAgIEByZWxlYXNlZCA9IHRydWVcblxuICBhdHRhY2hlZENhbGxiYWNrOiAtPlxuXG4gIGRldGFjaGVkQ2FsbGJhY2s6IC0+XG5cbiAgb25EaWRSZWxlYXNlOiAoY2FsbGJhY2spIC0+XG4gICAgQGVtaXR0ZXIub24gJ2RpZC1yZWxlYXNlJywgY2FsbGJhY2tcblxuICBzZXRDb250YWluZXI6IChAYnVmZmVyRWxlbWVudCkgLT5cblxuICBnZXRNb2RlbDogLT4gQGNvbG9yTWFya2VyXG5cbiAgc2V0TW9kZWw6IChAY29sb3JNYXJrZXIpIC0+XG4gICAgcmV0dXJuIHVubGVzcyBAcmVsZWFzZWRcbiAgICB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRW1pdHRlcn0gPSByZXF1aXJlICdhdG9tJyB1bmxlc3MgQ29tcG9zaXRlRGlzcG9zYWJsZT9cblxuICAgIEByZWxlYXNlZCA9IGZhbHNlXG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAY29sb3JNYXJrZXIubWFya2VyLm9uRGlkRGVzdHJveSA9PiBAcmVsZWFzZSgpXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBjb2xvck1hcmtlci5tYXJrZXIub25EaWRDaGFuZ2UgKGRhdGEpID0+XG4gICAgICB7aXNWYWxpZH0gPSBkYXRhXG4gICAgICBpZiBpc1ZhbGlkIHRoZW4gQGJ1ZmZlckVsZW1lbnQucmVxdWVzdE1hcmtlclVwZGF0ZShbdGhpc10pIGVsc2UgQHJlbGVhc2UoKVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29uZmlnLm9ic2VydmUgJ3BpZ21lbnRzLm1hcmtlclR5cGUnLCAodHlwZSkgPT5cbiAgICAgIEBidWZmZXJFbGVtZW50LnJlcXVlc3RNYXJrZXJVcGRhdGUoW3RoaXNdKSB1bmxlc3MgQGJ1ZmZlckVsZW1lbnQudXNlTmF0aXZlRGVjb3JhdGlvbnMoKVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBzdWJzY3JpYmVUbyB0aGlzLFxuICAgICAgY2xpY2s6IChlKSA9PlxuICAgICAgICBjb2xvckJ1ZmZlciA9IEBjb2xvck1hcmtlci5jb2xvckJ1ZmZlclxuXG4gICAgICAgIHJldHVybiB1bmxlc3MgY29sb3JCdWZmZXI/XG5cbiAgICAgICAgY29sb3JCdWZmZXIuc2VsZWN0Q29sb3JNYXJrZXJBbmRPcGVuUGlja2VyKEBjb2xvck1hcmtlcilcblxuICAgIEByZW5kZXIoKVxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQHBhcmVudE5vZGU/LnJlbW92ZUNoaWxkKHRoaXMpXG4gICAgQHN1YnNjcmlwdGlvbnM/LmRpc3Bvc2UoKVxuICAgIEBjbGVhcigpXG5cbiAgcmVuZGVyOiAtPlxuICAgIHJldHVybiB1bmxlc3MgQGNvbG9yTWFya2VyPyBhbmQgQGNvbG9yTWFya2VyLmNvbG9yPyBhbmQgQHJlbmRlcmVyP1xuXG4gICAge2NvbG9yTWFya2VyLCByZW5kZXJlciwgYnVmZmVyRWxlbWVudH0gPSB0aGlzXG5cbiAgICByZXR1cm4gaWYgYnVmZmVyRWxlbWVudC5lZGl0b3IuaXNEZXN0cm95ZWQoKVxuICAgIEBpbm5lckhUTUwgPSAnJ1xuICAgIHtzdHlsZSwgcmVnaW9ucywgY2xhc3M6IGNsc30gPSByZW5kZXJlci5yZW5kZXIoY29sb3JNYXJrZXIpXG5cbiAgICByZWdpb25zID0gKHJlZ2lvbnMgb3IgW10pLmZpbHRlciAocikgLT4gcj9cblxuICAgIGlmIHJlZ2lvbnM/LnNvbWUoKHIpIC0+IHI/LmludmFsaWQpIGFuZCAhU1BFQ19NT0RFXG4gICAgICByZXR1cm4gYnVmZmVyRWxlbWVudC5yZXF1ZXN0TWFya2VyVXBkYXRlKFt0aGlzXSlcblxuICAgIEBhcHBlbmRDaGlsZChyZWdpb24pIGZvciByZWdpb24gaW4gcmVnaW9uc1xuICAgIGlmIGNscz9cbiAgICAgIEBjbGFzc05hbWUgPSBjbHNcbiAgICBlbHNlXG4gICAgICBAY2xhc3NOYW1lID0gJydcblxuICAgIGlmIHN0eWxlP1xuICAgICAgQHN0eWxlW2tdID0gdiBmb3Igayx2IG9mIHN0eWxlXG4gICAgZWxzZVxuICAgICAgQHN0eWxlLmNzc1RleHQgPSAnJ1xuXG4gICAgQGxhc3RNYXJrZXJTY3JlZW5SYW5nZSA9IGNvbG9yTWFya2VyLmdldFNjcmVlblJhbmdlKClcblxuICBjaGVja1NjcmVlblJhbmdlOiAtPlxuICAgIHJldHVybiB1bmxlc3MgQGNvbG9yTWFya2VyPyBhbmQgQGxhc3RNYXJrZXJTY3JlZW5SYW5nZT9cbiAgICB1bmxlc3MgQGxhc3RNYXJrZXJTY3JlZW5SYW5nZS5pc0VxdWFsKEBjb2xvck1hcmtlci5nZXRTY3JlZW5SYW5nZSgpKVxuICAgICAgQHJlbmRlcigpXG5cbiAgaXNSZWxlYXNlZDogLT4gQHJlbGVhc2VkXG5cbiAgcmVsZWFzZTogKGRpc3BhdGNoRXZlbnQ9dHJ1ZSkgLT5cbiAgICByZXR1cm4gaWYgQHJlbGVhc2VkXG4gICAgQHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgbWFya2VyID0gQGNvbG9yTWFya2VyXG4gICAgQGNsZWFyKClcbiAgICBAZW1pdHRlci5lbWl0KCdkaWQtcmVsZWFzZScsIHttYXJrZXIsIHZpZXc6IHRoaXN9KSBpZiBkaXNwYXRjaEV2ZW50XG5cbiAgY2xlYXI6IC0+XG4gICAgQHN1YnNjcmlwdGlvbnMgPSBudWxsXG4gICAgQGNvbG9yTWFya2VyID0gbnVsbFxuICAgIEByZWxlYXNlZCA9IHRydWVcbiAgICBAaW5uZXJIVE1MID0gJydcbiAgICBAY2xhc3NOYW1lID0gJydcbiAgICBAc3R5bGUuY3NzVGV4dCA9ICcnXG5cbm1vZHVsZS5leHBvcnRzID1cbkNvbG9yTWFya2VyRWxlbWVudCA9XG5yZWdpc3Rlck9yVXBkYXRlRWxlbWVudCAncGlnbWVudHMtY29sb3ItbWFya2VyJywgQ29sb3JNYXJrZXJFbGVtZW50LnByb3RvdHlwZVxuXG5Db2xvck1hcmtlckVsZW1lbnQuaXNOYXRpdmVEZWNvcmF0aW9uVHlwZSA9ICh0eXBlKSAtPlxuICB0eXBlIGluIFtcbiAgICAnZ3V0dGVyJ1xuICAgICduYXRpdmUtYmFja2dyb3VuZCdcbiAgICAnbmF0aXZlLW91dGxpbmUnXG4gICAgJ25hdGl2ZS11bmRlcmxpbmUnXG4gICAgJ25hdGl2ZS1kb3QnXG4gICAgJ25hdGl2ZS1zcXVhcmUtZG90J1xuICBdXG5cbkNvbG9yTWFya2VyRWxlbWVudC5zZXRNYXJrZXJUeXBlID0gKG1hcmtlclR5cGUpIC0+XG4gIHJldHVybiBpZiBDb2xvck1hcmtlckVsZW1lbnQuaXNOYXRpdmVEZWNvcmF0aW9uVHlwZShtYXJrZXJUeXBlKVxuICByZXR1cm4gdW5sZXNzIFJFTkRFUkVSU1ttYXJrZXJUeXBlXT9cblxuICBAcHJvdG90eXBlLnJlbmRlcmVyVHlwZSA9IG1hcmtlclR5cGVcbiAgQHByb3RvdHlwZS5yZW5kZXJlciA9IG5ldyBSRU5ERVJFUlNbbWFya2VyVHlwZV1cbiJdfQ==
