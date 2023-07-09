;; -*-asm-*-
;;; demo
;;; ----------------------------------------
;;; xxxx
;;; Author: 42Bastian
;;; Release: Somarhack 2023
;;; ----------------------------------------
;;; Model M:  0 bytes free
;;; Model K: 12 bytes free
;;; ----------------------------------------

	gpu


	include <js/symbols/jagregeq.js>
	include <js/symbols/blit_eq.js>
	include <js/macro/help.mac>
	UNREG LR,SP,LR.a,SP.a

BLIT_WID	EQU BLIT_WID320

;;->TIMING	EQU 1

 IFD MODEL_M
 echo "Model M"
 ENDIF

WANTED_SIZE	SET 256

BLOCKS		SET (WANTED_SIZE/64)		; max. is 10

OBL		EQU $37020

	regtop 31
restart		reg 99
screen_ptr	reg 99
obl		reg 99
current_scr	reg 99
blit_count	reg 99
bg_col		reg 99
LR		reg 99
pattern		reg 99
DRAW		reg 99
xorg		reg 99
yorg		reg 99
x		reg 99
y		reg 99
blitter		reg 14

tmp1		reg 1
tmp0		reg 0

	MACRO WAITBLITTER
.\wait@
	load (blitter+$38),tmp0
	shrq #1,tmp0
	jr cc,.\wait@
//->	nop
	ENDM

	RUN $00F035AC		; Start address after decryption. Fix!!!
start:
 IFD MODEL_M
	movei	#$5076,r14 ; 5076 : Disable BIOS double buffering
	storew	r3,(r14)
 ELSE
	movei	#$20004e71,r0
	movei	#$509c,r14
	storew	r0,(r14)
	subq	#4,r14
	store	r0,(r14)
	addq	#1,r0		; nop => stop
	subq	#2,r14
	storew	r0,(r14)
	subq	#32,r14
	storew	r3,(r14)	; 5076 : Disable BIOS double buffering
 ENDIF

	movei	#$f1a114,r0	; disable DSP -> Roaar
	store	r3,(r0)
;;; setup
	moveq	#16,screen_ptr
	shlq	#16,screen_ptr

	movei	#OBL,obl
	movei	#$f02200,blitter
	movei	#$3720c,current_scr
 IFD TIMING
	movei	#$f00058,bg_col
 ENDIF
	movei	#draw,DRAW

	move	pc,restart
superloop:
	store	screen_ptr,(current_scr)
	store	r0,(blitter+_BLIT_A1_PIXEL)
wvbl:	load	(obl),r1
	shrq	#8,r1
	cmp	screen_ptr,r1
	jr	ne,wvbl
 IFD TIMING
	echo "Timing enabled"
	storew	r3,(bg_col)
	storew	bg_col,(bg_col)
 ENDIF

	moveq	#20,xorg
	movei	#238,yorg
	shlq	#4,xorg
	subq	#1,xorg
	move	xorg,x
	move	pc,LR

	move	x,r0
	moveq	#0,r1
	move	xorg,r3
	sub	x,r3
	move	yorg,r4
	move	pattern,r2
	subq	#1,x
	jump	pl,(DRAW)
	addq	#4,pattern

	move	yorg,y
	move	pc,LR
	moveq	#0,r0
	move	y,r4
	move	pattern,r2
	move	xorg,r3
	move	yorg,r1
	sub	y,r1
	subq	#1,y
	jump	pl,(DRAW)
	addq	#4,pattern
	jump	(restart)


;;; ----------------------------------------
;;; draw
;;;
;;; Register usage: r0-r10, r14
;;;
;;; r4 - y0
;;; r3 - x0
;;; r2 - color
;;; r1 - y1
;;; r0 - x1
draw::

dx	reg 10
dy	reg 9
m	reg 8
cnt	reg 7
dir_x	reg 6
step_y	reg 5
a1inc	reg 4
;;; -- parameter
y0	reg 4!
x0	reg 3
color	reg 2!
y1	reg 1!
x1	reg 0!
.pos1
	move	y1,dy
	move	x1,dx
	sub	y0,dy
	sub	x0,dx
	moveq	#1,dir_x
	jr	pl,.noswap0
	moveq	#1,step_y

	move	x1,x0
	move	y1,y0
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

	;; dx = dy
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
	shlq	#16,y0
	movei	#$80008000,tmp1	; start in the middle of the 1st pixel


	WAITBLITTER
	or	x0,y0

	store	color,(blitter+_BLIT_PATD)

	movei	#BLIT_PITCH1|BLIT_PIXEL16|BLIT_WID|BLIT_XADDINC,tmp0
	store	screen_ptr,(blitter)	;_BLIT_A1_BASE
	store	tmp0,(blitter+_BLIT_A1_FLAGS)

	cmpq	#0,dir_x
	store	y0,(blitter+_BLIT_A1_PIXEL)
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
	jump	(LR)
	store	tmp1,(blitter+_BLIT_CMD)

	UNREG	dx,dy,m,cnt,dir_x,step_y,a1inc
	UNREG	x0,y0,x1,y1,color

draw_e::
draw_size	equ draw_e-draw
	echo "DRAW: %ddraw_size"

end:
size	set end-start

free	set WANTED_SIZE-size
free0	set free

	IF free < 0
WANTED_SIZE	SET WANTED_SIZE+64
BLOCKS		SET BLOCKS+1
free		set free+64
	ENDIF
	if free > 0
	REPT	WANTED_SIZE-size
	dc.b	$42
	ENDR
	endif

	regmap

	echo "GPU Size:%dsize | Free:%dfree0"
	echo "%dWANTED_SIZE"

 END
