'use strict';


var _ = require('underscore');
var bunny = require('bunny');
var Chance = require('chance');
var config = require('./demo-config.js');
var mat4 = require('gl-mat4');
var vec3 = require('gl-vec3');


var 
  bunnyRadius = Math.sqrt(_.max(_.map(bunny.positions, vec3.squaredLength))),
  chance = new Chance(config.seed),
  translation = vec3.create(),
  rotationAxis = vec3.create();


function randNormCoord()
{
  return chance.floating({min: -1, max: 1});
}


module.exports = _.map(_.range(config.nObjects), function iteratee(i)
{
  var model = mat4.create();

  vec3.set(
    rotationAxis,
    randNormCoord(),
    randNormCoord(),
    randNormCoord()
  );
  
  // Create random coordinate in a sphere with a min distance from the camera.
  vec3.set(
    translation,
    randNormCoord(),
    randNormCoord(),
    randNormCoord()
  );
  vec3.normalize(
    translation, 
    translation
  );
  vec3.scale(
    translation,
    translation,
    chance.floating({
      min: config.minDistance + bunnyRadius, 
      max: config.far
    })
  );

  mat4.rotate(
    model,
    model,
    chance.floating({min: - 2 * Math.PI, max: 2 * Math.PI}),
    rotationAxis
  );
  mat4.translate(model, model, translation);

  return model;
});