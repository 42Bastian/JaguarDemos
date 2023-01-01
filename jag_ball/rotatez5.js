* -*-asm-*-
* GPU-Unterroutinen
* (c) 1994 Bastian Schick
* created : 7.8.94
* last change : 27.12.22/17.1.95/29.8.94/8.8.94

	GPU

	include <js/macro/help.mac>
	include <js/macro/joypad1.mac>
	include <js/symbols/blit_eq.js>
	include <js/symbols/jagregeq.js>

	UNREG SP,SP.a,LR,LR.a

POINTS		set GPU_ENDRAM-4
COUNTER		set POINTS-4
SIN_ALPHA	set COUNTER-4
COS_ALPHA	set SIN_ALPHA-4
SIN_BETA	set COS_ALPHA-4
COS_BETA	set SIN_BETA-4
SIN_GAMMA	set COS_BETA-4
COS_GAMMA	set SIN_GAMMA-4
SCREEN		set COS_GAMMA-4
COLOR		set SCREEN-4
BLIT_CNTRL	set COLOR-4

STACK		set BLIT_CMD-4

	run $f03000

* Register *****************************

; a=cos(gamma) b=sin(gamma)
; c=cos(beta)  d=sin(beta)
; e=cos(alpha) f=sin(alpha)

a	reg 20
b	reg 19
c	reg 18
d	reg 17
e	reg 16
f	reg 15
af	reg 14
bf	reg 13
ae	reg 12
be	reg 11


m1	reg 9	;
m2	reg 8	;
m3	reg 7	;          / ac adf-be ade+bf \
m4	reg 6	;          |                  |
m5	reg 5	; D(x,y,z)=| bc bdf+ae bde-af |
m6	reg 4	;          |                  |
m7	reg 3	;          \-d    cf     ce   /
m8	reg 2	;
m9	reg 1	;


rotate	movei #COLOR+8,r14
	load (r14),a
	load (r14+4),b
	load (r14+8),c
	load (r14+12),d
	load (r14+16),e
	load (r14+20),f
****************
	move a,af
	imult f,af
	sharq #15,af

	move a,ae
	imult e,ae
	sharq #15,ae

	move b,bf
	imult f,bf
	sharq #15,bf

	move b,be
	imult e,be
	sharq #15,be

	move a,m1
	imult c,m1
	sharq #15,m1

	move af,m2
	imult d,m2
	sharq #15,m2

	sub be,m2

	move ae,m3
	imult d,m3
	sharq #15,m3
	add bf,m3

	move b,m4
	imult c,m4
	sharq #15,m4

	move bf,m5
	imult d,m5
	sharq #15,m5
	add ae,m5

	move be,m6
	imult d,m6
	sharq #15,m6
	sub af,m6

	move d,m7
	neg m7

	move f,m8
	imult c,m8
	sharq #15,m8

	move c,m9
	imult e,m9
	sharq #15,m9

	UNREG a,b,c,d,e,f,af,bf,ae,be
****************
color		reg 31
bpattern	reg 30
zbuffer		reg 29
z_offset	reg 28
bstart		reg 27

counter0	REG 26
loop		REG 25
screen_ptr	REG 24
color_ptr	REG 23
intensity	reg 22
points_x0	REG 21
hi_phrase	REG 20
x0		reg 19
y0		reg 18
z0		reg 17
x1		reg 16
y1		reg 15
z1		reg 14

pel_ptr		REG 13
dist		reg 12
blitter		reg 11
bcounter	reg 10
* REG 1..9 = m1..m9
dummy		reg 0

* Register mit Mehrfachbelegung
middle_x	REG 19!
middle_y	REG 18!
*

	movei #BLIT_CNTRL,r14
	load (r14),dummy
	load (r14+4),color_ptr
	addq #8,r14
	load (r14),screen_ptr
	load (r14+28),counter0
	load (r14+32),points_x0
* Blitter init
	movei #$f02200,blitter
	store screen_ptr,(blitter)
	addq #4,blitter
	store dummy,(blitter)
	addq #4,blitter
	movei #$011c0140,dummy
	store dummy,(blitter)
	movei #$00010001,bcounter
	addq #$1c-8,blitter
	store bcounter,(blitter)
	movei #BLIT_A1_PIXEL,pel_ptr
	movei #BLIT_PATD,bpattern
	movei #BLIT_SRCZ1,zbuffer
	movei #300,z_offset

	movei #(1<<18)|BLIT_DSTENZ|BLIT_DSTWRZ|BLIT_PATDSEL,bstart
	movei #$f02238,blitter
***************
	movei #$f02118,hi_phrase
	movei #loop_xyz,loop
	loadp (points_x0),y0 ; r1=y/z

loop_xyz
	move y0,z0
	sharq #16,y0
	shlq #16,z0
	load (hi_phrase),x0
	sharq #16,z0
	addq #8,points_x0

	imultn m1,x0
	imacn m2,y0
	imacn m3,z0
	resmac x1	; new x

	imultn m4,x0
	imacn m5,y0
	imacn m6,z0
	resmac y1	; new y

	imultn m7,x0
	imacn m8,y0
	imacn m9,z0
	resmac z1	; new z

	loadw (color_ptr),color
	addq #2,color_ptr

	sharq #15,x1
	sharq #15,y1
	sharq #15,z1

	movei #160,middle_x
	movei #120,middle_y

	move y1,intensity
	move y1,dummy
	addq #32,intensity
	add middle_x,x1
	shrq #3,dummy
	add middle_y,z1
	sub dummy,x1
	sub dummy,z1
	shlq #16,x1
	shlq #16,z1
	shrq #16,x1
	shlq #2,intensity
	or z1,x1
	sat8 intensity
	add z_offset,y1
	or intensity,color

.ko	load (blitter),dummy	; Blitter schon fertig ??
	btst #0,dummy
	jr z,.ko
	nop

	bclr #0,color
	store x1,(pel_ptr)
	addq #4,blitter
	store y1,(zbuffer)
	store bcounter,(blitter)
	subq #4,blitter
	store color,(bpattern)
	subq #1,counter0
	store bstart,(blitter)
	jump nz,(loop)
	loadp (points_x0),y0
***************
	STOP_GPU
