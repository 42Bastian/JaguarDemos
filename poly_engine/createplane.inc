;-*-asm-*-

projected	reg 14
plane_source	reg 15

cam_y		reg 99
z_pos		reg 99
ix		reg 99
iz		reg 99
ox		reg 99
oz		reg 99
x		reg 99
wx		reg 99
wz		reg 99
cam_sin		reg 99
neg_cam_sin	reg 99
cam_cos		reg 99
xcenter		REG 99
ycenter		REG 99
rotated		reg 99
LOOPX		reg 99
LOOPZ		reg 99


x_pos.a		reg 99
z_pos.a		reg 99

createPlane::
	PUSHLR

	movefa	cam_x.a,tmp0
	movefa	cam_y.a,cam_y
	movefa	cam_z.a,z_pos
	sharq	#grid_size_bits,tmp0
	sharq	#grid_size_bits,z_pos
	subq	#radius,tmp0
	subq	#radius,z_pos
	moveta	tmp0,x_pos.a
	moveta	z_pos,z_pos.a

	movei	#(max_x>>1),xcenter
	movei	#(max_y>>1),ycenter

	movefa	cam_cos.a,cam_cos
	movefa	cam_sin.a,cam_sin
	movefa	neg_cam_sin.a,neg_cam_sin

	moveq	#dia,iz
	movei	#plane_y,plane_source
	movei	#plane_projected,projected
	movei	#plane_rotated+4,rotated

	move	z_pos,oz
._pc	move	PC,LOOPX
	addq	#.loopx-._pc,LOOPX
	move	pc,LOOPZ
	addq	#4,LOOPZ
.loopz:
	shlq	#32-world_size_bits,oz
	shrq	#32-2*world_size_bits,oz
	movefa	x_pos.a,x
	moveq	#dia,ix
.loopx
	move	x,ox
	shlq	#32 - world_size_bits,ox
	shrq	#32 - world_size_bits,ox
	add	oz,ox
	add	plane_source,ox

	move	x,wx
	move	z_pos,wz

	shlq	#grid_size_bits,wx
	shlq	#grid_size_bits,wz

	addq	#8,wx
	addq	#8,wz

	movefa	cam_x.a,tmp0
	movefa	cam_z.a,tmp1

	sub	tmp0,wx
	sub	tmp1,wz

	addq	#8,rotated	; point to z

	imultn	wx,neg_cam_sin
	imacn	wz,cam_cos
	resmac	tmp2

	sharq	#15,tmp2	; z
	movei	#1<<15,tmp3
	store	tmp2,(rotated)
	jr	pl_nz,.z_ok
	store	tmp2,(projected)
	moveq	#1,tmp2
.z_ok
	div	tmp2,tmp3

	imultn	wx,cam_cos
	imacn	wz,cam_sin
	resmac	tmp0

	loadb	(ox),tmp1

	sharq	#15,tmp0	; x
	sub	cam_y,tmp1
	subq	#4,rotated
	store	tmp1,(rotated)	; 3D y
	subq	#4,rotated
	store	tmp0,(rotated)	; 3D x
	imult	tmp3,tmp0
	addqt	#16,rotated
	imult	tmp3,tmp1

//->	movei	#1<<6,tmp3
//->	add	tmp3,tmp0
//->	add	tmp3,tmp1

	sharq	#7,tmp0
	sharq	#7,tmp1
 IF max_x = 320
	moveq	#21,tmp2
	imult	tmp2,tmp0
	sharq	#5,tmp0
 ENDIF
 IF max_x = 640
	moveq	#21,tmp2
	imult	tmp2,tmp0
	sharq	#4,tmp0
 ENDIF
	neg	tmp1
	add	xcenter,tmp0
	add	ycenter,tmp1

	shlq	#16,tmp0
	shlq	#16,tmp1
	shrq	#16,tmp1
	or	tmp0,tmp1
	store	tmp1,(projected+4)	; save Xscreen/Yscreen

	subq	#1,ix
	addqt	#8,projected
	jump	ne,(LOOPX)
	addqt	#1,x

	subq	#1,iz
	addqt	#1,z_pos
	jump	ne,(LOOPZ)
	move	z_pos,oz

	unreg xcenter, ycenter
	unreg projected,plane_source,cam_y
	unreg rotated
****************************************
** rotate normals
****************************************
n_ptr		reg 14
rn_ptr		reg 15
n_x		reg 99
n_y		reg 99
n_z		reg 99

	movefa	z_pos.a,z_pos

	moveq	#dia-1,iz
	movei	#plane_normals,n_ptr
	movei	#plane_normals_rotated+4,rn_ptr
	movei	#$3fff,tmp3
._pc0	move	PC,LOOPX
	addq	#.loopx0-._pc0,LOOPX
	move	pc,LOOPZ
	addq	#4,LOOPZ
.loopz0:
	move	z_pos,oz
	shlq	#32-world_size_bits,oz
	shrq	#32-2*world_size_bits-4,oz
	movefa	x_pos.a,x
	moveq	#dia-1,ix
.loopx0
	move	x,ox
	shlq	#32 - world_size_bits,ox
	shrq	#32 - world_size_bits-4,ox
	add	oz,ox

	load	(n_ptr+ox),n_x	; 0:x
	addq	#4,ox
	load	(n_ptr+ox),n_y  ; n_y|n_z
	addq	#4,ox
	move	n_y,n_z
	sharq	#16,n_y

	imultn	n_x,cam_cos
	imacn	n_z,cam_sin
	resmac	tmp0

	imultn	n_x,neg_cam_sin
	imacn	n_z,cam_cos
	resmac	tmp1

	add	tmp3,tmp0
	add	tmp3,tmp1

	sharq	#15,tmp0
	sharq	#15,tmp1

	store	tmp0,(rn_ptr)
	store	n_y,(rn_ptr+4)
	store	tmp1,(rn_ptr+8)

	load	(n_ptr+ox),n_x
	addq	#4,ox
	load	(n_ptr+ox),n_y
	move	n_y,n_z
	sharq	#16,n_y

	imultn	n_x,cam_cos
	imacn	n_z,cam_sin
	resmac	tmp0

	imultn	n_x,neg_cam_sin
	imacn	n_z,cam_cos
	resmac	tmp1

	add	tmp3,tmp0
	add	tmp3,tmp1

	sharq	#15,tmp0
	sharq	#15,tmp1

	store	tmp0,(rn_ptr+16)
	store	n_y,(rn_ptr+20)
	store	tmp1,(rn_ptr+24)

	subq	#1,ix
	addqt	#1,x
	jump	ne,(LOOPX)
	addqt	#32,rn_ptr

	subq	#1,iz
	jump	ne,(LOOPZ)
	addq	#1,z_pos

	unreg rn_ptr,n_ptr,n_x,n_y,n_z

 IF GOURAUD = 1
****************************************
** rotate vnormals
****************************************
vn_ptr		reg 14
rvn_ptr		reg 15
n_x		reg 99
n_y		reg 99
n_z		reg 99

l_x		reg 99
l_y		reg 99
l_z		reg 99

planeRotateVnormals::
	movei	#.no_gouraud,r1
	movei	#USE_GOURAUD,r0
	load	(r0),r0
	movei	#RLIGHT_X,r14
	cmpq	#0,r0
	load	(r14),l_x
	jump	eq,(r1)
	load	(r14+4),l_y
	load	(r14+8),l_z

	movefa	z_pos.a,z_pos

	moveq	#dia,iz
	movei	#plane_vnormals_rotated+4-1,rvn_ptr
	movei	#plane_vnormals,vn_ptr

._pc0	move	PC,LOOPX
	addq	#.loopx0-._pc0,LOOPX
	move	pc,LOOPZ
	addq	#4,LOOPZ
.loopz0:
	move	z_pos,oz
	shlq	#32-world_size_bits,oz
	movefa	x_pos.a,x
	shrq	#32-2*world_size_bits-3,oz
	move	x,ox
	moveq	#dia,ix
.loopx0
	shlq	#32 - world_size_bits,ox
	shrq	#32 - world_size_bits-3,ox
	add	oz,ox

	load	(vn_ptr+ox),n_x	; 0:x
	addq	#4,ox
	load	(vn_ptr+ox),n_y  ; n_y|n_z
	move	n_y,n_z
	sharq	#16,n_y

	imultn	n_x,cam_cos
	imacn	n_z,cam_sin
	resmac	tmp0

	imultn	n_x,neg_cam_sin
	imacn	n_z,cam_cos
	resmac	tmp1

	sharq	#15,tmp0
	sharq	#15,tmp1

	imultn	l_x,tmp0
	imacn	l_y,n_y
	imacn	l_z,tmp1
	resmac	tmp1

	addqt	#1,rvn_ptr
	sharq	#8,tmp1
	addqt	#1,x
	sat8	tmp1
	subq	#1,ix
	storeb	tmp1,(rvn_ptr)
	jump	ne,(LOOPX)
	move	x,ox

	subq	#1,iz
	jump	ne,(LOOPZ)
	addq	#1,z_pos

.no_gouraud

	unreg rvn_ptr,vn_ptr,n_x,n_y,n_z,l_x,l_y,l_z
	unreg cam_sin,cam_cos,neg_cam_sin
 ENDIF
****************************************
** set triangle colors
****************************************

face_ptr	reg 99

planeSetColor::
	movei	#plane_faces+4+6,face_ptr
	movefa	z_pos.a,z_pos

	moveq	#dia-1,iz
	move	z_pos,oz
	movei	#plane_col,tmp0
._pc:
	move	PC,LOOPX
	addq	#.loopx1-._pc,LOOPX
	move	PC,LOOPZ
	addq	#4,LOOPZ
.loopz1
	movefa	x_pos.a,x
	shlq	#32-world_size_bits,oz
	shrq	#32-2*world_size_bits-1,oz
	moveq	#dia-1,ix
.loopx1
	move	x,ox
	shlq	#32-world_size_bits,ox
	shrq	#32-world_size_bits-1,ox
	add	oz,ox
	add	tmp0,ox
	loadw	(ox),tmp1

	storew	tmp1,(face_ptr)
	addq	#8,face_ptr
	addqt	#1,x
	subq	#1,ix
	storew	tmp1,(face_ptr)
	jump	ne,(LOOPX)
	addqt	#8,face_ptr

	subq	#1,iz
	addqt	#1,z_pos
	jump	ne,(LOOPZ)
	move	z_pos,oz

	POPLR

	unreg face_ptr
	unreg x,ox,oz,ix,iz,z_pos,wx,wz
	unreg LOOPX,LOOPZ
	unreg z_pos.a,x_pos.a


	dphrase
obj_plane:
	dc.w	0		; visible
	dc.w	0,0,0		; position: x,y,z
	dc.w	0		; spare
	dc.w	0,0,0		; angle: a,b,c
	dc.l	0		; plane_points
	dc.l	plane_faces
	dc.l	plane_normals
	dc.l	plane_vnormals
	dc.l	plane_rotated
	dc.l	plane_normals_rotated
	dc.l	plane_vnormals_rotated
	dc.l	plane_projected
	dc.l	plane_visible
