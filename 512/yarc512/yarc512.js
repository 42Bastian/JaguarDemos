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
ROT		reg 99
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

	movei	#$f1a114,r0	; disable DSP -> Roaar
	store	r3,(r0)
;;; ----------------------------------------
;;; setup
;;; ----------------------------------------
	movei	#$3720c,current_scr
 IFD TIMING
	movei	#$f00058,bg_col
 ENDIF

	movefa	vertex.a,vertex
	moveq	#26,frame
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

	move	pc,restart
superloop:

	store	screen_ptr,(current_scr)
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

	moveq	#$10,ptr
	shlq	#8,ptr
	moveta	ptr,ptr

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
	moveq	#4,r10		; needed below!

	unreg	m,vertex,sin,cos,mask
	unreg	vx,vy,vz,center_x,center_y

blitter		reg 14
DRAW		reg 99

	movei	#$f02200,blitter
	;; clear screen
	movei	#BLIT_PITCH1|BLIT_PIXEL32|BLIT_WID3584|BLIT_XADDPHR,r1
	store	r1,(blitter+_BLIT_A1_FLAGS)
	store	screen_ptr,(blitter)	;_BLIT_A1_BASE
	movei	#(1<<16)|(320*220/2),r1
	store	cnt,(blitter+_BLIT_A1_PIXEL)
	store	r1,(blitter+_BLIT_COUNT)
	sat8	r1		; => r1 = $ff
	bset	#15,r1		; Pink !
	store	r1,(blitter+_BLIT_PATD)
	store	cnt,(blitter+_BLIT_CMD)
//->	WAITBLITTER

	UNREG cnt

draw_rects::
//->	moveq	#4,r10
	movefa	faces.a,r11
	move	pc,r21
.loop
	load	(r11),r2
	movefa	vertex_stack.a,r12
	movefa	ptr,ptr
.loop0
	move	r2,r0
	shrq	#26,r0
	load	(ptr+r0),r1	; y0
	subq	#4,r0
	store	r1,(r12)
	addq	#4,r12
	load	(ptr+r0),r0	; x0
	shlq	#6,r2
	store	r0,(r12)
	jr	ne,.loop0
	addq	#4,r12

	movefa	vertex_stack.a,ptr

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
	sub	r1,r4
	load	(ptr),r1	; p0.y
	sub	r1,r3		; p2.y-p0.y
	imult	r4,r3
	btst	#10,frame
	moveq	#5,r13
	jr	eq,.noskip
	add	r2,r3
	jr	pl,.skip
.noskip
__pc	move	pc,DRAW
	addq	#draw-__pc,DRAW
	move	pc,LR
.loop1
	load	(ptr),r1
	load	(ptr+4),r0
	load	(ptr+8),r3
	subq	#1,r13
	load	(ptr+12),r2
	jump	ne,(DRAW)
	addq	#8,ptr
.skip
	subq	#1,r10
	jump	ne,(r21)
	subqt	#4,r11

	jump	(restart)
	addq	#1,frame

;;; ----------------------------------------
;;; draw
;;;
;;; Register usage: r0-r9, r14
;;;
;;; r3 - y0
;;; r2 - x0
;;; r1 - y1
;;; r0 - x1

dx	reg 9
dy	reg 8
m	reg 7
cnt	reg 6
dir_x	reg 5
step_y	reg 4
;;; -- parameter
y0	reg 3!
x0	reg 2!
y1	reg 1!
x1	reg 0!

draw::
	move	y1,dy
	move	x1,dx
	sub	y0,dy
	moveq	#1,step_y
	jr	pl,.pos
	sub	x0,dx
	subqt	#2,step_y
	abs	dy
.pos
	abs	dx
	jr	cc,.noswap0
	moveq	#1,dir_x

	move	x1,x0
	move	y1,y0
	neg	step_y
.noswap0
	cmpq	#0,dy
	move	dx,cnt
	jr	ne,.yno0
	cmp	dy,dx
	moveq	#0,step_y
.yno0
	jr	ne,.not_diag
	move	dy,m

	;; dx = dy
	moveq	#0,m
	moveq	#0,dir_x
	shlq	#16,step_y
	jr	.diagonal
	addqt	#1,step_y	; => becomes A1_INC
.not_diag
	jr	cc,.no_swap
	shlq	#16,m

	shlq	#16,dx
	move	dy,cnt
	move	dx,m
	subq	#2,dir_x	; swap x_inc 1 => y_inc 1
.no_swap
	div	cnt,m
.diagonal
	shlq	#16,y0
	or	x0,y0

	WAITBLITTER
	moveq	#0,tmp1

	movei	#BLIT_PITCH1|BLIT_PIXEL16|BLIT_WID|BLIT_XADDINC,tmp0
	store	tmp0,(blitter+_BLIT_A1_FLAGS)

	cmpq	#0,dir_x
	store	y0,(blitter+_BLIT_A1_PIXEL)
	jr	eq,.cont_dia
	store	tmp1,(blitter+_BLIT_A1_FPIXEL)
	jr	mi,.xstep

	UNREG x0
a1inc	REG 2!

	moveq	#1,a1inc
	imult	step_y,m	; set sign
	shlq	#16,step_y	; test sign
	jr	pl,.cont
	shlq	#16,m

	jr	.cont
	or	step_y,a1inc
.xstep
	shlq	#16,step_y
.cont_dia
	move	step_y,a1inc
.cont
	bset	#16,cnt
	store	a1inc,(blitter+_BLIT_A1_INC)
	addq	#1,cnt
	store	m,(blitter+_BLIT_A1_FINC)
	store	cnt,(blitter+_BLIT_COUNT)
	bset	#16,tmp1	; B_PATDSEL
	jump	(LR)
	store	tmp1,(blitter+_BLIT_CMD)

	UNREG	dx,dy,m,cnt,dir_x,step_y
	UNREG	a1inc,y0,x1,y1

draw_e::
draw_size	equ draw_e-draw
	echo "DRAW: %ddraw_size"

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

	regmap
size	set size + 16

	echo "GPU Size:%dsize | Free:%dfree0"
	echo "%dWANTED_SIZE"

 END
