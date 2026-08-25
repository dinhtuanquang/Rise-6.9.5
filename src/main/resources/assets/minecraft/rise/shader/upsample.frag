#version 120
// Upsampling shader — Dual Kawase blur upscale pass
// Downgraded from #version 330 core to #version 120 for gl4es / OpenGL 2.1 compatibility.
// Changes:
//   - Removed `out vec4 fragColor` (use built-in gl_FragColor instead)
//   - Replaced gl_FragCoord.xy/screenResolution with v_texCoord
//     (equivalent when rendered via a full-screen quad that supplies tex coords)
//   - Changed `mixture` uniform from int to float to avoid GLSL 120 int/float mix() issues
//   - texture2D() is the correct GLSL 1.20 sampler function name
varying vec2 v_texCoord;

uniform sampler2D mainTexture, secondaryTexture;
uniform vec2 textureOffset, pixelStep;
// `mixture` controls alpha blending — 0 = full secondary alpha, 1 = opaque
uniform float mixture;

#define pixel (pixelStep * textureOffset)

void main() {
    // v_texCoord gives [0,1] UV coords identical to
    // gl_FragCoord.xy / screenResolution when drawn via a full-screen quad.
    vec2 position = v_texCoord;

    vec4 value = texture2D(mainTexture, position + vec2(-pixel.x * 2.0, 0.0));
    value += texture2D(mainTexture, position + vec2(-pixel.x, pixel.y) * textureOffset) * 2.0;
    value += texture2D(mainTexture, position + vec2(0.0, pixel.y * 2.0));
    value += texture2D(mainTexture, position + vec2(pixel.x, pixel.y) * textureOffset) * 2.0;
    value += texture2D(mainTexture, position + vec2(pixel.x * 2.0, 0.0));
    value += texture2D(mainTexture, position + vec2(pixel.x, -pixel.y) * textureOffset) * 2.0;
    value += texture2D(mainTexture, position + vec2(0.0, -pixel.y * 2.0));
    value += texture2D(mainTexture, position + vec2(-pixel.x, -pixel.y)) * 2.0;

    value /= 12.0;

    float alpha = texture2D(secondaryTexture, position).a;

    // mix() in GLSL 120 requires float — `mixture` is now declared as float.
    gl_FragColor = vec4(value.rgb, mix(1.0, alpha, mixture));
}