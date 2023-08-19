;; -*-asm-*-
;;; algorip - Ripped algo from algorift
;;; ----------------------------------------
;;; Author: 42Bastian (algorift by Marquee Design)
;;; Release: SVSE 2023
;;; ----------------------------------------
;;; 52 bytes free
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

ptr		reg 15
screen_ptr	reg 22
tmp1		reg 1
tmp0		reg 0

timer		reg 99
restart		reg 99
obl		reg 99
current_scr	reg 99
x		reg 99
y		reg 99
LOOP		reg 99
INNER		reg 99
color		reg 99
_ror		reg 99
d0		reg 99
d1		reg 99
d2		reg 99
d2_timer	reg 99
d3		reg 99
d4		reg 99
mask		reg 99
limit		reg 99

	RUN $00F035AC		; Start address after decryption. Fix!!!
start:
 IFD MODEL_M
	movei	#$5076,r0
 ELSE
	movei	#$5064,r0
 ENDIF
	storew	r3,(r0)		; Disable BIOS double buffering (r3 == 0)

	moveq	#$120/16,r14
	shlq	#4,r14
	movei	#OBL,obl
	store	r4,(r14+obl)    ; disable logo object (r4 < 0)

	movei	#$f1a114,r0	; disable DSP -> Roaar
	store	r3,(r0)

	moveq	#$10,screen_ptr
	shlq	#16,screen_ptr
	movei	#$3720c,current_scr

	movei	#$8700,color
	moveq	#0,_ror
	movei	#80,limit
	moveq	#7,mask

	move	pc,restart
	addq	#4,restart
superloop:
	moveq	#0,r0
	store	screen_ptr,(current_scr)
wvbl:	load	(obl),r1
	shrq	#8,r1
	cmp	screen_ptr,r1
	jr	ne,wvbl
	bset	#19,r0
	moveq	#240>>3,y
	xor	r0,screen_ptr
	shlq	#3,y

	moveq	#320>>4,x
	movei	#320*240*2-4,r0
	shlq	#4,x
	move	screen_ptr,ptr
	add	r0,ptr

__pc	move	pc,INNER
	addq	#inner-__pc,INNER
	move	pc,LOOP
	addq	#4,LOOP
loop:
	movei	#0,d2
	moveq	#0,d3
	moveq	#0,d4
	moveq	#0,d0
	move	timer,d2_timer
inner:
	shrq	#5,d0
	move	d2,tmp0
	add	x,d0
	add	d2,tmp0
	add	d0,d3
	sub	tmp0,d3

	move	y,tmp0
	move	d3,d0
	add	d2,tmp0
	shrq	#5,d0
	move	d3,d1
	sub	d0,tmp0
	add	tmp0,d4

	xor	d4,d1
	move	d2_timer,d0
	shrq	#8,d1
	and	d1,d0
	btst	#3,d0
	addqt	#1,d2
	jr	ne,.break
	cmp	d2,limit
	addqt	#1,d2_timer
	jump	ne,(INNER)
	move	d4,d0
	jr	.black
	moveq	#0,d0

.break	xor	d1,d0
	and	mask,d0
	shlq	#5,d0
	or	color,d0
	ror	_ror,d0
.black
	subq	#2,x
	store	d0,(ptr)
	jump	ne,(LOOP)
	subqt	#4,ptr

	moveq	#320>>4,r0
	addqt	#16,_ror
	shlq	#4+1,r0
	sub	r0,ptr
	subq	#2,y
	moveq	#320>>4,x
	jump	ne,(LOOP)
	shlq	#4,x

	jump	(restart)
	addq	#1,timer

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
