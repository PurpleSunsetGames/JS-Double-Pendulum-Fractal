'use strict';
let canvas = document.getElementById("canvas");
let playButton = document.getElementById("Play");
let w = Math.min(window.innerWidth, window.innerHeight);;
let animating = true;

let T = 1;
let Offsetx = 1, 
    Offsety = 1;
let Scale = 1;
let gl;

canvas.width = w - 100;
canvas.height = w - 100;

window.addEventListener("resize", 
    function fw(){
        w = Math.min(window.innerWidth, window.innerHeight);

        canvas.width = w - 100;
        canvas.height = w - 100;
        canvas = document.getElementById("canvas");
        createGl();
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

canvas.addEventListener("wheel", (e) => Scale = Math.max(Scale * (1 + (e.deltaY / 100)), 0.001))

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
        uniform float Time;
        uniform vec2 Offset;
        uniform float Scale;
        void main() {
            fragColor = vec3(vertPosition, 0.0);
            gl_Position = vec4(vertPosition, 0, 1);
        }`,

        fs:`#version 300 es
        precision highp float;

        in vec3 fragColor;
        uniform float Time;
        uniform vec2 Offset;
        uniform float Scale;

        out vec4 outColor;

        vec2 Lengs = vec2(1., 1.);
        vec2 Masses = vec2(1., 1.);
        float Timestep = .05;
        float Friction = .998;
        float g = 1.0;
        
        vec4 Iterat(vec4 zi, vec2 lengs, vec2 masses) {
            float theta1 = zi.x;
            float theta2 = zi.y;
            float w1 = zi.z;
            float w2 = zi.w;
            vec2 a = vec2((lengs.y / lengs.x) * (masses.y / (masses.x + masses.y)) * cos(theta1 - theta2),
                        (lengs.x / lengs.y) * cos(theta1 - theta2));
            vec2 f = vec2(-(lengs.y / lengs.x) * (masses.y / (masses.x + masses.y)) * (w2*w2) * sin(theta1 - theta2) - ((g / lengs.x) * sin(theta1)),
                        (lengs.y / lengs.y) * (w1*w1) * sin(theta1 - theta2) - ((g/lengs.y) * sin(theta2)));
        
            float g1 = (1.*f.x - (a.x * f.y)) / (1. - (a.x * a.y));
            float g2 = (-(a.y * f.x) + f.y) / (1. - (a.x * a.y));
        
            vec4 endz = vec4(zi.x + Timestep * zi.z, zi.y + Timestep * zi.w, Friction * (zi.z + Timestep*g1), Friction * (zi.w + Timestep*g2));
            return endz;
        }
        void main()
        {
            vec2 fragCoord = vec2(Scale*fragColor.xy) + Offset;
            float PI = 3.1415;
            vec4 nz = vec4(PI * (fragCoord.x - 1.), PI * (fragCoord.y - 1.), 0.0, 0.0);
            for (float i=0.; i<Time; i++){
                nz = Iterat(nz, vec2(1.,1.), vec2(1.,1.));
            }
            outColor = vec4(abs(sin(nz.x/2.)), abs(sin(nz.y/2.)), abs(cos(nz.z/2.)), 1.0);
        }`
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


    let uniformTimeBuffer = gl.createBuffer();
    let uniformOffsetBuffer = gl.createBuffer();
    let uniformScaleBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, uniformTimeBuffer);
    let timeAttribLocation = gl.getUniformLocation(program, 'Time');

    gl.bindBuffer(gl.ARRAY_BUFFER, uniformOffsetBuffer);
    let offsetAttribLocation = gl.getUniformLocation(program, 'Offset');

    gl.bindBuffer(gl.ARRAY_BUFFER, uniformScaleBuffer);
    let scaleAttribLocation = gl.getUniformLocation(program, 'Scale');

    gl.useProgram(program);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    animTime();
    function animTime() {
        if(animating){
            if (T > 300){
                T = 0;
            }
            T++;
            gl.uniform1f(timeAttribLocation, T);
        }
        gl.uniform2f(offsetAttribLocation, Offsetx, Offsety);
        gl.uniform1f(scaleAttribLocation, Scale);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        setTimeout(requestAnimationFrame(animTime), 20);
    }
}
createGl();
