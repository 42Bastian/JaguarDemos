;; -*-asm-*-
;;; ----------------------------------------
;;; rodot - ROtadting DOTs - Lovebyte 2023 Entry
;;; ----------------------------------------

	gpu

 IFD TIMING
 echo "Timing enabled"
 endif

 IFD MODEL_M
 echo "Model M"
 ENDIF

 IFD TIMING
WANTED_SIZE	SET 256+64
 ELSE
WANTED_SIZE	SET 256
 ENDIF
BLOCKS		SET (WANTED_SIZE/64)		; max. is 10

OBL	EQU $37020

 IFD MODEL_M
jaguar_pic	equ $e07110 // 64*64*CRY
 ELSE
jaguar_pic	equ $e06b80
 ENDIF

	include <js/symbols/jagregeq.js>
	include <js\symbols\blit_eq.js>

bg_col		reg 31
main		reg 30
obl		reg 29
blit_count	reg 28
screen_ptr	reg 27
timer		reg 26
jag_texture	reg 25
_31		reg 24
state		reg 23
_160		reg 22

blitter		reg 15
sine_table	reg 14

tmp1		reg 1
tmp0		reg 0

MACRO WAITBLITTER
.\wait@
	load (blitter+$38),tmp0
	shrq #1,tmp0
	jr cc,.\wait@
//->	nop
ENDM

	RUN $00F035AC		; Start address after decryption. Fix!!!
start:
	;; switch to 8 bit ROM for the Jaguar picture
	moveq	#15,r0
	shlq	#20,r0
	movei	#$1861,r1
	storew	r1,(r0)

	movei	#$f1d200,r14	; sine table in Jerry
	movei	#$f02200,blitter
	movei	#OBL,obl

 IFD TIMING
	movei	#$f00058,bg_col
 ENDIF
	movei	#BLIT_PITCH1|BLIT_PIXEL32|BLIT_WID3584|BLIT_XADDPIX,r0
	moveq	#1,r1
	bset	#16,r1
	store	r0,(blitter+_BLIT_A1_FLAGS)
	store	r1,(blitter+_BLIT_PATD)
	movei	#(320*240*2/4)|(1<<16),blit_count

	moveq	#0,timer

	moveq	#16,screen_ptr
	shlq	#16,screen_ptr

	moveq	#31,_31
	moveq	#10,_160
	moveq	#0,state
	shlq	#4,_160

	move	pc,main
loop:
	move	timer,r0
	shlq	#22,r0
	jr	ne,nochg
	cmpq	#2,state
	jr	ne,nochg
	addq	#1,state
	subq	#3,state
nochg:

	movei	#$25800,r0
	moveq	#B_PATDSEL>>16,r2
wvbl:	load	(obl),r1
	shrq	#8,r1
	cmp	screen_ptr,r1
	jr	ne,wvbl
 IFD TIMING
	storew	r2,(bg_col)
	storew	bg_col,(bg_col)
 ENDIF
	xor	r0,screen_ptr

	store	screen_ptr,(blitter)	;_BLIT_A1_BASE
	store	r2,(blitter+_BLIT_A1_PIXEL)
	shlq	#16,r2
	store	blit_count,(blitter+_BLIT_COUNT)
	store	r2,(blitter+_BLIT_CMD)

	WAITBLITTER

;; ----------------------------------------
;;->  cos2 = cos1 = sitab[(timer+64)&255]/256.;
;;->  sin2 = sin1 = sitab[timer & 255]/256.;
;;-> for(int x = -31; x < 32; ++x){
;;->    for(int z = -31; z < 32; ++z){
;;->      int y = get_z(x,z);
;;->      float x1 =(x*cos1+y*sin1);
;;->      float y1 =(y*cos1-x*sin1);
;;->      float x2 = (x1*cos2+z*sin2);
;;->      float z2 = (z*cos2-x1*sin2);
;;->      float sc = 1;//((2+sin2)*80/(120+z*cos2-x1*sin2));
;;->      plot(int(120+x2*sc),int(90-y1*sc),0,int(96+z2),63+z);
;;->      //println(abs(z2*4));
;;->    }

LOOPX	reg 20
LOOPZ	reg 19
sin	reg 18
cos	reg 17
color	reg 16
x	reg 13
y	reg 12
z	reg 11
x1	reg 10
y1	reg  9
z1	reg  8
sin2	reg  7
cos2	REG  6

	moveq	#0,r0
	bset	#7-1,r0
	movei	#$7f*4,r1
	move	timer,sin
	move	sin,cos
	add	r0,cos
	and	r1,sin
	and	r1,cos
	load	(sine_table+cos),cos
	load	(sine_table+sin),sin

        movei   #jaguar_pic,jag_texture

	move	_31,x
	neg	x

	move	pc,LOOPX

loopx:
	move	_31,z
	neg	z
	move	pc,LOOPZ
	addq	#4,LOOPZ
loopz:
	;; load texture
	loadw	(jag_texture),color
	addq	#2,jag_texture

	;; 3D pattern

	cmpq	#1,state
	jr	cs,cont
	moveq	#0,y
	move	z,y
	jr	eq,cont
	xor	x,y
	moveq	#8,r1
checker:
	and	r1,y
	shlq	#1,y
	xor	r1,y
cont:
	move	x,r0
	neg	r0

	imultn	cos,x
	imacn	sin,y
	resmac	x1		; x1 = x*cos+y*sin

	imultn	cos,y
	imacn	sin,r0
	resmac	y1		; y1 = y*cos-x*sin

	sharq	#15,x1

	imultn	cos,x1
	imacn	sin,z
	resmac	x1

	sharq	#14,x1		; normalize , then *2
	sharq	#14,y1

	add	_160,x1
	moveq	#27,r3
	shlq	#1,x1
	shlq	#2,r3		; 108
	add	screen_ptr,x1
	sub	y1,r3
	mult	_160,r3
	shlq	#2,r3
	add	x1,r3
	addqt	#24,color
	cmp	z,_31
	addqt	#1,z
	jump	ne,(LOOPZ)
	storew	color,(r3)
	addq	#2,jag_texture
	cmp	x,_31
	jump	ne,(LOOPX)
	addqt	#1,x

;; ----------------------------------------
	jump	(main)
	addq	#2,timer

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
