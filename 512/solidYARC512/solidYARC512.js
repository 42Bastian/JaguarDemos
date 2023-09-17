;; -*-asm-*-
;;;  yarc512 - yet another rotaing cube in 512 bytes
;;; ----------------------------------------
;;; Author: 42Bastian
;;; Release: Sillyventure SE 2023
;;; ----------------------------------------
;;; Model M: 10 bytes free
;;; Model K: 10 bytes free
;;; ----------------------------------------

	gpu

	include <js/symbols/jagregeq.js>
	include <js/symbols/blit_eq.js>
	include <js/macro/help.mac>

	UNREG LR,SP,LR.a,SP.a

BLIT_WID	EQU BLIT_WID320
max_x		equ 256
max_y		equ 220
fp_rez		equ 5

//->TIMING	EQU 1

 IFD MODEL_M
 echo "Model M"
 ENDIF

WANTED_SIZE	SET 512

BLOCKS		SET (WANTED_SIZE/64)		; max. is 10

OBL		EQU $37000

		regtop 31

ptr		reg 15
vertex		reg 14
screen_ptr	reg 22
tmp1		reg 1
tmp0		reg 0

LR		reg 99
PROJ		reg 99
 IFD TIMING
bg_col		reg 99
 ENDIF
restart		reg 99
obl		reg 99
current_scr	reg 99
frame		reg 99
vx		reg 99
vy		reg 99
vz		reg 99
cnt		reg 99
m		reg 99
cos		reg 99
sin		reg 99
center_x	reg 99
center_y	reg 99
mask		reg 99

faces.a		reg 31
vertex.a	reg 30
vertex_stack.a	reg 29
x_save.a	reg 28

	MACRO WAITBLITTER
.\wait@
	load (blitter+$38),tmp0
	shrq #1,tmp0
	jr cc,.\wait@
//->	nop			; be sure no movei follows!
	ENDM

	RUN $00F035AC		; Start address after decryption. Fix!!!
start:
	moveta	r0,vertex_stack.a ; somewhere in GPU RAM
	moveta	r14,faces.a	; points to last decoded word
	moveta	r11,vertex.a	; somewhere in GPU RAM
	shlq	#12,screen_ptr	; is $ff after decoding
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

//->	movei	#$f1a114,r0	; disable DSP -> Roaar
//->	store	r3,(r0)

;;; ----------------------------------------
;;; setup
;;; ----------------------------------------
	move	screen_ptr,r0
	bset	#8+16+fp_rez,r3		; minX:maxX
	moveta	r3,ptr
.loop0
	subq	#1,r14
	subqt	#4,tmp0
	jr	nn,.loop0	; +1 as pivot
	store	r3,(tmp0)

	moveta	r0,x_save.a

	movefa	vertex.a,vertex
	moveq	#22,frame
	shlq	#2,frame
	move	frame,tmp0
.init1	subq	#4,frame
	jr	ne,.init1
	store	tmp0,(vertex+frame)

	neg	tmp0
	store	tmp0,(vertex+20) ; z[1]
	store	tmp0,(vertex+28) ; y[2]
	addq	#12,vertex
	store	tmp0,(vertex+28) ; y[3]
	store	tmp0,(vertex+32) ; z[3]

	movei	#$3720c,current_scr
	store	screen_ptr,(current_scr)
 IFD TIMING
	movei	#$f00058,bg_col
 ENDIF

	move	pc,restart
superloop:
	addqt	#2,frame
wvbl:	load	(obl),r1
	shrq	#8,r1
	cmp	screen_ptr,r1
	jr	ne,wvbl
 IFD TIMING
	echo "Timing enabled"

	storew	screen_ptr,(bg_col)
	storew	bg_col,(bg_col)
 ENDIF
	moveq	#0,mask

	movei	#$f1d200,r15	; DSP sine table
	bset	#7,mask
	move	frame,sin
	move	frame,cos
	add	mask,cos
	subq	#1,mask		; 7f
	shlq	#2,mask
	and	mask,sin
	load	(r15+sin),sin
	and	mask,cos
	load	(r15+cos),cos

	shrq	#2,mask		; back to $7f

	movefa	ptr,ptr

	moveq	#10,center_x
	moveq	#15,center_y
	shlq	#4,center_x
	shlq	#3,center_y

	moveq	#1,m
	movefa	vertex.a,vertex
	moveq	#4,cnt
	move	pc,PROJ
.proj
	load	(vertex),vx
	load	(vertex+4),vy
	load	(vertex+8),vz
	addqt	#12,vertex

	imult	m,vx
	imult	m,vy
	imult	m,vz

	move	vx,r0
	imultn	cos,vx
	imacn	sin,vz
	resmac	vx		; x1 = x*cos+z*sin

	neg	r0
	imultn	cos,vz
	imacn	sin,r0
	resmac	vz		; z1 = z*cos-x*sin

	sharq	#15,vx
	sharq	#15+2,vz	; normalize and divide by 4

	btst	#9,frame
	jr	eq,.no_x
	move	vy,r0
	imultn	cos,vy
	imacn	sin,vx
	resmac	vy		; y1 = y*cos+x*sin

	neg	r0
	imultn	cos,vx
	imacn	sin,r0
	resmac	vx		; x1 = x*cox-y*sin

	sharq	#15,vx
	sharq	#15,vy
.no_x:
	add	mask,vz
	imult	vz,vx
	imult	vz,vy
	sharq	#7+1,vx
	sharq	#7+1,vy

	add	center_x,vx
	add	center_y,vy

	store	vx,(ptr)
	subq	#1,cnt
	store	vy,(ptr+4)
	jump	ne,(PROJ)
	addqt	#8,ptr

	neg	m
	subqt	#4,PROJ
	jump	mi,(PROJ)

	unreg	m,vertex,sin,cos,mask
	unreg	vx,vy,vz,center_x,center_y,PROJ

blitter		reg 14
EDGE		reg 99
face_ptr	reg 99
face_cnt	reg 99

	movefa	faces.a,face_ptr

	movei	#$f02200,blitter
	;; clear screen
	store	screen_ptr,(blitter)	;_BLIT_A1_BASE
	movei	#BLIT_PITCH1|BLIT_PIXEL32|BLIT_WID3584|BLIT_XADDPHR,r1
	store	r1,(blitter+_BLIT_A1_FLAGS)
	movei	#(1<<16)|(320*220/2),r1
	store	cnt,(blitter+_BLIT_A1_PIXEL)
	store	r1,(blitter+_BLIT_COUNT)
	store	cnt,(blitter+_BLIT_CMD)

	UNREG cnt

min_y		reg 99

FACE_LOOP	reg 99
vertex_stack	reg 99
edge_cnt	reg 99

x1		reg 0!
y1		reg 1!
x2		reg 2!
y2		reg 3

draw_rects::
	moveq	#5,face_cnt
	move	pc,FACE_LOOP
.loop
	movei	#Edge,EDGE
	WAITBLITTER
	movefa	vertex_stack.a,vertex_stack
	load	(face_ptr),r2

	subq	#1,face_cnt
	subqt	#4,face_ptr
	jump	eq,(restart)
	movefa	ptr,ptr
.loop0
	move	r2,r0
	shrq	#26,r0
	load	(ptr+r0),r1	; y0
	subq	#4,r0
	store	r1,(vertex_stack)
	addq	#4,vertex_stack
	load	(ptr+r0),r0	; x0
	shlq	#6,r2
	store	r0,(vertex_stack)
	jr	ne,.loop0
	addq	#4,vertex_stack

	UNREG	vertex_stack

	movefa	vertex_stack.a,ptr ;r14 or r15 !!

	;; p0 - 4/0
	;; p1 - 12/8
	;; p2 - 20/16

	load	(ptr+12),r0	; p1.x
	load	(ptr+4),r1	; p0.x
	move	r0,r4
	sub	r1,r0		; p1.x-p0.x
	load	(ptr+16),r2	; p2.y
	load	(ptr+8),r3	; p1.y
	sub	r3,r2		; p2.y-p1.y
	imult	r0,r2
	load	(ptr+20),r1	; p2.x
	sub	r1,r4		; p0.x-p2.x
	load	(ptr),r1	; p0.y
	sub	r1,r3		; p2.y-p0.y
	imult	r4,r3
	add	r2,r3
	jump	pl,(FACE_LOOP)
	moveq	#5,edge_cnt

	move	PC,min_y	; > 220*4 !
	move	pc,LR
.loop1
	load	(ptr),y2
	load	(ptr+4),x2
	load	(ptr+8),y1
	subq	#1,edge_cnt
	load	(ptr+12),x1
	jump	ne,(EDGE)
	addq	#8,ptr

	sh	face_cnt,EDGE
	store	EDGE,(blitter+_BLIT_PATD)
	movei	#BLIT_PITCH1|BLIT_PIXEL16|BLIT_WID320|BLIT_XADDPIX,tmp0
	store	tmp0,(blitter+_BLIT_A1_FLAGS)

****************
* draw H-Lines

DL_LOOP		reg 99
tmp2		reg 99

	bset	#8+16+fp_rez,edge_cnt ; min/max
	movefa	x_save.a,ptr
	move	pc,DL_LOOP
.dl_loop
	load	(ptr+min_y),x2
	cmp	x2,edge_cnt
	move	x2,x1
	jump	eq,(FACE_LOOP)
	shlq	#16,x2
	store	edge_cnt,(ptr+min_y)
	shrq	#16+fp_rez,x1
	shrq	#16+fp_rez,x2
	sub	x1,x2
	shlq	#16+2,x1	; y is *4!
	addq	#1,x2
	or	min_y,x1
	addqt	#4,min_y
	rorq	#16+2,x1
	bset	#16,x2
.waitblit
	load	(blitter+$38),tmp2
	btst	#0,tmp2
	jr	z,.waitblit
	shlq	#16,tmp2

	store	x1,(blitter+_BLIT_A1_PIXEL)
	store	x2,(blitter+_BLIT_COUNT)
	jump	(DL_LOOP)
	store	tmp2,(blitter+_BLIT_CMD)

	UNREG  DL_LOOP

****************
* edge (x1,y1)-(x2,y2)
****************
dx		reg 99
dy		reg 99
x_min		reg 99
x_max		reg 99

Edge::
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
	jr	cc,.pos
	div	dy,dx
	neg	dx
.pos
	shlq	#2,y1
	cmp	y1,min_y
	movefa	x_save.a,x2
	jr	n,.nn
	moveq	#2,y2
	move	y1,min_y
.nn
	add	x2,y1
	add	y1,y2
.loop
	loadw	(y1),x_min
	cmp	x1,x_min
	jr	n,.larger2
	loadw	(y2),x_max
	storew	x1,(y1)

.larger2
	cmp	x1,x_max
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

 UNREG face_ptr,FACE_LOOP,edge_cnt,face_cnt
;;; ----------------------------------------
	;; Faces must be at end!
end:
size	set end-start

free	set WANTED_SIZE-size-16
free0	set free

	IF free < 0
WANTED_SIZE	SET WANTED_SIZE+64
BLOCKS		SET BLOCKS+1
free		set free+64
	ENDIF
	if free > 0
	REPT	WANTED_SIZE-size-16
	dc.b	$42
	ENDR
	endif

	macro	RECT
 dc.l  ((\3*8+4)<<26)|((\2*8+4)<<20)|((\1*8+4)<<14)|((\0*8+4)<<8)|((\3*8+4)<<2)
	endm
faces::
	echo "face %Hfaces"
	RECT 1,3,4,6
	RECT 2,0,7,5
//->	RECT 0,1,6,7	; invisible
//->	RECT 3,2,5,4	; invisible
	RECT 2,3,1,0
	RECT 4,5,7,6

size	set size + 16

	echo "GPU Size:%dsize | Free:%dfree0"
	echo "%dWANTED_SIZE"

 END
