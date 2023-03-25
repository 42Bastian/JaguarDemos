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
	moveq	#12-1,IRQScratch3.a
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
	addqt	#4,IRQ_SP.a
;;->	moveta	IRQ_RTS.a,IRQ_RTS.a ; only for VJ needed
	store	IRQ_FLAG.a,(IRQ_FLAGADDR.a)
	jump	(IRQ_RTS.a)
;;->	store	IRQ_FLAG.a,(IRQ_FLAGADDR.a)
	nop
	ENDMODULE irq


direction	reg 99

	MODULE poly,MODend_irq
;;->poly::
	movei	#frameLoop, FRAME_LOOP
	movei	#BLIT_A1_BASE,blitter
	movei	#DrawLines,tmp1

	moveq	#4,direction
	movei	#frame_table,r0
	moveta	r0,frame_ptr.a
	moveq	#0,tmp0
	moveta	tmp0,frameCounter.a
	not	tmp0
	moveta	tmp0,wire_mode.a
	jr	.skip
	moveta	tmp1,DRAW_LINES.a
restart
	neg	direction
	jr	pl,.nomode
	nop
	movefa	wire_mode.a,r1
	not	r1
	moveta	r1,wire_mode.a
.nomode
	add	direction,r0
	add	direction,r0
	moveta	r0,frame_ptr.a
.waitp
	movefa	VID_PIT.a,r1
;;->	jr	eq,.waitp
	storew	lastPIT,(r1)
.skip
	moveq	#0,tmp0
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
	movei	#$20002,r1
	movei	#PrintDEC2_YX,r2
	BL	(r2)

	movefa	time_total.a,r0
	add	lastPIT,r0
	moveta	r0,time_total.a
	movei	#$20007,r1
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

	movei	#joypad,r0
	BL	(r0)
	cmpq	#0,r0
	jr	eq,.no_button
	nop
	neg	direction
.no_button

	movefa	VID_PIT.a,lastPIT
	loadw	(lastPIT),lastPIT

	movefa	frameCounter.a,r1
	movei	#$ffff,r0
	shlq	#29,r1
	movei	#PrintDEC_YX,r4
	jr	ne,.no_time
	nop
	xor	lastPIT,r0
	movei	#$00020010,r1
	BL	(r4)
.no_time:
	movefa	frameCounter.a,r0
	movei	#$00020000|25,r1
	shrq	#2,r0
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

	movefa	frameCounter.a,tmp1
	add	direction,tmp1
	moveta	tmp1,frameCounter.a

	movefa	frame_ptr.a,r0
	load	(r0),frame_ptr
	add	direction,r0
	cmpq	#0,frame_ptr
	movei	#restart,tmp1
	jump	eq,(tmp1)
	nop
	moveta	r0,frame_ptr.a

 IF TIMING = 1
	movei	#$f00058,r4
	storew	r4,(r4)
 ENDIF
****************
* CLS
	movefa	screen0.a,screen_ptr
	store	screen_ptr,(blitter)

	movei	#BLIT_PITCH1|BLIT_PIXEL32|BLIT_WID3584|BLIT_XADDPHR,tmp0
	store	tmp0,(blitter+_BLIT_A1_FLAGS)
	xor	tmp0,tmp0
	movei	#1<<16|((256*200)>>2),tmp1
	store	tmp0,(blitter+_BLIT_A1_PIXEL)
	store	tmp1,(blitter+_BLIT_COUNT)
	store	tmp0,(blitter+_BLIT_CMD)
;;->	WAITBLITTER	; done later down the road

frameLoop:
	loadb	(frame_ptr),control ; Frame control word
	addq	#1,frame_ptr
	cmpq	#0,control
	jump	eq,(MAIN_LOOP)


 UNREG screen_ptr


counter		reg 99

	move	control,tmp1
	shrq	#4,control	; color
	shlq	#28,tmp1
	move	control,tmp2
	shrq	#28,tmp1	; number of vertices
	shlq	#8,tmp2
	move	tmp1,counter
	or	control,tmp2
	move	tmp2,control
	shlq	#16,tmp2
	or	control,tmp2

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

min_y		reg 99

DRAW_LINES	reg 99
POLY_LOOP	reg 99
point		reg 99


	movei	#max_y,min_y
	WAITBLITTER	; wait for last blit to finish before set new color
	store	tmp2,(blitter+_BLIT_PATD)
	movei	#BLIT_PITCH1|BLIT_PIXEL8|BLIT_WID256|BLIT_XADDPHR,tmp0
	store	tmp2,(blitter+_BLIT_PATD+4)
	store	tmp0,(blitter+_BLIT_A1_FLAGS)

polygon::
	loadb	(frame_ptr),x1
	addq	#1,frame_ptr
	loadb	(frame_ptr),y1
	addq	#1,frame_ptr

	moveta	x1,x1.a
	moveta	y1,y1.a
	moveta	x1,x0.a
	moveta	y1,y0.a

	movefa	wire_mode.a,r1
	movei	#wireframe,r0
	cmpq	#0,r1
	jump	eq,(r0)
	movefa	DRAW_LINES.a,DRAW_LINES
	movei	#.poly_loop,POLY_LOOP

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

rez	equ 5

;;->	regmap
Edge::
	movei	#.loop,LOOP
	shlq	#rez,x1
	move	y2,dy
	shlq	#rez,x2
	sub	y1,dy
	move	x2,dx
	jr	nn,.cont0
	sub	x1,dx

	move	x1,tmp0
	move	x2,x1
	move	tmp0,x2
	move	y1,tmp0
	move	y2,y1
	move	tmp0,y2

	neg	dx
	neg	dy
.cont0
	cmp	y1,min_y
	jr	n,.nn
	shlq	#2,y2
	move	y1,min_y
.nn
	move	y1,tmp1
	shlq	#2,y1
	cmpq	#0,dy
	movefa	x_save.a,ptr
	jr	ne,.no_hori
	add	ptr,y1

	jump	(LOOP)
	add	ptr,y2

.no_hori
	abs	dx
	moveq	#1,tmp0
	jr	cc,.pos
	div	dy,dx
	subq	#2,tmp0
.pos:
	add	ptr,y2
	load	(y1),x_max
	move	x1,x2
	move	x_max,x_min
	sharq	#rez,x2
	shlq	#16,x_max
	shrq	#16,x_min
	shrq	#16,x_max
	jr	.into
	imult	tmp0,dx
.loop
	load	(y1),x_max
	move	x1,x2
	move	x_max,x_min
	sharq	#rez,x2
	shlq	#16,x_max
	shrq	#16,x_min
	shrq	#16,x_max
.into
	cmp	x2,x_min
	jr	n,.larger2
	cmp	x2,x_max
	move	x2,x_min
.larger2
	jr	nn,.smaller2
	shlq	#16,x_min
	move	x2,x_max
.smaller2
	or	x_max,x_min
	add	dx,x1
	store	x_min,(y1)
	cmp	y1,y2
	jump	ne,(LOOP)
	addqt	#4,y1

	jump	(POLY_LOOP)
	subq	#1,counter

 UNREG point,ptr,LOOP

wireframe::
	movei	#$0f0f0f0f,tmp1
	movei	#BLIT_PITCH1|BLIT_PIXEL8|BLIT_WIDTH|BLIT_XADDINC,tmp0
	store	tmp1,(blitter+_BLIT_PATD)
	store	tmp0,(blitter+_BLIT_A1_FLAGS)
	store	tmp1,(blitter+_BLIT_PATD+4)

	moveta	x1,x1.a
	moveta	y1,y1.a
	moveta	x1,x0.a
	moveta	y1,y0.a
	movei	#.poly_loop,POLY_LOOP

.poly_loop
	subq	#1,counter
	movefa	x1.a,x1
	jump	n,(FRAME_LOOP)
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
	include "linedraw.inc"

 UNREG x_min,x_max,x1,x2,y1,y2,dx,dy
 UNREG x0.a,y0.a

;;->	regmap
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
	moveq	#0,bstart
	movefa	x_save.a,xptr
	bset	#16,bstart	;  B_PATDSEL
	movei	#max_x<<16|0,leave_it

	move	min_y,y1
	shlq	#2,min_y
	movei	#.loop3,LOOP
	add	min_y,xptr
	movei	#.cont1,CONT1
	load	(xptr),x2
	store	leave_it,(xptr)
	addqt	#4,xptr
	load	(xptr),x2_next
.loop3
	move	x2,x1
	store	leave_it,(xptr)
	shlq	#16,x2
	shrq	#16,x1
	shrq	#16,x2
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
	addq	#1,y1
	move	x2_next,x2
	cmp	x2_next,leave_it
	addqt	#4,xptr
	jump	nz,(LOOP)
	load	(xptr),x2_next

	jump	(FRAME_LOOP)
	nop
;;->	regmap

	UNREG bstart,xptr, leave_it, LOOP,x2_next,CONT1,bcounter


	include <js/inc/txtscr.inc>
;;->	regmap


end:
	ENDMODULE poly

	echo "End: %Hend"
//->	regmap
