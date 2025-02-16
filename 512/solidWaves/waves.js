;; -*-asm-*-
;;;  solidWaves
;;; ----------------------------------------
;;; Author: 42Bastian
;;; Release: LoveByte 2025
;;; ----------------------------------------
;;; Size: 512 bytes
;;; ----------------------------------------

	gpu

	include <js/symbols/jagregeq.js>
	include <js/symbols/blit_eq.js>
	include <js/macro/help.mac>

	MACRO BPT
.\b	jr	.\b
	nop
	ENDM

	UNREG LR,SP,LR.a,SP.a

//->TIMING	SET 1

fp_rez		equ 5

MAX_Z		equ 80

 IFD MODEL_M
 echo "Model M"
 ENDIF

WANTED_SIZE	SET 512

BLOCKS		SET (WANTED_SIZE/64)		; max. is 10

OBL		EQU $37000

		regtop 31

screen_ptr	reg 22
tmp2		reg 2
tmp1		reg 1
tmp0		reg 0

LR		reg 99
obl		reg 99
x_save		reg 99
frame		reg 99
txt_ptr		reg 99
_180		reg 99

blitter.a	reg 99
min_max.a	reg 99
dot_ptr.a	reg 99
dot_ptr2.a	reg 99

	RUN $00F035AC		; Start address after decryption. Fix!!!
start:
	shlq	#10,screen_ptr	; FF => 3fc00

 IFD MODEL_M
	movei	#$5076,r14
	storew	r3,(r14)	; Disable BIOS double buffering (r3 == 0)
	addq	#2,r14
	movei	#$4e722000,r0	; stop #$2000
	store	r0,(r14+$5098-$5078)
 ELSE
	movei	#$5064,r0
	storew	r3,(r0)		; Disable BIOS double buffering (r3 == 0)
 ENDIF

	moveq	#$120/16,r14
	shlq	#4,r14
	movei	#OBL,obl
	store	r4,(r14+obl)    ; disable logo object (r4 < 0)

	movei	#$f1a114,r0	; disable DSP -> Roaar
	store	r3,(r0)
;;; ----------------------------------------
;;; setup
;;; ----------------------------------------
	movei	#320<<(16+fp_rez),r3	; minX:maxX
	move	screen_ptr,x_save
	moveta	r3,min_max.a
.loop0
	subq	#1,r14
	subqt	#4,x_save
	jr	nn,.loop0	; +1 as pivot
	store	r3,(x_save)

	moveq	#20,_180
	shlq	#3,_180		; => 120

;;; ----------------------------------------
;;; main loop
;;; ----------------------------------------
blitter		reg 14

MAIN_LOOP	reg 99
cur_scr		reg 99
bg		reg 99
z		reg 99

	move	pc,MAIN_LOOP
superloop:
	addq	#4,frame
 IFD TIMING
	movei	#$f00058,bg
 ENDIF
	movei	#$f02200,blitter
	movei	#$3720c,cur_scr
	moveta	blitter,blitter.a
	store	screen_ptr,(cur_scr)
 IFD TIMING
	storew	screen_ptr,(bg)
 ENDIF
wvbl:	load	(obl),r1
	shrq	#8,r1
	cmp	screen_ptr,r1
	jr	ne,wvbl
	moveq	#0,tmp0
 IFD TIMING
	storew	bg,(bg)
 ENDIF
	store	tmp0,(blitter+_BLIT_A1_PIXEL)
	bset	#18,tmp0
	;; clear screen

	movei	#BLIT_PITCH1|BLIT_PIXEL32|BLIT_WID3584|BLIT_XADDPHR,r1
	xor	tmp0,screen_ptr
	store	r1,(blitter+_BLIT_A1_FLAGS)
	moveq	#$19,r1
	store	screen_ptr,(blitter)	;_BLIT_A1_BASE
	shlq	#12,r1			; $19<<12 ~=  (1<<16)|(320*230/2)
	moveq	#0,z
	store	r1,(blitter+_BLIT_COUNT)
	store	z,(blitter+_BLIT_CMD)

	unreg blitter,cur_scr,bg

dot_ptr		reg 15
sine_tab	reg 14

LOOP_X		REG 99
LOOP_Z		REG 99
sine_mask	reg 99
center_x	reg 99
x		reg 99
max_z		reg 99
hi		reg 99
reci		reg 99
frame_m_z	reg 99
sin_z		reg 99
color		reg 99

	moveq	#MAX_Z/4,max_z
	moveq	#10,center_x
	shlq	#2+2,max_z
	shlq	#4,center_x	; => 160

	movei	#$f1d200,sine_tab ; DSP sine table
	movei	#$7f<<2,sine_mask

	moveq	#1,dot_ptr
	shlq	#16,dot_ptr

	sub	_180,z
	move	frame,frame_m_z
	shlq	#1,frame_m_z
	move	pc,LOOP_Z
loop_z:
	moveq	#31,tmp0
	moveq	#0,reci
	shlq	#4,tmp0		; => 416
	bset	#15,reci
	sub	z,tmp0
	and	sine_mask,frame_m_z
	load	(sine_tab+frame_m_z),sin_z
	div	tmp0,reci

	move	_180,hi
	move	_180,x
	neg	hi
	neg	x
	shlq	#2,hi
	move	PC,LOOP_X
	addq	#2,LOOP_X
loop_x:
	and	sine_mask,hi
	load	(sine_tab+hi),tmp1

	add	sin_z,tmp1
	move	frame,tmp0
	jr	pl,.pos
	sharq	#11,tmp1
	abs	tmp1
.pos
	move	tmp1,color
	shrq	#1,tmp0
	shlq	#3,color
	and	sine_mask,tmp0
	sat8	color
	load	(sine_tab+tmp0),tmp0
//->	moveq	#0,tmp0			; enable to get flat plane
	not	color
	imult	tmp0,tmp1
	bclr	#14,color
	move	x,tmp0
	sharq	#14,tmp1
	moveq	#5,tmp2
	imult	reci,tmp0
	shlq	#5,tmp2
	sharq	#15-8,tmp0
	sub	tmp1,tmp2
	add	center_x,tmp0
	mult	reci,tmp2
	store	tmp0,(dot_ptr)
	shrq	#15-8,tmp2
	store	color,(dot_ptr+8)
	store	tmp2,(dot_ptr+4)

	addqt	#4*2,x
	cmp	x,_180
	addqt	#16,dot_ptr
	jump	ne,(LOOP_X)
	addqt	#4*4,hi

	cmp	z,max_z
	subqt	#8*4,frame_m_z
	jump	pl,(LOOP_Z)
	addqt	#4*4,z

	unreg	hi,frame_m_z,x,z,sine_mask,sine_tab,dot_ptr
	unreg	color,sin_z,reci,center_x,max_z
	unreg	LOOP_Z,LOOP_X

dot_ptr		reg 15
blitter		reg 14
dot_ptr2	reg 14!

min_y		reg 99
EDGE		reg 99
FACE_LOOP	reg 99
LOOP		reg 99
face_cnt	reg 99
line_cnt	reg 99

x1		reg 0!
y1		reg 1!
x2		reg 2!
y2		reg 3

draw_rects::
	move	_180,dot_ptr2
	moveq	#1,dot_ptr
	shlq	#2,dot_ptr2
	shlq	#16,dot_ptr
	add	dot_ptr,dot_ptr2

	moveq	#MAX_Z/3-1,line_cnt
	movei	#Edge,EDGE
__pc:	move	pc,LOOP
	jr	.into_loop
	addq	#.loop-__pc,LOOP

.loop
	subq	#4,face_cnt
	movefa	dot_ptr.a,dot_ptr
	jr	pl,.ok
	movefa	dot_ptr2.a,dot_ptr2

	subq	#1,line_cnt
	addqt	#16,dot_ptr
	jump	eq,(MAIN_LOOP)
	addqt	#16,dot_ptr2
.into_loop
	move	_180,face_cnt
	subq	#8,face_cnt
.ok
	move	pc,LR
	move	pc,min_y	; load with any high value > 240
	addq	#6,LR

	load	(dot_ptr),x1	; <<= LR
	load	(dot_ptr+4),y1
	load	(dot_ptr+16),x2
	jump	(EDGE)
	load	(dot_ptr+20),y2

	load	(dot_ptr+16),x1
	load	(dot_ptr+20),y1
	load	(dot_ptr2+16),x2
	jump	(EDGE)
	load	(dot_ptr2+20),y2

	load	(dot_ptr2+16),x1
	load	(dot_ptr2+20),y1
	load	(dot_ptr2),x2
	jump	(EDGE)
	load	(dot_ptr2+4),y2

	load	(dot_ptr2),x1
	load	(dot_ptr2+4),y1
	load	(dot_ptr),x2
	jump	(EDGE)
	load	(dot_ptr+4),y2

	load	(dot_ptr+8),r0
	load	(dot_ptr+8+16),r1
	load	(dot_ptr2+8),r2
	load	(dot_ptr2+8+16),r3
	addq	#16,dot_ptr
	addq	#16,dot_ptr2

	add	r0,r1
	add	r2,r3
	moveta	dot_ptr,dot_ptr.a
	add	r3,r1
	moveta	dot_ptr2,dot_ptr2.a
	shrq	#2,r1
	movefa	blitter.a,blitter
	store	r1,(blitter+_BLIT_PATD)
	movei	#BLIT_PITCH1|BLIT_PIXEL16|BLIT_WID320|BLIT_XADDPIX,tmp0
	store	tmp0,(blitter+_BLIT_A1_FLAGS)

****************
* draw H-Lines

ptr		reg 15!

DL_LOOP		reg 99
min_max		reg 99
tmp3		reg 99

	movefa	min_max.a,min_max
	move	x_save,ptr
	move	pc,DL_LOOP
.dl_loop
	load	(ptr+min_y),x2
	cmp	x2,min_max
	move	x2,x1
	jump	eq,(LOOP)
	shlq	#16,x2
	store	min_max,(ptr+min_y)
	shrq	#16+fp_rez,x1
	shrq	#16+fp_rez,x2
	sub	x1,x2
	shlq	#16+2,x1	; y is *4!
	addq	#1,x2
	or	min_y,x1
	addqt	#4,min_y
	rorq	#16+2,x1
	bset	#16,x2
wait_blit
	load	(blitter+_BLIT_CMD),tmp3
	btst	#0,tmp3
	jr	eq,wait_blit
	shlq	#16,tmp3

	store	x1,(blitter+_BLIT_A1_PIXEL)
	store	x2,(blitter+_BLIT_COUNT)
	jump	(DL_LOOP)
	store	tmp3,(blitter+_BLIT_CMD)

	UNREG  DL_LOOP,min_max,tmp3

****************
* edge (x1,y1)-(x2,y2)
****************
dx		reg 99
dy		reg 99
x_min		reg 99
x_max		reg 99

Edge::
	addq	#10,LR

	shlq	#fp_rez,x1
	move	y2,dy
	shlq	#fp_rez,x2
	sub	y1,dy
	move	x2,dx
	jr	nn,.noswap
	sub	x1,dx

	move	x2,x1
	move	y2,y1

	neg	dx
	neg	dy
.noswap
	abs	dx
	div	dy,dx
	jr	cc,.pos
	shlq	#2,y1
	neg	dx
.pos
	cmp	y1,min_y
	move	x_save,x2
	jr	n,.nn
	moveq	#2,y2
	move	y1,min_y
.nn
	add	x2,y1
	add	y1,y2
.loop
	loadw	(y1),x_min
	cmp	x1,x_min
	loadw	(y2),x_max
	jr	n,.larger2
	cmp	x1,x_max
	storew	x1,(y1)

.larger2
	jr	nn,.smaller2
	addqt	#4,y1
	storew	x1,(y2)
.smaller2
	subq	#1,dy
	jump	n,(LR)
	addqt	#4,y2
	jr	.loop
	add	dx,x1

 UNREG x_min,x_max,x1,x2,y1,y2,dx,dy

//->	include <js/inc/minihex.inc>

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
	echo "Wanted %dWANTED_SIZE"
 END
