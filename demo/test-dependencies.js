'use strict';


module.exports = function testDependencies()
{
  var testCtx = document.createElement('canvas').getContext('webgl');


  if (!('pointerLockElement' in document || 
        'mozPointerLockElement' in document ||
        'webkitPointerLockElement' in document))
  {
    return 'compatibility';
  }

  // Chrome and Firefox expose the Pointer Lock API on mobile, even though
  // they don't support it there.
  else if (/Android|iPhone|iPad|iPod|webOS/i.test(navigator.userAgent)) 
  {
    return 'compatibility';
  }

  // Chrome on Windows with high DPI displays has a bug concerning the Pointer 
  // Lock API. https://code.google.com/p/chromium/issues/detail?id=411634
  else if (('pointerLockElement' in document || 
            'webkitPointerLockElement' in document) && 
           window.devicePixelRatio > 1 && 
           /Windows/i.test(navigator.userAgent) && 
           /Chrome/i.test(navigator.userAgent))
  {
    return 'chrome-bug';
  }
  else if (!testCtx)
  {
    return 'webgl-error';
  }
  else if (!testCtx.getExtension('WEBGL_depth_texture'))
  {
    return 'webgl-extension';
  }
  else
  {
    return 'success';
  }
};