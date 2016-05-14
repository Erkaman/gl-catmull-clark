precision mediump float;

varying vec3 vPosition;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vDiff;


void main() {

    vec3 lightDir = normalize(vec3(1.0,1.0,1.0));

    gl_FragColor = vec4( vec3( dot(vNormal, lightDir)   ) , 1.0);
}
