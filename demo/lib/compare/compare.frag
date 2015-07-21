precision mediump float;

uniform sampler2D 
  uTexA,
  uTexB;

varying vec2 vTexCo;

vec4
  texA,
  texB;

void main(void)
{
  texA = texture2D(uTexA, vTexCo);
  texB = texture2D(uTexB, vTexCo);
  
  if (all(lessThan(abs(texA - texB), vec4(0.001))))
    gl_FragColor = texB;
  else
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);

  //gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
  //gl_FragColor = vec4(abs(texA - texB).rgb, 1.0);
}