// Copyright 2014 Robert Scott Dionne. All Rights Reserved.

/**
 * @fileoverview
 * @author robertsdionne@gmail.com (Robert Scott Dionne)
 */

var bouncingball = {};


bouncingball.global = this;


bouncingball.inherits = function(child, parent) {
  var temp = function() {};
  temp.prototype = parent.prototype;
  child.superClass_ = parent.prototype;
  child.prototype = new temp();
  child.prototype.constructor = child;
};


bouncingball.bind = function(fn, self) {
  var context = self || bouncingball.global;
  if (arguments > 2) {
    var bound = Array.prototype.slice.call(arguments, 2);
    return function() {
      var newArgs = Array.prototype.slice.call(arguments);
      Array.prototype.unshift.apply(arguments, bound);
      return fn.apply(context, newArgs);
    };
  } else {
    return function() {
      return fn.apply(context, arguments);
    }
  }
};


bouncingball.nullFunction = function() {};


bouncingball.abstractMethod = function() {
  throw new Error('Unimplemented abstract method.');
};


[
  'keys.js',
  'shader.js',
  'program.js',
  'renderer.js',
  'application.js',
  'grid.js',
  'bouncingball.js'
].forEach(function(source) {
  document.write([
    '<script type="application/javascript" src="', source, '"></script>'
  ].join(''));
});
