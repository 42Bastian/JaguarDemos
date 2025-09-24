; -*-asm-*-

GOURAUD		set 1

fp_reci		equ 14		; div-table precicion
 IF max_x = 640
fp_rez		equ 5		; sub-pixel precision
 ELSE
fp_rez		equ 7		; sub-pixel precision
 ENDIF

SWITCH max_x
CASE 640
BLIT_WIDTH	equ BLIT_WID640
proj_dist	equ 240
CASE 384
BLIT_WIDTH	equ BLIT_WID384
proj_dist	equ 200
CASE 320
BLIT_WIDTH	equ BLIT_WID320
proj_dist	equ 180
CASE 256
BLIT_WIDTH	equ BLIT_WID256
proj_dist	equ 150
CASE 160
BLIT_WIDTH	equ BLIT_WID160
proj_dist	equ 100
ENDS

cam_z.a		reg 99
cam_y.a		reg 99
cam_x.a		reg 99
far_z.a		reg 99
min_max.a	reg 99
save_curr_object.a reg 99

dump.a		reg 99
dump0.a		reg 99

****************

	MODULE poly_mmu,MODend_irq
poly_mmu::
	PUSHLR

	movei	#(max_x)<<(16+fp_rez),r0	; minX:maxX
	moveta	r0,min_max.a

	movei	#CAMERA_X,r15
	load	(r15),tmp0
	load	(r15+CAMERA_Y-CAMERA_X),tmp1
	load	(r15+CAMERA_Z-CAMERA_X),tmp2
	load	(r15+FAR_Z-CAMERA_X),tmp3
	moveta	tmp0,cam_x.a
	moveta	tmp1,cam_y.a
	moveta	tmp2,cam_z.a
	moveta	tmp3,far_z.a

	movei	#tri_ptrs_ram,r0
	movei	#255,r1
	moveq	#0,r2
.clear_depthtable:
	subq	#1,r1
	store	r2,(r0)
	jr	pl,.clear_depthtable
	addq	#4,r0

//->	movefa	screen1.a,r7
//->	movei	#drawHex,r8
//->	BL	(r8)


object_list	reg 25
curr_object	reg 15

 IF 1
	movei	#OBJECT_LIST,object_list
	load	(object_list),curr_object
object_loop:
	loadb	(curr_object),tmp1
	movei	#.skip_object,tmp0
	cmpq	#0,tmp1
	jump	eq,(tmp0)
	addqt	#4,object_list

	movei	#rotate_object,tmp0
//->	movei	#no_rotate,tmp0
	moveta	curr_object,save_curr_object.a
	BL	(tmp0)

	movei	#move_object,tmp0
	BL	(tmp0)

//->	movei	#in_sight,tmp0
//->	BL	(tmp0)
//->	cmpq	#0,r0
//->	jr	ne,.ok_object
//->	nop
//->	movei	#.skip_object,r0
//->	jump	(r0)
//->	nop
//->
//->.ok_object:

	movei	#check_faces_visible,r0
	BL	(r0)

	movei	#project_object,r0
	BL	(r0)

	movei	#gouraud,r0
	BL	(r0)

	moveq	#0,tmp0
	storeb	tmp0,(curr_object)

.skip_object
	load	(object_list),curr_object
	movei	#object_loop,tmp0
	cmpq	#0,curr_object
	jump	ne,(tmp0)
	nop

.done:
	movei	#AddObjects,r0
	BL	(r0)

****************
* CLS

blitter		reg 14
screen_ptr	reg 99

CLS::
	movei	#BLIT_A1_BASE,blitter
	movefa	screen0.a,screen_ptr

	movei	#BLIT_PITCH1|BLIT_PIXEL32|BLIT_WID3584|BLIT_XADDPHR,tmp0
	store	screen_ptr,(blitter)
	store	tmp0,(blitter+4)
	moveq	#0,tmp0
	store	tmp0,(blitter+_BLIT_A1_PIXEL)	; pel ptr
	movei	#1<<16|(max_x*max_y>>1),tmp1
	store	tmp1,(blitter+_BLIT_COUNT)
//->	moveq	#BLIT_LFU_ZERO,tmp0 		; == 0!
	store	tmp0,(blitter+_BLIT_CMD)

//->	WAITBLITTER

 UNREG blitter,screen_ptr

 ENDIF
//->	movei	#Dump,r0
//->	movefa	screen0.a,r11
//->	BL	(r0)

//->	movei	#tri_ptrs_ram,r9
//->	load	(r9),r0
//->	shrq	#2,r0
//->	movei	#drawHex,r8
//->	movefa	dump.a,r0
//->	move	r11,r7
//->	BL	(r8)

	moveq	#0,r0
	moveta	r0,dump.a
	movei	#Drawfaces,r0
	BL	(r0)

//->	movei	#drawHex,r8
//->	movefa	screen0.a,r11
//->	movefa	dump.a,r0
//->	movei	#tri_ptrs_ram,r0
//->	load	(r0),r0
//->	shrq	#2,r0
//->	move	r11,r7
//->	BL	(r8)

	POPLR

Dump::
	PUSHLR
	movei	#drawHex,r8
	movei	#OBJECT_PTR,r9
	load	(r9),r9
	load	(r9),r9
	movei	#obj_vnormals_rotated,r10
	add	r10,r9
	load	(r9),r9
	moveq	#20,r10
.dump
	move	r11,r7
	move	pc,LR
	jr	xd1
	addq	#2,r7
	jr	xd
	addq	#2,r7
	jr	xd
	addq	#2,r7
xd1	jr	xd
	addq	#2,r7
	movei	#max_x*2*6,r0
	add	r0,r11
	subq	#1,r10
	jr	ne,.dump
	nop
	addq	#4,r9
	jr	.exit

xd:
	load	(r9),r0
	addq	#4,LR
	jump	(r8)
	addq	#4,r9

.exit
	POPLR

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

	move	a,c
	move	a,e
	shlq	#16,c
	shlq	#24,e
	shrq	#16,a
	shrq	#24,c
	moveq	#0,tmp0
	shrq	#24,e
	bset	#6,tmp0

	move	a,b
	add	tmp0,a
	move	c,d
	add	tmp0,c
	move	e,f
	add	tmp0,e

	shlq	#2,b
	shlq	#2,d
	shlq	#2,f

	shlq	#24,a
	shlq	#24,c
	shlq	#24,e

	shrq	#22,a
	shrq	#22,c
	shrq	#22,e

	movei	#SinTab,r14
	load	(r14+a),a	; sin alpha
	load	(r14+b),b	; cos alpha
	load	(r14+c),c	; sin beta
	load	(r14+d),d	; cos beta
	load	(r14+e),e	; sin gamma
	load	(r14+f),f	; cos gamma
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

x1		reg 99
y1		reg 99
z1		reg 99
xyz_ptr		reg 99
LR2		reg 99

	load	(curr_object+obj_points),xyz_ptr
	load	(curr_object+obj_rotated),rotated
	movei	#$3fff,tmp3
	move	pc,LR2
	jr	rotate_points
	addq	#6,LR2

	load	(curr_object+obj_normals),xyz_ptr
	load	(curr_object+obj_normals_rotated),rotated
	jr	rotate_points
	addq	#8,LR2

	load	(curr_object+obj_vnormals),xyz_ptr
	load	(curr_object+obj_vnormals_rotated),rotated
	cmpq	#0,xyz_ptr
	move	LR,LR2
	jump	eq,(LR)
***************
rotate_points:
	load	(xyz_ptr),counter
	addq	#6,xyz_ptr
	store	counter,(rotated)
	addq	#4,rotated

	loadw	(xyz_ptr),x1
	addqt	#2,xyz_ptr
	loadw	(xyz_ptr),y1
	addqt	#2,xyz_ptr
	loadw	(xyz_ptr),z1
	addqt	#4,xyz_ptr

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

	loadw	(xyz_ptr),x1
	addqt	#2,xyz_ptr
	add	tmp3,tmp0
	add	tmp3,tmp1
	add	tmp3,tmp2
	loadw	(xyz_ptr),y1
	addqt	#2,xyz_ptr
	sharq	#15,tmp0
	sharq	#15,tmp1
	sharq	#15,tmp2
	loadw	(xyz_ptr),z1
	addqt	#4,xyz_ptr
	store	tmp0,(rotated)
	store	tmp1,(rotated+4)
	subq	#1,counter
	store	tmp2,(rotated+8)
	jump	ne,(LOOP)
	addqt	#16,rotated

	jump	(LR2)
	nop

	UNREG m1,m2,m3,m4,m5,m6,m7,m8,m9
	UNREG rotated
	unreg xyz_ptr,x1,y1,z1,counter
	unreg LOOP,LR2

****************************************
** Copy original to "rotated" w/o rotating
**
rotated		reg 14

counter		REG 99
x1		reg 99
y1		reg 99
z1		reg 99
xyz_ptr		reg 99

no_rotate::
	load	(curr_object+obj_points),xyz_ptr
	load	(xyz_ptr),counter
	load	(curr_object+obj_rotated),rotated
	addq	#4,xyz_ptr
	store	counter,(rotated)
	addq	#4,rotated
***************
.loop
	load	(xyz_ptr),x1
	addqt	#4,xyz_ptr
	load	(xyz_ptr),y1
	addq	#4,xyz_ptr
	move	y1,z1
	shlq	#16,x1
	sharq	#16,x1
	shlq	#16,z1
	sharq	#16,y1
	sharq	#16,z1
	store	x1,(rotated)
	store	y1,(rotated+4)
	subq	#1,counter
	store	z1,(rotated+8)
	jr	ne,.loop
	addq	#16,rotated

	load	(curr_object+obj_normals),xyz_ptr
	load	(xyz_ptr),counter
	load	(curr_object+obj_normals_rotated),rotated
	addq	#4,xyz_ptr
	store	counter,(rotated)
	addq	#4,rotated
***************
.loop2
	load	(xyz_ptr),x1
	addqt	#4,xyz_ptr
	load	(xyz_ptr),y1
	addq	#4,xyz_ptr
	move	y1,z1
	shlq	#16,x1
	sharq	#16,x1
	shlq	#16,z1
	sharq	#16,y1
	sharq	#16,z1
	store	x1,(rotated)
	store	y1,(rotated+4)
	subq	#1,counter
	store	z1,(rotated+8)
	jr	ne,.loop2
	addq	#16,rotated

	jump	(LR)
	nop

	unreg rotated, counter, x1,y1,z1, xyz_ptr
****************************************
** Move object

moved		reg 15!
rotated		reg 14

counter		reg 99
x_pos		reg 99
y_pos		reg 99
z_pos		reg 99
x0		reg 99
y0		reg 99
z0		reg 99

move_object::
	load	(curr_object+obj_rotated),rotated
	load	(curr_object+obj_changed),x_pos
	load	(curr_object+obj_y),y_pos
	load	(curr_object+obj_moved),moved

	shlq	#16,x_pos
	move	y_pos,z_pos
	sharq	#16,x_pos
	shlq	#16,z_pos
	sharq	#16,y_pos
	sharq	#16,z_pos

	load	(rotated),counter
	addq	#4,rotated
	store	counter,(moved)
	addq	#4,moved
.loop
	load	(rotated),x0
	load	(rotated+4),y0
	load	(rotated+8),z0
	addq	#16,rotated
	add	x_pos,x0
	add	y_pos,y0
	add	z_pos,z0
	store	x0,(moved)
	store	y0,(moved+4)
	subq	#1,counter
	store	z0,(moved+8)
	jr	ne,.loop
	addq	#16,moved

	jump	(LR)
	movefa	save_curr_object.a,curr_object

	unreg rotated,moved
	unreg x_pos,y_pos,z_pos
	unreg counter,x0,y0,z0

 IF 0
****************************************
** Check if object as is completely in sight
**

cam_z	reg 99
far_z	reg 99
m_ptr	reg 99
p_cnt	reg 99
min_z	reg 99
max_z	reg 99
offset	reg 99

in_sight::
	load	(curr_object+obj_points),p_cnt
	load	(curr_object+obj_moved),m_ptr
	load	(p_cnt),p_cnt
	movei	#10000,offset
	movefa	cam_z.a,cam_z
	movefa	far_z.a,far_z
	move	cam_z,tmp0
	add	offset,far_z
	sharq	#2,tmp0
	move	far_z.a,min_z
	sub	tmp0,cam_z
	add	offset,min_z
	add	offset,cam_z
	addq	#4+8,m_ptr	; skip counter and x/y
	moveq	#0,max_z
	load	(m_ptr),tmp0	; get Z
.loop:
	add	offset,tmp0
	addq	#16,m_ptr	; next point
	cmp	tmp0,min_z
	jr	mi,.larger
	cmp	tmp0,max_z
	move	tmp0,min_z
.larger:
	jr	pl,.smaller
	subq	#1,p_cnt
	move	tmp0,max_z
.smaller:
	jr	ne,.loop
	load	(m_ptr),tmp0

	move	curr_object,tmp1
	xor	tmp0,tmp0
	addq	#1,tmp1
	cmp	cam_z,min_z
	storeb	tmp0,(tmp1)
	jump	mi,(LR)
	cmp	max_z,far_z
	jump	mi,(LR)
	nop
	moveq	#1,tmp0
	jump	(LR)
	storeb	tmp0,(tmp1)

	unreg cam_z, far_z, m_ptr, p_cnt, min_z, max_z, offset
 ENDIF
****************************************
** record visibility for each face
**
** visible = (p1 - camera) * normal > 0
**

m_ptr		reg 14
n_ptr		reg 99
f_ptr		reg 99
v_ptr		reg 99
NO_GOURAUD		reg 99
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

NO_LUM		reg 99
LOOP		reg 99

check_faces_visible::
	movei	#LIGHT_X,r14
	load	(r14),l_x
	load	(r14+4),l_y
	load	(r14+8),l_z
	load	(curr_object+obj_faces),f_ptr
	load	(curr_object+obj_moved),m_ptr
	load	(curr_object+obj_normals_rotated),n_ptr
 IF GOURAUD = 1
	load	(curr_object+obj_vnormals_rotated),NO_GOURAUD
 ELSE
	moveq	#0,NO_GOURAUD
 ENDIF
	load	(curr_object+obj_facesVisible),v_ptr
	load	(f_ptr),f_counter
	addq	#4,f_ptr
	addq	#4,m_ptr	; skip counter
	addq	#4,n_ptr	; skip counter
	movei	#no_lum,NO_LUM

	move	PC,LOOP
	addq	#4,LOOP
.loop
	loadw	(f_ptr),z0	; p1
	addq	#7,f_ptr	; point to base luminance
	load	(n_ptr),n_x
	addq	#4,n_ptr
	shlq	#1,z0		; 3D offset
	load	(m_ptr+z0),x0
	addq	#4,z0
	load	(n_ptr),n_y
	addq	#4,n_ptr
	movefa	cam_x.a,tmp0
	load	(m_ptr+z0),y0
	addq	#4,z0
	movefa	cam_y.a,tmp1
	load	(n_ptr),n_z
	addq	#8,n_ptr
	sub	tmp0,x0
	load	(m_ptr+z0),z0	; p1
	movefa	cam_z.a,tmp2
	sub	tmp1,y0
	sub	tmp2,z0		; p1-camera

	imultn	x0,n_x
	imacn	y0,n_y
	imacn	z0,n_z
	resmac	tmp0

	sharq	#31,tmp0
	storeb	tmp0,(v_ptr)	; > 0 => visible
	jump	mi,(NO_LUM)
	addqt	#1,v_ptr	; skip vis-flag

	cmpq	#0,NO_GOURAUD
	jr	eq,.no_gouraud
	loadb	(f_ptr),r0		; get base luminance
	jr	.gouraud
	move	r0,r1
.no_gouraud

	imultn	l_x,n_x
	imacn	l_y,n_y
	imacn	l_z,n_z
	resmac	tmp1

	sharq	#8,tmp1
	sat8	tmp1
	add	r0,tmp1
	sat8	tmp1

.gouraud
	storeb	tmp1,(v_ptr)

	addq	#1,v_ptr
	storeb	tmp1,(v_ptr)

	addq	#1,v_ptr
	storeb	tmp1,(v_ptr)

	subqt	#2,v_ptr
no_lum
	subq	#1,f_counter
	addqt	#1,f_ptr
	jump	ne,(LOOP)
	addqt	#3,v_ptr

	jump	(LR)
	nop

	unreg m_ptr,n_ptr,f_ptr,v_ptr,NO_GOURAUD
	unreg f_counter,LOOP,NO_LUM
	unreg x0,y0,z0,n_x,n_y,n_z,l_x,l_y,l_z

****************
* gouraud lightning
*
vn_ptr		reg 14

g_ptr		reg 99
p_cnt		reg 99
v_ptr		reg 99
l_x		reg 99
l_y		reg 99
l_z		reg 99
LOOP		reg 99
vn_x		reg 99
vn_y		reg 99
vn_z		reg 99

gouraud::
	movei	#LIGHT_X,r14
	load	(r14),l_x
	load	(r14+4),l_y
	load	(r14+8),l_z

	load	(curr_object+obj_vnormals_rotated),vn_ptr
	cmpq	#0,vn_ptr
	load	(vn_ptr),p_cnt
	jump	eq,(LR)
	addq	#4,vn_ptr
	move	vn_ptr,g_ptr

	move	pc,LOOP
	addq	#4,LOOP
.loop
	load	(vn_ptr),vn_x
	load	(vn_ptr+4),vn_y
	load	(vn_ptr+8),vn_z
	addq	#16,vn_ptr

	imultn	l_x,vn_x
	imacn	l_y,vn_y
	imacn	l_z,vn_z
	resmac	tmp1

	sharq	#8,tmp1
	sat8	tmp1
	subq	#1,p_cnt
	store	tmp1,(g_ptr)
	jr	ne,.loop
	addq	#8,g_ptr

	jump	(LR)
	nop

	unreg	vn_ptr,v_ptr,p_cnt,g_ptr
	unreg	l_x,vn_x
	unreg	l_y,vn_y
	unreg	l_z,vn_z
	unreg	LOOP
****************
* 3D->2D
*          (x'+x_pos)*dist
* x_proj = ---------------
*           z'+z_pos+dist
*
*          (y'+y_pos)*dist
* y_proj = ---------------
*           z'+z_pos+dist
****************
m_ptr		reg 14


m_cnt		reg 99
x1		reg 99
y1		reg 99
z1		reg 99
dist		REG 99
xcenter		REG 99
ycenter		REG 99
proj_ptr	reg 99
LOOP		reg 99
mask		reg 99

PROJ_REZ	equ 12

project_object::
	load	(curr_object+obj_moved),m_ptr
	movei	#proj_dist<<PROJ_REZ,dist
	load	(m_ptr),m_cnt
	addq	#4,m_ptr
	movei	#(max_x>>1),xcenter
	movei	#(max_y>>1),ycenter
	load	(curr_object+obj_projected),proj_ptr
	movei	#$0000ffff,mask
	move	pc,LOOP
	addq	#4,LOOP
.loop
	load	(m_ptr),x1
	load	(m_ptr+4),y1
	load	(m_ptr+8),z1
	movefa	cam_x.a,tmp0
	movefa	cam_y.a,tmp1
	sub	tmp0,x1
	movefa	cam_z.a,tmp0
	sub	tmp1,y1
	store	z1,(proj_ptr)
	sub	tmp0,z1
	move	dist,tmp1
	jr	mi,.p1
	div	z1,tmp1
	addqt	#16,m_ptr

	imult	tmp1,y1
	imult	tmp1,x1

	sharq	#PROJ_REZ,y1
	sharq	#PROJ_REZ,x1
.p1
	neg	y1
	add	xcenter,x1
	add	ycenter,y1
	shlq	#16,x1
	and	mask,y1
	addq	#4,proj_ptr
	or	x1,y1
	subq	#1,m_cnt
	store	y1,(proj_ptr)	; save Xscreen/Yscreen
	jump	nz,(LOOP)
	addqt	#4,proj_ptr

	jump	(LR)
	nop

	UNREG m_cnt,m_ptr,LOOP
	UNREG dist,xcenter,ycenter
	UNREG x1,y1,z1
	UNREG proj_ptr,mask

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
lum0		reg 99
lum1		reg 99
lum2		reg 99

tri_ptrs	reg 99
scale		reg 99
vn_ptr		reg 99
NO_GOURAUD	reg 99
proj_ptr	reg 15!

AddObjects::
	movei	#tri_array_ram,tri_array
	movei	#tri_ptrs_ram,tri_ptrs
	movei	#OBJECT_LIST,object_list
	load	(object_list),curr_object
	movei	#no_gouraud,NO_GOURAUD
	movefa	far_z.a,scale
	movefa	cam_z.a,tmp0
	sub	tmp0,scale
	movei	#addSingleObject,tmp1
	abs	scale
	movei	#.skip_this,LR2
.loop:
	loadw	(curr_object),tmp0 ; object visible?
	addqt	#4,object_list
	load	(curr_object+obj_faces),f_ptr
	shlq	#24,tmp0
	load	(curr_object+obj_facesVisible),v_ptr
	jump	eq,(LR2)
 if GOURAUD = 1
	load	(curr_object+obj_vnormals_rotated),vn_ptr
 else
	moveq	#0,vn_ptr
 endif
	load	(curr_object+obj_projected),proj_ptr

	addq	#4,vn_ptr
	load	(f_ptr),f_cnt
	jump	(tmp1)
	addq	#4,f_ptr

.skip_this
	load	(object_list),curr_object
	cmpq	#0,curr_object
	jr	ne,.loop
	nop

	jump	(LR)
	nop

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
	loadw	(f_ptr),y1
	addq	#2,f_ptr
	loadw	(f_ptr),y2
	addq	#2,f_ptr
	loadb	(f_ptr),tmp0	; get color
	addq	#2,f_ptr

	cmpq	#4,vn_ptr
	move	y0,lum0
	jump	eq,(NO_GOURAUD)
	move	y1,lum1
	move	y2,lum2
	shlq	#24,lum012
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
	load	(proj_ptr+y0),z0
	load	(proj_ptr+y1),z1
	load	(proj_ptr+y2),z2
	addq	#4,proj_ptr
	load	(proj_ptr+y0),y0
	load	(proj_ptr+y1),y1
	load	(proj_ptr+y2),y2

//->	cmp	y0,y1
//->	subqt	#4,proj_ptr
//->	jr	ne,.neq
//->	cmp	y0,y2
//->	jump	eq,(tmp1)
//->.neq
	cmp	z1,z0
	jr	pl,.z0
	nop
	move	z1,z0
.z0
	cmp	z2,z0
	jr	pl,.z01
	nop
	move	z2,z0
.z01
	shlq	#8,z0
	subqt	#4,proj_ptr
	jump	mi,(tmp1)
	div	scale,z0
	shlq	#24,tmp0
	store	y0,(tri_array+4)
	or	lum012,tmp0
	store	y1,(tri_array+8)
	store	tmp0,(tri_array)
	store	y2,(tri_array+12)

	sat8	z0
	shlq	#2,z0
	add	tri_ptrs,z0
	load	(z0),tmp0
	store	tri_array,(z0)
	subq	#1,f_cnt
	store	tmp0,(tri_array+16) ; link new triangle
	jump	ne,(tmp1)
	addq	#20,tri_array

	jump	(LR2)
	nop

	unreg	f_ptr,v_ptr,f_cnt,tri_array, LR2, tri_ptrs,vn_ptr
	unreg	y0,z0,y1,z1,y2,z2,proj_ptr,lum012,scale
	unreg	lum0,lum1,lum2,NO_GOURAUD

;; ----------------------------------------
	include "draw.inc"

	align 8

	unreg	object_list
	unreg	cam_x.a,cam_y.a,cam_z.a,far_z.a
	unreg	min_max.a, save_curr_object.a

	ENDMODULE poly_mmu


	echo "ENDE (poly_mmu): %HMODend_poly_mmu"
