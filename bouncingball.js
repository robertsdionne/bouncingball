var canvas, context;

var load = function() {
  // console.log('load');
  canvas = document.getElementById('c');
  canvas.addEventListener('mousedown', mousedown, true);
  canvas.addEventListener('contextmenu', contextmenu, true);
  context = canvas.getContext('2d');
  setup(canvas, context);
  var animate = function() {
    // console.log('animate');
    update();
    draw(canvas, context);
    requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);
};

var contextmenu = function(e) {
  e.preventDefault();
};

var A = 20.0;
var B = 100.0;
var C = 20.0;
var shift = 5.0;
var epsilon = 1e-8;
var sign = 1.0;

var sinc = function(x) {
  return (Math.sin(x) + epsilon) / (x + epsilon);
}

var g = function(x) {
  return -sign * A * sinc(x) + x * x / B - C;
};

var dg = function(x) {
  // return 5.0 * Math.cos(x) + 2.0 * x / 50.0;
  return sign * A * Math.sin(x + epsilon) / (x + epsilon) / (x + epsilon)
        -sign * A * Math.cos(x + epsilon) / (x + epsilon) + 2.0 * x / B;
};

var f = function(x) {
  return g(x - shift);
  // return x * x / 10 - 25;
};

var df = function(x) {
  return dg(x - shift);
  // return 2 * x / 10;
};

var setup = function(canvas, context) {
  // console.log('setup');
  canvas.width = document.documentElement.clientWidth;
  canvas.height = document.documentElement.clientHeight;
};

var plot = function(canvas, context, f) {
  context.beginPath();
  context.fillStyle = 'rgb(0, 0, 0)';
  for (var i = -canvas.width / 2.0; i < canvas.width / 2.0; i += 2) {
    var x = 2.0 * x_max / canvas.width * i;
    context.lineTo(i, canvas.height / y_max / 2.0 * f(x));
  }
  context.lineTo(canvas.width / 2.0, -canvas.height / 2.0);
  context.lineTo(-canvas.width / 2.0, -canvas.height / 2.0);
  context.fill();
};

var x_max = 50.0, y_max = 50.0;

var dt = 1.6e-2;
var decay = 0.9;

var particle_score = 0;
var particle_x = 2.0 * x_max * Math.random() - x_max,
    particle_y = f(particle_x) + Math.random() * (y_max - f(particle_x));
var particle_vx = 0.0, particle_vy = 0.0;
var particle_ax = 0.0, particle_ay = -9.8;

var train_yet = false;

var momentum_score = 0;
var momentum = 0.99;
var momentum_x = particle_x;
var momentum_vx = particle_vx;

var sgd_score = 0;
var sgd_x = particle_x;

var nesterov_score = 0;
var nesterov = 0.99;
var nesterov_x = particle_x;
var nesterov_vx = particle_vx;

var mutant_score = 0;
var mutant = 0.99;
var mutant_x = particle_x;
var mutant_y = particle_y;
var mutant_vx = particle_vx * dt;
var mutant_vy = particle_vy;
var mutant_ax = particle_ax;
var mutant_ay = particle_ay;

var adagrad_score = 0;
var adagrad_x = particle_x;
var adagrad_accumulator = 0;

var adadelta_score = 0;
var adadelta = 0.9;
var adadelta_x = particle_x;
var adadelta_delta_accumulator = 0;
var adadelta_gradient_accumulator = 0;

var noise = false;

var mousedown = function(e) {
  if (0 == e.button) {
    var rectangle = canvas.getBoundingClientRect();
    var mouse_x = e.clientX - rectangle.left;
    var mouse_y = rectangle.bottom - e.clientY;
    console.log(mouse_y);
    particle_score -= f(particle_x);
    momentum_score -= f(momentum_x);
    sgd_score -= f(sgd_x);
    nesterov_score -= f(nesterov_x);
    adagrad_score -= f(adagrad_x);
    adadelta_score -= f(adadelta_x);
    // particle_x = 2.0 * x_max * Math.random() - x_max;
    particle_x = 2.0 * x_max * (mouse_x - canvas.width / 2.0) / canvas.width;
    particle_y = Math.max(f(particle_x), 2.0 * y_max * (mouse_y - canvas.height / 2.0) / canvas.height);
    particle_vx = 0.0;
    particle_vy = 0.0;
    momentum_x = particle_x;
    momentum_vx = particle_vx;
    sgd_x = particle_x;
    nesterov_x = particle_x;
    nesterov_vx = particle_vx;
    mutant_x = particle_x;
    mutant_y = particle_y;
    mutant_vx = particle_vx * dt;
    mutant_vy = particle_vy;
    adagrad_x = particle_x;
    adagrad_accumulator = 0;
    adadelta_x = particle_x;
    adadelta_delta_accumulator = 0;
    adadelta_gradient_accumulator = 0;
    train_yet = false;
  } else if (2 == e.button) {
    noise = !noise;
  }
};

var draw = function(canvas, context) {
  // console.log('draw');
  var max_score = Math.max(particle_score, momentum_score, sgd_score, nesterov_score, adagrad_score, adadelta_score);
  var e_particle = Math.exp(particle_score - max_score);
  var e_momentum = Math.exp(momentum_score - max_score);
  var e_sgd = Math.exp(sgd_score - max_score);
  var e_nesterov = Math.exp(nesterov_score - max_score);
  var e_mutant = Math.exp(adagrad_score - max_score);
  var e_adadelta = Math.exp(adadelta_score - max_score);
  var e_sum = e_particle + e_momentum + e_sgd + e_nesterov + e_mutant + e_adadelta;
  var softmax_particle = e_particle / e_sum;
  var softmax_momentum = e_momentum / e_sum;
  var softmax_sgd = e_sgd / e_sum;
  var softmax_nesterov = e_nesterov / e_sum;
  var softmax_mutant = e_mutant / e_sum;
  var softmax_adadelta = e_adadelta / e_sum;
  context.save();
  context.fillStyle = 'rgba(255, 255, 255, 0.05)';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.font = "24pt Ubuntu";
  context.translate(canvas.width / 2.0, canvas.height / 2.0);
  context.scale(1.0, -1.0);
  plot(canvas, context, f);
  context.beginPath();
  context.fillStyle = 'rgb(255, 0, 0)';
  context.arc(
      canvas.width / x_max / 2.0 * particle_x,
      canvas.height / y_max / 2.0 * particle_y,
      5.0, 0.0, 2.0 * Math.PI, true);
  context.fill();
  context.scale(1.0, -1.0);
  context.fillText("Particle " + softmax_particle, 0, y_max - 10);
  context.scale(1.0, -1.0);
  context.beginPath();
  context.fillStyle = 'rgb(0, 255, 0)';
  context.arc(
      canvas.width / x_max / 2.0 * momentum_x,
      canvas.height / y_max / 2.0 * f(momentum_x),
      5.0, 0.0, 2.0 * Math.PI, true);
  context.fill();
  context.scale(1.0, -1.0);
  context.fillText("Momentum " + softmax_momentum, 0, y_max - 50);
  context.scale(1.0, -1.0);
  context.beginPath();
  context.fillStyle = 'rgb(0, 0, 255)';
  context.arc(
      canvas.width / x_max / 2.0 * sgd_x,
      canvas.height / y_max / 2.0 * f(sgd_x),
      5.0, 0.0, 2.0 * Math.PI, true);
  context.fill();
  context.scale(1.0, -1.0);
  context.fillText("SGD " + softmax_sgd, 0, y_max - 90);
  context.scale(1.0, -1.0);
  context.beginPath();
  context.fillStyle = 'rgb(255, 0, 255)';
  context.arc(
      canvas.width / x_max / 2.0 * nesterov_x,
      canvas.height / y_max / 2.0 * f(nesterov_x),
      5.0, 0.0, 2.0 * Math.PI, true);
  context.fill();
  context.scale(1.0, -1.0);
  context.fillText("Nesterov " + softmax_nesterov, 0, y_max - 130);
  context.scale(1.0, -1.0);
  context.beginPath();
  context.fillStyle = 'rgb(0, 255, 255)';
  context.arc(
      canvas.width / x_max / 2.0 * adagrad_x,
      canvas.height / y_max / 2.0 * f(adagrad_x),
      5.0, 0.0, 2.0 * Math.PI, true);
  context.fill();
  context.scale(1.0, -1.0);
  context.fillText("AdaGrad " + softmax_mutant, 0, y_max - 170);
  context.scale(1.0, -1.0);
  context.beginPath();
  context.fillStyle = 'rgb(255, 255, 0)';
  context.arc(
      canvas.width / x_max / 2.0 * adadelta_x,
      canvas.height / y_max / 2.0 * f(adadelta_x),
      5.0, 0.0, 2.0 * Math.PI, true);
  context.fill();
  context.scale(1.0, -1.0);
  context.fillText("AdaDelta " + softmax_adadelta, 0, y_max - 210);
  context.scale(1.0, -1.0);
  context.restore();
};

var collision = false;

var collide = function() {
  var normal_x = -df(particle_x), normal_y = 1;
  var normal_magnitude_squared = normal_x * normal_x + normal_y * normal_y;
  var dot_product = particle_vx * normal_x + particle_vy * normal_y;
  var reflect_vx = particle_vx - 2.0 * dot_product * normal_x / normal_magnitude_squared;
  var reflect_vy = particle_vy - 2.0 * dot_product * normal_y / normal_magnitude_squared;
  particle_vx = decay * reflect_vx;
  particle_vy = decay * reflect_vy;
  train_yet = true;
  collision = true;
};

var resolve_constraint = function() {
  var old_y = particle_y;
  particle_y = f(particle_x);
  var old_v = Math.sqrt(particle_vx * particle_vx + particle_vy * particle_vy);
  var argument = 2.0 * 9.8 * (old_y - particle_y) + old_v * old_v;
  if (argument > 0) {
    var new_v = Math.sqrt(argument);
    particle_vx *= new_v / old_v;
    particle_vy *= new_v / old_v;
  }
};

var collide_mutant = function() {
  mutant_y = f(mutant_x);
  var normal_x = -df(mutant_x), normal_y = 1;
  var normal_magnitude_squared = normal_x * normal_x + normal_y * normal_y;
  var dot_product = mutant_vx * normal_x + mutant_vy * normal_y;
  var reflect_vx = mutant_vx - 2.0 * dot_product * normal_x / normal_magnitude_squared;
  var reflect_vy = mutant_vy - 2.0 * dot_product * normal_y / normal_magnitude_squared;
  mutant_vx = decay * reflect_vx * dt;
  mutant_vy = decay * reflect_vy;
}

var variance = 5.0;

var frame = 0;

var update = function() {
  // console.log('update');
  particle_x += particle_vx * dt;
  particle_y += particle_vy * dt;
  particle_vx += (particle_ax - 0 * df(particle_x)) * dt;
  particle_vy += particle_ay * dt;

  mutant_x += mutant_vx;
  mutant_y += mutant_vy * dt;
  mutant_vx = momentum * mutant_vx + (mutant_ax - train_yet * df(mutant_x + nesterov * mutant_vx)) * dt;
  mutant_vy += mutant_ay * dt;

  if (particle_y < f(particle_x)) {
    resolve_constraint();
    if (!collision) {
      collide();
    }
  } else {
    collision = false;
  }

  if (mutant_y < f(mutant_x)) {
    collide_mutant();
  }

  if (train_yet) {
    momentum_x += momentum_vx;
    momentum_vx = momentum * momentum_vx - df(momentum_x) * dt;

    sgd_x -= df(sgd_x) * 0.1;

    nesterov_x += nesterov_vx;
    nesterov_vx = nesterov * nesterov_vx - df(nesterov_x + 2.0 * nesterov * nesterov_vx) * dt;

    adagrad_accumulator += df(adagrad_x) * df(adagrad_x);
    adagrad_x -= 5.0 * df(adagrad_x) / Math.sqrt(adagrad_accumulator);

    adadelta_gradient_accumulator = adadelta * adadelta_gradient_accumulator
        + (1 - adadelta) * df(adadelta_x) * df(adadelta_x);
    var delta_x = -Math.sqrt(adadelta_delta_accumulator + epsilon) / Math.sqrt(adadelta_gradient_accumulator + epsilon) * df(adadelta_x);
    adadelta_delta_accumulator = adadelta * adadelta_delta_accumulator + (1 - adadelta) * delta_x * delta_x;
    adadelta_x += 100 * delta_x;
  }

  if (noise && frame % 10 == 0) {
    A = 20.0 + variance * Math.random();
    B = 50.0 + 20.0 * variance * Math.random();
    C = 20.0 + variance * Math.random();
    shift = variance * Math.random() - variance;
    sign = Math.random();
    // sign *= Math.random() < 0.5 ? -1.0 : 1.0;
  }

  frame += 1;
};
