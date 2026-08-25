// Downsampling shader — Dual Kawase blur pass
// Downgraded from #version 330 core to #version 120 for gl4es / OpenGL 2.1 compatibility.
// Changes:
//   - Removed `out vec4 fragColor` (used built-in gl_FragColor instead)
//   - Replaced gl_FragCoord.xy/screenResolution with gl_TexCoord[0].st
//     (equivalent when rendered via a full-screen quad that supplies tex coords)
//   - texture2D() is the correct GLSL 1.20 sampler function name
#version 120

uniform sampler2D mainTexture;
uniform vec2 textureOffset, pixelStep;

#define halfPixel (pixelStep * textureOffset)

void main() {
    // gl_TexCoord[0].st gives [0,1] UV coords identical to
    // gl_FragCoord.xy / screenResolution when drawn via a full-screen quad.
    vec2 oTexCoord = gl_TexCoord[0].st;

    vec4 color = texture2D(mainTexture, oTexCoord) * 4.0;

    color += texture2D(mainTexture, oTexCoord + halfPixel * textureOffset);
    color += texture2D(mainTexture, oTexCoord - halfPixel * textureOffset);
    color += texture2D(mainTexture, oTexCoord + vec2(halfPixel.x, -halfPixel.y) * textureOffset);
    color += texture2D(mainTexture, oTexCoord - vec2(halfPixel.x, -halfPixel.y) * textureOffset);

    color /= 8.0;

    gl_FragColor = color;
}