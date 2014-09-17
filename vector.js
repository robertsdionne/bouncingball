// Copyright 2011 Robert Scott Dionne. All rights reserved.

/**
 * @fileoverview Defines the vector object.
 * @author robertsdionne@gmail.com (Robert Scott Dionne)
 */

/**
 * Constructs a new vector from the given coordinates.
 * @param {number=} opt_x
 * @param {number=} opt_y
 * @param {number=} opt_z
 * @constructor
 * @extends {bouncingball.Quaternion}
 */
bouncingball.Vector = function(opt_x, opt_y, opt_z) {
  /**
   * @type {number}
   */
  this.scalar = 0;

  /**
   * @type {bouncingball.Vector}
   */
  this.vector = this;

  /**
   * @type {number}
   */
  this.x = opt_x || 0;

  /**
   * @type {number}
   */
  this.y = opt_y || 0;

  /**
   * @type {number}
   */
  this.z = opt_z || 0;
};
bouncingball.inherits(bouncingball.Vector, bouncingball.Quaternion);


bouncingball.Vector.I = new bouncingball.Vector(1, 0, 0);


bouncingball.Vector.J = new bouncingball.Vector(0, 1, 0);


bouncingball.Vector.K = new bouncingball.Vector(0, 0, 1);


/**
 * @return {bouncingball.Vector} The negation of this vector.
 */
bouncingball.Vector.prototype.negate = function() {
  return new bouncingball.Vector(-this.x, -this.y, -this.z);
};


/**
 * @return {bouncingball.Vector} this vector normalized
 */
bouncingball.Vector.prototype.normalized = function() {
  return this.over(this.magnitude());
};


bouncingball.Vector.prototype.toDual = function() {
  return new bouncingball.DualVector(
      new bouncingball.DualNumber(this.x),
      new bouncingball.DualNumber(this.y),
      new bouncingball.DualNumber(this.z));
};


/**
 * @return {number} The magnitude of this vector.
 */
bouncingball.Vector.prototype.magnitude = function() {
  return Math.sqrt(this.dot(this));
};


/**
 * @return {number} The square magnitude of this vector.
 */
bouncingball.Vector.prototype.magnitudeSquared = function() {
  return this.dot(this);
};


/**
 * @return {bouncingball.Vector|bouncingball.Quaternion} The sum of this and that.
 * @param {bouncingball.Vector|number|bouncingball.Quaternion} that
 */
bouncingball.Vector.prototype.plus = function(that) {
  if (that instanceof bouncingball.Vector) {
    return new bouncingball.Vector(
        this.x + that.x,
        this.y + that.y,
        this.z + that.z);
  } else {
    return bouncingball.Quaternion.prototype.plus.call(this, that);
  }
};


/**
 * @return {bouncingball.Vector|bouncingball.Quaternion} The difference of this and that.
 * @param {bouncingball.Vector|number|bouncingball.Quaternion} that
 */
bouncingball.Vector.prototype.minus = function(that) {
  if (that instanceof bouncingball.Vector) {
    return new bouncingball.Vector(
        this.x - that.x,
        this.y - that.y,
        this.z - that.z);
  } else {
    return bouncingball.Quaternion.prototype.plus.call(this, that);
  }
};


/**
 * @return {bouncingball.Vector|bouncingball.Quaternion} The product of this and that.
 * @param {number|bouncingball.Quaternion} that
 */
bouncingball.Vector.prototype.times = function(that) {
  if (typeof that === 'number') {
    return new bouncingball.Vector(this.x * that, this.y * that, this.z * that);
  } else {
    return bouncingball.Quaternion.prototype.times.call(this, that);
  }
};


/**
 * @return {bouncingball.Vector|bouncingball.Quaternion} The quotient of this and that.
 * @param {number|bouncingball.Quaternion} that
 */
bouncingball.Vector.prototype.over = function(that) {
  if (typeof that === 'number') {
    return new bouncingball.Vector(this.x / that, this.y / that, this.z / that);
  } else {
    return bouncingball.Quaternion.prototype.over.call(this, that);
  }
};


/**
 * @return {bouncingball.Vector} The cross product of this and that.
 * @param {bouncingball.Vector} that
 */
bouncingball.Vector.prototype.cross = function(that) {
  return new bouncingball.Vector(
      this.y * that.z - this.z * that.y,
      this.z * that.x - this.x * that.z,
      this.x * that.y - this.y * that.x);
};


/**
 * @return {number} The dot product of this and that.
 * @param {bouncingball.Vector} that
 */
bouncingball.Vector.prototype.dot = function(that) {
  return this.x * that.x + this.y * that.y + this.z * that.z;
};


bouncingball.Vector.prototype.toMatrix = function() {
  return [
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    -this.x, -this.y, -this.z, 1.0
  ];
};


bouncingball.Vector.prototype.toArray = function() {
  return [this.x, this.y, this.z];
};


/**
 * @return {string} A string representation of this vector.
 */
bouncingball.Vector.prototype.toString = function() {
  return this.x + 'i + ' + this.y + 'j + ' + this.z + 'k';
};
