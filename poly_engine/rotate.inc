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
ac		reg 99
bc		reg 99

m1		reg 99	;
m2		reg 99	;
m3		reg c!	;          / df      -de       c  \
m4		reg 99	;          |                      |
m5		reg 99	; D(x,y,z)=| ac*f+be -ace+bf  -ad  |
m6		reg 99	;          |                      |
m7		reg 99	;          \ -bcf+ae bce+af   bd /
m8		reg 99	;
m9		reg 99	;

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
	load	(r14+a),a	; cos alpha | sin alpha
	load	(r14+c),c	; cos beta  | sin beta
	load	(r14+e),e	; cos gamma | sin beta
	move	a,b
	move	c,d
	move	e,f
	shrq	#16,b
	shrq	#16,d
	shrq	#16,f

*
** compute rotation matrix
*
	move	a,ac
	move	b,bc
	imult	c,ac
	imult	c,bc
	sharq	#15,ac
	sharq	#15,bc

	move	e,tmp0
	move	d,m1
	neg	tmp0
	move	d,m2
	imult	f,m1		; m1 = df
	imult	tmp0,m2		; m2 = -de
	sharq	#15,m1
	sharq	#15,m2

	move	d,m6
	move	d,m9
	neg	m6
	imult	b,m9
	imult	a,m6
	sharq	#15,m9		; m9 = bd
	sharq	#15,m6		; m6 = -ad

	imultn	ac,tmp0
	imacn	b,f
	resmac	m5		; m5 = -ace+be

	neg	bc

	imultn	ac,f
	imacn	b,e
	resmac	m4		; m4 = acf+be

	imultn	bc,tmp0
	imacn	a,f
	resmac	m8		; m8 = bce+af (really: -bc*-e)

	imultn	bc,f
	imacn	a,e
	resmac	m7		; m7 = -bce+ae

	sharq	#15,m4
	sharq	#15,m5
	sharq	#15,m7
	sharq	#15,m8


	UNREG a,b,c,d,e,f,ac,bc

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
	move	LR,LR2

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
