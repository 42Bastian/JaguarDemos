;;; -*-asm-*-
;;;
;;; Draw a single pixel line.
;;;
;;; currScreen.a should point to the current screen

;;; ----------------------------------------
;;; draw
;;;
draw::

m	reg 99
cnt	reg 99
dir_x	reg 99
step_y	reg 99
a1inc	reg 99

	movei	#BLIT_PITCH1|BLIT_PIXEL8|BLIT_WIDTH|BLIT_XADDINC,tmp0
	store	tmp0,(blitter+_BLIT_A1_FLAGS)

	move	y2,dy
	move	x2,dx
	sub	y1,dy
	sub	x1,dx
	moveq	#1,dir_x
	jr	pl,.noswap0
	moveq	#1,step_y

	move	x2,x1
	move	y2,y1
	neg	step_y
.noswap0
	abs	dy
	jr	cc,.pos
	abs	dx
	neg	step_y
.pos
	cmpq	#0,dy
	jr	ne,.yno0
	cmp	dy,dx
	moveq	#0,step_y
.yno0
	move	dx,cnt
	jr	ne,.not_diag
	move	dy,m

	;; dx == dy
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
	shlq	#16,y1
	movei	#$80008000,tmp1	; start in the middle of the 1st pixel
	or	x1,y1

	WAITBLITTER

	cmpq	#0,dir_x
	store	y1,(blitter+_BLIT_A1_PIXEL)
	jr	eq,.cont_dia
	store	tmp1,(blitter+_BLIT_A1_FPIXEL)
	jr	mi,.xstep
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
	moveq	#0,tmp1
	store	cnt,(blitter+_BLIT_COUNT)
	bset	#16,tmp1	; B_PATDSEL
	jump	(POLY_LOOP)
	store	tmp1,(blitter+_BLIT_CMD)

	UNREG	m,cnt,dir_x,step_y,a1inc


draw_e::
draw_size	equ draw_e-draw
	echo "DRAW: %ddraw_size"
