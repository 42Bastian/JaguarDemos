;-*-asm-*-
;;; HEX font Debug Print
;;; (c) 2023 42Bastian
;;;

InitHexScreen::
	PUSHLR	r4
	shlq	#1,r0
	movei	#$f00400,r4
	add	r0,r4
	store	r1,(r4)
	movei	#TextScreen,r4
	store	r2,(r4)
	addq	#4,r4
	store	r3,(r4)
	addq	#4,r4

	movei	#((max_x_txt>>3)*max_y_txt)>>2,r1
	moveq	#0,r0
.clr
	subq	#1,r1
	store	r0,(r2)
	jr	nz,.clr
	addqt	#4,r2
	store	r0,(r4)
	POPLR	r4

PrintDEC::
	PUSHLR	r4,r5,r6,r14
	movei	#TextScreen,r14
	shlq	#16,r0
	movei	#__PrintDEC2,r5
	jr	pl,.pl
	store	r1,(r14+8)
	neg	r0
.pl
	movei	#65536/100+1,r1
	shrq	#16,r0
	mult	r1,r0
	move	r0,r6
	shrq	#16,r0
	shlq	#16,r6
	BL	(r5)
	shrq	#16,r6
	movei	#99,r0
	add	r0,r6
	addq	#1,r0
	mult	r6,r0
	shrq	#16,r0
	BL	(r5)
	POPLR	r4,r5,r6,r14

PrintDEC2::
	PUSHLR	r4,r14
	movei	#TextScreen,r14
	cmpq	#0,r0
	jr	pl,.pl
	store	r1,(r14+8)
	neg	r0
.pl
	movei	#__PrintDEC2,r1
	BL	(r1)
	POPLR	r4,r14

__PrintDEC2::
	shlq	#24,r0
	movei	#65536/10,r1
	shrq	#24,r0
	moveq	#9,r2
	mult	r1,r0
	add	r0,r2
	shrq	#16,r0
	moveq	#10,r1
	mult	r1,r2
	shlq	#4,r0
	shrq	#16,r2
	or	r2,r0

__PrintHEX0::
	move	r0,r4
	jr	.cont
	bclr	#8,r0

__PrintHEX1
	move	r0,r4
.cont
	load	(r14+8),r3		; y:x
	load	(r14),r2
	move	r3,r1
	shrq	#16,r3
	shlq	#16,r1
	shrq	#16,r1
	add	r1,r2
	addq	#1,r1
	shlq	#16,r1
	or	r3,r1
	rorq	#16,r1
	store	r1,(r14+8)
	movei	#(max_x_txt>>3)*6,r1
	mult	r1,r3
	add	r3,r2

	shlq	#23,r0
	movei	#.space,r1
	shrq	#23,r0
	movei	#max_x_txt>>3,r3
	btst	#8,r0
	jump	ne,(r1)
	moveq	#5,r1

	mult	r1,r0
	load	(r14+4),r1
	add	r0,r1
	REPT 4
	loadb	(r1),r0
	addq	#1,r1
	storeb	r0,(r2)
	add	r3,r2
	ENDR
	loadb	(r1),r0
	storeb	r0,(r2)
	jump	(LR)
	move	r4,r0


.space:
	moveq	#0,r1
	subq	#1,r1
	move	r4,r0
	REPT 4
	storeb	r1,(r2)
	add	r3,r2
	ENDR
	jump	(LR)
	storeb	r1,(r2)

PrintHEX::
	PUSHLR	r4,r5,r6,r14
	movei	#TextScreen,r14
	store	r1,(r14+8)
	movei	#__PrintHEX0,r5
	moveq	#3,r6
	move	pc,LR
	addq	#8,LR
.lh
	jump	(r5)
	rorq	#24,r0
	subq	#1,r6
	jr	pl,.lh
	nop

	POPLR	r4,r5,r6,r14
