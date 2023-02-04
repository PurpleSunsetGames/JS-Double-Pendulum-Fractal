'use strict';
var canvas = document.getElementById("canvas");
let w = window.innerWidth;
let h = window.innerHeight;

canvas.width = w - 40;
canvas.height = w - 40;

window.addEventListener("resize", 
    function fw(){
        w = window.innerWidth;
        h = window.innerHeight;

        canvas.width = w - 40;
        canvas.height = w - 40;

        gl = canvas.getContext("webgl2");
        gl.clearColor(0, 0.6, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.compileShader(vertexShader);
        gl.compileShader(fragmentShader);
        program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);

        gl.linkProgram(program);
    }
);

var gl = canvas.getContext("webgl2");

if (!gl) {
    alert("Your browser does not support WebGL");
}

gl.clearColor(0, 0.6, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

const shaders = {
    vs:`#version 300 es
    in vec2 vertPosition;
    out vec3 fragColor;
    uniform float Time;
    void main() {
        fragColor = vec3(vertPosition, 0.0);
        gl_Position = vec4(vertPosition, 0, 1);
    }`,

    fs:`#version 300 es

    precision highp float;

    in vec3 fragColor;
    uniform float Time;

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
        vec2 fragCoord = vec2(fragColor.xy);
        float PI = 3.1415;
        vec4 nz = vec4(PI * (fragCoord.x - 1.), PI * (fragCoord.y - 1.), 0.0, 0.0);
        for (float i=0.; i<Time; i++){
            nz = Iterat(nz, vec2(1.,1.), vec2(1.,1.));
        }
        outColor = vec4(abs(sin(nz.x/2.)), abs(sin(nz.y/2.)), abs(cos(nz.z/2.)), 1.0);
    }`
};

var vertexShader = gl.createShader(gl.VERTEX_SHADER);
var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

gl.shaderSource(vertexShader, shaders.vs);
gl.shaderSource(fragmentShader, shaders.fs);

gl.compileShader(vertexShader);
gl.compileShader(fragmentShader);

var program = gl.createProgram();

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
let vertexBufferObjectColor = gl.createBuffer();
let uniformTimeBuffer = gl.createBuffer();

// Binding created buffer for vertexAttributes.position to gl object
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObjectPosition);
gl.bufferData(gl.ARRAY_BUFFER, vertexAttributes.position.data, gl.STATIC_DRAW);
// Getting the location in memory for the variable stored in line 2 of the vertex shader
let positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');

gl.vertexAttribPointer(positionAttribLocation, vertexAttributes.position.numberOfComponents, gl.FLOAT, gl.FALSE, 0, 0);
gl.enableVertexAttribArray(positionAttribLocation);

gl.bindBuffer(gl.ARRAY_BUFFER, uniformTimeBuffer);

let timeAttribLocation = gl.getUniformLocation(program, 'Time');

gl.useProgram(program);
gl.drawArrays(gl.TRIANGLES, 0, 6);
let T = 1;
animTime();
function animTime() {
    if (T > 300){
        T = 0;
    }
    T++;
    gl.uniform1f(timeAttribLocation, T);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    console.log(T);
    requestAnimationFrame(animTime);
}
const message = gl.getShaderInfoLog(fragmentShader);

if (message.length > 0) {
  console.log(message);
}
