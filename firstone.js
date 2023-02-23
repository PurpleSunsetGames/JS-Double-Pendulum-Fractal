'use strict';

let canvas = document.getElementById("canvas");
let playButton = document.getElementById("Play");
let resetButton = document.getElementById("ResetTime");
let w = Math.min(window.innerWidth, window.innerHeight);;
let animating = false;
let timeDisplay = document.getElementById("timeDisplay");
let timeSlider = document.getElementById("timeSlider");

let frictionDisplay = document.getElementById("frictionDisplay");
let frictionSlider = document.getElementById("frictionSlider");

let gravityDisplay = document.getElementById("gravityDisplay");
let gravitySlider = document.getElementById("gravitySlider");

let p1StartAngleDisplay = document.getElementById("p1StartAngleDisplay");
let p1StartAngleSlider = document.getElementById("p1StartAngleSlider");

let p1LengthDisplay = document.getElementById("p1LengthDisplay");
let p1LengthSlider = document.getElementById("p1LengthSlider");

let p1MassDisplay = document.getElementById("p1MassDisplay");
let p1MassSlider = document.getElementById("p1MassSlider");

let p1StartVelDisplay = document.getElementById("p1StartVelDisplay");
let p1StartVelSlider = document.getElementById("p1StartVelSlider");

let p2StartAngleDisplay = document.getElementById("p2StartAngleDisplay");
let p2StartAngleSlider = document.getElementById("p2StartAngleSlider");

let p2LengthDisplay = document.getElementById("p2LengthDisplay");
let p2LengthSlider = document.getElementById("p2LengthSlider");

let p2MassDisplay = document.getElementById("p2MassDisplay");
let p2MassSlider = document.getElementById("p2MassSlider");

let p2StartVelDisplay = document.getElementById("p2StartVelDisplay");
let p2StartVelSlider = document.getElementById("p2StartVelSlider");

let xAxisToggle = document.getElementById("xAxisToggle");
let yAxisToggle = document.getElementById("yAxisToggle");

let fragShad = "";
async function getFragShad() {
    fragShad = await fetch("fragmentShader.glsl").then(result=>result.text());
    console.log(fragShad);
    createGl();
}
getFragShad();
let T = {x: 0};

let Offsetx = 1, 
    Offsety = 1;
let Scale = 1;
let YAxisType = 5,
    XAxisType = 1;

let g = {x: 1};
let Friction = {x: frictionSlider.value};

let p1StartAngle = {x: p1StartAngleSlider.value},
    p1StartVel = {x: p1StartVelSlider.value};

let p2StartAngle = {x: p2StartAngleSlider.value},
    p2StartVel = {x: p2StartVelSlider.value};

let Lengs = {x: 2, y: 1};
let Masses = {x: 1, y: 1};

frictionDisplay.innerHTML= "Friction: " + Friction.x;

let gl;

canvas.width = w - 100;
canvas.height = w - 100;

function setOnInput(slider, valueToSet, display, displayString, axisTypeIndicator) {
    slider.oninput = function() {
        if (axisTypeIndicator===XAxisType) {
            valueToSet.x = 0;
            display.innerHTML = displayString + "X";
        }
        else if (axisTypeIndicator===YAxisType) {
            valueToSet.x = 0;
            display.innerHTML = displayString + "Y";
        }
        else {
            valueToSet.x=this.value; 
            display.innerHTML = displayString + this.value;
        }
    };
}
function setOnInputY(slider, valueToSet, display, displayString, axisTypeIndicator) {
    slider.oninput = function() {
        if (axisTypeIndicator===XAxisType) {
            valueToSet.y = 0;
            display.innerHTML = displayString + "X";
        }
        else if (axisTypeIndicator===YAxisType) {
            valueToSet.y = 0;
            display.innerHTML = displayString + "Y";
        }
        else {
            valueToSet.y=this.value; 
            display.innerHTML = displayString + this.value;
        }
    };
}

let Labels = [
    "Pendulum 1 Start Angle",
    "Pendulum 1 length",
    "Pendulum 1 mass",
    "Pendulum 1 Start Vel.",
    "Pendulum 2 Start Angle",
    "Pendulum 2 length",
    "Pendulum 2 mass",
    "Pendulum 2 Start Vel.",
    "Gravity",
    "Time",
    "Friction",
];

setOnInput(p1StartAngleSlider, p1StartAngle, p1StartAngleDisplay, "Pendulum 1 Start Angle: ", 1);
setOnInput(p1LengthSlider, Lengs, p1LengthDisplay, "Pendulum 1 length: ", 2);
setOnInput(p1MassSlider, Masses, p1MassDisplay, "Pendulum 1 mass: ", 3);
setOnInput(p1StartVelSlider, p1StartVel, p1StartVelDisplay, "Pendulum 1 Start Vel.: ", 4);
setOnInput(p2StartAngleSlider, p2StartAngle, p2StartAngleDisplay, "Pendulum 2 Start Angle: ", 5);
setOnInputY(p2LengthSlider, Lengs, p2LengthDisplay, "Pendulum 2 length: ", 6);
setOnInputY(p2MassSlider, Masses, p2MassDisplay, "Pendulum 2 mass: ", 7);
setOnInput(p2StartVelSlider, p2StartVel, p2StartVelDisplay, "Pendulum 2 Start Vel.: ", 8);
setOnInput(gravitySlider, g, gravityDisplay, "Gravity: ", 9);
setOnInput(timeSlider, T, timeDisplay, "Time: ", 10);
setOnInput(frictionSlider, Friction, frictionDisplay, "Friction: ", 11);

xAxisToggle.addEventListener("click",
    function(){
        if(XAxisType<10){
            XAxisType++;
        }
        else{
            XAxisType = 1;
        }
        this.innerHTML = "X Axis: " + Labels[XAxisType-1];
    }
);

yAxisToggle.addEventListener("click",
    function(){
        if(YAxisType<10){
            YAxisType++;
        }
        else{
            YAxisType = 1;
        }
        this.innerHTML = "Y Axis: " + Labels[YAxisType-1];
    }
);

playButton.addEventListener("click",
    function(){animating=!animating;}
);

let drag = false;
let mouseDown = false;
let xMouse, yMouse;
let draggedXMouse=0,
    draggedYMouse=0;
canvas.addEventListener("mousemove", (e)=>{
    xMouse = e.clientX;
    yMouse = e.clientY;
    if(mouseDown){
        Offsetx += (draggedXMouse - xMouse) * (Scale / 100);
        Offsety -= (draggedYMouse - yMouse) * (Scale / 100);
    }
    draggedXMouse = xMouse;
    draggedYMouse = yMouse;
})

canvas.addEventListener('mousedown', 
() => {drag = false; mouseDown = true}
);

canvas.addEventListener('mouseup', 
() => {drag = false; mouseDown = false}
);

canvas.addEventListener("wheel", (e) => Scale = Math.max(Scale + (e.deltaY / (1000*Scale))), 0.00001))

function createGl(){
    gl = canvas.getContext("webgl2");

    if (!gl) {
        alert("Your browser does not support WebGL");
    }

    gl.clearColor(0, 0.6, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const shaders = {
        vs:`#version 300 es
        precision highp float;

        in vec2 vertPosition;
        out vec3 fragColor;
        void main() {
            fragColor = vec3(vertPosition, 0.0);
            gl_Position = vec4(vertPosition, 0, 1);
        }`,

        fs:fragShad
    };

    let vertexShader = gl.createShader(gl.VERTEX_SHADER);
    let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vertexShader, shaders.vs);
    gl.shaderSource(fragmentShader, shaders.fs);

    gl.compileShader(vertexShader);
    gl.compileShader(fragmentShader);

    let program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);

    const vertexAttributes = {
        position: {
            numberOfComponents: 2, 
            data: new Float32Array([
                -1.0, -1.0, 
                -1.0,  1.0, 
                1.0,  1.0,
                
                -1.0, -1.0, 
                1.0, -1.0, 
                1.0,  1.0])
        },
        color: { 
            numberOfComponents: 3, 
            data: new Float32Array([
                1.0, 0.0, 0.0, 
                0.0, 1.0, 0.0, 
                0.0, 0.0, 1.0,
                1.0, 0.0, 0.0, 
                0.0, 1.0, 0.0, 
                0.0, 0.0, 1.0])
        }
    };
    // Creating buffers
    let vertexBufferObjectPosition = gl.createBuffer();

    // Binding created buffer for vertexAttributes.position to gl object
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObjectPosition);
    gl.bufferData(gl.ARRAY_BUFFER, vertexAttributes.position.data, gl.STATIC_DRAW);
    // Getting the location in memory for the variable stored in line 2 of the vertex shader
    let positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
    gl.vertexAttribPointer(positionAttribLocation, vertexAttributes.position.numberOfComponents, gl.FLOAT, gl.FALSE, 0, 0);
    gl.enableVertexAttribArray(positionAttribLocation);

    // Uniforms
    let timeAttribLocation    = gl.getUniformLocation(program, 'TimeIn');
    let offsetAttribLocation  = gl.getUniformLocation(program, 'Offset');
    let scaleAttribLocation   = gl.getUniformLocation(program, 'Scale');
    let xAxisTypeLocation     = gl.getUniformLocation(program, "XAxisType");
    let yAxisTypeLocation     = gl.getUniformLocation(program, "YAxisType");

    let lengthsAttribLocation = gl.getUniformLocation(program, 'Lengs');
    let massesAttribLocation  = gl.getUniformLocation(program, 'Masses');
    let gravityAttribLocation = gl.getUniformLocation(program, 'G');
    let frictionLocation      = gl.getUniformLocation(program, "Friction"); 

    let p1StartAngleLocation  = gl.getUniformLocation(program, "P1StartAngle");
    let p2StartAngleLocation  = gl.getUniformLocation(program, "P2StartAngle");

    let p1StartVelLocation    = gl.getUniformLocation(program, "P1StartVel");
    let p2StartVelLocation    = gl.getUniformLocation(program, "P2StartVel");

    gl.useProgram(program);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    const message = gl.getShaderInfoLog(fragmentShader);

    if (message.length > 0) {
        console.log(message);
    }
    animTime();
    function animTime() {
        if(animating){
            if (T.x > 300){
                T.x = 0;
            }
            T.x++;
        }
        timeSlider.value=T.x;
        timeDisplay.innerHTML = "Time: " + T.x;
        gl.uniform1f(timeAttribLocation, T.x);
        gl.uniform2f(offsetAttribLocation, Offsetx, Offsety);
        gl.uniform1f(scaleAttribLocation, Scale);
        gl.uniform1f(xAxisTypeLocation, XAxisType);
        gl.uniform1f(yAxisTypeLocation, YAxisType);
        gl.uniform2f(lengthsAttribLocation, Lengs.x, Lengs.y);
        gl.uniform2f(massesAttribLocation, Masses.x, Masses.y);
        gl.uniform1f(gravityAttribLocation, g.x);
        gl.uniform1f(frictionLocation, Friction.x);

        gl.uniform1f(p1StartAngleLocation, p1StartAngle.x);
        gl.uniform1f(p2StartAngleLocation, p2StartAngle.x);

        gl.uniform1f(p1StartVelLocation, p1StartVel.x);
        gl.uniform1f(p2StartVelLocation, p2StartVel.x);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
        setTimeout(requestAnimationFrame(animTime), 20);
    }
}
resetButton.addEventListener("click",
    function(){T["x"]=0;}
);

