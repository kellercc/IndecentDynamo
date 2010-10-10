var KeyCodePageUp = 33;
var KeyCodePageDown = 34;
var KeyCodeLeftArrow = 37;
var KeyCodeRightArrow = 39;
var KeyCodeUpArrow = 38;
var KeyCodeDownArrow = 40;
var KeyCodeSpacebar = 32;

var gl;
var drawCoordSystem;
function initGL(canvas){
    try {
        gl = canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } 
    catch (e) {
    }
    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
    drawCoordSystem = gl.LINE_STRIP;
}


function getShader(gl, id){
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
        return null;
    }
    
    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
        if (k.nodeType == 3) {
            str += k.textContent;
        }
        k = k.nextSibling;
    }
    
    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    }
    else 
        if (shaderScript.type == "x-shader/x-vertex") {
            shader = gl.createShader(gl.VERTEX_SHADER);
        }
        else {
            return null;
        }
    
    gl.shaderSource(shader, str);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }
    
    return shader;
}


var shaderProgram;
function initShaders(){
    var fragmentShader = getShader(gl, "shader-fs");
    var vertexShader = getShader(gl, "shader-vs");
    
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }
    
    gl.useProgram(shaderProgram);
    
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
    
    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
}


var mvMatrix;
var mvMatrixStack = [];

function mvPushMatrix(m){
    if (m) {
        mvMatrixStack.push(m.dup());
        mvMatrix = m.dup();
    }
    else {
        mvMatrixStack.push(mvMatrix.dup());
    }
}

function mvPopMatrix(){
    if (mvMatrixStack.length == 0) {
        throw "Invalid popMatrix!";
    }
    mvMatrix = mvMatrixStack.pop();
    return mvMatrix;
}

function loadIdentity(){
    mvMatrix = Matrix.I(4);
}


function multMatrix(m){
    mvMatrix = mvMatrix.x(m);
}


function mvTranslate(v){
    var m = Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4();
    multMatrix(m);
}

function mvRotate(ang, v){
    var arad = ang * Math.PI / 180.0;
    var m = Matrix.Rotation(arad, $V([v[0], v[1], v[2]])).ensure4x4();
    multMatrix(m);
}

var pMatrix;
function perspective(fovy, aspect, znear, zfar){
    pMatrix = makePerspective(fovy, aspect, znear, zfar);
}


function setMatrixUniforms(){
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, new Float32Array(pMatrix.flatten()));
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, new Float32Array(mvMatrix.flatten()));
}



var greatCirclePositionBuffer;
var lat30CirclePositionBuffer;
var lat60CirclePositionBuffer;
var radius = 1;
function initBuffers(){
    circlePoints = 72;
    greatCirclePositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, greatCirclePositionBuffer);
    var vertices = makeCircle(radius, circlePoints);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    greatCirclePositionBuffer.itemSize = 3;
    greatCirclePositionBuffer.numItems = vertices.length / 3;
    
    lat30CirclePositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, lat30CirclePositionBuffer);
    vertices = makeCircle(Math.cos(Math.PI / 6) * radius, circlePoints);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    lat30CirclePositionBuffer.itemSize = 3;
    lat30CirclePositionBuffer.numItems = vertices.length / 3;
    
    lat60CirclePositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, lat60CirclePositionBuffer);
    vertices = makeCircle(Math.cos(Math.PI / 3) * radius, circlePoints);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    lat60CirclePositionBuffer.itemSize = 3;
    lat60CirclePositionBuffer.numItems = vertices.length / 3;
    
    pointBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pointBuffer);
    vertices = [0, 0, 0];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    pointBuffer.itemSize = 3;
    pointBuffer.numItems = vertices.length / 3;
    
}

function makeCircle(radius, points){
    var vertices = [];
    for (theta = 0; theta < 2 * Math.PI; theta += Math.PI / points * 2) {
        x = Math.cos(theta) * radius;
        y = Math.sin(theta) * radius;
        vertices.push(x);
        vertices.push(y);
        vertices.push(0.0);
    }
    vertices.push(1.0 * radius);
    vertices.push(0.0);
    vertices.push(0.0);
    return vertices;
}

var currentlyPressedKeys = Object();

function handleKeyDown(event){
    currentlyPressedKeys[event.keyCode] = true;
    
    if (String.fromCharCode(event.keyCode) == "F") {
        filter += 1;
        if (filter == 3) {
            filter = 0;
        }
    }
}

function handleKeyUp(event){
    currentlyPressedKeys[event.keyCode] = false;
	if(event.keyCode == KeyCodeSpacebar) {
		spaceToggle = false;
	}
}

var lrView = 0;
var udView = 0;
var zoom = -0.7;
var spaceToggle = false;
function handleKeys(){
    if (currentlyPressedKeys[KeyCodePageUp]) {
        if (zoom < .85) {
            zoom += .01;
        }
    }
    if (currentlyPressedKeys[KeyCodePageDown]) {
        if (zoom > -1) {
            zoom -= .01;
        }
    }
    if (currentlyPressedKeys[KeyCodeLeftArrow]) {
        lrView += 1;
        if (lrView == 360) {
            lrView = 0;
        }
    }
    if (currentlyPressedKeys[KeyCodeRightArrow]) {
        lrView -= 1;
        if (lrView == -1) {
            lrView = 359;
        }
    }
    if (currentlyPressedKeys[KeyCodeUpArrow]) {
        if (udView < 90) {
            udView += 1;
        }
    }
    if (currentlyPressedKeys[KeyCodeDownArrow]) {
        if (udView > -90) {
            udView -= 1;
        }
    }
    if (currentlyPressedKeys[KeyCodeSpacebar] && spaceToggle == false) {
        if (drawCoordSystem == gl.LINE_STRIP) {
            drawCoordSystem = gl.POINTS;
			spaceToggle = true;
        }
        else 
            if (drawCoordSystem == gl.POINTS) {
                drawCoordSystem = -1;
				spaceToggle = true;
            }
            else 
                if (drawCoordSystem == -1) {
                    drawCoordSystem = gl.LINE_STRIP;
					spaceToggle = true;
                }
    }
}

function tick(){
    handleKeys();
    drawScene();
    updateText();
    //animate();
}

function updateText(){
    var info = document.getElementById("info");
    info.innerHTML = "Centered at: " + (lrView / 15).toFixed(2) + "h RA, " + udView + "&deg; dec";
    info.innerHTML += "<br>Zoom: " + zoom.toFixed(2);
}

function drawScene(){
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 1000.0);
    loadIdentity();
    
    mvTranslate([0, 0, 0]);
    
    mvPushMatrix();
    mvTranslate([0, 0, zoom]);
    mvRotate(-udView, [1, 0, 0]);
    mvRotate(-lrView, [0, 1, 0]);
    if (drawCoordSystem != -1) {
        drawLongitudes();
        drawLatitudes();
    }
    drawStars();
    mvPopMatrix();
}

function drawLongitudes(){
    mvPushMatrix();
    // draw longitudes
    for (i = 0; i < 6; i++) {
        gl.bindBuffer(gl.ARRAY_BUFFER, greatCirclePositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, greatCirclePositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
        setMatrixUniforms();
        gl.drawArrays(drawCoordSystem, 0, greatCirclePositionBuffer.numItems);
        mvRotate(30, [0, 1, 0]);
    }
    mvPopMatrix();
}

function drawLatitudes(){

    mvPushMatrix();
    // draw equator
    mvRotate(90, [1, 0, 0]);
    gl.bindBuffer(gl.ARRAY_BUFFER, greatCirclePositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, greatCirclePositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    setMatrixUniforms();
    gl.drawArrays(drawCoordSystem, 0, greatCirclePositionBuffer.numItems);
    
    // draw N/S 30
    translate30 = Math.sin(Math.PI / 6) * radius;
    mvTranslate([0, 0, -translate30]);
    gl.bindBuffer(gl.ARRAY_BUFFER, lat30CirclePositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, lat30CirclePositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    setMatrixUniforms();
    gl.drawArrays(drawCoordSystem, 0, lat30CirclePositionBuffer.numItems);
    mvTranslate([0, 0, 2 * translate30]);
    gl.bindBuffer(gl.ARRAY_BUFFER, lat30CirclePositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, lat30CirclePositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    setMatrixUniforms();
    gl.drawArrays(drawCoordSystem, 0, lat30CirclePositionBuffer.numItems);
    mvTranslate([0, 0, -translate30]);
    
    // draw N/S 60
    translate60 = -Math.sin(Math.PI / 3) * radius;
    mvTranslate([0, 0, -translate60]);
    gl.bindBuffer(gl.ARRAY_BUFFER, lat60CirclePositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, lat60CirclePositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    setMatrixUniforms();
    gl.drawArrays(drawCoordSystem, 0, lat60CirclePositionBuffer.numItems);
    mvTranslate([0, 0, 2 * translate60]);
    gl.bindBuffer(gl.ARRAY_BUFFER, lat60CirclePositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, lat60CirclePositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    setMatrixUniforms();
    gl.drawArrays(drawCoordSystem, 0, lat60CirclePositionBuffer.numItems);
    mvTranslate([0, 0, -translate60]);
    
    mvPopMatrix();
}

function drawStars(){
    for(i = 0; i < stars.length; i++) {
	    mvPushMatrix();

	    ra = stars[i].ra;
	    dec = stars[i].dec;
	    
	    mvRotate(ra * 15.0, [0, 1, 0]);
	    mvRotate(dec, [1, 0, 0]);
	    mvTranslate([0, 0, -1]);
	    
	    gl.bindBuffer(gl.ARRAY_BUFFER, pointBuffer);
	    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, pointBuffer.itemSize, gl.FLOAT, false, 0, 0);
	    setMatrixUniforms();
	    gl.drawArrays(gl.POINTS, 0, pointBuffer.numItems);
	    
	    mvPopMatrix();
     }
}

var stars;
function webGLStart(){

    stars = getStars();

    var canvas = document.getElementById("lesson01-canvas");
    initGL(canvas);
    initShaders();
    initBuffers();
    
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
    gl.clearDepth(1.0);
    
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    
    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;
    
    setInterval(tick, 15);
}
