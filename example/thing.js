/*
HERE BE DRAGONS!

This code generates the low-poly model seen in the README. 
But I have not yet cleaned up this code, so it is very ugly!
*/


var vec3 = require('gl-vec3');
var boundingBox = require('vertices-bounding-box');
var tform = require('geo-3d-transform-mat4');
var mat4 = require('gl-mat4');
var quat = require('gl-quat');

var index = 0;

var p0 = vec3.fromValues(+1, 0, +1);
var p1 = vec3.fromValues(-1, 0, +1);
var p2 = vec3.fromValues(-1, 0, -1);
var p3 = vec3.fromValues(+1, 0, -1);

var q0 = vec3.create();
var q1 = vec3.create();
var q2 = vec3.create();
var q3 = vec3.create();

var positions = [];
var cells = [];

function addSegment(dir, length, scale, rotation) {

    if (typeof rotation == "undefined") {
        rotation = [0, 0, 0]; // default
    }


    if (typeof scale === 'number') {
        scale = [scale, scale, scale]; // expand to vector.
    }


    vec3.scaleAndAdd(q0, p0, dir, length);
    vec3.scaleAndAdd(q1, p1, dir, length);
    vec3.scaleAndAdd(q2, p2, dir, length);
    vec3.scaleAndAdd(q3, p3, dir, length);


    /*
     Do scaling and rotation
     */
    var ps = [q0, q1, q2, q3];


    var bb = boundingBox(ps)

    // Translate the geometry center to the origin.
    var _toOrigin = [
        -0.5 * (bb[0][0] + bb[1][0]),
        -0.5 * (bb[0][1] + bb[1][1]),
        -0.5 * (bb[0][2] + bb[1][2])
    ]
    var toOrigin = mat4.create();
    mat4.translate(toOrigin, toOrigin, _toOrigin);

    var restore = mat4.create();
    mat4.translate(restore, restore, [-_toOrigin[0], -_toOrigin[1], -_toOrigin[2]]);

    var scaleMat = mat4.create();
    mat4.scale(scaleMat, scaleMat, scale);


    var q = quat.create();
    quat.rotateX(q, q, rotation[0]);
    quat.rotateY(q, q, rotation[1]);
    quat.rotateZ(q, q, rotation[2]);


    var rotMat = mat4.create();
    mat4.fromQuat(rotMat, q);

    ps = tform(ps, toOrigin);
    ps = tform(ps, scaleMat);
    ps = tform(ps, rotMat);


    ps = tform(ps, restore);

    q0 = vec3.fromValues(ps[0][0], ps[0][1], ps[0][2]);
    q1 = vec3.fromValues(ps[1][0], ps[1][1], ps[1][2]);
    q2 = vec3.fromValues(ps[2][0], ps[2][1], ps[2][2]);
    q3 = vec3.fromValues(ps[3][0], ps[3][1], ps[3][2]);

    positions.push([q0[0], q0[1], q0[2]]);
    positions.push([q1[0], q1[1], q1[2]]);
    positions.push([q2[0], q2[1], q2[2]]);
    positions.push([q3[0], q3[1], q3[2]]);

    var ip0 = index - 4;
    var ip1 = index - 3;
    var ip2 = index - 2;
    var ip3 = index - 1;

    var iq0 = index + 0;
    var iq1 = index + 1;
    var iq2 = index + 2;
    var iq3 = index + 3;


    cells.push([iq0, iq1, ip1, ip0]);

    cells.push([iq1, iq2, ip2, ip1])


    cells.push([iq2, iq3, ip3, ip2]);
    cells.push([ip0, ip3, iq3, iq0]);

    index += 4;
    p0 = q0;
    p1 = q1;
    p2 = q2;
    p3 = q3;
}

function finish() {
    var ip0 = index - 4;
    var ip1 = index - 3;
    var ip2 = index - 2;
    var ip3 = index - 1;

    cells.push([ip3, ip2, ip1, ip0]);


}

function createThing() {
    positions = [];
    cells = [];


    // make base.
    positions.push(p0);
    positions.push(p1);
    positions.push(p2);
    positions.push(p3);

    cells.push([index, index + 1, index + 2, index + 3]);

    index += 4;

    addSegment(vec3.fromValues(0.3, 0.6, 0.3), 3.0, 10.0);
    addSegment(vec3.fromValues(0.3, 0.6, 0.3), 3.0, [2, 1 / 10, 2.0]);
    addSegment(vec3.fromValues(0.3, 0.6, 0.3), 3.0, [1 / 20, 1.0, 1 / 20]);
    addSegment(vec3.fromValues(0.1, 0.6, 0.3), 6.0, 1.1);
    addSegment(vec3.fromValues(0.1, 0.6, -0.3), 6.0, 1.0);
    addSegment(vec3.fromValues(0.1, 0.6, -0.1), 6.0, 4.0);
    addSegment(vec3.fromValues(0.1, 0.6, -0.1), 6.0, 1 / 4);
    addSegment(vec3.fromValues(0.1, 0.8, 0), 3.0, 1.0, [0.8, 0.0, 0.0]);
    addSegment(vec3.fromValues(0.0, 0.8, 0.9), 3.0, 1.0, [0.4, 0.4, 0.4]);
    addSegment(vec3.fromValues(0.3, 0.8, 0.3), 3.0, 1.0);
    addSegment(vec3.fromValues(0.3, 0.3, 0.3), 3.0, [1.0, 0.5, 0.5]);
    addSegment(vec3.fromValues(0.3, 0.3, 0.7), 3.0, 1.0, [1.0, 0.7, 0.7]);
    addSegment(vec3.fromValues(0.3, 0.3, 0.7), 3.0, [20.0, 4.0, 1.0]);
    addSegment(vec3.fromValues(0.3, -0.3, 0.7), 10.0, [1 / 20.0, 1 / 4, 1.0]);
    addSegment(vec3.fromValues(0.3, -0.9, 0.7), 3.0, [1.0, 1.0, 1.0]);
    addSegment(vec3.fromValues(0.3, -0.9, 0.7), 3.0, [4.0, 1.0, 4.0]);
    addSegment(vec3.fromValues(0.0, -2.9, 0.7), 3.0, 0.3);
    addSegment(vec3.fromValues(0.0, -2.9, 0.7), 3.0, 5.0);
    addSegment(vec3.fromValues(0.0, -2.9, 0.7), 1.0, 5.0);

    finish();

    var obj = {positions: positions, cells: cells};

    return obj;
}

module.exports = createThing;
