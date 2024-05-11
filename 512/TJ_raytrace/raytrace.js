;; -*-asm-*-
;;; TJ_Raytrace - 160x216 Raytrace with Tom&Jerry in parallel
;;;               9 bit FP , 2.7 .. 3.5 FPS ;-)
;;; ----------------------------------------
;;; Author: 42Bastian
;;; Release: Outline 2024
;;; ----------------------------------------
;;; Size: 512b (4b free)
;;; ----------------------------------------

	gpu

	include <js/symbols/jagregeq.js>
	include <js/macro/help.mac>

	UNREG SP,LR.a,SP.a

ScreenMode	EQU CRY16|VIDEN|PWIDTH8|BGEN|CSYNC

//->TIMING	EQU 1

 IFD MODEL_M
 echo "Model M"
 ENDIF

 IFD TIMING
WANTED_SIZE	SET 512+128
 ELSE
WANTED_SIZE	SET 512
 ENDIF

BLOCKS		SET (WANTED_SIZE/64)		; max. is 10

	regtop 31

	;; SQRTi fixed registers
para		reg 5
bp		reg 4
chk		reg 3

tmp2		reg 2
tmp1		reg 1
tmp0		reg 0

screen_ptr	reg 99
DONE		reg 99
SPHERES		reg 99
LOOP		reg 99
SQRTI		reg 99
RESTART		reg 99
cam		reg 99
ptr		reg 99
 IFD TIMING
txt_ptr		reg 99
 ENDIF
is_gpu		reg 99

m		reg 99
x		reg 99
y		reg 99
z		reg 99
sgn		reg 99
u		reg 99
v		reg 99
w		reg 99
d		reg 99
e		reg 99
f		reg 99
p		reg 99
t		reg 99
fp_by_2		reg 99
n		reg 99

FP		equ 9

	RUN $00F035AC		; Start address after decryption. Fix!!!
start:
 IFD MODEL_M
	movei	#$5076,r14
 ELSE
	movei	#$5064,r14
 ENDIF
	storew	r3,(r14)	; Disable BIOS double buffering (r3 == 0)

	movei	#$37120,r0
	storeb	r4,(r0)		; disable Jaguar logo
	addq	#$1c,r0
	movei	#(160*2/8)<<16|(160*2/8),r1 ; set object to 160x239
	store	r1,(r0)

 IFD TIMING
	movei	#$f00050,r1
	movei	#(26591-1)<<16|($ffff),r0
	store	r0,(r1)			; Start timer
	addq	#2,r1
	moveta	r1,r1
 ENDIF
	moveq	#$f,r14
	shlq	#20,r14
	movei	#ScreenMode<<16,r1
	store	r1,(r14+$28)

	movei	#$f1a100,r14
	movei	#($1f<<9)|(0<<14)|(1<<17),r4
	store	r3,(r14+$14)	; stop DSP
	store	r4,(r14)	; clear interrupts

	;; copy common code to DSP
	movei	#$f1b000,r1
	store	r1,(r14+$10)
	sat8	r4
.cpy_pc	move	pc,r0
	addq	#start_rc-.cpy_pc,r0
.cpy	load	(r0),r3
	addqt	#4,r0
	subq	#1,r4
	store	r3,(r1)
	jr	ne,.cpy
	addqt	#4,r1

	;; start DSP
	moveq	#1,is_gpu
	jr	.skip
	store	is_gpu,(r14+$14)

	dc.w	$4242		; align
start_rc:
	moveq	#0,is_gpu
.skip
;;; ----------------------------------------
;;; common code
;;; ----------------------------------------
	moveq	#$8,screen_ptr
	moveq	#0,fp_by_2
	shlq	#16,screen_ptr
	bset	#2*FP,fp_by_2

	move	pc,SQRTI
	jr	skip_sqrti
	addq	#6,SQRTI
	;; SQRT
sqrti:
	moveq	#0,bp
	moveq	#0,tmp1
	bset	#9,bp
	cmpq	#0,para
.loop
	jump	eq,(LR)		; return if bp == 0
	move	tmp1,tmp0
	or	bp,tmp0
	move	tmp0,chk
	mult	tmp0,chk
	cmp	para,chk
	jr	pl,.loop
	shrq	#1,bp
	jr	.loop
	move	tmp0,tmp1

skip_sqrti

_done:	move	pc,DONE
	movei	#.done-_done,r0
	add	r0,DONE

	moveq	#10,cam		; do not move, needed for re-init
	shlq	#FP,cam
	neg	cam
	move	PC,RESTART
superloop:
	moveq	#160>>4,m
	shlq	#4+1,m
	moveta	m,m
 IFND TIMING
	moveq	#208>>3,ptr
pc_logo	move	pc,r1
	jr	skip_logo
	moveq	#1,r3		; first line is empty
logo:
	;;    0123456789ABCDEF0123456789ABCDEF
	dc.l %01100100101110100011101001011101
	dc.l %10010100100100100001001101010001
	dc.l %10010100100100100001001011011001
	dc.l %10010100100100100001001001010001
	dc.l %01100011100100111011101001011101
	dc.l %00000000000000000000000000000001
	dc.l $3720c		; current screen address
skip_logo
	shlq	#3,ptr
	addq	#logo-pc_logo-4,r1
	mult	m,ptr
	moveq	#7,r2
	add	screen_ptr,ptr
.l0
	addq	#4,r1		; => C == 0
	move	ptr,r4
.l
	subc	r0,r0		; 0 or -1
	not	r0		; => outline ;-)
	shrq	#18,r0		; => cyan
	shlq	#1,r3		; C and check if done
	addqt	#2,r4
.l1	jr	ne,.l
	storew	r0,(r4)

	subq	#1,r2
	load	(r1),r3
	jr	ne,.l0
	add	m,ptr
 ENDIF
 IFD TIMING
	cmpq	#1,is_gpu
	moveq	#5,txt_ptr
	jr	ne,.dsp
	mult	m,txt_ptr
	move	screen_ptr,txt_ptr
	movefa	r1,r1
	loadw	(r1),r0
	not	r0
	rorq	#16,r0
	storew	r0,(r1)
	movei	#drawHex,r1
	BL	(r1)
.dsp
	movei	#$3720c,r3
 ENDIF
	cmpq	#1,is_gpu
	moveq	#0,r0
	jr	eq,.gpu
.wgpu	load	(r3),r1
	jr	ne,.wgpu
	cmp	r1,screen_ptr
	jr	.dsp1
.gpu
	bset	#18,r0
        store   screen_ptr,(r3)
.dsp1
	moveq	#216>>3,n
	xor	r0,screen_ptr	; swap screen
	shlq	#3,n

	move	is_gpu,r1
	move	screen_ptr,ptr
	mult	m,r1
	sub	is_gpu,n
	add	r1,ptr

	move	pc,LOOP
	addq	#4,LOOP
xyloop:
	moveq	#0,x
	move	cam,y
	move	cam,z
	sharq	#2,y

	moveq	#0,sgn
	moveq	#160>>4,r0
	bset	#FP,sgn
	shlq	#4,r0
	moveq	#100>>4,r1
	move	m,u
	shlq	#4,r1
	sub	r0,u
	jr	pl,.1
	move	n,v
	neg	sgn
.1
	sub	r1,v
	shlq	#FP-7,u
	shlq	#FP-7,v
	imultn	u,u
	imacn	v,v
	resmac	para
	move	fp_by_2,w
	add	fp_by_2,para
	BL	(SQRTI)
	div	r0,w

	imult	w,u
	imult	w,v
	sharq	#FP,u
	sharq	#FP,v

	move	PC,SPHERES
	addq	#4,SPHERES
spheres:
	move	x,e
	move	y,f
	sub	sgn,e
	sub	sgn,f
	imultn	u,e
	imacn	v,f
	imacn	w,z
	resmac	p

	imultn	e,e
	imacn	f,f
	imacn	z,z
	resmac	tmp1

	sharq	#FP,p
	sub	fp_by_2,tmp1
	move	p,para

	imult	p,para
	sub	tmp1,para
	move	pc,LR
	jump	mi,(DONE)
	addqt	#10,LR
	jump	(SQRTI)
	neg	p
	sub	tmp0,p
	jump	mi,(DONE)
	move	u,tmp0
	move	v,tmp1
	imult	p,tmp0
	imult	p,tmp1
	imult	w,p
	sharq	#FP,tmp0
	sharq	#FP,tmp1
	sharq	#FP,p
	add	tmp0,x
	add	tmp1,y
	add	p,z
	move	x,e
	move	y,f
	sub	sgn,e
	sub	sgn,f

	imultn	u,e
	imacn	v,f
	imacn	z,w
	resmac	p
	neg	sgn
	sharq	#FP-1,p

	imult	p,e
	imult	p,f
	imult	z,p
	sharq	#FP,e
	sharq	#FP,f
	sharq	#FP,p
	sub	e,u
	sub	f,v
	jump	(SPHERES)
	sub	p,w

.done
	move	v,para
	move	fp_by_2,tmp2
	abs	para
	move	pc,LR
	div	para,tmp2
	jump	(SQRTI)
	addq	#8,LR
	cmpq	#0,v
	jr	pl,.cnt		; V > 0 => sky
	imult	tmp2,u
	imult	tmp2,w
	sharq	#FP,u
	sharq	#FP,w
	add	u,x
	add	z,w
	xor	w,x
	btst	#9,x
	jr	ne,.cnt
	bset	#15-3,tmp0
	bset	#11-3,tmp0
.cnt
	shlq	#3,tmp0
	subq	#2,m
	storew	tmp0,(ptr)
	jump	ne,(LOOP)
	addqt	#2,ptr

	subq	#2,n
	movefa	m,m
	jump	nn_ne,(LOOP)
	add	m,ptr

	addq	#21,cam
	jump	mi,(RESTART)
	subq	#6,RESTART
	jump	(RESTART)
//->	nop
 IFD TIMING
minihex_screen_width	equ 160
	include "minihex_short.inc"
 ENDIF

end:
size	set end-start

free	set WANTED_SIZE-size
free0	set free

	IF free < 0
WANTED_SIZE	SET WANTED_SIZE+64
BLOCKS		SET BLOCKS+1
free		set free+64
	ENDIF
	if free > 0
	REPT	WANTED_SIZE-size
	dc.b	$42
	ENDR
	endif

	regmap

	echo "GPU Size:%dsize | Free:%dfree0"
	echo "%dWANTED_SIZE"
 IFND TIMING
	echo "Logo %hlogo"
 ENDIF
 END
