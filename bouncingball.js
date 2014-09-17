

/**
 * @type {bouncingball.Application}
 * @private
 */
bouncingball.application_ = null;


bouncingball.canvas_click_listener_ = null;


bouncingball.mouse_move_listener_ = null;


bouncingball.install_ = function(canvas, opt_options) {
  if (bouncingball.application_) {
    canvas.removeEventListener('click', bouncingball.canvas_click_listener_, true);
    bouncingball.canvas_click_listener_ = null;
    document.removeEventListener('pointerlockchange', bouncingball.pointerLockChange_, true);
    document.removeEventListener('mousemove', bouncingball.mouse_move_listener_, true);
    bouncingball.mouse_move_listener_ = null;
    bouncingball.application_.uninstall();
  }
  bouncingball.canvas_click_listener_ = bouncingball.bind(bouncingball.pointerLock_, null, canvas);
  canvas.addEventListener('click', bouncingball.canvas_click_listener_, true);
  document.addEventListener('pointerlockchange', bouncingball.pointerLockChange_, true);
  var keys = new bouncingball.Keys(document);
  bouncingball.application_ = new bouncingball.Application(window, keys, opt_options);
  var renderer = new bouncingball.BouncingBallRenderer(keys);
  bouncingball.application_.install(canvas, renderer);
  bouncingball.mouse_move_listener_ = bouncingball.bind(renderer.handleMouseMove, renderer);
  document.addEventListener('mousemove', bouncingball.mouse_move_listener_, true);
};


bouncingball.pointerLock_ = function(canvas, event) {
  if (!document.pointerLockElement) {
    canvas.requestPointerLock();
    // bouncingball.load();
  }
};


bouncingball.pointerLockChange_ = function() {
  if (!document.pointerLockElement) {
  }
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
  this.p0_ = null;

  /**
   * @type {bouncingball.Program}
   */
  this.p1_ = null;
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


bouncingball.BouncingBallRenderer.prototype.sinc = function(u) {
  return bouncingball.MultiDualNumber.sin(
      u.minus(new bouncingball.MultiDualNumber(10.0 * this.time_ + 1.0))).over(
          u.plus(new bouncingball.MultiDualNumber(1.0)));
};


bouncingball.BouncingBallRenderer.prototype.f = function(in_x, in_y) {
  var x = bouncingball.MultiDualNumber.x(in_x);
  var y = bouncingball.MultiDualNumber.y(in_y);
  var t = new bouncingball.MultiDualNumber(this.time_);
 return this.sinc(
    x.squared().plus(y.squared()).over(new bouncingball.MultiDualNumber(100.0))).times(
        new bouncingball.MultiDualNumber(10.0)).plus(
  new bouncingball.MultiDualNumber(20.0).times(
          bouncingball.MultiDualNumber.sin(x.over(new bouncingball.MultiDualNumber(40.0)).minus(t)))).plus(
      x.squared().plus(y.squared()).over(new bouncingball.MultiDualNumber(3900.0)));
};


bouncingball.BouncingBallRenderer.prototype.normal_f = function(x, y) {
  var f = this.f(x, y);
  return new bouncingball.Vector(-f.dx, 1.0, -f.dy).normalized();
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


bouncingball.BouncingBallRenderer.prototype.handleClick_ = function(event) {
  if (document.pointerLockElement) {
    this.tracking_ += (event.button == 0) ? 1 : -1;
  }
};


/**
 * @inheritDoc
 */
bouncingball.BouncingBallRenderer.prototype.onCreate = function(gl) {
  this.onclick_ = bouncingball.bind(this.handleClick_, this);
  gl.canvas.addEventListener('click', this.onclick_, true);

  this.time_ = bouncingball.global.performance.now() / 1000.0;
  gl.clearColor(1.0, 1.0, 1.0, 1.0);

  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LESS);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.frontFace(gl.CCW);

  this.keys_.install();

  try {
    var vertex = new bouncingball.Shader(gl, 'v0-preamble', 'l0-functions', 'v0-main');
    var fragment = new bouncingball.Shader(gl, 'f0-preamble', 'l0-functions', 'f0-main');
    this.p0_ = new bouncingball.Program(vertex, fragment);
    this.p0_.create(gl);
    this.p0_.link(gl);
  } catch (e) {
    console.log(e.message);
  }

  if (!this.p1_) {
    var vertex = new bouncingball.Shader(gl, 'v1-main');
    var fragment = new bouncingball.Shader(gl, 'f1-main');
    this.p1_ = new bouncingball.Program(vertex, fragment);
    this.p1_.create(gl);
    this.p1_.link(gl);
  }

  this.grid_data_ = bouncingball.createGrid(60, 7, 10.0);
  this.grid_ = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.grid_);
  gl.bufferData(gl.ARRAY_BUFFER, this.grid_data_, gl.STATIC_DRAW);
  this.grid_elements_ = this.grid_data_.length / 6;
  this.grid_data_ = null;

  this.sphere_data_ = bouncingball.createGrid(24, 0, Math.PI);
  this.sphere_ = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.sphere_);
  gl.bufferData(gl.ARRAY_BUFFER, this.sphere_data_, gl.STATIC_DRAW);
  this.sphere_elements_ = this.sphere_data_.length / 6;
  this.sphere_data_ = null;

  this.rotation_ = new bouncingball.Quaternion();
  this.translation_ = new bouncingball.Vector(0.0, 80.0, 270.0);
  this.wireframe_ = false;

  // meta
  this.tracking_ = 0;
  this.frame_ = 0;
  this.time_varying_ = true;
  this.stochastic_ = true;
  this.stochastic_low_frequency_ = false;
  this.smooth_ = 0.9;
  this.score_rate_ = 0.25;
  this.score_decay_ = 0.9;

  this.particle_score_ = 0;
  this.sgd_score_ = 0;
  this.momentum_score_ = 0;
  this.nesterov_score_ = 0;
  this.adagrad_score_ = 0;
  this.adadelta_score_ = 0;

  this.resetSimulation_();
};


bouncingball.BouncingBallRenderer.prototype.resetSimulation_ = function() {

  // optimizers
  this.dt_ = 1.6e-2;
  this.g_ = 9.8e1;

  var start = new bouncingball.Vector(
      2000.0 * Math.random() - 1000.0, 1000.0 * Math.random(), -2000.0 * Math.random());
  start.y += this.f(start.x, start.z).z;
  this.train_yet_ = false;
  this.collision_ = false;

  this.particle_ = start.times(1);
  this.particle_smooth_ = start.times(1);
  this.particle_color_ = [1.0, 0.0, 0.0];
  this.particle_decay_ = 0.9;
  this.particle_v_ = new bouncingball.Vector();
  this.particle_a_ = bouncingball.Vector.J.times(-this.g_);

  this.sgd_ = start.times(1);
  this.sgd_smooth_ = start.times(1);
  this.sgd_color_ = [0.0, 0.0, 1.0];

  this.momentum_ = start.times(1);
  this.momentum_smooth_ = start.times(1);
  this.momentum_color_ = [0.0, 1.0, 0.0];
  this.momentum_mu_ = 0.999;
  this.momentum_v_ = new bouncingball.Vector();

  this.nesterov_ = start.times(1);
  this.nesterov_smooth_ = start.times(1);
  this.nesterov_color_ = [1.0, 0.0, 1.0];
  this.nesterov_mu_ = 0.999;
  this.nesterov_v_ = new bouncingball.Vector();

  this.adagrad_ = start.times(1);
  this.adagrad_smooth_ = start.times(1);
  this.adagrad_color_ = [1.0, 1.0, 0.0];
  this.adagrad_sigma_ = new bouncingball.Vector();

  this.adadelta_ = start.times(1);
  this.adadelta_smooth_ = start.times(1);
  this.adadelta_color_ = [0.0, 1.0, 1.0];
  this.adadelta_rho_ = 0.9;
  this.adadelta_delta_sigma_ = new bouncingball.Vector();
  this.adadelta_gradient_sigma_ = new bouncingball.Vector();
};


bouncingball.BouncingBallRenderer.prototype.collide_ = function() {
  var particle = this.f(this.particle_.x, this.particle_.z);
  if (this.particle_.y < particle.z) {
    this.resolveConstraint_(particle);
    // collide
    // if (!this.collision_) {
      // console.log('collide');
      this.particle_.y = particle.z;
      var normal = this.normal_f(this.particle_.x, this.particle_.z);
      var reflect = this.particle_v_.minus(
          normal.times(2.0 * this.particle_v_.dot(normal)).over(normal.magnitudeSquared()));
      this.particle_v_ = reflect.times(this.particle_decay_);
      this.train_yet_ = true;
      this.collision_ = true;
    // }
  }
  return particle.z;
};


bouncingball.BouncingBallRenderer.prototype.resolveConstraint_ = function(f) {
  // var old_y = this.particle_.y;
  this.particle_.y = f.z;
  // this.particle_v_ = this.particle_v_.times(this.momentum_mu_).minus(
  //     new bouncingball.Vector(f.dx, 0.0, f.dy));
  // console.log('resolve');
  // var old_speed = this.particle_v_.magnitude();
  // var argument = 2.0 * this.g_ * (old_y - new_y) + old_speed * old_speed;
  // if (argument > 0) {
  //   var new_speed = Math.sqrt(argument);
  //   this.particle_v_ = this.particle_v_.times(new_speed / old_speed);
  // }
};


bouncingball.BouncingBallRenderer.prototype.train_ = function() {
  this.particle_v_ = this.particle_v_.plus(this.particle_a_.times(this.dt_));
  this.particle_ = this.particle_.plus(this.particle_v_.times(this.dt_));
  var particle_z = this.collide_();

  if (this.train_yet_) {
    var sample = Math.random();
    if (sample < this.score_rate_) {
      this.particle_score_ = this.particle_score_ * this.score_decay_ - particle_z * (1.0 - this.score_decay_);
    }

    var sgd = this.f(this.sgd_.x, this.sgd_.z);
    this.sgd_ = this.sgd_.minus(new bouncingball.Vector(sgd.dx, 0.0, sgd.dy));
    this.sgd_.y = sgd.z;
    if (sample < this.score_rate_) {
      // this.sgd_score_ -= sgd.z;
      this.sgd_score_ = this.sgd_score_ * this.score_decay_ - sgd.z * (1.0 - this.score_decay_);
    }

    var momentum = this.f(this.momentum_.x, this.momentum_.z);
    this.momentum_v_ = this.momentum_v_.times(this.momentum_mu_).minus(
        new bouncingball.Vector(momentum.dx, 0.0, momentum.dy).times(this.dt_))
    this.momentum_ = this.momentum_.plus(this.momentum_v_);
    this.momentum_.y = momentum.z;
    if (sample < this.score_rate_) {
      // this.momentum_score_ -= momentum.z;
      this.momentum_score_ = this.momentum_score_ * this.score_decay_ - momentum.z * (1.0 - this.score_decay_);
    }

    var nesterov_temp = this.nesterov_.plus(this.nesterov_v_.times(this.nesterov_mu_));
    var nesterov = this.f(nesterov_temp.x, nesterov_temp.z);
    this.nesterov_v_ = this.nesterov_v_.times(this.nesterov_mu_).minus(
        new bouncingball.Vector(nesterov.dx, 0.0, nesterov.dy).times(this.dt_))
    this.nesterov_ = this.nesterov_.plus(this.nesterov_v_);
    this.nesterov_.y = nesterov.z;
    if (sample < this.score_rate_) {
      // this.nesterov_score_ -= nesterov.z;
      this.nesterov_score_ = this.nesterov_score_ * this.score_decay_ - nesterov.z * (1.0 - this.score_decay_);
    }

    var adagrad = this.f(this.adagrad_.x, this.adagrad_.z);
    this.adagrad_sigma_ = this.adagrad_sigma_.plus(
        new bouncingball.Vector(adagrad.dx * adagrad.dx, 0.0, adagrad.dy * adagrad.dy));
    this.adagrad_.x -= 100.0 * adagrad.dx / Math.sqrt(this.adagrad_sigma_.x);
    this.adagrad_.y = adagrad.z;
    this.adagrad_.z -= 100.0 * adagrad.dy / Math.sqrt(this.adagrad_sigma_.z);
    if (sample < this.score_rate_) {
      // this.adagrad_score_ -= adagrad.z;
      this.adagrad_score_ = this.adagrad_score_ * this.score_decay_ - adagrad.z * (1.0 - this.score_decay_);
    }

    var adadelta = this.f(this.adadelta_.x, this.adadelta_.z);
    this.adadelta_gradient_sigma_ = this.adadelta_gradient_sigma_.times(this.adadelta_rho_).plus(
        new bouncingball.Vector(adadelta.dx * adadelta.dx, 0.0, adadelta.dy * adadelta.dy).times(
            1.0 - this.adadelta_rho_));
    var delta_x = -Math.sqrt(this.adadelta_delta_sigma_.x + 1e-8) /
        Math.sqrt(this.adadelta_gradient_sigma_.x + 1e-8) * adadelta.dx;
    var delta_y = -Math.sqrt(this.adadelta_delta_sigma_.z + 1e-8) /
        Math.sqrt(this.adadelta_gradient_sigma_.z + 1e-8) * adadelta.dy;
    this.adadelta_delta_sigma_ = this.adadelta_delta_sigma_.times(this.adadelta_rho_).plus(
        new bouncingball.Vector(delta_x * delta_x, 0.0, delta_y * delta_y).times(
            1.0 - this.adadelta_rho_));
    this.adadelta_.x += 1e4 * delta_x;
    this.adadelta_.y = adadelta.z;
    this.adadelta_.z += 1e4 * delta_y;
    if (sample < this.score_rate_) {
      // this.adadelta_score_ -= adadelta.z;
      this.adadelta_score_ = this.adadelta_score_ * this.score_decay_ - adadelta.z * (1.0 - this.score_decay_);
    }
  }

  this.particle_smooth_ = this.particle_smooth_.times(
      this.smooth_).plus(this.particle_.times(1.0 - this.smooth_));
  this.sgd_smooth_ = this.sgd_smooth_.times(this.smooth_).plus(this.sgd_.times(1.0 - this.smooth_));
  this.momentum_smooth_ = this.momentum_smooth_.times(
      this.smooth_).plus(this.momentum_.times(1.0 - this.smooth_));
  this.nesterov_smooth_ = this.nesterov_smooth_.times(
      this.smooth_).plus(this.nesterov_.times(1.0 - this.smooth_));
  this.adagrad_smooth_ = this.adagrad_smooth_.times(
      this.smooth_).plus(this.adagrad_.times(1.0 - this.smooth_));
  this.adadelta_smooth_ = this.adadelta_smooth_.times(
      this.smooth_).plus(this.adadelta_.times(1.0 - this.smooth_));

  var max_score = Math.max(
    this.particle_score_,
    this.sgd_score_,
    this.momentum_score_,
    this.nesterov_score_,
    this.adagrad_score_,
    this.adadelta_score_
  );
  var exp_particle = Math.exp(this.particle_score_ - max_score);
  var exp_sgd = Math.exp(this.sgd_score_ - max_score);
  var exp_momentum = Math.exp(this.momentum_score_ - max_score);
  var exp_nesterov = Math.exp(this.nesterov_score_ - max_score);
  var exp_adagrad = Math.exp(this.adagrad_score_ - max_score);
  var exp_adadelta = Math.exp(this.adadelta_score_ - max_score);
  var exp_sum = exp_particle + exp_sgd + exp_momentum + exp_nesterov + exp_adagrad + exp_adadelta;
  var softmax_particle = exp_particle / exp_sum;
  var softmax_sgd = exp_sgd / exp_sum;
  var softmax_momentum = exp_momentum / exp_sum;
  var softmax_nesterov = exp_nesterov / exp_sum;
  var softmax_adagrad = exp_adagrad / exp_sum;
  var softmax_adadelta = exp_adadelta / exp_sum;
  document.getElementById('particle').innerText = softmax_particle.toPrecision(4);
  document.getElementById('sgd').innerText = softmax_sgd.toPrecision(4);
  document.getElementById('momentum').innerText = softmax_momentum.toPrecision(4);
  document.getElementById('nesterov').innerText = softmax_nesterov.toPrecision(4);
  document.getElementById('adagrad').innerText = softmax_adagrad.toPrecision(4);
  document.getElementById('adadelta').innerText = softmax_adadelta.toPrecision(4);
  document.getElementById('stochastic').innerText = this.time_varying_ && this.stochastic_ ? 'enabled' : 'disabled';
  document.getElementById('stochastic_low_frequency').innerText = this.time_varying_ && this.stochastic_ && this.stochastic_low_frequency_ ? 'enabled' : 'disabled';
  document.getElementById('time_varying').innerText = this.time_varying_ ? 'enabled' : 'disabled';
  document.getElementById('wireframe').innerText = this.wireframe_ ? 'enabled' : 'disabled';
};


bouncingball.BouncingBallRenderer.prototype.radius_ = function(position) {
  return 1.0 + 1e-6 * this.translation_.minus(position).magnitudeSquared();
};


/**
 * @inheritDoc
 */
bouncingball.BouncingBallRenderer.prototype.onDraw = function(gl) {
  if (this.time_varying_) {
    this.real_time_ = bouncingball.global.performance.now() / 1000.0;
    if (this.stochastic_) {
      if (this.frame_ % (this.stochastic_low_frequency_ ? 20 : 1) == 0) {
        this.time_ = 1000.0 * Math.random();
      }
    } else {
      this.time_ = this.real_time_;
    }
  } else {
    this.time_ = this.real_time_;
  }
  this.handleKeys(this.keys_);

  // optimizers
  this.train_();

  // fix player position
  if (this.time_varying_ && this.stochastic_ && !this.stochastic_low_frequency_) {
    if (this.tracking_ % 2 == 1) {
      this.translation_ = this.particle_smooth_.plus(bouncingball.Vector.J.times(4));
    }
  } else {
    if (this.tracking_ % 7 == 1) {
      this.translation_ = this.particle_smooth_.plus(bouncingball.Vector.J.times(4));
    } else if (this.tracking_ % 7 == 2) {
      this.translation_ = this.sgd_smooth_.plus(bouncingball.Vector.J.times(4));
    } else if (this.tracking_ % 7 == 3) {
      this.translation_ = this.momentum_smooth_.plus(bouncingball.Vector.J.times(4));
    } else if (this.tracking_ % 7 == 4) {
      this.translation_ = this.nesterov_smooth_.plus(bouncingball.Vector.J.times(4));
    } else if (this.tracking_ % 7 == 5) {
      this.translation_ = this.adagrad_smooth_.plus(bouncingball.Vector.J.times(4));
    } else if (this.tracking_ % 7 == 6) {
      this.translation_ = this.adadelta_smooth_.plus(bouncingball.Vector.J.times(4));
    }
  }

  var f = this.f(this.translation_.x, this.translation_.z);
  if (this.translation_.y < f.z + 1.0) {
    this.translation_.y = f.z + 1.0;
  }

  // render
  gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

  gl.useProgram(this.p0_.handle);
  gl.uniform1i(this.p0_['wireframe'], this.wireframe_);
  gl.uniform1f(this.p0_['time'], (!this.stochastic_ || this.stochastic_low_frequency_) ? this.time_ : this.real_time_);
  gl.uniformMatrix4fv(this.p0_['projection'], false, this.projection_);
  gl.uniformMatrix4fv(this.p0_['rotation'], false, this.rotation_.toMatrix());
  gl.uniformMatrix4fv(this.p0_['rotation_inverse'], false, this.rotation_.reciprocal().toMatrix());
  gl.uniformMatrix4fv(this.p0_['translation'], false, this.translation_.toMatrix());
  gl.uniformMatrix4fv(
      this.p0_['translation_inverse'], false, this.translation_.negate().toMatrix());
  gl.uniform3fv(this.p0_['particle'], this.particle_.toArray());
  gl.uniform3fv(this.p0_['sgd'], this.sgd_.toArray());
  gl.uniform3fv(this.p0_['momentum'], this.momentum_.toArray());
  gl.uniform3fv(this.p0_['nesterov'], this.nesterov_.toArray());
  gl.uniform3fv(this.p0_['adagrad'], this.adagrad_.toArray());
  gl.uniform3fv(this.p0_['adadelta'], this.adadelta_.toArray());
  gl.uniform3fv(this.p0_['particle_color'], this.particle_color_);
  gl.uniform3fv(this.p0_['sgd_color'], this.sgd_color_);
  gl.uniform3fv(this.p0_['momentum_color'], this.momentum_color_);
  gl.uniform3fv(this.p0_['nesterov_color'], this.nesterov_color_);
  gl.uniform3fv(this.p0_['adagrad_color'], this.adagrad_color_);
  gl.uniform3fv(this.p0_['adadelta_color'], this.adadelta_color_);

  gl.bindBuffer(gl.ARRAY_BUFFER, this.grid_);
  gl.vertexAttribPointer(this.p0_['position'], 3, gl.FLOAT, false, 24, 0);
  gl.enableVertexAttribArray(this.p0_['position']);
  gl.vertexAttribPointer(this.p0_['barycentric'], 3, gl.FLOAT, false, 24, 12);
  gl.enableVertexAttribArray(this.p0_['barycentric']);

  gl.disable(gl.DEPTH_TEST);
  gl.drawArrays(gl.TRIANGLES, 0, this.grid_elements_);

  gl.enable(gl.DEPTH_TEST);
  gl.drawArrays(gl.TRIANGLES, 0, this.grid_elements_);

  gl.useProgram(this.p1_.handle);
  gl.uniformMatrix4fv(this.p1_['projection'], false, this.projection_);
  gl.uniformMatrix4fv(this.p1_['rotation'], false, this.rotation_.toMatrix());
  gl.uniformMatrix4fv(this.p1_['rotation_inverse'], false, this.rotation_.reciprocal().toMatrix());
  gl.uniformMatrix4fv(this.p1_['translation'], false, this.translation_.toMatrix());
  gl.uniformMatrix4fv(
      this.p1_['translation_inverse'], false, this.translation_.negate().toMatrix());

  gl.bindBuffer(gl.ARRAY_BUFFER, this.sphere_);
  gl.vertexAttribPointer(this.p1_['angles'], 3, gl.FLOAT, false, 24, 0);
  gl.enableVertexAttribArray(this.p1_['angles']);
  gl.vertexAttribPointer(this.p1_['barycentric'], 3, gl.FLOAT, false, 24, 12);
  gl.enableVertexAttribArray(this.p1_['barycentric']);

  // particle
  gl.uniform1f(this.p1_['radius'], this.radius_(this.particle_));
  gl.uniform3fv(this.p1_['color'], this.particle_color_);
  gl.uniform3fv(this.p1_['particle_position'], this.particle_.toArray());
  gl.drawArrays(gl.TRIANGLES, 0, this.sphere_elements_);

  if (!this.time_varying_ || !this.stochastic_ || this.stochastic_low_frequency_) {
    // sgd
    gl.uniform1f(this.p1_['radius'], this.radius_(this.sgd_));
    gl.uniform3fv(this.p1_['color'], this.sgd_color_);
    gl.uniform3fv(this.p1_['particle_position'], this.sgd_.toArray());
    gl.drawArrays(gl.TRIANGLES, 0, this.sphere_elements_);

    // momentum
    gl.uniform1f(this.p1_['radius'], this.radius_(this.momentum_));
    gl.uniform3fv(this.p1_['color'], this.momentum_color_);
    gl.uniform3fv(this.p1_['particle_position'], this.momentum_.toArray());
    gl.drawArrays(gl.TRIANGLES, 0, this.sphere_elements_);

    // nesterov
    gl.uniform1f(this.p1_['radius'], this.radius_(this.nesterov_));
    gl.uniform3fv(this.p1_['color'], this.nesterov_color_);
    gl.uniform3fv(this.p1_['particle_position'], this.nesterov_.toArray());
    gl.drawArrays(gl.TRIANGLES, 0, this.sphere_elements_);

    // adagrad
    gl.uniform1f(this.p1_['radius'], this.radius_(this.adagrad_));
    gl.uniform3fv(this.p1_['color'], this.adagrad_color_);
    gl.uniform3fv(this.p1_['particle_position'], this.adagrad_.toArray());
    gl.drawArrays(gl.TRIANGLES, 0, this.sphere_elements_);

    // adadelta
    gl.uniform1f(this.p1_['radius'], this.radius_(this.adadelta_));
    gl.uniform3fv(this.p1_['color'], this.adadelta_color_);
    gl.uniform3fv(this.p1_['particle_position'], this.adadelta_.toArray());
    gl.drawArrays(gl.TRIANGLES, 0, this.sphere_elements_);
  }

  gl.flush();

  this.frame_ += 1;
};


bouncingball.BouncingBallRenderer.prototype.handleKeys = function(keys) {

  // Settings keys
  if (keys.justPressed(bouncingball.Key.LT)) {
    this.time_varying_ = !this.time_varying_;
  }

  if (keys.justPressed(bouncingball.Key.GT)) {
    this.stochastic_ = !this.stochastic_;
  }

  if (keys.justPressed(bouncingball.Key.QUESTION)) {
    this.stochastic_low_frequency_ = !this.stochastic_low_frequency_;
  }

  if (keys.justPressed(bouncingball.Key.R)) {
    this.resetSimulation_();
  }

  if (keys.justPressed(bouncingball.Key.SPACE)) {
    this.wireframe_ = !this.wireframe_;
  }

  if (document.pointerLockElement) {
    var d = 1e0;
    var inverse = this.rotation_.reciprocal();
    var right = inverse.transform(bouncingball.Vector.I);
    var up = bouncingball.Vector.J.times(
        bouncingball.Vector.J.dot(inverse.transform(bouncingball.Vector.J)));
    var forward = inverse.transform(bouncingball.Vector.K.negate());

    if (keys.justPressed(bouncingball.Key.F)) {
      this.tracking_ += 1;
    }

    if (keys.isPressed(bouncingball.Key.SHIFT)) {
      d = 1e1;
    }

    if (keys.isPressed(bouncingball.Key.A) || keys.isPressed(bouncingball.Key.LEFT)) {
      this.translation_ = this.translation_.plus(right.times(-d));
      this.tracking_ = 0;
    }

    if (keys.isPressed(bouncingball.Key.D) || keys.isPressed(bouncingball.Key.RIGHT)) {
      this.translation_ = this.translation_.plus(right.times(d));
      this.tracking_ = 0;
    }

    if (keys.isPressed(bouncingball.Key.S) || keys.isPressed(bouncingball.Key.DOWN)) {
      this.translation_ = this.translation_.plus(forward.times(-d));
      this.tracking_ = 0;
    }

    if (keys.isPressed(bouncingball.Key.W) || keys.isPressed(bouncingball.Key.UP)) {
      this.translation_ = this.translation_.plus(forward.times(d));
      this.tracking_ = 0;
    }

    if (keys.isPressed(bouncingball.Key.Z)) {
      this.translation_ = this.translation_.plus(up.times(-d));
      this.tracking_ = 0;
    }

    if (keys.isPressed(bouncingball.Key.Q)) {
      this.translation_ = this.translation_.plus(up.times(d));
      this.tracking_ = 0;
    }
  }
};


bouncingball.BouncingBallRenderer.prototype.handleMouseMove = function(event) {
  if (document.pointerLockElement) {
    var inverse = this.rotation_.reciprocal();
    var right = inverse.transform(bouncingball.Vector.I);
    var up = bouncingball.Vector.J.times(
        bouncingball.Vector.J.dot(inverse.transform(bouncingball.Vector.J)));
    var radians_x = bouncingball.BouncingBallRenderer.PIXELS_TO_RADIANS_ * event.movementX;
    var radians_y = bouncingball.BouncingBallRenderer.PIXELS_TO_RADIANS_ * event.movementY;
    this.rotation_ = this.rotation_.times(bouncingball.Quaternion.fromAxisAngle(up, radians_x));
    this.rotation_ = this.rotation_.times(bouncingball.Quaternion.fromAxisAngle(right, radians_y));
  }
};


bouncingball.BouncingBallRenderer.prototype.onDestroy = function(gl) {
  gl.canvas.removeEventListener('click', this.onclick_, true);
  this.onclick_ = null;
  this.p0_.dispose(gl);
  gl.deleteBuffer(this.grid_);
  this.grid_ = null;
  gl.deleteBuffer(this.sphere_);
  this.sphere_ = null;
  this.keys_.uninstall();
};
