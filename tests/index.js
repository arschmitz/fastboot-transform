'use strict';

const expect = require('chai').expect;
const Funnel = require('broccoli-funnel');
const helpers = require('broccoli-test-helper');
const createBuilder = helpers.createBuilder;
const createTempDir = helpers.createTempDir;
const fastbootTransform = require('../src/index');
const co = require('co');


describe('fastboot-transform', function() {
  let input;
  let output;
  let subject;

  beforeEach(co.wrap(function* () {
    input = yield createTempDir();
    subject = fastbootTransform(input.path());
    output = createBuilder(subject);
  }));

  afterEach(co.wrap(function* () {
    yield input.dispose();
    yield output.dispose();
  }));

  it('should transform JS files', co.wrap(function* () {
    input.write({
      "index.js": `window.hello = "hello world";`,
      "index.css": "body { color: green; }"
    });

    yield output.build();

    expect(output.read()).to.deep.equal({
      "index.js": "if (typeof FastBoot === 'undefined') {\nwindow.hello = \"hello world\";\n}",
      "index.css": "body { color: green; }"
    });
  }));

  it('should transform files ending in a line comment', co.wrap(function* () {
    input.write({
      "index.js": `window.hello = "hello world";\n// a line comment`
    });

    yield output.build();

    expect(output.read()).to.deep.equal({
      "index.js": "if (typeof FastBoot === 'undefined') {\nwindow.hello = \"hello world\";\n// a line comment\n}"
    });
  }));

  it('should remove sourcemap comments', co.wrap(function* () {
    input.write({
      "index.js": `window.hello = "hello world";\n//# sourceMappingURL=vendor.map`
    });

    yield output.build();

    expect(output.read()).to.deep.equal({
      "index.js": "if (typeof FastBoot === 'undefined') {\nwindow.hello = \"hello world\";\n\n}"
    });
  }));
});
