// Copyright 2014 Robert Scott Dionne. All rights reserved.

/**
 * @fileoverview
 * @author robertsdionne@gmail.com (Robert Scott Dionne)
 */

/**
 * @constructor
 * @param {string} name
 * @param {string} id
 */
bouncingball.Shader = function(gl, id) {
  this.name_ = id;
  this.type_ = bouncingball.Shader.getType_(gl, id);
  this.source_ = bouncingball.Shader.getSource_(id);
};


/**
 * @param {string} id
 * @return {string} the shader source
 */
bouncingball.Shader.getSource_ = function(id) {
  return bouncingball.global.document.getElementById(id).text;
};


/**
 * @param gl
 * @param {string} id
 * @return {number} the shader type
 */
bouncingball.Shader.getType_ = function(gl, id) {
  var script = bouncingball.global.document.getElementById(id);
  if ('x-shader/x-fragment' == script.type) {
    return gl.FRAGMENT_SHADER;
  } else if ('x-shader/x-vertex' == script.type) {
    return gl.VERTEX_SHADER;
  } else {
    return null;
  }
};


/**
 * @param {WebGLRenderingContext} gl
 */
bouncingball.Shader.prototype.create = function(gl) {
  this.handle = gl.createShader(this.type_);
  gl.shaderSource(this.handle, this.source_);
};


/**
 * @param {WebGLRenderingContext} gl
 */
bouncingball.Shader.prototype.compile = function(gl) {
  gl.compileShader(this.handle);
  if (!gl.getShaderParameter(this.handle, gl.COMPILE_STATUS)) {
    var log = gl.getShaderInfoLog(this.handle);
    this.dispose(gl);
    throw new Error(this.name_ + ': ' + log);
  }
};


/**
 * @param {WebGLRenderingContext} gl
 */
bouncingball.Shader.prototype.dispose = function(gl) {
  gl.deleteShader(this.handle);
  this.handle = null;
};
