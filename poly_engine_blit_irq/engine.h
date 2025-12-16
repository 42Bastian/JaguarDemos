;-*- asm -*-
fp_reci		equ 15
fp_rez		equ 8		; sub-pixel precision for edges
COLOR_FP	equ 7		; fixpoint for color gradient

ambient		equ 16
near_z		equ 10

grid_size_bits	equ 6
grid_size	equ (1<<grid_size_bits)
world_size_bits	equ 7
world_size	equ (1<<world_size_bits)
radius		equ 12
dia		equ radius*2

speed		equ 10
a_speed		equ 4

far_z		equ grid_size*(radius)
far_x		equ far_z	;*341/256

dark_dist	equ far_z-2*grid_size

NO_ASPECT_FIX	equ 0
