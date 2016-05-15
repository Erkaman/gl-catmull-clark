var vec3 = require('gl-vec3');
var normals = require('normals');
var Set = require('es6-set');


/*
for every face store:
    the points of the face.


    how to get: just loop through index array.





    for every edge store:
    the two points of the edge. the two adjacent faces to the edge.

    the points are easy to get, by looping through index array. or just get the points of every face.
    we can get points by looping over all faces.









    for every vertex store:
    adjacent faces.
    adjacent edges.

*/

function _sort(edge) {
    return edge[0] < edge[1] ? edge: [edge[1], edge[0]];
}

// out = a + b*s
function _mad(out, a, b, s) {
    out[0] = a[0] + s*b[0]
    out[1] = a[1] + s*b[1]
    out[2] = a[2] + s*b[2]
    return out;
}

function catmullClark(positions, cells) {

    // original points, indexed by their indices.
    // store adjacent faces and adjacent vertices.
    originalPoints = [];

    // original faces, in their original order.
    // stores face point.
    faces = [];

    // original edges. indiced by the indices of the vertices at end.
    edges = [];


    for(var iCell = 0; iCell < cells.length; ++iCell) {

        // now go through vertices in the cell, adding them to the face one by one.
        var cellPositions = cells[iCell];
       // console.log("pos: ", cellPositions);
        var facePoints = [];

        // initialize:
        faces[iCell] = {stringRepr:  cells[iCell].toString() };



        for(var j = 0; j < cellPositions.length; ++j ) {

            var positionIndex = cellPositions[j];

            var pointObject;

            // check at positionIndex
            if(typeof originalPoints[positionIndex] === 'undefined' ) {
                // create the object on the fly.
                var v = positions[positionIndex];

                var vec = vec3.fromValues(v[0], v[1], v[2]);
                pointObject = {
                    point:  vec,
                    faces: [],
                    edges: new Set(),
                    stringRepr: positionIndex.toString() + " : " + vec.toString()
                };
            } else {
                pointObject = originalPoints[positionIndex];
            }

            // every point should have a reference to its face.
            pointObject.faces.push(  faces[iCell] );

            originalPoints[positionIndex] = pointObject;
            facePoints.push(pointObject);
        }

        faces[iCell].points = facePoints;

        var avg = vec3.fromValues(0,0,0);

        // now compute the facepoint.
        for(var i = 0; i < faces[iCell].points.length; ++i ) {
            var v = faces[iCell].points[i].point;
            vec3.add(avg, v, avg);
        }
        vec3.scale(avg, avg, 1.0 / faces[iCell].points.length );
        faces[iCell].facePoint = avg;

        var faceEdges = [];

        for(var iEdge=0; iEdge < cellPositions.length; ++iEdge) {

            var edge;

            if(cellPositions.length == 3) {


                if (iEdge == 0) {
                    edge = [cellPositions[0], cellPositions[1]];
                } else if (iEdge == 1) {
                    edge = [cellPositions[1], cellPositions[2]];
                } else if (iEdge == 2) {
                    edge = [cellPositions[2], cellPositions[0]];
                }
            } else {
                if (iEdge == 0) {
                    edge = [cellPositions[0], cellPositions[1]];
                } else if (iEdge == 1) {
                    edge = [cellPositions[1], cellPositions[2]];
                } else if (iEdge == 2) {
                    edge = [cellPositions[2], cellPositions[3]];
                } else if (iEdge == 3) {
                    edge = [cellPositions[3], cellPositions[0]];
                }

            }


            edge = _sort(edge);

            var edgeObject
            if(typeof edges[edge] === 'undefined' ) {

                edgeObject = {
                    points: [originalPoints[edge[0]], originalPoints[edge[1]]],
                    faces: [],
                    stringRepr: edge.toString()
                };

                edges[edge] = edgeObject;
            } else {
                edgeObject  = edges[edge];
            }

            edgeObject.faces.push(  faces[iCell] );


            // TODO: LIST SHOULD BE A SET INSTEAD.
            // http://stackoverflow.com/questions/2523436/javascript-implementation-of-a-set-data-structure
            edgeObject.points[0].edges.add( edgeObject );
            edgeObject.points[1].edges.add( edgeObject );


            faceEdges.push(edgeObject);

        }



        faces[iCell].edges = faceEdges;



    // iterate through the edges of the face.

        // next go through edges.

        // once we have gone through them all, compute face point, and finally create face object.
    }





    // compute edge point.
    for(key in edges) {

        var edge = edges[key];

        // points, faces

        var avg = vec3.fromValues(0,0,0);
        var count = 0;

        // add face points of edge.
        for(var i = 0; i < edge.faces.length; ++i ) {
            var facePoint = edge.faces[i].facePoint;
            vec3.add(avg, facePoint, avg);

            ++count;
        }

        // sum together the two endpoints.
        for(var i = 0; i < edge.points.length; ++i ) {
            var endPoint = edge.points[i].point;
            vec3.add(avg, endPoint, avg);
            ++count;
        }

        vec3.scale(avg, avg, 1.0 / count );

        edge.edgePoint = avg;

        count = 0;

        var avg2 = vec3.fromValues(0,0,0);

        for(var i = 0; i < edge.points.length; ++i ) {
            var endPoint = edge.points[i].point;
            vec3.add(avg2, endPoint, avg2);
            ++count;
        }
        vec3.scale(avg2, avg2, 1.0 / count );


        edge.midPoint = avg2;


    }


    for(var i = 0; i < positions.length; ++i) {

        var point = originalPoints[i];

        var n = point.faces.length;



        var newPoint = vec3.fromValues(0,0,0);

        for(var j = 0; j < point.faces.length; ++j ) {
            var facePoint = point.faces[j].facePoint;

            vec3.add(newPoint, newPoint, facePoint);
        }
        for (var edge of point.edges) {
            // 'raz', {}, 'foo' iterated
            _mad(newPoint, newPoint, edge.midPoint, 2);
        }
        vec3.scale(newPoint, newPoint, 1.0 / n );

        _mad(newPoint, newPoint, point.point, n-3);

        vec3.scale(newPoint, newPoint, 1.0 / n );

        point.newPoint = newPoint

    }

    newPositions = [];
    newCells = [];

    //faces = [];

    var index = 0;

   // console.log("face count", faces.length );


    function getIndex(p) {
        if(! ("index" in p) ) {
            p.index = index++;
     //       console.log("new index ", p.index);
            newPositions.push( [ p[0], p[1], p[2] ] );

        }
        return p.index;

    }

    for(var iFace = 0;  iFace <faces.length; ++iFace) {

        var face = faces[iFace];

/*
        console.log("createface", face);

        console.log("edges0", face.edges[0].edgePoint);
        console.log("edges1", face.edges[1].edgePoint);
        console.log("edges2", face.edges[2].edgePoint);
        console.log("edges3", face.edges[3].edgePoint);

        console.log("points0", face.points[0].newPoint);
        console.log("points1", face.points[1].newPoint);
        console.log("points2", face.points[2].newPoint);
        console.log("points3", face.points[3].newPoint);

        console.log("facePoint", face.facePoint);
        */


        for(var iPoint=0; iPoint < face.points.length; ++iPoint) {
            var point = face.points[iPoint];

            var a = point.newPoint;
            var b = face.edges[(iPoint+0) % face.edges.length].edgePoint;
            var c = face.facePoint;
            var d = face.edges[(iPoint + face.edges.length-1) % face.edges.length].edgePoint;




            var ia = getIndex(a);
            var ib = getIndex(b);
            var ic = getIndex(c);
            var id = getIndex(d);


            newCells.push([id, ia, ib, ic ]);
        }

    }


    return {positions: newPositions, cells:newCells};

}

module.exports= catmullClark;


