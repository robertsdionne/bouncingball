// Copyright 2014 Robert Scott Dionne. All rights reserved.

/**
 * @fileoverview Defines the dual number object.
 * @author robertsdionne@gmail.com (Robert Scott Dionne)
 */

/**
 * @param {number=} opt_z
 * @param {number=} opt_dx
 * @param {number=} opt_dy
 * @constructor
 */
bouncingball.MultiDualNumber = function(opt_z, opt_dx, opt_dy) {
  /**
   * @type {number}
   */
  this.z = opt_z || 0;

  /**
   * @type {number}
   */
  this.dx = opt_dx || 0;

  /**
   * @type {number}
   */
  this.dy = opt_dy || 0;
};


bouncingball.MultiDualNumber.sin = function(u) {
  return new bouncingball.MultiDualNumber(
      Math.sin(u.z),
      u.dx * Math.cos(u.z),
      u.dy * Math.cos(u.z));
};


bouncingball.MultiDualNumber.x = function(x) {
  return new bouncingball.MultiDualNumber(x, 1.0, 0.0);
};


bouncingball.MultiDualNumber.y = function(y) {
  return new bouncingball.MultiDualNumber(y, 0.0, 1.0);
};


bouncingball.MultiDualNumber.prototype.plus = function(that) {
  return new bouncingball.MultiDualNumber(
      this.z + that.z,
      this.dx + that.dx,
      this.dy + that.dy);
};


bouncingball.MultiDualNumber.prototype.minus = function(that) {
  return new bouncingball.MultiDualNumber(
      this.z - that.z,
      this.dx - that.dx,
      this.dy - that.dy);
};


bouncingball.MultiDualNumber.prototype.negate = function() {
  return new bouncingball.MultiDualNumber(
      -this.z,
      -this.dx,
      -this.dy);
};


bouncingball.MultiDualNumber.prototype.squared = function() {
  return new bouncingball.MultiDualNumber(
      this.z * this.z,
      this.dx * 2.0 * this.z,
      this.dy * 2.0 * this.z);
};


bouncingball.MultiDualNumber.prototype.times = function(that) {
  return new bouncingball.MultiDualNumber(
      this.z * that.z,
      this.z * that.dx + this.dx * that.z,
      this.z * that.dy + this.dy * that.z);
};


bouncingball.MultiDualNumber.prototype.inverse = function() {
  return new bouncingball.MultiDualNumber(
      1.0 / this.z,
      -this.dx / this.z / this.z,
      -this.dy / this.z / this.z);
};


bouncingball.MultiDualNumber.prototype.over = function(that) {
  return this.times(that.inverse());
};


bouncingball.MultiDualNumber.prototype.sqrt = function() {
  return new bouncingball.MultiDualNumber(
      Math.sqrt(this.z),
      this.dx / 2.0 / Math.sqrt(this.z),
      this.dy / 2.0 / Math.sqrt(this.z));
};


bouncingball.MultiDualNumber.prototype.toString = function() {
  return this.z + ' + ' + this.dx + 'dx + ' + this.dy + 'dy';
};
