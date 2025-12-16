;-*-asm-*-
****************
* draw polys

DIRECT_TEXTURE	equ 1
TXT_FP		equ 8


tri_array	reg 15!
blitter		reg 14

x0		reg 99
y0		reg 99
x1		reg 99
y1		reg 99
x2		reg 99
y2		reg 99
u0		reg 99
v0		reg 99
u1		reg 99
v1		reg 99
u2		reg 99
v2		reg 99
dy01		reg 99
dy02		reg 99
dy12		reg 99
dx01		reg 99
dx02		reg 99
dx12		reg 99
LR3		reg 99
du12		reg 99

du02		reg LR!
du01		reg object_list!

texture.a	reg 99
dv01.a		reg 99
dv02.a		reg 99
dv12.a		reg 99

tri_ptrs.a	reg 99
max_y.a		reg 99
f_cnt.a		reg 99

tri_array.a	reg 99
ul.a		reg 99
vl.a		reg 99
luminance.a	reg 99

Drawfaces::
	PUSHLR	object_list

	movei	#blit_buf,blitter
	move	LR,tmp0
	sat8	tmp0		; => 255
	moveta	tmp0,f_cnt.a

	movei	#tri_ptrs_ram+255*4,tmp0
	moveta	tmp0,tri_ptrs.a
	move	pc,LR3
	load	(tmp0),tri_array
	addq	#6,LR3
.loop
	cmpq	#0,tri_array
	load	(tri_array),r0
	load	(tri_array+4),y0
	jr	eq,.next
	load	(tri_array+8),y1
	load	(tri_array+12),y2
	jr	triangle
	load	(tri_array+16),tri_array
.next
	movefa	tri_ptrs.a,tmp1
	movefa	f_cnt.a,tmp0
	subqt	#4,tmp1
	subq	#1,tmp0
	moveta	tmp1,tri_ptrs.a
	load	(tmp1),tri_array
	jump	pl,(LR3)
	moveta	tmp0,f_cnt.a

	moveta	blitter,blit_cnt.a
	POPLR object_list
//->	movei	#draw_it,r0
//->	jump	(r0)
//->	nop

triangle:
	movei	#$60000000,tmp2
	move	tmp0,tmp1
	shlq	#8,tmp1
	sub	tmp2,tmp1
	shrq	#8,tmp1
	moveta	tmp1,luminance.a

	movei	#max_y,tmp1
	moveta	tmp1,max_y.a

	;; debug
//->	movefa	dump.a,r0
//->	addqt	#1,r0
//->	moveta	r0,dump.a

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

	movei	#63<<TXT_FP,tmp1
	moveq	#1,u0
	moveq	#1,v0
	moveq	#1,u1
	moveq	#1,v1
	moveq	#1,u2
	moveq	#1,v2
	shrq	#24,tmp0

	and	tmp0,v2
	shrq	#1,tmp0
	and	tmp0,u2
	shrq	#1,tmp0

	and	tmp0,v1
	shrq	#1,tmp0
	and	tmp0,u1
	shrq	#1,tmp0

	and	tmp0,v0
	shrq	#1,tmp0
	and	tmp0,u0
	shrq	#1,tmp0

	mult	tmp1,u0
	mult	tmp1,v0
	mult	tmp1,u1
	mult	tmp1,v1
	mult	tmp1,u2
	mult	tmp1,v2


	shlq	#13,tmp0
	movei	#texture,tmp1
	add	tmp0,tmp1
	moveta	tmp1,texture.a
;;; ----------------------------------------
_dx	equ 60

;;->	movei	#120,x0
;;->	movei	#20,y0
;;->	movei	#10,x1
;;->	movei	#20,y1
;;->	movei	#40,x2
;;->	movei	#140,y2
;;->	movefa	dump.a,r0
;;->	cmpq	#1,r0
;;->	jump	eq,(LR3)
;;->	nop
//->	bclr	#31,color
//->	sub	tmp2,x0
//->	sub	tmp2,x1
//->	sub	tmp2,x2
//->	sub	tmp1,y0
//->	sub	tmp1,y1
//->	sub	tmp1,y2
//->	POP	LR
.first

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
	;; debug
//->	movefa	dump.a,r0
//->	addqt	#1,r0
//->	moveta	r0,dump.a

	; sort y
	cmp	y0,y1
	move	x1,tmp0
	jr	pl,.no_swap1
	move	y1,tmp1
	move	x0,x1
	move	y0,y1
	move	tmp0,x0
	move	tmp1,y0
	move	u1,tmp0
	move	v1,tmp1
	move	u0,u1
	move	v0,v1
	move	tmp0,u0
	move	tmp1,v0
.no_swap1:
	cmp	y1,y2
	move	x1,tmp0
	jr	pl,.no_swap2
	move	y1,tmp1
	move	x2,x1
	move	y2,y1
	move	tmp0,x2
	move	tmp1,y2
	move	u1,tmp0
	move	v1,tmp1
	move	u2,u1
	move	v2,v1
	move	tmp0,u2
	move	tmp1,v2

.no_swap2:
	cmp	y0,y1
	move	x1,tmp0
	jr	pl,.no_swap3
	move	y1,tmp1
	move	x0,x1
	move	y0,y1
	move	tmp0,x0
	move	tmp1,y0
	move	u1,tmp0
	move	v1,tmp1
	move	u0,u1
	move	v0,v1
	move	tmp0,u0
	move	tmp1,v0
.no_swap3:
	move	y2,dy02
	sub	y0,dy02
	moveq	#16,tmp0
	jump	eq,(LR3)		; flat triangle
	normi	dy02,tmp1

	addq	#31,tmp1
	neg	tmp1
	sh	tmp1,tmp0

	div	dy02,tmp0	; 1/dy02
	neg	tmp1
	subq	#4,tmp1

	move	u2,du02
	move	v2,tmp2		; dv02
	sub	u0,du02
	sub	v0,tmp2

	move	y1,dy01

	move	x1,dx01
	move	x2,dx02
	move	x2,dx12
	sub	x0,dx01
	sub	x0,dx02
	sub	x1,dx12

	imult	tmp0,dx02	; (x2-x0)/dy02
	imult	tmp0,tmp2
	imult	tmp0,du02
	sha	tmp1,dx02
	sha	tmp1,tmp2
	sha	tmp1,du02
	moveta	tmp2,dv02.a

	sub	y0,dy01
	moveq	#16,tmp0
	jr	ne,.dy01_non_zero
	normi	dy01,tmp1
	jr	.dy01_zero
	moveq	#0,tmp0

.dy01_non_zero:
	addq	#31,tmp1
	neg	tmp1
	sh	tmp1,tmp0

	div	dy01,tmp0	; 1/dy01
	neg	tmp1
	subq	#4,tmp1
.dy01_zero
	move	u1,du01
	move	v1,tmp2		; dv01
	sub	u0,du01
	sub	v0,tmp2

	imult	tmp0,dx01	; (x2-x0)/dy02
	imult	tmp0,tmp2
	imult	tmp0,du01
	sha	tmp1,dx01
	sha	tmp1,tmp2
	sha	tmp1,du01
	moveta	tmp2,dv01.a

	move	y2,dy12
	sub	y1,dy12
	moveq	#16,tmp0
	jr	ne,.dy12_none_zero
	normi	dy12,tmp1

	jr	.dy12_zero
	moveq	#0,tmp0

.dy12_none_zero:
	addq	#31,tmp1
	neg	tmp1
	sh	tmp1,tmp0

	div	dy12,tmp0	; 1/dy12
	neg	tmp1
	subq	#4,tmp1
.dy12_zero:
	move	u2,du12
	move	v2,tmp2		; dv01
	sub	u1,du12
	sub	v1,tmp2

	imult	tmp0,dx12	; (x2-x1)/dy12
	imult	tmp0,du12
	imult	tmp0,tmp2
	sha	tmp1,dx12
	sha	tmp1,tmp2
	sha	tmp1,du12
	moveta	tmp2,dv12.a

	shlq	#fp_rez,x0
	shlq	#fp_rez,x1

	shlq	#fp_rez,u0
	shlq	#fp_rez,u1

	shlq	#fp_rez,v0
	shlq	#fp_rez,v1

	move	x0,x2
	move	u0,u2
	move	v0,v2

	movei	#.y0_top_ok,tmp1
	cmpq	#0,y0
	move	dx01,tmp0
	jump	pl,(tmp1)
	move	dx02,tmp1

	move	du01,tmp2
	movefa	dv01.a,tmp3
	sharq	#3,tmp2		; reduce FP resolution to get < 16bit
	sharq	#3,tmp3
	imult	y0,tmp2
	imult	y0,tmp3
	shlq	#3,tmp2		; fix FP resolution
	shlq	#3,tmp3
	sub	tmp2,u0
	sub	tmp3,v0

	imult	y0,tmp0
	imult	y0,tmp1
	sub	tmp0,x0
	sub	tmp1,x2

	move	du02,tmp2
	movefa	dv02.a,tmp3
	sharq	#3,tmp2
	sharq	#3,tmp3
	imult	y0,tmp2
	imult	y0,tmp3
	shlq	#3,tmp2
	shlq	#3,tmp3
	sub	tmp2,u2
	sub	tmp3,v2

	moveq	#0,y0
.y0_top_ok:

	cmpq	#0,y1
	movefa	max_y.a,tmp0
	jr	pl,.y1_top_ok
	move	du12,tmp1

	movefa	dv12.a,tmp2
	sharq	#3,tmp1
	sharq	#3,tmp2
	imult	y1,tmp1
	imult	y1,tmp2
	shlq	#3,tmp1
	shlq	#3,tmp2
	imult	dx12,y1
	sub	tmp1,u1
	sub	y1,x1
	sub	tmp2,v1

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

.y_btm2_ok:

	unreg dy01,dy02,dy12,max_y.a

x1.a		reg 99
u1.a		reg 99
v1.a		reg 99
HLINE		reg	99
LR2		reg	99


	moveta	x1,x1.a
	moveta	u1,u1.a
	moveta	v1,v1.a

	unreg x1,u1,v1

	movei	#hline,HLINE
	sub	y0,y1
	move	pc,LR2
	jump	nn_ne,(HLINE)
	addq	#10,LR2
	jr	.top_done
	movefa	x1.a,x0
.loop_top:
	movefa	dv01.a,tmp0
	add	du01,u0
	add	du02,u2
	movefa	dv02.a,tmp1
	add	tmp0,v0
	add	tmp1,v2

	add	dx01,x0
	subq	#1,y1
	addqt	#1,y0
	jump	ne,(HLINE)
	add	dx02,x2

	movefa	x1.a,x0
.top_done:
	movefa	u1.a,u0
	movefa	v1.a,v0

	sub	y0,y2
	move	pc,LR2
	jump	ne,(HLINE)
	addq	#8,LR2
	jump	(LR3)
.loop_btm:
	add	du12,u0
	add	du02,u2
	movefa	dv12.a,tmp0
	movefa	dv02.a,tmp1
	add	tmp0,v0
	add	tmp1,v2

	add	dx12,x0
	subq	#1,y2
	addqt	#1,y0
	jump	eq,(LR3)
	add	dx02,x2
	;; fall thru
****************
* draw H-Lines
xl	reg 99
reci	reg 99
du	reg 99
dv	reg 99

hline:
	move	x0,xl		; left
	move	x2,tmp0		; right
	sharq	#fp_rez,xl
	sharq	#fp_rez,tmp0
	moveta	u0,ul.a
	moveta	v0,vl.a

	move	u2,du
	move	v2,dv
	sub	u0,du
	sub	v0,dv

	move	tmp0,tmp2	; xr
	movei	#max_x,tmp3
	sub	xl,tmp0
	moveq	#1,reci
	jr	pl,.ok
	shlq	#15,reci

	add	tmp0,xl
	sub	tmp0,tmp2
	neg	tmp0
	neg	du
	neg	dv
	moveta	u2,ul.a
	moveta	v2,vl.a
.ok
	div	tmp0,reci

	sharq	#fp_rez,du
	sharq	#fp_rez,dv
	imult	reci,du
	imult	reci,dv
	sharq	#TXT_FP-1,du	; 16bit fraction
	sharq	#TXT_FP-1,dv

	sub	tmp2,tmp3	; right clipping
	jr	pl,.rx
	nop
	add	tmp3,tmp0
.rx
	movei	#.lx,tmp1
	cmpq	#0,xl		; left clip
	move	y0,tmp2
	jump	pl,(tmp1)
	shlq	#16,tmp2

	move	du,tmp3
	sharq	#TXT_FP-4,tmp3
	imult	xl,tmp3
	movefa	ul.a,tmp1
	shlq	#4,tmp3
	sub	tmp3,tmp1
	move	dv,tmp3
	moveta	tmp1,ul.a

	sharq	#TXT_FP-4,tmp3
	imult	xl,tmp3
	movefa	vl.a,tmp1
	shlq	#4,tmp3
	sub	tmp3,tmp1
	add	xl,tmp0		; reduce count
	moveta	tmp1,vl.a


	moveq	#0,xl
.lx
	or	tmp2,xl		; y:x

	cmpq	#1,tmp0
	move	dv,tmp1
	jump	mi,(LR2)
	move	du,tmp2

	bset	#16,tmp0

	shrq	#16,tmp1	; int(dv)
	shrq	#16,tmp2	; int(du)
	shlq	#16,tmp1
	or	tmp1,tmp2
	shlq	#16,du
	shlq	#16,dv
	shrq	#16,du
	movefa	vl.a,tmp1
	or	dv,du		; FINC
	movei	#1<<(TXT_FP+fp_rez)-1,tmp3
	move	tmp2,dv		; INC

	add	tmp3,tmp1
	movefa	ul.a,tmp2
	shrq	#TXT_FP+fp_rez,tmp1
	add	tmp3,tmp2
	shlq	#16,tmp1
	shrq	#TXT_FP+fp_rez,tmp2
	movefa	vl.a,tmp3
	or	tmp2,tmp1	; A1_PIXEL => texture
	movefa	ul.a,tmp2
	shlq	#16+TXT_FP+fp_rez,tmp3
	shlq	#16+TXT_FP+fp_rez,tmp2
	shrq	#16,tmp2
	or	tmp3,tmp2	; A1_FPIXEL

	store	xl,(blitter)	; BLIT_A2_PIXEL
	store	tmp1,(blitter+4) ;_BLIT_A1_PIXEL
	movefa	texture.a,tmp3
	store	tmp2,(blitter+8) ;_BLIT_A1_FPIXEL
	store	tmp3,(blitter+12) ;_BLIT_A1_BASE
	store	dv,(blitter+16)	  ;_BLIT_A1_INC)
	movefa	luminance.a,tmp1
	store	du,(blitter+20)	; _BLIT_A1_FINC
	store	tmp1,(blitter+24) ;_BLIT_IINC)
	store	tmp0,(blitter+28) ; _BLIT_COUNT)

	movei	#blit_buf_end,tmp1
	cmp	blitter,tmp1
	jump	eq,(LR2)
	movefa	dump.a,tmp1
	addq	#1,tmp1
	moveta	tmp1,dump.a

	jump	(LR2)
	addqt	#32,blitter
 IF 0
draw_it:
	or	r15,r15		; wait for last tri_array load
	move	blitter,r10
	movei	#blit_buf,r15

	move	r10,r12
	sub	r15,r12
	shrq	#5,r12
//->	moveta	r12,dump0.a

	cmp	r10,r15
	movei	#$f02200,blitter
	jr	ne,.doit
	nop
	POPLR object_list
.doit
	movei	#BLIT_PITCH1|BLIT_PIXEL16|BLIT_WID64|BLIT_XADDINC,tmp1
	movei	#BLIT_PITCH1|BLIT_PIXEL16|BLIT_WIDTH|BLIT_XADDPIX,tmp2
	store	tmp1,(blitter+_BLIT_A1_FLAGS)
	store	tmp2,(blitter+_BLIT_A2_FLAGS)
	movefa	screen0.a,tmp1
	store	tmp1,(blitter+_BLIT_A2_BASE)
	move	pc,r9
	addq	#4,r9
;;->.loop
	load	(r15),r0
	load	(r15+4),r1
	load	(r15+8),r2
	load	(r15+12),r3
	load	(r15+16),r4
	load	(r15+20),r5
	load	(r15+24),r6
	load	(r15+28),r7
	addq	#32,r15
.waitblit:
	load	(blitter+$38),r8 ; wait for previous blit
	btst	#0,r8
	jr	z,.waitblit
	nop
	store	r0,(blitter+_BLIT_A2_PIXEL)
	store	r1,(blitter+_BLIT_A1_PIXEL)
	store	r2,(blitter+_BLIT_A1_FPIXEL)
	store	r3,(blitter+_BLIT_A1_BASE)
	store	r4,(blitter+_BLIT_A1_INC)
	store	r5,(blitter+_BLIT_A1_FINC)
	store	r6,(blitter+_BLIT_IINC)
	movei	#BLIT_SRCEN|BLIT_LFU_REPLACE|BLIT_DSTA2|BLIT_UPDA1|BLIT_SRCSHADE|BLIT_GOURZ,r0

	cmp	r10,r15
	subq	#1,r12
	store	r7,(blitter+ _BLIT_COUNT)
	jump	ne,(r9)
	store	r0,(blitter+_BLIT_CMD)

	POPLR object_list
 ENDIF

	unreg	dx01,dx02,dx12,xl
	unreg	HLINE,LR2,reci,du,dv
	unreg	tri_array, x0,x2, blitter,LR3
	unreg	tri_ptrs.a,y0,y1,y2,f_cnt.a
	unreg	du01,du02,du12
	unreg	dv01.a,dv12.a,dv02.a,u2,v2,u0,v0
	unreg 	ul.a,vl.a
	unreg	texture.a
