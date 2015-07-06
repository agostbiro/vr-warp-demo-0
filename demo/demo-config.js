'use strict';

var config = {
  fovX: Math.PI / 2,
  height: 1200,
  ipd: 0.065,

  // Max length of the epipolar line in pixels. This shouldn't be changed,
  // unless the warping shader is adjusted.
  length: 10,

  far: 150,
  nObjects: 2000,
  seed: 0,
  width: 1080
};

config.fovY = config.fovX * config.height / config.width;

// Minimum distance of the objects from the camera at which the epipolar
// line is guaranteed to be 'config.length' pixels long.
config.near = config.ipd / (2 * config.length / config.width);
config.minDistance = Math.sqrt(
  Math.pow(config.near, 2) + 
  Math.pow(config.near * Math.tan(config.fovX / 2), 2)
);

module.exports = config;

console.log(config);