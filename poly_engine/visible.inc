;-*-asm-*-

** record visibility for each face
**
** visible = (p1 - camera) * normal > 0
**

m_ptr		reg 14
n_ptr		reg 99
f_ptr		reg 99
v_ptr		reg 99
 IF GOURAUD = 1
NO_GOURAUD	reg 99
 ENDIF
f_counter	reg 99
x0		reg 99
y0		reg 99
z0		reg 99
n_x		reg 99
n_y		reg 99
n_z		reg 99
l_x		reg 99
l_y		reg 99
l_z		reg 99
z1		reg 99
z2		reg 99
NO_LUM		reg 99
LOOP		reg 99
min_z		reg 99

check_faces_visible::
	movei	#RLIGHT_X,r14
	load	(r14),l_x
	load	(r14+4),l_y
	load	(r14+8),l_z
	load	(curr_object+obj_faces),f_ptr
	load	(curr_object+obj_rotated),m_ptr
	load	(curr_object+obj_normals_rotated),n_ptr
 IF GOURAUD = 1
	movei	#USE_GOURAUD,tmp0
	load	(tmp0),tmp0
	cmpq	#0,tmp0
	load	(curr_object+obj_vnormals_rotated),NO_GOURAUD
	jr	ne,.use_g
	nop
	xor	NO_GOURAUD,NO_GOURAUD
.use_g
 ENDIF
	load	(curr_object+obj_facesVisible),v_ptr
	load	(f_ptr),f_counter
	addq	#4,f_ptr
	addq	#4,m_ptr	; skip counter => point to Z
	addq	#4,n_ptr	; skip counter

	move	PC,LOOP
	movei	#no_lum,NO_LUM
	addq	#4+6,LOOP
.loop
	loadw	(f_ptr),z0	; p0
	addq	#2,f_ptr
	loadw	(f_ptr),z1	; p1
	addq	#2,f_ptr
	loadw	(f_ptr),z2	; p2
	addq	#3,f_ptr	; point to base luminance
	shlq	#4,z0		; 3D offset
	shlq	#4,z1		; 3D offset
	addq	#8,m_ptr
	shlq	#4,z2		; 3D offset

	load	(m_ptr+z0),tmp0
	load	(m_ptr+z1),tmp1
	load	(m_ptr+z2),tmp2
	subqt	#8,m_ptr
	move	tmp0,min_z
	load	(m_ptr+z0),x0
	addqt	#4,z0
	load	(m_ptr+z0),y0

	load	(n_ptr),n_x
	addq	#4,n_ptr
	load	(n_ptr),n_y
	addq	#4,n_ptr
	load	(n_ptr),n_z

	cmp	min_z,tmp1
	jr	pl,.z1
	nop
	move	tmp1,min_z
	load	(m_ptr+z1),x0
	addq	#4,z1
	load	(m_ptr+z1),y0

.z1	cmp	min_z,tmp2
	jr	pl,.z2
	bset	#31,tmp0	; set "invisible" flag
	load	(m_ptr+z2),x0
	addq	#4,z2
	load	(m_ptr+z2),y0
	move	tmp2,min_z
.z2
//->	addq	#8,min_z
//->	cmpq	#0,min_z
 IF near_z > 31
	movei	#near_z,tmp3
 ELSE
	moveq	#near_z,tmp3
 ENDIF
//->	jr	mi,.skip
	cmp	min_z,tmp3
	jr	pl,.skip
	nop
	imultn	x0,n_x		; backface culling
	imacn	y0,n_y
	imacn	min_z,n_z
	resmac	tmp0

.skip
	sharq	#31,tmp0
	addqt	#8,n_ptr
	jump	mi,(NO_LUM)
	store	tmp0,(v_ptr)	; > 0 => visible

 IF GOURAUD = 1
	cmpq	#0,NO_GOURAUD
	loadb	(f_ptr),tmp0		; get base luminance
	jr	ne,.gouraud
 ELSE
	loadb	(f_ptr),tmp0		; get base luminance
 ENDIF
	addqt	#1,v_ptr		; skip vis-flag

	imultn	l_x,n_x
	imacn	l_y,n_y
	imacn	l_z,n_z
	resmac	tmp1

	sharq	#8,tmp1
	sat8	tmp1
	add	tmp1,tmp0
	sat8	tmp0
.gouraud
 IF ambient <> 0
	addq	#ambient,tmp0
	sat8	tmp0
 ENDIF
	storeb	tmp0,(v_ptr)

	addq	#1,v_ptr
	storeb	tmp0,(v_ptr)

	addq	#1,v_ptr
	storeb	tmp0,(v_ptr)

	subqt	#3,v_ptr
no_lum
	subq	#1,f_counter
	addqt	#1,f_ptr
	jump	ne,(LOOP)
	addqt	#4,v_ptr

	jump	(LR)
	nop

 IF GOURAUD = 1
	unreg NO_GOURAUD
 ENDIF

	unreg m_ptr,n_ptr,f_ptr,v_ptr
	unreg f_counter,LOOP,NO_LUM
	unreg x0,y0,z0,n_x,n_y,n_z,l_x,l_y,l_z
	unreg z1,z2,min_z
