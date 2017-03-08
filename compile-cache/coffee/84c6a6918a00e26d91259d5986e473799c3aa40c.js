(function() {
  module.exports = {
    statusBar: null,
    activate: function() {},
    deactivate: function() {
      var ref;
      if ((ref = this.statusBarTile) != null) {
        ref.destroy();
      }
      return this.statusBarTile = null;
    },
    provideRunInTerminal: function() {
      return {
        run: (function(_this) {
          return function(commands) {
            return _this.statusBarTile.runCommandInNewTerminal(commands);
          };
        })(this),
        getTerminalViews: (function(_this) {
          return function() {
            return _this.statusBarTile.terminalViews;
          };
        })(this)
      };
    },
    consumeStatusBar: function(statusBarProvider) {
      return this.statusBarTile = new (require('./status-bar'))(statusBarProvider);
    },
    config: {
      toggles: {
        type: 'object',
        order: 1,
        properties: {
          autoClose: {
            title: 'Close Terminal on Exit',
            description: 'Should the terminal close if the shell exits?',
            type: 'boolean',
            "default": false
          },
          cursorBlink: {
            title: 'Cursor Blink',
            description: 'Should the cursor blink when the terminal is active?',
            type: 'boolean',
            "default": true
          },
          runInsertedText: {
            title: 'Run Inserted Text',
            description: 'Run text inserted via `platformio-ide-terminal:insert-text` as a command? **This will append an end-of-line character to input.**',
            type: 'boolean',
            "default": true
          },
          selectToCopy: {
            title: 'Select To Copy',
            description: 'Copies text to clipboard when selection happens.',
            type: 'boolean',
            "default": true
          }
        }
      },
      core: {
        type: 'object',
        order: 2,
        properties: {
          autoRunCommand: {
            title: 'Auto Run Command',
            description: 'Command to run on terminal initialization.',
            type: 'string',
            "default": ''
          },
          mapTerminalsTo: {
            title: 'Map Terminals To',
            description: 'Map terminals to each file or folder. Default is no action or mapping at all. **Restart required.**',
            type: 'string',
            "default": 'None',
            "enum": ['None', 'File', 'Folder']
          },
          mapTerminalsToAutoOpen: {
            title: 'Auto Open a New Terminal (For Terminal Mapping)',
            description: 'Should a new terminal be opened for new items? **Note:** This works in conjunction with `Map Terminals To` above.',
            type: 'boolean',
            "default": false
          },
          scrollback: {
            title: 'Scroll Back',
            description: 'How many lines of history should be kept?',
            type: 'integer',
            "default": 1000
          },
          shell: {
            title: 'Shell Override',
            description: 'Override the default shell instance to launch.',
            type: 'string',
            "default": (function() {
              var path;
              if (process.platform === 'win32') {
                path = require('path');
                return path.resolve(process.env.SystemRoot, 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe');
              } else {
                return process.env.SHELL || '/bin/bash';
              }
            })()
          },
          shellArguments: {
            title: 'Shell Arguments',
            description: 'Specify some arguments to use when launching the shell.',
            type: 'string',
            "default": ''
          },
          workingDirectory: {
            title: 'Working Directory',
            description: 'Which directory should be the present working directory when a new terminal is made?',
            type: 'string',
            "default": 'Project',
            "enum": ['Home', 'Project', 'Active File']
          }
        }
      },
      style: {
        type: 'object',
        order: 3,
        properties: {
          animationSpeed: {
            title: 'Animation Speed',
            description: 'How fast should the window animate?',
            type: 'number',
            "default": '1',
            minimum: '0',
            maximum: '100'
          },
          fontFamily: {
            title: 'Font Family',
            description: 'Override the terminal\'s default font family. **You must use a [monospaced font](https://en.wikipedia.org/wiki/List_of_typefaces#Monospace)!**',
            type: 'string',
            "default": ''
          },
          fontSize: {
            title: 'Font Size',
            description: 'Override the terminal\'s default font size.',
            type: 'string',
            "default": ''
          },
          defaultPanelHeight: {
            title: 'Default Panel Height',
            description: 'Default height of a terminal panel. **You may enter a value in px, em, or %.**',
            type: 'string',
            "default": '300px'
          },
          theme: {
            title: 'Theme',
            description: 'Select a theme for the terminal.',
            type: 'string',
            "default": 'standard',
            "enum": ['standard', 'inverse', 'linux', 'grass', 'homebrew', 'man-page', 'novel', 'ocean', 'pro', 'red', 'red-sands', 'silver-aerogel', 'solarized-dark', 'solid-colors', 'dracula', 'one-dark', 'christmas']
          }
        }
      },
      ansiColors: {
        type: 'object',
        order: 4,
        properties: {
          normal: {
            type: 'object',
            order: 1,
            properties: {
              black: {
                title: 'Black',
                description: 'Black color used for terminal ANSI color set.',
                type: 'color',
                "default": '#000000'
              },
              red: {
                title: 'Red',
                description: 'Red color used for terminal ANSI color set.',
                type: 'color',
                "default": '#CD0000'
              },
              green: {
                title: 'Green',
                description: 'Green color used for terminal ANSI color set.',
                type: 'color',
                "default": '#00CD00'
              },
              yellow: {
                title: 'Yellow',
                description: 'Yellow color used for terminal ANSI color set.',
                type: 'color',
                "default": '#CDCD00'
              },
              blue: {
                title: 'Blue',
                description: 'Blue color used for terminal ANSI color set.',
                type: 'color',
                "default": '#0000CD'
              },
              magenta: {
                title: 'Magenta',
                description: 'Magenta color used for terminal ANSI color set.',
                type: 'color',
                "default": '#CD00CD'
              },
              cyan: {
                title: 'Cyan',
                description: 'Cyan color used for terminal ANSI color set.',
                type: 'color',
                "default": '#00CDCD'
              },
              white: {
                title: 'White',
                description: 'White color used for terminal ANSI color set.',
                type: 'color',
                "default": '#E5E5E5'
              }
            }
          },
          zBright: {
            type: 'object',
            order: 2,
            properties: {
              brightBlack: {
                title: 'Bright Black',
                description: 'Bright black color used for terminal ANSI color set.',
                type: 'color',
                "default": '#7F7F7F'
              },
              brightRed: {
                title: 'Bright Red',
                description: 'Bright red color used for terminal ANSI color set.',
                type: 'color',
                "default": '#FF0000'
              },
              brightGreen: {
                title: 'Bright Green',
                description: 'Bright green color used for terminal ANSI color set.',
                type: 'color',
                "default": '#00FF00'
              },
              brightYellow: {
                title: 'Bright Yellow',
                description: 'Bright yellow color used for terminal ANSI color set.',
                type: 'color',
                "default": '#FFFF00'
              },
              brightBlue: {
                title: 'Bright Blue',
                description: 'Bright blue color used for terminal ANSI color set.',
                type: 'color',
                "default": '#0000FF'
              },
              brightMagenta: {
                title: 'Bright Magenta',
                description: 'Bright magenta color used for terminal ANSI color set.',
                type: 'color',
                "default": '#FF00FF'
              },
              brightCyan: {
                title: 'Bright Cyan',
                description: 'Bright cyan color used for terminal ANSI color set.',
                type: 'color',
                "default": '#00FFFF'
              },
              brightWhite: {
                title: 'Bright White',
                description: 'Bright white color used for terminal ANSI color set.',
                type: 'color',
                "default": '#FFFFFF'
              }
            }
          }
        }
      },
      iconColors: {
        type: 'object',
        order: 5,
        properties: {
          red: {
            title: 'Status Icon Red',
            description: 'Red color used for status icon.',
            type: 'color',
            "default": 'red'
          },
          orange: {
            title: 'Status Icon Orange',
            description: 'Orange color used for status icon.',
            type: 'color',
            "default": 'orange'
          },
          yellow: {
            title: 'Status Icon Yellow',
            description: 'Yellow color used for status icon.',
            type: 'color',
            "default": 'yellow'
          },
          green: {
            title: 'Status Icon Green',
            description: 'Green color used for status icon.',
            type: 'color',
            "default": 'green'
          },
          blue: {
            title: 'Status Icon Blue',
            description: 'Blue color used for status icon.',
            type: 'color',
            "default": 'blue'
          },
          purple: {
            title: 'Status Icon Purple',
            description: 'Purple color used for status icon.',
            type: 'color',
            "default": 'purple'
          },
          pink: {
            title: 'Status Icon Pink',
            description: 'Pink color used for status icon.',
            type: 'color',
            "default": 'hotpink'
          },
          cyan: {
            title: 'Status Icon Cyan',
            description: 'Cyan color used for status icon.',
            type: 'color',
            "default": 'cyan'
          },
          magenta: {
            title: 'Status Icon Magenta',
            description: 'Magenta color used for status icon.',
            type: 'color',
            "default": 'magenta'
          }
        }
      },
      customTexts: {
        type: 'object',
        order: 6,
        properties: {
          customText1: {
            title: 'Custom text 1',
            description: 'Text to paste when calling platformio-ide-terminal:insert-custom-text-1, $S is replaced by selection, $F is replaced by file name, $D is replaced by file directory, $L is replaced by line number of cursor, $$ is replaced by $',
            type: 'string',
            "default": ''
          },
          customText2: {
            title: 'Custom text 2',
            description: 'Text to paste when calling platformio-ide-terminal:insert-custom-text-2',
            type: 'string',
            "default": ''
          },
          customText3: {
            title: 'Custom text 3',
            description: 'Text to paste when calling platformio-ide-terminal:insert-custom-text-3',
            type: 'string',
            "default": ''
          },
          customText4: {
            title: 'Custom text 4',
            description: 'Text to paste when calling platformio-ide-terminal:insert-custom-text-4',
            type: 'string',
            "default": ''
          },
          customText5: {
            title: 'Custom text 5',
            description: 'Text to paste when calling platformio-ide-terminal:insert-custom-text-5',
            type: 'string',
            "default": ''
          },
          customText6: {
            title: 'Custom text 6',
            description: 'Text to paste when calling platformio-ide-terminal:insert-custom-text-6',
            type: 'string',
            "default": ''
          },
          customText7: {
            title: 'Custom text 7',
            description: 'Text to paste when calling platformio-ide-terminal:insert-custom-text-7',
            type: 'string',
            "default": ''
          },
          customText8: {
            title: 'Custom text 8',
            description: 'Text to paste when calling platformio-ide-terminal:insert-custom-text-8',
            type: 'string',
            "default": ''
          }
        }
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2FuZ29hLy5hdG9tL3BhY2thZ2VzL3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsL2xpYi9wbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQSxNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsU0FBQSxFQUFXLElBQVg7SUFFQSxRQUFBLEVBQVUsU0FBQSxHQUFBLENBRlY7SUFJQSxVQUFBLEVBQVksU0FBQTtBQUNWLFVBQUE7O1dBQWMsQ0FBRSxPQUFoQixDQUFBOzthQUNBLElBQUMsQ0FBQSxhQUFELEdBQWlCO0lBRlAsQ0FKWjtJQVFBLG9CQUFBLEVBQXNCLFNBQUE7YUFDcEI7UUFBQSxHQUFBLEVBQUssQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQyxRQUFEO21CQUNILEtBQUMsQ0FBQSxhQUFhLENBQUMsdUJBQWYsQ0FBdUMsUUFBdkM7VUFERztRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBTDtRQUVBLGdCQUFBLEVBQWtCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQ2hCLEtBQUMsQ0FBQSxhQUFhLENBQUM7VUFEQztRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FGbEI7O0lBRG9CLENBUnRCO0lBY0EsZ0JBQUEsRUFBa0IsU0FBQyxpQkFBRDthQUNoQixJQUFDLENBQUEsYUFBRCxHQUFxQixJQUFBLENBQUMsT0FBQSxDQUFRLGNBQVIsQ0FBRCxDQUFBLENBQXlCLGlCQUF6QjtJQURMLENBZGxCO0lBaUJBLE1BQUEsRUFDRTtNQUFBLE9BQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO1FBQ0EsS0FBQSxFQUFPLENBRFA7UUFFQSxVQUFBLEVBQ0U7VUFBQSxTQUFBLEVBQ0U7WUFBQSxLQUFBLEVBQU8sd0JBQVA7WUFDQSxXQUFBLEVBQWEsK0NBRGI7WUFFQSxJQUFBLEVBQU0sU0FGTjtZQUdBLENBQUEsT0FBQSxDQUFB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RUEsSUFBQSxFQUFNLFFBRk47WUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEVBSFQ7V0FyQkY7VUF5QkEsV0FBQSxFQUNFO1lBQUEsS0FBQSxFQUFPLGVBQVA7WUFDQSxXQUFBLEVBQWEseUVBRGI7WUFFQSxJQUFBLEVBQU0sUUFGTjtZQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsRUFIVDtXQTFCRjtVQThCQSxXQUFBLEVBQ0U7WUFBQSxLQUFBLEVBQU8sZUFBUDtZQUNBLFdBQUEsRUFBYSx5RUFEYjtZQUVBLElBQUEsRUFBTSxRQUZOO1lBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxFQUhUO1dBL0JGO1VBbUNBLFdBQUEsRUFDRTtZQUFBLEtBQUEsRUFBTyxlQUFQO1lBQ0EsV0FBQSxFQUFhLHlFQURiO1lBRUEsSUFBQSxFQUFNLFFBRk47WUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEVBSFQ7V0FwQ0Y7U0FIRjtPQXRRRjtLQWxCRjs7QUFERiIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID1cbiAgc3RhdHVzQmFyOiBudWxsXG5cbiAgYWN0aXZhdGU6IC0+XG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICBAc3RhdHVzQmFyVGlsZT8uZGVzdHJveSgpXG4gICAgQHN0YXR1c0JhclRpbGUgPSBudWxsXG5cbiAgcHJvdmlkZVJ1bkluVGVybWluYWw6IC0+XG4gICAgcnVuOiAoY29tbWFuZHMpID0+XG4gICAgICBAc3RhdHVzQmFyVGlsZS5ydW5Db21tYW5kSW5OZXdUZXJtaW5hbCBjb21tYW5kc1xuICAgIGdldFRlcm1pbmFsVmlld3M6ICgpID0+XG4gICAgICBAc3RhdHVzQmFyVGlsZS50ZXJtaW5hbFZpZXdzXG5cbiAgY29uc3VtZVN0YXR1c0JhcjogKHN0YXR1c0JhclByb3ZpZGVyKSAtPlxuICAgIEBzdGF0dXNCYXJUaWxlID0gbmV3IChyZXF1aXJlICcuL3N0YXR1cy1iYXInKShzdGF0dXNCYXJQcm92aWRlcilcblxuICBjb25maWc6XG4gICAgdG9nZ2xlczpcbiAgICAgIHR5cGU6ICdvYmplY3QnXG4gICAgICBvcmRlcjogMVxuICAgICAgcHJvcGVydGllczpcbiAgICAgICAgYXV0b0Nsb3NlOlxuICAgICAgICAgIHRpdGxlOiAnQ2xvc2UgVGVybWluYWwgb24gRXhpdCdcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1Nob3VsZCB0aGUgdGVybWluYWwgY2xvc2UgaWYgdGhlIHNoZWxsIGV4aXRzPydcbiAgICAgICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgICBjdXJzb3JCbGluazpcbiAgICAgICAgICB0aXRsZTogJ0N1cnNvciBCbGluaydcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1Nob3VsZCB0aGUgY3Vyc29yIGJsaW5rIHdoZW4gdGhlIHRlcm1pbmFsIGlzIGFjdGl2ZT8nXG4gICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgICBydW5JbnNlcnRlZFRleHQ6XG4gICAgICAgICAgdGl0bGU6ICdSdW4gSW5zZXJ0ZWQgVGV4dCdcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1J1biB0ZXh0IGluc2VydGVkIHZpYSBgcGxhdGZvcm1pby1pZGUtdGVybWluYWw6aW5zZXJ0LXRleHRgIGFzIGEgY29tbWFuZD8gKipUaGlzIHdpbGwgYXBwZW5kIGFuIGVuZC1vZi1saW5lIGNoYXJhY3RlciB0byBpbnB1dC4qKidcbiAgICAgICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICAgIHNlbGVjdFRvQ29weTpcbiAgICAgICAgICB0aXRsZTogJ1NlbGVjdCBUbyBDb3B5J1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQ29waWVzIHRleHQgdG8gY2xpcGJvYXJkIHdoZW4gc2VsZWN0aW9uIGhhcHBlbnMuJ1xuICAgICAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICBjb3JlOlxuICAgICAgdHlwZTogJ29iamVjdCdcbiAgICAgIG9yZGVyOiAyXG4gICAgICBwcm9wZXJ0aWVzOlxuICAgICAgICBhdXRvUnVuQ29tbWFuZDpcbiAgICAgICAgICB0aXRsZTogJ0F1dG8gUnVuIENvbW1hbmQnXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdDb21tYW5kIHRvIHJ1biBvbiB0ZXJtaW5hbCBpbml0aWFsaXphdGlvbi4nXG4gICAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgICAgICBkZWZhdWx0OiAnJ1xuICAgICAgICBtYXBUZXJtaW5hbHNUbzpcbiAgICAgICAgICB0aXRsZTogJ01hcCBUZXJtaW5hbHMgVG8nXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdNYXAgdGVybWluYWxzIHRvIGVhY2ggZmlsZSBvciBmb2xkZXIuIERlZmF1bHQgaXMgbm8gYWN0aW9uIG9yIG1hcHBpbmcgYXQgYWxsLiAqKlJlc3RhcnQgcmVxdWlyZWQuKionXG4gICAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgICAgICBkZWZhdWx0OiAnTm9uZSdcbiAgICAgICAgICBlbnVtOiBbJ05vbmUnLCAnRmlsZScsICdGb2xkZXInXVxuICAgICAgICBtYXBUZXJtaW5hbHNUb0F1dG9PcGVuOlxuICAgICAgICAgIHRpdGxlOiAnQXV0byBPcGVuIGEgTmV3IFRlcm1pbmFsIChGb3IgVGVybWluYWwgTWFwcGluZyknXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdTaG91bGQgYSBuZXcgdGVybWluYWwgYmUgb3BlbmVkIGZvciBuZXcgaXRlbXM/ICoqTm90ZToqKiBUaGlzIHdvcmtzIGluIGNvbmp1bmN0aW9uIHdpdGggYE1hcCBUZXJtaW5hbHMgVG9gIGFib3ZlLidcbiAgICAgICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgICBzY3JvbGxiYWNrOlxuICAgICAgICAgIHRpdGxlOiAnU2Nyb2xsIEJhY2snXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdIb3cgbWFueSBsaW5lcyBvZiBoaXN0b3J5IHNob3VsZCBiZSBrZXB0PydcbiAgICAgICAgICB0eXBlOiAnaW50ZWdlcidcbiAgICAgICAgICBkZWZhdWx0OiAxMDAwXG4gICAgICAgIHNoZWxsOlxuICAgICAgICAgIHRpdGxlOiAnU2hlbGwgT3ZlcnJpZGUnXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdPdmVycmlkZSB0aGUgZGVmYXVsdCBzaGVsbCBpbnN0YW5jZSB0byBsYXVuY2guJ1xuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgICAgZGVmYXVsdDogZG8gLT5cbiAgICAgICAgICAgIGlmIHByb2Nlc3MucGxhdGZvcm0gaXMgJ3dpbjMyJ1xuICAgICAgICAgICAgICBwYXRoID0gcmVxdWlyZSAncGF0aCdcbiAgICAgICAgICAgICAgcGF0aC5yZXNvbHZlKHByb2Nlc3MuZW52LlN5c3RlbVJvb3QsICdTeXN0ZW0zMicsICdXaW5kb3dzUG93ZXJTaGVsbCcsICd2MS4wJywgJ3Bvd2Vyc2hlbGwuZXhlJylcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgcHJvY2Vzcy5lbnYuU0hFTEwgfHwgJy9iaW4vYmFzaCdcbiAgICAgICAgc2hlbGxBcmd1bWVudHM6XG4gICAgICAgICAgdGl0bGU6ICdTaGVsbCBBcmd1bWVudHMnXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdTcGVjaWZ5IHNvbWUgYXJndW1lbnRzIHRvIHVzZSB3aGVuIGxhdW5jaGluZyB0aGUgc2hlbGwuJ1xuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgICAgZGVmYXVsdDogJydcbiAgICAgICAgd29ya2luZ0RpcmVjdG9yeTpcbiAgICAgICAgICB0aXRsZTogJ1dvcmtpbmcgRGlyZWN0b3J5J1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnV2hpY2ggZGlyZWN0b3J5IHNob3VsZCBiZSB0aGUgcHJlc2VudCB3b3JraW5nIGRpcmVjdG9yeSB3aGVuIGEgbmV3IHRlcm1pbmFsIGlzIG1hZGU/J1xuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgICAgZGVmYXVsdDogJ1Byb2plY3QnXG4gICAgICAgICAgZW51bTogWydIb21lJywgJ1Byb2plY3QnLCAnQWN0aXZlIEZpbGUnXVxuICAgIHN0eWxlOlxuICAgICAgdHlwZTogJ29iamVjdCdcbiAgICAgIG9yZGVyOiAzXG4gICAgICBwcm9wZXJ0aWVzOlxuICAgICAgICBhbmltYXRpb25TcGVlZDpcbiAgICAgICAgICB0aXRsZTogJ0FuaW1hdGlvbiBTcGVlZCdcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ0hvdyBmYXN0IHNob3VsZCB0aGUgd2luZG93IGFuaW1hdGU/J1xuICAgICAgICAgIHR5cGU6ICdudW1iZXInXG4gICAgICAgICAgZGVmYXVsdDogJzEnXG4gICAgICAgICAgbWluaW11bTogJzAnXG4gICAgICAgICAgbWF4aW11bTogJzEwMCdcbiAgICAgICAgZm9udEZhbWlseTpcbiAgICAgICAgICB0aXRsZTogJ0ZvbnQgRmFtaWx5J1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnT3ZlcnJpZGUgdGhlIHRlcm1pbmFsXFwncyBkZWZhdWx0IGZvbnQgZmFtaWx5LiAqKllvdSBtdXN0IHVzZSBhIFttb25vc3BhY2VkIGZvbnRdKGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0xpc3Rfb2ZfdHlwZWZhY2VzI01vbm9zcGFjZSkhKionXG4gICAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgICAgICBkZWZhdWx0OiAnJ1xuICAgICAgICBmb250U2l6ZTpcbiAgICAgICAgICB0aXRsZTogJ0ZvbnQgU2l6ZSdcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ092ZXJyaWRlIHRoZSB0ZXJtaW5hbFxcJ3MgZGVmYXVsdCBmb250IHNpemUuJ1xuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgICAgZGVmYXVsdDogJydcbiAgICAgICAgZGVmYXVsdFBhbmVsSGVpZ2h0OlxuICAgICAgICAgIHRpdGxlOiAnRGVmYXVsdCBQYW5lbCBIZWlnaHQnXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdEZWZhdWx0IGhlaWdodCBvZiBhIHRlcm1pbmFsIHBhbmVsLiAqKllvdSBtYXkgZW50ZXIgYSB2YWx1ZSBpbiBweCwgZW0sIG9yICUuKionXG4gICAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgICAgICBkZWZhdWx0OiAnMzAwcHgnXG4gICAgICAgIHRoZW1lOlxuICAgICAgICAgIHRpdGxlOiAnVGhlbWUnXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdTZWxlY3QgYSB0aGVtZSBmb3IgdGhlIHRlcm1pbmFsLidcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgICAgIGRlZmF1bHQ6ICdzdGFuZGFyZCdcbiAgICAgICAgICBlbnVtOiBbXG4gICAgICAgICAgICAnc3RhbmRhcmQnLFxuICAgICAgICAgICAgJ2ludmVyc2UnLFxuICAgICAgICAgICAgJ2xpbnV4JyxcbiAgICAgICAgICAgICdncmFzcycsXG4gICAgICAgICAgICAnaG9tZWJyZXcnLFxuICAgICAgICAgICAgJ21hbi1wYWdlJyxcbiAgICAgICAgICAgICdub3ZlbCcsXG4gICAgICAgICAgICAnb2NlYW4nLFxuICAgICAgICAgICAgJ3BybycsXG4gICAgICAgICAgICAncmVkJyxcbiAgICAgICAgICAgICdyZWQtc2FuZHMnLFxuICAgICAgICAgICAgJ3NpbHZlci1hZXJvZ2VsJyxcbiAgICAgICAgICAgICdzb2xhcml6ZWQtZGFyaycsXG4gICAgICAgICAgICAnc29saWQtY29sb3JzJyxcbiAgICAgICAgICAgICdkcmFjdWxhJyxcbiAgICAgICAgICAgICdvbmUtZGFyaycsXG4gICAgICAgICAgICAnY2hyaXN0bWFzJ1xuICAgICAgICAgIF1cbiAgICBhbnNpQ29sb3JzOlxuICAgICAgdHlwZTogJ29iamVjdCdcbiAgICAgIG9yZGVyOiA0XG4gICAgICBwcm9wZXJ0aWVzOlxuICAgICAgICBub3JtYWw6XG4gICAgICAgICAgdHlwZTogJ29iamVjdCdcbiAgICAgICAgICBvcmRlcjogMVxuICAgICAgICAgIHByb3BlcnRpZXM6XG4gICAgICAgICAgICBibGFjazpcbiAgICAgICAgICAgICAgdGl0bGU6ICdCbGFjaydcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdCbGFjayBjb2xvciB1c2VkIGZvciB0ZXJtaW5hbCBBTlNJIGNvbG9yIHNldC4nXG4gICAgICAgICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgICAgICAgZGVmYXVsdDogJyMwMDAwMDAnXG4gICAgICAgICAgICByZWQ6XG4gICAgICAgICAgICAgIHRpdGxlOiAnUmVkJ1xuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1JlZCBjb2xvciB1c2VkIGZvciB0ZXJtaW5hbCBBTlNJIGNvbG9yIHNldC4nXG4gICAgICAgICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgICAgICAgZGVmYXVsdDogJyNDRDAwMDAnXG4gICAgICAgICAgICBncmVlbjpcbiAgICAgICAgICAgICAgdGl0bGU6ICdHcmVlbidcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdHcmVlbiBjb2xvciB1c2VkIGZvciB0ZXJtaW5hbCBBTlNJIGNvbG9yIHNldC4nXG4gICAgICAgICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgICAgICAgZGVmYXVsdDogJyMwMENEMDAnXG4gICAgICAgICAgICB5ZWxsb3c6XG4gICAgICAgICAgICAgIHRpdGxlOiAnWWVsbG93J1xuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1llbGxvdyBjb2xvciB1c2VkIGZvciB0ZXJtaW5hbCBBTlNJIGNvbG9yIHNldC4nXG4gICAgICAgICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgICAgICAgZGVmYXVsdDogJyNDRENEMDAnXG4gICAgICAgICAgICBibHVlOlxuICAgICAgICAgICAgICB0aXRsZTogJ0JsdWUnXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQmx1ZSBjb2xvciB1c2VkIGZvciB0ZXJtaW5hbCBBTlNJIGNvbG9yIHNldC4nXG4gICAgICAgICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgICAgICAgZGVmYXVsdDogJyMwMDAwQ0QnXG4gICAgICAgICAgICBtYWdlbnRhOlxuICAgICAgICAgICAgICB0aXRsZTogJ01hZ2VudGEnXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnTWFnZW50YSBjb2xvciB1c2VkIGZvciB0ZXJtaW5hbCBBTlNJIGNvbG9yIHNldC4nXG4gICAgICAgICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgICAgICAgZGVmYXVsdDogJyNDRDAwQ0QnXG4gICAgICAgICAgICBjeWFuOlxuICAgICAgICAgICAgICB0aXRsZTogJ0N5YW4nXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQ3lhbiBjb2xvciB1c2VkIGZvciB0ZXJtaW5hbCBBTlNJIGNvbG9yIHNldC4nXG4gICAgICAgICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgICAgICAgZGVmYXVsdDogJyMwMENEQ0QnXG4gICAgICAgICAgICB3aGl0ZTpcbiAgICAgICAgICAgICAgdGl0bGU6ICdXaGl0ZSdcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdXaGl0ZSBjb2xvciB1c2VkIGZvciB0ZXJtaW5hbCBBTlNJIGNvbG9yIHNldC4nXG4gICAgICAgICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgICAgICAgZGVmYXVsdDogJyNFNUU1RTUnXG4gICAgICAgIHpCcmlnaHQ6XG4gICAgICAgICAgdHlwZTogJ29iamVjdCdcbiAgICAgICAgICBvcmRlcjogMlxuICAgICAgICAgIHByb3BlcnRpZXM6XG4gICAgICAgICAgICBicmlnaHRCbGFjazpcbiAgICAgICAgICAgICAgdGl0bGU6ICdCcmlnaHQgQmxhY2snXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQnJpZ2h0IGJsYWNrIGNvbG9yIHVzZWQgZm9yIHRlcm1pbmFsIEFOU0kgY29sb3Igc2V0LidcbiAgICAgICAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICAgICAgICBkZWZhdWx0OiAnIzdGN0Y3RidcbiAgICAgICAgICAgIGJyaWdodFJlZDpcbiAgICAgICAgICAgICAgdGl0bGU6ICdCcmlnaHQgUmVkJ1xuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0JyaWdodCByZWQgY29sb3IgdXNlZCBmb3IgdGVybWluYWwgQU5TSSBjb2xvciBzZXQuJ1xuICAgICAgICAgICAgICB0eXBlOiAnY29sb3InXG4gICAgICAgICAgICAgIGRlZmF1bHQ6ICcjRkYwMDAwJ1xuICAgICAgICAgICAgYnJpZ2h0R3JlZW46XG4gICAgICAgICAgICAgIHRpdGxlOiAnQnJpZ2h0IEdyZWVuJ1xuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0JyaWdodCBncmVlbiBjb2xvciB1c2VkIGZvciB0ZXJtaW5hbCBBTlNJIGNvbG9yIHNldC4nXG4gICAgICAgICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgICAgICAgZGVmYXVsdDogJyMwMEZGMDAnXG4gICAgICAgICAgICBicmlnaHRZZWxsb3c6XG4gICAgICAgICAgICAgIHRpdGxlOiAnQnJpZ2h0IFllbGxvdydcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdCcmlnaHQgeWVsbG93IGNvbG9yIHVzZWQgZm9yIHRlcm1pbmFsIEFOU0kgY29sb3Igc2V0LidcbiAgICAgICAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICAgICAgICBkZWZhdWx0OiAnI0ZGRkYwMCdcbiAgICAgICAgICAgIGJyaWdodEJsdWU6XG4gICAgICAgICAgICAgIHRpdGxlOiAnQnJpZ2h0IEJsdWUnXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQnJpZ2h0IGJsdWUgY29sb3IgdXNlZCBmb3IgdGVybWluYWwgQU5TSSBjb2xvciBzZXQuJ1xuICAgICAgICAgICAgICB0eXBlOiAnY29sb3InXG4gICAgICAgICAgICAgIGRlZmF1bHQ6ICcjMDAwMEZGJ1xuICAgICAgICAgICAgYnJpZ2h0TWFnZW50YTpcbiAgICAgICAgICAgICAgdGl0bGU6ICdCcmlnaHQgTWFnZW50YSdcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdCcmlnaHQgbWFnZW50YSBjb2xvciB1c2VkIGZvciB0ZXJtaW5hbCBBTlNJIGNvbG9yIHNldC4nXG4gICAgICAgICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgICAgICAgZGVmYXVsdDogJyNGRjAwRkYnXG4gICAgICAgICAgICBicmlnaHRDeWFuOlxuICAgICAgICAgICAgICB0aXRsZTogJ0JyaWdodCBDeWFuJ1xuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0JyaWdodCBjeWFuIGNvbG9yIHVzZWQgZm9yIHRlcm1pbmFsIEFOU0kgY29sb3Igc2V0LidcbiAgICAgICAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICAgICAgICBkZWZhdWx0OiAnIzAwRkZGRidcbiAgICAgICAgICAgIGJyaWdodFdoaXRlOlxuICAgICAgICAgICAgICB0aXRsZTogJ0JyaWdodCBXaGl0ZSdcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdCcmlnaHQgd2hpdGUgY29sb3IgdXNlZCBmb3IgdGVybWluYWwgQU5TSSBjb2xvciBzZXQuJ1xuICAgICAgICAgICAgICB0eXBlOiAnY29sb3InXG4gICAgICAgICAgICAgIGRlZmF1bHQ6ICcjRkZGRkZGJ1xuICAgIGljb25Db2xvcnM6XG4gICAgICB0eXBlOiAnb2JqZWN0J1xuICAgICAgb3JkZXI6IDVcbiAgICAgIHByb3BlcnRpZXM6XG4gICAgICAgIHJlZDpcbiAgICAgICAgICB0aXRsZTogJ1N0YXR1cyBJY29uIFJlZCdcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1JlZCBjb2xvciB1c2VkIGZvciBzdGF0dXMgaWNvbi4nXG4gICAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICAgIGRlZmF1bHQ6ICdyZWQnXG4gICAgICAgIG9yYW5nZTpcbiAgICAgICAgICB0aXRsZTogJ1N0YXR1cyBJY29uIE9yYW5nZSdcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ09yYW5nZSBjb2xvciB1c2VkIGZvciBzdGF0dXMgaWNvbi4nXG4gICAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICAgIGRlZmF1bHQ6ICdvcmFuZ2UnXG4gICAgICAgIHllbGxvdzpcbiAgICAgICAgICB0aXRsZTogJ1N0YXR1cyBJY29uIFllbGxvdydcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1llbGxvdyBjb2xvciB1c2VkIGZvciBzdGF0dXMgaWNvbi4nXG4gICAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICAgIGRlZmF1bHQ6ICd5ZWxsb3cnXG4gICAgICAgIGdyZWVuOlxuICAgICAgICAgIHRpdGxlOiAnU3RhdHVzIEljb24gR3JlZW4nXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdHcmVlbiBjb2xvciB1c2VkIGZvciBzdGF0dXMgaWNvbi4nXG4gICAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICAgIGRlZmF1bHQ6ICdncmVlbidcbiAgICAgICAgYmx1ZTpcbiAgICAgICAgICB0aXRsZTogJ1N0YXR1cyBJY29uIEJsdWUnXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdCbHVlIGNvbG9yIHVzZWQgZm9yIHN0YXR1cyBpY29uLidcbiAgICAgICAgICB0eXBlOiAnY29sb3InXG4gICAgICAgICAgZGVmYXVsdDogJ2JsdWUnXG4gICAgICAgIHB1cnBsZTpcbiAgICAgICAgICB0aXRsZTogJ1N0YXR1cyBJY29uIFB1cnBsZSdcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1B1cnBsZSBjb2xvciB1c2VkIGZvciBzdGF0dXMgaWNvbi4nXG4gICAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICAgIGRlZmF1bHQ6ICdwdXJwbGUnXG4gICAgICAgIHBpbms6XG4gICAgICAgICAgdGl0bGU6ICdTdGF0dXMgSWNvbiBQaW5rJ1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUGluayBjb2xvciB1c2VkIGZvciBzdGF0dXMgaWNvbi4nXG4gICAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICAgIGRlZmF1bHQ6ICdob3RwaW5rJ1xuICAgICAgICBjeWFuOlxuICAgICAgICAgIHRpdGxlOiAnU3RhdHVzIEljb24gQ3lhbidcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ0N5YW4gY29sb3IgdXNlZCBmb3Igc3RhdHVzIGljb24uJ1xuICAgICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgICBkZWZhdWx0OiAnY3lhbidcbiAgICAgICAgbWFnZW50YTpcbiAgICAgICAgICB0aXRsZTogJ1N0YXR1cyBJY29uIE1hZ2VudGEnXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdNYWdlbnRhIGNvbG9yIHVzZWQgZm9yIHN0YXR1cyBpY29uLidcbiAgICAgICAgICB0eXBlOiAnY29sb3InXG4gICAgICAgICAgZGVmYXVsdDogJ21hZ2VudGEnXG4gICAgY3VzdG9tVGV4dHM6XG4gICAgICB0eXBlOiAnb2JqZWN0J1xuICAgICAgb3JkZXI6IDZcbiAgICAgIHByb3BlcnRpZXM6XG4gICAgICAgIGN1c3RvbVRleHQxOlxuICAgICAgICAgIHRpdGxlOiAnQ3VzdG9tIHRleHQgMSdcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1RleHQgdG8gcGFzdGUgd2hlbiBjYWxsaW5nIHBsYXRmb3JtaW8taWRlLXRlcm1pbmFsOmluc2VydC1jdXN0b20tdGV4dC0xLCAkUyBpcyByZXBsYWNlZCBieSBzZWxlY3Rpb24sICRGIGlzIHJlcGxhY2VkIGJ5IGZpbGUgbmFtZSwgJEQgaXMgcmVwbGFjZWQgYnkgZmlsZSBkaXJlY3RvcnksICRMIGlzIHJlcGxhY2VkIGJ5IGxpbmUgbnVtYmVyIG9mIGN1cnNvciwgJCQgaXMgcmVwbGFjZWQgYnkgJCdcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgICAgIGRlZmF1bHQ6ICcnXG4gICAgICAgIGN1c3RvbVRleHQyOlxuICAgICAgICAgIHRpdGxlOiAnQ3VzdG9tIHRleHQgMidcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1RleHQgdG8gcGFzdGUgd2hlbiBjYWxsaW5nIHBsYXRmb3JtaW8taWRlLXRlcm1pbmFsOmluc2VydC1jdXN0b20tdGV4dC0yJ1xuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgICAgZGVmYXVsdDogJydcbiAgICAgICAgY3VzdG9tVGV4dDM6XG4gICAgICAgICAgdGl0bGU6ICdDdXN0b20gdGV4dCAzJ1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnVGV4dCB0byBwYXN0ZSB3aGVuIGNhbGxpbmcgcGxhdGZvcm1pby1pZGUtdGVybWluYWw6aW5zZXJ0LWN1c3RvbS10ZXh0LTMnXG4gICAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgICAgICBkZWZhdWx0OiAnJ1xuICAgICAgICBjdXN0b21UZXh0NDpcbiAgICAgICAgICB0aXRsZTogJ0N1c3RvbSB0ZXh0IDQnXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdUZXh0IHRvIHBhc3RlIHdoZW4gY2FsbGluZyBwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbDppbnNlcnQtY3VzdG9tLXRleHQtNCdcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgICAgIGRlZmF1bHQ6ICcnXG4gICAgICAgIGN1c3RvbVRleHQ1OlxuICAgICAgICAgIHRpdGxlOiAnQ3VzdG9tIHRleHQgNSdcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1RleHQgdG8gcGFzdGUgd2hlbiBjYWxsaW5nIHBsYXRmb3JtaW8taWRlLXRlcm1pbmFsOmluc2VydC1jdXN0b20tdGV4dC01J1xuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgICAgZGVmYXVsdDogJydcbiAgICAgICAgY3VzdG9tVGV4dDY6XG4gICAgICAgICAgdGl0bGU6ICdDdXN0b20gdGV4dCA2J1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnVGV4dCB0byBwYXN0ZSB3aGVuIGNhbGxpbmcgcGxhdGZvcm1pby1pZGUtdGVybWluYWw6aW5zZXJ0LWN1c3RvbS10ZXh0LTYnXG4gICAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgICAgICBkZWZhdWx0OiAnJ1xuICAgICAgICBjdXN0b21UZXh0NzpcbiAgICAgICAgICB0aXRsZTogJ0N1c3RvbSB0ZXh0IDcnXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdUZXh0IHRvIHBhc3RlIHdoZW4gY2FsbGluZyBwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbDppbnNlcnQtY3VzdG9tLXRleHQtNydcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgICAgIGRlZmF1bHQ6ICcnXG4gICAgICAgIGN1c3RvbVRleHQ4OlxuICAgICAgICAgIHRpdGxlOiAnQ3VzdG9tIHRleHQgOCdcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1RleHQgdG8gcGFzdGUgd2hlbiBjYWxsaW5nIHBsYXRmb3JtaW8taWRlLXRlcm1pbmFsOmluc2VydC1jdXN0b20tdGV4dC04J1xuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgICAgZGVmYXVsdDogJydcbiJdfQ==
