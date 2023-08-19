;; -*-asm-*-
;;; TomJerryJulia
;;; ----------------------------------------
;;; Author: 42Bastian
;;; Release: Sillyventure SE 2023
;;; ----------------------------------------
;;; Running Tom & Jerry in parallel
;;; ----------------------------------------
;;; 0 Bytes free
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

OBL		EQU $37020

	regtop 31

tmp1		reg 1
tmp0		reg 0

restart		reg 99
screen_ptr	reg 99
ptr		reg 99
obl		reg 99
current_scr	reg 99
_r0		reg 99
_i0		reg 99
_r1		reg 99
_i1		reg 99
cr		reg 99
ci		reg 99
cr0		reg 99
ci0		reg 99
x		reg 99
y		reg 99
_r2		reg 99
_i2		reg 99
XLOOP		reg 99
YLOOP		reg 99
timer		reg 99
iter		reg 99
increment	reg 99
color		reg 99
offset		reg 99
_r0offset	reg 99
dr		reg 99
_ror		reg 99

DR	EQU 14*2*2
DI	EQU 12

	RUN $00F035AC		; Start address after decryption. Fix!!!
start:
 IFD MODEL_M
	movei	#$5076,r14
 ELSE
	movei	#$5064,r14
 ENDIF
	storew	r3,(r14)	; Disable BIOS double buffering
	movei	#$f1a100,r14
	movei	#($1f<<9)|(0<<14)|(1<<17),r4
	store	r3,(r14+$14)	; stop DSP
	store	r4,(r14)	; clear interrupts

	moveq	#DR/2,_r0offset

	movei	#$f1b000,r0
	store	r0,(r14+$10)
	moveq	#31,r2
	shlq	#4,r2
__x	move	pc,r1
	addq	#demo-__x,r1
.cpy	load	(r1),r3
	addq	#4,r1
	subq	#1,r2
	store	r3,(r0)
	jr	ne,.cpy
	addq	#4,r0

	store	r2,(r0)		; needed, else DSP does not run?!

	moveq	#1,r0
	store	r0,(r14+$14)

	jr	.skip
	moveq	#4,offset

	align 4
demo
	echo "%Hdemo"
	moveq	#0,_r0offset
	moveq	#0,offset
.skip
;;; setup
	moveq	#16,screen_ptr
	shlq	#16,screen_ptr

	moveq	#DR/2,dr
	shlq	#1,dr
	moveq	#0,_ror
	movei	#OBL,obl
	movei	#$3720c,current_scr
	moveq	#6,cr0
	moveq	#2,ci0
	shlq	#8,cr0
	shlq	#8,ci0
	moveq	#6,increment
	moveq	#1,timer
	move	pc,restart
	addq	#4,restart
superloop:
	cmpq	#1,timer
	jr	mi,dox
	btst	#11,timer
	jr	eq,nox
dox:
	moveq	#0,r0
	neg	increment
nox:
	cmpq	#0,offset
	jr	eq,wvbl
	bset	#19,r0
	store	screen_ptr,(current_scr)
wvbl:	load	(obl),r1
	shrq	#8,r1
	cmp	screen_ptr,r1
	jr	ne,wvbl
	moveq	#15,y
	xor	r0,screen_ptr
	shlq	#4,y
	move	screen_ptr,ptr
	add	offset,ptr

	move	cr0,cr
	sub	timer,cr
	move	ci0,ci
	sub	timer,cr

	moveq	#23,_i0
	shlq	#6,_i0
	move	pc,YLOOP
	addq	#4,YLOOP
yloop:
	moveq	#$11,_r0
	moveq	#320>>4,x
	shlq	#7,_r0
	shlq	#2,x
	sub	_r0offset,_r0

	move	pc,XLOOP
	addq	#4,XLOOP
xloop:
	move	_r0,_r1
	move	_i0,_i1
	move	_r0,_r2
	move	_i0,_i2

	moveq	#31,iter
	moveq	#0,color
iterloop:
	imult	_r1,_r2
	imult	_i1,_i2
	imult	_r1,_i1
	move	_r2,_r1
	sharq	#10-1,_i1
	sub	_i2,_r1
	add	ci,_i1
	sharq	#10,_r1
	add	_i2,_r2
	add	cr,_r1
	sharq	#20+2,_r2	; x^2+y^2 > 4 ?
	addqt	#31,color
	jr	ne,finish
	subq	#1,iter
	move	_i1,_i2
	jr	ne,iterloop
	move	_r1,_r2
	jr	.black
	moveq	#1,color	; object is TRANS so set bit 0!
finish:
	shlq	#8,color
	bset	#7,color
	bset	#6,color
.black
	bset	#16,color
	ror	_ror,color
	store	color,(ptr)
	subq	#1,x
	addqt	#8,ptr
	jump	ne,(XLOOP)
	sub	dr,_r0

	addqt	#16,_ror
	subq	#1,y
	jump	ne,(YLOOP)
	subqt	#DI,_i0

	jump	(restart)
	add	increment,timer

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
