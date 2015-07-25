// Compares two images.

'use strict';


var createVAS = require('../view-aligned-square.js');
var glslify = require('glslify');
var glShader = require('gl-shader');


module.exports = function initCompare(gl, threshold)
{
  var 
    geometry = createVAS(gl, 'aPos', 'aTexCoord'),
    shader = glShader(
      gl,
      glslify('./compare.vert'),
      glslify('./compare.frag')
    );

  return function compare(texA, texB, x, y, w, h, fbo)
  {
    if (fbo)
      fbo.bind();
    else
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    gl.viewport(x, y, w, h);

    geometry.bind(shader);

    shader.uniforms.uTexA = texA.bind(0);
    shader.uniforms.uTexB = texB.bind(1);
    shader.uniforms.uThreshold = threshold;

    geometry.draw();

    geometry.unbind();
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  };
};