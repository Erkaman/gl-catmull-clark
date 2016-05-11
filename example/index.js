/* global requestAnimationFrame */

var mat4 = require('gl-mat4');
var vec3 = require('gl-vec3');
var Geometry = require('gl-geometry');
var glShader = require('gl-shader');
var glslify = require('glslify')
var createOrbitCamera = require('orbit-camera');
var shell = require("gl-now")();
var createGui = require("pnp-gui");
var createTexture = require('gl-texture2d');


var revolveCurve = require("../index.js").revolveCurve;
var catmullClark = require("../index.js").catmullClark;


var sphereShader, quadShader, quadGeo, sphereGeo, quadGeo, fbo, bakeShader, curveTexture;
var bakeResolution = 256*2*2;

var camera = createOrbitCamera([0, -3.0, 0], [0, 0, 0], [0, 1, 0]);

var mouseLeftDownPrev = false;

var bg = [0.6, 0.7, 1.0]; // clear color.


shell.on("gl-init", function () {
    var gl = shell.gl

    // (-0.020900, 0.718350)
//    Vector2f s = CatmullRomSpline(Vector2f(0.0, 0.0),Vector2f(-0.2, 0.6),Vector2f(0.6, 0.9),Vector2f(1.0, 1.0), 0.3);


    // var s = catmullRom(0.3,   [0.0, 0.0], [-0.2, 0.6],[0.6, 0.9], [1.0, 1.0]  );
    //console.log("S: ", s);

    
    gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.cullFace(gl.BACK)
    
    gui = new createGui(gl);
    gui.windowSizes = [300, 380];

    sphereShader = glShader(gl, glslify("./sphere_vert.glsl"), glslify("./sphere_frag.glsl"));

    // fix intial camera view.
    camera.rotate([0,0], [0,0] );


     var cps = [
        [0.0, 0.10],
        [0.5, 0.10],
        [0.5, 0.90],
        [0.0, 0.90],
    ];

   // rotated = revolveCurve(cps);

    /*
    var cube = require('primitive-cube')(1,1,1,1,1,1);

    console.log("pos ", cube.positions );
    console.log("faces ", cube.cells );
*/

    positions = [
        [+1,+1,+1], // 0
        [-1,+1,+1], // 1
        [+1,+1,-1], // 2
        [-1,+1,-1], // 3

        [+1,-1,+1], // 4
        [-1,-1,+1], // 5
        [+1,-1,-1], // 6
        [-1,-1,-1]  // 7

    ];

    cells = [
        // +y
        [2,1,0],
        [1,2,3],

        // -y
        [4,5,6],
        [7,6,5],

        // +z
        [0,1,4],
        [1,5,4 ],

        // -z
        [6,3,2],
        [3,6,7],

        // +x
        [4,2,0],
        [2,4,6],

        // -x
        [1, 3, 5],
        [7,5,3],


    ];

    var obj = catmullClark(positions, cells);

    console.log("obj, ", obj);

    positions = obj.positions;
    cells = obj.cells;


    sphereGeo = Geometry(gl)
        .attr('aPosition', positions).faces(cells);
      //  .attr('aNormal', cube.normals );




});

shell.on("gl-render", function (t) {
    var gl = shell.gl
    var canvas = shell.canvas;

    gl.clearColor(bg[0], bg[1], bg[2], 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, canvas.width, canvas.height);

    var projection = mat4.create();
    var scratchMat = mat4.create();
    var view = camera.view(scratchMat);

    mat4.perspective(projection, Math.PI / 2, canvas.width / canvas.height, 0.1, 10000.0);

    /*
    Render Sphere
     */

    sphereShader.bind();

    sphereShader.uniforms.uView = view;
    sphereShader.uniforms.uProjection = projection;


    sphereGeo.bind(sphereShader);
    sphereGeo.draw();


    /*
    Render GUI.
     */

    var pressed = shell.wasDown("mouse-left");
    var io = {
        mouseLeftDownCur: pressed,
        mouseLeftDownPrev: mouseLeftDownPrev,

        mousePositionCur: shell.mouse,
        mousePositionPrev: shell.prevMouse
    };
    mouseLeftDownPrev = pressed;

    gui.begin(io, "Window");


    gui.end(gl, canvas.width, canvas.height);
});

shell.on("tick", function () {

    // if interacting with the GUI, do not let the mouse control the camera.
    if (gui.hasMouseFocus())
        return;

    if (shell.wasDown("mouse-left")) {
        var speed = 1.3;
        camera.rotate([(shell.mouseX / shell.width - 0.5) * speed, (shell.mouseY / shell.height - 0.5) * speed],
            [(shell.prevMouseX / shell.width - 0.5) * speed, (shell.prevMouseY / shell.height - 0.5) * speed])
    }
    if (shell.scroll[1]) {
        camera.zoom(shell.scroll[1] * 0.01);
    }
});

/*
ideas:

make a bowl.
make a lightbulp.
make pillar.




algorithm:
organize the mesh data as follows:

with every face, also store the facet point.
with every edge, also store the edge point.



 model nm = model_new();
 foreach (i, f, m->f) {// iterate through all faces.

    foreach(j, v, f->v) { // iterate through all vertices of face.
       _get_idx(a, updated_point(v));
       _get_idx(b, edge_point(elem(f->e, (j + 1) % len(f->e))));
       _get_idx(c, face_point(f));
       _get_idx(d, edge_point(elem(f->e, j)));
       model_add_face(nm, 4, a, b, c, d);
     }
 }


face point: average of all four points of face.

edge point: Set each edge point to be the average of the two neighbouring face points and its two original endpoints.

for every vertex P, we then create the updated point:

n is just number of faces that P is part of.
    compute sum:
        1*(all 4 faces adjacent to P) +
        2*(average of the center of the edges the point is adjacent to)
        (n-3)*(original point P)


 */


/*






 */