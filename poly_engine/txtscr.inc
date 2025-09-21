;-*-asm-*-
;;; Text routines using 8x8 font
;;; (c) 2023 42Bastian
;;;

;;; ----------------------------------------
;;; Init local variables
;;;
;;; r0 - CLUT index
;;; r1 - foreground:background color
;;; r2 - framebuffer
;;; r3 - font data

	align 4

InitTxtScreen::
	PUSHLR	r14
	shlq	#1,r0
	movei	#$f00400,r14
	store	r1,(r14+r0)
	movei	#TextScreen,r14
	store	r2,(r14)
	addq	#8,r3		; skip header
	store	r3,(r14+4)

	movei	#((max_x_txt>>3)*max_y_txt)>>2,r1
	moveq	#0,r0
	store	r0,(r14+8)
.clr
	subq	#1,r1
	store	r0,(r2)
	jr	nz,.clr
	addqt	#4,r2
 IF InitTxtScreen < $f03000
	nop
 ENDIF
	POPLR	r14

;;; ----------------------------------------
;;; Print  a zero terminated string
;;; r0 - ptr to zero terminated string
PrintString:
	movei	#TextScreen+8,r1
	load	(r1),r1
;;; ----------------------------------------
;;; Print a zero terminated string
;;; r0 - ptr
;;; r1 - y,x pos

PrintString_YX:
	PUSHLR	r4,r5,r6,r14
	movei	#TextScreen,r14
	store	r1,(r14+8)
	move	r0,r5
	movei	#__PrintChar,r6
	move	PC,LR
	addq	#4,LR
.ps:
	loadb	(r5),r0
	cmpq	#0,r0
	jump	ne,(r6)
	addq	#1,r5

 IF InitTxtScreen < $f03000
	nop
 ENDIF
	POPLR	r4,r5,r6,r14
;;; ----------------------------------------
;;; Print 6 digit decimal value
;;; r0 - value

PrintDEC::
	movei	#TextScreen+8,r1
	load	(r1),r1
;;; ----------------------------------------
;;; Print 6 digit signed decimal value
;;; r0 - value
;;; r1 - y:x position

PrintDEC_YX::
	PUSHLR	r4,r5,r6,r14
	movei	#TextScreen,r14
	moveq	#31,r2
	abs	r0
	addqt	#1,r2
	jr	cc,.pl
	store	r1,(r14+8)
	addq	#"-" - " ",r2
.pl
	move	r0,r6
	move	r2,r0
	movei	#__PrintChar,r5
 IF InitTxtScreen < $f03000
	nop
 ENDIF
	BL	(r5)
.pd0
	move	r6,r0

	movei	#10000,r1
	move	r0,r6
	div	r1,r0
	subq	#__PrintChar-__PrintDEC2-32,r5
	subq	#32,r5
	mult	r0,r1
	sub	r1,r6
	jump	(r5)
	addqt	#.pd1-.pd0,LR
.pd1
	move	r6,r0
	movei	#100,r1
	div	r1,r0
	mult	r0,r1
	sub	r1,r6
 IF InitTxtScreen < $f03000
	nop
 ENDIF
	jump	(r5)
	addqt	#.pd2-.pd1,LR
.pd2
	move	r6,r0
 IF InitTxtScreen < $f03000
	nop
 ENDIF
	jump	(r5)
	addqt	#.pd3-.pd2,LR
.pd3
 IF InitTxtScreen < $f03000
	nop
 ENDIF
	POPLR	r4,r5,r6,r14

;;; ----------------------------------------
;;; Print 2 digit decimal value
;;; r0 - value
PrintDEC2::
	movei	#TextScreen+8,r1
	load	(r1),r1

;;; ----------------------------------------
;;; r0 - value
;;; r1 - y:x position

PrintDEC2_YX::
	PUSHLR	r4,r14
	movei	#TextScreen,r14
	abs	r0
	jr	cc,.pl
	store	r1,(r14+8)
	movei	#__PrintChar,r1
	PUSH	r0
	moveq	#"-"-32,r0
	addq	#32,r0
	BL	(r1)
	POP	r0
.pl
	movei	#__PrintDEC2,r1
	BL	(r1)
 IF InitTxtScreen < $f03000
	nop
 ENDIF
	POPLR	r4,r14

;;; ----------------------------------------
;;; Print 8 digit hex value
;;; r0 - value

PrintHEX::
	movei	#TextScreen+8,r1
	load	(r1),r1
;;; ----------------------------------------
;;; Print 8 digit hex value
;;; r0 - value
;;; r1 - y:x cursor
PrintHEX_YX::
	PUSHLR	r4,r5,r6,r7,r14
	movei	#TextScreen,r14
	movei	#__PrintDigit,r5
	store	r1,(r14+8)
	moveq	#7,r6
	move	r0,r7
.pc	move	pc,LR
	addq	#.ret-.pc,LR
.lh
	shrq	#28,r0
	cmpq	#10,r0
 IF InitTxtScreen < $f03000
	nop
 ENDIF
	jump	mi,(r5)
	shlq	#4,r7
	jump	(r5)
	addq	#7,r0
.ret
	subq	#1,r6
 IF InitTxtScreen < $f03000
	nop
 ENDIF
	jr	pl,.lh
	move	r7,r0
 IF InitTxtScreen < $f03000
	nop
 ENDIF

	POPLR	r4,r5,r6,r7,r14
;;; ----------------------------------------
;;; Print single character
;;; r0 - chararcter
PrintChar::
	movei	#TextScreen+8,r1
	load	(r1),r1
;;; ----------------------------------------
;;; Print single character at y:x
;;; r0 - value
;;; r1 - y:x cursor
PrintChar_YX::
	PUSHLR	r4,r14
	movei	#TextScreen,r14
	movei	#__PrintChar,r4
	store	r1,(r14+8)
	BL	(r4)
 IF InitTxtScreen < $f03000
	nop
 ENDIF
	POPLR	r4,r14
;;; ----------------------------------------
;;; internal function
__PrintDEC2::
	shlq	#24,r0
	movei	#(65536+5)/10,r1
	shrq	#24,r0
	moveq	#9,r2
	mult	r1,r0
	add	r0,r2

	PUSH	LR,r2
 IF InitTxtScreen < $f03000
	nop
 ENDIF
	move	pc,LR
	jr	__PrintDigit0
	addq	#6,LR
	POP	LR,r0
	moveq	#10,r1
	mult	r1,r0
__PrintDigit0:
	shrq	#16,r0
	;; fall thru
;;; ----------------------------------------
;;; internal function
;;; Print R0
__PrintDigit::
	addq	#32,r0
	addq	#"0"-32,r0

;;; ----------------------------------------
;;; internal function
;;; Print R0, if bit 8 is set, space
;;;
;;; r0-r4 destroyed
__PrintChar
	load	(r14+8),r1	; y:x
	load	(r14),r2	; screen pointer
	move	r1,r3
	shlq	#16,r1
	shrq	#16,r3		; y
	shrq	#16,r1		; x
	add	r1,r2
	addq	#1,r1		; next x
	movei	#((max_x_txt>>3)-1)<<16,r4
	shlq	#16,r1
	cmp	r1,r4
	jr	pl,.no_nl
	or	r3,r1		; combine with Y
	nop			; scoreboard bug fix
	moveq	#1,r1		; back to 1
	add	r3,r1
.no_nl
	rorq	#16,r1		; back to y:x
	shrq	#16,r4		; max_x-1
	store	r1,(r14+8)
	addq	#1,r4		; max_x
	load	(r14+4),r1	; font data
	mult	r4,r3		; address
	shlq	#24,r0
	shlq	#3,r3		; 8 lines high
	shrq	#24-3,r0	; (char & 255) * 8
	add	r3,r2		; final destination
	add	r0,r1		; final source
 IFD SMALL_TXTSCR
	moveq	#7,r3
.char
	loadb	(r1),r0
	addqt	#1,r1
	subq	#1,r3
	storeb	r0,(r2)
	jr	ne,.char
	add	r4,r2

	loadb	(r1),r0
	jump	(LR)
	storeb	r0,(r2)
 ELSE
	load	(r1),r0
	addq	#4,r1
	load	(r1),r3
	REPT 4
	rorq	#24,r0
	storeb	r0,(r2)
	add	r4,r2
	ENDR
	REPT 3
	rorq	#24,r3
	storeb	r3,(r2)
	add	r4,r2
	ENDR
	rorq	#24,r3
 IF InitTxtScreen < $f03000
	nop
 ENDIF
	jump	(LR)
	storeb	r3,(r2)
 ENDIF
