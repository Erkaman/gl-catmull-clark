precision mediump float;

varying vec3 vPosition;
varying vec3 vNormal;

uniform vec3 uEyePos;

void main() {
    vec3 diffuseColor = vec3(0.42, 0.34, 0.0);
    vec3 ambientLight = vec3(0.87, 0.82, 0.69);
    vec3 lightColor = vec3(0.40, 0.47, 0.0);
    vec3 lightDir = normalize(vec3(-0.69, 1.33, 0.57));
    float specularPower = 12.45;

    vec3 n = vNormal;
    vec3 l = normalize(lightDir);
    vec3 v = normalize(uEyePos - vPosition);
    vec3 ambient = ambientLight * diffuseColor;
    vec3 diffuse = diffuseColor * lightColor * dot(n, l) ;
    vec3 specular = pow(clamp(dot(normalize(l+v),n),0.0,1.0)  , specularPower) * vec3(1.0,1.0,1.0);

    gl_FragColor = vec4(ambient + diffuse + specular, 1.0);
}
