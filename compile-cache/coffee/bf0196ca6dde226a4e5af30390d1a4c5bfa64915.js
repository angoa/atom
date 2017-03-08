(function() {
  var indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  module.exports = function() {
    var DEFINITIONS, VARIABLE_PATTERN, VARIABLE_TYPES, path;
    path = require('path');
    VARIABLE_PATTERN = '\\{{ VARIABLE }}[\\s]*[:=][\\s]*([^\\;\\n]+)[\\;|\\n]';
    VARIABLE_TYPES = [
      {
        type: 'sass',
        extensions: ['.scss', '.sass'],
        regExp: /([\$])([\w0-9-_]+)/i
      }, {
        type: 'less',
        extensions: ['.less'],
        regExp: /([\@])([\w0-9-_]+)/i
      }, {
        type: 'stylus',
        extensions: ['.stylus', '.styl'],
        regExp: /([\$])([\w0-9-_]+)/i
      }
    ];
    DEFINITIONS = {};
    return {
      find: function(string, pathName) {
        var SmartVariable, _match, _matches, _variables, extensions, fn, j, k, len, len1, ref, ref1, regExp, type;
        SmartVariable = this;
        _variables = [];
        for (j = 0, len = VARIABLE_TYPES.length; j < len; j++) {
          ref = VARIABLE_TYPES[j], type = ref.type, extensions = ref.extensions, regExp = ref.regExp;
          _matches = string.match(new RegExp(regExp.source, 'ig'));
          if (!_matches) {
            continue;
          }
          if (pathName) {
            if (ref1 = path.extname(pathName), indexOf.call(extensions, ref1) < 0) {
              continue;
            }
          }
          fn = function(type, extensions, _match) {
            var _index;
            if ((_index = string.indexOf(_match)) === -1) {
              return;
            }
            _variables.push({
              match: _match,
              type: type,
              extensions: extensions,
              start: _index,
              end: _index + _match.length,
              getDefinition: function() {
                return SmartVariable.getDefinition(this);
              },
              isVariable: true
            });
            return string = string.replace(_match, (new Array(_match.length + 1)).join(' '));
          };
          for (k = 0, len1 = _matches.length; k < len1; k++) {
            _match = _matches[k];
            fn(type, extensions, _match);
          }
        }
        return _variables;
      },
      getDefinition: function(variable, initial) {
        var _definition, _options, _pointer, _regExp, _results, extensions, match, type;
        match = variable.match, type = variable.type, extensions = variable.extensions;
        _regExp = new RegExp(VARIABLE_PATTERN.replace('{{ VARIABLE }}', match));
        if (_definition = DEFINITIONS[match]) {
          if (initial == null) {
            initial = _definition;
          }
          _pointer = _definition.pointer;
          return atom.project.bufferForPath(_pointer.filePath).then((function(_this) {
            return function(buffer) {
              var _found, _match, _text;
              _text = buffer.getTextInRange(_pointer.range);
              _match = _text.match(_regExp);
              if (!_match) {
                DEFINITIONS[match] = null;
                return _this.getDefinition(variable, initial);
              }
              _definition.value = _match[1];
              _found = (_this.find(_match[1], _pointer.filePath))[0];
              if (_found && _found.isVariable) {
                return _this.getDefinition(_found, initial);
              }
              return {
                value: _definition.value,
                variable: _definition.variable,
                type: _definition.type,
                pointer: initial.pointer
              };
            };
          })(this))["catch"]((function(_this) {
            return function(error) {
              return console.error(error);
            };
          })(this));
        }
        _options = {
          paths: (function() {
            var _extension, j, len, results;
            results = [];
            for (j = 0, len = extensions.length; j < len; j++) {
              _extension = extensions[j];
              results.push("**/*" + _extension);
            }
            return results;
          })()
        };
        _results = [];
        return atom.workspace.scan(_regExp, _options, function(result) {
          return _results.push(result);
        }).then((function(_this) {
          return function() {
            var _bestMatch, _bestMatchHits, _match, _pathFragments, _targetFragments, _targetPath, _thisMatchHits, i, j, k, len, len1, pathFragment, result;
            _targetPath = atom.workspace.getActivePaneItem().getPath();
            _targetFragments = _targetPath.split(path.sep);
            _bestMatch = null;
            _bestMatchHits = 0;
            for (j = 0, len = _results.length; j < len; j++) {
              result = _results[j];
              _thisMatchHits = 0;
              _pathFragments = result.filePath.split(path.sep);
              for (i = k = 0, len1 = _pathFragments.length; k < len1; i = ++k) {
                pathFragment = _pathFragments[i];
                if (pathFragment === _targetFragments[i]) {
                  _thisMatchHits++;
                }
              }
              if (_thisMatchHits > _bestMatchHits) {
                _bestMatch = result;
                _bestMatchHits = _thisMatchHits;
              }
            }
            if (!(_bestMatch && (_match = _bestMatch.matches[0]))) {
              return;
            }
            DEFINITIONS[match] = {
              value: null,
              variable: match,
              type: type,
              pointer: {
                filePath: _bestMatch.filePath,
                range: _match.range
              }
            };
            if (initial == null) {
              initial = DEFINITIONS[match];
            }
            return _this.getDefinition(variable, initial);
          };
        })(this))["catch"]((function(_this) {
          return function(error) {
            return console.error(error);
          };
        })(this));
      }
    };
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2FuZ29hLy5hdG9tL3BhY2thZ2VzL2NvbG9yLXBpY2tlci9saWIvbW9kdWxlcy9TbWFydFZhcmlhYmxlLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFJSTtBQUFBLE1BQUE7O0VBQUEsTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBQTtBQUNiLFFBQUE7SUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7SUFLUCxnQkFBQSxHQUFtQjtJQUVuQixjQUFBLEdBQWlCO01BR2I7UUFDSSxJQUFBLEVBQU0sTUFEVjtRQUVJLFVBQUEsRUFBWSxDQUFDLE9BQUQsRUFBVSxPQUFWLENBRmhCO1FBR0ksTUFBQSxFQUFRLHFCQUhaO09BSGEsRUFXYjtRQUNJLElBQUEsRUFBTSxNQURWO1FBRUksVUFBQSxFQUFZLENBQUMsT0FBRCxDQUZoQjtRQUdJLE1BQUEsRUFBUSxxQkFIWjtPQVhhLEVBbUJiO1FBQ0ksSUFBQSxFQUFNLFFBRFY7UUFFSSxVQUFBLEVBQVksQ0FBQyxTQUFELEVBQVksT0FBWixDQUZoQjtRQUdJLE1BQUEsRUFBUSxxQkFIWjtPQW5CYTs7SUE2QmpCLFdBQUEsR0FBYztBQUtkLFdBQU87TUFPSCxJQUFBLEVBQU0sU0FBQyxNQUFELEVBQVMsUUFBVDtBQUNGLFlBQUE7UUFBQSxhQUFBLEdBQWdCO1FBQ2hCLFVBQUEsR0FBYTtBQUViLGFBQUEsZ0RBQUE7bUNBQUssaUJBQU0sNkJBQVk7VUFDbkIsUUFBQSxHQUFXLE1BQU0sQ0FBQyxLQUFQLENBQWtCLElBQUEsTUFBQSxDQUFPLE1BQU0sQ0FBQyxNQUFkLEVBQXNCLElBQXRCLENBQWxCO1VBQ1gsSUFBQSxDQUFnQixRQUFoQjtBQUFBLHFCQUFBOztVQUdBLElBQUcsUUFBSDtZQUNJLFdBQWlCLElBQUksQ0FBQyxPQUFMLENBQWEsUUFBYixDQUFELEVBQUEsYUFBMkIsVUFBM0IsRUFBQSxJQUFBLEtBQWhCO0FBQUEsdUJBQUE7YUFE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TyxLQUFDLENBQUEsYUFBRCxDQUFlLFFBQWYsRUFBeUIsT0FBekI7VUFqQ0w7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBRkMsQ0FvQ1AsRUFBQyxLQUFELEVBcENPLENBb0NBLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUMsS0FBRDttQkFBVyxPQUFPLENBQUMsS0FBUixDQUFjLEtBQWQ7VUFBWDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FwQ0E7TUFsREksQ0E5Q1o7O0VBMUNNO0FBQWpCIiwic291cmNlc0NvbnRlbnQiOlsiIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jICBTbWFydFZhcmlhYmxlXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIG1vZHVsZS5leHBvcnRzID0gLT5cbiAgICAgICAgcGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5cbiAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAjICBWYXJpYWJsZSBUeXBlc1xuICAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICBWQVJJQUJMRV9QQVRURVJOID0gJ1xcXFx7eyBWQVJJQUJMRSB9fVtcXFxcc10qWzo9XVtcXFxcc10qKFteXFxcXDtcXFxcbl0rKVtcXFxcO3xcXFxcbl0nXG5cbiAgICAgICAgVkFSSUFCTEVfVFlQRVMgPSBbXG4gICAgICAgICAgICAjIE1hdGNoZXMgU2FzcyB2YXJpYWJsZTogZWcuXG4gICAgICAgICAgICAjICRjb2xvci12YXJcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnc2FzcydcbiAgICAgICAgICAgICAgICBleHRlbnNpb25zOiBbJy5zY3NzJywgJy5zYXNzJ11cbiAgICAgICAgICAgICAgICByZWdFeHA6IC8oW1xcJF0pKFtcXHcwLTktX10rKS9pXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICMgTWF0Y2hlcyBMRVNTIHZhcmlhYmxlOiBlZy5cbiAgICAgICAgICAgICMgQGNvbG9yLXZhclxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdsZXNzJ1xuICAgICAgICAgICAgICAgIGV4dGVuc2lvbnM6IFsnLmxlc3MnXVxuICAgICAgICAgICAgICAgIHJlZ0V4cDogLyhbXFxAXSkoW1xcdzAtOS1fXSspL2lcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgIyBNYXRjaGVzIFN0eWx1cyB2YXJpYWJsZTogZWcuXG4gICAgICAgICAgICAjICRjb2xvci12YXJcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnc3R5bHVzJ1xuICAgICAgICAgICAgICAgIGV4dGVuc2lvbnM6IFsnLnN0eWx1cycsICcuc3R5bCddXG4gICAgICAgICAgICAgICAgcmVnRXhwOiAvKFtcXCRdKShbXFx3MC05LV9dKykvaVxuICAgICAgICAgICAgfVxuICAgICAgICBdXG5cbiAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAjICBEZWZpbml0aW9uIHN0b3JhZ2VcbiAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgREVGSU5JVElPTlMgPSB7fVxuXG4gICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgIyAgUHVibGljIGZ1bmN0aW9uYWxpdHlcbiAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgICMgIEZpbmQgdmFyaWFibGVzIGluIHN0cmluZ1xuICAgICAgICAjICAtIHN0cmluZyB7U3RyaW5nfVxuICAgICAgICAjXG4gICAgICAgICMgIEByZXR1cm4gU3RyaW5nXG4gICAgICAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAgICAgZmluZDogKHN0cmluZywgcGF0aE5hbWUpIC0+XG4gICAgICAgICAgICAgICAgU21hcnRWYXJpYWJsZSA9IHRoaXNcbiAgICAgICAgICAgICAgICBfdmFyaWFibGVzID0gW11cblxuICAgICAgICAgICAgICAgIGZvciB7dHlwZSwgZXh0ZW5zaW9ucywgcmVnRXhwfSBpbiBWQVJJQUJMRV9UWVBFU1xuICAgICAgICAgICAgICAgICAgICBfbWF0Y2hlcyA9IHN0cmluZy5tYXRjaCAobmV3IFJlZ0V4cCByZWdFeHAuc291cmNlLCAnaWcnKVxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZSB1bmxlc3MgX21hdGNoZXNcblxuICAgICAgICAgICAgICAgICAgICAjIE1ha2Ugc3VyZSB0aGUgZmlsZSB0eXBlIG1hdGNoZXMgcG9zc2libGUgZXh0ZW5zaW9uc1xuICAgICAgICAgICAgICAgICAgICBpZiBwYXRoTmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWUgdW5sZXNzIChwYXRoLmV4dG5hbWUgcGF0aE5hbWUpIGluIGV4dGVuc2lvbnNcblxuICAgICAgICAgICAgICAgICAgICBmb3IgX21hdGNoIGluIF9tYXRjaGVzIHRoZW4gZG8gKHR5cGUsIGV4dGVuc2lvbnMsIF9tYXRjaCkgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBpZiAoX2luZGV4ID0gc3RyaW5nLmluZGV4T2YgX21hdGNoKSBpcyAtMVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBfdmFyaWFibGVzLnB1c2hcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXRjaDogX21hdGNoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogdHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVuc2lvbnM6IGV4dGVuc2lvbnNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFydDogX2luZGV4XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5kOiBfaW5kZXggKyBfbWF0Y2gubGVuZ3RoXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnZXREZWZpbml0aW9uOiAtPiBTbWFydFZhcmlhYmxlLmdldERlZmluaXRpb24gdGhpc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzVmFyaWFibGU6IHRydWVcblxuICAgICAgICAgICAgICAgICAgICAgICAgIyBSZW1vdmUgdGhlIG1hdGNoIGZyb20gdGhlIGxpbmUgY29udGVudCBzdHJpbmcgdG9cbiAgICAgICAgICAgICAgICAgICAgICAgICMg4oCcbWFyayBpdOKAnSBhcyBoYXZpbmcgYmVlbiDigJxzcGVudOKAnS4gQmUgY2FyZWZ1bCB0byBrZWVwIHRoZVxuICAgICAgICAgICAgICAgICAgICAgICAgIyBjb3JyZWN0IGFtb3VudCBvZiBjaGFyYWN0ZXJzIGluIHRoZSBzdHJpbmcgYXMgdGhpcyBpc1xuICAgICAgICAgICAgICAgICAgICAgICAgIyBsYXRlciB1c2VkIHRvIHNlZSB3aGljaCBtYXRjaCBmaXRzIGJlc3QsIGlmIGFueVxuICAgICAgICAgICAgICAgICAgICAgICAgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UgX21hdGNoLCAobmV3IEFycmF5IF9tYXRjaC5sZW5ndGggKyAxKS5qb2luICcgJ1xuICAgICAgICAgICAgICAgIHJldHVybiBfdmFyaWFibGVzXG5cbiAgICAgICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgICMgIEZpbmQgYSB2YXJpYWJsZSBkZWZpbml0aW9uIGluIHRoZSBwcm9qZWN0XG4gICAgICAgICMgIC0gbmFtZSB7U3RyaW5nfVxuICAgICAgICAjICAtIHR5cGUge1N0cmluZ31cbiAgICAgICAgI1xuICAgICAgICAjICBAcmV0dXJuIFByb21pc2VcbiAgICAgICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgICAgICBnZXREZWZpbml0aW9uOiAodmFyaWFibGUsIGluaXRpYWwpIC0+XG4gICAgICAgICAgICAgICAge21hdGNoLCB0eXBlLCBleHRlbnNpb25zfSA9IHZhcmlhYmxlXG5cbiAgICAgICAgICAgICAgICAjIEZpZ3VyZSBvdXQgd2hhdCB0byBsb29rIGZvclxuICAgICAgICAgICAgICAgIF9yZWdFeHAgPSBuZXcgUmVnRXhwIChWQVJJQUJMRV9QQVRURVJOLnJlcGxhY2UgJ3t7IFZBUklBQkxFIH19JywgbWF0Y2gpXG5cbiAgICAgICAgICAgICAgICAjIFdlIGFscmVhZHkga25vdyB3aGVyZSB0aGUgZGVmaW5pdGlvbiBpc1xuICAgICAgICAgICAgICAgIGlmIF9kZWZpbml0aW9uID0gREVGSU5JVElPTlNbbWF0Y2hdXG4gICAgICAgICAgICAgICAgICAgICMgU2F2ZSBpbml0aWFsIHBvaW50ZXIgdmFsdWUsIGlmIGl0IGlzbid0IHNldCBhbHJlYWR5XG4gICAgICAgICAgICAgICAgICAgIGluaXRpYWwgPz0gX2RlZmluaXRpb25cbiAgICAgICAgICAgICAgICAgICAgX3BvaW50ZXIgPSBfZGVmaW5pdGlvbi5wb2ludGVyXG5cbiAgICAgICAgICAgICAgICAgICAgIyAuLi4gYnV0IGNoZWNrIGlmIGl0J3Mgc3RpbGwgdGhlcmVcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGF0b20ucHJvamVjdC5idWZmZXJGb3JQYXRoIF9wb2ludGVyLmZpbGVQYXRoXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbiAoYnVmZmVyKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90ZXh0ID0gYnVmZmVyLmdldFRleHRJblJhbmdlIF9wb2ludGVyLnJhbmdlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX21hdGNoID0gX3RleHQubWF0Y2ggX3JlZ0V4cFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBEZWZpbml0aW9uIG5vdCBmb3VuZCwgcmVzZXQgYW5kIHRyeSBhZ2FpblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVubGVzcyBfbWF0Y2hcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgREVGSU5JVElPTlNbbWF0Y2hdID0gbnVsbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gQGdldERlZmluaXRpb24gdmFyaWFibGUsIGluaXRpYWxcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgRGVmaW5pdGlvbiBmb3VuZCwgc2F2ZSBpdCBvbiB0aGUgREVGSU5JVElPTiBvYmplY3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfZGVmaW5pdGlvbi52YWx1ZSA9IF9tYXRjaFsxXVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIyAuLi4gYnV0IGl0IG1pZ2h0IGJlIGFub3RoZXIgdmFyaWFibGUsIGluIHdoaWNoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBjYXNlIHdlIG11c3Qga2VlcCBkaWdnaW5nIHRvIGZpbmQgd2hhdCB3ZSdyZSBhZnRlclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9mb3VuZCA9IChAZmluZCBfbWF0Y2hbMV0sIF9wb2ludGVyLmZpbGVQYXRoKVswXVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBSdW4gdGhlIHNlYXJjaCBhZ2FpbiwgYnV0IGtlZXAgdGhlIGluaXRpYWwgcG9pbnRlclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIF9mb3VuZCBhbmQgX2ZvdW5kLmlzVmFyaWFibGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEBnZXREZWZpbml0aW9uIF9mb3VuZCwgaW5pdGlhbFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IF9kZWZpbml0aW9uLnZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhcmlhYmxlOiBfZGVmaW5pdGlvbi52YXJpYWJsZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBfZGVmaW5pdGlvbi50eXBlXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9pbnRlcjogaW5pdGlhbC5wb2ludGVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgLmNhdGNoIChlcnJvcikgPT4gY29uc29sZS5lcnJvciBlcnJvclxuXG4gICAgICAgICAgICAgICAgIyAuLi4gd2UgZG9uJ3Qga25vdyB3aGVyZSB0aGUgZGVmaW5pdGlvbiBpc1xuXG4gICAgICAgICAgICAgICAgIyBGaWd1cmUgb3V0IHdoZXJlIHRvIGxvb2tcbiAgICAgICAgICAgICAgICBfb3B0aW9ucyA9IHBhdGhzOiBkbyAtPlxuICAgICAgICAgICAgICAgICAgICBcIioqLyojeyBfZXh0ZW5zaW9uIH1cIiBmb3IgX2V4dGVuc2lvbiBpbiBleHRlbnNpb25zXG4gICAgICAgICAgICAgICAgX3Jlc3VsdHMgPSBbXVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGF0b20ud29ya3NwYWNlLnNjYW4gX3JlZ0V4cCwgX29wdGlvbnMsIChyZXN1bHQpIC0+XG4gICAgICAgICAgICAgICAgICAgIF9yZXN1bHRzLnB1c2ggcmVzdWx0XG4gICAgICAgICAgICAgICAgLnRoZW4gPT5cbiAgICAgICAgICAgICAgICAgICAgIyBGaWd1cmUgb3V0IHdoYXQgZmlsZSBpcyBob2xkaW5nIHRoZSBkZWZpbml0aW9uXG4gICAgICAgICAgICAgICAgICAgICMgQXNzdW1lIGl0J3MgdGhlIG9uZSBjbG9zZXN0IHRvIHRoZSBjdXJyZW50IHBhdGhcbiAgICAgICAgICAgICAgICAgICAgX3RhcmdldFBhdGggPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lSXRlbSgpLmdldFBhdGgoKVxuICAgICAgICAgICAgICAgICAgICBfdGFyZ2V0RnJhZ21lbnRzID0gX3RhcmdldFBhdGguc3BsaXQgcGF0aC5zZXBcblxuICAgICAgICAgICAgICAgICAgICBfYmVzdE1hdGNoID0gbnVsbFxuICAgICAgICAgICAgICAgICAgICBfYmVzdE1hdGNoSGl0cyA9IDBcblxuICAgICAgICAgICAgICAgICAgICBmb3IgcmVzdWx0IGluIF9yZXN1bHRzXG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpc01hdGNoSGl0cyA9IDBcbiAgICAgICAgICAgICAgICAgICAgICAgIF9wYXRoRnJhZ21lbnRzID0gcmVzdWx0LmZpbGVQYXRoLnNwbGl0IHBhdGguc2VwXG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpc01hdGNoSGl0cysrIGZvciBwYXRoRnJhZ21lbnQsIGkgaW4gX3BhdGhGcmFnbWVudHMgd2hlbiBwYXRoRnJhZ21lbnQgaXMgX3RhcmdldEZyYWdtZW50c1tpXVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBfdGhpc01hdGNoSGl0cyA+IF9iZXN0TWF0Y2hIaXRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX2Jlc3RNYXRjaCA9IHJlc3VsdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9iZXN0TWF0Y2hIaXRzID0gX3RoaXNNYXRjaEhpdHNcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHVubGVzcyBfYmVzdE1hdGNoIGFuZCBfbWF0Y2ggPSBfYmVzdE1hdGNoLm1hdGNoZXNbMF1cblxuICAgICAgICAgICAgICAgICAgICAjIFNhdmUgdGhlIGRlZmluaXRpb24gb24gdGhlIERFRklOSVRJT04gb2JqZWN0IHNvIHRoYXQgaXRcbiAgICAgICAgICAgICAgICAgICAgIyBjYW4gYmUgYWNjZXNzZWQgbGF0ZXJcbiAgICAgICAgICAgICAgICAgICAgREVGSU5JVElPTlNbbWF0Y2hdID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhcmlhYmxlOiBtYXRjaFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogdHlwZVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBwb2ludGVyOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVQYXRoOiBfYmVzdE1hdGNoLmZpbGVQYXRoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmFuZ2U6IF9tYXRjaC5yYW5nZVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgIyBTYXZlIGluaXRpYWwgcG9pbnRlciB2YWx1ZSwgaWYgaXQgaXNuJ3Qgc2V0IGFscmVhZHlcbiAgICAgICAgICAgICAgICAgICAgaW5pdGlhbCA/PSBERUZJTklUSU9OU1ttYXRjaF1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEBnZXREZWZpbml0aW9uIHZhcmlhYmxlLCBpbml0aWFsXG4gICAgICAgICAgICAgICAgLmNhdGNoIChlcnJvcikgPT4gY29uc29sZS5lcnJvciBlcnJvclxuICAgICAgICB9XG4iXX0=
