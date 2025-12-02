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
	addqt	#2,r1

	loadw	(r1),r2
	addq	#8,r2
	and	r0,r2
;;->	storew	r2,(r1)
	addqt	#2,r1

	loadw	(r1),r2
	addq	#8,r2
	and	r0,r2
//->	storew	r2,(r1)

	movei	#joy,r0
	BL	(r0)

	movei	#LastJoy,r0
	load	(r0),r0

	movei	#no_123,r1
	movei	#$00F00000|JOY_1|JOY_2|JOY_3,joypad	 ; 1-3+Cursor
	and	r0,joypad
	movei	#checkButton,check_button
	jump	eq,(r1)
	nop
	movei	#JOY_1|JOY_2|JOY_3,r1
	and	joypad,r1
	jr	eq,no_object
******************
* check x,y,z change
	moveq	#obj_x,r4
	add	curr_obj,r4

	moveq	#0,testValue
	move	PC,LR
	jump	(check_button)
	bset	#JOY_1_BIT,testValue

	moveq	#0,testValue
	jump	(check_button)
	bset	#JOY_2_BIT,testValue

	movei	#no_123-6,LR
	moveq	#0,testValue
	jump	(check_button)
	bset	#JOY_3_BIT,testValue

no_object:
	movei	#CAMERA_X,r14
	btst	#JOY_RIGHT_BIT,joypad
	load	(r14+CAMERA_ANGLE_Y-CAMERA_X),r0
	jr	ne,turn_right
	btst	#JOY_LEFT_BIT,joypad
	jr	eq,no_turn
	nop
	addqt	#a_speed*4*2,r0
turn_right:
	subqt	#a_speed*4,r0

	shlq	#32-9-2,r0
	shrq	#32-9-2,r0
	store	r0,(r14+CAMERA_ANGLE_Y-CAMERA_X)
no_turn:
	load	(r14+CAMERA_X-CAMERA_X),cam_x
	load	(r14+CAMERA_Z-CAMERA_X),cam_z
	movei	#SinTab,r15
	load	(r15+r0),r1		; cos(camera_angle)|sin(camera_angle)
	move	r1,r0
	shrq	#16,r1

	moveq	#speed,r2
	imult	r2,r0		; dx
	imult	r2,r1		; dz
	sharq	#15,r0
	sharq	#15,r1

	movei	#grid_size*world_size-1,r3
	btst	#JOY_DOWN_BIT,joypad
	movei	#grid_size*world_size/2,r2
	jr	ne,forward
	btst	#JOY_UP_BIT,joypad
	jr	eq,no_move
	nop
	neg	r0
	neg	r1
forward:
	add	r0,cam_x
	sub	r1,cam_z
	add	r2,cam_x
	add	r2,cam_z
	and	r3,cam_x
	and	r3,cam_z
	sub	r2,cam_x
	sub	r2,cam_z
	store	cam_x,(r14+CAMERA_X-CAMERA_X)
	store	cam_z,(r14+CAMERA_Z-CAMERA_X)
no_move:

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
	or	r1,r1
	btst	#JOY_0_BIT,r0
	movei	#USE_GOURAUD,r1
	jr	eq,.not_0
	load	(r1),r2
	not	r2
	store	r2,(r1)
.not_0:
	btst	#JOY_HASH_BIT,r0
	movei	#USE_PHRASE,r1
	jr	eq,.not_hash
	load	(r1),r2
	not	r2
	store	r2,(r1)
.not_hash:

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
	unreg joypad

	echo "ENDE (control): %HMODend_control"
