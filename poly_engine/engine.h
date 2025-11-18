;-*- asm -*-
fp_reci		equ 15
fp_rez		equ 8		; sub-pixel precision for edges

ambient		equ 8
near_z		equ 10

grid_size_bits	equ 6
grid_size	equ (1<<grid_size_bits)
world_size_bits	equ 7
world_size	equ (1<<world_size_bits)
radius		equ 12
dia		equ radius*2

speed		equ 8
a_speed		equ 8

far_z		equ grid_size*radius
