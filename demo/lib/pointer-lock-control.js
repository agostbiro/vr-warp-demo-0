/*
  Adapted from Mr.doob's THREE.js pointerlock control example and
  John McCutchan's tutorial at html5rocks.com.
  Originals, respectively:
  http://threejs.org/examples/misc_controls_pointerlock.html
  http://www.html5rocks.com/en/tutorials/pointerlock/intro/
  Licences, respectively:
  http://threejs.org/license
  http://www.apache.org/licenses/LICENSE-2.0
*/


'use strict';


var EventEmitter = require('events').EventEmitter;
var vec3 = require('gl-vec3');


// Starts pointer lock when the user clicks on the canvas.
// Returns a vec3 that represents the rotation of the
// camera. The rotation is updated upon each mouse event.
module.exports = function initPointerLockControl(canvas, speed)
{
  var
    rotation = vec3.fromValues(0, 0, -1),

    control,
    onMouse;


  function isPointerLockOn()
  {
    return (document.pointerLockElement === canvas    ||
            document.mozPointerLockElement === canvas ||
            document.webkitPointerLockElement === canvas);
  }

  onMouse = (function closure()
  {
    var 
      doublePi = Math.PI * 2,
      halfPi = Math.PI / 2,
      mSpeed = speed || 0.002,

      pitch = 0,
      yaw = 0,

      movXkey,
      movYkey;

    if (canvas.mozRequestPointerLock)
    {
      movXkey = 'mozMovementX';
      movYkey = 'mozMovementY';
    }
    else if (canvas.webkitRequestPointerLock)
    {
      movXkey = 'webkitMovementX';
      movYkey = 'webkitMovementY';
    }
    else
    {
      movXkey = 'movementX';
      movYkey = 'movementY';
    }

    return function onMouse(event)
    {
      pitch -= event[movYkey] * mSpeed;
      yaw -= event[movXkey] * mSpeed;

      // Constrain pitch to 180 degrees.
      pitch = Math.max(
        -halfPi,
        Math.min(pitch, halfPi)
      );

      // X and Y axes are safe from gimbal lock, because no roll rotation is 
      // performed.
      vec3.set(
        rotation,
        -Math.sin(yaw) * Math.cos(pitch),
        Math.sin(pitch),
        -Math.cos(yaw) * Math.cos(pitch)
      );
    };
  })();

  function plChangeCallback()
  {
    if (isPointerLockOn())
    {
      canvas.addEventListener('mousemove', onMouse);
      control.emit('start');
    }
    else
    {
      control.emit('exit');
      canvas.removeEventListener('mousemove', onMouse);      
    }
  }

  function plErrorCallback()
  {
    control.emit('exit');

    throw new Error([
      'Pointer Lock error',
      'pointer lock on: ' + isPointerLockOn(),
      'rotation: ' + rotation,
      ].join('\n'));
  }


  if (!('pointerLockElement' in document || 
        'mozPointerLockElement' in document ||
        'webkitPointerLockElement' in document))
  {
    console.error('The Pointer Lock API is unavailable.');
    return false;
  }

  canvas.requestPointerLock = canvas.requestPointerLock    ||
                              canvas.mozRequestPointerLock ||
                              canvas.webkitRequestPointerLock;

  document.exitPointerLock = document.exitPointerLock    ||
                             document.mozExitPointerLock ||
                             document.webkitExitPointerLock;

  document.addEventListener('pointerlockerror', plErrorCallback, false);
  document.addEventListener('mozpointerlockerror', plErrorCallback, false);
  document.addEventListener('webkitpointerlockerror', plErrorCallback, false);

  document.addEventListener('pointerlockchange', plChangeCallback, false);
  document.addEventListener('mozpointerlockchange', plChangeCallback, false);
  document.addEventListener('webkitpointerlockchange', plChangeCallback, false);

  //canvas.addEventListener('click', canvas.requestPointerLock.bind(canvas));

  control = Object.create(
    EventEmitter.prototype,
    {
      exit: {value: document.exitPointerLock.bind(canvas)},
      looksAt: {value: rotation},
      start: {value: canvas.requestPointerLock.bind(canvas)}
    }
  );
  EventEmitter.call(control);

  return control;
};