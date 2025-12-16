;;; -*-asm-*-

	;; object definition
	RSRESET
	RSW	obj_visible		; object completely visible.
	RSW	obj_x
	RSW	obj_y
	RSW	obj_z
	RSW	obj_dummy		; current angles
	RSW	obj_angle_a
	RSW	obj_angle_b
	RSW	obj_angle_c
	RSL	obj_points		; address of original points
	RSL	obj_faces		; address of faces
	RSL	obj_normals		; original face normals
	RSL	obj_vnormals		; original vertex normals
	RSL	obj_rotated		; address rotated vertexes
	RSL	obj_normals_rotated	; rotated face normals
	RSL	obj_vnormals_rotated	; rotated vertex normals
	RSL	obj_projected		; final projectd points (incl. moving)
	RSL	obj_facesVisible	; list of visible faces and luminance
_3dobject_size equ RSCOUNT

	echo "3D objsize: %D _3dobject_size"

obj_angle	equ obj_dummy

	RSRESET
	RSL	pts_nPoints
	RSW	pts_dummy
	RSW	pts_x
	RSW	pts_y
	RSW	pts_z
pts_size	equ RSCOUNT

	RSRESET
	RSW	face_pt0
	RSW	face_pt1
	RSW	fave_pt2
	RSW	face_color
face_size	equ RSCOUNT

	RSRESET
	RSL	proj_z_org
	RSW	proj_x
	RSW	proj_y
proj_size	equ RSCOUNT

	RSRESET
	RSL	_3d_x
	RSL	_3d_y
	RSL	_3d_z
	RSL	_3d_dummy

_3d_size	equ RSCOUNT

	RSRESET
	RSL	tri_col
	RSL	tri_xy0
	RSL	tri_xy1
	RSL	tri_xy2
	RSL	tri_next
_tri_size	equ RSCOUNT

	macro face ; p1,p2,p3,p4,col
	dc.w \0,\1,\2,\4
	dc.w \2,\3,\0,\4
	endm

	macro tri			; p1,p2,p3,col
	dc.w \0,\1,\2,\3
	endm

	macro PT
 ifvar \3
	dc.l \0/2 ,\1/2 ,\2/2 ,\3
 else
	dc.l \0/2 ,\1/2 ,\2/2 ,0
 endif
	endm

	macro NT
	dc.l  \0 ,\1 ,\2 ,0
	endm

	macro VNT
	dc.l (\0) ,(\1) ,(\2) ,0
	endm

	macro _PT
	dc.l  \0 ,\1 ,\2 ,0
	endm
