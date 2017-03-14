(function() {
  var Color, ColorExpression, createVariableRegExpString, ref;

  ref = [], createVariableRegExpString = ref[0], Color = ref[1];

  module.exports = ColorExpression = (function() {
    ColorExpression.colorExpressionForContext = function(context) {
      return this.colorExpressionForColorVariables(context.getColorVariables());
    };

    ColorExpression.colorExpressionRegexpForColorVariables = function(colorVariables) {
      if (createVariableRegExpString == null) {
        createVariableRegExpString = require('./regexes').createVariableRegExpString;
      }
      return createVariableRegExpString(colorVariables);
    };

    ColorExpression.colorExpressionForColorVariables = function(colorVariables) {
      var paletteRegexpString;
      paletteRegexpString = this.colorExpressionRegexpForColorVariables(colorVariables);
      return new ColorExpression({
        name: 'pigments:variables',
        regexpString: paletteRegexpString,
        scopes: ['*'],
        priority: 1,
        handle: function(match, expression, context) {
          var _, baseColor, evaluated, name;
          _ = match[0], _ = match[1], name = match[2];
          if (name == null) {
            name = match[0];
          }
          evaluated = context.readColorExpression(name);
          if (evaluated === name) {
            return this.invalid = true;
          }
          baseColor = context.readColor(evaluated);
          this.colorExpression = name;
          this.variables = baseColor != null ? baseColor.variables : void 0;
          if (context.isInvalid(baseColor)) {
            return this.invalid = true;
          }
          return this.rgba = baseColor.rgba;
        }
      });
    };

    function ColorExpression(arg) {
      this.name = arg.name, this.regexpString = arg.regexpString, this.scopes = arg.scopes, this.priority = arg.priority, this.handle = arg.handle;
      this.regexp = new RegExp("^" + this.regexpString + "$");
    }

    ColorExpression.prototype.match = function(expression) {
      return this.regexp.test(expression);
    };

    ColorExpression.prototype.parse = function(expression, context) {
      var color;
      if (!this.match(expression)) {
        return null;
      }
      if (Color == null) {
        Color = require('./color');
      }
      color = new Color();
      color.colorExpression = expression;
      color.expressionHandler = this.name;
      this.handle.call(color, this.regexp.exec(expression), expression, context);
      return color;
    };

    ColorExpression.prototype.search = function(text, start) {
      var lastIndex, match, range, re, ref1, results;
      if (start == null) {
        start = 0;
      }
      results = void 0;
      re = new RegExp(this.regexpString, 'g');
      re.lastIndex = start;
      if (ref1 = re.exec(text), match = ref1[0], ref1) {
        lastIndex = re.lastIndex;
        range = [lastIndex - match.length, lastIndex];
        results = {
          range: range,
          match: text.slice(range[0], range[1])
        };
      }
      return results;
    };

    return ColorExpression;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2FuZ29hLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi9jb2xvci1leHByZXNzaW9uLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBc0MsRUFBdEMsRUFBQyxtQ0FBRCxFQUE2Qjs7RUFFN0IsTUFBTSxDQUFDLE9BQVAsR0FDTTtJQUNKLGVBQUMsQ0FBQSx5QkFBRCxHQUE0QixTQUFDLE9BQUQ7YUFDMUIsSUFBQyxDQUFBLGdDQUFELENBQWtDLE9BQU8sQ0FBQyxpQkFBUixDQUFBLENBQWxDO0lBRDBCOztJQUc1QixlQUFDLENBQUEsc0NBQUQsR0FBeUMsU0FBQyxjQUFEO01BQ3ZDLElBQU8sa0NBQVA7UUFDRyw2QkFBOEIsT0FBQSxDQUFRLFdBQVIsNkJBRGpDOzthQUdBLDBCQUFBLENBQTJCLGNBQTNCO0lBSnVDOztJQU16QyxlQUFDLENBQUEsZ0NBQUQsR0FBbUMsU0FBQyxjQUFEO0FBQ2pDLFVBQUE7TUFBQSxtQkFBQSxHQUFzQixJQUFDLENBQUEsc0NBQUQsQ0FBd0MsY0FBeEM7YUFFbEIsSUFBQSxlQUFBLENBQ0Y7UUFBQSxJQUFBLEVBQU0sb0JBQU47UUFDQSxZQUFBLEVBQWMsbUJBRGQ7UUFFQSxNQUFBLEVBQVEsQ0FBQyxHQUFELENBRlI7UUFHQSxRQUFBLEVBQVUsQ0FIVjtRQUlBLE1BQUEsRUFBUSxTQUFDLEtBQUQsRUFBUSxVQUFSLEVBQW9CLE9BQXBCO0FBQ04sY0FBQTtVQUFDLFlBQUQsRUFBSSxZQUFKLEVBQU07VUFFTixJQUF1QixZQUF2QjtZQUFBLElBQUEsR0FBTyxLQUFNLENBQUEsQ0FBQSxFQUFiOztVQUVBLFNBQUEsR0FBWSxPQUFPLENBQUMsbUJBQVIsQ0FBNEIsSUFBNUI7VUFDWixJQUEwQixTQUFBLEtBQWEsSUFBdkM7QUFBQSxtQkFBTyxJQUFDLENBQUEsT0FBRCxHQUFXLEtBQWxCOztVQUVBLFNBQUEsR0FBWSxPQUFPLENBQUMsU0FBUixDQUFrQixTQUFsQjtVQUNaLElBQUMsQ0FBQSxlQUFELEdBQW1CO1VBQ25CLElBQUMsQ0FBQSxTQUFELHVCQUFhLFNBQVMsQ0FBRTtVQUV4QixJQUEwQixPQUFPLENBQUMsU0FBUixDQUFrQixTQUFsQixDQUExQjtBQUFBLG1CQUFPLElBQUMsQ0FBQSxPQUFELEdBQVcsS0FBbEI7O2lCQUVBLElBQUMsQ0FBQSxJQUFELEdBQVEsU0FBUyxDQUFDO1FBZFosQ0FKUjtPQURFO0lBSDZCOztJQXdCdEIseUJBQUMsR0FBRDtNQUFFLElBQUMsQ0FBQSxXQUFBLE1BQU0sSUFBQyxDQUFBLG1CQUFBLGNBQWMsSUFBQyxDQUFBLGFBQUEsUUFBUSxJQUFDLENBQUEsZUFBQSxVQUFVLElBQUMsQ0FBQSxhQUFBO01BQ3hELElBQUMsQ0FBQSxNQUFELEdBQWMsSUFBQSxNQUFBLENBQU8sR0FBQSxHQUFJLElBQUMsQ0FBQSxZQUFMLEdBQWtCLEdBQXpCO0lBREg7OzhCQUdiLEtBQUEsR0FBTyxTQUFDLFVBQUQ7YUFBZ0IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFSLENBQWEsVUFBYjtJQUFoQjs7OEJBRVAsS0FBQSxHQUFPLFNBQUMsVUFBRCxFQUFhLE9BQWI7QUFDTCxVQUFBO01BQUEsSUFBQSxDQUFtQixJQUFDLENBQUEsS0FBRCxDQUFPLFVBQVAsQ0FBbkI7QUFBQSxlQUFPLEtBQVA7OztRQUVBLFFBQVMsT0FBQSxDQUFRLFNBQVI7O01BRVQsS0FBQSxHQUFZLElBQUEsS0FBQSxDQUFBO01BQ1osS0FBSyxDQUFDLGVBQU4sR0FBd0I7TUFDeEIsS0FBSyxDQUFDLGlCQUFOLEdBQTBCLElBQUMsQ0FBQTtNQUMzQixJQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsQ0FBYSxLQUFiLEVBQW9CLElBQUMsQ0FBQSxNQUFNLENBQUMsSUFBUixDQUFhLFVBQWIsQ0FBcEIsRUFBOEMsVUFBOUMsRUFBMEQsT0FBMUQ7YUFDQTtJQVRLOzs4QkFXUCxNQUFBLEdBQVEsU0FBQyxJQUFELEVBQU8sS0FBUDtBQUNOLFVBQUE7O1FBRGEsUUFBTTs7TUFDbkIsT0FBQSxHQUFVO01BQ1YsRUFBQSxHQUFTLElBQUEsTUFBQSxDQUFPLElBQUMsQ0FBQSxZQUFSLEVBQXNCLEdBQXRCO01BQ1QsRUFBRSxDQUFDLFNBQUgsR0FBZTtNQUNmLElBQUcsT0FBVSxFQUFFLENBQUMsSUFBSCxDQUFRLElBQVIsQ0FBVixFQUFDLGVBQUQsRUFBQSxJQUFIO1FBQ0csWUFBYTtRQUNkLEtBQUEsR0FBUSxDQUFDLFNBQUEsR0FBWSxLQUFLLENBQUMsTUFBbkIsRUFBMkIsU0FBM0I7UUFDUixPQUFBLEdBQ0U7VUFBQSxLQUFBLEVBQU8sS0FBUDtVQUNBLEtBQUEsRUFBTyxJQUFLLDBCQURaO1VBSko7O2FBT0E7SUFYTTs7Ozs7QUFyRFYiLCJzb3VyY2VzQ29udGVudCI6WyJbY3JlYXRlVmFyaWFibGVSZWdFeHBTdHJpbmcsIENvbG9yXSA9IFtdXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIENvbG9yRXhwcmVzc2lvblxuICBAY29sb3JFeHByZXNzaW9uRm9yQ29udGV4dDogKGNvbnRleHQpIC0+XG4gICAgQGNvbG9yRXhwcmVzc2lvbkZvckNvbG9yVmFyaWFibGVzKGNvbnRleHQuZ2V0Q29sb3JWYXJpYWJsZXMoKSlcblxuICBAY29sb3JFeHByZXNzaW9uUmVnZXhwRm9yQ29sb3JWYXJpYWJsZXM6IChjb2xvclZhcmlhYmxlcykgLT5cbiAgICB1bmxlc3MgY3JlYXRlVmFyaWFibGVSZWdFeHBTdHJpbmc/XG4gICAgICB7Y3JlYXRlVmFyaWFibGVSZWdFeHBTdHJpbmd9ID0gcmVxdWlyZSAnLi9yZWdleGVzJ1xuXG4gICAgY3JlYXRlVmFyaWFibGVSZWdFeHBTdHJpbmcoY29sb3JWYXJpYWJsZXMpXG5cbiAgQGNvbG9yRXhwcmVzc2lvbkZvckNvbG9yVmFyaWFibGVzOiAoY29sb3JWYXJpYWJsZXMpIC0+XG4gICAgcGFsZXR0ZVJlZ2V4cFN0cmluZyA9IEBjb2xvckV4cHJlc3Npb25SZWdleHBGb3JDb2xvclZhcmlhYmxlcyhjb2xvclZhcmlhYmxlcylcblxuICAgIG5ldyBDb2xvckV4cHJlc3Npb25cbiAgICAgIG5hbWU6ICdwaWdtZW50czp2YXJpYWJsZXMnXG4gICAgICByZWdleHBTdHJpbmc6IHBhbGV0dGVSZWdleHBTdHJpbmdcbiAgICAgIHNjb3BlczogWycqJ11cbiAgICAgIHByaW9yaXR5OiAxXG4gICAgICBoYW5kbGU6IChtYXRjaCwgZXhwcmVzc2lvbiwgY29udGV4dCkgLT5cbiAgICAgICAgW18sIF8sbmFtZV0gPSBtYXRjaFxuXG4gICAgICAgIG5hbWUgPSBtYXRjaFswXSB1bmxlc3MgbmFtZT9cblxuICAgICAgICBldmFsdWF0ZWQgPSBjb250ZXh0LnJlYWRDb2xvckV4cHJlc3Npb24obmFtZSlcbiAgICAgICAgcmV0dXJuIEBpbnZhbGlkID0gdHJ1ZSBpZiBldmFsdWF0ZWQgaXMgbmFtZVxuXG4gICAgICAgIGJhc2VDb2xvciA9IGNvbnRleHQucmVhZENvbG9yKGV2YWx1YXRlZClcbiAgICAgICAgQGNvbG9yRXhwcmVzc2lvbiA9IG5hbWVcbiAgICAgICAgQHZhcmlhYmxlcyA9IGJhc2VDb2xvcj8udmFyaWFibGVzXG5cbiAgICAgICAgcmV0dXJuIEBpbnZhbGlkID0gdHJ1ZSBpZiBjb250ZXh0LmlzSW52YWxpZChiYXNlQ29sb3IpXG5cbiAgICAgICAgQHJnYmEgPSBiYXNlQ29sb3IucmdiYVxuXG4gIGNvbnN0cnVjdG9yOiAoe0BuYW1lLCBAcmVnZXhwU3RyaW5nLCBAc2NvcGVzLCBAcHJpb3JpdHksIEBoYW5kbGV9KSAtPlxuICAgIEByZWdleHAgPSBuZXcgUmVnRXhwKFwiXiN7QHJlZ2V4cFN0cmluZ30kXCIpXG5cbiAgbWF0Y2g6IChleHByZXNzaW9uKSAtPiBAcmVnZXhwLnRlc3QgZXhwcmVzc2lvblxuXG4gIHBhcnNlOiAoZXhwcmVzc2lvbiwgY29udGV4dCkgLT5cbiAgICByZXR1cm4gbnVsbCB1bmxlc3MgQG1hdGNoKGV4cHJlc3Npb24pXG5cbiAgICBDb2xvciA/PSByZXF1aXJlICcuL2NvbG9yJ1xuXG4gICAgY29sb3IgPSBuZXcgQ29sb3IoKVxuICAgIGNvbG9yLmNvbG9yRXhwcmVzc2lvbiA9IGV4cHJlc3Npb25cbiAgICBjb2xvci5leHByZXNzaW9uSGFuZGxlciA9IEBuYW1lXG4gICAgQGhhbmRsZS5jYWxsKGNvbG9yLCBAcmVnZXhwLmV4ZWMoZXhwcmVzc2lvbiksIGV4cHJlc3Npb24sIGNvbnRleHQpXG4gICAgY29sb3JcblxuICBzZWFyY2g6ICh0ZXh0LCBzdGFydD0wKSAtPlxuICAgIHJlc3VsdHMgPSB1bmRlZmluZWRcbiAgICByZSA9IG5ldyBSZWdFeHAoQHJlZ2V4cFN0cmluZywgJ2cnKVxuICAgIHJlLmxhc3RJbmRleCA9IHN0YXJ0XG4gICAgaWYgW21hdGNoXSA9IHJlLmV4ZWModGV4dClcbiAgICAgIHtsYXN0SW5kZXh9ID0gcmVcbiAgICAgIHJhbmdlID0gW2xhc3RJbmRleCAtIG1hdGNoLmxlbmd0aCwgbGFzdEluZGV4XVxuICAgICAgcmVzdWx0cyA9XG4gICAgICAgIHJhbmdlOiByYW5nZVxuICAgICAgICBtYXRjaDogdGV4dFtyYW5nZVswXS4uLnJhbmdlWzFdXVxuXG4gICAgcmVzdWx0c1xuIl19
