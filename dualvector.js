// Copyright 2014 Robert Scott Dionne. All rights reserved.

/**
 * @fileoverview Defines the vector object.
 * @author robertsdionne@gmail.com (Robert Scott Dionne)
 */

/**
 * Constructs a new vector from the given coordinates.
 * @param {bouncingball.DualNumber=} opt_x
 * @param {bouncingball.DualNumber=} opt_y
 * @param {bouncingball.DualNumber=} opt_z
 * @constructor
 * @extends {bouncingball.DualQuaternion}
 */
bouncingball.DualVector = function(opt_x, opt_y, opt_z) {
  this.scalar = new bouncingball.DualNumber();
  this.vector = this;
  this.x = opt_x || new bouncingball.DualNumber();
  this.y = opt_y || new bouncingball.DualNumber();
  this.z = opt_z || new bouncingball.DualNumber();
};
bouncingball.inherits(bouncingball.DualVector, bouncingball.DualQuaternion);


bouncingball.DualVector.prototype.real = function() {
  return new bouncingball.Vector(this.x.real, this.y.real, this.z.real);
};


bouncingball.DualVector.prototype.dual = function() {
  return new bouncingball.Vector(this.x.dual, this.y.dual, this.z.dual);
};


bouncingball.DualVector.prototype.dualConjugate = function() {
  return new bouncingball.DualVector(
      this.x.dualConjugate(),
      this.y.dualConjugate(),
      this.z.dualConjugate());
};


/**
 * @return {bouncingball.DualVector} The negation of this vector.
 */
bouncingball.DualVector.prototype.negate = function() {
  return new bouncingball.DualVector(
      this.x.negate(), this.y.negate(), this.z.negate());
};


/**
 * @return {number} The square magnitude of this vector.
 */
bouncingball.DualVector.prototype.magnitudeSquared = function() {
  return this.dot(this);
};


/**
 * @return {bouncingball.DualVector|bouncingball.DualQuaternion} The sum of this and that.
 * @param {bouncingball.DualVector|number|bouncingball.DualQuaternion} that
 */
bouncingball.DualVector.prototype.plus = function(that) {
  if (that instanceof bouncingball.DualVector) {
    return new bouncingball.DualVector(
        this.x.plus(that.x), this.y.plus(that.y), this.z.plus(that.z));
  } else {
    return bouncingball.DualQuaternion.prototype.plus.call(this, that);
  }
};


/**
 * @return {bouncingball.DualVector|bouncingball.DualQuaternion} The difference of
 *    this and that.
 * @param {bouncingball.DualVector|number|bouncingball.DualQuaternion} that
 */
bouncingball.DualVector.prototype.minus = function(that) {
  if (that instanceof bouncingball.DualVector) {
    return new bouncingball.DualVector(
        this.x.minus(that.x), this.y.minus(that.y), this.z.minus(that.z));
  } else {
    return bouncingball.DualQuaternion.prototype.plus.call(this, that);
  }
};


/**
 * @return {bouncingball.DualVector|bouncingball.DualQuaternion} The product of
 *    this and that.
 * @param {bouncingball.DualNumber|bouncingball.DualQuaternion} that
 */
bouncingball.DualVector.prototype.times = function(that) {
  if (that instanceof bouncingball.DualNumber) {
    return new bouncingball.DualVector(
        this.x.times(that), this.y.times(that), this.z.times(that));
  } else {
    return /** @type {bouncingball.DualVector} */ (
        bouncingball.DualQuaternion.prototype.times.call(this, that));
  }
};


/**
 * @return {bouncingball.DualVector|bouncingball.DualQuaternion} The quotient of
 *    this and that.
 * @param {bouncingball.DualNumber|bouncingball.DualQuaternion} that
 */
bouncingball.DualVector.prototype.over = function(that) {
  if (that instanceof bouncingball.DualNumber) {
    return new bouncingball.DualVector(
        this.x.over(that), this.y.over(that), this.z.over(that));
  } else {
    return bouncingball.DualQuaternion.prototype.over.call(this, that);
  }
};


/**
 * @return {bouncingball.DualVector} The cross product of this and that.
 * @param {bouncingball.DualVector} that
 */
bouncingball.DualVector.prototype.cross = function(that) {
  return new bouncingball.DualVector(
      this.y.times(that.z).minus(this.z.times(that.y)),
      this.z.times(that.x).minus(this.x.times(that.z)),
      this.x.times(that.y).minus(this.y.times(that.x)));
};


/**
 * @return {number} The dot product of this and that.
 * @param {bouncingball.DualVector} that
 */
bouncingball.DualVector.prototype.dot = function(that) {
  return this.x.times(that.x).
      plus(this.y.times(that.y)).
      plus(this.z.times(that.z));
};


/**
 * @return {string} A string representation of this vector.
 */
bouncingball.DualVector.prototype.toString = function() {
  return '(' + this.x + ')i + (' + this.y + ')j + (' + this.z + ')k';
};
