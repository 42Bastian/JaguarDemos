;-*-asm-*-
****************
* draw polys

USE_PHRASE		equ 1

tri_array	reg 15!
blitter		reg 14

x0		reg 99
y0		reg 99
x1		reg 99
y1		reg 99
x2		reg 99
y2		reg 99
color		reg 99
l0		reg 99
l1		reg 99
l2		reg 99
tri_ptrs	reg 99
dy01		reg 99
dy02		reg 99
dy12		reg 99
dx01		reg 99
dx02		reg 99
dx12		reg 99
f_cnt		reg 99
LR3		reg 99

max_y.a		reg 99



Drawfaces::
	move	LR,f_cnt
	movei	#$f02200,blitter
	sat8	f_cnt		; => 255

	WAITBLITTER

 IF USE_PHRASE = 1
	movei	#BLIT_PITCH1|BLIT_PIXEL16|BLIT_WIDTH|BLIT_XADDPHR,tmp0
 ELSE
	movei	#BLIT_PITCH1|BLIT_PIXEL16|BLIT_WIDTH|BLIT_XADDPIX,tmp0
 ENDIF
	movei	#max_y,tmp1
	store	tmp0,(blitter+_BLIT_A1_FLAGS)
	moveta	tmp1,max_y.a

	movei	#tri_ptrs_ram+255*4,tri_ptrs
	move	pc,LR3
	load	(tri_ptrs),tri_array
	addq	#6,LR3
.loop
	cmpq	#0,tri_array
	load	(tri_array),color
	jr	eq,.next
	load	(tri_array+4),y0

//->	move	LR,LR3

	load	(tri_array+8),y1
	load	(tri_array+12),y2
	jr	triangle
	load	(tri_array+16),tri_array
.next
	subq	#1,f_cnt
	subqt	#4,tri_ptrs
	jump	pl,(LR3)
	load	(tri_ptrs),tri_array

	jump	(LR)
	nop

triangle:
	;; debug
	movefa	dump.a,r0
	addqt	#1,r0
	moveta	r0,dump.a

	;; split x and y and sign-extend
	move	y0,x0
	move	y1,x1
	move	y2,x2
	shlq	#16,y0
	shlq	#16,y1
	shlq	#16,y2
	sharq	#16,x0
	sharq	#16,x1
	sharq	#16,x2
	sharq	#16,y0
	sharq	#16,y1
	sharq	#16,y2

	;; check if triangle is outside screen
	move	y0,tmp0		; triangle y < 0
	move	x0,tmp1
	and	y1,tmp0
	and	x1,tmp1
	and	y2,tmp0
	jump	n,(LR3)		; all y < 0
	and	x2,tmp1
	jump	n,(LR3)		; all x < 0
	movefa	max_y.a,tmp1
	cmp	y0,tmp1		; triangle > y_max ?
	movei	#max_x,tmp0
	jr	nn,.y_ok
	cmp	y1,tmp1
	jr	nn,.y_ok
	cmp	y2,tmp1
	jump	n,(LR3)
.y_ok
	cmp	x0,tmp0
	jr	nn,.x_ok
	cmp	x1,tmp0
	jr	nn,.x_ok
	cmp	x2,tmp0
	jump	n,(LR3)
.x_ok
//->	;; debug
//->	movefa	dump.a,r0
//->	addqt	#1,r0
//->	moveta	r0,dump.a

	shrq	#16,color
 IF USE_PHRASE = 1
	move	color,tmp0
	shlq	#16,tmp0
	or	tmp0,color
 ENDIF
	; sort y
	cmp	y0,y1
	move	x1,tmp0
	jr	pl,.no_swap1
	move	y1,tmp1
	move	x0,x1
	move	y0,y1
	move	tmp0,x0
	move	tmp1,y0
.no_swap1:
	cmp	y1,y2
	move	x1,tmp0
	jr	pl,.no_swap2
	move	y1,tmp1
	move	x2,x1
	move	y2,y1
	move	tmp0,x2
	move	tmp1,y2
.no_swap2:
	cmp	y0,y1
	move	x1,tmp0
	jr	pl,.no_swap3
	move	y1,tmp1
	move	x0,x1
	move	y0,y1
	move	tmp0,x0
	move	tmp1,y0
.no_swap3:

	move	y2,dy02
	movei	#1<<fp_reci,tmp0
	sub	y0,dy02
	move	y1,dy01
	jump	eq,(LR3)		; flat triangle
	div	dy02,tmp0	; 1/dy02

	move	y2,dy12

	move	x1,dx01
	move	x2,dx02
	move	x2,dx12
	sub	x0,dx01
	sub	x0,dx02
	sub	x1,dx12

	sub	y0,dy01
	movei	#1<<fp_reci,tmp1
	jr	ne,.dy01_non_zero
	sub	y1,dy12
	moveq	#0,tmp1
	moveq	#1,dy01
.dy01_non_zero:
	movei	#1<<fp_reci,tmp2
	jr	ne,.dy12_none_zero
	nop
	moveq	#0,tmp2
	moveq	#1,dy12
.dy12_none_zero:

	imult	tmp0,dx02	; (x2-x0)/dy02

	div	dy01,tmp1	; 1/dy01

	sharq	#fp_reci-fp_rez,dx02

	shlq	#fp_rez,x0
	shlq	#fp_rez,x1

	move	x0,x2
	imult	tmp1,dx01	; (x1-x0)/dy01

	div	dy12,tmp2	; 1/dy12
	sharq	#fp_reci-fp_rez,dx01

	cmpq	#0,y0
	move	dx01,tmp0
	jr	pl,.y0_top_ok
	move	dx02,tmp1

	imult	y0,tmp0
	imult	y0,tmp1
	sub	tmp0,x0
	sub	tmp1,x2

	moveq	#0,y0
.y0_top_ok:

	imult	tmp2,dx12	; (x2-x1)/dy12

	cmpq	#0,y1
	movefa	max_y.a,tmp0
	jr	pl,.y1_top_ok
	sharq	#fp_reci-fp_rez,dx12

	imult	dx12,y1
	sub	y1,x1

	moveq	#0,y1
.y1_top_ok:
	cmp	y2,tmp0
	jr	pl,.y_btm_ok
	cmp	y1,tmp0

	move	tmp0,y2
.y_btm_ok:
	jr	pl,.y_btm2_ok
	nop
	move	tmp0,y1
.y_btm2_ok

	unreg dy01,dy02,dy12

HLINE		reg	99
LR2		reg	99

	movei	#hline,HLINE
	sub	y0,y1
	move	pc,LR2
	jump	nn_ne,(HLINE)
	addq	#10,LR2
	jr	.top_done
	move	x1,x0
.loop_top:
	add	dx01,x0
	subq	#1,y1
	addqt	#1,y0
	jump	ne,(HLINE)
	add	dx02,x2

	move	x1,x0

.top_done:
	sub	y0,y2
	move	pc,LR2
	jump	ne,(HLINE)
	addq	#8,LR2
	jump	(LR3)
.loop_btm:
	add	dx12,x0
	subq	#1,y2
	addqt	#1,y0
	jump	ne,(HLINE)
	add	dx02,x2
.btm_done:
	jump	(LR3)
//->	nop

****************
* draw H-Lines
xl	reg 99

hline:
	move	x0,xl		; left
	movei	#1<<(fp_rez-1),tmp0
	add	tmp0,xl		; round up
	add	x2,tmp0		; right
	sharq	#fp_rez,xl
	sharq	#fp_rez,tmp0
	move	tmp0,tmp2	; xr
	sub	xl,tmp0
	movei	#max_x,tmp3
	jr	pl,.ok
	nop
	add	tmp0,xl
	sub	tmp0,tmp2
	neg	tmp0
.ok
	sub	tmp2,tmp3	; right clipping
	jr	pl,.rx
	nop
	add	tmp3,tmp0
.rx
	cmpq	#0,xl		; left clip
	move	y0,tmp2
	jr	pl,.lx
	shlq	#16,tmp2

	add	xl,tmp0		; reduce count
	moveq	#0,xl
.lx
	or	tmp2,xl		; y:x
	cmpq	#0,tmp0
	movei	#B_PATDSEL,tmp3
	jump	eq,(LR2)
	load	(blitter+$38),tmp1 ; wait for previous blit
	jump	mi,(LR2)
	bset	#16,tmp0
.waitblit:
	btst	#0,tmp1
	jr	z,.waitblit
	load	(blitter+$38),tmp1 ; wait for previous blit

	store	color,(blitter+_BLIT_PATD)
 IF USE_PHRASE = 1
	store	color,(blitter+_BLIT_PATD+4)
 ENDIF
	store	xl,(blitter+_BLIT_A1_PIXEL)
	store	tmp0,(blitter+_BLIT_COUNT)
	jump	(LR2)
	store	tmp3,(blitter+_BLIT_CMD)

	unreg	dx01,dx02,dx12,xl
	unreg	l0,l1,l2,HLINE,LR2
	unreg	tri_array, x0,x1,x2, blitter,LR3
	unreg	tri_ptrs,color,y0,y1,y2,max_y.a
