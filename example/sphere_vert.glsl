precision mediump float;

attribute vec3 aPosition;
attribute vec2 aUv;
attribute vec3 aNormal;

varying vec3 vPosition;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vDiff;

uniform mat4 uProjection;
uniform mat4 uView;

void main() {
    vPosition = aPosition;
    vUv = aUv;
    vNormal = aNormal;
        vec3 lightDir = normalize(vec3(1.0,1.0,1.0));

    vDiff = vec3( dot(vNormal, lightDir) );

    gl_Position = uProjection * uView * vec4(aPosition, 1.0);
}