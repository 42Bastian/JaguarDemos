;; -*-asm-*-
	gpu

	include <js/symbols/jagregeq.js>
	include <js/symbols/blit_eq.js>
	include <js/macro/help.mac>

	unreg LR,LR.a,SP,SP.a
	regtop 31

* rez
max_x	equ 256
max_y	equ 200
BLIT_WIDTH	equ BLIT_WID256

	;; parameter passing
flag		equ $f03ff0
screen		equ flag+4
points		equ screen+4
_color		equ points+4

x_save		equ $f03FF0-(max_y+1)*4

	;; Global registers
x_save.a	reg 99
DRAW_LINES.a	reg 99
frame_ptr.a	reg 99
frameCounter.a	reg 99

MAIN_LOOP	reg 99
frame_ptr	reg 99
clut		reg 99
FRAME_LOOP	reg 99

FLAG		reg 15
blitter		reg 14

tmp3		reg 3
tmp2		reg 2
tmp1		reg 1
tmp0		reg 0

	MACRO WAITBLITTER
.\waitblit	load (blitter+$38),tmp0
	btst	#0,tmp0
	jr	z,.\waitblit
	nop
	ENDM

	 run $f03000
********************
* init
	movei	#BLIT_A1_BASE,blitter
	movei	#x_save,tmp0
	moveta	tmp0,x_save.a
	movei	#flag,FLAG
	movei	#DrawLines,tmp0
	moveta	tmp0,DRAW_LINES.a
	movei	#$f00400,clut
	movei	#frameLoop, FRAME_LOOP
	load	(FLAG+8),frame_ptr
	moveta	frame_ptr,frame_ptr.a
	moveq	#0,tmp0
	moveta	tmp0,frameCounter.a

	;; Setup min/max X table
	movefa	x_save.a,tmp0
	movei	#max_y,tmp1
	movei	#max_x<<16|0,tmp2	; minX:maxX
.loop0
	subq	#1,tmp1
	store	tmp2,(tmp0)
	jr	nn,.loop0	; +1 as pivot
	addqt	#4,tmp0

	move	pc,MAIN_LOOP
	addq	#4,MAIN_LOOP
****************
* main loop

control		reg 5
screen_ptr	reg 4

main_loop:
	moveq	#1,tmp0
	store	tmp0,(FLAG)
//->	movei	#$f00058,r1
//->	storew	tmp0,(r1)
	moveq	#3,tmp0
	movei	#$f02114,r1
	store	tmp0,(r1)
.wait
	cmpq	#0,tmp0
	jr	nz,.wait
	load	(FLAG),tmp0

//->	movei	#$f00058,tmp0
//->	storew	frame_ptr,(tmp0)

	movefa	frameCounter.a,tmp2
	loadw	(frame_ptr),control ; Frame control word
	addqt	#1,tmp2
	btst	#15,control
	moveta	tmp2,frameCounter.a
	jr	eq,.no_restart
	load	(FLAG+4),screen_ptr

	movefa	frame_ptr.a,frame_ptr
	loadw	(frame_ptr),control ; Frame control word
	moveq	#0,tmp2
	moveta	tmp2,frameCounter.a

.no_restart
	moveq	#16,tmp0
	store	tmp2,(tmp0)

	btst	#0,control
	movei	#.no_cls,tmp0
	addqt	#2,frame_ptr
	jump	eq,(tmp0)
	store	screen_ptr,(blitter)

 UNREG screen_ptr
****************
* CLS
	movei	#BLIT_PITCH1|BLIT_PIXEL32|BLIT_WID3584|BLIT_XADDPHR,tmp0
	store	tmp0,(blitter+_BLIT_A1_FLAGS)
	xor	tmp0,tmp0
	movei	#1<<16|((256*200)>>2),tmp1
	store	tmp0,(blitter+_BLIT_A1_PIXEL)
	store	tmp1,(blitter+_BLIT_COUNT)
	store	tmp0,(blitter+_BLIT_CMD)
//->	WAITBLITTER	; done later down the road

.no_cls:
	btst	#1,control
	movei	#.no_palette,tmp0
	jump	eq,(tmp0)
	loadw	(frame_ptr),tmp1

********************
* set new palette
	move	control,tmp0
	shlq	#16,tmp0
	shrq	#24,tmp0		; number of colors
.palloop
	addqt	#2,frame_ptr
	loadw	(frame_ptr),tmp2
	addqt	#2,frame_ptr
	add	clut,tmp1
.palrewrite
	storew	tmp2,(tmp1)
	loadw	(tmp1),tmp3
	cmp	tmp3,tmp2
	jr	ne,.palrewrite
	nop
	subq	#1,tmp0
	jr	ne,.palloop
frameLoop:
	loadw	(frame_ptr),tmp1
.no_palette:

 UNREG control
********************
*
y0.a		reg 99
x0.a		reg 99
y1.a		reg 99
x1.a		reg 99

y2		reg 99
x2		reg 99
y1		reg 99
x1		reg 99
counter		reg 99
y_min		reg 99

DRAW_LINES	reg 99
POLY_LOOP	reg 99
point		reg 99

	cmpq	#0,tmp1		; end of frame?
	move	tmp1,tmp0
	jump	eq,(MAIN_LOOP)
	addqt	#2,frame_ptr
	shrq	#8,tmp0

	shlq	#28,tmp1
	move	tmp0,tmp2
	shrq	#28,tmp1
	shlq	#8,tmp2
	move	tmp1,counter
	or	tmp0,tmp2
	move	tmp2,tmp0
	shlq	#16,tmp2
	or	tmp0,tmp2

	movei	#max_y,y_min

	WAITBLITTER	; wait for last blit to finish before set new color
	store	tmp2,(blitter+_BLIT_PATD)
	store	tmp2,(blitter+_BLIT_PATD+4)
	movei	#BLIT_PITCH1|BLIT_PIXEL8|BLIT_WID256|BLIT_XADDPHR,tmp0
	store	tmp0,(blitter+_BLIT_A1_FLAGS)

polygon::
	loadb	(frame_ptr),x1
	addq	#1,frame_ptr
	movei	#.poly_loop,POLY_LOOP
	loadb	(frame_ptr),y1
	addq	#1,frame_ptr
	movefa	DRAW_LINES.a,DRAW_LINES

	moveta	x1,x1.a
	moveta	y1,y1.a
	moveta	x1,x0.a
	moveta	y1,y0.a

.poly_loop
	subq	#1,counter
	movefa	x1.a,x1
	jump	n,(DRAW_LINES)	; polygon closed => now draw
	movefa	y1.a,y1
	jr	nz,.not_last
	movefa	x0.a,x2
	jr	.cont
	movefa	y0.a,y2

.not_last
	loadb	(frame_ptr),x2
	addq	#1,frame_ptr
	loadb	(frame_ptr),y2
	addq	#1,frame_ptr
.cont
	moveta	x2,x1.a
	moveta	y2,y1.a
****************
* edge (x1,y1)-(x2,y2)
* Bresenham-Algo.
****************
ptr	reg 99
y_count	reg 99
LOOP	reg 99
step	reg 99
delta	reg 99
delta_y	reg 99

delta_x	reg 99
d_x	reg 99

Edge::
	move	y2,delta_y
	move	y2,tmp0
	sub	y1,delta_y
	move	y1,tmp1
	jr	nn,.cont0
	move	x1,tmp2		; (x1,y1) <-> (x2,y2)
	move	x2,x1
	move	tmp2,x2
	move	tmp0,y1
	move	tmp1,y2
	neg	delta_y

.cont0
	cmp	y1,y_min
	jr	n,.n
	move	x2,delta_x
	move	y1,y_min
.n
	movei	#max_y,y_count
	sub	x1,delta_x
	jr	nn,.cont1
	moveq	#1,d_x
	neg	delta_x
	subq	#2,d_x
.cont1
	cmp	delta_x,delta_y
	movei	#.cont5,LOOP
	jump	nn,(LOOP)	; delta_x < delta_y => LOOP
	cmpq	#0,delta_y
	jump	z,(LOOP)
***************
	;; delta_x > delta_y
	shlq	#1,delta_y
	movei	#.loop0,LOOP
	move	delta_y,delta
	move	delta_x,step
	sub	delta_x,delta
	shlq	#1,delta_x

	sub	y1,y_count
	movefa	x_save.a,ptr
	jump	n,(POLY_LOOP)
//->	nop				; Atari says, NOP is needed ;-)
	jump	z,(POLY_LOOP)
	shlq	#2,y1			; as ptr for x-save
	add	y1,ptr

	load	(ptr),tmp0		; get current min/max X
	sub	delta_y,delta_x
.loop0
	move	tmp0,x2
	shlq	#16,tmp0
	sharq	#16,x2		; max X
	sharq	#16,tmp0	; min X

.loop_x_step
	cmp	x1,x2
	jr	n,.cont2
	cmp	tmp0,x1
	move	x1,x2
.cont2
	move	x2,tmp3
	jr	n,.cont3
	shlq	#16,tmp3
	move	x1,tmp0
.cont3
	cmpq	#0,delta
	jr	nn,.cont4
	add	d_x,x1
	subq	#1,step
	jr	nn,.loop_x_step
	add	delta_y,delta

	jump	(POLY_LOOP)

.cont4
	or	tmp0,tmp3
	sub	delta_x,delta
	subq	#1,y_count
	store	tmp3,(ptr)
	jump	z,(POLY_LOOP)	  ;exit
	subq	#1,step
	addqt	#4,ptr
	jump	nn,(LOOP)
	load	(ptr),tmp0

	jump	(POLY_LOOP)

****************
.cont5
	shlq	#1,delta_x
	movei	#.loop1,LOOP

	move	delta_x,delta
	move	delta_y,step
	sub	delta_y,delta
	shlq	#1,delta_y

	sub	y1,y_count
	movefa	x_save.a,ptr
	jump	n,(POLY_LOOP)
//->	nop			; Atari says, NOP is needed ;-)
	jump	z,(POLY_LOOP)

	shlq	#2,y1		; ptr for x-save
	add	y1,ptr

	load	(ptr),tmp0
	sub	delta_x,delta_y
.loop1
	move	tmp0,x2		; min/max x
	shlq	#16,tmp0
	sharq	#16,x2
	sharq	#16,tmp0

	cmp	x1,x2
	jr	n,.cont6
	cmp	tmp0,x1
	move	x1,x2
.cont6
	jr	n,.cont7
	shlq	#16,x2
	move	x1,tmp0
.cont7
	or	tmp0,x2
	cmpq	#0,delta
	store	x2,(ptr)
	addqt	#4,ptr
	jr	nn,.cont8
	subq	#1,y_count

	jump	z,(POLY_LOOP)	  ; exit
	subq	#1,step
	load	(ptr),tmp0
	jump	nn,(LOOP)
	add	delta_x,delta
	jump	(POLY_LOOP)
	nop
.cont8
	jump	z,(POLY_LOOP)		; y_count=0 => exit
	sub	delta_y,delta
	subq	#1,step
	load	(ptr),tmp0
	jump	nn,(LOOP)	; step >= 0 => LOOP
	add	d_x,x1
	jump	(POLY_LOOP)
	nop

 UNREG step,point,x1,x2,y1,y2,d_x,delta,delta_x,delta_y,y_count
 UNREG x0.a,y0.a,x1.a,y1.a
 UNREG LOOP,POLY_LOOP,DRAW_LINES
****************
* draw H-Lines

bstart		reg 99
xptr		reg 99

LOOP		reg 99
leave_it	reg 99
x1		reg 99
x2		reg 99
x2_next		reg 99
y1		reg 99
CONT1		reg 99
bcounter	reg 99

DrawLines::

 IFND NO_DRAW
	movefa	x_save.a,xptr
	move	y_min,y1
	shlq	#2,y_min
	movei	#.loop3,LOOP
	add	y_min,xptr
	movei	#max_x<<16,leave_it
	load	(xptr),x2
	movei	#B_PATDSEL,bstart
	store	leave_it,(xptr)	; restore min/max
	addqt	#4,xptr
.loop3
	move	x2,x1
	shlq	#16,x2
	shrq	#16,x1
	shrq	#16,x2
	load	(xptr),x2_next
	store	leave_it,(xptr)	; restore min/max
	sub	x1,x2
	shlq	#16,x1
	addq	#1,x2
	or	y1,x1
	bset	#16,x2
	rorq	#16,x1
	WAITBLITTER

	store	x1,(blitter+_BLIT_A1_PIXEL)
	store	x2,(blitter+_BLIT_COUNT)
	store	bstart,(blitter+_BLIT_CMD)
.cont1
	move	x2_next,x2
	cmp	leave_it,x2_next
	addqt	#4,xptr
	jump	nz,(LOOP)
	addq	#1,y1
 ENDIF
	jump	(FRAME_LOOP)
	nop
	regmap

	UNREG bstart,xptr, leave_it, LOOP, x1,x2,x2_next,y1,CONT1,bcounter
end:
	echo "End: %Hend"
	regmap
