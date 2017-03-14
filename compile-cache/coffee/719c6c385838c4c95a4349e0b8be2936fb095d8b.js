(function() {
  var RegionRenderer;

  module.exports = RegionRenderer = (function() {
    function RegionRenderer() {}

    RegionRenderer.prototype.includeTextInRegion = false;

    RegionRenderer.prototype.renderRegions = function(colorMarker) {
      var i, range, ref, ref1, regions, row, rowSpan, textEditor;
      range = colorMarker.getScreenRange();
      if (range.isEmpty()) {
        return [];
      }
      rowSpan = range.end.row - range.start.row;
      regions = [];
      textEditor = colorMarker.colorBuffer.editor;
      if (rowSpan === 0) {
        regions.push(this.createRegion(range.start, range.end, colorMarker));
      } else {
        regions.push(this.createRegion(range.start, {
          row: range.start.row,
          column: 2e308
        }, colorMarker, this.screenLineForScreenRow(textEditor, range.start.row)));
        if (rowSpan > 1) {
          for (row = i = ref = range.start.row + 1, ref1 = range.end.row; ref <= ref1 ? i < ref1 : i > ref1; row = ref <= ref1 ? ++i : --i) {
            regions.push(this.createRegion({
              row: row,
              column: 0
            }, {
              row: row,
              column: 2e308
            }, colorMarker, this.screenLineForScreenRow(textEditor, row)));
          }
        }
        regions.push(this.createRegion({
          row: range.end.row,
          column: 0
        }, range.end, colorMarker, this.screenLineForScreenRow(textEditor, range.end.row)));
      }
      return regions;
    };

    RegionRenderer.prototype.screenLineForScreenRow = function(textEditor, row) {
      if (textEditor.screenLineForScreenRow != null) {
        return textEditor.screenLineForScreenRow(row);
      } else {
        return textEditor.displayBuffer.screenLines[row];
      }
    };

    RegionRenderer.prototype.createRegion = function(start, end, colorMarker, screenLine) {
      var bufferRange, charWidth, clippedEnd, clippedStart, css, endPosition, lineHeight, name, needAdjustment, ref, ref1, region, startPosition, text, textEditor, textEditorElement, value;
      textEditor = colorMarker.colorBuffer.editor;
      textEditorElement = atom.views.getView(textEditor);
      if (textEditorElement.component == null) {
        return;
      }
      lineHeight = textEditor.getLineHeightInPixels();
      charWidth = textEditor.getDefaultCharWidth();
      clippedStart = {
        row: start.row,
        column: (ref = this.clipScreenColumn(screenLine, start.column)) != null ? ref : start.column
      };
      clippedEnd = {
        row: end.row,
        column: (ref1 = this.clipScreenColumn(screenLine, end.column)) != null ? ref1 : end.column
      };
      bufferRange = textEditor.bufferRangeForScreenRange({
        start: clippedStart,
        end: clippedEnd
      });
      needAdjustment = (screenLine != null ? typeof screenLine.isSoftWrapped === "function" ? screenLine.isSoftWrapped() : void 0 : void 0) && end.column >= (screenLine != null ? screenLine.text.length : void 0) - (screenLine != null ? screenLine.softWrapIndentationDelta : void 0);
      if (needAdjustment) {
        bufferRange.end.column++;
      }
      startPosition = textEditorElement.pixelPositionForScreenPosition(clippedStart);
      endPosition = textEditorElement.pixelPositionForScreenPosition(clippedEnd);
      text = textEditor.getBuffer().getTextInRange(bufferRange);
      css = {};
      css.left = startPosition.left;
      css.top = startPosition.top;
      css.width = endPosition.left - startPosition.left;
      if (needAdjustment) {
        css.width += charWidth;
      }
      css.height = lineHeight;
      region = document.createElement('div');
      region.className = 'region';
      if (this.includeTextInRegion) {
        region.textContent = text;
      }
      if (startPosition.left === endPosition.left) {
        region.invalid = true;
      }
      for (name in css) {
        value = css[name];
        region.style[name] = value + 'px';
      }
      return region;
    };

    RegionRenderer.prototype.clipScreenColumn = function(line, column) {
      if (line != null) {
        if (line.clipScreenColumn != null) {
          return line.clipScreenColumn(column);
        } else {
          return Math.min(line.lineText.length, column);
        }
      }
    };

    return RegionRenderer;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2FuZ29hLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi9yZW5kZXJlcnMvcmVnaW9uLXJlbmRlcmVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQTtBQUFBLE1BQUE7O0VBQUEsTUFBTSxDQUFDLE9BQVAsR0FDTTs7OzZCQUNKLG1CQUFBLEdBQXFCOzs2QkFFckIsYUFBQSxHQUFlLFNBQUMsV0FBRDtBQUNiLFVBQUE7TUFBQSxLQUFBLEdBQVEsV0FBVyxDQUFDLGNBQVosQ0FBQTtNQUNSLElBQWEsS0FBSyxDQUFDLE9BQU4sQ0FBQSxDQUFiO0FBQUEsZUFBTyxHQUFQOztNQUVBLE9BQUEsR0FBVSxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQVYsR0FBZ0IsS0FBSyxDQUFDLEtBQUssQ0FBQztNQUN0QyxPQUFBLEdBQVU7TUFFVixVQUFBLEdBQWEsV0FBVyxDQUFDLFdBQVcsQ0FBQztNQUVyQyxJQUFHLE9BQUEsS0FBVyxDQUFkO1FBQ0UsT0FBTyxDQUFDLElBQVIsQ0FBYSxJQUFDLENBQUEsWUFBRCxDQUFjLEtBQUssQ0FBQyxLQUFwQixFQUEyQixLQUFLLENBQUMsR0FBakMsRUFBc0MsV0FBdEMsQ0FBYixFQURGO09BQUEsTUFBQTtRQUdFLE9BQU8sQ0FBQyxJQUFSLENBQWEsSUFBQyxDQUFBLFlBQUQsQ0FDWCxLQUFLLENBQUMsS0FESyxFQUVYO1VBQ0UsR0FBQSxFQUFLLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FEbkI7VUFFRSxNQUFBLEVBQVEsS0FGVjtTQUZXLEVBTVgsV0FOVyxFQU9YLElBQUMsQ0FBQSxzQkFBRCxDQUF3QixVQUF4QixFQUFvQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQWhELENBUFcsQ0FBYjtRQVNBLElBQUcsT0FBQSxHQUFVLENBQWI7QUFDRSxlQUFXLDJIQUFYO1lBQ0UsT0FBTyxDQUFDLElBQVIsQ0FBYSxJQUFDLENBQUEsWUFBRCxDQUNYO2NBQUMsS0FBQSxHQUFEO2NBQU0sTUFBQSxFQUFRLENBQWQ7YUFEVyxFQUVYO2NBQUMsS0FBQSxHQUFEO2NBQU0sTUFBQSxFQUFRLEtBQWQ7YUFGVyxFQUdYLFdBSFcsRUFJWCxJQUFDLENBQUEsc0JBQUQsQ0FBd0IsVUFBeEIsRUFBb0MsR0FBcEMsQ0FKVyxDQUFiO0FBREYsV0FERjs7UUFTQSxPQUFPLENBQUMsSUFBUixDQUFhLElBQUMsQ0FBQSxZQUFELENBQ1g7VUFBQyxHQUFBLEVBQUssS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFoQjtVQUFxQixNQUFBLEVBQVEsQ0FBN0I7U0FEVyxFQUVYLEtBQUssQ0FBQyxHQUZLLEVBR1gsV0FIVyxFQUlYLElBQUMsQ0FBQSxzQkFBRCxDQUF3QixVQUF4QixFQUFvQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQTlDLENBSlcsQ0FBYixFQXJCRjs7YUE0QkE7SUFyQ2E7OzZCQXVDZixzQkFBQSxHQUF3QixTQUFDLFVBQUQsRUFBYSxHQUFiO01BQ3RCLElBQUcseUNBQUg7ZUFDRSxVQUFVLENBQUMsc0JBQVgsQ0FBa0MsR0FBbEMsRUFERjtPQUFBLE1BQUE7ZUFHRSxVQUFVLENBQUMsYUFBYSxDQUFDLFdBQVksQ0FBQSxHQUFBLEVBSHZDOztJQURzQjs7NkJBTXhCLFlBQUEsR0FBYyxTQUFDLEtBQUQsRUFBUSxHQUFSLEVBQWEsV0FBYixFQUEwQixVQUExQjtBQUNaLFVBQUE7TUFBQSxVQUFBLEdBQWEsV0FBVyxDQUFDLFdBQVcsQ0FBQztNQUNyQyxpQkFBQSxHQUFvQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsQ0FBbUIsVUFBbkI7TUFFcEIsSUFBYyxtQ0FBZDtBQUFBLGVBQUE7O01BRUEsVUFBQSxHQUFhLFVBQVUsQ0FBQyxxQkFBWCxDQUFBO01BQ2IsU0FBQSxHQUFZLFVBQVUsQ0FBQyxtQkFBWCxDQUFBO01BRVosWUFBQSxHQUFlO1FBQ2IsR0FBQSxFQUFLLEtBQUssQ0FBQyxHQURFO1FBRWIsTUFBQSwwRUFBc0QsS0FBSyxDQUFDLE1BRi9DOztNQUlmLFVBQUEsR0FBYTtRQUNYLEdBQUEsRUFBSyxHQUFHLENBQUMsR0FERTtRQUVYLE1BQUEsMEVBQW9ELEdBQUcsQ0FBQyxNQUY3Qzs7TUFLYixXQUFBLEdBQWMsVUFBVSxDQUFDLHlCQUFYLENBQXFDO1FBQ2pELEtBQUEsRUFBTyxZQUQwQztRQUVqRCxHQUFBLEVBQUssVUFGNEM7T0FBckM7TUFLZCxjQUFBLDBFQUFpQixVQUFVLENBQUUsa0NBQVosSUFBaUMsR0FBRyxDQUFDLE1BQUosMEJBQWMsVUFBVSxDQUFFLElBQUksQ0FBQyxnQkFBakIseUJBQTBCLFVBQVUsQ0FBRTtNQUV0RyxJQUE0QixjQUE1QjtRQUFBLFdBQVcsQ0FBQyxHQUFHLENBQUMsTUFBaEIsR0FBQTs7TUFFQSxhQUFBLEdBQWdCLGlCQUFpQixDQUFDLDhCQUFsQixDQUFpRCxZQUFqRDtNQUNoQixXQUFBLEdBQWMsaUJBQWlCLENBQUMsOEJBQWxCLENBQWlELFVBQWpEO01BRWQsSUFBQSxHQUFPLFVBQVUsQ0FBQyxTQUFYLENBQUEsQ0FBc0IsQ0FBQyxjQUF2QixDQUFzQyxXQUF0QztNQUVQLEdBQUEsR0FBTTtNQUNOLEdBQUcsQ0FBQyxJQUFKLEdBQVcsYUFBYSxDQUFDO01BQ3pCLEdBQUcsQ0FBQyxHQUFKLEdBQVUsYUFBYSxDQUFDO01BQ3hCLEdBQUcsQ0FBQyxLQUFKLEdBQVksV0FBVyxDQUFDLElBQVosR0FBbUIsYUFBYSxDQUFDO01BQzdDLElBQTBCLGNBQTFCO1FBQUEsR0FBRyxDQUFDLEtBQUosSUFBYSxVQUFiOztNQUNBLEdBQUcsQ0FBQyxNQUFKLEdBQWE7TUFFYixNQUFBLEdBQVMsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsS0FBdkI7TUFDVCxNQUFNLENBQUMsU0FBUCxHQUFtQjtNQUNuQixJQUE2QixJQUFDLENBQUEsbUJBQTlCO1FBQUEsTUFBTSxDQUFDLFdBQVAsR0FBcUIsS0FBckI7O01BQ0EsSUFBeUIsYUFBYSxDQUFDLElBQWQsS0FBc0IsV0FBVyxDQUFDLElBQTNEO1FBQUEsTUFBTSxDQUFDLE9BQVAsR0FBaUIsS0FBakI7O0FBQ0EsV0FBQSxXQUFBOztRQUFBLE1BQU0sQ0FBQyxLQUFNLENBQUEsSUFBQSxDQUFiLEdBQXFCLEtBQUEsR0FBUTtBQUE3QjthQUVBO0lBN0NZOzs2QkErQ2QsZ0JBQUEsR0FBa0IsU0FBQyxJQUFELEVBQU8sTUFBUDtNQUNoQixJQUFHLFlBQUg7UUFDRSxJQUFHLDZCQUFIO2lCQUNFLElBQUksQ0FBQyxnQkFBTCxDQUFzQixNQUF0QixFQURGO1NBQUEsTUFBQTtpQkFHRSxJQUFJLENBQUMsR0FBTCxDQUFTLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBdkIsRUFBK0IsTUFBL0IsRUFIRjtTQURGOztJQURnQjs7Ozs7QUFoR3BCIiwic291cmNlc0NvbnRlbnQiOlsiXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBSZWdpb25SZW5kZXJlclxuICBpbmNsdWRlVGV4dEluUmVnaW9uOiBmYWxzZVxuXG4gIHJlbmRlclJlZ2lvbnM6IChjb2xvck1hcmtlcikgLT5cbiAgICByYW5nZSA9IGNvbG9yTWFya2VyLmdldFNjcmVlblJhbmdlKClcbiAgICByZXR1cm4gW10gaWYgcmFuZ2UuaXNFbXB0eSgpXG5cbiAgICByb3dTcGFuID0gcmFuZ2UuZW5kLnJvdyAtIHJhbmdlLnN0YXJ0LnJvd1xuICAgIHJlZ2lvbnMgPSBbXVxuXG4gICAgdGV4dEVkaXRvciA9IGNvbG9yTWFya2VyLmNvbG9yQnVmZmVyLmVkaXRvclxuXG4gICAgaWYgcm93U3BhbiBpcyAwXG4gICAgICByZWdpb25zLnB1c2ggQGNyZWF0ZVJlZ2lvbihyYW5nZS5zdGFydCwgcmFuZ2UuZW5kLCBjb2xvck1hcmtlcilcbiAgICBlbHNlXG4gICAgICByZWdpb25zLnB1c2ggQGNyZWF0ZVJlZ2lvbihcbiAgICAgICAgcmFuZ2Uuc3RhcnQsXG4gICAgICAgIHtcbiAgICAgICAgICByb3c6IHJhbmdlLnN0YXJ0LnJvd1xuICAgICAgICAgIGNvbHVtbjogSW5maW5pdHlcbiAgICAgICAgfSxcbiAgICAgICAgY29sb3JNYXJrZXIsXG4gICAgICAgIEBzY3JlZW5MaW5lRm9yU2NyZWVuUm93KHRleHRFZGl0b3IsIHJhbmdlLnN0YXJ0LnJvdylcbiAgICAgIClcbiAgICAgIGlmIHJvd1NwYW4gPiAxXG4gICAgICAgIGZvciByb3cgaW4gW3JhbmdlLnN0YXJ0LnJvdyArIDEuLi5yYW5nZS5lbmQucm93XVxuICAgICAgICAgIHJlZ2lvbnMucHVzaCBAY3JlYXRlUmVnaW9uKFxuICAgICAgICAgICAge3JvdywgY29sdW1uOiAwfSxcbiAgICAgICAgICAgIHtyb3csIGNvbHVtbjogSW5maW5pdHl9LFxuICAgICAgICAgICAgY29sb3JNYXJrZXIsXG4gICAgICAgICAgICBAc2NyZWVuTGluZUZvclNjcmVlblJvdyh0ZXh0RWRpdG9yLCByb3cpXG4gICAgICAgICAgKVxuXG4gICAgICByZWdpb25zLnB1c2ggQGNyZWF0ZVJlZ2lvbihcbiAgICAgICAge3JvdzogcmFuZ2UuZW5kLnJvdywgY29sdW1uOiAwfSxcbiAgICAgICAgcmFuZ2UuZW5kLFxuICAgICAgICBjb2xvck1hcmtlcixcbiAgICAgICAgQHNjcmVlbkxpbmVGb3JTY3JlZW5Sb3codGV4dEVkaXRvciwgcmFuZ2UuZW5kLnJvdylcbiAgICAgIClcblxuICAgIHJlZ2lvbnNcblxuICBzY3JlZW5MaW5lRm9yU2NyZWVuUm93OiAodGV4dEVkaXRvciwgcm93KSAtPlxuICAgIGlmIHRleHRFZGl0b3Iuc2NyZWVuTGluZUZvclNjcmVlblJvdz9cbiAgICAgIHRleHRFZGl0b3Iuc2NyZWVuTGluZUZvclNjcmVlblJvdyhyb3cpXG4gICAgZWxzZVxuICAgICAgdGV4dEVkaXRvci5kaXNwbGF5QnVmZmVyLnNjcmVlbkxpbmVzW3Jvd11cblxuICBjcmVhdGVSZWdpb246IChzdGFydCwgZW5kLCBjb2xvck1hcmtlciwgc2NyZWVuTGluZSkgLT5cbiAgICB0ZXh0RWRpdG9yID0gY29sb3JNYXJrZXIuY29sb3JCdWZmZXIuZWRpdG9yXG4gICAgdGV4dEVkaXRvckVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcodGV4dEVkaXRvcilcblxuICAgIHJldHVybiB1bmxlc3MgdGV4dEVkaXRvckVsZW1lbnQuY29tcG9uZW50P1xuXG4gICAgbGluZUhlaWdodCA9IHRleHRFZGl0b3IuZ2V0TGluZUhlaWdodEluUGl4ZWxzKClcbiAgICBjaGFyV2lkdGggPSB0ZXh0RWRpdG9yLmdldERlZmF1bHRDaGFyV2lkdGgoKVxuXG4gICAgY2xpcHBlZFN0YXJ0ID0ge1xuICAgICAgcm93OiBzdGFydC5yb3dcbiAgICAgIGNvbHVtbjogQGNsaXBTY3JlZW5Db2x1bW4oc2NyZWVuTGluZSwgc3RhcnQuY29sdW1uKSA/IHN0YXJ0LmNvbHVtblxuICAgIH1cbiAgICBjbGlwcGVkRW5kID0ge1xuICAgICAgcm93OiBlbmQucm93XG4gICAgICBjb2x1bW46IEBjbGlwU2NyZWVuQ29sdW1uKHNjcmVlbkxpbmUsIGVuZC5jb2x1bW4pID8gZW5kLmNvbHVtblxuICAgIH1cblxuICAgIGJ1ZmZlclJhbmdlID0gdGV4dEVkaXRvci5idWZmZXJSYW5nZUZvclNjcmVlblJhbmdlKHtcbiAgICAgIHN0YXJ0OiBjbGlwcGVkU3RhcnRcbiAgICAgIGVuZDogY2xpcHBlZEVuZFxuICAgIH0pXG5cbiAgICBuZWVkQWRqdXN0bWVudCA9IHNjcmVlbkxpbmU/LmlzU29mdFdyYXBwZWQ/KCkgYW5kIGVuZC5jb2x1bW4gPj0gc2NyZWVuTGluZT8udGV4dC5sZW5ndGggLSBzY3JlZW5MaW5lPy5zb2Z0V3JhcEluZGVudGF0aW9uRGVsdGFcblxuICAgIGJ1ZmZlclJhbmdlLmVuZC5jb2x1bW4rKyBpZiBuZWVkQWRqdXN0bWVudFxuXG4gICAgc3RhcnRQb3NpdGlvbiA9IHRleHRFZGl0b3JFbGVtZW50LnBpeGVsUG9zaXRpb25Gb3JTY3JlZW5Qb3NpdGlvbihjbGlwcGVkU3RhcnQpXG4gICAgZW5kUG9zaXRpb24gPSB0ZXh0RWRpdG9yRWxlbWVudC5waXhlbFBvc2l0aW9uRm9yU2NyZWVuUG9zaXRpb24oY2xpcHBlZEVuZClcblxuICAgIHRleHQgPSB0ZXh0RWRpdG9yLmdldEJ1ZmZlcigpLmdldFRleHRJblJhbmdlKGJ1ZmZlclJhbmdlKVxuXG4gICAgY3NzID0ge31cbiAgICBjc3MubGVmdCA9IHN0YXJ0UG9zaXRpb24ubGVmdFxuICAgIGNzcy50b3AgPSBzdGFydFBvc2l0aW9uLnRvcFxuICAgIGNzcy53aWR0aCA9IGVuZFBvc2l0aW9uLmxlZnQgLSBzdGFydFBvc2l0aW9uLmxlZnRcbiAgICBjc3Mud2lkdGggKz0gY2hhcldpZHRoIGlmIG5lZWRBZGp1c3RtZW50XG4gICAgY3NzLmhlaWdodCA9IGxpbmVIZWlnaHRcblxuICAgIHJlZ2lvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgcmVnaW9uLmNsYXNzTmFtZSA9ICdyZWdpb24nXG4gICAgcmVnaW9uLnRleHRDb250ZW50ID0gdGV4dCBpZiBAaW5jbHVkZVRleHRJblJlZ2lvblxuICAgIHJlZ2lvbi5pbnZhbGlkID0gdHJ1ZSBpZiBzdGFydFBvc2l0aW9uLmxlZnQgaXMgZW5kUG9zaXRpb24ubGVmdFxuICAgIHJlZ2lvbi5zdHlsZVtuYW1lXSA9IHZhbHVlICsgJ3B4JyBmb3IgbmFtZSwgdmFsdWUgb2YgY3NzXG5cbiAgICByZWdpb25cblxuICBjbGlwU2NyZWVuQ29sdW1uOiAobGluZSwgY29sdW1uKSAtPlxuICAgIGlmIGxpbmU/XG4gICAgICBpZiBsaW5lLmNsaXBTY3JlZW5Db2x1bW4/XG4gICAgICAgIGxpbmUuY2xpcFNjcmVlbkNvbHVtbihjb2x1bW4pXG4gICAgICBlbHNlXG4gICAgICAgIE1hdGgubWluKGxpbmUubGluZVRleHQubGVuZ3RoLCBjb2x1bW4pXG4iXX0=
