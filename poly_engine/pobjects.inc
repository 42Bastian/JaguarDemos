;-*-asm-*-
******************
* diamant
	dphrase
obj_diamant:
	dc.b	1,1		; visible
	dc.w	100,0,400	; position: x,y,z
	dc.b	0		; spare
	dc.b	0,0,128		; angle: a,b,c
	dc.l	-1		; old angle
	dc.l	diamant_points
	dc.l	diamant_faces
	dc.l	diamant_normals
	dc.l	diamant_vnormals
	dc.l	diamant_rotated
	dc.l	diamant_moved
	dc.l	diamant_normals_rotated
	dc.l	diamant_vnormals_rotated
	dc.l	diamant_projected
	dc.l	diamant_visible

	include "diamant.inc"
******************
* ball
//->	include "ball.inc"
******************
* prisma
	dphrase
obj_prisma:
	dc.b	1,1		; visible
	dc.w	0,160,600	; position: x,y,z
	dc.b	0		; spare
	dc.b	20,120,0		; angle: a,b,c
	dc.l	-1		; old angle
	dc.l	prisma_points
	dc.l	prisma_faces
	dc.l	prisma_normals
	dc.l	prisma_vnormals
	dc.l	prisma_rotated
	dc.l	prisma_moved
	dc.l	prisma_normals_rotated
	dc.l	prisma_vnormals_rotated
	dc.l	prisma_projected
	dc.l	prisma_visible

	include "prisma.inc"
******************
* test
	include "head.inc"
******************
* kugel
	dphrase
obj_kugel:
	dc.b	1,1		; visible
	dc.w	0,0,200		; position: x,y,z
	dc.b	0		; spare
	dc.b	0,128,0		; angle: a,b,c
	dc.l	-1		; old angle
	dc.l	kugel_points
	dc.l	kugel_faces
	dc.l	kugel_normals
	dc.l	kugel_vnormals
	dc.l	kugel_rotated
	dc.l	kugel_moved
	dc.l	kugel_normals_rotated
	dc.l	kugel_vnormals_rotated
	dc.l	kugel_projected
	dc.l	kugel_visible

	include "bigball.inc"
******************
* CUBE
	dphrase
obj_cube:
	dc.b	1,1		; visible
	dc.w	-100,-64,240	; position: x,y,z
	dc.b	0		; spare
	dc.b	0,0,0		; angle: a,b,c
	dc.l	-1		; old angle
	dc.l	cube_points
	dc.l	cube_faces
	dc.l	cube_normals
	dc.l	cube_vnormals
	dc.l	cube_rotated
	dc.l	cube_moved
	dc.l	cube_normals_rotated
	dc.l	cube_vnormals_rotated
	dc.l	cube_projected
	dc.l	cube_visible

obj_cube2:
	dc.b	1,1		; visible
	dc.w	-50,-24,300	; position: x,y,z
	dc.b	0		; spare
	dc.b	0,20,0		; angle: a,b,c
	dc.l	-1		; old angle
	dc.l	cube_points
	dc.l	cube2_faces
	dc.l	cube2_normals
	dc.l	cube2_vnormals
	dc.l	cube2_rotated
	dc.l	cube2_moved
	dc.l	cube2_normals_rotated
	dc.l	cube2_vnormals_rotated
	dc.l	cube2_projected
	dc.l	cube2_visible

	include "cube.inc"
******************
* robot
//->	include "robot.inc"
******************
	dphrase
obj_torus:
	dc.b	1,1		; visible
	dc.w	0,0,400		; position: x,y,z
	dc.b	0		; spare
	dc.b	0,0,0		; angle: a,b,c
	dc.l	-1		; old angle
	dc.l	torus_points
	dc.l	torus_faces
	dc.l	torus_normals
	dc.l	torus_vnormals
	dc.l	torus_rotated
	dc.l	torus_moved
	dc.l	torus_normals_rotated
	dc.l	torus_vnormals_rotated
	dc.l	torus_projected
	dc.l	torus_visible

	dphrase
obj_torus2:
	dc.b	1,1		; visible
	dc.w	184,80,340	; position: x,y,z
	dc.b	0		; spare
	dc.b	0,0,0		; angle: a,b,c
	dc.l	-1		; old angle
	dc.l	torus_points
	dc.l	torus_faces
	dc.l	torus_normals
	dc.l	torus_vnormals
	dc.l	torus2_rotated
	dc.l	torus2_moved
	dc.l	torus2_normals_rotated
	dc.l	torus2_vnormals_rotated
	dc.l	torus2_projected
	dc.l	torus2_visible

	include "torus.inc"

	dphrase
obj_plane:
	dc.b	1,1		; visible
	dc.w	0,-150,800	; position: x,y,z
	dc.b	0		; spare
	dc.b	0,0,0		; angle: a,b,c
	dc.l	-1		; old angle
	dc.l	plane_points
	dc.l	plane_faces
	dc.l	plane_normals
	dc.l	0		;plane_vnormals
	dc.l	plane_rotated
	dc.l	plane_moved
	dc.l	plane_normals_rotated
	dc.l	0		;plane_vnormals_rotated
	dc.l	plane_projected
	dc.l	plane_visible

	include "plane.inc"
