// Copyright 2014 Robert Scott Dionne. All rights reserved.

/**
 * @param {Document} document
 * @constructor
 */
bouncingball.Keys = function(document) {
  /**
   * @type {Document}
   */
  this.document_ = document;

  /**
   * @type {Object}
   */
  this.keys_ = {};

  /**
   * @type {Object}
   */
  this.oldKeys_ = {};
};


bouncingball.Key = {
  SHIFT: 16,
  SPACE: 32,
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  W: 87,
  A: 65,
  J: 74,
  K: 75,
  S: 83,
  D: 68,
  Q: 81,
  Y: 89,
  Z: 90,
  N: 78,
  P: 80,
  LT: 188,
  GT: 190
};


/**
 *
 */
bouncingball.Keys.prototype.install = function() {
  this.document_.onkeydown = bouncingball.bind(this.handleKeyDown_, this);
  this.document_.onkeyup = bouncingball.bind(this.handleKeyUp_, this);
};


bouncingball.Keys.prototype.uninstall = function() {
  this.document_.onkeydown = this.document_.onkeyup = null;
};


bouncingball.Keys.prototype.handleKeyDown_ = function(event) {
  console.log(event);
  this.keys_[event.keyCode] = true;
  return true;
};


bouncingball.Keys.prototype.handleKeyUp_ = function(event) {
  this.keys_[event.keyCode] = false;
  return true;
};


bouncingball.Keys.prototype.isHeld = function(key) {
  return this.isPressed(key) && this.oldKeys_[key];
};


bouncingball.Keys.prototype.isPressed = function(key) {
  return this.keys_[key];
};


bouncingball.Keys.prototype.justPressed = function(key) {
  return this.isPressed(key) && !this.oldKeys_[key];
};


bouncingball.Keys.prototype.justReleased = function(key) {
  return !this.isPressed(key) && this.oldKeys_[key];
};


bouncingball.Keys.prototype.update = function() {
  for (var key in this.keys_) {
    this.oldKeys_[key] = this.keys_[key];
  }
};
