;; -*-asm-*-

	include <js/macro/joypad1.mac>
	include <js/symbols/joypad.js>

fp_rez		equ 5
MAX_Z		equ 80

_160		reg 99
rec_cnt		reg 99

frame.a		reg 99
min_max.a	reg 99
dot_ptr.a	reg 99
dot_ptr2.a	reg 99

	echo "waves: %x MODend_irq"
	echo "x_save: %x x_save"

	MODULE	waves,MODend_irq
waves::
;;; ----------------------------------------
;;; setup
;;; ----------------------------------------
	movei	#x_save,r0
	moveta	r0,x_save.a
	moveq	#20,r2
	shlq	#16+fp_rez+5,r2		; minX:maxX
	moveta	r2,min_max.a
	movei	#max_y,r1
	movei	#col_tab,r3
	moveta	r3,color_table.a
	moveq	#0,r4
.loop0
	subq	#1,r1
	store	r4,(r3)
	addqt	#4,r3
	store	r4,(r3)
	addqt	#4,r3
	store	r2,(r0)
	jr	nn,.loop0	; +1 as pivot
	addq	#4,tmp0

	moveq	#10,_160
	shlq	#3,_160		; => 160

;;; ----------------------------------------
;;; main loop
;;; ----------------------------------------
blitter		reg 14

frame		reg 99
screen_ptr	reg 99

tmp4		reg 4
tmp5		reg 5
tmp6		reg 6
txt_ptr		reg 7

superloop::
	movefa	screen0.a,txt_ptr
	movefa	vbl_counter.a,r0
	shlq	#16,r0
	or	rec_cnt,r0

	movei	#drawHex,r1
	BL	(r1)
	moveq	#0,r0
	moveta	r0,vbl_counter.a

	movei	#joypad,r0
	BL	(r0)
	btst	#JOY_A_BIT,r1
	movei	#Gouraud,r0
	jr	eq,.no_change
	moveq	#0,r1
	bset	#12,r1
	load	(r0),r2
	xor	r1,r2
	store	r2,(r0)
.no_change:

	movefa	frame.a,frame
	addq	#8,frame	; time base * 2 * 4 (long pointer)
	moveta	frame,frame.a

	xor	VBLFlag,VBLFlag
.wvbl:
	jr	eq,.wvbl
	or	VBLFlag,VBLFlag

	movefa	screen0.a,screen_ptr
	movefa	blitter.a,blitter
	moveq	#0,tmp0
	store	tmp0,(blitter+_BLIT_A1_PIXEL)
	;; clear screen
	movei	#BLIT_PITCH1|BLIT_PIXEL32|BLIT_WID3584|BLIT_XADDPHR,r1
	store	r1,(blitter+_BLIT_A1_FLAGS)
	moveq	#$19,r1
	store	screen_ptr,(blitter)	;_BLIT_A1_BASE
	shlq	#12,r1			; $19<<12 ~=  (1<<16)|(320*230/2)
	store	r1,(blitter+_BLIT_COUNT)
	store	tmp0,(blitter+_BLIT_CMD)

	unreg blitter,screen_ptr
	unreg tmp4,tmp5,tmp6,txt_ptr

dot_ptr		reg 15
sine_tab	reg 14

LOOP_X		REG 99
LOOP_Z		REG 99
sine_mask	reg 99
center_x	reg 99
x		reg 99
z		reg 99
max_z		reg 99
hi		reg 99
reci		reg 99
frame_m_z	reg 99
sin_z		reg 99
clip_y		reg 99
color		reg 99

	moveq	#MAX_Z/4,max_z
	moveq	#10,center_x
	shlq	#2+2,max_z
	shlq	#4,center_x	; => 160

	movei	#$f1d200,sine_tab ; DSP sine table
	movei	#$7f<<2,sine_mask

	movei	#max_y-1,clip_y
	moveq	#dot_tab>>16,dot_ptr
	shlq	#16,dot_ptr
	moveq	#0,z
	sub	max_z,z
	move	frame,frame_m_z
	move	pc,LOOP_Z
loop_z:
	moveq	#20,tmp0
	moveq	#0,reci
	shlq	#5,tmp0		; => 576
	bset	#15,reci
	sub	z,tmp0
	and	sine_mask,frame_m_z
	load	(sine_tab+frame_m_z),sin_z
	div	tmp0,reci

	move	_160,hi
	move	_160,x
	neg	hi
	neg	x
	shlq	#1,hi
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
	shrq	#1,tmp0
	move	tmp1,color
	shlq	#3,color
	sat8	color
	not	color
	bclr	#14,color
	shlq	#16,color
	store	color,(dot_ptr+8)
	and	sine_mask,tmp0
	load	(sine_tab+tmp0),tmp0
//->	moveq	#0,tmp0			; enable to get flat plane
	imult	tmp0,tmp1
	move	x,tmp0
	sharq	#14,tmp1
	moveq	#7,tmp2
	imult	reci,tmp0
	shlq	#5,tmp2
	sharq	#15-10,tmp0
	cmp	tmp0,center_x
	jr	pl,.clip_right
	sub	tmp1,tmp2
	move	center_x,tmp0
.clip_right:
	add	center_x,tmp0
	jr	pl,.clip_left
	mult	reci,tmp2
	moveq	#0,tmp0
.clip_left:

	shrq	#15-8,tmp2
	cmp	tmp2,clip_y
	jr	pl,.clipy
	store	tmp0,(dot_ptr)
	move	clip_y,tmp2
.clipy
	store	tmp2,(dot_ptr+4)

	addqt	#4*2,x
	cmp	x,_160
	addqt	#16,dot_ptr
	jump	ne,(LOOP_X)
	addqt	#4*4,hi

	cmp	z,max_z
	subqt	#8*4,frame_m_z
	jump	ne,(LOOP_Z)
	addqt	#4*4,z

	unreg	hi,frame_m_z,x,z,sine_mask,sine_tab,dot_ptr
	unreg	sin_z,reci,center_x,clip_y,color,frame
	unreg	LOOP_Z,LOOP_X

dot_ptr		reg 15
dot_ptr2	reg 14

min_y		reg 99
EDGE		reg 99
face_cnt	reg 99
line_cnt	reg max_z!

x0		reg 0!
y0		reg 1!
x1		reg 2!
y1		reg 3!

x2		reg 99
y2		reg 99
x3		reg 99
y3		reg 99
color0		reg 99
color1		reg 99
color2		reg 99
color3		reg 99
color		reg 99

save_x.a	reg 99
save_y.a	reg 99
save_x0.a	reg 99
save_y0.a	reg 99
save_color0.a	reg 99

draw_rects::
	moveq	#0,rec_cnt
	move	_160,dot_ptr2
	moveq	#dot_tab>>16,dot_ptr
	shlq	#2,dot_ptr2
	shlq	#16,dot_ptr
	add	dot_ptr,dot_ptr2

	jr	.into_loop
	nop
.loop
	subq	#4,face_cnt
	movefa	dot_ptr.a,dot_ptr
	jr	pl,.ok
	movefa	dot_ptr2.a,dot_ptr2

	subq	#8,line_cnt
	movei	#superloop,r0
	addqt	#16,dot_ptr
	jump	eq,(r0)
	addqt	#16,dot_ptr2
	regmap
.into_loop
	move	_160,face_cnt
	subq	#8,face_cnt
.ok
	load	(dot_ptr+8),color0
	load	(dot_ptr+8+16),color1
	load	(dot_ptr2+8+16),color2
	load	(dot_ptr2+8),color3

	moveta	color0,save_color0.a

	load	(dot_ptr),x0
	load	(dot_ptr+4),y0
	load	(dot_ptr+16),x1
	load	(dot_ptr+16+4),y1
	load	(dot_ptr2+16),x2
	load	(dot_ptr2+16+4),y2
	load	(dot_ptr2),x3
	load	(dot_ptr2+4),y3

	addq	#16,dot_ptr
	addq	#16,dot_ptr2
	moveta	dot_ptr,dot_ptr.a
	moveta	dot_ptr2,dot_ptr2.a

	unreg dot_ptr,dot_ptr2
;;;
;;;    p0 +----+ p1
;;;       |\   |
;;;       | \  |
;;;       |  \ |
;;;    p3 +---+ p2
;;;
;;->   dot1 = (p1.x-p0.x)*(p2.y-p1.y);
;;->   dot2 = (p1.x-p2.x)*(p1.y-p0.y);
;;->   dot1 += dot2;
;;->   if ( dot1 < 0 ) {
;;->     return;
;;->   }

 IF 1
tmp	reg 99

	moveta	x0,save_x0.a
	move	x1,tmp		; p0->p1->p2
	move	y2,min_y
	sub	x0,tmp
	sub	y1,min_y
	imult	tmp,min_y

	move	x1,tmp
	move	y1,x0
	sub	x2,tmp
	sub	y0,x0
	imult	tmp,x0
	add	x0,min_y
	jr	pl,.drawit

;;->   dot1 = (p2.x-p0.x)*(p3.y-p2.y);
;;->   dot2 = (p2.x-p3.x)*(p2.y-p0.y);
;;->   dot1 += dot2;
;;->   if ( dot1 < 0 ) {
;;->     return;
;;->   }

	move	x2,tmp		; p0->p2->p3
	move	y3,min_y
	sub	x0,tmp
	sub	y2,min_y
	imult	tmp,min_y

	move	x2,tmp
	move	y2,x0
	sub	x3,tmp
	sub	y0,x0
	imult	tmp,x0

	add	x0,min_y
	movei	#.loop,tmp
	jump	mi,(tmp)
.drawit
	movefa	save_x0.a,x0

	unreg	tmp
 ELSE
	moveta	x0,save_x0.a
 ENDIF
	move	pc,min_y
	movei	#Edge,EDGE

	moveta	y0,save_y0.a
	moveta	x1,save_x.a

	move	pc,LR
	jump	(EDGE)		; x0,y0 -> x1,y1
	moveta	y1,save_y.a

	move	color1,color0
	move	color2,color1
	movefa	save_x.a,x0
	movefa	save_y.a,y0
	move	x2,x1
	move	pc,LR
	jump	(EDGE)		; x1,y1 -> x2,y2
	move	y2,y1

	move	color2,color0
	move	color3,color1
	move	x2,x0
	move	y2,y0
	move	x3,x1
	move	pc,LR
	jump	(EDGE)		; x2,y2 -> x3,y3
	move	y3,y1
//->	BPT
	move	color3,color0
	movefa	save_color0.a,color1
	movefa	save_x0.a,x1
	movefa	save_y0.a,y1
	move	x3,x0
	move	pc,LR
	jump	(EDGE)		; x3,y3 -> x0,y0
	move	y3,y0

	movei	#drawLines,r0
	movei	#.loop,LR
	jump	(r0)
	addq	#1,rec_cnt
****************
* edge (x0,y0)-(x1,y1)
****************

dx		reg 99
dy		reg 99
x_min		reg 99
x_max		reg 99
dcol		reg 99
col_ptr		reg 99

Edge::
	addq	#6,LR
	move	color1,dcol
	move	y1,dy
	sub	color0,dcol
	sub	y0,dy

	move	x1,dx
	jr	nn,.noswap
	sub	x0,dx

	move	x1,x0
	move	y1,y0
	move	color1,color0

	neg	dx
	neg	dy
	neg	dcol
.noswap
	shlq	#fp_rez,dx
	shlq	#fp_rez,x0
	abs	dx
	div	dy,dx
	jr	cc,.pos
	shlq	#2,y0
	neg	dx
.pos
	abs	dcol
	jr	cc,.col_pos
	div	dy,dcol
	neg	dcol
.col_pos
	movefa	color_table.a,col_ptr
	cmp	y0,min_y
	movefa	x_save.a,x1
	jr	n,.nn
	moveq	#2,y1
	move	y0,min_y
.nn
	add	y0,col_ptr
	add	y0,col_ptr
	add	x1,y0
	add	y0,y1

ELOOP	reg 99

	move	pc,ELOOP
	addq	#2,ELOOP
.loop
	loadw	(y0),x_min
	cmp	x0,x_min
	loadw	(y1),x_max
	jr	n,.larger2
	cmp	x_max,x0
	storew	x0,(y0)
	store	color0,(col_ptr)
.larger2
	jr	n,.smaller2
	addqt	#4,y0
	addqt	#4,col_ptr
	store	color0,(col_ptr)
	storew	x0,(y1)
	subqt	#4,col_ptr
.smaller2
	add	dcol,color0
	addqt	#8,col_ptr
	subq	#1,dy
	jump	n,(LR)
	addqt	#4,y1
	jump	(ELOOP)
	add	dx,x0

 UNREG save_x.a,save_y.a,save_x0.a,save_y0.a
 UNREG x_min,x_max,x0,x1,y0,y1,x2,y2,x3,y3,dx,dy
 UNREG EDGE,ELOOP
 UNREG color0,color1,color2,color3,dcol

****************
* draw H-Lines

ptr		reg 15
blitter		reg 14

DL_LOOP		reg 99
x1		reg 99
x0		reg 99
color_table	reg 99
min_max		reg 99
color_min	reg 99
color_max	reg 99

drawLines:
	movefa	blitter.a,blitter
	movei	#BLIT_PITCH1|BLIT_PIXEL16|BLIT_WID320|BLIT_XADDPIX,tmp0
	store	tmp0,(blitter+_BLIT_A1_FLAGS)

	movefa	min_max.a,min_max
	movefa	x_save.a,ptr
	movefa	color_table.a,color_table
	add	min_y,color_table
	add	min_y,color_table

	move	pc,DL_LOOP
	addq	#2,DL_LOOP
.dl_loop
	load	(ptr+min_y),x1
	cmp	x1,min_max
	move	x1,x0
	jump	eq,(LR)
	shlq	#16,x1
	store	min_max,(ptr+min_y)
	shrq	#16+fp_rez,x0
	shrq	#16+fp_rez,x1
	addqt	#4,min_y
	load	(color_table),color_min
	addq	#4,color_table
	load	(color_table),color_max
	sub	x0,x1
	addqt	#4,color_table
	jr	eq,.dl_loop
	shlq	#16+2,x0	; y is *4!

	move	color_max,tmp3
	sub	color_min,tmp3
	shrq	#16,color_min
	store	color_min,(blitter+_BLIT_PATD)

	abs	tmp3
	jr	cc,.pl
	div	x1,tmp3
	neg	tmp3
.pl
	store	tmp3,(blitter+_BLIT_IINC)
	or	min_y,x0
	rorq	#16+2,x0
	bset	#16,x1

	movei	#Gouraud,tmp3
	load	(tmp3),tmp3

wait_blit
	load	(blitter+_BLIT_CMD),color_max
	btst	#0,color_max
	jr	eq,wait_blit
	nop


	store	x0,(blitter+_BLIT_A1_PIXEL)
	store	x1,(blitter+_BLIT_COUNT)
	jump	(DL_LOOP)
	store	tmp3,(blitter+_BLIT_CMD)

	UNREG  DL_LOOP,min_max,x0,x1,min_y
	UNREG line_cnt,face_cnt
	UNREG color_table,color_min,color_max

txt_ptr	reg 7
	include <js/inc/minihex.inc>
	unreg txt_ptr

joypad:
	JOYPAD1
	jump	(LR)
	nop
	ENDMODULE waves
