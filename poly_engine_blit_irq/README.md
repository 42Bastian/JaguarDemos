# 3D engine WIP - blitter IRQ test

A new 3D engine completely in GPU code. 68K is stopped.

Hively Player by Ericde45.

## control

Object focus changed with OPTION

Objects moved with 1/2/3 + cursor

Camera moved with cursor.

Gouraud shading can be toggeled with `0`.

## Internals

The landscape is 128x128 tiles large, each tile 64 units.

Watch-distance is defined in `engine.h`, currently 12 tiles.

Resolution is 384x200 (can be changed in `video.h`).
