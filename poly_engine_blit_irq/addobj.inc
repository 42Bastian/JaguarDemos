;-*-asm-*-
****************************************
** Add an object to the draw array

tri_array	reg 14
f_ptr		reg 99
v_ptr		reg 99
f_cnt		reg 99
LR2		reg 99
y0		reg 99
z0		reg 99
y1		reg 99
z1		reg 99
y2		reg 99
z2		reg 99
lum012		reg 99
tri_ptrs	reg 99
scale		reg 99

 IF GOURAUD = 1
lum0		reg 99
lum1		reg 99
lum2		reg 99
vn_ptr		reg 99
NO_GOURAUD	reg 99
 ENDIF
LOOP	reg 99

proj_ptr	reg 15!

AddObjects::
	movei	#tri_array_ram,tri_array
	movei	#tri_ptrs_ram,tri_ptrs
	movei	#OBJECT_LIST,object_list
	load	(object_list),curr_object
 IF GOURAUD = 1
	movei	#no_gouraud,NO_GOURAUD
 ENDIF
	movei	#256<<16/far_z/3,scale
	movei	#addSingleObject,tmp1

	move	PC,LOOP
	movei	#.skip_this,LR2
	addq	#4+6,LOOP
.loop:
	loadw	(curr_object),tmp0 ; object visible?
	addqt	#4,object_list
	load	(curr_object+obj_faces),f_ptr
	shlq	#24,tmp0
	load	(curr_object+obj_facesVisible),v_ptr
	jump	ne,(LR2)
	nop
 if GOURAUD = 1
	load	(curr_object+obj_vnormals_rotated),vn_ptr
 endif
	load	(curr_object+obj_projected),proj_ptr
 if GOURAUD = 1
	movei	#USE_GOURAUD,tmp0
	load	(tmp0),tmp0
	cmpq	#0,tmp0
	jr	ne,.use_g
	nop
	xor	vn_ptr,vn_ptr
.use_g
	addqt	#4,vn_ptr
 endif
	load	(f_ptr),f_cnt
	jump	(tmp1)
	addq	#4,f_ptr

.skip_this
	load	(object_list),curr_object
	cmpq	#0,curr_object
	jump	ne,(LOOP)
	nop
 IF LANDSCAPE = 1
	;; plane
	movei	#obj_plane,curr_object
	load	(curr_object+obj_faces),f_ptr
	load	(curr_object+obj_facesVisible),v_ptr
 if GOURAUD = 1
	load	(curr_object+obj_vnormals_rotated),vn_ptr
 endif
	load	(curr_object+obj_projected),proj_ptr

 if GOURAUD = 1
	movei	#USE_GOURAUD,tmp0
	load	(tmp0),tmp0
	cmpq	#0,tmp0
	jr	ne,.use_g1
	nop
	xor	vn_ptr,vn_ptr
.use_g1
	addqt	#4,vn_ptr
 endif

	move	LR,LR2
	load	(f_ptr),f_cnt
	jump	(tmp1)
	addq	#4,f_ptr
 ELSE
	jump	(LR)
	nop
 ENDIF
skip_tri:
	subq	#1,f_cnt
	addqt	#8-2,f_ptr	; -2 because of delay slot
	jump	eq,(LR2)

addSingleObject::
	load	(v_ptr),lum012	; get visible-flag and luminance
	addqt	#4,v_ptr
	cmpq	#0,lum012
	loadw	(f_ptr),y0
	jr	mi,skip_tri
	addq	#2,f_ptr

	;; debug
//->	movefa	dump.a,r0
//->	addqt	#1,r0
//->	moveta	r0,dump.a

	loadw	(f_ptr),y1
	addq	#2,f_ptr
	loadw	(f_ptr),y2
	addq	#2,f_ptr
	loadb	(f_ptr),tmp0	; get color
	addq	#2,f_ptr

	;;
 IF GOURAUD = 1
	cmpq	#4,vn_ptr
	move	y0,lum0
	jump	eq,(NO_GOURAUD)
	move	y1,lum1
	move	y2,lum2
	shlq	#24,lum012
	shlq	#2,lum0
	shlq	#2,lum1
	shlq	#2,lum2
	add	vn_ptr,lum0
	shrq	#24,lum012
	add	vn_ptr,lum1
	add	vn_ptr,lum2
	load	(lum0),lum0
	load	(lum1),lum1
	load	(lum2),lum2
	add	lum012,lum0
	add	lum012,lum1
	add	lum2,lum012

	sat8	lum0
	sat8	lum1
	sat8	lum012

	shlq	#16,lum0
	shlq	#8,lum1
	or	lum0,lum012
	or	lum1,lum012
no_gouraud:
 ENDIF
	shlq	#3,y0
	shlq	#3,y1
	shlq	#3,y2

	load	(proj_ptr+y0),z0
	load	(proj_ptr+y1),z1
	load	(proj_ptr+y2),z2
	addq	#4,proj_ptr
	load	(proj_ptr+y0),y0
	load	(proj_ptr+y1),y1
	load	(proj_ptr+y2),y2

	add	z1,z0
	subqt	#4,proj_ptr
	add	z2,z0
	shlq	#24,tmp0
	abs	z0
	store	y0,(tri_array+4)
	mult	scale,z0	; 256*(z0+z1+z2)/3/far_z
	or	lum012,tmp0
	shrq	#16,z0
	store	tmp0,(tri_array)
	sat8	z0
	store	y1,(tri_array+8)
	shlq	#2,z0
	store	y2,(tri_array+12)
	add	tri_ptrs,z0
	load	(z0),tmp0
	store	tri_array,(z0)
	subq	#1,f_cnt
	store	tmp0,(tri_array+16) ; link new triangle
	jump	ne,(tmp1)
	addq	#20,tri_array

	jump	(LR2)
	nop

	unreg	f_ptr,v_ptr,f_cnt,tri_array, LR2, tri_ptrs
	unreg	y0,z0,y1,z1,y2,z2,proj_ptr,lum012,scale
	unreg LOOP
 IF GOURAUD = 1
	unreg	lum0,lum1,lum2,NO_GOURAUD,vn_ptr
 ENDIF
