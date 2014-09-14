var load = function() {
  // console.log('load');
  var canvas = document.getElementById('c');
  canvas.addEventListener('mousedown', mousedown, true);
  canvas.addEventListener('contextmenu', contextmenu, true);
  var context = canvas.getContext('2d');
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
var B = 50.0;
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
};

var df = function(x) {
  return dg(x - shift);
};

var setup = function(canvas, context) {
  // console.log('setup');
  canvas.width = document.documentElement.clientWidth;
  canvas.height = document.documentElement.clientHeight;
};

var plot = function(canvas, context, f) {
  context.beginPath();
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
var particle_x = 2.0 * x_max * Math.random() - x_max,
    particle_y = f(particle_x) + Math.random() * (y_max - f(particle_x));
var particle_vx = 0.0, particle_vy = 0.0;
var particle_ax = 0.0, particle_ay = -9.8;

var train_yet = false;

var momentum = 0.99;
var momentum_x = particle_x;
var momentum_vx = particle_vx;

var sgd_x = particle_x;

var nesterov = 0.99;
var nesterov_x = particle_x;
var nesterov_vx = particle_vx;

var mousedown = function(e) {
  if (0 == e.button) {
    var dvx = 40.0 * Math.random() - 20.0;
    particle_vx += dvx;
    particle_vy += 40.0 * Math.random() - 20.0;
    momentum_vx += dvx * dt;
    nesterov_vx += dvx * dt;
  } else if (2 == e.button) {
    particle_x = 2.0 * x_max * Math.random() - x_max;
    particle_y = f(particle_x) + Math.random() * (y_max - f(particle_x));
    particle_vx = 0.0;
    particle_vy = 0.0;
    momentum_x = particle_x;
    momentum_vx = particle_vx;
    sgd_x = particle_x;
    nesterov_x = particle_x;
    nesterov_vx = particle_vx;
    train_yet = false;
  }
};

var draw = function(canvas, context) {
  // console.log('draw');
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.save();
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
  context.beginPath();
  context.fillStyle = 'rgb(0, 255, 0)';
  context.arc(
      canvas.width / x_max / 2.0 * momentum_x,
      canvas.height / y_max / 2.0 * f(momentum_x),
      5.0, 0.0, 2.0 * Math.PI, true);
  context.fill();
  context.beginPath();
  context.fillStyle = 'rgb(0, 0, 255)';
  context.arc(
      canvas.width / x_max / 2.0 * sgd_x,
      canvas.height / y_max / 2.0 * f(sgd_x),
      5.0, 0.0, 2.0 * Math.PI, true);
  context.fill();
  context.beginPath();
  context.fillStyle = 'rgb(255, 0, 255)';
  context.arc(
      canvas.width / x_max / 2.0 * nesterov_x,
      canvas.height / y_max / 2.0 * f(nesterov_x),
      5.0, 0.0, 2.0 * Math.PI, true);
  context.fill();
  context.restore();
};

var collide = function() {
  particle_y = f(particle_x);
  var normal_x = -df(particle_x), normal_y = 1;
  var normal_magnitude_squared = normal_x * normal_x + normal_y * normal_y;
  var dot_product = particle_vx * normal_x + particle_vy * normal_y;
  var reflect_vx = particle_vx - 2.0 * dot_product * normal_x / normal_magnitude_squared;
  var reflect_vy = particle_vy - 2.0 * dot_product * normal_y / normal_magnitude_squared;
  particle_vx = decay * reflect_vx;
  particle_vy = decay * reflect_vy;
  train_yet = true;
};

var variance = 0.5;

var frame = 0;

var update = function() {
  // console.log('update');
  particle_x += particle_vx * dt;
  particle_y += particle_vy * dt;
  particle_vx += particle_ax * dt;
  particle_vy += particle_ay * dt;

  if (particle_y < f(particle_x)) {
    collide();
  }

  if (train_yet) {
    momentum_vx = momentum * momentum_vx - df(momentum_x) * dt;
    momentum_x += momentum_vx;

    sgd_x -= df(sgd_x) * dt;

    nesterov_vx = nesterov * nesterov_vx - df(nesterov_x + nesterov * nesterov_vx) * dt;
    nesterov_x += nesterov_vx;
  }

  // if (frame % 10 == 0) {
    // A = 20.0 + variance * Math.random();
    // B = 50.0 + variance * Math.random();
    // C = 20.0 + variance * Math.random();
    // shift = variance * Math.random() - variance;
    // epsilon = 1e-8 * (1 + Math.random());
  // }

  frame += 1;
};
