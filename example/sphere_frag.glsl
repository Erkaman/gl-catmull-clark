precision mediump float;

varying vec3 vPosition;
varying vec2 vUv;
//varying vec3 vNormal;

void main() {

    vec3 lightDir = normalize(vec3(1.0,1.0,1.0));

    gl_FragColor = vec4( vPosition, 1.0);
}
