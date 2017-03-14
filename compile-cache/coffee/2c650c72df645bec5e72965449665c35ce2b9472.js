(function() {
  var BlendModes, Color, ColorContext, ColorExpression, ColorParser, SVGColors, clamp, clampInt, comma, float, floatOrPercent, hexadecimal, int, intOrPercent, namePrefixes, notQuote, optionalPercent, pe, percent, ps, ref, scopeFromFileName, split, variables,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ref = [], Color = ref[0], ColorParser = ref[1], ColorExpression = ref[2], SVGColors = ref[3], BlendModes = ref[4], int = ref[5], float = ref[6], percent = ref[7], optionalPercent = ref[8], intOrPercent = ref[9], floatOrPercent = ref[10], comma = ref[11], notQuote = ref[12], hexadecimal = ref[13], ps = ref[14], pe = ref[15], variables = ref[16], namePrefixes = ref[17], split = ref[18], clamp = ref[19], clampInt = ref[20], scopeFromFileName = ref[21];

  module.exports = ColorContext = (function() {
    function ColorContext(options) {
      var colorVariables, expr, i, j, len, len1, ref1, ref2, ref3, sorted, v;
      if (options == null) {
        options = {};
      }
      this.sortPaths = bind(this.sortPaths, this);
      if (Color == null) {
        Color = require('./color');
        SVGColors = require('./svg-colors');
        BlendModes = require('./blend-modes');
        if (ColorExpression == null) {
          ColorExpression = require('./color-expression');
        }
        ref1 = require('./regexes'), int = ref1.int, float = ref1.float, percent = ref1.percent, optionalPercent = ref1.optionalPercent, intOrPercent = ref1.intOrPercent, floatOrPercent = ref1.floatOrPercent, comma = ref1.comma, notQuote = ref1.notQuote, hexadecimal = ref1.hexadecimal, ps = ref1.ps, pe = ref1.pe, variables = ref1.variables, namePrefixes = ref1.namePrefixes;
        ColorContext.prototype.SVGColors = SVGColors;
        ColorContext.prototype.Color = Color;
        ColorContext.prototype.BlendModes = BlendModes;
        ColorContext.prototype.int = int;
        ColorContext.prototype.float = float;
        ColorContext.prototype.percent = percent;
        ColorContext.prototype.optionalPercent = optionalPercent;
        ColorContext.prototype.intOrPercent = intOrPercent;
        ColorContext.prototype.floatOrPercent = floatOrPercent;
        ColorContext.prototype.comma = comma;
        ColorContext.prototype.notQuote = notQuote;
        ColorContext.prototype.hexadecimal = hexadecimal;
        ColorContext.prototype.ps = ps;
        ColorContext.prototype.pe = pe;
        ColorContext.prototype.variablesRE = variables;
        ColorContext.prototype.namePrefixes = namePrefixes;
      }
      variables = options.variables, colorVariables = options.colorVariables, this.referenceVariable = options.referenceVariable, this.referencePath = options.referencePath, this.rootPaths = options.rootPaths, this.parser = options.parser, this.colorVars = options.colorVars, this.vars = options.vars, this.defaultVars = options.defaultVars, this.defaultColorVars = options.defaultColorVars, sorted = options.sorted, this.registry = options.registry, this.sassScopeSuffix = options.sassScopeSuffix;
      if (variables == null) {
        variables = [];
      }
      if (colorVariables == null) {
        colorVariables = [];
      }
      if (this.rootPaths == null) {
        this.rootPaths = [];
      }
      if (this.referenceVariable != null) {
        if (this.referencePath == null) {
          this.referencePath = this.referenceVariable.path;
        }
      }
      if (this.sorted) {
        this.variables = variables;
        this.colorVariables = colorVariables;
      } else {
        this.variables = variables.slice().sort(this.sortPaths);
        this.colorVariables = colorVariables.slice().sort(this.sortPaths);
      }
      if (this.vars == null) {
        this.vars = {};
        this.colorVars = {};
        this.defaultVars = {};
        this.defaultColorVars = {};
        ref2 = this.variables;
        for (i = 0, len = ref2.length; i < len; i++) {
          v = ref2[i];
          if (!v["default"]) {
            this.vars[v.name] = v;
          }
          if (v["default"]) {
            this.defaultVars[v.name] = v;
          }
        }
        ref3 = this.colorVariables;
        for (j = 0, len1 = ref3.length; j < len1; j++) {
          v = ref3[j];
          if (!v["default"]) {
            this.colorVars[v.name] = v;
          }
          if (v["default"]) {
            this.defaultColorVars[v.name] = v;
          }
        }
      }
      if ((this.registry.getExpression('pigments:variables') == null) && this.colorVariables.length > 0) {
        expr = ColorExpression.colorExpressionForColorVariables(this.colorVariables);
        this.registry.addExpression(expr);
      }
      if (this.parser == null) {
        if (ColorParser == null) {
          ColorParser = require('./color-parser');
        }
        this.parser = new ColorParser(this.registry, this);
      }
      this.usedVariables = [];
      this.resolvedVariables = [];
    }

    ColorContext.prototype.sortPaths = function(a, b) {
      var rootA, rootB, rootReference;
      if (this.referencePath != null) {
        if (a.path === b.path) {
          return 0;
        }
        if (a.path === this.referencePath) {
          return 1;
        }
        if (b.path === this.referencePath) {
          return -1;
        }
        rootReference = this.rootPathForPath(this.referencePath);
        rootA = this.rootPathForPath(a.path);
        rootB = this.rootPathForPath(b.path);
        if (rootA === rootB) {
          return 0;
        }
        if (rootA === rootReference) {
          return 1;
        }
        if (rootB === rootReference) {
          return -1;
        }
        return 0;
      } else {
        return 0;
      }
    };

    ColorContext.prototype.rootPathForPath = function(path) {
      var i, len, ref1, root;
      ref1 = this.rootPaths;
      for (i = 0, len = ref1.length; i < len; i++) {
        root = ref1[i];
        if (path.indexOf(root + "/") === 0) {
          return root;
        }
      }
    };

    ColorContext.prototype.clone = function() {
      return new ColorContext({
        variables: this.variables,
        colorVariables: this.colorVariables,
        referenceVariable: this.referenceVariable,
        parser: this.parser,
        vars: this.vars,
        colorVars: this.colorVars,
        defaultVars: this.defaultVars,
        defaultColorVars: this.defaultColorVars,
        sorted: true
      });
    };

    ColorContext.prototype.containsVariable = function(variableName) {
      return indexOf.call(this.getVariablesNames(), variableName) >= 0;
    };

    ColorContext.prototype.hasColorVariables = function() {
      return this.colorVariables.length > 0;
    };

    ColorContext.prototype.getVariables = function() {
      return this.variables;
    };

    ColorContext.prototype.getColorVariables = function() {
      return this.colorVariables;
    };

    ColorContext.prototype.getVariablesNames = function() {
      return this.varNames != null ? this.varNames : this.varNames = Object.keys(this.vars);
    };

    ColorContext.prototype.getVariablesCount = function() {
      return this.varCount != null ? this.varCount : this.varCount = this.getVariablesNames().length;
    };

    ColorContext.prototype.readUsedVariables = function() {
      var i, len, ref1, usedVariables, v;
      usedVariables = [];
      ref1 = this.usedVariables;
      for (i = 0, len = ref1.length; i < len; i++) {
        v = ref1[i];
        if (indexOf.call(usedVariables, v) < 0) {
          usedVariables.push(v);
        }
      }
      this.usedVariables = [];
      this.resolvedVariables = [];
      return usedVariables;
    };

    ColorContext.prototype.getValue = function(value) {
      var lastRealValue, lookedUpValues, realValue, ref1, ref2;
      ref1 = [], realValue = ref1[0], lastRealValue = ref1[1];
      lookedUpValues = [value];
      while ((realValue = (ref2 = this.vars[value]) != null ? ref2.value : void 0) && indexOf.call(lookedUpValues, realValue) < 0) {
        this.usedVariables.push(value);
        value = lastRealValue = realValue;
        lookedUpValues.push(realValue);
      }
      if (indexOf.call(lookedUpValues, realValue) >= 0) {
        return void 0;
      } else {
        return lastRealValue;
      }
    };

    ColorContext.prototype.readColorExpression = function(value) {
      if (this.colorVars[value] != null) {
        this.usedVariables.push(value);
        return this.colorVars[value].value;
      } else if (this.defaultColorVars[value] != null) {
        this.usedVariables.push(value);
        return this.defaultColorVars[value].value;
      } else {
        return value;
      }
    };

    ColorContext.prototype.readColor = function(value, keepAllVariables) {
      var realValue, ref1, result, scope;
      if (keepAllVariables == null) {
        keepAllVariables = false;
      }
      if (indexOf.call(this.usedVariables, value) >= 0 && !(indexOf.call(this.resolvedVariables, value) >= 0)) {
        return;
      }
      realValue = this.readColorExpression(value);
      if ((realValue == null) || indexOf.call(this.usedVariables, realValue) >= 0) {
        return;
      }
      scope = this.colorVars[value] != null ? this.scopeFromFileName(this.colorVars[value].path) : '*';
      this.usedVariables = this.usedVariables.filter(function(v) {
        return v !== realValue;
      });
      result = this.parser.parse(realValue, scope, false);
      if (result != null) {
        if (result.invalid && (this.defaultColorVars[realValue] != null)) {
          result = this.readColor(this.defaultColorVars[realValue].value);
          value = realValue;
        }
      } else if (this.defaultColorVars[value] != null) {
        this.usedVariables.push(value);
        result = this.readColor(this.defaultColorVars[value].value);
      } else {
        if (this.vars[value] != null) {
          this.usedVariables.push(value);
        }
      }
      if (result != null) {
        this.resolvedVariables.push(value);
        if (keepAllVariables || indexOf.call(this.usedVariables, value) < 0) {
          result.variables = ((ref1 = result.variables) != null ? ref1 : []).concat(this.readUsedVariables());
        }
      }
      return result;
    };

    ColorContext.prototype.scopeFromFileName = function(path) {
      var scope;
      if (scopeFromFileName == null) {
        scopeFromFileName = require('./scope-from-file-name');
      }
      scope = scopeFromFileName(path);
      if (scope === 'sass' || scope === 'scss') {
        scope = [scope, this.sassScopeSuffix].join(':');
      }
      return scope;
    };

    ColorContext.prototype.readFloat = function(value) {
      var res;
      res = parseFloat(value);
      if (isNaN(res) && (this.vars[value] != null)) {
        this.usedVariables.push(value);
        res = this.readFloat(this.vars[value].value);
      }
      if (isNaN(res) && (this.defaultVars[value] != null)) {
        this.usedVariables.push(value);
        res = this.readFloat(this.defaultVars[value].value);
      }
      return res;
    };

    ColorContext.prototype.readInt = function(value, base) {
      var res;
      if (base == null) {
        base = 10;
      }
      res = parseInt(value, base);
      if (isNaN(res) && (this.vars[value] != null)) {
        this.usedVariables.push(value);
        res = this.readInt(this.vars[value].value);
      }
      if (isNaN(res) && (this.defaultVars[value] != null)) {
        this.usedVariables.push(value);
        res = this.readInt(this.defaultVars[value].value);
      }
      return res;
    };

    ColorContext.prototype.readPercent = function(value) {
      if (!/\d+/.test(value) && (this.vars[value] != null)) {
        this.usedVariables.push(value);
        value = this.readPercent(this.vars[value].value);
      }
      if (!/\d+/.test(value) && (this.defaultVars[value] != null)) {
        this.usedVariables.push(value);
        value = this.readPercent(this.defaultVars[value].value);
      }
      return Math.round(parseFloat(value) * 2.55);
    };

    ColorContext.prototype.readIntOrPercent = function(value) {
      var res;
      if (!/\d+/.test(value) && (this.vars[value] != null)) {
        this.usedVariables.push(value);
        value = this.readIntOrPercent(this.vars[value].value);
      }
      if (!/\d+/.test(value) && (this.defaultVars[value] != null)) {
        this.usedVariables.push(value);
        value = this.readIntOrPercent(this.defaultVars[value].value);
      }
      if (value == null) {
        return 0/0;
      }
      if (typeof value === 'number') {
        return value;
      }
      if (value.indexOf('%') !== -1) {
        res = Math.round(parseFloat(value) * 2.55);
      } else {
        res = parseInt(value);
      }
      return res;
    };

    ColorContext.prototype.readFloatOrPercent = function(value) {
      var res;
      if (!/\d+/.test(value) && (this.vars[value] != null)) {
        this.usedVariables.push(value);
        value = this.readFloatOrPercent(this.vars[value].value);
      }
      if (!/\d+/.test(value) && (this.defaultVars[value] != null)) {
        this.usedVariables.push(value);
        value = this.readFloatOrPercent(this.defaultVars[value].value);
      }
      if (value == null) {
        return 0/0;
      }
      if (typeof value === 'number') {
        return value;
      }
      if (value.indexOf('%') !== -1) {
        res = parseFloat(value) / 100;
      } else {
        res = parseFloat(value);
        if (res > 1) {
          res = res / 100;
        }
        res;
      }
      return res;
    };

    ColorContext.prototype.split = function(value) {
      var ref1;
      if (split == null) {
        ref1 = require('./utils'), split = ref1.split, clamp = ref1.clamp, clampInt = ref1.clampInt;
      }
      return split(value);
    };

    ColorContext.prototype.clamp = function(value) {
      var ref1;
      if (clamp == null) {
        ref1 = require('./utils'), split = ref1.split, clamp = ref1.clamp, clampInt = ref1.clampInt;
      }
      return clamp(value);
    };

    ColorContext.prototype.clampInt = function(value) {
      var ref1;
      if (clampInt == null) {
        ref1 = require('./utils'), split = ref1.split, clamp = ref1.clamp, clampInt = ref1.clampInt;
      }
      return clampInt(value);
    };

    ColorContext.prototype.isInvalid = function(color) {
      return !Color.isValid(color);
    };

    ColorContext.prototype.readParam = function(param, block) {
      var _, name, re, ref1, value;
      re = RegExp("\\$(\\w+):\\s*((-?" + this.float + ")|" + this.variablesRE + ")");
      if (re.test(param)) {
        ref1 = re.exec(param), _ = ref1[0], name = ref1[1], value = ref1[2];
        return block(name, value);
      }
    };

    ColorContext.prototype.contrast = function(base, dark, light, threshold) {
      var ref1;
      if (dark == null) {
        dark = new Color('black');
      }
      if (light == null) {
        light = new Color('white');
      }
      if (threshold == null) {
        threshold = 0.43;
      }
      if (dark.luma > light.luma) {
        ref1 = [dark, light], light = ref1[0], dark = ref1[1];
      }
      if (base.luma > threshold) {
        return dark;
      } else {
        return light;
      }
    };

    ColorContext.prototype.mixColors = function(color1, color2, amount, round) {
      var color, inverse;
      if (amount == null) {
        amount = 0.5;
      }
      if (round == null) {
        round = Math.floor;
      }
      if (!((color1 != null) && (color2 != null) && !isNaN(amount))) {
        return new Color(0/0, 0/0, 0/0, 0/0);
      }
      inverse = 1 - amount;
      color = new Color;
      color.rgba = [round(color1.red * amount + color2.red * inverse), round(color1.green * amount + color2.green * inverse), round(color1.blue * amount + color2.blue * inverse), color1.alpha * amount + color2.alpha * inverse];
      return color;
    };

    return ColorContext;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2FuZ29hLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi9jb2xvci1jb250ZXh0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsMlBBQUE7SUFBQTs7O0VBQUEsTUFLSSxFQUxKLEVBQ0UsY0FERixFQUNTLG9CQURULEVBQ3NCLHdCQUR0QixFQUN1QyxrQkFEdkMsRUFDa0QsbUJBRGxELEVBRUUsWUFGRixFQUVPLGNBRlAsRUFFYyxnQkFGZCxFQUV1Qix3QkFGdkIsRUFFd0MscUJBRnhDLEVBRXNELHdCQUZ0RCxFQUVzRSxlQUZ0RSxFQUdFLGtCQUhGLEVBR1kscUJBSFosRUFHeUIsWUFIekIsRUFHNkIsWUFIN0IsRUFHaUMsbUJBSGpDLEVBRzRDLHNCQUg1QyxFQUlFLGVBSkYsRUFJUyxlQUpULEVBSWdCLGtCQUpoQixFQUkwQjs7RUFHMUIsTUFBTSxDQUFDLE9BQVAsR0FDTTtJQUNTLHNCQUFDLE9BQUQ7QUFDWCxVQUFBOztRQURZLFVBQVE7OztNQUNwQixJQUFPLGFBQVA7UUFDRSxLQUFBLEdBQVEsT0FBQSxDQUFRLFNBQVI7UUFDUixTQUFBLEdBQVksT0FBQSxDQUFRLGNBQVI7UUFDWixVQUFBLEdBQWEsT0FBQSxDQUFRLGVBQVI7O1VBQ2Isa0JBQW1CLE9BQUEsQ0FBUSxvQkFBUjs7UUFFbkIsT0FHSSxPQUFBLENBQVEsV0FBUixDQUhKLEVBQ0UsY0FERixFQUNPLGtCQURQLEVBQ2Msc0JBRGQsRUFDdUIsc0NBRHZCLEVBQ3dDLGdDQUR4QyxFQUNzRCxvQ0FEdEQsRUFFRSxrQkFGRixFQUVTLHdCQUZULEVBRW1CLDhCQUZuQixFQUVnQyxZQUZoQyxFQUVvQyxZQUZwQyxFQUV3QywwQkFGeEMsRUFFbUQ7UUFHbkQsWUFBWSxDQUFBLFNBQUUsQ0FBQSxTQUFkLEdBQTBCO1FBQzFCLFlBQVksQ0FBQSxTQUFFLENBQUEsS0FBZCxHQUFzQjtRQUN0QixZQUFZ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R0FBSTtNQUNkLEtBQUEsR0FBUSxJQUFJO01BRVosS0FBSyxDQUFDLElBQU4sR0FBYSxDQUNYLEtBQUEsQ0FBTSxNQUFNLENBQUMsR0FBUCxHQUFhLE1BQWIsR0FBc0IsTUFBTSxDQUFDLEdBQVAsR0FBYSxPQUF6QyxDQURXLEVBRVgsS0FBQSxDQUFNLE1BQU0sQ0FBQyxLQUFQLEdBQWUsTUFBZixHQUF3QixNQUFNLENBQUMsS0FBUCxHQUFlLE9BQTdDLENBRlcsRUFHWCxLQUFBLENBQU0sTUFBTSxDQUFDLElBQVAsR0FBYyxNQUFkLEdBQXVCLE1BQU0sQ0FBQyxJQUFQLEdBQWMsT0FBM0MsQ0FIVyxFQUlYLE1BQU0sQ0FBQyxLQUFQLEdBQWUsTUFBZixHQUF3QixNQUFNLENBQUMsS0FBUCxHQUFlLE9BSjVCO2FBT2I7SUFiUzs7Ozs7QUFyVWIiLCJzb3VyY2VzQ29udGVudCI6WyJbXG4gIENvbG9yLCBDb2xvclBhcnNlciwgQ29sb3JFeHByZXNzaW9uLCBTVkdDb2xvcnMsIEJsZW5kTW9kZXMsXG4gIGludCwgZmxvYXQsIHBlcmNlbnQsIG9wdGlvbmFsUGVyY2VudCwgaW50T3JQZXJjZW50LCBmbG9hdE9yUGVyY2VudCwgY29tbWEsXG4gIG5vdFF1b3RlLCBoZXhhZGVjaW1hbCwgcHMsIHBlLCB2YXJpYWJsZXMsIG5hbWVQcmVmaXhlcyxcbiAgc3BsaXQsIGNsYW1wLCBjbGFtcEludCwgc2NvcGVGcm9tRmlsZU5hbWVcbl0gPSBbXVxuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBDb2xvckNvbnRleHRcbiAgY29uc3RydWN0b3I6IChvcHRpb25zPXt9KSAtPlxuICAgIHVubGVzcyBDb2xvcj9cbiAgICAgIENvbG9yID0gcmVxdWlyZSAnLi9jb2xvcidcbiAgICAgIFNWR0NvbG9ycyA9IHJlcXVpcmUgJy4vc3ZnLWNvbG9ycydcbiAgICAgIEJsZW5kTW9kZXMgPSByZXF1aXJlICcuL2JsZW5kLW1vZGVzJ1xuICAgICAgQ29sb3JFeHByZXNzaW9uID89IHJlcXVpcmUgJy4vY29sb3ItZXhwcmVzc2lvbidcblxuICAgICAge1xuICAgICAgICBpbnQsIGZsb2F0LCBwZXJjZW50LCBvcHRpb25hbFBlcmNlbnQsIGludE9yUGVyY2VudCwgZmxvYXRPclBlcmNlbnRcbiAgICAgICAgY29tbWEsIG5vdFF1b3RlLCBoZXhhZGVjaW1hbCwgcHMsIHBlLCB2YXJpYWJsZXMsIG5hbWVQcmVmaXhlc1xuICAgICAgfSA9IHJlcXVpcmUgJy4vcmVnZXhlcydcblxuICAgICAgQ29sb3JDb250ZXh0OjpTVkdDb2xvcnMgPSBTVkdDb2xvcnNcbiAgICAgIENvbG9yQ29udGV4dDo6Q29sb3IgPSBDb2xvclxuICAgICAgQ29sb3JDb250ZXh0OjpCbGVuZE1vZGVzID0gQmxlbmRNb2Rlc1xuICAgICAgQ29sb3JDb250ZXh0OjppbnQgPSBpbnRcbiAgICAgIENvbG9yQ29udGV4dDo6ZmxvYXQgPSBmbG9hdFxuICAgICAgQ29sb3JDb250ZXh0OjpwZXJjZW50ID0gcGVyY2VudFxuICAgICAgQ29sb3JDb250ZXh0OjpvcHRpb25hbFBlcmNlbnQgPSBvcHRpb25hbFBlcmNlbnRcbiAgICAgIENvbG9yQ29udGV4dDo6aW50T3JQZXJjZW50ID0gaW50T3JQZXJjZW50XG4gICAgICBDb2xvckNvbnRleHQ6OmZsb2F0T3JQZXJjZW50ID0gZmxvYXRPclBlcmNlbnRcbiAgICAgIENvbG9yQ29udGV4dDo6Y29tbWEgPSBjb21tYVxuICAgICAgQ29sb3JDb250ZXh0Ojpub3RRdW90ZSA9IG5vdFF1b3RlXG4gICAgICBDb2xvckNvbnRleHQ6OmhleGFkZWNpbWFsID0gaGV4YWRlY2ltYWxcbiAgICAgIENvbG9yQ29udGV4dDo6cHMgPSBwc1xuICAgICAgQ29sb3JDb250ZXh0OjpwZSA9IHBlXG4gICAgICBDb2xvckNvbnRleHQ6OnZhcmlhYmxlc1JFID0gdmFyaWFibGVzXG4gICAgICBDb2xvckNvbnRleHQ6Om5hbWVQcmVmaXhlcyA9IG5hbWVQcmVmaXhlc1xuXG4gICAge3ZhcmlhYmxlcywgY29sb3JWYXJpYWJsZXMsIEByZWZlcmVuY2VWYXJpYWJsZSwgQHJlZmVyZW5jZVBhdGgsIEByb290UGF0aHMsIEBwYXJzZXIsIEBjb2xvclZhcnMsIEB2YXJzLCBAZGVmYXVsdFZhcnMsIEBkZWZhdWx0Q29sb3JWYXJzLCBzb3J0ZWQsIEByZWdpc3RyeSwgQHNhc3NTY29wZVN1ZmZpeH0gPSBvcHRpb25zXG5cbiAgICB2YXJpYWJsZXMgPz0gW11cbiAgICBjb2xvclZhcmlhYmxlcyA/PSBbXVxuICAgIEByb290UGF0aHMgPz0gW11cbiAgICBAcmVmZXJlbmNlUGF0aCA/PSBAcmVmZXJlbmNlVmFyaWFibGUucGF0aCBpZiBAcmVmZXJlbmNlVmFyaWFibGU/XG5cbiAgICBpZiBAc29ydGVkXG4gICAgICBAdmFyaWFibGVzID0gdmFyaWFibGVzXG4gICAgICBAY29sb3JWYXJpYWJsZXMgPSBjb2xvclZhcmlhYmxlc1xuICAgIGVsc2VcbiAgICAgIEB2YXJpYWJsZXMgPSB2YXJpYWJsZXMuc2xpY2UoKS5zb3J0KEBzb3J0UGF0aHMpXG4gICAgICBAY29sb3JWYXJpYWJsZXMgPSBjb2xvclZhcmlhYmxlcy5zbGljZSgpLnNvcnQoQHNvcnRQYXRocylcblxuICAgIHVubGVzcyBAdmFycz9cbiAgICAgIEB2YXJzID0ge31cbiAgICAgIEBjb2xvclZhcnMgPSB7fVxuICAgICAgQGRlZmF1bHRWYXJzID0ge31cbiAgICAgIEBkZWZhdWx0Q29sb3JWYXJzID0ge31cblxuICAgICAgZm9yIHYgaW4gQHZhcmlhYmxlc1xuICAgICAgICBAdmFyc1t2Lm5hbWVdID0gdiB1bmxlc3Mgdi5kZWZhdWx0XG4gICAgICAgIEBkZWZhdWx0VmFyc1t2Lm5hbWVdID0gdiBpZiB2LmRlZmF1bHRcblxuICAgICAgZm9yIHYgaW4gQGNvbG9yVmFyaWFibGVzXG4gICAgICAgIEBjb2xvclZhcnNbdi5uYW1lXSA9IHYgdW5sZXNzIHYuZGVmYXVsdFxuICAgICAgICBAZGVmYXVsdENvbG9yVmFyc1t2Lm5hbWVdID0gdiBpZiB2LmRlZmF1bHRcblxuICAgIGlmIG5vdCBAcmVnaXN0cnkuZ2V0RXhwcmVzc2lvbigncGlnbWVudHM6dmFyaWFibGVzJyk/IGFuZCBAY29sb3JWYXJpYWJsZXMubGVuZ3RoID4gMFxuICAgICAgZXhwciA9IENvbG9yRXhwcmVzc2lvbi5jb2xvckV4cHJlc3Npb25Gb3JDb2xvclZhcmlhYmxlcyhAY29sb3JWYXJpYWJsZXMpXG4gICAgICBAcmVnaXN0cnkuYWRkRXhwcmVzc2lvbihleHByKVxuXG4gICAgdW5sZXNzIEBwYXJzZXI/XG4gICAgICBDb2xvclBhcnNlciA/PSByZXF1aXJlICcuL2NvbG9yLXBhcnNlcidcbiAgICAgIEBwYXJzZXIgPSBuZXcgQ29sb3JQYXJzZXIoQHJlZ2lzdHJ5LCB0aGlzKVxuXG4gICAgQHVzZWRWYXJpYWJsZXMgPSBbXVxuICAgIEByZXNvbHZlZFZhcmlhYmxlcyA9IFtdXG5cbiAgc29ydFBhdGhzOiAoYSxiKSA9PlxuICAgIGlmIEByZWZlcmVuY2VQYXRoP1xuICAgICAgcmV0dXJuIDAgaWYgYS5wYXRoIGlzIGIucGF0aFxuICAgICAgcmV0dXJuIDEgaWYgYS5wYXRoIGlzIEByZWZlcmVuY2VQYXRoXG4gICAgICByZXR1cm4gLTEgaWYgYi5wYXRoIGlzIEByZWZlcmVuY2VQYXRoXG5cbiAgICAgIHJvb3RSZWZlcmVuY2UgPSBAcm9vdFBhdGhGb3JQYXRoKEByZWZlcmVuY2VQYXRoKVxuICAgICAgcm9vdEEgPSBAcm9vdFBhdGhGb3JQYXRoKGEucGF0aClcbiAgICAgIHJvb3RCID0gQHJvb3RQYXRoRm9yUGF0aChiLnBhdGgpXG5cbiAgICAgIHJldHVybiAwIGlmIHJvb3RBIGlzIHJvb3RCXG4gICAgICByZXR1cm4gMSBpZiByb290QSBpcyByb290UmVmZXJlbmNlXG4gICAgICByZXR1cm4gLTEgaWYgcm9vdEIgaXMgcm9vdFJlZmVyZW5jZVxuXG4gICAgICAwXG4gICAgZWxzZVxuICAgICAgMFxuXG4gIHJvb3RQYXRoRm9yUGF0aDogKHBhdGgpIC0+XG4gICAgcmV0dXJuIHJvb3QgZm9yIHJvb3QgaW4gQHJvb3RQYXRocyB3aGVuIHBhdGguaW5kZXhPZihcIiN7cm9vdH0vXCIpIGlzIDBcblxuICBjbG9uZTogLT5cbiAgICBuZXcgQ29sb3JDb250ZXh0KHtcbiAgICAgIEB2YXJpYWJsZXNcbiAgICAgIEBjb2xvclZhcmlhYmxlc1xuICAgICAgQHJlZmVyZW5jZVZhcmlhYmxlXG4gICAgICBAcGFyc2VyXG4gICAgICBAdmFyc1xuICAgICAgQGNvbG9yVmFyc1xuICAgICAgQGRlZmF1bHRWYXJzXG4gICAgICBAZGVmYXVsdENvbG9yVmFyc1xuICAgICAgc29ydGVkOiB0cnVlXG4gICAgfSlcblxuICAjIyAgICAjIyAgICAgIyMgICAgIyMjICAgICMjIyMjIyMjICAgIyMjIyMjXG4gICMjICAgICMjICAgICAjIyAgICMjICMjICAgIyMgICAgICMjICMjICAgICMjXG4gICMjICAgICMjICAgICAjIyAgIyMgICAjIyAgIyMgICAgICMjICMjXG4gICMjICAgICMjICAgICAjIyAjIyAgICAgIyMgIyMjIyMjIyMgICAjIyMjIyNcbiAgIyMgICAgICMjICAgIyMgICMjIyMjIyMjIyAjIyAgICMjICAgICAgICAgIyNcbiAgIyMgICAgICAjIyAjIyAgICMjICAgICAjIyAjIyAgICAjIyAgIyMgICAgIyNcbiAgIyMgICAgICAgIyMjICAgICMjICAgICAjIyAjIyAgICAgIyMgICMjIyMjI1xuXG4gIGNvbnRhaW5zVmFyaWFibGU6ICh2YXJpYWJsZU5hbWUpIC0+IHZhcmlhYmxlTmFtZSBpbiBAZ2V0VmFyaWFibGVzTmFtZXMoKVxuXG4gIGhhc0NvbG9yVmFyaWFibGVzOiAtPiBAY29sb3JWYXJpYWJsZXMubGVuZ3RoID4gMFxuXG4gIGdldFZhcmlhYmxlczogLT4gQHZhcmlhYmxlc1xuXG4gIGdldENvbG9yVmFyaWFibGVzOiAtPiBAY29sb3JWYXJpYWJsZXNcblxuICBnZXRWYXJpYWJsZXNOYW1lczogLT4gQHZhck5hbWVzID89IE9iamVjdC5rZXlzKEB2YXJzKVxuXG4gIGdldFZhcmlhYmxlc0NvdW50OiAtPiBAdmFyQ291bnQgPz0gQGdldFZhcmlhYmxlc05hbWVzKCkubGVuZ3RoXG5cbiAgcmVhZFVzZWRWYXJpYWJsZXM6IC0+XG4gICAgdXNlZFZhcmlhYmxlcyA9IFtdXG4gICAgdXNlZFZhcmlhYmxlcy5wdXNoIHYgZm9yIHYgaW4gQHVzZWRWYXJpYWJsZXMgd2hlbiB2IG5vdCBpbiB1c2VkVmFyaWFibGVzXG4gICAgQHVzZWRWYXJpYWJsZXMgPSBbXVxuICAgIEByZXNvbHZlZFZhcmlhYmxlcyA9IFtdXG4gICAgdXNlZFZhcmlhYmxlc1xuXG4gICMjICAgICMjICAgICAjIyAgICAjIyMgICAgIyMgICAgICAgIyMgICAgICMjICMjIyMjIyMjICAjIyMjIyNcbiAgIyMgICAgIyMgICAgICMjICAgIyMgIyMgICAjIyAgICAgICAjIyAgICAgIyMgIyMgICAgICAgIyMgICAgIyNcbiAgIyMgICAgIyMgICAgICMjICAjIyAgICMjICAjIyAgICAgICAjIyAgICAgIyMgIyMgICAgICAgIyNcbiAgIyMgICAgIyMgICAgICMjICMjICAgICAjIyAjIyAgICAgICAjIyAgICAgIyMgIyMjIyMjICAgICMjIyMjI1xuICAjIyAgICAgIyMgICAjIyAgIyMjIyMjIyMjICMjICAgICAgICMjICAgICAjIyAjIyAgICAgICAgICAgICAjI1xuICAjIyAgICAgICMjICMjICAgIyMgICAgICMjICMjICAgICAgICMjICAgICAjIyAjIyAgICAgICAjIyAgICAjI1xuICAjIyAgICAgICAjIyMgICAgIyMgICAgICMjICMjIyMjIyMjICAjIyMjIyMjICAjIyMjIyMjIyAgIyMjIyMjXG5cbiAgZ2V0VmFsdWU6ICh2YWx1ZSkgLT5cbiAgICBbcmVhbFZhbHVlLCBsYXN0UmVhbFZhbHVlXSA9IFtdXG4gICAgbG9va2VkVXBWYWx1ZXMgPSBbdmFsdWVdXG5cbiAgICB3aGlsZSAocmVhbFZhbHVlID0gQHZhcnNbdmFsdWVdPy52YWx1ZSkgYW5kIHJlYWxWYWx1ZSBub3QgaW4gbG9va2VkVXBWYWx1ZXNcbiAgICAgIEB1c2VkVmFyaWFibGVzLnB1c2godmFsdWUpXG4gICAgICB2YWx1ZSA9IGxhc3RSZWFsVmFsdWUgPSByZWFsVmFsdWVcbiAgICAgIGxvb2tlZFVwVmFsdWVzLnB1c2gocmVhbFZhbHVlKVxuXG4gICAgaWYgcmVhbFZhbHVlIGluIGxvb2tlZFVwVmFsdWVzIHRoZW4gdW5kZWZpbmVkIGVsc2UgbGFzdFJlYWxWYWx1ZVxuXG4gIHJlYWRDb2xvckV4cHJlc3Npb246ICh2YWx1ZSkgLT5cbiAgICBpZiBAY29sb3JWYXJzW3ZhbHVlXT9cbiAgICAgIEB1c2VkVmFyaWFibGVzLnB1c2godmFsdWUpXG4gICAgICBAY29sb3JWYXJzW3ZhbHVlXS52YWx1ZVxuICAgIGVsc2UgaWYgQGRlZmF1bHRDb2xvclZhcnNbdmFsdWVdP1xuICAgICAgQHVzZWRWYXJpYWJsZXMucHVzaCh2YWx1ZSlcbiAgICAgIEBkZWZhdWx0Q29sb3JWYXJzW3ZhbHVlXS52YWx1ZVxuICAgIGVsc2VcbiAgICAgIHZhbHVlXG5cbiAgcmVhZENvbG9yOiAodmFsdWUsIGtlZXBBbGxWYXJpYWJsZXM9ZmFsc2UpIC0+XG4gICAgcmV0dXJuIGlmIHZhbHVlIGluIEB1c2VkVmFyaWFibGVzIGFuZCBub3QgKHZhbHVlIGluIEByZXNvbHZlZFZhcmlhYmxlcylcblxuICAgIHJlYWxWYWx1ZSA9IEByZWFkQ29sb3JFeHByZXNzaW9uKHZhbHVlKVxuXG4gICAgcmV0dXJuIGlmIG5vdCByZWFsVmFsdWU/IG9yIHJlYWxWYWx1ZSBpbiBAdXNlZFZhcmlhYmxlc1xuXG4gICAgc2NvcGUgPSBpZiBAY29sb3JWYXJzW3ZhbHVlXT9cbiAgICAgIEBzY29wZUZyb21GaWxlTmFtZShAY29sb3JWYXJzW3ZhbHVlXS5wYXRoKVxuICAgIGVsc2VcbiAgICAgICcqJ1xuXG4gICAgQHVzZWRWYXJpYWJsZXMgPSBAdXNlZFZhcmlhYmxlcy5maWx0ZXIgKHYpIC0+IHYgaXNudCByZWFsVmFsdWVcbiAgICByZXN1bHQgPSBAcGFyc2VyLnBhcnNlKHJlYWxWYWx1ZSwgc2NvcGUsIGZhbHNlKVxuXG4gICAgaWYgcmVzdWx0P1xuICAgICAgaWYgcmVzdWx0LmludmFsaWQgYW5kIEBkZWZhdWx0Q29sb3JWYXJzW3JlYWxWYWx1ZV0/XG4gICAgICAgIHJlc3VsdCA9IEByZWFkQ29sb3IoQGRlZmF1bHRDb2xvclZhcnNbcmVhbFZhbHVlXS52YWx1ZSlcbiAgICAgICAgdmFsdWUgPSByZWFsVmFsdWVcblxuICAgIGVsc2UgaWYgQGRlZmF1bHRDb2xvclZhcnNbdmFsdWVdP1xuICAgICAgQHVzZWRWYXJpYWJsZXMucHVzaCh2YWx1ZSlcbiAgICAgIHJlc3VsdCA9IEByZWFkQ29sb3IoQGRlZmF1bHRDb2xvclZhcnNbdmFsdWVdLnZhbHVlKVxuXG4gICAgZWxzZVxuICAgICAgQHVzZWRWYXJpYWJsZXMucHVzaCh2YWx1ZSkgaWYgQHZhcnNbdmFsdWVdP1xuXG4gICAgaWYgcmVzdWx0P1xuICAgICAgQHJlc29sdmVkVmFyaWFibGVzLnB1c2godmFsdWUpXG4gICAgICBpZiBrZWVwQWxsVmFyaWFibGVzIG9yIHZhbHVlIG5vdCBpbiBAdXNlZFZhcmlhYmxlc1xuICAgICAgICByZXN1bHQudmFyaWFibGVzID0gKHJlc3VsdC52YXJpYWJsZXMgPyBbXSkuY29uY2F0KEByZWFkVXNlZFZhcmlhYmxlcygpKVxuXG4gICAgcmV0dXJuIHJlc3VsdFxuXG4gIHNjb3BlRnJvbUZpbGVOYW1lOiAocGF0aCkgLT5cbiAgICBzY29wZUZyb21GaWxlTmFtZSA/PSByZXF1aXJlICcuL3Njb3BlLWZyb20tZmlsZS1uYW1lJ1xuXG4gICAgc2NvcGUgPSBzY29wZUZyb21GaWxlTmFtZShwYXRoKVxuXG4gICAgaWYgc2NvcGUgaXMgJ3Nhc3MnIG9yIHNjb3BlIGlzICdzY3NzJ1xuICAgICAgc2NvcGUgPSBbc2NvcGUsIEBzYXNzU2NvcGVTdWZmaXhdLmpvaW4oJzonKVxuXG4gICAgc2NvcGVcblxuICByZWFkRmxvYXQ6ICh2YWx1ZSkgLT5cbiAgICByZXMgPSBwYXJzZUZsb2F0KHZhbHVlKVxuXG4gICAgaWYgaXNOYU4ocmVzKSBhbmQgQHZhcnNbdmFsdWVdP1xuICAgICAgQHVzZWRWYXJpYWJsZXMucHVzaCB2YWx1ZVxuICAgICAgcmVzID0gQHJlYWRGbG9hdChAdmFyc1t2YWx1ZV0udmFsdWUpXG5cbiAgICBpZiBpc05hTihyZXMpIGFuZCBAZGVmYXVsdFZhcnNbdmFsdWVdP1xuICAgICAgQHVzZWRWYXJpYWJsZXMucHVzaCB2YWx1ZVxuICAgICAgcmVzID0gQHJlYWRGbG9hdChAZGVmYXVsdFZhcnNbdmFsdWVdLnZhbHVlKVxuXG4gICAgcmVzXG5cbiAgcmVhZEludDogKHZhbHVlLCBiYXNlPTEwKSAtPlxuICAgIHJlcyA9IHBhcnNlSW50KHZhbHVlLCBiYXNlKVxuXG4gICAgaWYgaXNOYU4ocmVzKSBhbmQgQHZhcnNbdmFsdWVdP1xuICAgICAgQHVzZWRWYXJpYWJsZXMucHVzaCB2YWx1ZVxuICAgICAgcmVzID0gQHJlYWRJbnQoQHZhcnNbdmFsdWVdLnZhbHVlKVxuXG4gICAgaWYgaXNOYU4ocmVzKSBhbmQgQGRlZmF1bHRWYXJzW3ZhbHVlXT9cbiAgICAgIEB1c2VkVmFyaWFibGVzLnB1c2ggdmFsdWVcbiAgICAgIHJlcyA9IEByZWFkSW50KEBkZWZhdWx0VmFyc1t2YWx1ZV0udmFsdWUpXG5cbiAgICByZXNcblxuICByZWFkUGVyY2VudDogKHZhbHVlKSAtPlxuICAgIGlmIG5vdCAvXFxkKy8udGVzdCh2YWx1ZSkgYW5kIEB2YXJzW3ZhbHVlXT9cbiAgICAgIEB1c2VkVmFyaWFibGVzLnB1c2ggdmFsdWVcbiAgICAgIHZhbHVlID0gQHJlYWRQZXJjZW50KEB2YXJzW3ZhbHVlXS52YWx1ZSlcblxuICAgIGlmIG5vdCAvXFxkKy8udGVzdCh2YWx1ZSkgYW5kIEBkZWZhdWx0VmFyc1t2YWx1ZV0/XG4gICAgICBAdXNlZFZhcmlhYmxlcy5wdXNoIHZhbHVlXG4gICAgICB2YWx1ZSA9IEByZWFkUGVyY2VudChAZGVmYXVsdFZhcnNbdmFsdWVdLnZhbHVlKVxuXG4gICAgTWF0aC5yb3VuZChwYXJzZUZsb2F0KHZhbHVlKSAqIDIuNTUpXG5cbiAgcmVhZEludE9yUGVyY2VudDogKHZhbHVlKSAtPlxuICAgIGlmIG5vdCAvXFxkKy8udGVzdCh2YWx1ZSkgYW5kIEB2YXJzW3ZhbHVlXT9cbiAgICAgIEB1c2VkVmFyaWFibGVzLnB1c2ggdmFsdWVcbiAgICAgIHZhbHVlID0gQHJlYWRJbnRPclBlcmNlbnQoQHZhcnNbdmFsdWVdLnZhbHVlKVxuXG4gICAgaWYgbm90IC9cXGQrLy50ZXN0KHZhbHVlKSBhbmQgQGRlZmF1bHRWYXJzW3ZhbHVlXT9cbiAgICAgIEB1c2VkVmFyaWFibGVzLnB1c2ggdmFsdWVcbiAgICAgIHZhbHVlID0gQHJlYWRJbnRPclBlcmNlbnQoQGRlZmF1bHRWYXJzW3ZhbHVlXS52YWx1ZSlcblxuICAgIHJldHVybiBOYU4gdW5sZXNzIHZhbHVlP1xuICAgIHJldHVybiB2YWx1ZSBpZiB0eXBlb2YgdmFsdWUgaXMgJ251bWJlcidcblxuICAgIGlmIHZhbHVlLmluZGV4T2YoJyUnKSBpc250IC0xXG4gICAgICByZXMgPSBNYXRoLnJvdW5kKHBhcnNlRmxvYXQodmFsdWUpICogMi41NSlcbiAgICBlbHNlXG4gICAgICByZXMgPSBwYXJzZUludCh2YWx1ZSlcblxuICAgIHJlc1xuXG4gIHJlYWRGbG9hdE9yUGVyY2VudDogKHZhbHVlKSAtPlxuICAgIGlmIG5vdCAvXFxkKy8udGVzdCh2YWx1ZSkgYW5kIEB2YXJzW3ZhbHVlXT9cbiAgICAgIEB1c2VkVmFyaWFibGVzLnB1c2ggdmFsdWVcbiAgICAgIHZhbHVlID0gQHJlYWRGbG9hdE9yUGVyY2VudChAdmFyc1t2YWx1ZV0udmFsdWUpXG5cbiAgICBpZiBub3QgL1xcZCsvLnRlc3QodmFsdWUpIGFuZCBAZGVmYXVsdFZhcnNbdmFsdWVdP1xuICAgICAgQHVzZWRWYXJpYWJsZXMucHVzaCB2YWx1ZVxuICAgICAgdmFsdWUgPSBAcmVhZEZsb2F0T3JQZXJjZW50KEBkZWZhdWx0VmFyc1t2YWx1ZV0udmFsdWUpXG5cbiAgICByZXR1cm4gTmFOIHVubGVzcyB2YWx1ZT9cbiAgICByZXR1cm4gdmFsdWUgaWYgdHlwZW9mIHZhbHVlIGlzICdudW1iZXInXG5cbiAgICBpZiB2YWx1ZS5pbmRleE9mKCclJykgaXNudCAtMVxuICAgICAgcmVzID0gcGFyc2VGbG9hdCh2YWx1ZSkgLyAxMDBcbiAgICBlbHNlXG4gICAgICByZXMgPSBwYXJzZUZsb2F0KHZhbHVlKVxuICAgICAgcmVzID0gcmVzIC8gMTAwIGlmIHJlcyA+IDFcbiAgICAgIHJlc1xuXG4gICAgcmVzXG5cbiAgIyMgICAgIyMgICAgICMjICMjIyMjIyMjICMjIyMgIyMgICAgICAgICMjIyMjI1xuICAjIyAgICAjIyAgICAgIyMgICAgIyMgICAgICMjICAjIyAgICAgICAjIyAgICAjI1xuICAjIyAgICAjIyAgICAgIyMgICAgIyMgICAgICMjICAjIyAgICAgICAjI1xuICAjIyAgICAjIyAgICAgIyMgICAgIyMgICAgICMjICAjIyAgICAgICAgIyMjIyMjXG4gICMjICAgICMjICAgICAjIyAgICAjIyAgICAgIyMgICMjICAgICAgICAgICAgICMjXG4gICMjICAgICMjICAgICAjIyAgICAjIyAgICAgIyMgICMjICAgICAgICMjICAgICMjXG4gICMjICAgICAjIyMjIyMjICAgICAjIyAgICAjIyMjICMjIyMjIyMjICAjIyMjIyNcblxuICBzcGxpdDogKHZhbHVlKSAtPlxuICAgIHtzcGxpdCwgY2xhbXAsIGNsYW1wSW50fSA9IHJlcXVpcmUgJy4vdXRpbHMnIHVubGVzcyBzcGxpdD9cbiAgICBzcGxpdCh2YWx1ZSlcblxuICBjbGFtcDogKHZhbHVlKSAtPlxuICAgIHtzcGxpdCwgY2xhbXAsIGNsYW1wSW50fSA9IHJlcXVpcmUgJy4vdXRpbHMnIHVubGVzcyBjbGFtcD9cbiAgICBjbGFtcCh2YWx1ZSlcblxuICBjbGFtcEludDogKHZhbHVlKSAtPlxuICAgIHtzcGxpdCwgY2xhbXAsIGNsYW1wSW50fSA9IHJlcXVpcmUgJy4vdXRpbHMnIHVubGVzcyBjbGFtcEludD9cbiAgICBjbGFtcEludCh2YWx1ZSlcblxuICBpc0ludmFsaWQ6IChjb2xvcikgLT4gbm90IENvbG9yLmlzVmFsaWQoY29sb3IpXG5cbiAgcmVhZFBhcmFtOiAocGFyYW0sIGJsb2NrKSAtPlxuICAgIHJlID0gLy8vXFwkKFxcdyspOlxccyooKC0/I3tAZmxvYXR9KXwje0B2YXJpYWJsZXNSRX0pLy8vXG4gICAgaWYgcmUudGVzdChwYXJhbSlcbiAgICAgIFtfLCBuYW1lLCB2YWx1ZV0gPSByZS5leGVjKHBhcmFtKVxuXG4gICAgICBibG9jayhuYW1lLCB2YWx1ZSlcblxuICBjb250cmFzdDogKGJhc2UsIGRhcms9bmV3IENvbG9yKCdibGFjaycpLCBsaWdodD1uZXcgQ29sb3IoJ3doaXRlJyksIHRocmVzaG9sZD0wLjQzKSAtPlxuICAgIFtsaWdodCwgZGFya10gPSBbZGFyaywgbGlnaHRdIGlmIGRhcmsubHVtYSA+IGxpZ2h0Lmx1bWFcblxuICAgIGlmIGJhc2UubHVtYSA+IHRocmVzaG9sZFxuICAgICAgZGFya1xuICAgIGVsc2VcbiAgICAgIGxpZ2h0XG5cbiAgbWl4Q29sb3JzOiAoY29sb3IxLCBjb2xvcjIsIGFtb3VudD0wLjUsIHJvdW5kPU1hdGguZmxvb3IpIC0+XG4gICAgcmV0dXJuIG5ldyBDb2xvcihOYU4sIE5hTiwgTmFOLCBOYU4pIHVubGVzcyBjb2xvcjE/IGFuZCBjb2xvcjI/IGFuZCBub3QgaXNOYU4oYW1vdW50KVxuXG4gICAgaW52ZXJzZSA9IDEgLSBhbW91bnRcbiAgICBjb2xvciA9IG5ldyBDb2xvclxuXG4gICAgY29sb3IucmdiYSA9IFtcbiAgICAgIHJvdW5kKGNvbG9yMS5yZWQgKiBhbW91bnQgKyBjb2xvcjIucmVkICogaW52ZXJzZSlcbiAgICAgIHJvdW5kKGNvbG9yMS5ncmVlbiAqIGFtb3VudCArIGNvbG9yMi5ncmVlbiAqIGludmVyc2UpXG4gICAgICByb3VuZChjb2xvcjEuYmx1ZSAqIGFtb3VudCArIGNvbG9yMi5ibHVlICogaW52ZXJzZSlcbiAgICAgIGNvbG9yMS5hbHBoYSAqIGFtb3VudCArIGNvbG9yMi5hbHBoYSAqIGludmVyc2VcbiAgICBdXG5cbiAgICBjb2xvclxuXG4gICMjICAgICMjIyMjIyMjICAjIyMjIyMjIyAgIyMjIyMjICAgIyMjIyMjIyMgIyMgICAgICMjICMjIyMjIyMjXG4gICMjICAgICMjICAgICAjIyAjIyAgICAgICAjIyAgICAjIyAgIyMgICAgICAgICMjICAgIyMgICMjICAgICAjI1xuICAjIyAgICAjIyAgICAgIyMgIyMgICAgICAgIyMgICAgICAgICMjICAgICAgICAgIyMgIyMgICAjIyAgICAgIyNcbiAgIyMgICAgIyMjIyMjIyMgICMjIyMjIyAgICMjICAgIyMjIyAjIyMjIyMgICAgICAjIyMgICAgIyMjIyMjIyNcbiAgIyMgICAgIyMgICAjIyAgICMjICAgICAgICMjICAgICMjICAjIyAgICAgICAgICMjICMjICAgIyNcbiAgIyMgICAgIyMgICAgIyMgICMjICAgICAgICMjICAgICMjICAjIyAgICAgICAgIyMgICAjIyAgIyNcbiAgIyMgICAgIyMgICAgICMjICMjIyMjIyMjICAjIyMjIyMgICAjIyMjIyMjIyAjIyAgICAgIyMgIyNcbiJdfQ==
