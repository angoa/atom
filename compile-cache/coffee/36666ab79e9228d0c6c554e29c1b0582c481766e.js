(function() {
  var BufferVariablesScanner, ColorContext, ExpressionsRegistry, VariableExpression, VariableScanner, VariablesChunkSize;

  VariableScanner = require('../variable-scanner');

  ColorContext = require('../color-context');

  VariableExpression = require('../variable-expression');

  ExpressionsRegistry = require('../expressions-registry');

  VariablesChunkSize = 100;

  BufferVariablesScanner = (function() {
    function BufferVariablesScanner(config) {
      var registry, scope;
      this.buffer = config.buffer, registry = config.registry, scope = config.scope;
      registry = ExpressionsRegistry.deserialize(registry, VariableExpression);
      this.scanner = new VariableScanner({
        registry: registry,
        scope: scope
      });
      this.results = [];
    }

    BufferVariablesScanner.prototype.scan = function() {
      var lastIndex, results;
      lastIndex = 0;
      while (results = this.scanner.search(this.buffer, lastIndex)) {
        this.results = this.results.concat(results);
        if (this.results.length >= VariablesChunkSize) {
          this.flushVariables();
        }
        lastIndex = results.lastIndex;
      }
      return this.flushVariables();
    };

    BufferVariablesScanner.prototype.flushVariables = function() {
      emit('scan-buffer:variables-found', this.results);
      return this.results = [];
    };

    return BufferVariablesScanner;

  })();

  module.exports = function(config) {
    return new BufferVariablesScanner(config).scan();
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2FuZ29hLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi90YXNrcy9zY2FuLWJ1ZmZlci12YXJpYWJsZXMtaGFuZGxlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLGVBQUEsR0FBa0IsT0FBQSxDQUFRLHFCQUFSOztFQUNsQixZQUFBLEdBQWUsT0FBQSxDQUFRLGtCQUFSOztFQUNmLGtCQUFBLEdBQXFCLE9BQUEsQ0FBUSx3QkFBUjs7RUFDckIsbUJBQUEsR0FBc0IsT0FBQSxDQUFRLHlCQUFSOztFQUV0QixrQkFBQSxHQUFxQjs7RUFFZjtJQUNTLGdDQUFDLE1BQUQ7QUFDWCxVQUFBO01BQUMsSUFBQyxDQUFBLGdCQUFBLE1BQUYsRUFBVSwwQkFBVixFQUFvQjtNQUNwQixRQUFBLEdBQVcsbUJBQW1CLENBQUMsV0FBcEIsQ0FBZ0MsUUFBaEMsRUFBMEMsa0JBQTFDO01BQ1gsSUFBQyxDQUFBLE9BQUQsR0FBZSxJQUFBLGVBQUEsQ0FBZ0I7UUFBQyxVQUFBLFFBQUQ7UUFBVyxPQUFBLEtBQVg7T0FBaEI7TUFDZixJQUFDLENBQUEsT0FBRCxHQUFXO0lBSkE7O3FDQU1iLElBQUEsR0FBTSxTQUFBO0FBQ0osVUFBQTtNQUFBLFNBQUEsR0FBWTtBQUNaLGFBQU0sT0FBQSxHQUFVLElBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxDQUFnQixJQUFDLENBQUEsTUFBakIsRUFBeUIsU0FBekIsQ0FBaEI7UUFDRSxJQUFDLENBQUEsT0FBRCxHQUFXLElBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxDQUFnQixPQUFoQjtRQUVYLElBQXFCLElBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxJQUFtQixrQkFBeEM7VUFBQSxJQUFDLENBQUEsY0FBRCxDQUFBLEVBQUE7O1FBQ0MsWUFBYTtNQUpoQjthQU1BLElBQUMsQ0FBQSxjQUFELENBQUE7SUFSSTs7cUNBVU4sY0FBQSxHQUFnQixTQUFBO01BQ2QsSUFBQSxDQUFLLDZCQUFMLEVBQW9DLElBQUMsQ0FBQSxPQUFyQzthQUNBLElBQUMsQ0FBQSxPQUFELEdBQVc7SUFGRzs7Ozs7O0VBSWxCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUMsTUFBRDtXQUNYLElBQUEsc0JBQUEsQ0FBdUIsTUFBdkIsQ0FBOEIsQ0FBQyxJQUEvQixDQUFBO0VBRFc7QUE1QmpCIiwic291cmNlc0NvbnRlbnQiOlsiVmFyaWFibGVTY2FubmVyID0gcmVxdWlyZSAnLi4vdmFyaWFibGUtc2Nhbm5lcidcbkNvbG9yQ29udGV4dCA9IHJlcXVpcmUgJy4uL2NvbG9yLWNvbnRleHQnXG5WYXJpYWJsZUV4cHJlc3Npb24gPSByZXF1aXJlICcuLi92YXJpYWJsZS1leHByZXNzaW9uJ1xuRXhwcmVzc2lvbnNSZWdpc3RyeSA9IHJlcXVpcmUgJy4uL2V4cHJlc3Npb25zLXJlZ2lzdHJ5J1xuXG5WYXJpYWJsZXNDaHVua1NpemUgPSAxMDBcblxuY2xhc3MgQnVmZmVyVmFyaWFibGVzU2Nhbm5lclxuICBjb25zdHJ1Y3RvcjogKGNvbmZpZykgLT5cbiAgICB7QGJ1ZmZlciwgcmVnaXN0cnksIHNjb3BlfSA9IGNvbmZpZ1xuICAgIHJlZ2lzdHJ5ID0gRXhwcmVzc2lvbnNSZWdpc3RyeS5kZXNlcmlhbGl6ZShyZWdpc3RyeSwgVmFyaWFibGVFeHByZXNzaW9uKVxuICAgIEBzY2FubmVyID0gbmV3IFZhcmlhYmxlU2Nhbm5lcih7cmVnaXN0cnksIHNjb3BlfSlcbiAgICBAcmVzdWx0cyA9IFtdXG5cbiAgc2NhbjogLT5cbiAgICBsYXN0SW5kZXggPSAwXG4gICAgd2hpbGUgcmVzdWx0cyA9IEBzY2FubmVyLnNlYXJjaChAYnVmZmVyLCBsYXN0SW5kZXgpXG4gICAgICBAcmVzdWx0cyA9IEByZXN1bHRzLmNvbmNhdChyZXN1bHRzKVxuXG4gICAgICBAZmx1c2hWYXJpYWJsZXMoKSBpZiBAcmVzdWx0cy5sZW5ndGggPj0gVmFyaWFibGVzQ2h1bmtTaXplXG4gICAgICB7bGFzdEluZGV4fSA9IHJlc3VsdHNcblxuICAgIEBmbHVzaFZhcmlhYmxlcygpXG5cbiAgZmx1c2hWYXJpYWJsZXM6IC0+XG4gICAgZW1pdCgnc2Nhbi1idWZmZXI6dmFyaWFibGVzLWZvdW5kJywgQHJlc3VsdHMpXG4gICAgQHJlc3VsdHMgPSBbXVxuXG5tb2R1bGUuZXhwb3J0cyA9IChjb25maWcpIC0+XG4gIG5ldyBCdWZmZXJWYXJpYWJsZXNTY2FubmVyKGNvbmZpZykuc2NhbigpXG4iXX0=
