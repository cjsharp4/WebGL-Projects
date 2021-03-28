//By: Carson Sharp


/*
//index array for 6 sides currently
var tri = [
    0, 2, 1, //point to vertex 0, then 2, then, 1 to form a triangle
    2, 3, 1,
    2, 4, 3,
    4, 5, 3,
    4, 6, 5,
    6, 7, 5,
    6, 8, 7,
    8, 9, 7,
    8, 10, 9,
    10, 11, 9,
    10, 0, 11, //wrap back to beginning triangle (0,2,1)
    0, 1 , 11  //wrap back to beginning triangle (0,2,1)
];
*/

var numOfSides = 36; //changes the number of sides for cylinder, more sides means more "smooth" cylinder surface

//triangulation data structure
tri = new Array(numOfSides * 2);
var indexer = 0;
for(var i = 0; i < (numOfSides * 2); i+=2){
    tri[indexer] = i;
    tri[indexer + 1] = i + 2;
    tri[indexer + 2] = i + 1;
    tri[indexer + 3] = i + 2;
    tri[indexer + 4] = tri[indexer + 1] + 1;
    tri[indexer + 5] = i + 1;
    indexer = indexer + 6;
}
//connect last triangle back to beginning triangle (0,2,1)
tri[indexer - 2] = 1;
tri[indexer - 3] = 0;
tri[indexer - 5] = 0; 
console.log(tri);



//fill vert array with correct vertice positions for cylinder
function createVerts(){

    vert = new Array(numOfSides * 2); //create vertex array 
    normals = new Array(numOfSides * 2);

    var xVert;
    var zVert;
    var angle = 0.0;
    var increment = Math.PI * 2.0 / numOfSides;

    for(var i = 0; i < (numOfSides*2); i+=2){

        //multiplying y-rotation matrix by the curve function [1, t, 0] (for cylinder)
        //[cos*f , t , -sin*f]
        xVert = 0.5 * Math.cos(angle);
        zVert = 0.5 * -Math.sin(angle);

        //normals for cylinder, curved surface will be different as you 
        //will need to find the actual derivative of f(t)
        //derivatives for cylinder are easy because we only have numbers or t (nothing like t^2 + 1 for curved)

        dsdt = vec3( (Math.cos(angle) * 0) , 1 , (-Math.sin(angle) * 0) ); //derivative with respect to 't' ... f(t) for cylinder is a number so its derivative will just be 0
        dsdtheta = vec3( (-Math.sin(angle) * 0.5) , 0 , (-Math.cos(angle) * 0.5) ); //derivative with respect to 'theta'
        normals[i] = normalize( cross( dsdt , dsdtheta ) );
        normals[i + 1] = normalize( cross( dsdt , dsdtheta ) );

        vert[i] = vec3(xVert, -0.5, zVert);
        vert[i + 1] = vec3(xVert, 0.5, zVert);

        angle = angle + increment;

    }

    console.log(normals);
    console.log(vert);

}


//delete later
function triangle(a, b, c) {

    normalsArray.push(a);
    normalsArray.push(b);
    normalsArray.push(c);
    // play: create an incorrect normal vector to see what happens
    //normalsArray.push(c + Math.random());
    pointsArray.push(a);
    pointsArray.push(b);      
    pointsArray.push(c);

    index += 3;
}


function divideTriangle(a, b, c, count) {
   if ( count > 0 ) {
               
       var ab = mix( a, b, 0.5);
       var ac = mix( a, c, 0.5);
       var bc = mix( b, c, 0.5);
               
       // normalize 3d vector
       ab = normalize(ab, false);
       ac = normalize(ac, false);
       bc = normalize(bc, false);
                               
       divideTriangle( a, ab, ac, count - 1 );
       divideTriangle( ab, b, bc, count - 1 );
       divideTriangle( bc, c, ac, count - 1 );
       divideTriangle( ab, bc, ac, count - 1 );
   }
   else { 
       triangle( a, b, c );
   }
}


function tetrahedron(a, b, c, d, n) {
   divideTriangle(a, b, c, n);
   divideTriangle(d, c, b, n);
   divideTriangle(a, d, b, n);
   // comment out next line to create an open object
   divideTriangle(a, c, d, n);
}