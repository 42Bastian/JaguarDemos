;-*-asm-*-

****************
* compute rotation matrix
* a=cos(gamma) b=sin(gamma)
* c=cos(beta)  d=sin(beta)
* e=cos(alpha) f=sin(alpha)

rotated		reg 14

a		reg 99
b		reg 99
c		reg 99
d		reg 99
e		reg 99
f		reg 99
af		reg 99
bf		reg 99
ae		reg 99
be		reg 99

m1		reg 99	;
m2		reg 99	;
m3		reg 99	;          / ac afd-be ade+bf \
m4		reg b!	;          |                  |
m5		reg 99	; D(x,y,z)=| bc bfd+ae bde-af |
m6		reg 99	;          |                  |
m7		reg d!	;          \-d    cf     ce   /
m8		reg f!	;
m9		reg c!	;

rotate_object::
	load	(curr_object+obj_angle),a
	addq	#4,curr_object
	load	(curr_object+obj_angle),c
	subq	#4,curr_object

	move	c,e
	shrq	#16,c
	shlq	#16,e
	movei	#SinTab,r14
	shrq	#16,e
	load	(r14+a),b	; cos alpha
	load	(r14+c),d	; cos beta
	load	(r14+e),f	; cos gamma
	addq	#4,r14
	load	(r14+a),a	; sin alpha
	load	(r14+c),c	; sin beta
	load	(r14+e),e	; sin gamma

*
** compute rotation matrix
*
	move	a,af
	move	a,ae
	imult	f,af
	imult	e,ae
	sharq	#15,af
	sharq	#15,ae

	move	b,bf
	move	b,be
	imult	f,bf
	imult	e,be
	sharq	#15,bf
	sharq	#15,be

	move	a,m1
	move	af,m2
	imult	c,m1
	imult	d,m2
	sharq	#15,m1
	sharq	#15,m2

	sub	be,m2

	move	ae,m3
//->	move	b,m4
	imult	c,m4
	imult	d,m3
	sharq	#15,m4
	sharq	#15,m3


	add	bf,m3

	move	bf,m5
	move	be,m6
	imult	d,m5
	imult	d,m6
	sharq	#15,m5
	sharq	#15,m6

	add	ae,m5
	sub	af,m6

//->	move	d,m7
//->	move	f,m8
	neg	m7
//->	move	c,m9
	imult	c,m8
	imult	e,m9
	sharq	#15,m8
	sharq	#15,m9

	UNREG a,b,c,d,e,f,af,bf,ae,be	; release registers

;---------------

counter		REG 99
LOOP		REG 99
x_pos		reg 99
y_pos		reg 99
z_pos		reg 99

x1		reg 99
y1		reg 99
z1		reg 99
xyz_ptr		reg 99
LR2		reg 99

	load	(curr_object),x_pos
	load	(curr_object+obj_y),y_pos

	shlq	#16,x_pos
	move	y_pos,z_pos
	sharq	#16,x_pos
	shlq	#16,z_pos
	sharq	#16,y_pos
	sharq	#16,z_pos

	movefa	cam_x.a,tmp0
	movefa	cam_y.a,tmp1
	movefa	cam_z.a,tmp2
	sub	tmp0,x_pos
	sub	tmp1,y_pos
	sub	tmp2,z_pos

	load	(curr_object+obj_points),xyz_ptr
	load	(curr_object+obj_rotated),rotated
	move	pc,LR2
	jr	rotate_points
	addq	#6,LR2

._ret1
	moveq	#0,x_pos	; normals are not moved
	moveq	#0,y_pos
	moveq	#0,z_pos

	load	(curr_object+obj_normals),xyz_ptr
	load	(curr_object+obj_normals_rotated),rotated
 IF GOURAUD = 1
	jr	rotate_points
	addq	#._ret2-._ret1,LR2

._ret2
	load	(curr_object+obj_vnormals),xyz_ptr
	cmpq	#0,xyz_ptr
	movei	#rotate_camera1,LR2
	jump	eq,(LR2)
	load	(curr_object+obj_vnormals_rotated),rotated
 ELSE
	movei	#rotate_camera1,LR2
 ENDIF
***************
rotate_points:
	load	(xyz_ptr),counter
	addq	#4,xyz_ptr
	store	counter,(rotated)
	addq	#4,rotated

	load	(xyz_ptr),x1
	addqt	#4,xyz_ptr
	load	(xyz_ptr),y1
	addqt	#4,xyz_ptr
	load	(xyz_ptr),z1
	addqt	#8,xyz_ptr

	move	pc,LOOP
	addq	#4,LOOP
.loop_xyz
	imultn	m1,x1
	imacn	m2,y1
	imacn	m3,z1
	resmac	tmp0

	imultn	m4,x1
	imacn	m5,y1
	imacn	m6,z1
	resmac	tmp1

	imultn	m7,x1
	imacn	m8,y1
	imacn	m9,z1
	resmac	tmp2

	sharq	#15,tmp0
	sharq	#15,tmp1
	sharq	#15,tmp2

	add	x_pos,tmp0
	add	y_pos,tmp1
	add	z_pos,tmp2

	load	(xyz_ptr),x1
	addqt	#4,xyz_ptr
	load	(xyz_ptr),y1
	addqt	#4,xyz_ptr
	load	(xyz_ptr),z1
	addqt	#8,xyz_ptr
	store	tmp0,(rotated)
	store	tmp1,(rotated+4)
	subq	#1,counter
	store	tmp2,(rotated+8)
	jump	ne,(LOOP)
	addqt	#16,rotated

	jump	(LR2)
	nop

	UNREG m1,m2,m3,m4,m5,m6,m7,m8,m9

cam_sin		reg 99
neg_cam_sin	reg 99
cam_cos		reg 99
vertex_source	reg 99
normals_source	reg 99
vnormals_source	reg 99

rotate_camera::
	load	(curr_object),x_pos
	load	(curr_object+obj_y),y_pos

	shlq	#16,x_pos
	move	y_pos,z_pos
	sharq	#16,x_pos
	shlq	#16,z_pos
	sharq	#16,y_pos
	sharq	#16,z_pos

	movefa	cam_x.a,tmp0
	movefa	cam_y.a,tmp1
	movefa	cam_z.a,tmp2
	sub	tmp0,x_pos
	sub	tmp1,y_pos
	sub	tmp2,z_pos

	load	(curr_object+obj_points),vertex_source
	load	(curr_object+obj_normals),normals_source
	jr	rotate_cont
	load	(curr_object+obj_vnormals),vnormals_source

rotate_camera1::
	load	(curr_object+obj_rotated),vertex_source
	load	(curr_object+obj_normals_rotated),normals_source
	load	(curr_object+obj_vnormals_rotated),vnormals_source
rotate_cont
	movefa	cam_cos.a,cam_cos
	movefa	cam_sin.a,cam_sin
	movefa	neg_cam_sin.a,neg_cam_sin

	move	vertex_source,xyz_ptr
	load	(curr_object+obj_rotated),rotated
	move	pc,LR2
	jr	rc_points
	addq	#6,LR2

._ret1:
	moveq	#0,x_pos	; normals are not moved
	moveq	#0,y_pos
	moveq	#0,z_pos

	move	normals_source,xyz_ptr
	load	(curr_object+obj_normals_rotated),rotated
 IF GOURAUD = 1
	jr	rc_points
	addqt	#._ret2-._ret1,LR2

._ret2	load	(curr_object+obj_vnormals_rotated),rotated
	move	vnormals_source,xyz_ptr
	cmpq	#0,rotated
	jump	eq,(LR)
	move	LR,LR2
 ELSE
	move	LR,LR2
 ENDIF

rc_points:
	load	(xyz_ptr),counter
	addq	#4,xyz_ptr
	store	counter,(rotated)
	addq	#4,rotated

	load	(xyz_ptr),x1
	addq	#4,xyz_ptr
	load	(xyz_ptr),y1
	addq	#4,xyz_ptr
	load	(xyz_ptr),z1
	addqt	#8,xyz_ptr

	move	pc,LOOP
	addq	#4,LOOP
.loop_xyz
	add	x_pos,x1
	add	y_pos,y1
	add	z_pos,z1

	store	y1,(rotated+4)

	imultn	cam_cos,x1
	imacn	cam_sin,z1
	resmac	tmp0

	imultn	neg_cam_sin,x1
	imacn	cam_cos,z1
	resmac	tmp1

	sharq	#15,tmp0
	sharq	#15,tmp1

	load	(xyz_ptr),x1
	addqt	#4,xyz_ptr
	load	(xyz_ptr),y1
	addq	#4,xyz_ptr
	load	(xyz_ptr),z1
	addqt	#8,xyz_ptr

	store	tmp0,(rotated)
	subq	#1,counter
	store	tmp1,(rotated+8)
	jump	ne,(LOOP)
	addqt	#16,rotated

	jump	(LR2)
	nop

	UNREG rotated
	unreg xyz_ptr,x1,y1,z1,counter
	unreg LOOP,LR2
	unreg x_pos,y_pos,z_pos
	unreg cam_sin, neg_cam_sin, cam_cos
	unreg vertex_source, normals_source, vnormals_source
