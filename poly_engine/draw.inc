;-*-asm-*-
****************
* draw polys

tri_array	reg 15!
x_ptr		reg 14
tri_ptrs	reg 99
LR3		reg 99
x0		reg 99
y0		reg 99
x1		reg 99
y1		reg 99
x2		reg 99
y2		reg 99
color		reg 99
lum0		reg 99
lum1		reg 99
lum2		reg 99
f_cnt		reg 99
min_y		reg 99
EDGE		reg 99

x_save.a	reg 99
save_x.a	reg 99
save_y.a	reg 99
save_x0.a	reg 99
save_y0.a	reg 99
save_lum0.a	reg 99
max_y.a		reg 99
LR.a		reg 99

Drawfaces::
	moveta	LR,LR.a
	move	LR,f_cnt
	movei	#tri_ptrs_ram+255*4,tri_ptrs
	sat8	f_cnt		; => 255

	movei	#max_y,tmp0
	movei	#x_save,tmp1
	moveta	tmp0,max_y.a
	moveta	tmp1,x_save.a
	movei	#Edge,EDGE
	load	(tri_ptrs),tri_array

	move	pc,LR
	addq	#4,LR
.loop
	cmpq	#0,tri_array
	load	(tri_array),color
	jr	eq,.next
	load	(tri_array+4),y0
	load	(tri_array+8),y1
	load	(tri_array+12),y2
	jr	triangle
	load	(tri_array+16),tri_array
.next
	subq	#1,f_cnt
	subqt	#4,tri_ptrs
	jump	ne,(LR)
	load	(tri_ptrs),tri_array

	movefa	LR.a,LR
	jump	(LR)
	nop

triangle:
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
	movefa	max_y.a,min_y
	jump	n,(LR)		; all y < 0
	and	x2,tmp1
	jump	n,(LR)		; all x < 0

	cmp	y0,min_y	; triangle > y_max ?
	movei	#max_x,tmp0
	jr	nn,.y_ok
	cmp	y1,min_y
	jr	nn,.y_ok
	cmp	y2,min_y
	jump	n,(LR)
.y_ok
	cmp	x0,tmp0
	jr	nn,.x_ok
	cmp	x1,tmp0
	jr	nn,.x_ok
	cmp	x2,tmp0
	jump	n,(LR)
.x_ok
	;; debug
	movefa	dump.a,r0
	addq	#1,r0
	moveta	r0,dump.a

	;; extract lightning data and color
	movei	#$00ff0000,tmp0
	move	color,lum0
	move	color,lum1
	move	color,lum2
	and	tmp0,lum0
	shlq	#8,lum1
	shlq	#16,lum2
	and	tmp0,lum1
	shrq	#24,color
	and	tmp0,lum2
	shlq	#24,color

;;; ----------------------------------------
;;->	movei	#$f000<<16,color
;;->	movei	#$07f<<16,lum0
;;->	movei	#$0ff<<16,lum1
;;->	movei	#$02f<<16,lum2
;;->	movei	#90,x0
;;->	movei	#100,y0
;;->	movei	#0,x1
;;->	movei	#120,y1
;;->	movei	#50,x2
;;->	movei	#150,y2
;;->	movefa	dump.a,r0
;;->	cmpq	#1,r0
;;->	jr	eq,.first
;;->	nop
;;->	movei	#30,tmp0
;;->	sub	tmp0,x0
;;->	sub	tmp0,x1
;;->	sub	tmp0,x2
;;->	movei	#30,tmp0
;;->	sub	tmp0,y0
;;->	sub	tmp0,y1
;;->	sub	tmp0,y2
;;->.first
;;; ----------------------------------------
	;; save first point
	moveta	lum0,save_lum0.a
	moveta	x0,save_x0.a
	moveta	y0,save_y0.a
	moveta	x1,save_x.a
	moveta	y1,save_y.a
	move	pc,LR3
	jump	(EDGE)		; x0,y0 -> x1,y1
	addq	#6,LR3

//->	movefa	LR.a,LR
//->	jump	(LR)

	move	lum1,lum0
	move	lum2,lum1
	movefa	save_x.a,x0
	movefa	save_y.a,y0
	move	x2,x1
	move	y2,y1
	jump	(EDGE)		; x1,y1 -> x2,y2
	addq	#16,LR3

	move	lum2,lum0
	movefa	save_lum0.a,lum1
	movefa	save_x0.a,x1
	movefa	save_y0.a,y1

//->	movefa	LR.a,LR
	movei	#drawLines,LR3
//->	addq	#16,LR3
	move	x2,x0
	move	y2,y0

****************
* edge (x0,y0)-(x1,y1)
****************

dcol		reg 99
dy		reg 99
x_min		reg 99
x_max		reg 99
dx		reg 1!

Edge::

	;; skip all Y negative lines
	move	y0,dy
	move	lum1,dcol
	and	y1,dy
	movefa	max_y.a,tmp0
	jump	mi,(LR3)	; both Y < 0
	cmp	y0,tmp0
	move	y1,dy
	jr	nn,.ymax_ok
	cmp	y1,tmp0
	jump	n,(LR3)		; both Y > max_y
.ymax_ok
	sub	lum0,dcol
	sub	y0,dy
	move	x1,dx
	jr	nn,.noswap
	sub	x0,dx

	add	dy,y0
	sub	dy,y1

	move	x1,x0

	move	lum1,lum0

	neg	dcol
	neg	dy
	neg	dx
.noswap
	cmpq	#0,dy
	movei	#1<<(fp_reci),x_ptr
	jump	eq,(LR3)
	div	dy,x_ptr

	sharq	#fp_reci,dcol
	shlq	#fp_rez,x0

	imult	x_ptr,dx	; dx/dy
	imult	x_ptr,dcol	; dcol/dy

	sub	y1,tmp0
	jr	pl,.y_btm_ok
	nop
	add	tmp0,dy
	jump	eq,(LR3)
.y_btm_ok
	cmpq	#0,y0
	jr	pl,.y_top_ok
	sharq	#fp_reci-fp_rez,dx

	add	y0,dy
	move	dcol,tmp0
	jump	eq,(LR3)

	shrq	#fp_rez,tmp0
	imult	y0,tmp0
	imult	dx,y0
	shlq	#fp_rez,tmp0
	sub	y0,x0
	sub	tmp0,lum0
	moveq	#0,y0
.y_top_ok:
	cmp	y0,min_y
	movefa	x_save.a,x_ptr
	jr	n,.nn
	shrq	#8,lum0		; do the calculation in the upper 16bit
	move	y0,min_y
.nn
	shlq	#3,y0
	shrq	#8,dcol
	move	x_ptr,x1
	add	y0,x_ptr
	sat16	x1		; x1 = $0000ffff

	move	pc,tmp0
	movei	#(max_x)<<fp_rez,tmp2
	addq	#4+6,tmp0
.loop1
	load	(x_ptr),x_min
	and	x1,lum0
	move	x_min,x_max
	shrq	#16,x_min
	load	(x_ptr+4),y1
	cmp	x0,tmp2		; > max_x?
	move	x0,tmp3
	jr	pl,.ok_max_x
	shlq	#16,x_max
	move	tmp2,tmp3	; clamp X
.ok_max_x
	cmpq	#0,x0
	jr	pl,.ok_x
	cmp	tmp3,x_min
	xor	tmp3,tmp3	; clear X and set flag
.ok_x:
	jr	n,.larger2
	shrq	#16,x_max

	shlq	#16,y1
	move	tmp3,x_min
	or	lum0,y1

	rorq	#16,y1
.larger2
	cmp	tmp3,x_max
	jr	pl,.smaller2
	shlq	#16,x_min

	shrq	#16,y1
	move	tmp3,x_max
	shlq	#16,y1
	or	lum0,y1
.smaller2
	add	dx,x0
	store	y1,(x_ptr+4)
	or	x_max,x_min
	add	dcol,lum0
	subq	#1,dy
	store	x_min,(x_ptr)
	jump	ne,(tmp0)
	addqt	#8,x_ptr

	jump	(LR3)
	nop

	unreg lum0,x0,y0, lum1,x1,y1, lum2
	unreg dx,dy,dcol, x_min, x_max

	unreg LR3

	unreg save_x.a,save_y.a, save_x0.a,save_y0.a, save_lum0.a,x2,y2
	unreg x_ptr,max_y.a

****************
* draw H-Lines

ptr		reg 99
blitter		reg 14

DL_LOOP		reg 99
x1		reg 99
x0		reg 99
color_table	reg 99
min_max		reg 99
color_min	reg 99
color_max	reg 99

drawLines:
	movei	#$f02200,blitter
	WAITBLITTER
	movei	#BLIT_PITCH1|BLIT_PIXEL16|BLIT_WIDTH|BLIT_XADDPIX,tmp0
	movefa	min_max.a,min_max
	store	tmp0,(blitter+_BLIT_A1_FLAGS)
	shlq	#3,min_y
	movefa	x_save.a,ptr
	moveq	#4,color_table
	add	min_y,ptr
	shrq	#3,min_y
	add	ptr,color_table

.__pc	move	pc,DL_LOOP
	jr	.into_dl_loop
	addq	#6,DL_LOOP
.dl_loop
	addqt	#8,color_table
	addqt	#1,min_y
.into_dl_loop:
	load	(ptr),x1
	cmp	x1,min_max
	move	x1,x0
	jump	eq,(LR)
	shlq	#16,x1
	store	min_max,(ptr)
	jump	eq,(DL_LOOP)
	addqt	#8,ptr
	shrq	#16+fp_rez,x0
	shrq	#16+fp_rez,x1
	load	(color_table),color_min
	sub	x0,x1
	movei	#1<<fp_reci,tmp2
	jump	eq,(DL_LOOP)
 IF GOURAUD = 1
	div	x1,tmp2			; 16 cycles!
	move	color_min,color_max
	shrq	#8,color_min		; 00LL.LL00
	shlq	#16,color_max
	shlq	#16,x0
	shrq	#8,color_max		; 00LL.LL00
	sub	color_min,color_max
	or	color,color_min
	sharq	#fp_reci,color_max
 ELSE
	shrq	#8,color_min		; 00LL.LL00
	shlq	#16,x0
	or	color,color_min
 ENDIF

	rorq	#16,color_min		; color lower 16bit, fraction upper

	or	min_y,x0
	bset	#16,x1
	rorq	#16,x0			; y:x
 IF GOURAUD = 1
	movei	#B_PATDSEL|B_GOURD,tmp3
 ELSE
	movei	#B_PATDSEL,tmp3
 ENDIF
wait_blit
	load	(blitter+_BLIT_CMD),tmp0
	btst	#0,tmp0
	jr	eq,wait_blit
	nop

 IF GOURAUD = 1
	imult	tmp2,color_max
	store	color_min,(blitter+_BLIT_PATD)
	shlq	#8,color_max
	moveq	#0,color_min
	shrq	#8,color_max
	store	color_min,(blitter+_BLIT_SRCD)
	store	color_max,(blitter+_BLIT_IINC)
 ELSE
	store	color_min,(blitter+_BLIT_PATD)
 ENDIF
	store	x0,(blitter+_BLIT_A1_PIXEL)
	store	x1,(blitter+_BLIT_COUNT)
	jump	(DL_LOOP)
	store	tmp3,(blitter+_BLIT_CMD)

	unreg	tri_array, f_cnt, min_y,x0,x1
	unreg	DL_LOOP, color_min,x_save.a
	unreg	min_max, color_max, blitter, ptr
	unreg	color,color_table,tri_ptrs,EDGE

//->	unreg tri_array; crash
