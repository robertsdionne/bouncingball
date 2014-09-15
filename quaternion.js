// Copyright 2014 Robert Scott Dionne. All rights reserved.

/**
 * @fileoverview Defines the quaternion object.
 * @author robertsdionne@gmail.com (Robert Scott Dionne)
 */

/**
 * Constructs a new quaternion given the vector and scalar.
 * @param {bouncingball.Vector} vector
 * @param {number} scalar
 * @constructor
 */
bouncingball.Quaternion = function(vector, scalar) {
  /**
   * @type {bouncingball.Vector}
   */
  this.vector = vector || new bouncingball.Vector();
  
  /**
   * @type {number}
   */
  this.scalar = typeof scalar === "undefined" ? 1 : scalar;
};


/**
 * @param {bouncingball.Vector} axis
 * @param {number} angle
 * @return {!bouncingball.Quaternion}
 */
bouncingball.Quaternion.fromAxisAngle = function(axis, angle) {
  return new bouncingball.Quaternion(
      /** @type {bouncingball.Vector} */ (
          axis.normalized().times(Math.sin(angle/2))),
      Math.cos(angle/2));
};


/**
 * @return {bouncingball.Quaternion} The negation of this quaternion.
 */
bouncingball.Quaternion.prototype.negate = function() {
  return new bouncingball.Quaternion(this.vector.negate(), -this.scalar);
};


/**
 * @return {number} The magnitude of this quaternion.
 */
bouncingball.Quaternion.prototype.magnitude = function() {
  return Math.sqrt(this.magnitudeSquared());
};


/**
 * @return {number} The square magnitude of this quaternion.
 */
bouncingball.Quaternion.prototype.magnitudeSquared = function() {
  return this.scalar * this.scalar + this.vector.magnitudeSquared();
};


/**
 * @return {bouncingball.Quaternion} This quaternion normalized.
 */
bouncingball.Quaternion.prototype.normalized = function() {
  return this.over(this.magnitude());
};


/**
 * @return {bouncingball.Quaternion} This quaternion's conjugate.
 */
bouncingball.Quaternion.prototype.conjugate = function() {
  return new bouncingball.Quaternion(this.vector.negate(), this.scalar);
};


/**
 * @return {bouncingball.Quaternion} This quaternion's reciprocal.
 */
bouncingball.Quaternion.prototype.reciprocal = function() {
  return this.conjugate().over(this.magnitudeSquared());
};


/**
 * @return {bouncingball.Quaternion} The sum of this and that.
 * @param {number|bouncingball.Quaternion} that
 */
bouncingball.Quaternion.prototype.plus = function(that) {
  if (typeof that === 'number') {
    return new bouncingball.Quaternion(this.vector, this.scalar + that);
  } else if (that instanceof bouncingball.Quaternion) {
    return new bouncingball.Quaternion(
        /** @type {bouncingball.Vector} */ (this.vector.plus(that.vector)),
        this.scalar + that.scalar);
  }
  return null;
};


/**
 * @return {bouncingball.Quaternion} The difference of this and that.
 * @param {number|bouncingball.Quaternion} that
 */
bouncingball.Quaternion.prototype.minus = function(that) {
  if (typeof that === 'number') {
    return new bouncingball.Quaternion(this.vector, this.scalar - that);
  } else if (that instanceof bouncingball.Quaternion) {
    return new bouncingball.Quaternion(
        /** @type {bouncingball.Vector} */ (this.vector.minus(that.vector)),
        this.scalar - that.scalar);
  }
  return null;
};


/**
 * @return {bouncingball.Quaternion} The product of this and that.
 * @param {number|bouncingball.Quaternion} that
 */
bouncingball.Quaternion.prototype.times = function(that) {
  if (typeof that === 'number') {
    return new bouncingball.Quaternion(
        /** @type {bouncingball.Vector} */ (this.vector.times(that)),
        this.scalar * that);
  } else if (that instanceof bouncingball.Quaternion) {
    return new bouncingball.Quaternion(
        /** @type {bouncingball.Vector} */ (that.vector.times(this.scalar).
            plus(this.vector.times(that.scalar)).
            plus(this.vector.cross(that.vector))),
        this.scalar * that.scalar - this.vector.dot(that.vector));
  }
  return null;
};


/**
 * @return {bouncingball.Quaternion} The quotient of this and that.
 * @param {number|bouncingball.Quaternion} that
 */
bouncingball.Quaternion.prototype.over = function(that) {
  if (typeof that === 'number') {
    return new bouncingball.Quaternion(
        /** @type {bouncingball.Vector} */ (this.vector.over(that)),
        this.scalar / that);
  } else if (that instanceof bouncingball.Quaternion) {
    return this.times(that.reciprocal());
  }
  return null;
};

/**
 * @return {bouncingball.Vector} That vector rotated by this quaternion.
 * @param {bouncingball.Vector} that
 */
bouncingball.Quaternion.prototype.transform = function(that) {
  return this.times(that).times(this.reciprocal()).vector;
};


bouncingball.Quaternion.prototype.toMatrix = function() {
  var v = this.vector;
  var w = this.scalar;
  return [
    1.0 - 2.0 * (v.y * v.y + v.z * v.z), 2.0 * (v.x * v.y + w * v.z), 2.0 * (v.x * v.z - w * v.y), 0.0,

    2.0 * (v.x * v.y - w * v.z), 1.0 - 2.0 * (v.x * v.x + v.z * v.z), 2.0 * (v.y * v.z + w * v.x), 0.0,

    2.0 * (v.x * v.z + w * v.y), 2.0 * (v.y * v.z - w * v.x), 1.0 - 2.0 * (v.x * v.x + v.y * v.y), 0.0,

    0.0, 0.0, 0.0, 1.0
  ];
};


/**
 * @return {string} A string representation of this quaternion.
 */
bouncingball.Quaternion.prototype.toString = function() {
  return this.vector + ' + ' + this.scalar;
};
