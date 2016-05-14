var vec3 = require('gl-vec3');
var normals = require('normals');
var Set = require('es6-set');


function _center(cp) {
    return [cp[0], (-1 + 2* (1.0-cp[1]) ) ];
}

function revolveCurve(cps) {

    var positions = [];
    var cells = [];

    var slices = 10;
    var index = 0;
    for (var i = 0; i <= slices; ++i) {

        var theta = (i * Math.PI * 2) / slices;

        for(var j = 1; j < cps.length-1; ++j) {
            var cp = _center(cps[j]);

            var p = vec3.fromValues(cp[0], 0, cp[1] );

            var rotatedP = vec3.create();
            vec3.rotateZ(rotatedP, p, vec3.fromValues(0,0,0), theta);

            positions.push([rotatedP[0],rotatedP[1],rotatedP[2]]);

            ++index;

            if (i != 0 && j != 1) { // create faces in the second iteration, and beyond.

                var i1 = index - 1;
                var i2 = index - 2;
                var i3 = index - 1 - (cps.length - 2);
                var i4 = index - 1 - (cps.length - 2) - 1;

                console.log("i", i1, i2, i3, i4);

                cells.push([i1, i2, i3 ]);
                cells.push([i4, i3, i2]);
            }
        }
    }

    var cp = _center(cps[0]);
    var topIndex = index; // top center index;
    positions.push([cp[0], 0, cp[1]]);

    ++index;

    cp = _center(cps[cps.length-1]);
    var bottomIndex = index; // bottom center index;
    positions.push([cp[0], 0, cp[1]]);

    for (var i = 0; i < slices; ++i) {

        var i1 = topIndex;
        var i2 = i     * (cps.length - 2);
        var i3 = (i+1) * (cps.length - 2);

        cells.push([i1, i2, i3 ]);

        i1 = bottomIndex;
        i2 = i     * (cps.length - 2) + (cps.length - 3);
        i3 = (i+1) * (cps.length - 2) + (cps.length - 3);
        cells.push([i3, i2, i1 ]);

        //console.log("index: ", i1, i2, i3);


    }

    console.log("positions: ", positions );
    console.log("cells: ", cells );


    //         .attr('aNormal', )
    return {positions: positions, cells: cells, normals: normals.vertexNormals(cells, positions) };
}

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

    console.log("AAAAAAAAAAAA");



   //  create array of faces, where every face can have face-point stores.



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
          //      console.log("AAAAAAAAAAAAAA create new point");
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
        console.log("avg " ,  1.0 / faces[iCell].points.length );
     //   console.log("Face: ", iCell, " lol: ",  faces[iCell]);

        var faceEdges = [];

        for(var iEdge=0; iEdge < 3; ++iEdge) {

            var edge;
            if(iEdge == 0) {
                edge = [cellPositions[1], cellPositions[2]];
            } else if(iEdge == 1) {
                edge = [cellPositions[0], cellPositions[2]];
            }else if(iEdge == 2) {
                edge = [cellPositions[0], cellPositions[1]];
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



            // console.log("BBBBBBBBBBBBB edge", edge, "obj", edgeObject);

            faceEdges.push(edgeObject);

        }



        faces[iCell].edges = faceEdges;



    // iterate through the edges of the face.

        // next go through edges.

        // once we have gone through them all, compute face point, and finally create face object.
    }



  // console.log("edges: " , edges);


    // compute edge point.
    for(key in edges) {
       // console.log("edge: " ,key, " : ",  edges[key]  );

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
       // console.log("count: ", count);

        edge.edgePoint = avg;

        count = 0;

        var avg2 = vec3.fromValues(0,0,0);

        for(var i = 0; i < edge.points.length; ++i ) {
            var endPoint = edge.points[i].point;
         //   console.log("end: ", endPoint.toString() );
            vec3.add(avg2, endPoint, avg2);
            ++count;
        }
        vec3.scale(avg2, avg2, 1.0 / count );


        edge.midPoint = avg2;


    //    console.log("count ", count, "obj ", edge  );
    }


    for(var i = 0; i < positions.length; ++i) {

        var point = originalPoints[i];

        var n = point.faces.length;



        var newPoint = vec3.fromValues(0,0,0);
    //    console.log("faces: ",  point.faces.length );



        for(var j = 0; j < point.faces.length; ++j ) {
            var facePoint = point.faces[j].facePoint;

            vec3.add(newPoint, newPoint, facePoint);
        }
        for (var edge of point.edges) {
            // 'raz', {}, 'foo' iterated
            //console.log("edge: ", edge);
            _mad(newPoint, newPoint, edge.midPoint, 2);
        }
        vec3.scale(newPoint, newPoint, 1.0 / n );

        _mad(newPoint, newPoint, point.point, n-3);

        vec3.scale(newPoint, newPoint, 1.0 / n );

        point.newPoint = newPoint


     //   console.log("point: " ,point );
   //     console.log("point2: " ,  point.newPoint);
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

    for(var iFace = 0;  iFace < faces.length; ++iFace) {

        var face = faces[iFace];

/*
        console.log("createface", face);

        console.log("edges0", face.edges[0].edgePoint);
        console.log("edges1", face.edges[1].edgePoint);
        console.log("edges2", face.edges[2].edgePoint);

        console.log("points0", face.points[0].newPoint);
        console.log("points1", face.points[1].newPoint);
        console.log("points2", face.points[2].newPoint);

        console.log("facePoint", face.facePoint);
*/



        for(var iPoint=0; iPoint < face.points.length; ++iPoint) {
            var point = face.points[iPoint];

            var a = point.newPoint;
            var b = face.edges[(iPoint +1) % face.edges.length].edgePoint; // e1
            var c = face.facePoint;
            var d = face.edges[(iPoint + 2) % face.edges.length].edgePoint; // e2


/*
            console.log("point ", iPoint );
            console.log("edge ", (iPoint +1) % face.edges.length );
            console.log("edge ", (iPoint +2) % face.edges.length );
*/

            /*
            newPositions.push(a);
            newPositions.push(b);
            newPositions.push(c);
            newPositions.push(d);
*/

            /*
            var ia =  index++;
            var ib =  index++;
            var ic =  index++;
            var id =  index++;
            */
            var ia = getIndex(a);
            var ib = getIndex(b);
            var ic = getIndex(c);
            var id = getIndex(d);



            newCells.push([ic,ib,ia]);
            newCells.push([id,ic,ia]);



/*
            console.log("index a", ia);
            console.log("index b", ib );
            console.log("index c", ic);
            console.log("index d", id);
*/
          //  console.log("index: ", index);

        }

    }


    return {positions: newPositions, cells:newCells};

}

module.exports.revolveCurve= revolveCurve;
module.exports.catmullClark= catmullClark;


