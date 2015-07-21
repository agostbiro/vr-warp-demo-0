// Adapted from Hugh Kennedy's bunny-walkthrough
// https://github.com/stackgl/bunny-walkthrough


'use strict';


// Browserify can't handle comma separated requires.
var _ = require('underscore');
var bunny = require('bunny');
var canvasOrbitCamera = require('canvas-orbit-camera');
var initCompare = require('./lib/compare/compare.js');
var config = require('./demo-config.js');
var createFBO = require('gl-fbo');
var EventEmitter = require('events').EventEmitter;
var getContext = require('webgl-context');
var glGeometry = require('gl-geometry');
var glslify = require('glslify');
var glShader = require('gl-shader');
var initCopy = require('./lib/copy/copy.js');
var initPointerLockControl = require('./lib/pointer-lock-control.js');
var initWarp = require('./lib/warp/warp.js');
var loop = require('raf-loop');
var mat4 = require('gl-mat4');
var normals = require('normals');
var randomModels = require('./random-models.js');
var vec3 = require('gl-vec3');


module.exports = function initDemo(canvas, meter)
{
  var
    gl = getContext({
      canvas: canvas,
      height: config.height,
      width: config.width * 2
    }),

    control = initPointerLockControl(canvas),

    bunnyGeo = glGeometry(gl),
    bunnyShader = glShader(
      gl,
      glslify('./shaders/bunny.vert'),
      glslify('./shaders/bunny.frag')
    ),
    compareTextures = initCompare(gl),
    copy = initCopy(gl),
    crossGeo = glGeometry(gl),
    crossShader = glShader(
      gl,
      glslify('./shaders/cross.vert'),
      glslify('./shaders/cross.frag')
    ),
    fbo = createFBO(gl, [config.width, config.height]),
    warp = initWarp(gl),

    leftEye = vec3.fromValues(-config.ipd / 2, 0, 0),
    modelMatrices = randomModels,
    projection = mat4.create(),
    rightEye = vec3.fromValues(config.ipd / 2, 0, 0),
    viewDirNow = vec3.create(),

    compare,
    engine,
    demo,
    renderEye,
    warpRender;


  function bruteRender()
  {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Make sure both eyes look in the same direction.
    vec3.copy(viewDirNow, control.looksAt);

    renderEye(leftEye, viewDirNow, 0, 0, config.width, config.height, true);

    renderEye(rightEye, viewDirNow, config.width, 0, config.width, 
              config.height);

    drawCrosses();

    meter.tick();
  }

  compare = (function closure()
  {
    var
      fboOriginal = createFBO(gl, [config.width, config.height]),
      fboWarped = createFBO(gl, [config.width, config.height]);

    return function compare()
    {
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      vec3.copy(viewDirNow, control.looksAt);

      renderEye(leftEye, viewDirNow, 0, 0, config.width, config.height, true,
                fbo);

      warp(fbo, config.ipd, config.near, config.far, 
           0, 0, config.width, config.height, fboWarped);

      renderEye(rightEye, viewDirNow, 0, 0, config.width, config.height, true,
                fboOriginal);

      compareTextures(fboOriginal.color[0], fboWarped.color[0], 
                      config.width, 0, config.width, config.height);

      copy(fboOriginal.color[0], 0, 0, config.width, config.height);

      drawCrosses();

      meter.tick();
    }
  })();

  function drawCrosses()
  {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.disable(gl.DEPTH_TEST);

    crossGeo.bind(crossShader);

    gl.viewport(0, 0, config.width, config.height);
    crossGeo.draw(gl.LINES);

    gl.viewport(config.width, 0, config.width, config.height);
    crossGeo.draw(gl.LINES);

    gl.enable(gl.DEPTH_TEST);
  }

  renderEye = (function closure()
  {
    var 
      empty = vec3.create(),
      up = vec3.fromValues(0, 1, 0),
      view = mat4.create();

    return function renderEye(eyePos, looksAt, x, y, w, h, clear, fbo)
    {
      if (fbo)
        fbo.bind();

      if (clear)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      gl.viewport(x, y, w, h);

      bunnyGeo.bind(bunnyShader);

      bunnyShader.uniforms.uProjection = projection;

      mat4.lookAt(
        view, 
        eyePos,
        // Make eyes look ahead in parallel.
        vec3.add(empty, eyePos, looksAt),
        up
      );
      bunnyShader.uniforms.uView = view;

      _.each(modelMatrices, function iteratee(model)
      {
        bunnyShader.uniforms.uModel = model;
        bunnyGeo.draw();
      });
    };
  })();

  function onResize()
  {
    mat4.perspective(
      projection,
      config.fovY,
      0.5 * window.innerWidth / window.innerHeight,
      config.near,
      config.far
    );
  }

  function setRenderer(name, start)
  {
    engine.stop();

    if (name === 'brute')
      engine = loop(bruteRender);
    else if (name === 'warp')
      engine = loop(warpRender);
    else
      throw new Error(name + ' is an invalid argument.');

    if (start)
      engine.start();

    demo.emit('renderChange');
  }

  function start()
  {
    control.start();
    engine.start();

    demo.emit('start');
  }

  warpRender = (function closure()
  {
    var flipEyes = false;

    function warpSequence(eyePos, offset, x1, x2)
    {
      // 'control.looksAt' is updated automatically on each mouse event while 
      // pointer lock is active.
      renderEye(eyePos, control.looksAt, 0, 0, config.width, config.height, 
                true, fbo);

      warp(fbo, offset, config.near, config.far, 
           x1, 0, config.width, config.height);

      copy(fbo.color[0], x2, 0, config.width, config.height);
    }

    return function warpRender()
    {
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      if (flipEyes)
        warpSequence(rightEye, -config.ipd, 0, config.width);
      else
        warpSequence(leftEye, config.ipd, config.width, 0);

      drawCrosses();

      //flipEyes = !flipEyes;

      meter.tick();
    };
  })();


  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  onResize();

  window.addEventListener('resize', onResize, false);

  bunnyGeo.attr('aPos', bunny.positions);
  bunnyGeo.attr(
    'aNormal',
    normals.vertexNormals(
      bunny.cells,
      bunny.positions
    )
  );
  bunnyGeo.faces(bunny.cells);

  crossGeo.attr(
    'aPos',
    [
      0, 1, 0,
      0, -1, 0,
      1, 0, 0,
      -1, 0, 0
    ]
  );
  crossGeo.faces([0, 1, 2, 3], {size: 2});
  crossGeo.bind(crossShader);
  crossShader.uniforms.uColor = [0, 0, 0];

  //engine = loop(bruteRender);
  engine = loop(compare);

  demo = Object.create(
    EventEmitter.prototype,
    {
      exit: {value: control.exit.bind(control)},
      setRenderer: {value: setRenderer},
      start: {value: start}
    }
  );
  EventEmitter.call(demo);

  control.on('exit', function onExit()
  {
    engine.stop();
    demo.emit('exit');
  });

  // TODO fix glitch on first render.
  //bruteRender();
  //bruteRender();

  compare();
  compare();

  return demo;
};