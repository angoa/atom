(function() {
  module.exports = {
    general: {
      order: 1,
      type: "object",
      properties: {
        gitPath: {
          order: 1,
          title: "Git Path",
          type: "string",
          "default": "git",
          description: "If git is not in your PATH, specify where the executable is"
        },
        enableStatusBarIcon: {
          order: 2,
          title: "Status-bar Pin Icon",
          type: "boolean",
          "default": true,
          description: "The pin icon in the bottom-right of the status-bar toggles the output view above the status-bar"
        },
        openInPane: {
          order: 3,
          title: "Allow commands to open new panes",
          type: "boolean",
          "default": true,
          description: "Commands like `Commit`, `Log`, `Show`, `Diff` can be split into new panes"
        },
        splitPane: {
          order: 4,
          title: "Split pane direction",
          type: "string",
          "default": "Down",
          description: "Where should new panes go?",
          "enum": ["Up", "Right", "Down", "Left"]
        },
        messageTimeout: {
          order: 5,
          title: "Output view timeout",
          type: "integer",
          "default": 5,
          description: "For how many seconds should the output view above the status-bar stay open?"
        },
        showFormat: {
          order: 6,
          title: "Format option for 'Git Show'",
          type: "string",
          "default": "full",
          "enum": ["oneline", "short", "medium", "full", "fuller", "email", "raw", "none"],
          description: "Which format to use for `git show`? (`none` will use your git config default)"
        }
      }
    },
    commits: {
      order: 2,
      type: "object",
      properties: {
        verboseCommits: {
          title: "Verbose Commits",
          description: "Show diffs in commit pane?",
          type: "boolean",
          "default": false
        }
      }
    },
    diffs: {
      order: 3,
      type: "object",
      properties: {
        includeStagedDiff: {
          order: 1,
          title: "Include staged diffs?",
          type: "boolean",
          "default": true
        },
        wordDiff: {
          order: 2,
          title: "Word diff",
          type: "boolean",
          "default": true,
          description: "Should diffs be generated with the `--word-diff` flag?"
        },
        syntaxHighlighting: {
          order: 3,
          title: "Enable syntax highlighting in diffs?",
          type: "boolean",
          "default": true
        }
      }
    },
    logs: {
      order: 4,
      type: "object",
      properties: {
        numberOfCommitsToShow: {
          order: 1,
          title: "Number of commits to load",
          type: "integer",
          "default": 25,
          minimum: 1,
          description: "Initial amount of commits to load when running the `Log` command"
        }
      }
    },
    remoteInteractions: {
      order: 5,
      type: "object",
      properties: {
        pullRebase: {
          order: 1,
          title: "Pull Rebase",
          type: "boolean",
          "default": false,
          description: "Pull with `--rebase` flag?"
        },
        pullBeforePush: {
          order: 2,
          title: "Pull Before Pushing",
          type: "boolean",
          "default": false,
          description: "Pull from remote before pushing"
        },
        promptForBranch: {
          order: 3,
          title: "Prompt for branch selection when pulling/pushing",
          type: "boolean",
          "default": false,
          description: "If false, it defaults to current branch upstream"
        }
      }
    },
    experimental: {
      order: 6,
      type: "object",
      properties: {
        stageFilesBeta: {
          order: 1,
          title: "Stage Files Beta",
          type: "boolean",
          "default": true,
          description: "Stage and unstage files in a single command"
        },
        customCommands: {
          order: 2,
          title: "Custom Commands",
          type: "boolean",
          "default": false,
          description: "Declared custom commands in your `init` file that can be run from the Git-plus command palette"
        },
        diffBranches: {
          order: 3,
          title: "Show diffs across branches",
          type: "boolean",
          "default": false,
          description: "Diffs will be shown for the current branch against a branch you choose. The `Diff branch files` command will allow choosing which file to compare. The file feature requires the 'split-diff' package to be installed."
        },
        useSplitDiff: {
          order: 4,
          title: "Split diff",
          type: "boolean",
          "default": false,
          description: "Use the split-diff package to show diffs for a single file. Only works with `Diff` command when a file is open."
        }
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2FuZ29hLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL2xpYi9jb25maWcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLE9BQUEsRUFDRTtNQUFBLEtBQUEsRUFBTyxDQUFQO01BQ0EsSUFBQSxFQUFNLFFBRE47TUFFQSxVQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQ0U7VUFBQSxLQUFBLEVBQU8sQ0FBUDtVQUNBLEtBQUEsRUFBTyxVQURQO1VBRUEsSUFBQSxFQUFNLFFBRk47VUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBSFQ7VUFJQSxXQUFBLEVBQWEsNkRBSmI7U0FERjtRQU1BLG1CQUFBLEVBQ0U7VUFBQSxLQUFBLEVBQU8sQ0FBUDtVQUNBLEtBQUEsRUFBTyxxQkFEUDtVQUVBLElBQUEsRUFBTSxTQUZOO1VBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQUhUO1VBSUEsV0FBQSxFQUFhLGlHQUpiO1NBUEY7UUFZQSxVQUFBLEVBQ0U7VUFBQSxLQUFBLEVBQU8sQ0FBUDtVQUNBLEtBQUEsRUFBTyxrQ0FEUDtVQUVBLElBQUEsRUFBTSxTQUZOO1VBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQUhUO1VBSUEsV0FBQSxFQUFhLDJFQUpiO1NBYkY7UUFrQkEsU0FBQSxFQUNFO1VBQUEsS0FBQSxFQUFPLENBQVA7VUFDQSxLQUFBLEVBQU8sc0JBRFA7VUFFQSxJQUFBLEVBQU0sUUFGTjtVQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsTUFIVDtVQUlBLFdBQUEsRUFBYSw0QkFKYjtVQUtBLENBQUEsSUFBQSxDQUFBLEVBQU0sQ0FBQyxJQUFELEVBQU8sT0FBUCxFQUFnQixNQUFoQixFQUF3QixNQUF4QixDQUxOO1NBbkJGO1FBeUJBLGNBQUEsRUFDRTtVQUFBLEtBQUEsRUFBTyxDQUFQO1VBQ0EsS0FBQSxFQUFPLHFCQURQO1VBRUEsSUFB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a0JBRFA7VUFFQSxJQUFBLEVBQU0sU0FGTjtVQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFIVDtVQUlBLFdBQUEsRUFBYSw2Q0FKYjtTQURGO1FBTUEsY0FBQSxFQUNFO1VBQUEsS0FBQSxFQUFPLENBQVA7VUFDQSxLQUFBLEVBQU8saUJBRFA7VUFFQSxJQUFBLEVBQU0sU0FGTjtVQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FIVDtVQUlBLFdBQUEsRUFBYSxnR0FKYjtTQVBGO1FBWUEsWUFBQSxFQUNFO1VBQUEsS0FBQSxFQUFPLENBQVA7VUFDQSxLQUFBLEVBQU8sNEJBRFA7VUFFQSxJQUFBLEVBQU0sU0FGTjtVQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FIVDtVQUlBLFdBQUEsRUFBYSx3TkFKYjtTQWJGO1FBa0JBLFlBQUEsRUFDRTtVQUFBLEtBQUEsRUFBTyxDQUFQO1VBQ0EsS0FBQSxFQUFPLFlBRFA7VUFFQSxJQUFBLEVBQU0sU0FGTjtVQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FIVDtVQUlBLFdBQUEsRUFBYSxpSEFKYjtTQW5CRjtPQUhGO0tBekdGOztBQURGIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPVxuICBnZW5lcmFsOlxuICAgIG9yZGVyOiAxXG4gICAgdHlwZTogXCJvYmplY3RcIlxuICAgIHByb3BlcnRpZXM6XG4gICAgICBnaXRQYXRoOlxuICAgICAgICBvcmRlcjogMVxuICAgICAgICB0aXRsZTogXCJHaXQgUGF0aFwiXG4gICAgICAgIHR5cGU6IFwic3RyaW5nXCJcbiAgICAgICAgZGVmYXVsdDogXCJnaXRcIlxuICAgICAgICBkZXNjcmlwdGlvbjogXCJJZiBnaXQgaXMgbm90IGluIHlvdXIgUEFUSCwgc3BlY2lmeSB3aGVyZSB0aGUgZXhlY3V0YWJsZSBpc1wiXG4gICAgICBlbmFibGVTdGF0dXNCYXJJY29uOlxuICAgICAgICBvcmRlcjogMlxuICAgICAgICB0aXRsZTogXCJTdGF0dXMtYmFyIFBpbiBJY29uXCJcbiAgICAgICAgdHlwZTogXCJib29sZWFuXCJcbiAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgICBkZXNjcmlwdGlvbjogXCJUaGUgcGluIGljb24gaW4gdGhlIGJvdHRvbS1yaWdodCBvZiB0aGUgc3RhdHVzLWJhciB0b2dnbGVzIHRoZSBvdXRwdXQgdmlldyBhYm92ZSB0aGUgc3RhdHVzLWJhclwiXG4gICAgICBvcGVuSW5QYW5lOlxuICAgICAgICBvcmRlcjogM1xuICAgICAgICB0aXRsZTogXCJBbGxvdyBjb21tYW5kcyB0byBvcGVuIG5ldyBwYW5lc1wiXG4gICAgICAgIHR5cGU6IFwiYm9vbGVhblwiXG4gICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgICAgZGVzY3JpcHRpb246IFwiQ29tbWFuZHMgbGlrZSBgQ29tbWl0YCwgYExvZ2AsIGBTaG93YCwgYERpZmZgIGNhbiBiZSBzcGxpdCBpbnRvIG5ldyBwYW5lc1wiXG4gICAgICBzcGxpdFBhbmU6XG4gICAgICAgIG9yZGVyOiA0XG4gICAgICAgIHRpdGxlOiBcIlNwbGl0IHBhbmUgZGlyZWN0aW9uXCJcbiAgICAgICAgdHlwZTogXCJzdHJpbmdcIlxuICAgICAgICBkZWZhdWx0OiBcIkRvd25cIlxuICAgICAgICBkZXNjcmlwdGlvbjogXCJXaGVyZSBzaG91bGQgbmV3IHBhbmVzIGdvP1wiXG4gICAgICAgIGVudW06IFtcIlVwXCIsIFwiUmlnaHRcIiwgXCJEb3duXCIsIFwiTGVmdFwiXVxuICAgICAgbWVzc2FnZVRpbWVvdXQ6XG4gICAgICAgIG9yZGVyOiA1XG4gICAgICAgIHRpdGxlOiBcIk91dHB1dCB2aWV3IHRpbWVvdXRcIlxuICAgICAgICB0eXBlOiBcImludGVnZXJcIlxuICAgICAgICBkZWZhdWx0OiA1XG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIkZvciBob3cgbWFueSBzZWNvbmRzIHNob3VsZCB0aGUgb3V0cHV0IHZpZXcgYWJvdmUgdGhlIHN0YXR1cy1iYXIgc3RheSBvcGVuP1wiXG4gICAgICBzaG93Rm9ybWF0OlxuICAgICAgICBvcmRlcjogNlxuICAgICAgICB0aXRsZTogXCJGb3JtYXQgb3B0aW9uIGZvciAnR2l0IFNob3cnXCJcbiAgICAgICAgdHlwZTogXCJzdHJpbmdcIlxuICAgICAgICBkZWZhdWx0OiBcImZ1bGxcIlxuICAgICAgICBlbnVtOiBbXCJvbmVsaW5lXCIsIFwic2hvcnRcIiwgXCJtZWRpdW1cIiwgXCJmdWxsXCIsIFwiZnVsbGVyXCIsIFwiZW1haWxcIiwgXCJyYXdcIiwgXCJub25lXCJdXG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIldoaWNoIGZvcm1hdCB0byB1c2UgZm9yIGBnaXQgc2hvd2A/IChgbm9uZWAgd2lsbCB1c2UgeW91ciBnaXQgY29uZmlnIGRlZmF1bHQpXCJcbiAgY29tbWl0czpcbiAgICBvcmRlcjogMlxuICAgIHR5cGU6IFwib2JqZWN0XCJcbiAgICBwcm9wZXJ0aWVzOlxuICAgICAgdmVyYm9zZUNvbW1pdHM6XG4gICAgICAgIHRpdGxlOiBcIlZlcmJvc2UgQ29tbWl0c1wiXG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIlNob3cgZGlmZnMgaW4gY29tbWl0IHBhbmU/XCJcbiAgICAgICAgdHlwZTogXCJib29sZWFuXCJcbiAgICAgICAgZGVmYXVsdDogZmFsc2VcbiAgZGlmZnM6XG4gICAgb3JkZXI6IDNcbiAgICB0eXBlOiBcIm9iamVjdFwiXG4gICAgcHJvcGVydGllczpcbiAgICAgIGluY2x1ZGVTdGFnZWREaWZmOlxuICAgICAgICBvcmRlcjogMVxuICAgICAgICB0aXRsZTogXCJJbmNsdWRlIHN0YWdlZCBkaWZmcz9cIlxuICAgICAgICB0eXBlOiBcImJvb2xlYW5cIlxuICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICB3b3JkRGlmZjpcbiAgICAgICAgb3JkZXI6IDJcbiAgICAgICAgdGl0bGU6IFwiV29yZCBkaWZmXCJcbiAgICAgICAgdHlwZTogXCJib29sZWFuXCJcbiAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgICBkZXNjcmlwdGlvbjogXCJTaG91bGQgZGlmZnMgYmUgZ2VuZXJhdGVkIHdpdGggdGhlIGAtLXdvcmQtZGlmZmAgZmxhZz9cIlxuICAgICAgc3ludGF4SGlnaGxpZ2h0aW5nOlxuICAgICAgICBvcmRlcjogM1xuICAgICAgICB0aXRsZTogXCJFbmFibGUgc3ludGF4IGhpZ2hsaWdodGluZyBpbiBkaWZmcz9cIlxuICAgICAgICB0eXBlOiBcImJvb2xlYW5cIlxuICAgICAgICBkZWZhdWx0OiB0cnVlXG4gIGxvZ3M6XG4gICAgb3JkZXI6IDRcbiAgICB0eXBlOiBcIm9iamVjdFwiXG4gICAgcHJvcGVydGllczpcbiAgICAgIG51bWJlck9mQ29tbWl0c1RvU2hvdzpcbiAgICAgICAgb3JkZXI6IDFcbiAgICAgICAgdGl0bGU6IFwiTnVtYmVyIG9mIGNvbW1pdHMgdG8gbG9hZFwiXG4gICAgICAgIHR5cGU6IFwiaW50ZWdlclwiXG4gICAgICAgIGRlZmF1bHQ6IDI1XG4gICAgICAgIG1pbmltdW06IDFcbiAgICAgICAgZGVzY3JpcHRpb246IFwiSW5pdGlhbCBhbW91bnQgb2YgY29tbWl0cyB0byBsb2FkIHdoZW4gcnVubmluZyB0aGUgYExvZ2AgY29tbWFuZFwiXG4gIHJlbW90ZUludGVyYWN0aW9uczpcbiAgICBvcmRlcjogNVxuICAgIHR5cGU6IFwib2JqZWN0XCJcbiAgICBwcm9wZXJ0aWVzOlxuICAgICAgcHVsbFJlYmFzZTpcbiAgICAgICAgb3JkZXI6IDFcbiAgICAgICAgdGl0bGU6IFwiUHVsbCBSZWJhc2VcIlxuICAgICAgICB0eXBlOiBcImJvb2xlYW5cIlxuICAgICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgICBkZXNjcmlwdGlvbjogXCJQdWxsIHdpdGggYC0tcmViYXNlYCBmbGFnP1wiXG4gICAgICBwdWxsQmVmb3JlUHVzaDpcbiAgICAgICAgb3JkZXI6IDJcbiAgICAgICAgdGl0bGU6IFwiUHVsbCBCZWZvcmUgUHVzaGluZ1wiXG4gICAgICAgIHR5cGU6IFwiYm9vbGVhblwiXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIlB1bGwgZnJvbSByZW1vdGUgYmVmb3JlIHB1c2hpbmdcIlxuICAgICAgcHJvbXB0Rm9yQnJhbmNoOlxuICAgICAgICBvcmRlcjogM1xuICAgICAgICB0aXRsZTogXCJQcm9tcHQgZm9yIGJyYW5jaCBzZWxlY3Rpb24gd2hlbiBwdWxsaW5nL3B1c2hpbmdcIlxuICAgICAgICB0eXBlOiBcImJvb2xlYW5cIlxuICAgICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgICBkZXNjcmlwdGlvbjogXCJJZiBmYWxzZSwgaXQgZGVmYXVsdHMgdG8gY3VycmVudCBicmFuY2ggdXBzdHJlYW1cIlxuICBleHBlcmltZW50YWw6XG4gICAgb3JkZXI6IDZcbiAgICB0eXBlOiBcIm9iamVjdFwiXG4gICAgcHJvcGVydGllczpcbiAgICAgIHN0YWdlRmlsZXNCZXRhOlxuICAgICAgICBvcmRlcjogMVxuICAgICAgICB0aXRsZTogXCJTdGFnZSBGaWxlcyBCZXRhXCJcbiAgICAgICAgdHlwZTogXCJib29sZWFuXCJcbiAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgICBkZXNjcmlwdGlvbjogXCJTdGFnZSBhbmQgdW5zdGFnZSBmaWxlcyBpbiBhIHNpbmdsZSBjb21tYW5kXCJcbiAgICAgIGN1c3RvbUNvbW1hbmRzOlxuICAgICAgICBvcmRlcjogMlxuICAgICAgICB0aXRsZTogXCJDdXN0b20gQ29tbWFuZHNcIlxuICAgICAgICB0eXBlOiBcImJvb2xlYW5cIlxuICAgICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgICBkZXNjcmlwdGlvbjogXCJEZWNsYXJlZCBjdXN0b20gY29tbWFuZHMgaW4geW91ciBgaW5pdGAgZmlsZSB0aGF0IGNhbiBiZSBydW4gZnJvbSB0aGUgR2l0LXBsdXMgY29tbWFuZCBwYWxldHRlXCJcbiAgICAgIGRpZmZCcmFuY2hlczpcbiAgICAgICAgb3JkZXI6IDNcbiAgICAgICAgdGl0bGU6IFwiU2hvdyBkaWZmcyBhY3Jvc3MgYnJhbmNoZXNcIlxuICAgICAgICB0eXBlOiBcImJvb2xlYW5cIlxuICAgICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgICBkZXNjcmlwdGlvbjogXCJEaWZmcyB3aWxsIGJlIHNob3duIGZvciB0aGUgY3VycmVudCBicmFuY2ggYWdhaW5zdCBhIGJyYW5jaCB5b3UgY2hvb3NlLiBUaGUgYERpZmYgYnJhbmNoIGZpbGVzYCBjb21tYW5kIHdpbGwgYWxsb3cgY2hvb3Npbmcgd2hpY2ggZmlsZSB0byBjb21wYXJlLiBUaGUgZmlsZSBmZWF0dXJlIHJlcXVpcmVzIHRoZSAnc3BsaXQtZGlmZicgcGFja2FnZSB0byBiZSBpbnN0YWxsZWQuXCJcbiAgICAgIHVzZVNwbGl0RGlmZjpcbiAgICAgICAgb3JkZXI6IDRcbiAgICAgICAgdGl0bGU6IFwiU3BsaXQgZGlmZlwiXG4gICAgICAgIHR5cGU6IFwiYm9vbGVhblwiXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIlVzZSB0aGUgc3BsaXQtZGlmZiBwYWNrYWdlIHRvIHNob3cgZGlmZnMgZm9yIGEgc2luZ2xlIGZpbGUuIE9ubHkgd29ya3Mgd2l0aCBgRGlmZmAgY29tbWFuZCB3aGVuIGEgZmlsZSBpcyBvcGVuLlwiXG4iXX0=
