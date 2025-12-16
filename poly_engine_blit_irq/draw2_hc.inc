;;; -*-asm-*-
****************
* draw polys

COLOR_FP	equ 4

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

dy01		reg 99
dy02		reg 99
dy12		reg 99
dx01		reg 99
dx02		reg 99
dx12		reg 99
dl01		reg 99
dl02		reg 99
dl12		reg 99

LR.a		reg 99
max_y.a		reg 99
f_cnt.a		reg 99
tri_ptrs.a	reg 99
x1.a		reg 99

Drawfaces::
	moveta	LR,LR.a
	move	LR,tmp0
	sat8	tmp0		; => 255
	movei	#$f02200,blitter
	moveta	tmp0,f_cnt.a

	WAITBLITTER
	movei	#BLIT_PITCH1|BLIT_PIXEL16|BLIT_WIDTH|BLIT_XADDPIX,tmp0
	store	tmp0,(blitter+_BLIT_A1_FLAGS)

	movei	#max_y,tmp0
	moveta	tmp0,max_y.a

	movei	#tri_ptrs_ram+255*4,tmp0
	load	(tmp0),tri_array
	moveta	tmp0,tri_ptrs.a

	move	pc,LR
	addq	#4,LR
.loop
	cmpq	#0,tri_array
	load	(tri_array),color
	jr	eq,.next
	load	(tri_array+4),y0

//->	movefa	LR.a,LR

	load	(tri_array+8),y1
	load	(tri_array+12),y2
	jr	triangle
	load	(tri_array+16),tri_array
.next
	movefa	tri_ptrs.a,tmp1
	movefa	f_cnt.a,tmp0
	subqt	#4,tmp1
	subq	#1,tmp0
	load	(tmp1),tri_array
	moveta	tmp0,f_cnt.a
	jump	pl,(LR)
	moveta	tmp1,tri_ptrs.a

	movefa	LR.a,LR
	jump	(LR)
	nop

triangle:
//->	movei	#$abcd,tmp0
//->	movefa	dump0.a,tmp3
//->	store	tmp0,(tmp3)
//->	addq	#4,tmp3
//->	moveta	tmp3,dump0.a
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
	jump	n,(LR)		; all y < 0
	and	x2,tmp1
	jump	n,(LR)		; all x < 0
	movefa	max_y.a,tmp1
	cmp	y0,tmp1		; triangle > y_max ?
	movei	#max_x-1,tmp0
	jr	nn,.y_ok
	cmp	y1,tmp1
	jr	nn,.y_ok
	cmp	y2,tmp1
	jump	n,(LR)
.y_ok
	cmp	x0,tmp0
	jr	nn,.x_ok
	cmp	x1,tmp0
	jr	nn,.x_ok
	cmp	x2,tmp0
	jump	n,(LR)
	nop
.x_ok
	;; debug
//->	movefa	dump.a,r0
//->	addqt	#1,r0
//->	moveta	r0,dump.a

;;; ----------------------------------------
;;->_dx	equ 160
;;->	movei	#$7f80ff00,color
;;->	movei	#350,x0
;;->	movei	#10,y0
;;->	movei	#400,x1
;;->	movei	#40,y1
;;->	movei	#300,x2
;;->	movei	#120,y2
;;->	movefa	dump.a,r1
;;->	movei	#_dx,tmp0
;;->	cmpq	#1,r1
;;->	jr	eq,.first
;;->	nop
;;->//->	bclr	#31,color
;;->	sub	tmp0,x0
;;->	sub	tmp0,x1
;;->	sub	tmp0,x2
;;->//->	sub	tmp1,y0
;;->//->	sub	tmp1,y1
;;->//->	sub	tmp1,y2
;;->	movefa	LR.a,LR
;;->.first

	;; extract lightning data and color

	movei	#$ff,tmp0
	move	color,l0
	move	color,l1
	move	color,l2
	shrq	#16,l0
	shrq	#8,l1
	and	tmp0,l0
	and	tmp0,l1
	shrq	#24,color
	and	tmp0,l2
	shlq	#8,color

	; sort y
	cmp    	y0,y1
	move   	x1,tmp0
	jr     	pl,.no_swap1
	move   	y1,tmp1
	move	l1,tmp2
	move   	x0,x1
	move   	y0,y1
	move	l0,l1
	move   	tmp0,x0
	move   	tmp1,y0
	move   	tmp2,l0
.no_swap1:
	cmp	y1,y2
	move	x1,tmp0
	jr	pl,.no_swap2
	move	y1,tmp1
	move	l1,tmp2
	move	x2,x1
	move	y2,y1
	move	l2,l1
	move	tmp0,x2
	move	tmp1,y2
	move	tmp2,l2
.no_swap2:
	cmp    	y0,y1
	move   	x1,tmp0
	jr     	pl,.no_swap3
	move   	y1,tmp1
	move   	l1,tmp2
	move	x0,x1
	move   	y0,y1
	move   	l0,l1
	move   	tmp0,x0
	move   	tmp1,y0
	move   	tmp2,l0
.no_swap3:

	move	x1,dx01
	move	x2,dx02
	move	x2,dx12
	sub	x0,dx01
	sub	x0,dx02
	sub	x1,dx12

	move	l2,dl02
	move	l1,dl01
	move	l2,dl12
	sub	l0,dl01
	sub	l0,dl02
	sub	l1,dl12

	move	y2,dy02
	sub	y0,dy02
	moveq	#16,tmp0	; 16 == shift left 4
	jump	eq,(LR)		; flat triangle
	normi	dy02,tmp1	; get max. resolution for FP divide

	addq	#32,tmp1
	neg	tmp1
	sh	tmp1,tmp0	; 1 << (44 - CLZ(dy02))

	div	dy02,tmp0
	move	tmp1,tmp2
	neg	tmp1
	neg	tmp2
	subq	#fp_rez-4,tmp1
//->	subq	#COLOR_FP-4,tmp2

	imult	tmp0,dx02	; (x2-x0)/dy02
	imult	tmp0,dl02	; (l2-l0)/dy02
	sha	tmp1,dx02
	sha	tmp2,dl02

	move	y1,dy01
	sub	y0,dy01
	moveq	#16,tmp0
	jr	ne,.dy01_non_zero
	normi	dy01,tmp1

	moveq	#0,dl01
	jr	.dy01_zero
	moveq	#0,dx01

.dy01_non_zero:
	addq	#32,tmp1
	neg	tmp1
	sh	tmp1,tmp0

	div	dy01,tmp0	; 1/dy01
	move	tmp1,tmp2
	neg	tmp1
	neg	tmp2
	subq	#fp_rez-4,tmp1
//->	subq	#COLOR_FP-4,tmp2

	imult	tmp0,dx01	; (x1-x0)/dy01
	imult	tmp0,dl01	; (l1-l0)/dy01
	sha	tmp1,dx01
	sha	tmp2,dl01

.dy01_zero
	move	y2,dy12
	sub	y1,dy12
	moveq	#16,tmp0
	jr	ne,.dy12_none_zero
	normi	dy12,tmp1

	moveq	#0,dx12
	jr	.dy12_zero
	moveq	#0,dl12

.dy12_none_zero:
	addq	#32,tmp1
	neg	tmp1
	sh	tmp1,tmp0
	div	dy12,tmp0
	move	tmp1,tmp2
	neg	tmp1
	neg	tmp2
	subq	#fp_rez-4,tmp1
//->	subq	#COLOR_FP-4,tmp2

	imult	tmp0,dx12	; (x2-x1)/dy12
	imult	tmp0,dl12	; (l2-l1)/dy12
	sha	tmp1,dx12
	sha	tmp2,dl12
.dy12_zero:
	shlq	#fp_rez,x0
	shlq	#fp_rez,x1

	shlq	#COLOR_FP,l0
	shlq	#COLOR_FP,l1

	move	x0,x2
	move	l0,l2

x1save.a	reg 99
l1save.a	reg 99

	cmpq	#0,y0
	move	dx01,tmp0
	jr	pl,.y0_top_ok
	move	dl01,tmp1

	imult	y0,tmp0
	imult	y0,tmp1
	sub	tmp0,x0
	sub	tmp1,l0
	move	dx02,tmp0
	move	dl02,tmp1
	imult	y0,tmp0
	imult	y0,tmp1
	sub	tmp0,x2
	sub	tmp1,l2

	moveq	#0,y0
.y0_top_ok:
	cmpq	#0,y1
	move	dx12,tmp0
	jr	pl,.y1_top_ok
	move	dl12,tmp1
	imult	y1,tmp0
	imult	y1,tmp1
	sub	tmp0,x1
	sub	tmp1,l1
	moveq	#0,y1
.y1_top_ok:

	movefa	max_y.a,tmp0
	moveta	x1,x1save.a
	cmp	y2,tmp0
	moveta	l1,l1save.a
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
	movefa	x1save.a,x0

.loop_top:
	add	dx01,x0
	add	dl01,l0
	add	dx02,x2
	subq	#1,y1
	addqt	#1,y0
	jump	ne,(HLINE)
	add	dl02,l2
	movefa	x1save.a,x0
.top_done:
	movefa	l1save.a,l0

	sub	y0,y2
	move	pc,LR2
	jump	ne,(HLINE)
	addq	#8,LR2
	jump	(LR)
.loop_btm:
	add	dx12,x0
	add	dl12,l0
	add	dx02,x2
	subq	#1,y2
	addqt	#1,y0
	jump	eq,(LR)
	add	dl02,l2

	;; fall thru

****************
* draw H-Lines

sign	reg 99
dl.a	reg 99

hline:
	move	x0,x1		; left
	move	l0,l1
	move	x2,tmp0		; right

	sharq	#fp_rez,x1
	move	l2,tmp1
	sharq	#fp_rez,tmp0
	sub	l1,tmp1		; dl
	sub	x1,tmp0		; dx
	jump	eq,(LR2)
	move	tmp1,sign	; save dl sign
	jr	pl,.ok
	shlq	#16,tmp1	; prepare division

	add	tmp0,x1		; swap left<->right
	move	l2,l1
	neg	tmp1
	neg	tmp0
	neg	sign
.ok
	abs	tmp1
	move	y0,tmp2
	div	tmp0,tmp1	; dl/dx
	shlq	#16,tmp2
	shlq	#16,x1
	move	l1,tmp3		; left luminance
	shrq	#16,x1
	rorq	#COLOR_FP,tmp3	; => 8.16 FP for blitter
	or	tmp2,x1		; y:x

.waitblit:
	load	(blitter+$38),tmp2 ; wait for previous blit
	btst	#0,tmp2
	jr	z,.waitblit
	or	color,tmp3

	cmpq	#0,sign		; negative color step?
	store	tmp3,(blitter+_BLIT_PATD)
	jr	pl,.pos2
	bset	#16,tmp0
	neg	tmp1
.pos2
	shrq	#16,tmp3
	shlq	#8-COLOR_FP,tmp1	; remove fixpoint, remove top 8bits
	store	tmp3,(blitter+_BLIT_SRCD)
	shrq	#8,tmp1
	movei	#B_PATDSEL|B_GOURD|B_CLIP_A1,tmp3
	store	tmp1,(blitter+_BLIT_IINC)
	store	x1,(blitter+_BLIT_A1_PIXEL)
	store	tmp0,(blitter+_BLIT_COUNT)
	jump	(LR2)
	store	tmp3,(blitter+_BLIT_CMD)

	unreg	dx01,dx02,dx12,dl.a
	unreg	dl01,dl02,dl12
	unreg	l0,l1,l2,HLINE,LR2
	unreg	x1save.a,l1save.a,sign
	unreg	tri_array, f_cnt.a, x0,x1,x2, blitter
	unreg	tri_ptrs.a,color,y0,y1,y2,max_y.a,LR.a,x1.a
