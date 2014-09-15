

/**
 * @type {bouncingball.Application}
 * @private
 */
bouncingball.application_ = null;


bouncingball.install_ = function(canvas, opt_options) {
  if (bouncingball.application_) {
    bouncingball.application_.uninstall();
  }
  var keys = new bouncingball.Keys(document);
  bouncingball.application_ = new bouncingball.Application(window, keys, opt_options);
  bouncingball.application_.install(canvas, new bouncingball.BouncingBallRenderer(keys));
};


bouncingball.load = function() {
  console.log('load');
  bouncingball.install_(document.getElementById('c0'));
  bouncingball.application_.start();
};


/**
 * @constructor
 * @type {!bouncingball.Keys} keys
 * @extends {bouncingball.Renderer}
 */
bouncingball.BouncingBallRenderer = function(keys) {
  /**
   * @type {!bouncingball.Keys}
   */
  this.keys_ = keys;

  /**
   * @type {bouncingball.Program}
   */
  this.p_ = null;
};
bouncingball.inherits(bouncingball.BouncingBallRenderer, bouncingball.Renderer);


bouncingball.BouncingBallRenderer.prototype.getFrustumMatrix = function(
    left, right, bottom, top, near, far) {
  var a = (right + left) / (right - left);
  var b = (top + bottom) / (top - bottom);
  var c = -(far + near) / (far - near);
  var d = -(2 * far * near) / (far - near);
  return [
    2 * near / (right - left), 0, 0, 0,
    0, 2 * near / (top - bottom), 0, 0,
    a, b, c, -1,
    0, 0, d, 0
  ];
};


bouncingball.BouncingBallRenderer.prototype.getIdentityMatrix = function() {
  return [
    1, 0, 0, 0,
    0, 0, 1, 0,
    0, -1, 0, 0,
    0.0, 0.0, -7.0, 1
  ];
};


/**
 * @inheritDoc
 */
bouncingball.BouncingBallRenderer.prototype.onChange = function(gl, width, height) {
  gl.viewport(0, 0, width, height);
  var aspect = width / height;
  this.projection_ = this.getFrustumMatrix(
      -aspect/10, aspect/10, -0.1, 0.1, 0.1, 4000.0);
};


bouncingball.BouncingBallRenderer.prototype.createGrid_ = function(width, opt_levels) {
  var levels = opt_levels || 0;
  var mm = 0.00;
  var grid = [];
  for (var i = 0; i <= levels; ++i) {
    var scale = 10.0 * Math.pow(3, i);
    for (var j = 0; j < width; ++j) {
      for (var k = 0; k < width; ++k) {
        if (i > 0 &&
            width / 3.0 < j + 2 && j - 1 < 2.0 / 3.0 * width &&
            width / 3.0 < k + 2 && k - 1 < 2.0 / 3.0 * width) {
          continue;
        }
        // v00
        // x00, y00, z00
        grid.push(((k + 0) / width - 0.5) * scale, mm * scale, ((j + 0) / width - 0.5) * scale);
        // barycentric
        grid.push(1.0, 0.0, 0.0);

        // v01
        // x01, y01, z01
        grid.push(((k + 0) / width - 0.5) * scale, mm * scale, ((j + 1) / width - 0.5) * scale);
        // barycentric
        grid.push(0.0, 1.0, 0.0);

        // v11
        // x11, y11, z11
        grid.push(((k + 1) / width - 0.5) * scale, mm * scale, ((j + 1) / width - 0.5) * scale);
        // barycentric
        grid.push(0.0, 0.0, 1.0);

        // v00
        // x00, y00, z00
        grid.push(((k + 0) / width - 0.5) * scale, mm * scale, ((j + 0) / width - 0.5) * scale);
        // barycentric
        grid.push(1.0, 0.0, 0.0);

        // v11
        // x11, y11, z11
        grid.push(((k + 1) / width - 0.5) * scale, mm * scale, ((j + 1) / width - 0.5) * scale);
        // barycentric
        grid.push(0.0, 0.0, 1.0);

        // v10
        // x10, y10, z10
        grid.push(((k + 1) / width - 0.5) * scale, mm * scale, ((j + 0) / width - 0.5) * scale);
        // barycentric
        grid.push(0.0, 1.0, 0.0);

        if (i > 0 &&
            2.0 / 3.0 * width == j - 1 &&
            2.0 / 3.0 * width == k - 1) {
          // v00
          // x00, y00, z00
          grid.push(((k - 1) / width - 0.5) * scale, mm * scale, ((j - 1) / width - 0.5) * scale);
          // barycentric
          grid.push(1.0, 0.0, 0.0);

          // v01
          // x01, y01, z01
          grid.push(((k - 1) / width - 0.5) * scale, mm * scale, ((j + 0) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 1.0, 0.0);

          // v11
          // x11, y11, z11
          grid.push(((k + 0) / width - 0.5) * scale, mm * scale, ((j + 0) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 0.0, 1.0);

          // v00
          // x00, y00, z00
          grid.push(((k - 1) / width - 0.5) * scale, mm * scale, ((j - 1) / width - 0.5) * scale);
          // barycentric
          grid.push(1.0, 0.0, 0.0);

          // v11
          // x11, y11, z11
          grid.push(((k + 0) / width - 0.5) * scale, mm * scale, ((j + 0) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 0.0, 1.0);

          // v10
          // x10, y10, z10
          grid.push(((k + 0) / width - 0.5) * scale, mm * scale, ((j - 1) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 1.0, 0.0);
        }

        if (i > 0 &&
            1.0 / 3.0 * width == j + 2 &&
            2.0 / 3.0 * width == k - 1) {
          // v00
          // x00, y00, z00
          grid.push(((k - 1) / width - 0.5) * scale, mm * scale, ((j + 1) / width - 0.5) * scale);
          // barycentric
          grid.push(1.0, 0.0, 0.0);

          // v01
          // x01, y01, z01
          grid.push(((k - 1) / width - 0.5) * scale, mm * scale, ((j + 2) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 1.0, 0.0);

          // v11
          // x11, y11, z11
          grid.push(((k + 0) / width - 0.5) * scale, mm * scale, ((j + 2) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 0.0, 1.0);

          // v00
          // x00, y00, z00
          grid.push(((k - 1) / width - 0.5) * scale, mm * scale, ((j + 1) / width - 0.5) * scale);
          // barycentric
          grid.push(1.0, 0.0, 0.0);

          // v11
          // x11, y11, z11
          grid.push(((k + 0) / width - 0.5) * scale, mm * scale, ((j + 2) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 0.0, 1.0);

          // v10
          // x10, y10, z10
          grid.push(((k + 0) / width - 0.5) * scale, mm * scale, ((j + 1) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 1.0, 0.0);
        }

        if (i > 0 &&
            2.0 / 3.0 * width == j - 1 &&
            1.0 / 3.0 * width == k + 2) {
          // v00
          // x00, y00, z00
          grid.push(((k + 1) / width - 0.5) * scale, mm * scale, ((j - 1) / width - 0.5) * scale);
          // barycentric
          grid.push(1.0, 0.0, 0.0);

          // v01
          // x01, y01, z01
          grid.push(((k + 1) / width - 0.5) * scale, mm * scale, ((j + 0) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 1.0, 0.0);

          // v11
          // x11, y11, z11
          grid.push(((k + 2) / width - 0.5) * scale, mm * scale, ((j + 0) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 0.0, 1.0);

          // v00
          // x00, y00, z00
          grid.push(((k + 1) / width - 0.5) * scale, mm * scale, ((j - 1) / width - 0.5) * scale);
          // barycentric
          grid.push(1.0, 0.0, 0.0);

          // v11
          // x11, y11, z11
          grid.push(((k + 2) / width - 0.5) * scale, mm * scale, ((j + 0) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 0.0, 1.0);

          // v10
          // x10, y10, z10
          grid.push(((k + 2) / width - 0.5) * scale, mm * scale, ((j - 1) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 1.0, 0.0);
        }

        if (i > 0 &&
            1.0 / 3.0 * width == j + 2 &&
            1.0 / 3.0 * width == k + 2) {
          // v00
          // x00, y00, z00
          grid.push(((k + 1) / width - 0.5) * scale, mm * scale, ((j + 1) / width - 0.5) * scale);
          // barycentric
          grid.push(1.0, 0.0, 0.0);

          // v01
          // x01, y01, z01
          grid.push(((k + 1) / width - 0.5) * scale, mm * scale, ((j + 2) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 1.0, 0.0);

          // v11
          // x11, y11, z11
          grid.push(((k + 2) / width - 0.5) * scale, mm * scale, ((j + 2) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 0.0, 1.0);

          // v00
          // x00, y00, z00
          grid.push(((k + 1) / width - 0.5) * scale, mm * scale, ((j + 1) / width - 0.5) * scale);
          // barycentric
          grid.push(1.0, 0.0, 0.0);

          // v11
          // x11, y11, z11
          grid.push(((k + 2) / width - 0.5) * scale, mm * scale, ((j + 2) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 0.0, 1.0);

          // v10
          // x10, y10, z10
          grid.push(((k + 2) / width - 0.5) * scale, mm * scale, ((j + 1) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 1.0, 0.0);
        }

        if (i > 0 &&
            2.0 / 3.0 * width == j - 1 &&
            width / 3.0 < k + 1 && k < 2.0 / 3.0 * width) {
          // v00
          // x00, y00, z00
          grid.push(((k + 0) / width - 0.5) * scale, mm * scale, ((j) / width - 0.5) * scale);
          // barycentric
          grid.push(1.0, 0.0, 0.0);

          // v10
          // x10, y10, z10
          grid.push(((k + 1) / width - 0.5) * scale, mm * scale, ((j) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 1.0, 0.0);

          // v00
          // x00, y00, z00
          grid.push(((k + 1) / width - 0.5) * scale - scale / width / 3.0, mm * scale, ((j - 1) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 0.0, 1.0);

          // v00
          // x00, y00, z00
          grid.push(((k + 0) / width - 0.5) * scale, mm * scale, ((j) / width - 0.5) * scale);
          // barycentric
          grid.push(1.0, 0.0, 0.0);

          // v00
          // x00, y00, z00
          grid.push(((k + 1) / width - 0.5) * scale - scale / width / 3.0, mm * scale, ((j - 1) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 0.0, 1.0);

          // v00
          // x00, y00, z00
          grid.push(((k + 1) / width - 0.5) * scale - 2.0 * scale / width / 3.0, mm * scale, ((j - 1) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 1.0, 0.0);

          // v00
          // x00, y00, z00
          grid.push(((k + 0) / width - 0.5) * scale, mm * scale, ((j) / width - 0.5) * scale);
          // barycentric
          grid.push(1.0, 0.0, 0.0);

          // v00
          // x00, y00, z00
          grid.push(((k + 1) / width - 0.5) * scale - 2.0 * scale / width / 3.0, mm * scale, ((j - 1) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 0.0, 1.0);

          // v00
          // x00, y00, z00
          grid.push(((k + 0) / width - 0.5) * scale, mm * scale, ((j - 1) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 1.0, 0.0);

          // v10
          // x10, y10, z10
          grid.push(((k + 1) / width - 0.5) * scale, mm * scale, ((j) / width - 0.5) * scale);
          // barycentric
          grid.push(1.0, 0.0, 0.0);

          // v10
          // x10, y10, z10
          grid.push(((k + 1) / width - 0.5) * scale, mm * scale, ((j - 1) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 1.0, 0.0);

          // v00
          // x00, y00, z00
          grid.push(((k + 1) / width - 0.5) * scale - scale / width / 3.0, mm * scale, ((j - 1) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 0.0, 1.0);
        }

        if (i > 0 &&
            1.0 / 3.0 * width == j + 2 &&
            width / 3.0 < k + 1 && k < 2.0 / 3.0 * width) {
          // v00
          // x00, y00, z00
          grid.push(((k + 0) / width - 0.5) * scale, mm * scale, ((j + 1) / width - 0.5) * scale);
          // barycentric
          grid.push(1.0, 0.0, 0.0);

          // v00
          // x00, y00, z00
          grid.push(((k + 1) / width - 0.5) * scale - scale / width / 3.0, mm * scale, ((j + 2) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 0.0, 1.0);

          // v10
          // x10, y10, z10
          grid.push(((k + 1) / width - 0.5) * scale, mm * scale, ((j + 1) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 1.0, 0.0);

          // v00
          // x00, y00, z00
          grid.push(((k + 0) / width - 0.5) * scale, mm * scale, ((j + 1) / width - 0.5) * scale);
          // barycentric
          grid.push(1.0, 0.0, 0.0);

          // v00
          // x00, y00, z00
          grid.push(((k + 1) / width - 0.5) * scale - 2.0 * scale / width / 3.0, mm * scale, ((j + 2) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 1.0, 0.0);

          // v00
          // x00, y00, z00
          grid.push(((k + 1) / width - 0.5) * scale - scale / width / 3.0, mm * scale, ((j + 2) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 0.0, 1.0);

          // v00
          // x00, y00, z00
          grid.push(((k + 0) / width - 0.5) * scale, mm * scale, ((j + 1) / width - 0.5) * scale);
          // barycentric
          grid.push(1.0, 0.0, 0.0);

          // v00
          // x00, y00, z00
          grid.push(((k + 0) / width - 0.5) * scale, mm * scale, ((j + 2) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 1.0, 0.0);

          // v00
          // x00, y00, z00
          grid.push(((k + 1) / width - 0.5) * scale - 2.0 * scale / width / 3.0, mm * scale, ((j + 2) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 0.0, 1.0);

          // v10
          // x10, y10, z10
          grid.push(((k + 1) / width - 0.5) * scale, mm * scale, ((j + 1) / width - 0.5) * scale);
          // barycentric
          grid.push(1.0, 0.0, 0.0);

          // v00
          // x00, y00, z00
          grid.push(((k + 1) / width - 0.5) * scale - scale / width / 3.0, mm * scale, ((j + 2) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 0.0, 1.0);

          // v10
          // x10, y10, z10
          grid.push(((k + 1) / width - 0.5) * scale, mm * scale, ((j + 2) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 1.0, 0.0);
        }

        if (i > 0 &&
            2.0 / 3.0 * width == k - 1 &&
            width / 3.0 < j + 1 && j < 2.0 / 3.0 * width) {
          // v00
          // x00, y00, z00
          grid.push(((k + 0) / width - 0.5) * scale, mm * scale, ((j + 0) / width - 0.5) * scale);
          // barycentric
          grid.push(1.0, 0.0, 0.0);

          // v00
          // x00, y00, z00
          grid.push(((k - 1) / width - 0.5) * scale, mm * scale, ((j + 1) / width - 0.5) * scale - scale / width / 3.0);
          // barycentric
          grid.push(0.0, 0.0, 1.0);

          // v10
          // x10, y10, z10
          grid.push(((k) / width - 0.5) * scale, mm * scale, ((j + 1) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 1.0, 0.0);

          // v00
          // x00, y00, z00
          grid.push(((k + 0) / width - 0.5) * scale, mm * scale, ((j + 0) / width - 0.5) * scale);
          // barycentric
          grid.push(1.0, 0.0, 0.0);

          // v10
          // x10, y10, z10
          grid.push(((k - 1) / width - 0.5) * scale, mm * scale, ((j + 1) / width - 0.5) * scale - 2.0 * scale / width / 3.0);
          // barycentric
          grid.push(0.0, 1.0, 0.0);

          // v00
          // x00, y00, z00
          grid.push(((k - 1) / width - 0.5) * scale, mm * scale, ((j + 1) / width - 0.5) * scale - scale / width / 3.0);
          // barycentric
          grid.push(0.0, 0.0, 1.0);


          // v00
          // x00, y00, z00
          grid.push(((k) / width - 0.5) * scale, mm * scale, ((j + 1) / width - 0.5) * scale);
          // barycentric
          grid.push(1.0, 0.0, 0.0);

          // v00
          // x00, y00, z00
          grid.push(((k - 1) / width - 0.5) * scale, mm * scale, ((j + 1) / width - 0.5) * scale - scale / width / 3.0);
          // barycentric
          grid.push(0.0, 0.0, 1.0);

          // v00
          // x00, y00, z00
          grid.push(((k - 1) / width - 0.5) * scale, mm * scale, ((j + 1) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 1.0, 0.0);


          // v10
          // x10, y10, z10
          grid.push(((k) / width - 0.5) * scale, mm * scale, ((j) / width - 0.5) * scale);
          // barycentric
          grid.push(1.0, 0.0, 0.0);

          // v10
          // x10, y10, z10
          grid.push(((k-1) / width - 0.5) * scale, mm * scale, ((j) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 1.0, 0.0);

          // v00
          // x00, y00, z00
          grid.push(((k-1) / width - 0.5) * scale, mm * scale, ((j+1) / width - 0.5) * scale - 2.0 * scale / width / 3.0);
          // barycentric
          grid.push(0.0, 0.0, 1.0);
        }

        if (i > 0 &&
            1.0 / 3.0 * width == k + 2 &&
            width / 3.0 < j + 1 && j < 2.0 / 3.0 * width) {
          // v00
          // x00, y00, z00
          grid.push(((k + 1) / width - 0.5) * scale, mm * scale, ((j + 0) / width - 0.5) * scale);
          // barycentric
          grid.push(1.0, 0.0, 0.0);

          // v10
          // x10, y10, z10
          grid.push(((k + 1) / width - 0.5) * scale, mm * scale, ((j + 1) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 1.0, 0.0);

          // v00
          // x00, y00, z00
          grid.push(((k + 2) / width - 0.5) * scale, mm * scale, ((j + 1) / width - 0.5) * scale - scale / width / 3.0);
          // barycentric
          grid.push(0.0, 0.0, 1.0);

          // v00
          // x00, y00, z00
          grid.push(((k + 1) / width - 0.5) * scale, mm * scale, ((j + 0) / width - 0.5) * scale);
          // barycentric
          grid.push(1.0, 0.0, 0.0);

          // v00
          // x00, y00, z00
          grid.push(((k + 2) / width - 0.5) * scale, mm * scale, ((j + 1) / width - 0.5) * scale - scale / width / 3.0);
          // barycentric
          grid.push(0.0, 0.0, 1.0);

          // v10
          // x10, y10, z10
          grid.push(((k + 2) / width - 0.5) * scale, mm * scale, ((j + 1) / width - 0.5) * scale - 2.0 * scale / width / 3.0);
          // barycentric
          grid.push(0.0, 1.0, 0.0);


          // v00
          // x00, y00, z00
          grid.push(((k + 1) / width - 0.5) * scale, mm * scale, ((j + 1) / width - 0.5) * scale);
          // barycentric
          grid.push(1.0, 0.0, 0.0);

          // v00
          // x00, y00, z00
          grid.push(((k + 2) / width - 0.5) * scale, mm * scale, ((j + 1) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 1.0, 0.0);

          // v00
          // x00, y00, z00
          grid.push(((k + 2) / width - 0.5) * scale, mm * scale, ((j + 1) / width - 0.5) * scale - scale / width / 3.0);
          // barycentric
          grid.push(0.0, 0.0, 1.0);


          // v10
          // x10, y10, z10
          grid.push(((k + 1) / width - 0.5) * scale, mm * scale, ((j) / width - 0.5) * scale);
          // barycentric
          grid.push(1.0, 0.0, 0.0);

          // v00
          // x00, y00, z00
          grid.push(((k + 2) / width - 0.5) * scale, mm * scale, ((j+1) / width - 0.5) * scale - 2.0 * scale / width / 3.0);
          // barycentric
          grid.push(0.0, 0.0, 1.0);

          // v10
          // x10, y10, z10
          grid.push(((k + 2) / width - 0.5) * scale, mm * scale, ((j) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 1.0, 0.0);
        }
      }
    }
  }
  return new Float32Array(grid);
};


/**
 * @inheritDoc
 */
bouncingball.BouncingBallRenderer.prototype.onCreate = function(gl) {
  console.log('oncreate');
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.frontFace(gl.CCW);

  this.keys_.install();

  var vertex = new bouncingball.Shader(gl, 'v0');
  var fragment = new bouncingball.Shader(gl, 'f0');
  this.p_ = new bouncingball.Program(vertex, fragment);
  this.p_.create(gl);
  this.p_.link(gl);

  // var grid = 
  this.grid_data_ = this.createGrid_(60, 7);
  this.grid_ = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.grid_);
  gl.bufferData(gl.ARRAY_BUFFER, this.grid_data_, gl.STATIC_DRAW);
};


/**
 * @inheritDoc
 */
bouncingball.BouncingBallRenderer.prototype.onDraw = function(gl) {
  gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
  gl.useProgram(this.p_.handle);
  gl.uniform1i(this.p_['wireframe'], true);
  gl.uniform1f(this.p_['time'], bouncingball.global.performance.now() / 1000.0);
  gl.uniformMatrix4fv(this.p_['projection'], false, this.projection_);
  gl.uniformMatrix4fv(this.p_['view'], false, this.getIdentityMatrix());
  gl.vertexAttribPointer(this.p_['position'], 3, gl.FLOAT, false, 24, 0);
  gl.enableVertexAttribArray(this.p_['position']);
  gl.vertexAttribPointer(this.p_['barycentric'], 3, gl.FLOAT, false, 24, 12);
  gl.enableVertexAttribArray(this.p_['barycentric']);
  gl.bindBuffer(gl.ARRAY_BUFFER, this.grid_);
  gl.drawArrays(gl.TRIANGLES, 0, this.grid_data_.length / 6);
  gl.flush();
};
