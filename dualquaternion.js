// Copyright 2014 Robert Scott Dionne. All rights reserved.

/**
 * @fileoverview Defines the quaternion object.
 * @author robertsdionne@gmail.com (Robert Scott Dionne)
 */

/**
 * Constructs a new quaternion given the vector and scalar.
 * @param {bouncingball.DualVector=} opt_vector
 * @param {bouncingball.DualNumber=} opt_scalar
 * @constructor
 */
bouncingball.DualQuaternion = function(opt_vector, opt_scalar) {
  /**
   * @type {bouncingball.DualVector}
   */
  this.vector = opt_vector || new bouncingball.DualVector();
  
  /**
   * @type {bouncingball.DualNumber}
   */
  this.scalar = typeof opt_scalar === "undefined" ?
      new bouncingball.DualNumber(1) : opt_scalar;
};


bouncingball.DualQuaternion.fromPosition = function(position) {
  return new bouncingball.DualQuaternion(
      new bouncingball.DualVector(
          new bouncingball.DualNumber(0, position.x),
          new bouncingball.DualNumber(0, position.y),
          new bouncingball.DualNumber(0, position.z)),
      new bouncingball.DualNumber(1));
};


bouncingball.DualQuaternion.fromTranslation = function(translation) {
  return new bouncingball.DualQuaternion(
      new bouncingball.DualVector(
          new bouncingball.DualNumber(0, translation.x / 2),
          new bouncingball.DualNumber(0, translation.y / 2),
          new bouncingball.DualNumber(0, translation.z / 2)),
      new bouncingball.DualNumber(1));
};


bouncingball.DualQuaternion.fromRotation = function(rotation) {
  return new bouncingball.DualQuaternion(
      rotation.vector.toDual(),
      new bouncingball.DualNumber(rotation.scalar));
};


bouncingball.DualQuaternion.fromAxisAngle = function(axis, angle) {
  return new bouncingball.DualQuaternion(
      axis.normalized().times(Math.sin(angle/2)).toDual(),
      new bouncingball.DualNumber(Math.cos(angle/2)));
};


bouncingball.DualQuaternion.prototype.real = function() {
  return new bouncingball.Quaternion(this.vector.real(), this.scalar.real);
};


bouncingball.DualQuaternion.prototype.dual = function() {
  return new bouncingball.Quaternion(this.vector.dual(), this.scalar.dual);
};


/**
 * @param {bouncingball.DualQuaternion} that
 * @param {number} t
 * @return {bouncingball.DualQuaternion}
 */
bouncingball.DualQuaternion.prototype.lerp = function(that, t) {
  var v = new bouncingball.DualNumber(t);
  var u = new bouncingball.DualNumber(1).minus(v);
  return this.times(u).plus(/** @type {bouncingball.DualQuaternion} */ (
      that.times(v))).normalized();
};


/**
 * @return {bouncingball.DualQuaternion} The negation of this quaternion.
 */
bouncingball.DualQuaternion.prototype.negate = function() {
  return new bouncingball.DualQuaternion(this.vector.negate(), this.scalar.negate());
};


/**
 * @return {bouncingball.DualNumber} The magnitude of this quaternion.
 */
bouncingball.DualQuaternion.prototype.magnitude = function() {
  return this.magnitudeSquared().sqrt();
};


/**
 * @return {bouncingball.DualNumber} The square magnitude of this quaternion.
 */
bouncingball.DualQuaternion.prototype.magnitudeSquared = function() {
  return this.scalar.times(this.scalar).plus(this.vector.magnitudeSquared());
};


/**
 * @return {bouncingball.DualQuaternion} This quaternion normalized.
 */
bouncingball.DualQuaternion.prototype.normalized = function() {
  return this.over(this.magnitude());
};


/**
 * @return {bouncingball.DualQuaternion} This quaternion's conjugate.
 */
bouncingball.DualQuaternion.prototype.conjugate = function() {
  return new bouncingball.DualQuaternion(this.vector.negate(), this.scalar);
};


bouncingball.DualQuaternion.prototype.dualConjugate = function() {
  return new bouncingball.DualQuaternion(
      this.vector.dualConjugate(), this.scalar.dualConjugate());
};


/**
 * @return {bouncingball.DualQuaternion} This quaternion's reciprocal.
 */
bouncingball.DualQuaternion.prototype.reciprocal = function() {
  return this.conjugate().over(this.magnitudeSquared());
};


/**
 * @return {bouncingball.DualQuaternion} The sum of this and that.
 * @param {number|bouncingball.DualQuaternion} that
 */
bouncingball.DualQuaternion.prototype.plus = function(that) {
  if (that instanceof bouncingball.DualNumber) {
    return new bouncingball.DualQuaternion(this.vector, this.scalar.plus(that));
  } else if (that instanceof bouncingball.DualQuaternion) {
    return new bouncingball.DualQuaternion(
        /** @type {bouncingball.DualVector} */ (this.vector.plus(that.vector)),
        this.scalar.plus(that.scalar));
  }
  return null;
};


/**
 * @return {bouncingball.DualQuaternion} The difference of this and that.
 * @param {number|bouncingball.DualQuaternion} that
 */
bouncingball.DualQuaternion.prototype.minus = function(that) {
  if (that instanceof bouncingball.DualNumber) {
    return new bouncingball.DualQuaternion(this.vector, this.scalar.minus(that));
  } else if (that instanceof bouncingball.DualQuaternion) {
    return new bouncingball.DualQuaternion(
        /** @type {bouncingball.DualVector} */ (this.vector.minus(that.vector)),
        this.scalar.minus(that.scalar));
  }
  return null;
};


/**
 * @return {bouncingball.DualQuaternion|bouncingball.Pose} The product of
 *    this and that.
 * @param {bouncingball.DualNumber|bouncingball.DualQuaternion|bouncingball.Pose} that
 */
bouncingball.DualQuaternion.prototype.times = function(that) {
  if (that instanceof bouncingball.DualNumber) {
    return new bouncingball.DualQuaternion(
        /** @type {bouncingball.DualVector} */ (this.vector.times(that)),
        this.scalar.times(that));
  } else if (that instanceof bouncingball.DualQuaternion) {
    return new bouncingball.DualQuaternion(
        /** @type {bouncingball.DualVector} */ (that.vector.times(this.scalar).
            plus(this.vector.times(that.scalar)).
            plus(this.vector.cross(that.vector))),
        this.scalar.times(that.scalar).minus(this.vector.dot(that.vector)));
  } else if (that instanceof bouncingball.Pose) {
    var result = new bouncingball.Pose();
    for (var i = 0; i < that.getNumBones(); ++i) {
      result.set(i, /** @type {bouncingball.DualQuaternion} */ (
          this.times(that.getBone(i))));
    }
    return result;
  }
  return null;
};


/**
 * @return {bouncingball.DualQuaternion} The quotient of this and that.
 * @param {bouncingball.DualNumber|bouncingball.DualQuaternion} that
 */
bouncingball.DualQuaternion.prototype.over = function(that) {
  if (that instanceof bouncingball.DualNumber) {
    return new bouncingball.DualQuaternion(
        /** @type {bouncingball.DualVector} */ (this.vector.over(that)),
        this.scalar.over(that));
  } else if (that instanceof bouncingball.DualQuaternion) {
    return /** @type {bouncingball.DualQuaternion} */ (
        this.times(that.reciprocal()));
  }
  return null;
};

/**
 * @return {bouncingball.Vector} That vector rotated by this quaternion.
 * @param {bouncingball.Vector} that
 */
bouncingball.DualQuaternion.prototype.transform = function(that) {
  return this.times(bouncingball.DualQuaternion.fromPosition(that)).
      times(this.dualConjugate().reciprocal()).vector.dual();
};


/**
 * @return {string} A string representation of this quaternion.
 */
bouncingball.DualQuaternion.prototype.toString = function() {
  return this.vector + ' + ' + this.scalar;
};
