
var canvas;
var gl;
var program;

var projectionMatrix; 
var modelViewMatrix;

var instanceMatrix;

var modelViewMatrixLoc;
var colorLoc;

var vertices = [

    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5, -0.5, -0.5, 1.0 )
];

var upperTorsoId = 11;
var middleTorsoId = 12;
var torsoId = 0;
var headId  = 1;
var head1Id = 1;
var head2Id = 10;
var leftArmId = 2;
var leftGloveId = 3;
var rightArmId = 4;
var rightGloveId = 5;
var leftUpperLegId = 6;
var leftLowerLegId = 7;
var rightUpperLegId = 8;
var rightLowerLegId = 9;


var torsoHeight = 5.0;
var torsoWidth = 2.0;
var upperArmHeight = 2.5;
var lowerArmHeight = 1.5;
var upperArmWidth  = 0.5;
var lowerArmWidth  = 0.5;
var upperLegWidth  = 0.5;
var lowerLegWidth  = 0.5;
var lowerLegHeight = 2.0;
var upperLegHeight = 3.0;
var headHeight = 1.5;
var headWidth = 0.8;

var torsoColor = vec4(1.0, 0.5, 0.0, 1.0);
var headColor = vec4(0.5, 0.0, 0.5, 1.0);
var upperArmColor = vec4(1.0, 0.5, 0.0, 1.0);
var lowerArmColor = vec4(0.75, 0.75, 0.80, 1.0);
var upperLegColor = vec4(1.0, 0.5, 0.0, 1.0);
var lowerLegColor = vec4(0.75, 0.75, 0.80, 1.0); 
var jeanColor = vec4(0.25,0.5,1.0,1.0);

var numNodes = 13; //add two for extra torso parts
var numAngles = 11;
var angle = 0;

var theta = [0, 0, 45, 0, -45, 0, 180, 0, 180, 0, 0];

var numVertices = 24;

var stack = [];

var figure = [];

for( var i=0; i<numNodes; i++) figure[i] = createNode(null, null, null, null);

var vBuffer;
var modelViewLoc;

var pointsArray = [];

var partyTime = false;
var spin = 0.0;
var jump = -2.5;
var midair = true;
var cAngle = 0.0;
var flappy = 180.0;
var flappyArms = 45.0;
var keepFlapping = true;

//-------------------------------------------

function scale4(a, b, c) {
   var result = mat4();
   result[0][0] = a;
   result[1][1] = b;
   result[2][2] = c;
   return result;
}

//--------------------------------------------


function createNode(transform, render, sibling, child){
    var node = {
    transform: transform,
    render: render,
    sibling: sibling,
    child: child,
    }
    return node;
}


function initNodes(Id) {

    var m = mat4();
    
    switch(Id) {

    case upperTorsoId:

    if(partyTime){
        m = mult(m, rotate(spin*5.0, 0, 1, 0));
    }
    else{
        m = rotate(theta[torsoId], 0, 1, 0 );
    }


    figure[upperTorsoId] = createNode( m, upperTorso, headId, null ); 
    break;


    case middleTorsoId:
    
    if(partyTime){
        m = mult(m, rotate(-spin*5.0, 0, 1, 0));
    }
    else{
        m = rotate(theta[torsoId], 0, 1, 0 );
    }

    figure[middleTorsoId] = createNode( m, middleTorso, upperTorsoId, null ); 
    break;
    

    case torsoId:
    
  
    
    if(partyTime){

        console.log("spin: " , spin);
        console.log("jump:" , jump);
        console.log("cAngle: " , cAngle);
        theta[torsoId] = spin;
        m = rotate(theta[torsoId], 0, 1, 0 );
        //m = mult(m , translate(0.0,0.0,jump));
        m = mult(m , translate(Math.cos(cAngle)*2,Math.sin(cAngle)*2+jump,0.0));
        m = mult(m , scale4(0.75, 0.75, 1.0));   

    }
    else {
        theta[torsoId] = 0;
        m = rotate(theta[torsoId], 0, 1, 0 );
        m = mult(m , translate(0.0,-2.5,0.0));
        m = mult(m , scale4(0.75, 0.75, 1.0));
    
    }

    figure[torsoId] = createNode( m, torso, null, middleTorsoId );
    break;

    case headId: 
    case head1Id: 
    case head2Id:
    
	//DCH Comment: I think there is an error in the head
	// I have commented out the code that is not needed. We want the head to rotate about a point in base, not center
	
    
	m = translate(0.0, torsoHeight, 0.0);
    if(partyTime){
        //m = mult(m, rotate(spin*10.0, 0, 1, 0));
        m = mult(m, rotate(spin*.5, 0, 1, 0));
	    m = mult(m, rotate(spin*.5, 1, 0, 0));
    }
    else{
	    m = mult(m, rotate(theta[head1Id], 1, 0, 0))
	    m = mult(m, rotate(theta[head2Id], 0, 1, 0));
    }

    figure[headId] = createNode( m, head, leftArmId, null);
    break;
    
    
    case leftArmId:
    
    m = translate(-(torsoWidth+upperArmWidth), 0.9*torsoHeight, 0.0);
	//m = mult(m, rotate(theta[leftArmId], 1, 0, 0));

    if(partyTime){
        m = mult(m, rotate(flappy-135, 0 , 0, 1));
        m = mult(m, rotate(spin*20.0, 0 , 1.0, 0));
    }
    else{
        m = mult(m, rotate(theta[leftArmId], 0, 0, 1));
    }
    figure[leftArmId] = createNode( m, leftArm, rightArmId, leftGloveId );
    break;

    case rightArmId:
    
    m = translate(torsoWidth+upperArmWidth, 0.9*torsoHeight, 0.0);
	if(partyTime){
        m = mult(m, rotate(-flappy+135, 0 , 0, 1));
        m = mult(m, rotate(-spin*20.0, 0 , 1.0, 0));
    }
    else{
        m = mult(m, rotate(theta[rightArmId], 0, 0, 1));
    }
    figure[rightArmId] = createNode( m, rightArm, leftUpperLegId, rightGloveId );
    break;
    
    case leftUpperLegId:
    
    m = translate(-(torsoWidth+upperLegWidth), 0.1*upperLegHeight, 0.0);

    if(partyTime){
        m = mult(m, rotate(-flappy, 1, 0, 0));
    }
    else{
        m = mult(m, rotate(theta[leftUpperLegId], 1, 0, 0));
    }

	
    figure[leftUpperLegId] = createNode( m, leftUpperLeg, rightUpperLegId, leftLowerLegId );
    break;

    case rightUpperLegId:
    
    m = translate(torsoWidth+upperLegWidth, 0.1*upperLegHeight, 0.0);
    if(partyTime){
        m = mult(m, rotate(flappy, 1, 0, 0));
    }
    else{
        m = mult(m, rotate(theta[rightUpperLegId], 1, 0, 0));
    }
	
    figure[rightUpperLegId] = createNode( m, rightUpperLeg, null, rightLowerLegId );
    break;
    
    case leftGloveId:

    m = translate(0.0, upperArmHeight, 0.0);
    m = mult(m, rotate(theta[leftGloveId], 1, 0, 0));
    figure[leftGloveId] = createNode( m, leftLowerArm, null, null );
    break;
    
    case rightGloveId:

    m = translate(0.0, upperArmHeight, 0.0);
    m = mult(m, rotate(theta[rightGloveId], 1, 0, 0));
    figure[rightGloveId] = createNode( m, rightLowerArm, null, null );
    break;
    
    case leftLowerLegId:

    m = translate(0.0, upperLegHeight, 0.0);
    m = mult(m, rotate(theta[leftLowerLegId], 1, 0, 0));
    figure[leftLowerLegId] = createNode( m, leftLowerLeg, null, null );
    break;
    
    case rightLowerLegId:

    m = translate(0.0, upperLegHeight, 0.0);
    m = mult(m, rotate(theta[rightLowerLegId], 1, 0, 0));
    figure[rightLowerLegId] = createNode( m, rightLowerLeg, null, null );
    break;
    
    }

}

function traverse(Id) {
   
     
   if(Id == null) return;  
   stack.push(modelViewMatrix);
   modelViewMatrix = mult(modelViewMatrix, figure[Id].transform);
   figure[Id].render();
   if(figure[Id].child != null) traverse(figure[Id].child); 
    modelViewMatrix = stack.pop();
   if(figure[Id].sibling != null) traverse(figure[Id].sibling); 
}

function torso() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*torsoHeight-2.0, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4( torsoHeight*2.0, torsoWidth*0.75, torsoHeight*0.5));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	gl.uniform4fv(colorLoc, flatten(jeanColor) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function middleTorso() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*torsoHeight-0.5, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4( torsoHeight*1.5, torsoWidth*0.75, torsoHeight*0.5));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	gl.uniform4fv(colorLoc, flatten(vec4(1.0,0.0,0.0,1.0)) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function upperTorso() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*torsoHeight+1.0, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4( torsoHeight, torsoWidth*0.75, torsoHeight*0.5));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	gl.uniform4fv(colorLoc, flatten(torsoColor) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function head() {
   
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * headHeight-0.5, 0.0 ));
	instanceMatrix = mult(instanceMatrix, scale4(headWidth+1.0, headHeight+0.25, headWidth+1.0) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	gl.uniform4fv(colorLoc, flatten(headColor) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(upperArmWidth, upperArmHeight, upperArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	gl.uniform4fv(colorLoc, flatten(upperArmColor) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftLowerArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(lowerArmWidth+0.5, lowerArmHeight, lowerArmWidth+0.5) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	gl.uniform4fv(colorLoc, flatten(lowerArmColor) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(upperArmWidth, upperArmHeight, upperArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	gl.uniform4fv(colorLoc, flatten(upperArmColor) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightLowerArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(lowerArmWidth+0.5, lowerArmHeight, lowerArmWidth+0.5) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	gl.uniform4fv(colorLoc, flatten(lowerArmColor) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function  leftUpperLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(upperLegWidth+0.1, upperLegHeight, upperLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	gl.uniform4fv(colorLoc, flatten(upperLegColor) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftLowerLeg() {
    
    instanceMatrix = mult(modelViewMatrix, translate( 0.0, 0.5 * lowerLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(lowerLegWidth+0.25, lowerLegHeight, lowerLegWidth+0.25) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	gl.uniform4fv(colorLoc, flatten(lowerLegColor) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightUpperLeg() {
    
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(upperLegWidth+0.1, upperLegHeight, upperLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	gl.uniform4fv(colorLoc, flatten(upperLegColor) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightLowerLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(lowerLegWidth+0.25, lowerLegHeight, lowerLegWidth+0.25) )
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	gl.uniform4fv(colorLoc, flatten(lowerLegColor) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function groundPlane(){


    instanceMatrix = mult(modelViewMatrix, translate(0.0, -7.0, -5.0));
    instanceMatrix = mult(instanceMatrix, scale4(24.0, 12.0, 0.0));
    //instanceMatrix = mult(instanceMatrixFloor,rotate(180.0,0.0,instanceMatrixFloor[1][3],0.0));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    gl.uniform4fv(colorLoc, flatten(vec4(0.0,1.0,0.0,1.0)));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);

}

function quad(a, b, c, d) {
     pointsArray.push(vertices[a]); 
     pointsArray.push(vertices[b]); 
     pointsArray.push(vertices[c]);     
     pointsArray.push(vertices[d]);    
}


function cube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}


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
    program = initShaders( gl, "vertex-shader", "fragment-shader");
    
    gl.useProgram( program);

    instanceMatrix = mat4();
    
    projectionMatrix = ortho(-10.0,10.0,-10.0, 10.0,-10.0,10.0);
    modelViewMatrix = mat4();

        
	modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
		
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "projectionMatrix"), false, flatten(projectionMatrix) );
    
    	
	colorLoc = gl.getUniformLocation(program, "color");
	gl.uniform4fv(colorLoc, flatten(torsoColor) );
    
    cube();
        
    vBuffer = gl.createBuffer();
        
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    

    document.getElementById("reset").onclick = function() {
        partyTime = false; 
        
        initNodes(torsoId);
        initNodes(upperTorsoId);
        initNodes(middleTorsoId);
        initNodes(rightUpperLegId);
        initNodes(leftUpperLegId);
        initNodes(leftArmId);
        initNodes(rightArmId);
        initNodes(headId);
    };
    document.getElementById("stop").onclick = function() {
        partyTime = false; 
        
    };
    document.getElementById("animate").onclick = function() {
        //spin = 0.0;
        //flappy = 180.0
        //jump = -2.5;
        partyTime = true;
        //initNodes(torsoId);
    };


    for(i=0; i<numNodes; i++) initNodes(i);

    
    render();
}


var render = function() {

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
        if(partyTime){
            spin += 1.0;
            cAngle += 0.1;
            if(jump < 2.5 && midair){
                jump += 0.1;
            }
            else{
                midair = false;
                jump -= 0.1;
            }
            if(jump < -3.6){
                midair = true;
            }

            if(flappy < 180.5 && keepFlapping){
                flappy += 1.0;
            }
            else{
                keepFlapping = false;
                flappy -= 1.0;
            }
            if(jump < -1.0){
                keepFlapping = true;
            }


            initNodes(torsoId);
            initNodes(upperTorsoId);
            initNodes(middleTorsoId);
            initNodes(rightUpperLegId);
            initNodes(leftUpperLegId);
            initNodes(leftArmId);
            initNodes(rightArmId);
            initNodes(headId);
        }

        traverse(torsoId);

        groundPlane();

        requestAnimFrame(render);
}
