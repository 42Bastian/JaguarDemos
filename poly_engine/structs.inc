;;; -*-asm-*-

	;; object definition
	RSRESET
	RSB	obj_changed
	RSB	obj_visible		; object completely visible.
	RSW	obj_x
	RSW	obj_y
	RSW	obj_z
	RSB	obj_dummy		; current angles
	RSB	obj_angle_a
	RSB	obj_angle_b
	RSB	obj_angle_c
	RSB	obj_odummy		; last angles
	RSB	obj_oangle_a
	RSB	obj_oangle_b
	RSB	obj_oangle_c
	RSL	obj_points		; address of original points
	RSL	obj_faces		; address of faces
	RSL	obj_normals		; original face normals
	RSL	obj_vnormals		; original vertex normals
	RSL	obj_rotated		; address rotated vertexes
	RSL	obj_moved		; address rotated and moved vertexes
	RSL	obj_normals_rotated	; rotated face normals
	RSL	obj_vnormals_rotated	; rotated vertex normals
	RSL	obj_projected		; final projectd points (incl. moving)
	RSL	obj_facesVisible	; list of visible faces and luminance
_3dobject_size equ RSCOUNT

	echo "3D objsize: %D _3dobject_size"

obj_angle	equ obj_dummy
obj_oangle	equ obj_odummy

	RSRESET
	RSL	pts_nPoints
	RSW	pts_dummy
	RSW	pts_x
	RSW	pts_y
	RSW	pts_z
pts_size	equ RSCOUNT

	RSRESET
//->	RSW	fcs_color
	RSW	face_pt0
	RSW	face_pt1
	RSW	fave_pt2
	RSW	face_dummy
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
