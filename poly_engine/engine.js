 -*-asm-*-

SWITCH max_x
CASE 640
BLIT_WIDTH	equ BLIT_WID640
proj_dist_x	equ 320
proj_dist_y	equ 200
CASE 384
BLIT_WIDTH	equ BLIT_WID384
proj_dist_x	equ 200*2
proj_dist_y	equ 200*2
CASE 320
BLIT_WIDTH	equ BLIT_WID320
proj_dist_x	equ 160
proj_dist_y	equ 200
CASE 256
BLIT_WIDTH	equ BLIT_WID256
proj_dist_x	equ 130
proj_dist_y	equ 190
CASE 160
BLIT_WIDTH	equ BLIT_WID160
proj_dist	equ 100
ENDS

cam_z.a		reg 99
cam_y.a		reg 99
cam_x.a		reg 99

 IFND DRAW2
min_max.a	reg 99
 ENDIF
save_curr_object.a reg 99

dump.a		reg 99
dump0.a		reg 99

;;->	if (max_x << fp_rez) > $ffff
;;->	fail "fp_rez to large"
;;->	endif
****************

	MODULE engine,MODend_irq
engine::
	PUSHLR

 IFND DRAW2
	movei	#(max_x)<<(16),r0	; minX:maxX
	moveta	r0,min_max.a
 ENDIF
	movei	#CAMERA_X,r15
	load	(r15),tmp0
	load	(r15+_CAMERA_Y),tmp1
	load	(r15+_CAMERA_Z),tmp2
	shlq	#16,tmp0
	shlq	#16,tmp1
	shlq	#16,tmp2
	sharq	#16,tmp0
	sharq	#16,tmp1
	sharq	#16,tmp2
	moveta	tmp0,cam_x.a
	moveta	tmp1,cam_y.a
	moveta	tmp2,cam_z.a

	;; rotate light vector
cam_sin		reg 99
neg_cam_sin	reg 99
cam_cos		reg 99

	load	(r15+_CAMERA_ANGLE_Y),tmp0
	movei	#SinTab,tmp1
	movei	#SinTab+128*4,tmp2
	add	tmp0,tmp1
	add	tmp0,tmp2
	load	(tmp1),cam_sin
	load	(tmp2),cam_cos
	move	cam_sin,neg_cam_sin
	neg	neg_cam_sin

	load	(r15+_LIGHT_X),tmp0
	load	(r15+_LIGHT_Y),tmp1
	load	(r15+_LIGHT_Z),tmp2
	store	tmp1,(r15+_RLIGHT_Y)

	imultn	cam_cos,tmp0
	imacn	cam_sin,tmp2
	resmac	tmp1
	sharq	#15,tmp1
	store	tmp1,(r15+_RLIGHT_X)

	imultn	neg_cam_sin,tmp0
	imacn	cam_cos,tmp2
	resmac	tmp1
	sharq	#15,tmp1
	store	tmp1,(r15+_RLIGHT_Z)

	unreg	cam_sin, neg_cam_sin, cam_cos

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

	movei	#$db000,r0
	moveta	r0,dump0.a


	movei	#createPlane,r0
	BL	(r0)

object_list	reg 25
curr_object	reg 15

	;; debug
	moveq	#0,r0
	moveta	r0,dump.a
	;;

	movei	#obj_plane,curr_object
	movei	#check_faces_visible,r0
	BL	(r0)

 IF GOURAUD = 1
	movei	#USE_GOURAUD,r0
	load	(r0),r0
	cmpq	#0,r0
	movei	#gouraud,r0
	move	PC,LR
	jump	ne,(r0)
	addq	#6,LR
 ENDIF

 IF 1
	movei	#OBJECT_LIST,object_list
	load	(object_list),curr_object
object_loop:
	addqt	#4,object_list
	moveq	#0,r0
	storew	r0,(curr_object) ; flag: object visible

	;; object center < far_z?
	move	curr_object,tmp0
	addqt	#obj_x,tmp0
	loadw	(tmp0),tmp1
	addq	#4,tmp0
	movefa	cam_x.a,tmp2
	loadw	(tmp0),tmp0
	movefa	cam_z.a,tmp3
	sub	tmp2,tmp1
	sub	tmp3,tmp0

	movei	#far_z*far_z,tmp2

	imultn	tmp1,tmp1
	imacn	tmp0,tmp0
	resmac	tmp0

	cmp	tmp0,tmp2
	movei	#.skip_object,tmp2
	jr	pl,.ok_object
	moveta	curr_object,save_curr_object.a
	jump	(tmp2)
	storew	tmp2,(curr_object) ; flag; unvisible

.ok_object
	movei	#rotate_object,tmp0
	BL	(tmp0)

	movei	#check_faces_visible,r0
	BL	(r0)

	movei	#project_object,r0
	BL	(r0)

 IF GOURAUD = 1
	movei	#USE_GOURAUD,r0
	load	(r0),r0
	cmpq	#0,r0
	movei	#gouraud,r0
	move	PC,LR
	jump	ne,(r0)
	addq	#6,LR
 ENDIF

.skip_object
	load	(object_list),curr_object
	movei	#object_loop,tmp0
	cmpq	#0,curr_object
	jump	ne,(tmp0)
	nop

.done:
	movei	#AddObjects,r0
	BL	(r0)
 endif
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

	movei	#Drawfaces,r0
	BL	(r0)

//->	movefa	dump0.a,r0
//->	movei	#$12345678,r1
//->	store	r1,(r0)
	movefa	screen0.a,r11
	movei	#max_x-32,r0
	add	r0,r11

	movei	#33,r10
//->	movei	#tri_array_ram,r9
	movei	#kugel_vnormals_rotated,r9
//->	movei	#$db000,r9
	movei	#Dump1,r0
//->	BL	(r0)
	movei	#max_x*2*2,r0
	add	r0,r11

//->	movei	#cube_visible,r9
//->	movei	#$100000,r9
//->	moveq	#32,r10
//->	movei	#Dump1,r0
//->	BL	(r0)
//->	movei	#max_x*2*2,r0
//->	add	r0,r11
//->
//->	moveq	#3,r10
//->	movei	#cube_visible,r9
//->	movei	#Dump1,r0
//->	BL	(r0)

	POPLR

Dump::
	moveq	#12,r10
Dump1:
	PUSHLR
	movei	#drawHex,r8
//->	movei	#$190000,r9

//->	movei	#OBJECT_PTR,r9
//->	load	(r9),r9
//->	load	(r9),r9
//->	movei	#obj_vnormals_rotated,r10
//->	add	r10,r9
//->	load	(r9),r9
	subq	#4,r9
	addq	#4,r9
.dump
	move	r11,r7
	move	pc,LR
	jr	xd1
	addq	#2,LR

//->	jr	xd
//->	addq	#4,LR
//->
//->	jr	xd
//->	addq	#4,LR

//->	addq	#4,r9
	jr	xd
	addq	#4+2*0,LR

xd1	jr	xd
	addq	#4,LR

	movei	#max_x*2*6,r0
	subq	#1,r10
	subqt	#16+4*0+4*0+2*0,LR
	jr	eq,.exit
	add	r0,r11

xd:
	addqt	#4,r7
	load	(r9),r0
	jump	(r8)
	addqt	#4,r9
.exit
	POP	LR
	jr	xd
	nop


****************************************
	include "rotate.inc"

	include "visible.inc"

	include "gouraud.inc"

	include "project.inc"
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
 IF 1
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
	add	vn_ptr,lum0
	shrq	#24,lum012
	add	vn_ptr,lum1
	add	vn_ptr,lum2
	loadb	(lum0),lum0
	loadb	(lum1),lum1
	loadb	(lum2),lum2
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

;; ----------------------------------------
 IFD DRAW2
 IF GOURAUD = 1
	include "draw2.inc"
 ELSE
	include "draw2_nog.inc"
 ENDIF
 ELSE
	include "draw.inc"
 ENDIF
	include "createplane.inc"

	align 4

	unreg	object_list
	unreg	cam_x.a,cam_y.a,cam_z.a
	unreg	save_curr_object.a
 IFND DRAW2
	unreg	min_max.a
 ENDIF

	align 8
	ENDMODULE engine

	echo "Size (engine): %HMODlen_engine"
	echo "ENDE (engine): %HMODend_engine"
