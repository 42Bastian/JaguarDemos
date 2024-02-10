;; -*-asm-*-
;;;  snake128
;;; ----------------------------------------
;;; Author: 42Bastian
;;; Release: LoveByte 2024
;;; ----------------------------------------

	gpu

	include <js/symbols/jagregeq.js>
	include <js/macro/help.mac>

	UNREG LR,SP,LR.a,SP.a

WANTED_SIZE	SET 128

BLOCKS		SET (WANTED_SIZE/64)		; max. is 10

OBL		EQU $37000

		regtop 31

vc		reg 15
sinetable	reg 14
minus		reg 4
tmp1		reg 1
tmp0		reg 0

obl		reg 99
LOOP		reg 99
RESTART		reg 99
current_scr	reg 99
cos		reg 99
sin		reg 99
_640		reg 99
x		reg 99
screen_ptr	reg 99
tmp_ptr		reg 99
dy		reg 99
frame		reg 99


	RUN $00F035AC		; Start address after decryption. Fix!!!
start:
	movei	#$f1a114,r0	; disable DSP -> Roaar
	store	r3,(r0)

	movei	#OBL+$120,obl
	movei   #$3720c,current_scr

	moveq	#10,_640
	shlq	#6,_640
	moveq	#15,vc
	shlq	#20,vc
	movei	#$f1d200,sinetable	; DSP sine table

	move	pc,RESTART
superloop:
	store	minus,(obl)    ; disable logo object (r4 < 0)

	load	(current_scr),screen_ptr

wvbl:
	load	(vc+4),r1
	shlq	#5+16,r1
	jr	ne,wvbl
	move	_640,x

	bset	#6,r1
	mult	_640,r1
	add	r1,screen_ptr

	move	screen_ptr,r0
	moveq	#0,r1
	moveq	#0,r2
	bset	#14,r2
.clr
	subq	#1,r2
	store	r1,(r0)
	jr	ne,.clr
	addq	#4,r0

	move	pc,LOOP
.xloop
	move	x,cos
	move	x,sin
	shrq	#1,cos
	add	frame,sin
	sub	frame,cos

	shlq	#25,sin
	shlq	#25,cos
	shrq	#23,sin
	shrq	#23,cos
	load	(sinetable+sin),sin
	load	(sinetable+cos),cos
	add	cos,sin
	sharq	#15-4,sin
	addq	#32,sin
	move	sin,tmp_ptr		; might be commented out
	mult	_640,tmp_ptr
	add	screen_ptr,tmp_ptr
	moveq	#15,dy
.thick	storew	cos,(tmp_ptr)
	add	sin,cos
	subq	#1,dy
	jr	ne,.thick
	add	_640,tmp_ptr

	subq	#2,x
	jump	ne,(LOOP)
	addq	#2,screen_ptr

	jump	(RESTART)
	addq	#1,frame

;;; ----------------------------------------
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

	echo "GPU Size:%dsize | Free:%dfree0"
	echo "%dWANTED_SIZE"

 END
