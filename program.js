// Copyright 2014 Robert Scott Dionne. All rights reserved.

/**
 * @constructor
 */
bouncingball.Program = function(var_args) {
  this.name = Array.prototype.map.call(arguments, function(shader) {
    return shader.name
  }, this).join(':');

  /**
   * @type {Array.<bouncingball.Shader>}
   */
  this.shaders_ = Array.prototype.slice.call(arguments);
};


bouncingball.Program.EXTRACT_ARRAY = /(.*)\[.*/;


bouncingball.Program.prototype.getSafeName = function(name) {
  var match = name.match(bouncingball.Program.EXTRACT_ARRAY);
  if (match) {
    return match[1];
  } else {
    return name;
  }
};


bouncingball.Program.prototype.defineUniforms = function(gl) {
  var uniforms = gl.getProgramParameter(this.handle, gl.ACTIVE_UNIFORMS);
  for (var i = 0; i < uniforms; ++i) {
    var name = this.getSafeName(gl.getActiveUniform(this.handle, i).name);
    this[name] = gl.getUniformLocation(this.handle, name);
  }
};


bouncingball.Program.prototype.defineAttributes = function(gl) {
  var attribs = gl.getProgramParameter(this.handle, gl.ACTIVE_ATTRIBUTES);
  for (var i = 0; i < attribs; ++i) {
    var name = this.getSafeName(gl.getActiveAttrib(this.handle, i).name);
    this[name] = gl.getAttribLocation(this.handle, name);
  }
};


/**
 * @param {WebGLRenderingContext} gl
 */
bouncingball.Program.prototype.create = function(gl) {
  this.shaders_.forEach(function(shader) {
    shader.create(gl);
  }, this);
  this.handle = gl.createProgram();
};


/**
 * @param {WebGLRenderingContext} gl
 */
bouncingball.Program.prototype.dispose = function(gl) {
  this.shaders_.forEach(function(shader) {
    gl.detachShader(this.handle, shader.handle);
    shader.dispose(gl);
  }, this);
  gl.deleteProgram(this.handle);
  this.handle = null;
};


/**
 * @param {WebGLRenderingContext} gl
 */
bouncingball.Program.prototype.link = function(gl) {
  this.shaders_.forEach(function(shader) {
    shader.compile(gl);
    gl.attachShader(this.handle, shader.handle);
  }, this);
  gl.linkProgram(this.handle);
  if (!gl.getProgramParameter(this.handle, gl.LINK_STATUS)) {
    var log = gl.getProgramInfoLog(this.handle);
    this.dispose(gl);
    throw new Error(log);
  }
  this.defineUniforms(gl);
  this.defineAttributes(gl);
};
