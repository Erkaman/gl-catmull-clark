/* global requestAnimationFrame */

var mat4 = require('gl-mat4');
var vec3 = require('gl-vec3');
var Geometry = require('gl-geometry');
var glShader = require('gl-shader');
var glslify = require('glslify');
var createOrbitCamera = require('orbit-camera');
var shell = require("gl-now")();
var createGui = require("pnp-gui");
var normals = require('normals');
var tree = require('./tree.js');
var boundingBox = require('vertices-bounding-box');
var tform = require('geo-3d-transform-mat4');
var cameraPosFromViewMatrix = require('gl-camera-pos-from-view-matrix');
var quadsToTris = require('gl-quads-to-tris');

var catmullClark = require("../index.js");

var shader, geo;

var camera = createOrbitCamera([6, -10.0, 6], [0, 0, 0], [0, 1, 0]);

var mouseLeftDownPrev = false;

var bg = [0.6, 0.7, 1.0]; // clear color.

var models = [];


/*
Can be tweaked by the GUI
 */
var renderModel = {val: 0};
var numSubdividions = {val: 3};




function centerPositions(positions) {

     var bb = boundingBox(positions)

     var _translate = [
     -0.5 * (bb[0][0] + bb[1][0]),
     -0.5 * (bb[0][1] + bb[1][1]),
     -0.5 * (bb[0][2] + bb[1][2])
     ]
     var mat = mat4.create()
     mat4.translate(mat, mat, _translate)

     var newPositions = tform(positions, mat)


     // Scale the geometry to a 1x1x1 cube.
     // Shrink it a little to have a buffer
     // from edge effects.
     var bound = 16.0;
     var _scale = [
     bound / (bb[1][0] - bb[0][0]),
     bound / (bb[1][1] - bb[0][1]),
     bound / (bb[1][2] - bb[0][2])
     ]
     var scale = mat4.create()
     mat4.scale(scale, scale, _scale)
    newPositions = tform(newPositions, scale)

    return newPositions;
}

shell.on("gl-init", function () {
    var gl = shell.gl

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK)

    gui = new createGui(gl);
    gui.windowSizes = [300, 380];

    shader = glShader(gl, glslify("./gold_vert.glsl"), glslify("./gold_frag.glsl"));

    // fix intial camera view.
    camera.rotate([0, 0], [0, 0]);

    quadPositions = [
        [+1, +1, +1], // 0
        [-1, +1, +1], // 1
        [+1, +1, -1], // 2
        [-1, +1, -1], // 3
        [+1, -1, +1], // 4
        [-1, -1, +1], // 5
        [+1, -1, -1], // 6
        [-1, -1, -1]  // 7
    ];

    quadCells = [
        // +y
        [2, 3, 1, 0],
        // -y
        [4, 5, 7, 6],
        // +z
        [0, 1, 5, 4],
        // -z
        [6, 7, 3, 2],
        // +x
        [6, 2, 0, 4],
        // -x
        [7, 5, 1, 3],
    ];

    var obj;

    cells = quadCells;



    /*
    Create "sphere" models.
     */
    models[0] = [];
    for(var i = 0; i <= 3; ++i) {

        var positions = centerPositions(quadPositions);

        var obj = {};
        if(i == 0) {
            obj.positions = positions;
            obj.cells = quadsToTris(quadCells);
        } else {
            obj =  catmullClark(positions, quadCells, i, true);

        }

        models[0][i] = Geometry(gl)
            .attr('aPosition', obj.positions)
            .faces(obj.cells)
            .attr('aNormal', require('normals').vertexNormals(obj.cells, obj.positions));
    }



    obj = tree.tree();
    thingPositions = obj.positions;
    thingCells = (obj.cells);



    //Create "thing" models
    models[1] = [];
    for(var i = 0; i <= 3; ++i) {

        var positions = centerPositions(thingPositions);

        var obj = {};
        if(i == 0) {
            obj.positions = positions;
            obj.cells = quadsToTris(thingCells);
        } else {
            obj =  catmullClark(positions, thingCells, i, true);

        }

        models[1][i] = Geometry(gl)
            .attr('aPosition', obj.positions)
            .faces(obj.cells)
            .attr('aNormal', require('normals').vertexNormals(obj.cells, obj.positions));
    }

    catmullClark(positions, thingCells, 3, true);
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
    var scratchVec = vec3.create();

    mat4.perspective(projection, Math.PI / 2, canvas.width / canvas.height, 0.1, 10000.0);

    /*
     Render geometry.
     */

    shader.bind();

    shader.uniforms.uView = view;
    shader.uniforms.uProjection = projection;
    shader.uniforms.uEyePos = cameraPosFromViewMatrix(scratchVec, view);


    var geo = models[renderModel.val][numSubdividions.val-2];

    geo.bind(shader);
    geo.draw();


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

    gui.textLine("Model");
    gui.radioButton("Sphere", renderModel, 0);
    gui.radioButton("Thing", renderModel, 1);

    gui.separator();
    gui.textLine("Subdivisions");

    gui.radioButton("No subdivision", numSubdividions, 2);
    gui.radioButton("1 subdivisions", numSubdividions, 3);
    gui.radioButton("2 subdivisions", numSubdividions, 4);
    gui.radioButton("3 subdivisions", numSubdividions, 5);


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
