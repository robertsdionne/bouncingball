

/**
 * @type {bouncingball.Application}
 * @private
 */
bouncingball.application_ = null;


bouncingball.install_ = function(canvas, opt_options) {
  if (bouncingball.application_) {
    bouncingball.application_.uninstall();
  }
  canvas.addEventListener(
      'click', bouncingball.bind(bouncingball.pointerLock_, null, canvas), true);
  var keys = new bouncingball.Keys(document);
  bouncingball.application_ = new bouncingball.Application(window, keys, opt_options);
  var renderer = new bouncingball.BouncingBallRenderer(keys);
  bouncingball.application_.install(canvas, renderer);
  document.addEventListener(
      'mousemove', bouncingball.bind(renderer.handleMouseMove, renderer), true);
};


bouncingball.pointerLock_ = function(canvas, event) {
  canvas.requestPointerLock();
};


bouncingball.load = function() {
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


bouncingball.BouncingBallRenderer.PIXELS_TO_RADIANS_ = Math.PI / 400.0;


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

  this.rotation_ = new bouncingball.Quaternion();
  this.translation_ = new bouncingball.Vector(0.0, 2.0, 80.0);
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
  gl.uniformMatrix4fv(this.p_['rotation'], false, this.rotation_.toMatrix());
  gl.uniformMatrix4fv(this.p_['rotation_inverse'], false, this.rotation_.reciprocal().toMatrix());
  gl.uniformMatrix4fv(this.p_['translation'], false, this.translation_.toMatrix());
  gl.uniformMatrix4fv(this.p_['translation_inverse'], false, this.translation_.negate().toMatrix());
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
  var d = 1e0;
  var inverse = this.rotation_.reciprocal();
  var right = inverse.transform(bouncingball.Vector.I);
  var up = bouncingball.Vector.J.times(
      bouncingball.Vector.J.dot(inverse.transform(bouncingball.Vector.J)));
  var forward = inverse.transform(bouncingball.Vector.K.negate());
  forward.y = 0.0;
  forward = forward.normalized();

  if (keys.isPressed(bouncingball.Key.A) || keys.isPressed(bouncingball.Key.LEFT)) {
    this.translation_ = this.translation_.plus(right.times(-d));
  }

  if (keys.isPressed(bouncingball.Key.D) || keys.isPressed(bouncingball.Key.RIGHT)) {
    this.translation_ = this.translation_.plus(right.times(d));
  }

  if (keys.isPressed(bouncingball.Key.S) || keys.isPressed(bouncingball.Key.DOWN)) {
    this.translation_ = this.translation_.plus(forward.times(-d));
  }

  if (keys.isPressed(bouncingball.Key.W) || keys.isPressed(bouncingball.Key.UP)) {
    this.translation_ = this.translation_.plus(forward.times(d));
  }

  if (keys.isPressed(bouncingball.Key.Z)) {
    this.translation_ = this.translation_.plus(up.times(-d));
  }

  if (keys.isPressed(bouncingball.Key.Q)) {
    this.translation_ = this.translation_.plus(up.times(d));
  }
};


bouncingball.BouncingBallRenderer.prototype.handleMouseMove = function(event) {
  var inverse = this.rotation_.reciprocal();
  var right = inverse.transform(bouncingball.Vector.I);
  var up = bouncingball.Vector.J.times(
      bouncingball.Vector.J.dot(inverse.transform(bouncingball.Vector.J)));
  var radians_x = bouncingball.BouncingBallRenderer.PIXELS_TO_RADIANS_ * event.movementX;
  var radians_y = bouncingball.BouncingBallRenderer.PIXELS_TO_RADIANS_ * event.movementY;
  this.rotation_ = this.rotation_.times(bouncingball.Quaternion.fromAxisAngle(up, radians_x));
  this.rotation_ = this.rotation_.times(bouncingball.Quaternion.fromAxisAngle(right, radians_y));
};
