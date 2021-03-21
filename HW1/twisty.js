//
//CSE 470 HW 1 TWISTY!  
//
/*
Written by: HW470: Carson Sharp
Date: Jan 2021

Description: 
This program ..... HW470: Draws a cool shape and applies interpolation to fade the shape to the white background
and tesselation that reverses itself at the end of the animation (Twisty!).
*/

var canvas;
var gl;

//store the vertices
//Each triplet represents one triangle
var vertices = [];

//store a color for each vertex
var colors = [];

//HW470: control the rotation
//(Your variable here)
var theta = 0.0;
var thetaLoc;
var thetaFlag;
var thetaMem = 0;

var colorChange = 0.0;
var colorLoc;
var colorFlag;
var colorMem = 0;

//HW470: control the redraw rate
var delay = 10;

// =============== function init ======================
 
// When the page is loaded into the browser, start webgl stuff
window.onload = function init()
{
	// notice that gl-canvas is specified in the html code
    canvas = document.getElementById( "gl-canvas" );
    
	// gl is a canvas object
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

	// Track progress of the program with print statement
    console.log("Opened canvas");
        
    //HW470:
    // Define  data for object 
	// See HW specs for number of vertices  required
	// Recommendation: each set of three points corresponds to a triangle.
	// Here is one triangle. You can use parametric equations, for example of a circle to generate (x,y) values
	
    vertices = [

        //stationary triangle
        vec2( 0 , 0),
        vec2( -0.083, -0.083),
        vec2( 0.083, -0.083),

        //vertices to draw a hollow, 4-sided star
        vec2(  -0.33, -0.33 ),
        vec2(  0,  -1 ),
        vec2( 0.33,  -0.33 ),
        vec2( 0.33, -0.33 ),
        vec2( 1.0, 0.0 ),
        vec2( 0.33, 0.33),
        vec2( 0.33, 0.33),
        vec2( 0.0, 1.0),
        vec2( -0.33, 0.33),
        vec2( -0.33, 0.33),
        vec2( -1.0, 0.0),
        vec2( -0.33, -0.33),

        //next 4 triangles make rotated square inside of the hollow star
        vec2( -0.33, -0.33),
        vec2( -0.33, 0.0),
        vec2( 0.0, -0.33),

        vec2( 0.33, -0.33),
        vec2( 0.33, 0.0),
        vec2( 0.0, -0.33),

        vec2( 0.33, 0.33),
        vec2( 0.33, 0.0),
        vec2( 0.0, 0.33),

        vec2( -0.33, 0.33),
        vec2( -0.33, 0.0),
        vec2( 0.0, 0.33),
        
        //final 4 triangles draw hollow square inside the rotated square 
        vec2( -0.166, -0.166),
        vec2( -0.166, 0.0),
        vec2( 0.0, -0.166),

        vec2( 0.166, -0.166),
        vec2( 0.166, 0.0),
        vec2( 0.0, -0.166),

        vec2( 0.166, 0.166),
        vec2( 0.166, 0.0),
        vec2( 0.0, 0.166),

        vec2( -0.166, 0.166),
        vec2( -0.166, 0.0),
        vec2( 0.0, 0.166)

    ];
	 
	
	//HW470: Create colors for the core and outer parts
	// See HW specs for the number of colors needed
	for(var i=0; i < vertices.length; i++) {
        if(i <= 2){
            colors.push(vec3(0.0, 0.0, 1.0));
        }
        else if(i <= 5){
            colors.push(vec3(0.0, 1.0, 0.0));
        }
        else if(i <= 8){
            colors.push(vec3(0.0, 0.0, 1.0));
        }
        else if(i <= 11){
            colors.push(vec3(0.0, 1.0, 0.0));
        }
        else if(i <= 14){
            colors.push(vec3(0.0, 1.0, 1.0));
        }
        else if(i <= 17){
            colors.push(vec3(1.0, 0.0, 1.0));
        }
        else if(i <= 20){
            colors.push(vec3(0.0, 1.0, 1.0));
        }
        else if(i <= 23){
            colors.push(vec3(1.0, 0.0, 1.0));
        }
        else if(i <= 26){
            colors.push(vec3(1.0, 0.0, 0.0));
        }
        else if(i <= 29){
            colors.push(vec3(0.0, 0.0, 0.0));
        }
        else if(i <= 32){
            colors.push(vec3(1.0, 0.0, 0.0));
        }
        else if(i <= 35){
            colors.push(vec3(0.0, 0.0, 0.0));
        }
        else{
            colors.push(vec3(1.0, 0.5, 0.0));
        }
	};
	 
	
	// HW470: Print the input vertices and colors to the console
	console.log("Input vertices and colors:");
	 
	

    //  Configure WebGL
    gl.viewport( 0, 0, canvas.width, canvas.height );
	// Background color to white
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Define shaders to use  
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU
	//
	// color buffer: create, bind, and load
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );
	
	// Associate shader variable for  r,g,b color
	var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );
    
    // vertex buffer: create, bind, load
    var vbuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vbuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    // Associate shader variables for x,y vertices	
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
	
	//HW470: associate shader explode variable ("Loc" variables defined here) 
    thetaLoc = gl.getUniformLocation( program, "theta" );
    colorLoc = gl.getUniformLocation( program, "colorChange" );

    console.log("Data loaded to GPU -- Now call render");

    render();
};


// =============== function render ======================

function render()
{
    // clear the screen 
    gl.clear( gl.COLOR_BUFFER_BIT );

    //variables to hold theta and color fade value while the stationary object is being drawn
    theta = thetaMem;
    colorChange = colorMem;

    //controls color as it fades to white and then back to the original color
    if(colorChange <= 0.1){
        colorFlag = true;
    }
    if(colorChange >= 1.1){
        colorFlag = false;
    }
    if(colorFlag == true){
        colorChange += 0.01;
    }
    if(colorFlag == false){
        colorChange -= 0.01;
    }

    //controls direction of rotation and tesselation
    if(theta <= 0.1){
        thetaFlag = true;
    }
    if(theta >= 3.0){
        thetaFlag = false;
    }
    if(thetaFlag == true){
        theta += 0.01;
    }
    if(thetaFlag == false){
        theta -= 0.01;
    }

    //reassign theta and color fade values so that non-stationary objects can be animated
    thetaMem = theta;
    colorMem = colorChange;

    //HW470: send uniform(s) to vertex shader
	gl.uniform1f( thetaLoc, theta );
	gl.uniform1f( colorLoc, colorChange);

	//HW470: draw the object
	// You will need to change this to create the twisting outer parts effect
	// Hint: you will need more than one draw function call

    //draw function for animated objects
    gl.drawArrays( gl.TRIANGLES,  0, 39);

    //set theta and color fade values to zero so stationary triangle can be drawn
    theta = 0.0;
    colorChange = 0.0;

    //resend uniforms to vertex shader
    gl.uniform1f( thetaLoc, theta );
	gl.uniform1f( colorLoc, colorChange);

    //draws the stationary triangle 
    gl.drawArrays( gl.TRIANGLES, 0 , 3);
	
	//re-render after delay
	setTimeout(function (){requestAnimFrame(render);}, delay);
}

