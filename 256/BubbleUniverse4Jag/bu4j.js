;; -*-asm-*-
;;;  BubbleUniverse4Jag
;;; ----------------------------------------
;;; Author: 42Bastian
;;; Release: Sillyventure WE 2023
;;; ----------------------------------------
;;; Size: 256 bytes
;;; ----------------------------------------

	gpu

	include <js/symbols/jagregeq.js>
	include <js/symbols/blit_eq.js>
	include <js/macro/help.mac>

	UNREG LR,SP,LR.a,SP.a

NO_ROAR		EQU 1

 IFD MODEL_M
 echo "Model M"
 ENDIF

WANTED_SIZE	SET 256

BLOCKS		SET (WANTED_SIZE/64)		; max. is 10

OBL		EQU $37000

		regtop 31

LR		reg 31
blitter		reg 15
sine_tab	reg 14
screen_ptr	reg 22
tmp1		reg 1
tmp0		reg 0

color		reg 99
restart		reg 99
obl		reg 99
current_scr	reg 99
frame		reg 99
center_x	reg 99
center_y	reg 99
i		reg 99
j		reg 99
LOOP_I		REG 99
LOOP_J		REG 99
i0		reg 99
v		reg 99
u		reg 99
p0		reg 99
p1		reg 99
_41		reg 99
_41_dst		reg 99
_100		reg 99
SINE		reg 99

FP	equ 9

	RUN $00F035AC		; Start address after decryption. Fix!!!
start:
	shlq	#12,screen_ptr	; is $ff after decoding

 IFD MODEL_M
	movei	#$5076,r0
 ELSE
	movei	#$5064,r0
 ENDIF
	storew	r3,(r0)		; Disable BIOS double buffering (r3 == 0)

	moveq	#$120/16,r15
	shlq	#4,r15
	movei	#OBL,obl
	store	r4,(r15+obl)    ; disable logo object (r4 < 0)

 IFD NO_ROAR
	movei	#$f1a114,r0	; disable DSP -> Roaar
	store	r3,(r0)
 ENDIF
;;; ----------------------------------------
;;; setup
;;; ----------------------------------------
	movei	#$3720c,current_scr
	move	sine_tab,SINE
	subq	#end-sine-4,SINE
	addq	#4,sine_tab
	movei	#$f1d200-4,r15	; DSP sine table
	move	sine_tab,r0	; r14 points behind intro

//->	moveq	#0,r3
	bset	#7+2,r3
	moveq	#0,r4
.l	load	(r15+r3),r2
	move	r2,r5
	add	r2,r4
	sharq	#1+(15-FP),r4
	sharq	#15-FP,r5
	store	r4,(r0)
	addqt	#4,r0
	subq	#4,r3
	store	r5,(r0)
	addqt	#4,r0
	jr	ne,.l
	move	r2,r4

	movei	#$f02200,blitter

	moveq	#10,center_x
	moveq	#15,center_y
	shlq	#4+1,center_x
	shlq	#3,center_y

	moveq	#25,_100	; PAL: 27 possible
	shlq	#2,_100
 IFD NO_ROAR
	moveq	#20,_41
	addq	#21,_41
 ELSE
	moveq	#0,_41
	moveq	#20,_41_dst
	addq	#21,_41_dst
 ENDIF

	movei	#BLIT_PITCH1|BLIT_PIXEL32|BLIT_WID3584|BLIT_XADDPHR,r1
	store	r1,(blitter+_BLIT_A1_FLAGS)

	move	pc,restart
superloop:
 IFD NO_ROAR
	store	screen_ptr,(current_scr)
 ELSE
	cmp	_41_dst,_41
	jr	eq,wvbl
	store	screen_ptr,(current_scr)
	addq	#1,_41
 ENDIF
wvbl:	load	(obl),r1
	shrq	#8,r1
	cmp	screen_ptr,r1
	jr	ne,wvbl
	moveq	#0,tmp0
	store	tmp0,(blitter+_BLIT_A1_PIXEL)
	bset	#19,tmp0
	xor	tmp0,screen_ptr

	;; clear screen
	store	screen_ptr,(blitter)	;_BLIT_A1_BASE
	moveq	#$19,r1
	shlq	#15,r1	       ; ~=  (1<<16)|(320*220/2)
	store	r1,(blitter+_BLIT_COUNT)
	store	tmp0,(blitter+_BLIT_CMD)

	move	_100,i
	move	i,i0
	move	pc,LOOP_I
loop_i:
	shlq	#FP,i0
	move	_100,j
	move	PC,LOOP_J
	addq	#4,LOOP_J
loop_j:
	move	i0,p1
	move	i0,p0
	shrq	#4,p1
	add	v,p0
	add	u,p1
	move	pc,LR
	jump	(SINE)
	add	frame,p0
	move	r0,u
	move	r1,v

	jump	(SINE)
	move	p1,p0
	add	r0,u
	add	r1,v

	move	v,tmp0
	move	u,tmp1
	imult	_100,tmp0
	imult	_100,tmp1
	sharq	#FP+1,tmp0	; +1 => radius 50
	sharq	#FP+1,tmp1
	shlq	#1,tmp0
	add	center_y,tmp1
	add	center_x,tmp0
	imult	center_x,tmp1
	shlq	#1,tmp1
	move	i,color
	add	tmp0,tmp1
	shlq	#7,color
	add	screen_ptr,tmp1
	or	j,color
	shlq	#2,color

	subq	#1,j
	jump	ne,(LOOP_J)
	storew	color,(tmp1)

	subq	#1,i
	jump	ne,(LOOP_I)
	move	i,i0

	jump	(restart)
	addq	#7,frame

	// get sine and cosine from p0
	// must be at end of intro!
sine:
	imult	_41,p0
	moveq	#0,r1
	sharq	#FP,p0
	bset	#6,r1
	add	p0,r1
	shlq	#24,p0
	shlq	#24,r1
	shrq	#22,p0
	load	(sine_tab+p0),r0
	addq	#6,LR
	shrq	#22,r1
	jump	(LR)
	load	(sine_tab+r1),r1

	align	4		; sine tab will be placed here

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
