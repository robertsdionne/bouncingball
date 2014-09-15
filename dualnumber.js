// Copyright 2014 Robert Scott Dionne. All rights reserved.

/**
 * @fileoverview Defines the dual number object.
 * @author robertsdionne@gmail.com (Robert Scott Dionne)
 */

/**
 * @param {number=} opt_real
 * @param {number=} opt_dual
 * @constructor
 */
bouncingball.DualNumber = function(opt_real, opt_dual) {
  /**
   * @type {number}
   */
  this.real = opt_real || 0;

  /**
   * @type {number}
   */
  this.dual = opt_dual || 0;
};


bouncingball.DualNumber.prototype.dualConjugate = function() {
  return new bouncingball.DualNumber(this.real, -this.dual);
};


bouncingball.DualNumber.prototype.plus = function(that) {
  return new bouncingball.DualNumber(this.real + that.real, this.dual + that.dual);
};


bouncingball.DualNumber.prototype.minus = function(that) {
  return new bouncingball.DualNumber(this.real - that.real, this.dual - that.dual);
};


bouncingball.DualNumber.prototype.negate = function() {
  return new bouncingball.DualNumber(-this.real, -this.dual);
};


bouncingball.DualNumber.prototype.times = function(that) {
  return new bouncingball.DualNumber(
      this.real * that.real,
      this.real * that.dual + this.dual * that.real);
};


bouncingball.DualNumber.prototype.inverse = function() {
  return new bouncingball.DualNumber(
      1 / this.real,
      -this.dual / this.real / this.real);
};


bouncingball.DualNumber.prototype.over = function(that) {
  return this.times(that.inverse());
};


bouncingball.DualNumber.prototype.sqrt = function() {
  return new bouncingball.DualNumber(
      Math.sqrt(this.real),
      this.dual / 2 / Math.sqrt(this.real));
};


bouncingball.DualNumber.prototype.toString = function() {
  return this.real + ' + ' + this.dual + 'e';
};
