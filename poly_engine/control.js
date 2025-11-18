;-*-asm-*-
	include <js/macro/joypad1.mac>
	include <js/symbols/joypad.js>

obj_ptr		reg 99
curr_obj	reg 99
print_dec	reg 99
print_short	reg 99
joypad		reg 99
check_button	reg 99
testValue	reg 99
cam_x		reg 99
cam_z		reg 99

Control::
	MODULE control,MODend_irq
//->	MODULE control,MODend_poly_mmu

	PUSHLR

	movei	#OBJECT_PTR,obj_ptr
	load	(obj_ptr),tmp0
	load	(tmp0),curr_obj

	loadb	(curr_obj),r0
	addq	#1,r0
	storeb	r0,(curr_obj)

	movei	#511<<2,r0
	move	curr_obj,r1
	addq	#obj_angle_a,r1

	loadw	(r1),r2
	addq	#8,r2
	and	r0,r2
	storew	r2,(r1)
	addq	#2,r1

	loadw	(r1),r2
	addq	#4,r2
	and	r0,r2
	storew	r2,(r1)
	addq	#2,r1

	loadw	(r1),r2
	addq	#4,r2
	and	r0,r2
//->	storew	r2,(r1)

	movei	#joy,r0
	BL	(r0)

	movei	#LastJoy,r0
	load	(r0),r0

	movei	#no_123,r1
	movei	#$22F02000,joypad	 ; A-C+Cursor
	and	r0,joypad
	movei	#checkButton,check_button
	jump	eq,(r1)
	nop
	movei	#$22002000,r1	 ; cursor
	and	joypad,r1
	jr	eq,no_object
******************
* check x,y,z change
	moveq	#obj_x,r4
	add	curr_obj,r4

	moveq	#0,testValue
	move	PC,LR
	jump	(check_button)
	bset	#JOY_A_BIT,testValue

	moveq	#0,testValue
	jump	(check_button)
	bset	#JOY_B_BIT,testValue

	movei	#no_123-6,LR
	moveq	#0,testValue
	jump	(check_button)
	bset	#JOY_C_BIT,testValue

no_object:
	movei	#CAMERA_X,r14
	btst	#JOY_RIGHT_BIT,joypad
	load	(r14+CAMERA_ANGLE_Y-CAMERA_X),r0
	jr	eq,no_left
	btst	#JOY_LEFT_BIT,joypad
	jr	no_right
	subqt	#a_speed,r0
no_left:
	jr	eq,no_right
	nop
	addqt	#a_speed,r0
no_right:
	shlq	#32-9-2,r0
	moveq	#0,r1
	shrq	#32-9-2,r0
	bset	#7+2,r1
	store	r0,(r14+CAMERA_ANGLE_Y-CAMERA_X)
	load	(r14+CAMERA_X-CAMERA_X),cam_x
	load	(r14+CAMERA_Z-CAMERA_X),cam_z
	add	r0,r1
	movei	#SinTab,r2
	add	r2,r0
	add	r2,r1
	load	(r0),r0		; sin(camera_angle)
	load	(r1),r1		; cos(camera_angle)
	moveq	#speed,r2
	imult	r2,r0		; dx
	imult	r2,r1		; dz
	sharq	#15,r0
	sharq	#15,r1

	btst	#JOY_DOWN_BIT,joypad
	jr	eq,no_forward
	btst	#JOY_UP_BIT,joypad
	add	r0,cam_x
	jr	no_back
	sub	r1,cam_z
no_forward:
	jr	eq,no_back
	nop
	sub	r0,cam_x
	add	r1,cam_z
no_back:
	movei	#grid_size*world_size/2,r0
	movei	#grid_size*world_size-1,r1
	add	r0,cam_x
	add	r0,cam_z
	and	r1,cam_x
	and	r1,cam_z
	sub	r0,cam_x
	sub	r0,cam_z
	store	cam_x,(r14+CAMERA_X-CAMERA_X)
	store	cam_z,(r14+CAMERA_Z-CAMERA_X)

no_123:
	movei	#LastJoy+4,r0
	load	(r0),r0
	btst	#JOY_OPTION_BIT,r0
	movei	#OBJECT_PTR,r3
	jr	eq,.not_option
	load	(r3),r1
	addqt	#4,r1
	load	(r1),r2
	cmpq	#0,r2
	jr	ne,.nn
	nop
	movei	#OBJECT_LIST,r1
.nn
	store	r1,(r3)
.not_option:
	btst	#JOY_0_BIT,r0
	movei	#USE_GOURAUD,r1
	jr	eq,.not_0
	load	(r1),r2
	not	r2
	store	r2,(r1)
.not_0:
.exit
;;; ----- output values -----

	addq	#obj_x,curr_obj
	movei	#PrintDEC_YX,print_dec
	movei	#printShort,print_short

	movei	#2<<16|9,r1
	BL	(print_short)
	movei	#2<<16|(9+10),r1
	BL	(print_short)
	movei	#2<<16|(9+20),r1
	BL	(print_short)

	addq	#2,print_short
	movei	#CAMERA_X+2,curr_obj
	movei	#1<<16|0,r1
	loadw	(curr_obj),r0
	BL	(print_short)
	addq	#2,curr_obj
	movei	#1<<16|(0+10),r1
	loadw	(curr_obj),r0
	BL	(print_short)
	addq	#2,curr_obj
	movei	#1<<16|(0+20),r1
	loadw	(curr_obj),r0
	BL	(print_short)
	addq	#2,curr_obj
	movei	#1<<16|(0+30),r1
	loadw	(curr_obj),r0
	shrq	#2,r0
	BL	(print_short)

	POPLR

printShort::
	loadw	(curr_obj),r0
	addq	#2,curr_obj
	shlq	#16,r0
	jump	(print_dec)
	sharq	#16,r0

checkButton::
	addqt	#6,LR
	and	joypad,testValue
	loadw	(r4),r5
	jr	eq,.no_button
	btst	#JOY_UP_BIT,joypad
	jr	ne,.up
	btst	#JOY_DOWN_BIT,joypad
	jr	eq,.no_chg
	nop
	subq	#8,r5
.up
	addq	#4,r5
.no_chg:
	storew	r5,(r4)
.no_button
	jump	(LR)
	addq	#2,r4

joy:
	JOYPAD1 99
	jump	(LR)
	nop
	ENDMODULE control

	unreg	obj_ptr, curr_obj, print_dec, print_short
	unreg	check_button, testValue, cam_x, cam_z

	echo "ENDE (control): %HMODend_control"
