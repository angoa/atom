(function() {
  var manuallyIndented;

  manuallyIndented = new WeakSet();

  module.exports = {
    getIndentation: function(editor) {
      var indentationName, softTabs, tabLength;
      softTabs = editor.getSoftTabs();
      tabLength = editor.getTabLength();
      if (softTabs) {
        indentationName = tabLength + ' Spaces';
      } else {
        indentationName = 'Tabs (' + tabLength + ' wide)';
      }
      return indentationName;
    },
    getIndentations: function() {
      return atom.config.get("auto-detect-indentation.indentationTypes");
    },
    autoDetectIndentation: function(editor) {
      var firstSpaces, found, i, j, length, lineCount, numLinesWithSpaces, numLinesWithTabs, ref, shortest, softTabs, spaceChars, tabLength;
      lineCount = editor.getLineCount();
      shortest = 0;
      numLinesWithTabs = 0;
      numLinesWithSpaces = 0;
      found = false;
      for (i = j = 0, ref = lineCount - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
        if (!(i < 100 || !found)) {
          continue;
        }
        if (editor.isBufferRowCommented(i)) {
          continue;
        }
        firstSpaces = editor.lineTextForBufferRow(i).match(/^([ \t]+)[^ \t]/m);
        if (firstSpaces) {
          spaceChars = firstSpaces[1];
          if (spaceChars[0] === '\t') {
            numLinesWithTabs++;
          } else {
            length = spaceChars.length;
            if (length === 1) {
              continue;
            }
            numLinesWithSpaces++;
            if (length < shortest || shortest === 0) {
              shortest = length;
            }
          }
          found = true;
        }
      }
      softTabs = null;
      tabLength = null;
      if (found) {
        if (numLinesWithTabs > numLinesWithSpaces) {
          softTabs = false;
        } else {
          softTabs = true;
          tabLength = shortest;
        }
      }
      return {
        softTabs: softTabs,
        tabLength: tabLength
      };
    },
    setIndentation: function(editor, indentation, automatic) {
      if (automatic == null) {
        automatic = false;
      }
      if (!automatic) {
        manuallyIndented.add(editor);
      }
      if (indentation.softTabs != null) {
        editor.setSoftTabs(indentation.softTabs);
      } else {
        editor.setSoftTabs(atom.config.get("editor.softTabs", {
          scope: editor.getRootScopeDescriptor().scopes
        }));
      }
      if (indentation.tabLength != null) {
        return editor.setTabLength(indentation.tabLength);
      } else {
        return editor.setTabLength(atom.config.get("editor.tabLength", {
          scope: editor.getRootScopeDescriptor().scopes
        }));
      }
    },
    isManuallyIndented: function(editor) {
      return manuallyIndented.has(editor);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2FuZ29hLy5hdG9tL3BhY2thZ2VzL2F1dG8tZGV0ZWN0LWluZGVudGF0aW9uL2xpYi9pbmRlbnRhdGlvbi1tYW5hZ2VyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsZ0JBQUEsR0FBdUIsSUFBQSxPQUFBLENBQUE7O0VBRXZCLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxjQUFBLEVBQWdCLFNBQUMsTUFBRDtBQUNkLFVBQUE7TUFBQSxRQUFBLEdBQVcsTUFBTSxDQUFDLFdBQVAsQ0FBQTtNQUNYLFNBQUEsR0FBWSxNQUFNLENBQUMsWUFBUCxDQUFBO01BQ1osSUFBRyxRQUFIO1FBQ0UsZUFBQSxHQUFrQixTQUFBLEdBQVksVUFEaEM7T0FBQSxNQUFBO1FBR0UsZUFBQSxHQUFrQixRQUFBLEdBQVcsU0FBWCxHQUF1QixTQUgzQzs7YUFJQTtJQVBjLENBQWhCO0lBU0EsZUFBQSxFQUFpQixTQUFBO2FBQ2YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDBDQUFoQjtJQURlLENBVGpCO0lBWUEscUJBQUEsRUFBdUIsU0FBQyxNQUFEO0FBQ3JCLFVBQUE7TUFBQSxTQUFBLEdBQVksTUFBTSxDQUFDLFlBQVAsQ0FBQTtNQUNaLFFBQUEsR0FBVztNQUNYLGdCQUFBLEdBQW1CO01BQ25CLGtCQUFBLEdBQXFCO01BQ3JCLEtBQUEsR0FBUTtBQUdSLFdBQVMsd0ZBQVQ7Y0FBZ0MsQ0FBQSxHQUFJLEdBQUosSUFBVyxDQUFJOzs7UUFHN0MsSUFBWSxNQUFNLENBQUMsb0JBQVAsQ0FBNEIsQ0FBNUIsQ0FBWjtBQUFBLG1CQUFBOztRQUVBLFdBQUEsR0FBYyxNQUFNLENBQUMsb0JBQVAsQ0FBNEIsQ0FBNUIsQ0FBOEIsQ0FBQyxLQUEvQixDQUFxQyxrQkFBckM7UUFFZCxJQUFHLFdBQUg7VUFDRSxVQUFBLEdBQWEsV0FBWSxDQUFBLENBQUE7VUFFekIsSUFBRyxVQUFXLENBQUEsQ0FBQSxDQUFYLEtBQWlCLElBQXBCO1lBQ0UsZ0JBQUEsR0FERjtXQUFBLE1BQUE7WUFHRSxNQUFBLEdBQVMsVUFBVSxDQUFDO1lBR3BCLElBQVksTUFBQSxLQUFVLENBQXRCO0FBQUEsdUJBQUE7O1lBRUEsa0JBQUE7WUFFQSxJQUFxQixNQUFBLEdBQVMsUUFBVCxJQUFxQixRQUFBLEtBQVksQ0FBdEQ7Y0FBQSxRQUFBLEdBQVcsT0FBWDthQVZGOztVQVlBLEtBQUEsR0FBUSxLQWZWOztBQVBGO01Bd0JBLFFBQUEsR0FBVztNQUNYLFNBQUEsR0FBWTtNQUVaLElBQUcsS0FBSDtRQUNFLElBQUcsZ0JBQUEsR0FBbUIsa0JBQXRCO1VBQ0UsUUFBQSxHQUFXLE1BRGI7U0FBQSxNQUFBO1VBR0UsUUFBQSxHQUFXO1VBQ1gsU0FBQSxHQUFZLFNBSmQ7U0FERjs7QUFPQSxhQUNFO1FBQUEsUUFBQSxFQUFVLFFBQVY7UUFDQSxTQUFBLEVBQVcsU0FEWDs7SUEzQ21CLENBWnZCO0lBMkRBLGNBQUEsRUFBZ0IsU0FBQyxNQUFELEVBQVMsV0FBVCxFQUFzQixTQUF0Qjs7UUFBc0IsWUFBWTs7TUFDaEQsSUFBQSxDQUFPLFNBQVA7UUFDRSxnQkFBZ0IsQ0FBQyxHQUFqQixDQUFxQixNQUFyQixFQURGOztNQUdBLElBQUcsNEJBQUg7UUFDRSxNQUFNLENBQUMsV0FBUCxDQUFtQixXQUFXLENBQUMsUUFBL0IsRUFERjtPQUFBLE1BQUE7UUFHRSxNQUFNLENBQUMsV0FBUCxDQUFtQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsaUJBQWhCLEVBQW1DO1VBQUEsS0FBQSxFQUFPLE1BQU0sQ0FBQyxzQkFBUCxDQUFBLENBQStCLENBQUMsTUFBdkM7U0FBbkMsQ0FBbkIsRUFIRjs7TUFLQSxJQUFHLDZCQUFIO2VBQ0UsTUFBTSxDQUFDLFlBQVAsQ0FBb0IsV0FBVyxDQUFDLFNBQWhDLEVBREY7T0FBQSxNQUFBO2VBR0UsTUFBTSxDQUFDLFlBQVAsQ0FBb0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGtCQUFoQixFQUFvQztVQUFBLEtBQUEsRUFBTyxNQUFNLENBQUMsc0JBQVAsQ0FBQSxDQUErQixDQUFDLE1BQXZDO1NBQXBDLENBQXBCLEVBSEY7O0lBVGMsQ0EzRGhCO0lBeUVBLGtCQUFBLEVBQW9CLFNBQUMsTUFBRDtBQUNsQixhQUFPLGdCQUFnQixDQUFDLEdBQWpCLENBQXFCLE1BQXJCO0lBRFcsQ0F6RXBCOztBQUhGIiwic291cmNlc0NvbnRlbnQiOlsibWFudWFsbHlJbmRlbnRlZCA9IG5ldyBXZWFrU2V0KClcblxubW9kdWxlLmV4cG9ydHMgPVxuICBnZXRJbmRlbnRhdGlvbjogKGVkaXRvcikgLT5cbiAgICBzb2Z0VGFicyA9IGVkaXRvci5nZXRTb2Z0VGFicygpXG4gICAgdGFiTGVuZ3RoID0gZWRpdG9yLmdldFRhYkxlbmd0aCgpXG4gICAgaWYgc29mdFRhYnNcbiAgICAgIGluZGVudGF0aW9uTmFtZSA9IHRhYkxlbmd0aCArICcgU3BhY2VzJ1xuICAgIGVsc2VcbiAgICAgIGluZGVudGF0aW9uTmFtZSA9ICdUYWJzICgnICsgdGFiTGVuZ3RoICsgJyB3aWRlKSdcbiAgICBpbmRlbnRhdGlvbk5hbWVcblxuICBnZXRJbmRlbnRhdGlvbnM6IC0+XG4gICAgYXRvbS5jb25maWcuZ2V0KFwiYXV0by1kZXRlY3QtaW5kZW50YXRpb24uaW5kZW50YXRpb25UeXBlc1wiKVxuXG4gIGF1dG9EZXRlY3RJbmRlbnRhdGlvbjogKGVkaXRvcikgLT5cbiAgICBsaW5lQ291bnQgPSBlZGl0b3IuZ2V0TGluZUNvdW50KClcbiAgICBzaG9ydGVzdCA9IDBcbiAgICBudW1MaW5lc1dpdGhUYWJzID0gMFxuICAgIG51bUxpbmVzV2l0aFNwYWNlcyA9IDBcbiAgICBmb3VuZCA9IGZhbHNlXG5cbiAgICAjIGxvb3AgdGhyb3VnaCBtb3JlIHRoYW4gMTAwIGxpbmVzIG9ubHkgaWYgd2UgaGF2ZW4ndCBmb3VuZCBhbnkgc3BhY2VzIHlldFxuICAgIGZvciBpIGluIFswLi5saW5lQ291bnQtMV0gd2hlbiAoaSA8IDEwMCBvciBub3QgZm91bmQpXG5cbiAgICAgICMgU2tpcCBjb21tZW50c1xuICAgICAgY29udGludWUgaWYgZWRpdG9yLmlzQnVmZmVyUm93Q29tbWVudGVkIGlcblxuICAgICAgZmlyc3RTcGFjZXMgPSBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3coaSkubWF0Y2ggL14oWyBcXHRdKylbXiBcXHRdL21cblxuICAgICAgaWYgZmlyc3RTcGFjZXNcbiAgICAgICAgc3BhY2VDaGFycyA9IGZpcnN0U3BhY2VzWzFdXG5cbiAgICAgICAgaWYgc3BhY2VDaGFyc1swXSBpcyAnXFx0J1xuICAgICAgICAgIG51bUxpbmVzV2l0aFRhYnMrK1xuICAgICAgICBlbHNlXG4gICAgICAgICAgbGVuZ3RoID0gc3BhY2VDaGFycy5sZW5ndGhcblxuICAgICAgICAgICMgYXNzdW1lIG5vYm9keSB1c2VzIHNpbmdsZSBzcGFjZSBzcGFjaW5nXG4gICAgICAgICAgY29udGludWUgaWYgbGVuZ3RoIGlzIDFcblxuICAgICAgICAgIG51bUxpbmVzV2l0aFNwYWNlcysrXG5cbiAgICAgICAgICBzaG9ydGVzdCA9IGxlbmd0aCBpZiBsZW5ndGggPCBzaG9ydGVzdCBvciBzaG9ydGVzdCBpcyAwXG5cbiAgICAgICAgZm91bmQgPSB0cnVlXG5cbiAgICBzb2Z0VGFicyA9IG51bGxcbiAgICB0YWJMZW5ndGggPSBudWxsXG5cbiAgICBpZiBmb3VuZFxuICAgICAgaWYgbnVtTGluZXNXaXRoVGFicyA+IG51bUxpbmVzV2l0aFNwYWNlc1xuICAgICAgICBzb2Z0VGFicyA9IGZhbHNlXG4gICAgICBlbHNlXG4gICAgICAgIHNvZnRUYWJzID0gdHJ1ZVxuICAgICAgICB0YWJMZW5ndGggPSBzaG9ydGVzdFxuXG4gICAgcmV0dXJuIChcbiAgICAgIHNvZnRUYWJzOiBzb2Z0VGFic1xuICAgICAgdGFiTGVuZ3RoOiB0YWJMZW5ndGhcbiAgICApXG5cbiAgc2V0SW5kZW50YXRpb246IChlZGl0b3IsIGluZGVudGF0aW9uLCBhdXRvbWF0aWMgPSBmYWxzZSkgLT5cbiAgICB1bmxlc3MgYXV0b21hdGljXG4gICAgICBtYW51YWxseUluZGVudGVkLmFkZChlZGl0b3IpXG4gICAgXG4gICAgaWYgaW5kZW50YXRpb24uc29mdFRhYnM/XG4gICAgICBlZGl0b3Iuc2V0U29mdFRhYnMgaW5kZW50YXRpb24uc29mdFRhYnNcbiAgICBlbHNlXG4gICAgICBlZGl0b3Iuc2V0U29mdFRhYnMgYXRvbS5jb25maWcuZ2V0KFwiZWRpdG9yLnNvZnRUYWJzXCIsIHNjb3BlOiBlZGl0b3IuZ2V0Um9vdFNjb3BlRGVzY3JpcHRvcigpLnNjb3BlcylcbiAgICBcbiAgICBpZiBpbmRlbnRhdGlvbi50YWJMZW5ndGg/XG4gICAgICBlZGl0b3Iuc2V0VGFiTGVuZ3RoIGluZGVudGF0aW9uLnRhYkxlbmd0aFxuICAgIGVsc2VcbiAgICAgIGVkaXRvci5zZXRUYWJMZW5ndGggYXRvbS5jb25maWcuZ2V0KFwiZWRpdG9yLnRhYkxlbmd0aFwiLCBzY29wZTogZWRpdG9yLmdldFJvb3RTY29wZURlc2NyaXB0b3IoKS5zY29wZXMpXG5cbiAgaXNNYW51YWxseUluZGVudGVkOiAoZWRpdG9yKSAtPlxuICAgIHJldHVybiBtYW51YWxseUluZGVudGVkLmhhcyBlZGl0b3JcbiJdfQ==
