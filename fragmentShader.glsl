#version 300 es
precision highp float;

in vec3 fragColor;
uniform float Time;
uniform vec2 Offset;
uniform float Scale;
uniform float XAxisType;
uniform float YAxisType;
uniform vec2 Lengs;
uniform vec2 Masses;
uniform float g;

out vec4 outColor;

float Timestep = .05;
float Friction = .998;

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
void main(){
    vec2 fragCoord = vec2(Scale*fragColor.xy) + Offset;
    float leng1 = Lengs.x;
    float leng2 = Lengs.y;
    float mass1 = Masses.x;
    float mass2 = Masses.y;
    float PI = 3.1415;
    vec4 nz = vec4(PI * (fragCoord.x - 1.), PI * (fragCoord.y - 1.), 0.0, 0.0);
    for (float i=0.; i<Time; i++){
        nz = Iterat(nz, Lengs, Masses);
    }
    outColor = vec4(abs(sin(nz.x/2.)), abs(sin(nz.y/2.)), abs(cos(nz.z/2.)), 1.0);
}