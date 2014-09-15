// Copyright 2014 Robert Scott Dionne. All rights reserved.

/**
 * @fileoverview
 * @author robertsdionne@gmail.com (Robert Scott Dionne)
 */

/**
 * A WebGL renderer.
 * @constructor
 */
bouncingball.Renderer = function() {};


/**
 * Handles changes in WebGL canvas size.
 * @param {WebGLRenderingContext} gl The WebGL rendering context.
 * @param {number} width The new canvas width.
 * @param {number} height Thew new canvas height.
 */
bouncingball.Renderer.prototype.onChange = bouncingball.abstractMethod;


/**
 * Handles WebGL context creation.
 * @param {WebGLRenderingContext} gl The WebGL rendering context.
 */
bouncingball.Renderer.prototype.onCreate = bouncingball.abstractMethod;


/**
 * Handles WebGL context destruction.
 * @param {WebGLRenderingContext} gl The WebGL rendering context.
 */
bouncingball.Renderer.prototype.onDestroy = bouncingball.abstractMethod;



/**
 * Handles WebGL drawing.
 * @param {WebGLRenderingContext} gl The WebGL rendering context.
 */
bouncingball.Renderer.prototype.onDraw = bouncingball.abstractMethod;
