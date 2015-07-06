'use strict';


var initDemo = require('./demo/demo.js');
var FPSMeter = require('./demo/lib/fpsmeter.js');
var testDependencies = require('./demo/test-dependencies.js');


window.onload = function onload()
{
  var
    canvas = document.getElementById('gl-canvas'),
    dependencyResult = testDependencies(),
    instructions = document.getElementById('instructions'),
    meter = new FPSMeter({theme: 'transparent', show: 'ms'}),
    overlay = document.getElementById('overlay'),
    rendererDisplay = document.getElementById('renderer-display'),

    demo,
    onKey;


  onKey = (function closure()
  {
    var block = false;

    return function onKey(e)
    {
      if (block)
        return;

      if (e.keyCode === 49)
      {
        demo.setRenderer('warp', true);
        rendererDisplay.textContent = 'Warp';
      }
      else if (e.keyCode === 50)
      {
        demo.setRenderer('brute', true);
        rendererDisplay.textContent = 'Brute';
      }

      block = true;

      // Prevent continuous firing.
      window.setTimeout(
        function callback()
        {
          block = false;
        },
        200
      );
    };
  })();


  meter.hide();

  if (dependencyResult !== 'success')
  {
    instructions.classList.add('hidden');
    document.getElementById(dependencyResult).classList.remove('hidden');
    return;
  }

  demo = initDemo(canvas, meter);

  document.getElementById('github-link').addEventListener(
    'click',
    function onClick(e)
    {
      e.stopPropagation();
    }
  );

  overlay.addEventListener('click', function onClick(e)
  {
    overlay.classList.add('hidden');
    
    rendererDisplay.classList.remove('hidden');
    meter.show();

    demo.start();
  });

  demo.on('exit', function callback()
  {
    meter.hide();
    rendererDisplay.classList.add('hidden');

    overlay.classList.remove('hidden');
  });

  document.body.addEventListener('keydown', onKey);
};