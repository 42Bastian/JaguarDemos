;; -*-asm-*-
;;; drueller
;;; ----------------------------------------
;;; Author: 42Bastian
;;; Release: LoveByte 2024
;;; Size: 252 (254 on HW)
;;; ----------------------------------------

	gpu

	include <js/symbols/jagregeq.js>
	include <js/macro/help.mac>

	UNREG LR,SP,LR.a,SP.a


 IFD MODEL_M
 echo "Model M"
 ENDIF

WANTED_SIZE	SET 256

BLOCKS		SET (WANTED_SIZE/64)		; max. is 10

OBL		EQU $37000

		regtop 31

screen_ptr	reg 22
bg_col		reg 15
sinetable	reg 14
tmp1		reg 1
tmp0		reg 0

LR		reg 99
hi_word		reg 99
restart		reg 99
obl		reg 99
current_scr	reg 99
cos		reg 99
sin		reg 99
col		reg 99
_640		reg 99
x		reg 99
ptr		reg 99
tmpd		reg 99
dx		reg 99
frame		reg 99
color		reg 99
pos		reg 99
x1		reg sin!
x2		reg cos!
x3		reg 99
x4		reg 99
y		reg 99
frame_inc	reg 99
YLOOP		reg 99
DRAW		reg 99
bg_color	reg 99
color0		reg 99

	RUN $00F035AC		; Start address after decryption. Fix!!!
start:
 IFD MODEL_M
	movei	#$5076,r14
 ELSE
	movei	#$5064,r14
 ENDIF
	storew	r3,(r14)	; Disable BIOS double buffering (r3 == 0)
 IFD MODEL_M
	addq	#$20-2,r14 	; $5094
	movei	#$4e722000,r0	; stop #$2000
	store	r0,(r14+$4)
 ENDIF
	moveq	#$120/16,r15
	shlq	#4,r15
	movei	#OBL,obl
	store	r4,(r15+obl)    ; disable logo object (r4 < 0)

	movei	#$f1a114,r0	; disable DSP -> Roaar
	store	r3,(r0)
;;; ----------------------------------------
;;; setup
;;; ----------------------------------------
	shlq	#10,screen_ptr
	movei   #$3720c,current_scr
        store   screen_ptr,(current_scr)

	UNREG	current_scr

	moveq	#10,_640
	shlq	#5,_640
	add	_640,screen_ptr
	shlq	#1,_640

	movei	#draw,DRAW
	moveq	#0,frame

	movei	#$f02118,hi_word
	movei	#$f1d200,sinetable	; DSP sine table
	moveq	#2,frame_inc
	moveq	#$f,bg_col
	shlq	#20,bg_col
	move	pc,restart
superloop:
	moveq	#15,y
	move	screen_ptr,ptr
	shlq	#4,y		; 320

__pc	move	pc,YLOOP
	addq	#.yloop-__pc,YLOOP

wvbl:
	load	(bg_col+4),bg_color
	bclr	#0,bg_color
	shlq	#6+16,bg_color
	jr	ne,wvbl
.yloop
	store	bg_color,(bg_col+$58)
	load	(bg_col+4),bg_color
	shrq	#4,bg_color
	shlq	#16+4,bg_color

	;; clear
	move	ptr,tmpd
	moveq	#0,tmp0
	moveq	#0,tmp1
	bset	#6,tmp0
	store	tmp1,(hi_word)
	sub	tmp0,tmpd
.clr	subq	#4,tmp0
	storep	tmp1,(tmpd)
	jr	pl,.clr
	addq	#8,tmpd

	;; draw new
	move	frame,color
	move	y,cos
	shrq	#2,color
	shrq	#3,cos
	sat8	color
	add	frame,cos
	move	color,color0

	move	cos,sin
	addq	#32,cos
	shlq	#25,sin
	shlq	#25,cos
	shrq	#23,sin
	shrq	#23,cos
	load	(sinetable+sin),x1
	load	(sinetable+cos),x2
	sharq	#10,x1
	sharq	#10,x2
	move	x1,x3
	move	x2,x4
	neg	x3
	neg	x4

	move	pc,LR
	move	x2,dx
	jump	(DRAW)
	move	x1,x

	move	x3,dx
	bset	#11,color
	jump	(DRAW)
	move	x2,x

	move	x4,dx
	bset	#15,color
	jump	(DRAW)
	move	x3,x

	move	x1,dx
	bset	#9,color
	jump	(DRAW)
	move	x4,x

	subq	#1,y
	jump	ne,(YLOOP)
	add	_640,ptr

	add	frame_inc,frame
	jr	eq,.negit
	btst	#11,frame
	jump	eq,(restart)
	nop			; Atari says: Don't! ;-)
.negit	jump	(restart)
	neg	frame_inc

draw::
	addqt	#8,LR
	sub	x,dx
	move	x,tmpd
	jump	n,(LR)
	add	x,tmpd
	cmp	color0,y
	move	color,tmp0
	jr	mi,.loop
	add	ptr,tmpd
	moveq	#0,tmp0
.loop
	subq	#1,dx
	jump	mi,(LR)
	storew	tmp0,(tmpd)
	jr	.loop
	addqt	#2,tmpd

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

	regmap

	echo "GPU Size:%dsize | Free:%dfree0"
	echo "%dWANTED_SIZE"

 END
