define([
  '../../app/services/graphite/Parser'
], function(Parser) {

  describe('when parsing', function() {

    it('simple metric expression', function() {
      var parser = new Parser('metric.test.*.asd.count');
      var rootNode = parser.getAst();

      expect(parser.error).to.be(null);
      expect(rootNode.type).to.be('metric');
      expect(rootNode.segments.length).to.be(5);
      expect(rootNode.segments[0].value).to.be('metric');
    });

    it('simple function', function() {
      var parser = new Parser('sum(test)');
      var rootNode = parser.getAst();
      expect(parser.error).to.be(null);
      expect(rootNode.type).to.be('function');
      expect(rootNode.params.length).to.be(1);
    });

    it('function with multiple args', function() {
      var parser = new Parser("sum(test, 1, 'test')");
      var rootNode = parser.getAst();

      expect(parser.error).to.be(null);
      expect(rootNode.type).to.be('function');
      expect(rootNode.params.length).to.be(3);
      expect(rootNode.params[0].type).to.be('metric');
      expect(rootNode.params[1].type).to.be('number');
      expect(rootNode.params[2].type).to.be('string');
    });

    it('function with nested function', function() {
      var parser = new Parser("sum(scaleToSeconds(test, 1))");
      var rootNode = parser.getAst();

      expect(parser.error).to.be(null);
      expect(rootNode.type).to.be('function');
      expect(rootNode.params.length).to.be(1);
      expect(rootNode.params[0].type).to.be('function');
      expect(rootNode.params[0].name).to.be('scaleToSeconds');
      expect(rootNode.params[0].params.length).to.be(2);
      expect(rootNode.params[0].params[0].type).to.be('metric');
      expect(rootNode.params[0].params[1].type).to.be('number');
    });

    it('function with multiple series', function() {
      var parser = new Parser("sum(test.test.*.count, test.timers.*.count)");
      var rootNode = parser.getAst();

      expect(parser.error).to.be(null);
      expect(rootNode.type).to.be('function');
      expect(rootNode.params.length).to.be(2);
      expect(rootNode.params[0].type).to.be('metric');
      expect(rootNode.params[1].type).to.be('metric');
    });

    it('invalid metric expression', function() {
      var parser = new Parser('metric.test.*.asd.');
      var rootNode = parser.getAst();

      expect(parser.error.text).to.be('Expected metric identifier instead found end of string');
      expect(parser.error.pos).to.be(19);
    });

    it('invalid function expression missing closing paranthesis', function() {
      var parser = new Parser('sum(test');
      var rootNode = parser.getAst();

      expect(parser.error.text).to.be('Expected closing paranthesis instead found end of string');
      expect(parser.error.pos).to.be(9);
    });

  });

});
