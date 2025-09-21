;-*-asm-*-
	include <js/macro/joypad1.mac>
	include <js/symbols/joypad.js>

obj_ptr		reg 99
curr_obj	reg 99
print_dec	reg 99
joypad		reg 99
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

	move	curr_obj,r1
	addq	#obj_angle_a,r1


	loadb	(r1),r2
	addq	#1,r2
	storeb	r2,(r1)
	addq	#1,r1

	loadb	(r1),r2
	addq	#1,r2
	storeb	r2,(r1)
	addq	#1,r1

	loadb	(r1),r2
	addq	#2,r2
	storeb	r2,(r1)

	movei	#joy,r0
	BL	(r0)

	movei	#LastJoy,r0
	load	(r0),r0
	movei	#.exit,r1
	cmpq	#0,r0
	jump	eq,(r1)
	nop

	movei	#$22F02000,joypad	 ; A-C+Cursor
	and	r0,joypad
	movei	#no_xyz,r2
	jump	eq,(r2)
	nop

******************
* chg_x_pos
chg_x_pos:
	moveq	#obj_x,r4
	add	curr_obj,r4

	btst	#JOY_A_BIT,joypad
	loadw	(r4),r5
	jr	eq,.no_chg_x	 ; not A =>
	btst	#JOY_UP_BIT,joypad
	jr	ne,.x_up
	btst	#JOY_DOWN_BIT,joypad
	jr	eq,.no_chg_x
	nop
	subq	#8,r5
.x_up
	addq	#4,r5
.no_chg_x:
	storew	r5,(r4)

	movei	#PrintDEC_YX,print_dec

	movei	#2<<16|9,r1
	move	r5,r0
	shlq	#16,r0
	sharq	#16,r0
	BL	(print_dec)

******************
* chg_y_pos
chg_y_pos:
	moveq	#obj_y,r4
	add	curr_obj,r4

	btst	#JOY_B_BIT,joypad
	loadw	(r4),r5
	jr	eq,.no_chg_y	 ; not A =>
	btst	#JOY_UP_BIT,joypad
	jr	ne,.y_up
	btst	#JOY_DOWN_BIT,joypad
	jr	eq,.no_chg_y
	nop
	subq	#8,r5
.y_up:
	addq	#4,r5
.no_chg_y:
	storew	r5,(r4)

	movei	#2<<16|(9+10),r1
	move	r5,r0
	shlq	#16,r0
	sharq	#16,r0
	BL	(print_dec)

******************
* chg_z_pos
chg_z_pos:
	moveq	#obj_z,r4
	add	curr_obj,r4

	btst	#JOY_C_BIT,joypad
	loadw	(r4),r5
	jr	eq,.no_chg_z	 ; not A =>
	btst	#JOY_UP_BIT,joypad
	jr	ne,.z_up
	btst	#JOY_DOWN_BIT,joypad
	jr	eq,.no_chg_z
	nop
	subq	#8,r5
.z_up:
	addq	#4,r5
.no_chg_z:
	storew	r5,(r4)

	movei	#2<<16|(9+20),r1
	move	r5,r0
	shlq	#16,r0
	sharq	#16,r0
	BL	(print_dec)

no_xyz:
	movei	#LastJoy+4,r0
	load	(r0),r0
	btst	#9,r0
	movei	#OBJECT_PTR,r0
	jr	eq,.exit
	load	(r0),r1
	addqt	#4,r1
	load	(r1),r2
	cmpq	#0,r2
	jr	ne,.nn
	nop
	movei	#OBJECT_LIST,r1
.nn
	store	r1,(r0)
.exit
	POPLR
	jump	(LR)
	nop
joy:
	JOYPAD1 99
	jump	(LR)
	nop
	ENDMODULE control

	unreg	obj_ptr, curr_obj, print_dec

	echo "ENDE (control): %HMODend_control"
