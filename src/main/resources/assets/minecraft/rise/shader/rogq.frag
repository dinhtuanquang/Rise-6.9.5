#version 120

uniform vec2 u_size;
uniform float u_radius;
uniform float u_border_size;
uniform vec4 u_color_1;
uniform vec4 u_color_2;

varying vec2 v_texCoord;

// Rounded Outlined Gradient Quad
// Hazsi and Patrick
void main(void)
{
    float a = v_texCoord.x * 0.5 + v_texCoord.y * 0.5;
    float b = abs(1. - a * 2.);
    vec4 color = mix(u_color_1, u_color_2, b);

    vec2 position = (abs(v_texCoord - 0.5) + 0.5) * u_size;
    float distance = length(max(position - u_size + u_radius + u_border_size, 0.0)) - u_radius + 0.5;
    gl_FragColor = vec4(color.rgb, color.a * (smoothstep(0.0, 1.0, distance) - smoothstep(0.0, 1.0, distance - u_border_size)));
}