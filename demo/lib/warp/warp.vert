precision highp float;


attribute vec4 aPos;
attribute vec2 aTexCoord;

varying float vX;

varying vec2 vTexCo;


void main(void)
{
  vTexCo = aTexCoord;

  vX = aPos.x;

  gl_Position = aPos;
}