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
rvn_ptr		reg 99


rx		reg wx!
ry		reg ox!
rz		reg wz!

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

 IF dia < 32
	moveq	#dia,iz
 else
	movei	#dia,iz
 endif
	movei	#plane_y,plane_source
	movei	#plane_projected,projected
	movei	#plane_rotated+4,rotated
	movei	#plane_vnormals_rotated+4,rvn_ptr

	move	z_pos,oz
._pc	move	PC,LOOPX
	addq	#.loopx-._pc,LOOPX
	move	pc,LOOPZ
	addq	#4,LOOPZ
.loopz:
	shlq	#32-world_size_bits,oz
	shrq	#32-2*world_size_bits,oz
	movefa	x_pos.a,x
 IF dia < 32
	moveq	#dia,ix
 else
	movei	#dia,ix
 endif
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
	resmac	rx
	move	tmp2,rz

	loadb	(ox),ry

	movei	#dark_dist*dark_dist,tmp2

	sharq	#15,rx
	sub	cam_y,ry
	subq	#4,rotated
	store	ry,(rotated)	; 3D y
	subq	#4,rotated
	store	rx,(rotated)	; 3D x

	imultn	rz,rz		; z^2
	imacn	rx,rx		; +x^2
	resmac	tmp0

	imult	tmp3,rx
	imult	tmp3,ry

	sub	tmp2,tmp0
	addqt	#16,rotated
	jr	mi,.no_darken
	moveq	#0,tmp2

//->	neg	r0
	move	r0,r2
	sat8	r2

.no_darken
	store	tmp2,(rvn_ptr)
	addq	#4,rvn_ptr

	sharq	#7,rx
	sharq	#7,ry

 IF max_x = 384
_fix_ntsc_aspect2:
	moveq	#aspect_patch_pal,tmp2
//->	moveq	#aspect_patch_ntsc,tmp2
	imult	tmp2,rx
	sharq	#5,rx
 ENDIF
 IF max_x = 320
_fix_ntsc_aspect2:
	moveq	#aspect_patch_pal,tmp2
;;->	moveq	#aspect_patch_ntsc,tmp2
	imult	tmp2,rx
	sharq	#4,rx
 ENDIF
 IF max_x = 640
_fix_ntsc_aspect2:
	movei	#aspect_patch_pal,tmp2
//->	movei	#aspect_patch_ntsc,tmp2
//->	imult	tmp2,ry
//->	sharq	#6,ry
 ENDIF
	neg	ry
	add	xcenter,rx
	add	ycenter,ry

	shlq	#16,rx
	shlq	#16,ry
	shrq	#16,ry
	or	rx,ry
	store	ry,(projected+4)	; save Xscreen/Yscreen

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
	unreg rotated,rvn_ptr
	unreg rx,ry,rz
****************************************
** rotate normals
****************************************
n_ptr		reg 14
rn_ptr		reg 15
n_x		reg 99
n_y		reg 99
n_z		reg 99

	movefa	z_pos.a,z_pos

 IF dia < 33
	moveq	#dia-1,iz
 else
	movei	#dia-1,iz
 endif
	movei	#plane_normals,n_ptr
	movei	#plane_normals_rotated+4,rn_ptr
//->	movei	#$3fff,tmp3
._pc0	move	PC,LOOPX
	addq	#.loopx0-._pc0,LOOPX
	move	pc,LOOPZ
	addq	#4,LOOPZ
.loopz0:
	move	z_pos,oz
	shlq	#32-world_size_bits,oz
	shrq	#32-2*world_size_bits-4,oz
	movefa	x_pos.a,x
 IF dia < 33
	moveq	#dia-1,ix
 else
	movei	#dia-1,ix
 endif
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

;;->	add	tmp3,tmp0
;;->	add	tmp3,tmp1

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

;;->	add	tmp3,tmp0
;;->	add	tmp3,tmp1

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
** Calculate per vertex luminance
** XXX: Can be done once for all vertexes then only copy
**      the ones needed unless LIGHT vector changes.
****************************************
vn_ptr		reg 14
rvn_ptr		reg 15
n_x		reg 99
n_y		reg 99
n_z		reg 99

l_x		reg 99
l_y		reg 99
l_z		reg 99

planeCalcLuminance::
	movei	#.no_gouraud,r1
	movei	#USE_GOURAUD,r0
	load	(r0),r0
	movei	#LIGHT_X,r14	; light vector
	cmpq	#0,r0
	load	(r14),l_x
	jump	eq,(r1)
	load	(r14+4),l_y
	load	(r14+8),l_z

	movefa	z_pos.a,z_pos

 IF dia < 32
	moveq	#dia,iz
 else
	movei	#dia,iz
 endif
	;; storage for vertex luminance, skip count and compensate pre-increment
	movei	#plane_vnormals_rotated+4,rvn_ptr

	;; base vertex normals
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
 IF dia < 32
	moveq	#dia,ix
 else
	movei	#dia,ix
 endif
.loopx0
	shlq	#32 - world_size_bits,ox
	shrq	#32 - world_size_bits-3,ox
	add	oz,ox

	load	(vn_ptr+ox),n_x	; 0:x
	addq	#4,ox
	load	(vn_ptr+ox),n_y  ; n_y|n_z
	move	n_y,n_z
	sharq	#16,n_y

	imultn	l_x,n_x		; now calculate luminance
	imacn	l_y,n_y
	imacn	l_z,n_z
	resmac	tmp1

	load	(rvn_ptr),tmp0	; darken
	sharq	#8,tmp1
	sat8	tmp1
	sub	tmp0,tmp1
	addqt	#1,x

	subq	#1,ix
	store	tmp1,(rvn_ptr)	; just store it, vnormals not needed
	addqt	#4,rvn_ptr
	jump	ne,(LOOPX)
	move	x,ox

	subq	#1,iz
	jump	ne,(LOOPZ)
	addq	#1,z_pos

.no_gouraud

	unreg rvn_ptr,vn_ptr,n_x,n_y,n_z,l_x,l_y,l_z
 ENDIF
	unreg cam_sin,cam_cos,neg_cam_sin
****************************************
** set triangle colors
****************************************

face_ptr	reg 99

planeSetColor::
	movei	#plane_faces+4+6,face_ptr
	movefa	z_pos.a,z_pos

 IF dia < 33
	moveq	#dia-1,iz
 else
	movei	#dia-1,iz
 endif
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
 IF dia < 33
	moveq	#dia-1,ix
 else
	movei	#dia-1,ix
 endif
.loopx1
	move	x,ox
	shlq	#32-world_size_bits,ox
	shrq	#32-world_size_bits-1,ox
	add	oz,ox
	add	tmp0,ox
	loadw	(ox),tmp1
 IF TEXTURE = 1
	movei	#%10001101<<8,tmp2
	shrq	#8,tmp1
	movei	#%10001011<<8,tmp1
	jr	ne,.sea
	nop
	bset	#6+8,tmp1
	bset	#6+8,tmp2
.sea
 ELSE
	move	tmp1,tmp2
 ENDIF
	storew	tmp1,(face_ptr)
	addq	#8,face_ptr
	addqt	#1,x
	subq	#1,ix
	storew	tmp2,(face_ptr)
	jump	ne,(LOOPX)
	addqt	#8,face_ptr

	subq	#1,iz
	addqt	#1,z_pos
	jump	ne,(LOOPZ)
	move	z_pos,oz

	POPLR

	unreg face_ptr
	unreg x,ox,oz,ix,iz,z_pos,wz,wx
	unreg LOOPX,LOOPZ
	unreg z_pos.a,x_pos.a

 IF 0
sqrt::
	normi	r0,r1
	move	r0,r2
	addq	#23,r1
	moveq	#0,r0
	bclr	#0,r1
	moveq	#1,r3
	neg	r1
	jr	.enter
	sh	r1,r3
.loop
	shrq	#2,r3
.enter
	move	r0,r1
	jump	eq,(LR)
	add	r3,r1
	cmp	r1,r2
	jr	cs,.loop
	shrq	#1,r0
	sub	r1,r2
	jr	.loop
	add	r3,r0
 ENDIF

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
