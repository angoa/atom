(function() {
  var DotRenderer;

  module.exports = DotRenderer = (function() {
    function DotRenderer() {}

    DotRenderer.prototype.render = function(colorMarker) {
      var charWidth, color, column, index, lineHeight, markers, pixelPosition, range, screenLine, textEditor, textEditorElement;
      range = colorMarker.getScreenRange();
      color = colorMarker.color;
      if (color == null) {
        return {};
      }
      textEditor = colorMarker.colorBuffer.editor;
      textEditorElement = atom.views.getView(textEditor);
      charWidth = textEditor.getDefaultCharWidth();
      markers = colorMarker.colorBuffer.findValidColorMarkers({
        intersectsScreenRowRange: [range.end.row, range.end.row]
      }).filter(function(m) {
        return m.getScreenRange().end.row === range.end.row;
      });
      index = markers.indexOf(colorMarker);
      screenLine = this.screenLineForScreenRow(textEditor, range.end.row);
      if (screenLine == null) {
        return {};
      }
      lineHeight = textEditor.getLineHeightInPixels();
      column = this.getLineLastColumn(screenLine) * charWidth;
      pixelPosition = textEditorElement.pixelPositionForScreenPosition(range.end);
      return {
        "class": 'dot',
        style: {
          backgroundColor: color.toCSS(),
          top: (pixelPosition.top + lineHeight / 2) + 'px',
          left: (column + index * 18) + 'px'
        }
      };
    };

    DotRenderer.prototype.getLineLastColumn = function(line) {
      if (line.lineText != null) {
        return line.lineText.length + 1;
      } else {
        return line.getMaxScreenColumn() + 1;
      }
    };

    DotRenderer.prototype.screenLineForScreenRow = function(textEditor, row) {
      if (textEditor.screenLineForScreenRow != null) {
        return textEditor.screenLineForScreenRow(row);
      } else {
        return textEditor.displayBuffer.screenLines[row];
      }
    };

    return DotRenderer;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2FuZ29hLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi9yZW5kZXJlcnMvZG90LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQTtBQUFBLE1BQUE7O0VBQUEsTUFBTSxDQUFDLE9BQVAsR0FDTTs7OzBCQUNKLE1BQUEsR0FBUSxTQUFDLFdBQUQ7QUFDTixVQUFBO01BQUEsS0FBQSxHQUFRLFdBQVcsQ0FBQyxjQUFaLENBQUE7TUFFUixLQUFBLEdBQVEsV0FBVyxDQUFDO01BRXBCLElBQWlCLGFBQWpCO0FBQUEsZUFBTyxHQUFQOztNQUVBLFVBQUEsR0FBYSxXQUFXLENBQUMsV0FBVyxDQUFDO01BQ3JDLGlCQUFBLEdBQW9CLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixVQUFuQjtNQUNwQixTQUFBLEdBQVksVUFBVSxDQUFDLG1CQUFYLENBQUE7TUFFWixPQUFBLEdBQVUsV0FBVyxDQUFDLFdBQVcsQ0FBQyxxQkFBeEIsQ0FBOEM7UUFDdEQsd0JBQUEsRUFBMEIsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQVgsRUFBZ0IsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUExQixDQUQ0QjtPQUE5QyxDQUVSLENBQUMsTUFGTyxDQUVBLFNBQUMsQ0FBRDtlQUFPLENBQUMsQ0FBQyxjQUFGLENBQUEsQ0FBa0IsQ0FBQyxHQUFHLENBQUMsR0FBdkIsS0FBOEIsS0FBSyxDQUFDLEdBQUcsQ0FBQztNQUEvQyxDQUZBO01BSVYsS0FBQSxHQUFRLE9BQU8sQ0FBQyxPQUFSLENBQWdCLFdBQWhCO01BQ1IsVUFBQSxHQUFhLElBQUMsQ0FBQSxzQkFBRCxDQUF3QixVQUF4QixFQUFvQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQTlDO01BRWIsSUFBaUIsa0JBQWpCO0FBQUEsZUFBTyxHQUFQOztNQUVBLFVBQUEsR0FBYSxVQUFVLENBQUMscUJBQVgsQ0FBQTtNQUNiLE1BQUEsR0FBUyxJQUFDLENBQUEsaUJBQUQsQ0FBbUIsVUFBbkIsQ0FBQSxHQUFpQztNQUMxQyxhQUFBLEdBQWdCLGlCQUFpQixDQUFDLDhCQUFsQixDQUFpRCxLQUFLLENBQUMsR0FBdkQ7YUFFaEI7UUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLEtBQVA7UUFDQSxLQUFBLEVBQ0U7VUFBQSxlQUFBLEVBQWlCLEtBQUssQ0FBQyxLQUFOLENBQUEsQ0FBakI7VUFDQSxHQUFBLEVBQUssQ0FBQyxhQUFhLENBQUMsR0FBZCxHQUFvQixVQUFBLEdBQWEsQ0FBbEMsQ0FBQSxHQUF1QyxJQUQ1QztVQUVBLElBQUEsRUFBTSxDQUFDLE1BQUEsR0FBUyxLQUFBLEdBQVEsRUFBbEIsQ0FBQSxHQUF3QixJQUY5QjtTQUZGOztJQXhCTTs7MEJBOEJSLGlCQUFBLEdBQW1CLFNBQUMsSUFBRDtNQUNqQixJQUFHLHFCQUFIO2VBQ0UsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFkLEdBQXVCLEVBRHpCO09BQUEsTUFBQTtlQUdFLElBQUksQ0FBQyxrQkFBTCxDQUFBLENBQUEsR0FBNEIsRUFIOUI7O0lBRGlCOzswQkFNbkIsc0JBQUEsR0FBd0IsU0FBQyxVQUFELEVBQWEsR0FBYjtNQUN0QixJQUFHLHlDQUFIO2VBQ0UsVUFBVSxDQUFDLHNCQUFYLENBQWtDLEdBQWxDLEVBREY7T0FBQSxNQUFBO2VBR0UsVUFBVSxDQUFDLGFBQWEsQ0FBQyxXQUFZLENBQUEsR0FBQSxFQUh2Qzs7SUFEc0I7Ozs7O0FBdEMxQiIsInNvdXJjZXNDb250ZW50IjpbIlxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgRG90UmVuZGVyZXJcbiAgcmVuZGVyOiAoY29sb3JNYXJrZXIpIC0+XG4gICAgcmFuZ2UgPSBjb2xvck1hcmtlci5nZXRTY3JlZW5SYW5nZSgpXG5cbiAgICBjb2xvciA9IGNvbG9yTWFya2VyLmNvbG9yXG5cbiAgICByZXR1cm4ge30gdW5sZXNzIGNvbG9yP1xuXG4gICAgdGV4dEVkaXRvciA9IGNvbG9yTWFya2VyLmNvbG9yQnVmZmVyLmVkaXRvclxuICAgIHRleHRFZGl0b3JFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KHRleHRFZGl0b3IpXG4gICAgY2hhcldpZHRoID0gdGV4dEVkaXRvci5nZXREZWZhdWx0Q2hhcldpZHRoKClcblxuICAgIG1hcmtlcnMgPSBjb2xvck1hcmtlci5jb2xvckJ1ZmZlci5maW5kVmFsaWRDb2xvck1hcmtlcnMoe1xuICAgICAgaW50ZXJzZWN0c1NjcmVlblJvd1JhbmdlOiBbcmFuZ2UuZW5kLnJvdywgcmFuZ2UuZW5kLnJvd11cbiAgICB9KS5maWx0ZXIgKG0pIC0+IG0uZ2V0U2NyZWVuUmFuZ2UoKS5lbmQucm93IGlzIHJhbmdlLmVuZC5yb3dcblxuICAgIGluZGV4ID0gbWFya2Vycy5pbmRleE9mKGNvbG9yTWFya2VyKVxuICAgIHNjcmVlbkxpbmUgPSBAc2NyZWVuTGluZUZvclNjcmVlblJvdyh0ZXh0RWRpdG9yLCByYW5nZS5lbmQucm93KVxuXG4gICAgcmV0dXJuIHt9IHVubGVzcyBzY3JlZW5MaW5lP1xuXG4gICAgbGluZUhlaWdodCA9IHRleHRFZGl0b3IuZ2V0TGluZUhlaWdodEluUGl4ZWxzKClcbiAgICBjb2x1bW4gPSBAZ2V0TGluZUxhc3RDb2x1bW4oc2NyZWVuTGluZSkgKiBjaGFyV2lkdGhcbiAgICBwaXhlbFBvc2l0aW9uID0gdGV4dEVkaXRvckVsZW1lbnQucGl4ZWxQb3NpdGlvbkZvclNjcmVlblBvc2l0aW9uKHJhbmdlLmVuZClcblxuICAgIGNsYXNzOiAnZG90J1xuICAgIHN0eWxlOlxuICAgICAgYmFja2dyb3VuZENvbG9yOiBjb2xvci50b0NTUygpXG4gICAgICB0b3A6IChwaXhlbFBvc2l0aW9uLnRvcCArIGxpbmVIZWlnaHQgLyAyKSArICdweCdcbiAgICAgIGxlZnQ6IChjb2x1bW4gKyBpbmRleCAqIDE4KSArICdweCdcblxuICBnZXRMaW5lTGFzdENvbHVtbjogKGxpbmUpIC0+XG4gICAgaWYgbGluZS5saW5lVGV4dD9cbiAgICAgIGxpbmUubGluZVRleHQubGVuZ3RoICsgMVxuICAgIGVsc2VcbiAgICAgIGxpbmUuZ2V0TWF4U2NyZWVuQ29sdW1uKCkgKyAxXG5cbiAgc2NyZWVuTGluZUZvclNjcmVlblJvdzogKHRleHRFZGl0b3IsIHJvdykgLT5cbiAgICBpZiB0ZXh0RWRpdG9yLnNjcmVlbkxpbmVGb3JTY3JlZW5Sb3c/XG4gICAgICB0ZXh0RWRpdG9yLnNjcmVlbkxpbmVGb3JTY3JlZW5Sb3cocm93KVxuICAgIGVsc2VcbiAgICAgIHRleHRFZGl0b3IuZGlzcGxheUJ1ZmZlci5zY3JlZW5MaW5lc1tyb3ddXG4iXX0=
