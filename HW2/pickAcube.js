//CSE 470 HW 2 Pick a Cube  
/*
Written by: HW470: Carson Sharp
Date: March 2021

Description: 
This program makes a cube and displays 8 copies that rotate on their own axes, aligned in a circle around the center cube. Selecting any outer cube will make the center cube copy that cube's rotation.
*/

var canvas;
var gl;

var numVertices  = 36; 

var cubeVertices = [];
var cubeColor = [];

var near = -2;
// if near set to positive, then shrink/grow orth will clip geometry
//var near = 1; 
var far = 5;
var radius = 2.0;
var theta  = 0.0;
var phi    = 0.0;
var dr = 5.0 * Math.PI/180.0;

var left = -4.0;
var right = 4.0;
var top = 4.0;
var bottom = -4.0;

var speed = 0.0;

var mvMatrix, pMatrix, mvCenterMatrix;
var mvMatrix2;
var modelView, projection;
var eye;

const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

var counter = 100;

//positions for outer cubes
var positions = [
			translate(1.945,1.945,0.0), //up-right (this isnt exactly right for a circle)
			translate(0,2.75,0.0), //up
			translate(0,-2.75,0.0), //down
			translate(2.75,0,0.0), //right
			translate(-2.75,0,0.0), //left
			translate(-1.945,1.945,0.0), //up-left 
			translate(1.945,-1.945,0,0), //down-right
			translate(-1.945,-1.945,0.0), //down-left
			
				 ];

//x and y coords for positions of outcubes 
var positionCoords = [
					[0,0],
					[0,0],
					[0,0],
					[0,0],
					[0,0],
					[0,0],
					[0,0],
					[0,0]


				 ];

var scale = 0.2;

var testm;
var axis = vec3(1,0,0); 
var spintheta = 0.0;
var thetaLoc;


window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    
    //gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    createCube();
	
	// push the origin and make it black
	var origin = vec4(0.0, 0.0, 0.0, 1.0);
	cubeVertices.push(origin); 
	cubeColor.push(vertexColors[0]);
	console.log("Black point is origin");
	console.log("Canvas is [-1,1] x [-1, 1]");
	

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    //gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(cubeColor), gl.STATIC_DRAW );
    
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    //gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(cubeVertices), gl.STATIC_DRAW );
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
 
    modelView = gl.getUniformLocation( program, "modelView" );
	mvMatrix = mat4();

	mvCenterMatrix = mat4();

	mvCenterMatrix = mult(mat4(), scalem(scale,scale,scale));
	mvCenterMatrix = mult(mvCenterMatrix, translate(-0.5,-0.5,0.5));

	// Event Listeners

	//slider to control scale of the cubes
	document.getElementById("slider2").onchange = function(){
		scale = event.srcElement.value;
		console.log("cube scale = " , scale);
		mvCenterMatrix = mult(mat4(), scalem(scale,scale,scale));
		mvCenterMatrix = mult(mvCenterMatrix, translate(-0.5,-0.5,0.5));
	}

	//slider to control rotation speed
	document.getElementById("slider").onchange = function(){
		speed = event.srcElement.value;
		console.log("speed = " , speed);
	}
	
	//reset center cube to original values if button is clicked
	document.getElementById("ButtonIdentity").onclick = function(){
		mvCenterMatrix = mat4();
		mvCenterMatrix = mult(mat4(), scalem(scale,scale,scale));
		mvCenterMatrix = mult(mvCenterMatrix, translate(-0.5,-0.5,0.5));
		counter = 100;
		console.log("ModelView matrix is just the identity", mvMatrix);
		};
    
    canvas.addEventListener("click", function(){

        gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
		

        var screenx = event.clientX - canvas.offsetLeft;
		  var screeny = event.clientY - canvas.offsetTop;
		  
		  var posX = 2*screenx/canvas.width-1;
		  var posY = 2*(canvas.height-screeny)/canvas.height-1;
		  
          t = vec2(posX,posY);
		  

		  //log coords of mouse click
	      console.log("  clip coord x=",posX,"  y=",posY);
		  


	     //loop through positions and see if any outer cube matches the mouse click coords in the canvas
         for (var i = positions.length - 1; i >= 0; i--) {
         	if(-0.1 < (positionCoords[i][0] - t[0]) && (positionCoords[i][0] - t[0]) < 0.1 && -0.1 < (positionCoords[i][1] - t[1]) && (positionCoords[i][1] - t[1]) < 0.1){
         		//set a counter to allow for the center cube to be drawn based on the correct outer cube.
         		counter = i;
         		console.log("CUBE CLICKED")
         	}

         }
		
    } );
       
    render();
}


var render = function() {
        gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        //handles rotation speed 
        theta += +speed;

        //draw center cube
        gl.uniformMatrix4fv( modelView, false, flatten(mvCenterMatrix));        
        gl.drawArrays( gl.TRIANGLES, 0, numVertices );


        //loop through position array and place 8 outcubes in a circle
        for (var i = positions.length - 1; i >= 0; i--) {
        	//perform transformation of 8 outercubes
       		mvMatrix = mult(scalem(scale,scale,scale) , positions[i]) 
       		positionCoords[i][0] = mvMatrix[0][3];
        	positionCoords[i][1] = mvMatrix[1][3];
       		mvMatrix = mult(mvMatrix, rotate(theta,mvMatrix[0][3],mvMatrix[1][3],0));
       		if(counter < 100 && i == counter){
       			//apply correct transformation the counter has been set to an index from the outcube position array
        		mvCenterMatrix = mult( scalem(scale,scale,scale), translate(0.0,0.0,0.0)); 
        		mvCenterMatrix = mult(mvCenterMatrix, rotate(theta,mvMatrix[0][3],mvMatrix[1][3],0));
				mvCenterMatrix = mult(mvCenterMatrix, translate(-0.5,-0.5,0.5));

        	}
        	mvMatrix = mult(mvMatrix, translate(-0.5,-0.5,0.5)); 

        	//draw cubes after transformations have been applied
        	gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix));        
        	gl.drawArrays( gl.TRIANGLES, 0, numVertices );

        }
		
		// draw the origin
		mvMatrix2 = mat4();
		gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix2) );
		gl.drawArrays( gl.POINTS, numVertices, 1 );
		
		 
		
        requestAnimFrame(render);
    }