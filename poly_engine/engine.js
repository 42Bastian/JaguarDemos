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
cam_cos.a	reg 99
cam_sin.a	reg 99
neg_cam_sin.a	reg 99

 IF DRAW2 = 0
min_max.a	reg 99
 ENDIF
save_curr_object.a reg 99

dump.a		reg 99
dump0.a		reg 99
far_z.a		reg 99
far_x.a		reg 99
;;->	if (max_x << fp_rez) > $ffff
;;->	fail "fp_rez to large"
;;->	endif
****************

	MODULE engine,MODend_irq
engine::
	PUSHLR

 IF DRAW2 = 0
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

;;; ----------------------------------------
;; rotate light vector
;;; ----------------------------------------
cam_sin		reg 99
neg_cam_sin	reg 99
cam_cos		reg 99

	load	(r15+_CAMERA_ANGLE_Y),tmp0
	movei	#SinTab,tmp1
	add	tmp0,tmp1
	load	(tmp1),cam_cos
	move	cam_cos,cam_sin
	shrq	#16,cam_cos
	move	cam_sin,neg_cam_sin
	moveta	cam_cos,cam_cos.a
	moveta	cam_sin,cam_sin.a
	neg	neg_cam_sin
	moveta	neg_cam_sin,neg_cam_sin.a

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

	movei	#far_x,tmp0
	movei	#far_z,tmp2
	moveta	tmp0,far_x.a
	moveta	tmp2,far_z.a

//->	imultn	cam_cos,tmp0
//->	imacn	cam_sin,tmp2
//->	resmac	tmp1
//->	sharq	#15,tmp1
//->	abs	tmp1
//->	moveta	tmp1,far_x.a
//->	imultn	neg_cam_sin,tmp0
//->	imacn	cam_cos,tmp2
//->	resmac	tmp1
//->	sharq	#15,tmp1
//->	abs	tmp1
//->	moveta	tmp1,far_z.a
//->
	unreg	cam_sin, neg_cam_sin, cam_cos
;;; ----------------------------------------
;;; Clear Z table
;;; ----------------------------------------
	movei	#tri_ptrs_ram,r0
	movei	#255,r1
	moveq	#0,r2
.clear_depthtable:
	subq	#1,r1
	store	r2,(r0)
	jr	pl,.clear_depthtable
	addq	#4,r0
;;; ----------------------------------------

//->	movefa	screen1.a,r7
//->	movei	#drawHex,r8
//->	BL	(r8)

	;; debug
	movei	#$19000,r0
	moveta	r0,dump0.a

	moveq	#0,r0
	moveta	r0,dump.a
	;;

	movei	#createPlane,r0
	BL	(r0)

object_list	reg 25
curr_object	reg 15

	movei	#obj_plane,curr_object
	movei	#check_faces_visible,r0
	BL	(r0)

 IF 1
	movei	#OBJECT_LIST,object_list
	load	(object_list),curr_object
object_loop:
	addqt	#4,object_list
	moveq	#0,r0
	moveta	curr_object,save_curr_object.a
	storew	r0,(curr_object) ; flag: object visible

;;; ----------------------------------------
dx	reg 99
dz	reg 99

	;; object center < far_z?
	move	curr_object,tmp0
	addqt	#obj_x,tmp0
	loadw	(tmp0),dx
	addq	#4,tmp0
	movefa	cam_x.a,tmp2
	movefa	cam_z.a,tmp3
	loadw	(tmp0),dz
	shlq	#16,dx
	shlq	#16,dz
	sharq	#16,dx
	sharq	#16,dz
	sub	tmp2,dx
	sub	tmp3,dz
	movefa	far_x.a,tmp0
	abs	dx
	abs	dz
	sub	dx,tmp0
	movefa	far_z.a,tmp1
	jr	mi,.x_off
	sub	dz,tmp1
	jr	pl,.ok_object
	nop
.x_off
	movei	#.skip_object,tmp2
	jump	(tmp2)
	storew	tmp2,(curr_object) ; flag; unvisible

	unreg dx,dz

.ok_object
;;; ----------------------------------------

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
	store	screen_ptr,(blitter)
 IF max_x = 640
	movei	#BLIT_PITCH1|BLIT_PIXEL32|BLIT_WID3584|BLIT_XADDPHR,tmp0
	store	tmp0,(blitter+_BLIT_A1_FLAGS)
	movei	#(max_y)<<16|(max_x/2),tmp1
	moveq	#0,tmp0
	store	tmp0,(blitter+_BLIT_A1_PIXEL)	; pel ptr
	store	tmp1,(blitter+_BLIT_COUNT)
	store	tmp0,(blitter+_BLIT_CMD)
 ELSE
	movei	#$88e088e0,tmp0
//->	moveq	#0,tmp0
	store	tmp0,(blitter+_BLIT_PATD)
	store	tmp0,(blitter+_BLIT_PATD+4)
	store	tmp0,(blitter+$40)
	movei	#(-$500)&0xffffff,tmp0
	store	tmp0,(blitter+$70)		; int inc
	store	tmp0,(blitter+$74)		; int inc
	movei	#BLIT_PITCH1|BLIT_PIXEL16|BLIT_WIDTH|BLIT_XADDPHR,tmp0
	store	tmp0,(blitter+_BLIT_A1_FLAGS)
	moveq	#0,tmp1

	movei	#170<<16|(max_x),tmp2
	store	tmp1,(blitter+_BLIT_A1_PIXEL)
	movei	#B_PATDSEL|B_GOURD,tmp1
	store	tmp2,(blitter+_BLIT_COUNT)
	store	tmp1,(blitter+_BLIT_CMD)

	WAITBLITTER

	shrq	#16,tmp2
	shlq	#16,tmp2	; remove X count

	store	tmp2,(blitter+_BLIT_A1_PIXEL)	; pel ptr
	movei	#(max_y-170)<<16|max_x,tmp1
	moveq	#0,tmp0
	store	tmp1,(blitter+_BLIT_COUNT)
	store	tmp0,(blitter+_BLIT_CMD)
 ENDIF

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

	movei	#$190000,r0
	moveta	r0,dump0.a

	moveq	#0,r0
	moveta	r0,dump.a

	movei	#Drawfaces,r0
	BL	(r0)

	movefa	screen0.a,r11
	movei	#max_x-32,r0
	add	r0,r11

//->	movei	#8,r10
//->	movei	#cube_rotated+4,r9
//->	movei	#Dump1,r0
//->	BL	(r0)
//->	movei	#max_x*2*2,r0
//->	add	r0,r11
	movei	#4,r10
//->	movei	#cube_projected,r9
	movei	#$190000,r9
	movei	#Dump1,r0
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

	jr	xd
	addq	#4,LR

	jr	xd
	addq	#4,LR

//->	addq	#4,r9
	jr	xd
	addq	#4+2*0,LR

xd1	jr	xd
	addq	#4,LR

	movei	#max_x*2*6,r0
	subq	#1,r10
	subqt	#16+4*1+4*1+2*0,LR
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

;; ----------------------------------------


	include "rotate.inc"

	include "addobj.inc"
	include "createplane.inc"

	unreg	cam_x.a,cam_y.a,cam_z.a
	unreg	cam_sin.a, neg_cam_sin.a, cam_cos.a

	include "visible.inc"
	include "gouraud.inc"
	include "project.inc"

 IF DRAW2 = 1
 IF GOURAUD = 1
	include "draw2.inc"
 ELSE
	include "draw2_nog.inc"
 ENDIF
 ELSE
	include "draw.inc"
 ENDIF

	align 4

	unreg	object_list

	unreg	save_curr_object.a,far_x.a,far_z.a
 IF DRAW2 = 0
	unreg	min_max.a
 ENDIF

	align 8
	ENDMODULE engine

	echo "Size (engine): %HMODlen_engine"
	echo "ENDE (engine): %HMODend_engine"
