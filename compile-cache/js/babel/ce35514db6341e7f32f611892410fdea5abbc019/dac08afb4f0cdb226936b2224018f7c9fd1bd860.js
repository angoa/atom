Object.defineProperty(exports, '__esModule', {
	value: true
});
exports.deactivate = deactivate;
exports.activate = activate;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/** @babel */

var _atom = require('atom');

var _postcss = require('postcss');

var _postcss2 = _interopRequireDefault(_postcss);

var _autoprefixer = require('autoprefixer');

var _autoprefixer2 = _interopRequireDefault(_autoprefixer);

var _postcssSafeParser = require('postcss-safe-parser');

var _postcssSafeParser2 = _interopRequireDefault(_postcssSafeParser);

var _postcssScss = require('postcss-scss');

var _postcssScss2 = _interopRequireDefault(_postcssScss);

var SUPPORTED_SCOPES = new Set(['source.css', 'source.css.scss']);

function init(editor, onSave) {
	var selectedText = onSave ? null : editor.getSelectedText();
	var text = selectedText || editor.getText();
	var parser = editor.getGrammar().scopeName === 'source.css' ? _postcssSafeParser2['default'] : _postcssScss2['default'];

	(0, _postcss2['default'])((0, _autoprefixer2['default'])(atom.config.get('autoprefixer'))).process(text, { parser: parser }).then(function (result) {
		result.warnings().forEach(function (x) {
			console.warn(x.toString());
			atom.notifications.addWarning('Autoprefixer', {
				detail: x.toString()
			});
		});

		var cursorPosition = editor.getCursorBufferPosition();
		var line = atom.views.getView(editor).getFirstVisibleScreenRow() + editor.getVerticalScrollMargin();

		if (selectedText) {
			editor.setTextInBufferRange(editor.getSelectedBufferRange(), result.css);
		} else {
			editor.getBuffer().setTextViaDiff(result.css);
		}

		editor.setCursorBufferPosition(cursorPosition);

		if (editor.getScreenLineCount() > line) {
			editor.scrollToScreenPosition([line, 0]);
		}
	})['catch'](function (err) {
		if (err.name === 'CssSyntaxError') {
			err.message += err.showSourceCode();
		}

		console.error(err);
		atom.notifications.addError('Autoprefixer', { detail: err.message });
	});
}

var config = {
	browsers: {
		title: 'Supported Browsers',
		description: 'Using the [following syntax](https://github.com/ai/browserslist#queries).',
		type: 'array',
		'default': _autoprefixer2['default'].defaults,
		items: {
			type: 'string'
		}
	},
	cascade: {
		title: 'Cascade Prefixes',
		type: 'boolean',
		'default': true
	},
	remove: {
		title: 'Remove Unneeded Prefixes',
		type: 'boolean',
		'default': true
	},
	runOnSave: {
		title: 'Run on Save',
		type: 'boolean',
		'default': false
	}
};

exports.config = config;

function deactivate() {
	this.subscriptions.dispose();
}

function activate() {
	this.subscriptions = new _atom.CompositeDisposable();

	this.subscriptions.add(atom.workspace.observeTextEditors(function (editor) {
		editor.getBuffer().onWillSave(function () {
			var isCSS = SUPPORTED_SCOPES.has(editor.getGrammar().scopeName);

			if (isCSS && atom.config.get('autoprefixer.runOnSave')) {
				init(editor, true);
			}
		});
	}));

	this.subscriptions.add(atom.commands.add('atom-workspace', 'autoprefixer', function () {
		var editor = atom.workspace.getActiveTextEditor();

		if (editor) {
			init(editor);
		}
	}));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9hbmdvYS8uYXRvbS9wYWNrYWdlcy9hdXRvcHJlZml4ZXIvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztvQkFDa0MsTUFBTTs7dUJBQ3BCLFNBQVM7Ozs7NEJBQ0osY0FBYzs7OztpQ0FDVCxxQkFBcUI7Ozs7MkJBQzNCLGNBQWM7Ozs7QUFFdEMsSUFBTSxnQkFBZ0IsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUNoQyxZQUFZLEVBQ1osaUJBQWlCLENBQ2pCLENBQUMsQ0FBQzs7QUFFSCxTQUFTLElBQUksQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFO0FBQzdCLEtBQU0sWUFBWSxHQUFHLE1BQU0sR0FBRyxJQUFJLEdBQUcsTUFBTSxDQUFDLGVBQWUsRUFBRSxDQUFDO0FBQzlELEtBQU0sSUFBSSxHQUFHLFlBQVksSUFBSSxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDOUMsS0FBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDLFNBQVMsS0FBSyxZQUFZLDREQUFrQyxDQUFDOztBQUVoRywyQkFBUSwrQkFBYSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxFQUFDLE1BQU0sRUFBTixNQUFNLEVBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFBLE1BQU0sRUFBSTtBQUM3RixRQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQUEsQ0FBQyxFQUFJO0FBQzlCLFVBQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7QUFDM0IsT0FBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsY0FBYyxFQUFFO0FBQzdDLFVBQU0sRUFBRSxDQUFDLENBQUMsUUFBUSxFQUFFO0lBQ3BCLENBQUMsQ0FBQztHQUNILENBQUMsQ0FBQzs7QUFFSCxNQUFNLGNBQWMsR0FBRyxNQUFN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Q0FBQyxtQkFBbUIsRUFBRSxDQUFDOztBQUVwRCxNQUFJLE1BQU0sRUFBRTtBQUNYLE9BQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztHQUNiO0VBQ0QsQ0FBQyxDQUFDLENBQUM7Q0FDSiIsImZpbGUiOiIvVXNlcnMvYW5nb2EvLmF0b20vcGFja2FnZXMvYXV0b3ByZWZpeGVyL2luZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqIEBiYWJlbCAqL1xuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCBwb3N0Y3NzIGZyb20gJ3Bvc3Rjc3MnO1xuaW1wb3J0IGF1dG9wcmVmaXhlciBmcm9tICdhdXRvcHJlZml4ZXInO1xuaW1wb3J0IHBvc3Rjc3NTYWZlUGFyc2VyIGZyb20gJ3Bvc3Rjc3Mtc2FmZS1wYXJzZXInO1xuaW1wb3J0IHBvc3Rjc3NTY3NzIGZyb20gJ3Bvc3Rjc3Mtc2Nzcyc7XG5cbmNvbnN0IFNVUFBPUlRFRF9TQ09QRVMgPSBuZXcgU2V0KFtcblx0J3NvdXJjZS5jc3MnLFxuXHQnc291cmNlLmNzcy5zY3NzJ1xuXSk7XG5cbmZ1bmN0aW9uIGluaXQoZWRpdG9yLCBvblNhdmUpIHtcblx0Y29uc3Qgc2VsZWN0ZWRUZXh0ID0gb25TYXZlID8gbnVsbCA6IGVkaXRvci5nZXRTZWxlY3RlZFRleHQoKTtcblx0Y29uc3QgdGV4dCA9IHNlbGVjdGVkVGV4dCB8fCBlZGl0b3IuZ2V0VGV4dCgpO1xuXHRjb25zdCBwYXJzZXIgPSBlZGl0b3IuZ2V0R3JhbW1hcigpLnNjb3BlTmFtZSA9PT0gJ3NvdXJjZS5jc3MnID8gcG9zdGNzc1NhZmVQYXJzZXIgOiBwb3N0Y3NzU2NzcztcblxuXHRwb3N0Y3NzKGF1dG9wcmVmaXhlcihhdG9tLmNvbmZpZy5nZXQoJ2F1dG9wcmVmaXhlcicpKSkucHJvY2Vzcyh0ZXh0LCB7cGFyc2VyfSkudGhlbihyZXN1bHQgPT4ge1xuXHRcdHJlc3VsdC53YXJuaW5ncygpLmZvckVhY2goeCA9PiB7XG5cdFx0XHRjb25zb2xlLndhcm4oeC50b1N0cmluZygpKTtcblx0XHRcdGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKCdBdXRvcHJlZml4ZXInLCB7XG5cdFx0XHRcdGRldGFpbDogeC50b1N0cmluZygpXG5cdFx0XHR9KTtcblx0XHR9KTtcblxuXHRcdGNvbnN0IGN1cnNvclBvc2l0aW9uID0gZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCk7XG5cdFx0Y29uc3QgbGluZSA9IGF0b20udmlld3MuZ2V0VmlldyhlZGl0b3IpLmdldEZpcnN0VmlzaWJsZVNjcmVlblJvdygpICtcblx0XHRcdGVkaXRvci5nZXRWZXJ0aWNhbFNjcm9sbE1hcmdpbigpO1xuXG5cdFx0aWYgKHNlbGVjdGVkVGV4dCkge1xuXHRcdFx0ZWRpdG9yLnNldFRleHRJbkJ1ZmZlclJhbmdlKGVkaXRvci5nZXRTZWxlY3RlZEJ1ZmZlclJhbmdlKCksIHJlc3VsdC5jc3MpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRlZGl0b3IuZ2V0QnVmZmVyKCkuc2V0VGV4dFZpYURpZmYocmVzdWx0LmNzcyk7XG5cdFx0fVxuXG5cdFx0ZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKGN1cnNvclBvc2l0aW9uKTtcblxuXHRcdGlmIChlZGl0b3IuZ2V0U2NyZWVuTGluZUNvdW50KCkgPiBsaW5lKSB7XG5cdFx0XHRlZGl0b3Iuc2Nyb2xsVG9TY3JlZW5Qb3NpdGlvbihbbGluZSwgMF0pO1xuXHRcdH1cblx0fSkuY2F0Y2goZXJyID0+IHtcblx0XHRpZiAoZXJyLm5hbWUgPT09ICdDc3NTeW50YXhFcnJvcicpIHtcblx0XHRcdGVyci5tZXNzYWdlICs9IGVyci5zaG93U291cmNlQ29kZSgpO1xuXHRcdH1cblxuXHRcdGNvbnNvbGUuZXJyb3IoZXJyKTtcblx0XHRhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ0F1dG9wcmVmaXhlcicsIHtkZXRhaWw6IGVyci5tZXNzYWdlfSk7XG5cdH0pO1xufVxuXG5leHBvcnQgY29uc3QgY29uZmlnID0ge1xuXHRicm93c2Vyczoge1xuXHRcdHRpdGxlOiAnU3VwcG9ydGVkIEJyb3dzZXJzJyxcblx0XHRkZXNjcmlwdGlvbjogJ1VzaW5nIHRoZSBbZm9sbG93aW5nIHN5bnRheF0oaHR0cHM6Ly9naXRodWIuY29tL2FpL2Jyb3dzZXJzbGlzdCNxdWVyaWVzKS4nLFxuXHRcdHR5cGU6ICdhcnJheScsXG5cdFx0ZGVmYXVsdDogYXV0b3ByZWZpeGVyLmRlZmF1bHRzLFxuXHRcdGl0ZW1zOiB7XG5cdFx0XHR0eXBlOiAnc3RyaW5nJ1xuXHRcdH1cblx0fSxcblx0Y2FzY2FkZToge1xuXHRcdHRpdGxlOiAnQ2FzY2FkZSBQcmVmaXhlcycsXG5cdFx0dHlwZTogJ2Jvb2xlYW4nLFxuXHRcdGRlZmF1bHQ6IHRydWVcblx0fSxcblx0cmVtb3ZlOiB7XG5cdFx0dGl0bGU6ICdSZW1vdmUgVW5uZWVkZWQgUHJlZml4ZXMnLFxuXHRcdHR5cGU6ICdib29sZWFuJyxcblx0XHRkZWZhdWx0OiB0cnVlXG5cdH0sXG5cdHJ1bk9uU2F2ZToge1xuXHRcdHRpdGxlOiAnUnVuIG9uIFNhdmUnLFxuXHRcdHR5cGU6ICdib29sZWFuJyxcblx0XHRkZWZhdWx0OiBmYWxzZVxuXHR9XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gZGVhY3RpdmF0ZSgpIHtcblx0dGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFjdGl2YXRlKCkge1xuXHR0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuXG5cdHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVRleHRFZGl0b3JzKGVkaXRvciA9PiB7XG5cdFx0ZWRpdG9yLmdldEJ1ZmZlcigpLm9uV2lsbFNhdmUoKCkgPT4ge1xuXHRcdFx0Y29uc3QgaXNDU1MgPSBTVVBQT1JURURfU0NPUEVTLmhhcyhlZGl0b3IuZ2V0R3JhbW1hcigpLnNjb3BlTmFtZSk7XG5cblx0XHRcdGlmIChpc0NTUyAmJiBhdG9tLmNvbmZpZy5nZXQoJ2F1dG9wcmVmaXhlci5ydW5PblNhdmUnKSkge1xuXHRcdFx0XHRpbml0KGVkaXRvciwgdHJ1ZSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0pKTtcblxuXHR0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsICdhdXRvcHJlZml4ZXInLCAoKSA9PiB7XG5cdFx0Y29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuXG5cdFx0aWYgKGVkaXRvcikge1xuXHRcdFx0aW5pdChlZGl0b3IpO1xuXHRcdH1cblx0fSkpO1xufVxuIl19