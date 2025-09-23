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
	jr	ne,triangle
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
	movefa	dump.a,r0
	addq	#1,r0
	moveta	r0,dump.a

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
	movefa	max_y.a,min_y
	sharq	#16,y2

//->	cmp	y0,min_y	; triangle > y_max ?
//->	jr	nn,.y_ok
//->	cmp	y1,min_y
//->	jr	nn,.y_ok
//->	cmp	y2,min_y
//->	jump	n,(LR)
//->.y_ok
//->	cmpq	#0,y0		; triangle < 0
//->	jr	nn,.y_pos
//->	cmpq	#0,y1
//->	jr	nn,.y_pos
//->	cmpq	#0,y2
//->	jump	n,(LR)
//->.y_pos
//->	cmpq	#0,x0
//->	movei	#max_x,tmp0
//->	jr	nn,.x_pos
//->	cmpq	#0,x1
//->	jr	nn,.x_pos
//->	cmpq	#0,x2
//->	jump	n,(LR)
//->.x_pos
//->	cmp	x0,tmp0
//->	jr	nn,.x_ok2
//->	cmp	x1,tmp0
//->	jr	nn,.x_ok2
//->	cmp	x2,tmp0
//->	jump	n,(LR)
//->.x_ok2

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

;;->	movei	#$f000<<16,color
;;->	movei	#$07f<<16,lum0
;;->	movei	#$0ff<<16,lum1
;;->	movei	#$02f<<16,lum2
;;->
;;->
;;->	movei	#190,x0
;;->	movei	#100,y0
;;->	movei	#100,x1
;;->	movei	#120,y1
;;->	movei	#150,x2
;;->	movei	#150,y2

//->	movei	#70,tmp1
//->	btst	#2,f_cnt
//->	jr	ne,.xxxx
//->	nop
//->	add	tmp1,x0
//->	add	tmp1,x1
//->	add	tmp1,x2
//->	subq	#10,y0
//->	subq	#10,y1
//->	subq	#10,y2
//->.xxxx
	;; save first point
	moveta	lum0,save_lum0.a
	moveta	x0,save_x0.a
	moveta	y0,save_y0.a
	moveta	x1,save_x.a
	moveta	y1,save_y.a
	movei	#Edge,tmp0
	move	pc,LR3
	jump	(tmp0)		; x0,y0 -> x1,y1
	addq	#6,LR3

//->	movefa	LR.a,LR
//->	jump	(LR)

	move	lum1,lum0
	move	lum2,lum1
	movefa	save_x.a,x0
	movefa	save_y.a,y0
	move	x2,x1
	move	y2,y1
	jr	Edge		; x1,y1 -> x2,y2
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
	cmpq	#0,y0
	movefa	max_y.a,tmp0
	jr	nn,.y1pos
	cmpq	#0,y1
	jump	n,(LR3)
.y1pos
	cmp	y0,tmp0
	jr	nn,.ymax_ok
	cmp	y1,tmp0
	jump	n,(LR3)
.ymax_ok
	move	lum1,dcol
	move	y1,dy
	sub	lum0,dcol
	sub	y0,dy
	move	x1,dx
	jr	nn,.noswap
	sub	x0,dx

	add	dy,y0
	sub	dy,y1

	add	dx,x0
	sub	dx,x1

	move	lum1,lum0

	neg	dcol
	neg	dy
	neg	dx
.noswap
	shlq	#2,dy
	movei	#1<<(fp_reci+2),x_ptr
	jump	eq,(LR3)
	div	dy,x_ptr

//->	movefa	reci_table.a,x_ptr
//->	jump	eq,(LR3)
//->	load	(x_ptr+dy),x_ptr ; 1/dy

	sharq	#fp_reci,dcol
	shlq	#fp_rez,x0

	imult	x_ptr,dx	; dx/dy
	imult	x_ptr,dcol	; dcol/dy

	sub	y1,tmp0
	move	dcol,tmp3
	jr	pl,.y_btm_ok
	shlq	#2,tmp0
	add	tmp0,dy
	jump	eq,(LR3)
.y_btm_ok
	movei	#.y_top_ok,tmp0
	jump	pl,(tmp0)
	sharq	#fp_reci-fp_rez,dx

	add	y0,dy
	move	dcol,tmp0
	jump	eq,(LR3)
	neg	y0
	shlq	#16,tmp3
	shrq	#16,tmp3
	cmpq	#0,dcol
	jr	pl,.ok1
	mult	y0,tmp3
	neg	tmp3
.ok1
	sharq	#16,tmp0
	imult	y0,tmp0
	shlq	#16,tmp0
	add	tmp0,tmp3		;????
	add	tmp3,lum0

	imult	dx,y0
	add	y0,x0
	moveq	#0,y0
.y_top_ok
	cmp	y0,min_y
	movefa	x_save.a,x_ptr
	jr	n,.nn
	shlq	#8,lum0		; do the calculation in the upper 16bit
	move	y0,min_y
.nn
	shlq	#3,y0
	shlq	#8,dcol
	add	y0,x_ptr

	move	pc,tmp0
	movei	#(max_x)<<fp_rez,tmp2
	addq	#4+6,tmp0
.loop
	load	(x_ptr),x_min
	shrq	#16,lum0
	move	x_min,x_max
	shrq	#16,x_min
	cmp	x0,tmp2		; > max_x?
	load	(x_ptr+4),y1
	jr	mi,.okx
	shlq	#16,x_max

	cmpq	#0,x0
	move	x0,tmp3
	jr	pl,.okx
	cmp	tmp3,x_min
	xor	tmp3,tmp3
.okx
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
	store	y1,(x_ptr+4)
	shlq	#16,lum0
	or	x_max,x_min
	add	dcol,lum0
	add	dx,x0
	subq	#4,dy
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
reci_table	reg 99

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
	movefa	reci_table.a,reci_table

	move	pc,DL_LOOP
	jr	.dl_loop
	addq	#10,DL_LOOP
.empty
	addqt	#8,color_table
.empty1
	addqt	#1,min_y
.dl_loop
	load	(ptr),x1
	cmp	x1,min_max
	move	x1,x0
	jump	eq,(LR)
	shlq	#16,x1
	store	min_max,(ptr)
	jr	eq,.empty
	addq	#8,ptr
	shrq	#16+fp_rez,x0
	shrq	#16+fp_rez,x1
	load	(color_table),color_min
	sub	x0,x1
	addqt	#8,color_table
	jr	eq,.empty1
 IF GOURAUD = 1
	move	color_min,color_max
 ENDIF
	move	x1,tmp2
 IF GOURAUD = 1
	shlq	#16,color_max
	shlq	#2,tmp2
	shrq	#8,color_min	; 00LL.LL00
	add	reci_table,tmp2
	shrq	#8,color_max	; 00LL.LL00
	load	(tmp2),tmp2
 ELSE
	shrq	#8,color_min	; 00LL.LL00
 ENDIF
//->	addq	#1,x1
	shlq	#16,x0	; y is *4!
 IF GOURAUD = 1
	sub	color_min,color_max
	or	color,color_min
	sharq	#fp_reci,color_max
 ELSE
	or	color,color_min
 ENDIF
	rorq	#16,color_min	; color lower 16bit, fraction upper

	or	min_y,x0
	addqt	#1,min_y
	rorq	#16,x0
 IF GOURAUD = 1
	bset	#16,x1
	movei	#B_PATDSEL|B_GOURD,tmp3
	imult	tmp2,color_max
	shlq	#8,color_max
 ELSE
	bset	#16,x1
	movei	#B_PATDSEL,tmp3
 ENDIF
wait_blit
	load	(blitter+_BLIT_CMD),tmp2
	btst	#0,tmp2
	jr	eq,wait_blit
	nop

	store	color_min,(blitter+_BLIT_PATD)
 IF GOURAUD = 1
	shrq	#8,color_max
	moveq	#0,color_min
	store	color_max,(blitter+_BLIT_IINC)
	store	color_min,(blitter+_BLIT_SRCD)
 ENDIF
	store	x0,(blitter+_BLIT_A1_PIXEL)
	store	x1,(blitter+_BLIT_COUNT)
	jump	(DL_LOOP)
	store	tmp3,(blitter+_BLIT_CMD)

	unreg	tri_array, f_cnt, min_y,x0,x1
	unreg	DL_LOOP, color_min,x_save.a
	unreg	min_max, color_max, blitter, ptr
	unreg	reci_table,color,color_table,tri_ptrs

//->	unreg tri_array; crash
