# cos-palette

`cosPalette` is a simple shader function that is defined as

```glsl
vec3 cosPalette(  float t,  vec3 a,  vec3 b,  vec3 c, vec3 d ){
    return a + b*cos( 6.28318*(c*t+d) );
}
```

where `a,b,c,d` are RGB-colors. This function can be used to make very compact color palettes.
A simple editor for making such palettes is provided [here](http://erkaman.github.io/glsl-cos-palette/).


The function `cosPalette(t, a, b,  c, d )`, which is the palette, will basically assign a color to every value `t`, which is in the range `[0,1]`. So if you set `t` to be the value of some noise function(say, Perlin noise) in range `[0,1]`, you can use this
palette to make simple procedural textures. The palette will basically colorize the noise. In the fragment shader, we can easily procedurally generate a texture by doing something like

```glsl
    float t = noise(vPosition);
    vec3 tex = cosPalette(t, uAColor, uBColor, uCColor, uDColor );
```

Credit goes to [Inigo Quilez](http://www.iquilezles.org/www/articles/palettes/palettes.htm) for coming up with this technique.

## Examples

Below are some examples of palettes

`cosPalette(t,vec3(0.2,0.7,0.4),vec3(0.6,0.9,0.2),vec3(0.6,0.8,0.7),vec3(0.5,0.1,0.0))`


<img src="images/f.png" width="356" height="366" />


`cosPalette(t,vec3(0.2,0.5,0.3),vec3(0.0,0.5,0.7),vec3(1.0,1.0,1.0),vec3(0.0,0.3,0.7))`

<img src="images/g.png" width="356" height="366" />


`cosPalette(t,vec3(0.6,0.0,0.0),vec3(1.0,0.0,0.0),vec3(1.0,0.0,0.0),vec3(1.0,0.0,0.0))`

<img src="images/h.png" width="356" height="366" />


`cosPalette(t,vec3(1.0,0.4,0.0),vec3(0.4,0.8,0.0),vec3(0.5,0.3,0.9),vec3(0.9,0.6,0.9))`

<img src="images/j.png" width="356" height="366" />


`cosPalette(t,vec3(0.4,0.3,0.1),vec3(0.1,0.1,0.1),vec3(0.4,0.4,0.4),vec3(0.0,0.0,0.0))`

<img src="images/l.png" width="356" height="366" />



