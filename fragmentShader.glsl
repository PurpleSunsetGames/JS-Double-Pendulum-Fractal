#version 300 es

precision highp float;

in vec3 fragColor;
uniform float TimeIn;
uniform vec2 Offset;
uniform float Scale;
uniform float XAxisType;
uniform float YAxisType;
uniform vec2 Lengs;
uniform vec2 Masses;
uniform float G;
uniform float Friction;
uniform float P1StartAngle;
uniform float P2StartAngle;
uniform float P1StartVel;
uniform float P2StartVel;

uniform float ColorType;

float Timestep = .05;

out vec4 outColor;

vec4 Iterat(vec4 zi, vec2 lengs, vec2 masses, float g) {
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

    vec4 endz = vec4(zi.x + Timestep * zi.z, zi.y + Timestep * zi.w, (1. - Friction) * (zi.z + Timestep*g1), (1. - Friction) * (zi.w + Timestep*g2));
    return endz;
}
vec3 hsv2rgb(vec3 HSV) {
    vec3 RGB = vec3(0.0, 0.0, 0.0);
    float C = HSV.z * HSV.y;
    float H = HSV.x * 6.0;
    float X = C * (1.0 - abs(mod(H, 2.0) - 1.0));
    if (HSV.y != 0.0)
    {
        float I = floor(H);
        if (I == 0.0) 
        {
            RGB = vec3(C, X, 0.0); 
        }
        else if (I == 1.0) 
        { 
            RGB = vec3(X, C, 0.0); 
        }
        else if (I == 2.0) 
        { 
            RGB = vec3(0.0, C, X); 
        }
        else if (I == 3.0) 
        { 
            RGB = vec3(0.0, X, C); 
        }
        else if (I == 4.0) 
        { 
            RGB = vec3(X, 0.0, C); 
        }
        else 
        { 
            RGB = vec3(C, 0.0, X); 
        }
    }
    float M = HSV.z - C;
    return RGB + M;
}
void main(){
    float PI = 3.1415;

    vec2 fragCoord = vec2(Scale*fragColor.xy) + Offset;
    float Time = TimeIn;
    float g = G;
    float startTheta1 = P1StartAngle;
    float startTheta2 = P2StartAngle;
    float leng1 = Lengs.x;
    float leng2 = Lengs.y;
    float mass1 = Masses.x;
    float mass2 = Masses.y;
    float startVel1 = P1StartVel;
    float startVel2 = P2StartVel;

    if (XAxisType==1.){startTheta1 = PI * (fragCoord.x-1.);}
    else if (XAxisType==2.){leng1 = PI * (fragCoord.x-1.);}
    else if (XAxisType==3.){mass1 = PI * (fragCoord.x-1.);}
    else if (XAxisType==4.){startVel1 = PI * (fragCoord.x-1.);}
    else if (XAxisType==5.){startTheta2 = PI * (fragCoord.x-1.);}
    else if (XAxisType==6.){leng2 = PI * (fragCoord.x-1.);}
    else if (XAxisType==7.){mass2 = PI * (fragCoord.x-1.);}
    else if (XAxisType==8.){startVel2 = PI * (fragCoord.x-1.);}
    else if (XAxisType==9.){g = PI * (fragCoord.x-1.);}
    else if (XAxisType==10.){Time = PI * (fragCoord.x-1.);}

    if (YAxisType==1.){startVel1 = PI * (fragCoord.y-1.);}
    else if (YAxisType==2.){mass1 = PI * (fragCoord.y-1.);}
    else if (YAxisType==3.){leng1 = PI * (fragCoord.y-1.);}
    else if (YAxisType==4.){startVel1 = PI * (fragCoord.y-1.);}
    else if (YAxisType==5.){startTheta2 = PI * (fragCoord.y-1.);}
    else if (YAxisType==6.){leng2 = PI * (fragCoord.y-1.);}
    else if (YAxisType==7.){mass2 = PI * (fragCoord.y-1.);}
    else if (YAxisType==8.){startVel2 = PI * (fragCoord.y-1.);}
    else if (YAxisType==9.){g = PI * (fragCoord.y-1.);}
    else if (YAxisType==10.){Time = PI * (fragCoord.y-1.);}

    vec4 nz = vec4(startTheta1, startTheta2, startVel1, startVel2);
    for (float i=0.; i<Time; i++){
        nz = Iterat(nz, vec2(leng1, leng2), vec2(mass1, mass2), g);
    }

    if (ColorType == 1.0) {
        outColor = vec4(abs(sin(nz.x/2.))+abs(sin(nz.y/2.)), abs(sin(nz.y/2.)), abs(cos(nz.x/2.)), 1.0);
    }
    else if (ColorType == 2.0) {
        outColor = vec4(hsv2rgb(vec3(mod((nz.x+PI)/(2.0*PI), 1.0), 1.0, mod((nz.y+PI)/(2.0*PI),1.0))), 1.0);
    }
}