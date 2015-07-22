precision highp float;


// Debugging colors
const vec4 BLACK = vec4(0.0, 0.0, 0.0, 1.0);
const vec4 GREEN = vec4(0.0, 1.0, 0.0, 1.0);
const vec4 RED = vec4(1.0, 0.0, 0.0, 1.0);

// Units are world coordinates.
uniform float
  uFar,
  uNear,
  uOffset,
  uPixLen;

uniform sampler2D
  uColorBuffer,
  uDepthBuffer;

varying float vX;

varying vec2 vTexCo;

float
  halfPixLen,
  offsetInTex,
  reprojX[10],
  searchDir,
  zValues[10];

vec2 texCos[10];


// Convert the z value from the depth buffer to clip coordinates.
// From: http://stackoverflow.com/a/6657284
float getZ(in vec2 texCo)
{
  float zB, zN;

  zB = texture2D(uDepthBuffer, texCo).x;
  zN = 2.0 * zB - 1.0;
  
  return 2.0 * uNear * uFar / (uFar + uNear - zN * (uFar - uNear));
}


// Accessing textures in a loop is a performance drag, hence the repetition. 
void main(void)
{
  // TODO serve as uniforms?
  halfPixLen = uPixLen / 2.0;
  offsetInTex = uOffset / 2.0;
  searchDir = sign(uOffset);

  // Calculate the texture coordinates for the pixels along the epipolar line.
  texCos[0] = vTexCo + searchDir * vec2(halfPixLen, 0.0);
  texCos[1] = vTexCo + searchDir * vec2(halfPixLen * 2.0, 0.0);
  texCos[2] = vTexCo + searchDir * vec2(halfPixLen * 3.0, 0.0);
  texCos[3] = vTexCo + searchDir * vec2(halfPixLen * 4.0, 0.0);
  texCos[4] = vTexCo + searchDir * vec2(halfPixLen * 5.0, 0.0);
  texCos[5] = vTexCo + searchDir * vec2(halfPixLen * 6.0, 0.0);
  texCos[6] = vTexCo + searchDir * vec2(halfPixLen * 7.0, 0.0);
  texCos[7] = vTexCo + searchDir * vec2(halfPixLen * 8.0, 0.0);
  texCos[8] = vTexCo + searchDir * vec2(halfPixLen * 9.0, 0.0);
  texCos[9] = vTexCo + searchDir * vec2(halfPixLen * 10.0, 0.0);

  // Get the z values from the depth buffer.
  zValues[0] = getZ(texCos[0]);
  zValues[1] = getZ(texCos[1]);
  zValues[2] = getZ(texCos[2]);
  zValues[3] = getZ(texCos[3]);
  zValues[4] = getZ(texCos[4]);
  zValues[5] = getZ(texCos[5]);
  zValues[6] = getZ(texCos[6]);
  zValues[7] = getZ(texCos[7]);
  zValues[8] = getZ(texCos[8]);
  zValues[9] = getZ(texCos[9]);

  // Calculate the positions of the reprojections of sample points that lie on
  // the epipolar line.
  reprojX[0] = (vX + searchDir * uPixLen) - uOffset / zValues[0];
  reprojX[1] = (vX + searchDir * uPixLen * 2.0) - uOffset / zValues[1];
  reprojX[2] = (vX + searchDir * uPixLen * 3.0) - uOffset / zValues[2];
  reprojX[3] = (vX + searchDir * uPixLen * 4.0) - uOffset / zValues[3];
  reprojX[4] = (vX + searchDir * uPixLen * 5.0) - uOffset / zValues[4];
  reprojX[5] = (vX + searchDir * uPixLen * 6.0) - uOffset / zValues[5];
  reprojX[6] = (vX + searchDir * uPixLen * 7.0) - uOffset / zValues[6];
  reprojX[7] = (vX + searchDir * uPixLen * 8.0) - uOffset / zValues[7];
  reprojX[8] = (vX + searchDir * uPixLen * 9.0) - uOffset / zValues[8];
  reprojX[9] = (vX + searchDir * uPixLen * 10.0) - uOffset / zValues[9];

  // If a point sampled farther away is reprojected to the current sample point,
  // then it is guaranteed to have lower depth than all the other sample points
  // closer on the epipolar line.
  if (abs(vX - reprojX[9]) <= halfPixLen)
    gl_FragColor = texture2D(uColorBuffer, texCos[9]);

  else if (abs(vX - reprojX[8]) <= halfPixLen)
    gl_FragColor = texture2D(uColorBuffer, texCos[8]);

  else if (abs(vX - reprojX[7]) <= halfPixLen)
    gl_FragColor = texture2D(uColorBuffer, texCos[7]);

  else if (abs(vX - reprojX[6]) <= halfPixLen)
    gl_FragColor = texture2D(uColorBuffer, texCos[6]);

  else if (abs(vX - reprojX[5]) <= halfPixLen)
    gl_FragColor = texture2D(uColorBuffer, texCos[5]);

  else if (abs(vX - reprojX[4]) <= halfPixLen)
    gl_FragColor = texture2D(uColorBuffer, texCos[4]);

  else if (abs(vX - reprojX[3]) <= halfPixLen)
    gl_FragColor = texture2D(uColorBuffer, texCos[3]);

  else if (abs(vX - reprojX[2]) <= halfPixLen)
    gl_FragColor = texture2D(uColorBuffer, texCos[2]);

  else if (abs(vX - reprojX[1]) <= halfPixLen)
    gl_FragColor = texture2D(uColorBuffer, texCos[1]);

  else if (abs(vX - reprojX[0]) <= halfPixLen)
    gl_FragColor = texture2D(uColorBuffer, texCos[1]);

  else
    gl_FragColor = texture2D(uColorBuffer, vTexCo);

  /*if (uOffset < 0.0)
    gl_FragColor = GREEN;
  else
    gl_FragColor = RED;*/
}