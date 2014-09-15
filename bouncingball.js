

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
    0, 1, 0, 0,
    0, 0, 1, 0,
    -0.0, -2.0, -80.0, 1
  ];
};


bouncingball.BouncingBallRenderer.prototype.getInverseIdentityMatrix = function() {
  return [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    -0.0, 2.0, 80.0, 1
  ];
};


/**
 * @inheritDoc
 */
bouncingball.BouncingBallRenderer.prototype.onChange = function(gl, width, height) {
  gl.viewport(0, 0, width, height);
  var aspect = width / height;
  this.projection_ = this.getFrustumMatrix(
      -aspect/10, aspect/10, -0.1, 0.1, 0.1, 8000.0);
};


/**
 * @inheritDoc
 */
bouncingball.BouncingBallRenderer.prototype.onCreate = function(gl) {
  console.log('oncreate');
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

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
  this.grid_data_ = bouncingball.createGrid(60, 7);
  this.grid_ = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.grid_);
  gl.bufferData(gl.ARRAY_BUFFER, this.grid_data_, gl.STATIC_DRAW);
};


/**
 * @inheritDoc
 */
bouncingball.BouncingBallRenderer.prototype.onDraw = function(gl) {
  this.handleKeys(this.keys_);
  gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
  gl.useProgram(this.p_.handle);
  gl.uniform1i(this.p_['wireframe'], false);
  gl.uniform1f(this.p_['time'], bouncingball.global.performance.now() / 1000.0);
  gl.uniformMatrix4fv(this.p_['projection'], false, this.projection_);
  gl.uniformMatrix4fv(this.p_['view'], false, this.getIdentityMatrix());
  gl.uniformMatrix4fv(this.p_['view_inverse'], false, this.getInverseIdentityMatrix());
  gl.vertexAttribPointer(this.p_['position'], 3, gl.FLOAT, false, 24, 0);
  gl.enableVertexAttribArray(this.p_['position']);
  gl.vertexAttribPointer(this.p_['barycentric'], 3, gl.FLOAT, false, 24, 12);
  gl.enableVertexAttribArray(this.p_['barycentric']);
  gl.bindBuffer(gl.ARRAY_BUFFER, this.grid_);
  gl.disable(gl.DEPTH_TEST);
  gl.drawArrays(gl.TRIANGLES, 0, this.grid_data_.length / 6);
  gl.enable(gl.DEPTH_TEST);
  gl.drawArrays(gl.TRIANGLES, 0, this.grid_data_.length / 6);
  gl.flush();
};


bouncingball.BouncingBallRenderer.prototype.handleKeys = function(keys) {
  if (keys.justPressed(bouncingball.Key.LEFT)) {
    try {
      document.getElementById('c0').requestPointerLock();
      console.log('request pointer lock');
    } catch (ignored) {
      console.log(ignored);
    }
  }
};
