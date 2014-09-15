// Copyright 2014 Robert Scott Dionne. All rights reserved.

/**
 * @fileoverview
 * @author robertsdionne@gmail.com (Robert Scott Dionne)
 */

/**
 * @param {Window} window The window.
 * @param {discoball.Keys} keys
 * @param {Object.<string, *>=} opt_options
 * @constructor
 */
bouncingball.Application = function(window, keys, opt_options) {
  /**
   * @type {Window}
   * @private
   */
  this.window_ = window;

  /**
   * @type {discoball.Keys}
   * @private
   */
  this.keys_ = keys;

  this.reset();
};


/**
 * WebGL context identifier.
 * @type {string}
 */
bouncingball.Application.WEBGL_CONTEXT = 'experimental-webgl';


/**
 * Checks that the dimensions and, if so, dispatches onChange
 * to the Renderer.
 * @private
 */
bouncingball.Application.prototype.checkDimensions_ = function() {
  var width = this.canvas_.width;
  var height = this.canvas_.height;
  if (this.width_ !== width ||
      this.height_ !== height) {
    this.width_ = width;
    this.height_ = height;
    this.renderer_.onChange(this.gl_, width, height);
  }
};


/**
 * Associates this Application with the given canvas.
 * @param {HTMLCanvasElement} canvas
 * @param {bouncingball.Renderer} renderer The renderer.
 */
bouncingball.Application.prototype.install = function(canvas, renderer) {
  this.canvas_ = canvas;
  this.canvas_.width = this.window_.innerWidth;
  this.canvas_.height = this.window_.innerHeight;
  this.gl_ = /** @type {WebGLRenderingContext} */ (
      this.canvas_.getContext(bouncingball.Application.WEBGL_CONTEXT));
  this.renderer_ = renderer;
};


/**
 * Starts the rendering loop.
 */
bouncingball.Application.prototype.start = function() {
  this.renderer_.onCreate(this.gl_);
  this.onFrame_();
};


/**
 * Dispatches onChange and onDraw events to the Renderer.
 * @private
 */
bouncingball.Application.prototype.onFrame_ = function() {
  this.checkDimensions_();
  this.renderer_.onDraw(this.gl_);
  this.keys_.update();
  this.handle_ = bouncingball.global.requestAnimationFrame(
      bouncingball.bind(this.onFrame_, this));
};


/**
 * Dissociates this Application with the previously associated canvas
 * and stops the rendering loop.
 */
bouncingball.Application.prototype.uninstall = function() {
  bouncingball.global.cancelRequestAnimationFrame(this.handle_);
  this.renderer_.onDestroy(this.gl_);
  this.reset();
};


bouncingball.Application.prototype.reset = function() {
  /**
   * @type {HTMLCanvasElement}
   * @private
   */
  this.canvas_ = null;

  /**
   * @type {WebGLRenderingContext}
   * @private
   */
  this.gl_ = null;

  /**
   * @type {bouncingball.Renderer}
   * @private
   */
  this.renderer_ = null;

  this.handle_ = null;

  /**
   * @type {?number}
   * @private
   */
  this.width_ = null;

  /**
   * @type {?number}
   * @private
   */
  this.height_ = null;
};
