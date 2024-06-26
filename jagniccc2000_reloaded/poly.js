;; -*-asm-*-

	MODULE	irq,$f03020
timer::
	load	(IRQ_FLAGADDR.a),IRQ_FLAG.a
	movei	#timer_irq,IRQScratch0.a
	bset	#9+2,IRQ_FLAG.a
	load	(IRQ_SP.a),IRQ_RTS.a
	jump	(IRQScratch0.a)
	bclr	#3,IRQ_FLAG.a

	org	$f03030
op::
	load	(IRQ_FLAGADDR.a),IRQ_FLAG.a
	bset	#9+3,IRQ_FLAG.a
	load	(IRQ_SP.a),IRQ_RTS.a
	bclr	#3,IRQ_FLAG.a

	subqt	#1,info_counter.a

	movefa	VBLFlag,IRQScratch0.a
	cmpq	#0,IRQScratch0.a
	jr	ne,.no_swap
	moveq	#1,IRQScratch0.a
	moveta	IRQScratch0.a,VBLFlag
	move	obl0.a,r0
	move	obl1.a,r1
	move	r1,obl0.a
	move	r0,obl1.a

	moveta	screen0.a,r0
	move	screen1.a,r1
	movefa	r0,screen1.a
	move	r1,screen0.a
.no_swap
	move	obl0.a,IRQScratch0.a
	movei	#$1040,IRQScratch1.a
	moveq	#20-1,IRQScratch3.a
.l	loadp	(IRQScratch0.a),IRQScratch2.a
	addqt	#8,IRQScratch0.a
	subq	#1,IRQScratch3.a
	storep	IRQScratch2.a,(IRQScratch1.a)
	jr	pl,.l
	addq	#8,IRQScratch1.a

	movei	#$f00026,IRQScratch1.a
	jr	irq_return
	storew	IRQScratch1.a,(IRQScratch1.a) ; resume OP

timer_irq::
	nop
irq_return
	addqt	#2,IRQ_RTS.a
	movefa	IRQ_SP,IRQ_SP.a
	moveta	IRQ_RTS.a,IRQ_RTS ; only for VJ needed
	jump	(IRQ_RTS.a)
	store	IRQ_FLAG.a,(IRQ_FLAGADDR.a)
	ENDMODULE irq

	MODULE poly,MODend_irq
poly::
	movei	#frameLoop, FRAME_LOOP
	movei	#BLIT_A1_BASE,blitter
	movei	#DrawLines,tmp1

	moveta	tmp1,DRAW_LINES.a
	jr	.skip
	moveq	#0,tmp0
restart
.waitp
	movei	#joypad,r0
	BL	(r0)
	cmpq	#0,r0
	movefa	VID_PIT.a,r1
	jr	eq,.waitp
	storew	lastPIT,(r1)

	moveq	#1,tmp0
.skip
	moveta	tmp0,rerun.a
	movefa	frame_ptr.a,frame_ptr

	moveq	#0,tmp0
	moveta	tmp0,frameCounter.a

	moveta	tmp0,time_total.a
	subq	#1,tmp0
	movefa	VID_PIT.a,r1
	move	tmp0,lastPIT
	storew	tmp0,(r1)

	move	pc,MAIN_LOOP
	addq	#4,MAIN_LOOP
****************
* main loop

control		reg 5
screen_ptr	reg 4

main_loop:
	movefa	VID_PIT.a,r0
	loadw	(r0),r0
	sub	r0,lastPIT
	nop
	jr	pl,.notfirst
	move	lastPIT,r0
	moveq	#0,lastPIT
	moveq	#0,r0
.notfirst
	moveq	#2,r1
	shlq	#16,r1
	movei	#PrintDEC2_YX,r2
	BL	(r2)

	movefa	time_total.a,r0
	add	lastPIT,r0
	moveta	r0,time_total.a
	movei	#$20005,r1
	movei	#PrintDEC_YX,r2
	BL	(r2)

	xor	VBLFlag,VBLFlag
 IF TIMING = 1
	movei	#$f00058,r4
	storew	VBLFlag,(r4)
 ENDIF
.wait
	jr	z,.wait
	or	VBLFlag,VBLFlag

	movefa	VID_PIT.a,lastPIT
	loadw	(lastPIT),lastPIT

	movefa	frameCounter.a,r1
	movei	#$ffff,r0
	shlq	#29,r1
	movei	#PrintDEC_YX,r4
	jr	ne,.no_time
	xor	lastPIT,r0
	movei	#$0002000e,r1
	BL	(r4)
.no_time:
	movefa	frameCounter.a,r0
	movei	#$00020000|23,r1
	BL	(r4)

	movefa	info_counter.a,r0
	moveq	#31,r1
	movefa	info_index.a,r2
	or	r0,r0
	jr	pl,.no_chg
	shlq	#3,r1
	moveta	r1,info_counter.a
	addq	#4,r2
	shlq	#30-2,r2
	shrq	#30-2,r2
	moveta	r2,info_index.a

	load	(INFO_TABLE+r2),r0
	moveq	#1,r1
	shlq	#16,r1
	movei	#PrintString_YX,r2
	BL	(r2)
.no_chg

 IF TIMING = 1
	movei	#$f00058,r4
	storew	r4,(r4)
 ENDIF
	movefa	screen0.a,screen_ptr

	movefa	frameCounter.a,tmp1
	loadw	(frame_ptr),control ; Frame control word
	addqt	#1,tmp1
	movei	#restart,tmp0
	btst	#15,control
	jump	ne,(tmp0)
	moveta	tmp1,frameCounter.a

	btst	#0,control
	addqt	#2,frame_ptr
	jr	eq,.no_cls
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
	move	control,tmp0
	shlq	#16,tmp0
	shrq	#24,tmp0		; number of colors

	btst	#1,control
	jr	eq,.no_palette
	loadw	(frame_ptr),tmp1

********************
* set new palette
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
min_y		reg 99

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

	movei	#max_y*4,min_y

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

	subq	#1,counter
.poly_loop
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
LOOP	reg 99
dx	reg 99
dy	reg 99
x_min	reg 99
x_max	reg 99

rez	equ 5			; note: fix also jagniccc.js !!

Edge::
	shlq	#rez,x1
	move	y2,dy
	shlq	#rez,x2
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
__PC:	move	PC,LOOP
	cmp	y1,min_y
	movefa	x_save.a,ptr
	jr	n,.nn
	addqt	#.loop-__PC,LOOP
	move	y1,min_y
.nn
	add	ptr,y1
.loop
	load	(y1),x_max
	move	x_max,x_min
	shlq	#16,x_max
	shrq	#16,x_min
	shrq	#16,x_max

	cmp	x1,x_min
	jr	n,.larger2
	cmp	x1,x_max
	move	x1,x_min
.larger2
	jr	nn,.smaller2
	shlq	#16,x_min
	move	x1,x_max
.smaller2
	add	dx,x1
	or	x_max,x_min
	subq	#1,dy
	store	x_min,(y1)
	jump	nn,(LOOP)
	addqt	#4,y1

	jump	(POLY_LOOP)
	subq	#1,counter

 UNREG x_min,x_max,x1,x2,y1,y2,dx,dy
 UNREG x0.a,y0.a
 UNREG point,ptr,LOOP

****************
* draw H-Lines

bstart		reg 99
xptr		reg 99

LOOP		reg 99
leave_it	reg 99
x1		reg 99
x2		reg 99
y1		reg 99
CONT1		reg 99
bcounter	reg 99
x2_next		reg 99

DrawLines::
	movefa	x_save.a,xptr
	moveq	#0,bstart
	movei	#max_x<<(16+rez)|0,leave_it
	bset	#16,bstart
	add	min_y,xptr
	shrq	#2,min_y
	move	pc,LOOP
	addq	#4,LOOP
.loop3
	load	(xptr),x2
	cmp	x2,leave_it
	move	x2,x1
	jump	eq,(FRAME_LOOP)
	shlq	#16,x2
	store	leave_it,(xptr)
	shrq	#16+rez,x1
	shrq	#16+rez,x2
	sub	x1,x2
	shlq	#16,x1
	addq	#1,x2
	or	min_y,x1
	bset	#16,x2
	rorq	#16,x1

	addq	#1,min_y
	addqt	#4,xptr
	WAITBLITTER
	store	x1,(blitter+_BLIT_A1_PIXEL)
	store	x2,(blitter+_BLIT_COUNT)
	jump	(LOOP)
	store	bstart,(blitter+_BLIT_CMD)

;;->	regmap

	UNREG bstart,xptr, leave_it, LOOP, x1,x2,x2_next,y1,CONT1,bcounter
polygon_end:

poly_size equ polygon_end - polygon
	echo "Poly: %Dpoly_size"
	include <js/inc/txtscr.inc>
;;->	regmap
end:
	ENDMODULE poly

	echo "End: %Hend"
//->	regmap
