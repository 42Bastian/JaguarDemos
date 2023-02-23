;-*-Asm-*-
	GPU

	include <js/macro/help.mac>
	include <js/macro/joypad1.mac>
	include <js/symbols/blit_eq.js>
	include <js/symbols/jagregeq.js>
	include <js/symbols/joypad.js>
	include "canvas.h"

	UNREG	SP,SP.a,LR,LR.a

DEBUG::		EQU 1
CHANGE_OBJECTS  EQU 1

JITTER		EQU 1

	;; variables
	RSSET	$1000
	RSB	obl,512

	RSL	TextScreen
	RSL	font
	RSL	Cursor

FP_BITS		equ 12

 IF rez_x = 320
BLIT_WID	EQU BLIT_WID320
 ENDIF

 IF rez_x = 256
BLIT_WID	EQU BLIT_WID256
 ENDIF

 IF rez_x = 192
BLIT_WID	EQU BLIT_WID192
 ENDIF

 IF rez_x = 160
BLIT_WID	EQU BLIT_WID160
 ENDIF

	;; global registers
IRQ_SP.a	REG 31
IRQ_RTS.a	REG 30
IRQ_FLAGADDR.a	REG 29
IRQ_FLAG.a	REG 28
obl1.a		reg 27
obl0.a		reg 26
obl_size.a	reg 25
LR.a		reg 24
SP.a		reg 23

IRQScratch4.a	REG  4
IRQScratch3.a	REG  3
IRQScratch2.a	REG  2
IRQScratch1.a	REG  1
IRQScratch0.a	REG  0

IRQ_SP		REG 31
VBLFlag		REG 22
IRQ_RTS		REG 30 ; only for VJ needed
IRQ_FLAGADDR	REG 29
LR		REG 24
SP		REG 23

tmp2		reg 2
tmp1		reg 1
tmp0		reg 0

IRQ_STACK	EQU $f03020

MACRO WAITBLITTER
.\wait@
	load (blitter+$38),tmp0
	shrq #1,tmp0
	jr cc,.\wait@
	nop
ENDM

	run $f03010
	;; r28 - obl0
	;; r27 - obl1
	;; r26 - obl size
	;; r25 - hexfont

	movei	#init,r0
	jump	(r0)
	nop

	org	$f03020
timer::
	load	(IRQ_FLAGADDR.a),IRQ_FLAG.a
	movei	#timer_irq,IRQScratch0.a
	bset	#9+2,IRQ_FLAG.a
	load	(IRQ_SP.a),IRQ_RTS.a
	jump	(IRQScratch0.a)
	bclr	#3,IRQ_FLAG.a

	org	$f03030
op::
	load	(IRQ_FLAGADDR.a),IRQ_FLAG.a
	bset	#9+3,IRQ_FLAG.a
	load	(IRQ_SP.a),IRQ_RTS.a
	bclr	#3,IRQ_FLAG.a
	move	obl0.a,IRQScratch0.a
	movei	#obl+$20,IRQScratch1.a
	move	obl_size.a,IRQScratch3.a
.l	loadp	(IRQScratch0.a),IRQScratch2.a
	addqt	#8,IRQScratch0.a
	subq	#1,IRQScratch3.a
	storep	IRQScratch2.a,(IRQScratch1.a)
	jr	pl,.l
	addq	#8,IRQScratch1.a

	moveq	#1,IRQScratch0.a
	moveta	IRQScratch0.a,VBLFlag

	movei	#$f00026,IRQScratch1.a
	jr	irq_return
	storew	IRQScratch1.a,(IRQScratch1.a) ; resume OP

timer_irq::
	nop
irq_return
	addqt	#2,IRQ_RTS.a
	moveta	IRQ_RTS.a,IRQ_RTS ; only for VJ needed
	movefa	IRQ_SP,IRQ_SP.a
	store	IRQ_FLAG.a,(IRQ_FLAGADDR.a)
	jump	(IRQ_RTS.a)
	nop

cpu_irq:
	moveq	#1,IRQScratch0.a
	moveta	IRQScratch0.a,VBLFlag

	jr	irq_return
	nop

;;; ------------------------------------------------------------
init::
	movei	#$f02100,IRQ_FLAGADDR
	moveta	IRQ_FLAGADDR,IRQ_FLAGADDR.a

;;->	movei	#1<<14|%11111<<9,r0	; clear all ints, REGPAGE = 1
;;->	store	r0,(IRQ_FLAGADDR)
;;->	nop
;;->	nop

	movei	#IRQ_STACK,IRQ_SP
	moveta	IRQ_SP,IRQ_SP.a
	movei	#gpu_stack+4*4,SP
;;; ------------------------------
	include <js/inc/videoinit.inc>
;;; ------------------------------
	;; get OP lists from 68k
	move	r28,r1
	moveq	#16,r2
	shlq	#1,r2
	add	r2,r28
	moveta	r28,obl0.a
	add	r2,r27		; skip branch objects
	moveta	r27,obl1.a
	move	r26,r0
	subq	#4,r0
	moveta	r0,obl_size.a

	movei	#obl,r0
	move	r0,r4
.cpyobl0:
	loadp	(r1),r3
	addq	#8,r1
	subq	#1,r26
	storep	r3,(r0)
	jr	nz,.cpyobl0
	addq	#8,r0

	rorq	#16,r4
	moveq	#$f,r14
	shlq	#20,r14
	store	r4,(r14+32)

 IF DEBUG = 1
	movei	#254,r0
	movei	#$1000F7F0,r1
	movei	#txt_screen,r2
	move	r25,r3
	movei	#InitHexScreen,r4
	BL	(r4)
 ELSE
	movei	#$1000F7F0,r0
	movei	#$f00400+254*2,r1
	store	r0,(r1)
 ENDIF

	movei	#1<<14|%11111<<9|%01000<<4,r0
	store	r0,(IRQ_FLAGADDR)
	nop
	nop
;;; -----------------------------------------------------------------------
blitter		reg 14
sinptr		reg 15

currScreen.a	REG 99
BG.a		REG 99
LOOP.a		REG 99
pit.a		reg 99
time.a		reg 99
alpha.a		reg 99
beta.a		reg 99
delta.a		reg 99
z_pos.a		reg 99
jitcounter.a	reg 99
object.a	reg 99
cur_object.a	reg 99
dots.a		reg 99
faces.a		reg 99
position.a	reg 99
obj_swap.a	reg 99
scene_flag.a	reg 99
finish.a	reg 99

main::
	movei	#sintab,sinptr
	move	sinptr,r14
	moveq	#16,r1
	shlq	#3+2,r1
	movei	#127,r2
	moveq	#0,r3
singen:
	subq	#2,r2
	move	r3,r0
 IF FP_BITS <> 12
	shrq	#12-FP_BITS,r0
 ENDIF
	store	r0,(r14)
	neg	r0
	add	r2,r3
	store	r0,(r14+r1)
	jr	ne,singen
	addqt	#4,r14

	movei	#sintab+256*4,r14
	bset	#6+2,r3
cosingen:
	subq	#4,r3
	load	(sinptr+r3),r2
	jr	ne,cosingen
	store	r2,(r14+r3)

	movei	#$f02200,blitter
	movei	#200<<16|320,tmp0
//->	moveq	#0,tmp0
	store	tmp0,(blitter+_BLIT_A1_CLIP)
	moveq	#0,tmp0
	store	tmp0,(blitter+_BLIT_A1_STEP)
	store	tmp0,(blitter+_BLIT_A1_FSTEP)

	movei	#$f00058,r0
	moveta	r0,BG.a
	movei	#$8800,r1
	storew	r1,(r0)
	movei	#screen1,r0
	moveta	r0,currScreen.a
	;--------------------
	;- Init ms-Timer
	movei	#$f00050,r0
	movei	#(26591-1)<<16|($ffff),r1
	store	r1,(r0)			; Start timer
	addq	#2,r0
	moveta	r0,pit.a

	moveq	#0,r0
	moveta	r0,delta.a
	moveta	r0,beta.a
	moveta	r0,alpha.a

//->	moveq	#1,r0
	moveta	r0,scene_flag.a
	moveq	#2,r0
	moveta	r0,finish.a

	movei	#1400,r0
	moveta	r0,z_pos.a

	movei	#200,r0
	moveta	r0,jitcounter.a
	moveq	#1,r0
	moveta	r0,obj_swap.a

	movei	#cube,r15
	moveta	r15,object.a
	load	(r15),r0
	moveta	r0,dots.a
	load	(r15+4),r0
	moveta	r0,faces.a
	load	(r15+8),r0
	moveta	r0,position.a

	move	PC,r0
	addq	#6,r0
	moveta	r0,LOOP.a
loop:
 IF DEBUG = 1
	movefa	BG.a,r0
	moveq	#0,r1
	storew	r1,(r0)
 ENDIF
	xor	VBLFlag,VBLFlag
waitStart:
	jr	eq,waitStart	; wait for VBL
	cmpq	#0,VBLFlag

	movefa	pit.a,r0
	loadw	(r0),r0
	moveta	r0,time.a
 IF DEBUG = 1
	movefa	BG.a,r0
	movei	#$88ff,r1
	storew	r1,(r0)
 ENDIF
	movefa	finish.a,r0
	cmpq	#0,r0
	movei	#100,r0
	jr	mi,.no_plus
	movefa	z_pos.a,r1
	cmp	r0,r1
	jr	mi,.no_diinc
	nop
	jr	.no_diinc
	subq	#8,r1
.no_plus
	addq	#2,r1
.no_diinc:
	moveta	r1,z_pos.a
;;; ------------------------------
;;; CLS
;;; ------------------------------
	moveq	#0,tmp0
	store	tmp0,(blitter+_BLIT_PATD)
	store	tmp0,(blitter+_BLIT_PATD+4)
	store	tmp0,(blitter+$40)
	store	tmp0,(blitter+$44)
	bset	#8,tmp0	 		  	; = $200
	store	tmp0,(blitter+$70)		; int inc
	movei	#BLIT_PITCH1|BLIT_PIXEL16|BLIT_WID|BLIT_XADDPHR,tmp0
	movefa	currScreen.a,tmp1
	store	tmp0,(blitter+_BLIT_A1_FLAGS)
	store	tmp1,(blitter)			;_BLIT_A1_BASE
	moveq	#0,tmp1
	movei	#(1<<16)|(rez_y*rez_x),tmp0
	store	tmp1,(blitter+_BLIT_A1_PIXEL)
	movei	#B_PATDSEL|B_GOURD,tmp1
	store	tmp0,(blitter+_BLIT_COUNT)
	store	tmp1,(blitter+_BLIT_CMD)

	macro	subang
	movefa	\0,r0
	subq	#\1,r0
	and	\2,r0
	moveta	r0,\0
	endm

	macro	addang
	movefa	\0,r0
	addq	#\1,r0
	and	\2,r0
	moveta	r0,\0
	endm


.loop
	movefa	object.a,r0
	movei	#doScene,r1
	BL	(r1)
	movefa	scene_flag.a,r0
	cmpq	#0,r0
	movei	#.skip,r1
	jump	pl,(r1)
	nop
	movei	#diamant,r0
	movei	#doScene,r1
	BL	(r1)

	movei	#ball,r0
	movei	#doScene,r1
	BL	(r1)
.skip
	movefa	object.a,r0
	movei	#.nojit,r4
	movefa	jitcounter.a,r2
	movei	#-110,r3
	subq	#1,r2
	movefa	dots.a,r0
	moveta	r2,jitcounter.a
	jump	pl,(r4)
	load	(r0),r1

	cmp	r3,r2
	addqt	#4,r0
	jr	eq,.nojit1
	moveq	#3,r2
.jit
//-> IF JITTER = 1
//->	load	(r0),r3
//->	xor	r2,r3
//->	subq	#1,r1
//->	store	r3,(r0)
//->	jr	ne,.jit
//->	addq	#4,r0
//-> ENDIF
	jump	(r4)
.nojit1
	nop
 IF CHANGE_OBJECTS = 1
	movefa	obj_swap.a,r0
	neg	r3
	subq	#1,r0
	moveta	r0,obj_swap.a
	jump	pl,(r4)
	moveta	r3,jitcounter.a

	moveta	r3,jitcounter.a
	addq	#1,r0
	movefa	object.a,r1
	moveta	r0,obj_swap.a
	movefa	scene_flag.a,r0
	addq	#16,r1
	addq	#1,r0
	movei	#last_object,r3
	moveta	r0,scene_flag.a
	jr	eq,.xxx
	cmp	r1,r3
	jr	ne,.nojit
	moveta	r1,object.a
	movei	#-2,r1
	moveta	r1,scene_flag.a
	movefa	finish.a,r0
	subq	#1,r0
	moveta	r0,finish.a
.xxx
	movei	#cube,r1
	moveta	r1,object.a
 ENDIF
.nojit
;;; ------------------------------
;;; move

	JOYPAD1 3
	movei	#LastJoy,r0
	load	(r0),r0
	cmpq	#0,r0
	movei	#255<<2,r1
	jr	ne,.norot
	nop
	addang	alpha.a,4,r1
//->	addang	beta.a,4,r1
	addang	delta.a,4,r1
.norot
;;; ------------------------------
;;; time
 IF DEBUG = 1
	movefa	pit.a,tmp1
	movefa	time.a,tmp0
	loadw	(tmp1),tmp1
	sub	tmp1,tmp0

	moveq	#0,r1
	movei	#PrintDEC2,r2
	BL	(r2)
 ENDIF
;;; ------------------------------
	movei	#ball2_pos,r4
	movei	#diamant2_pos,r5

	movei	#diamant+8,r3
	movefa	scene_flag.a,r0
	movei	#cube+8,r1
	cmpq	#0,r0
	movei	#ball+8,r2
	jr	pl,.noscene
	nop
	movei	#cube2_pos,r0
	store	r0,(r1)
	store	r4,(r2)
	store	r5,(r3)
	subq	#8,r1
	moveta	r1,object.a
.noscene

;;; ------------------------------
;;; swap

	movefa	obl0.a,tmp0
	movefa	obl1.a,r1
	moveta	tmp0,obl1.a
	moveta	r1,obl0.a
	movei	#screen0^screen1,r1
	movefa	currScreen.a,r2
	movefa	LOOP.a,tmp0
	xor	r1,r2
	jump	(tmp0)
	moveta	r2,currScreen.a

;;; ----------------------------------------
;;; doCube(r0 = color, r14 = object)
;;;
;;; Total registers used: r0-r19
doScene::
	PUSH	LR

	moveta	r0,cur_object.a

	movefa	jitcounter.a,r2
	cmpq	#0,r2
	movei	#.nojit0,r2
  IF JITTER = 1
	echo "JITTER on"
	jump	pl,(r2)
	nop
	movei	#255<<2,r1
	subang	alpha.a,32,r1
	subang	beta.a,32,r1
	subang	delta.a,32,r1

	movei	#doCube,r1
	movei	#$8000,r0
	BL	(r1)

	movei	#255<<2,r1
	addang	alpha.a,16,r1
	addang	beta.a,16,r1
	addang	delta.a,16,r1

	movei	#doCube,r1
	movei	#$0f00,r0
	BL	(r1)

	movei	#255<<2,r1
	addang	alpha.a,16,r1
	addang	beta.a,16,r1
	addang	delta.a,16,r1
 ENDIF
.nojit0
	movei	#$f000,r0
	movei	#doCube,r1
	BL	(r1)
	RTS

doCube::
	PUSH	LR
	PUSH	r0
	movefa	cur_object.a,r14
	load	(r14),r0
	moveta	r0,dots.a
	load	(r14+4),r0
	moveta	r0,faces.a
	load	(r14+8),r0
	moveta	r0,position.a

	movei	#rotate,r0
	BL	(r0)

	movei	#projection,r0
	BL	(r0)

	POP	r0
	movei	#draw_cube,r1
	BL	(r1)

	RTS


;;; ----------------------------------------
;;; rotation
;;;
;;; Register usage: r0-r19
;;;
rotate::
a	reg 0!
b	reg 1!
c	reg 2!
d	reg 3
e	reg 4
f	reg 5
acfbe	reg 6
aebcf	reg 7
bceaf	reg 8
bface	reg 9
dot_cnt	reg 10

	movei	#1<<(FP_BITS-1),r20

	movei	#sintab,sinptr
	movei	#sintab+64*4,r14

	movefa	alpha.a,a
	movefa	alpha.a,b
	movefa	beta.a,c
	movefa	beta.a,d
	movefa	delta.a,e
	movefa	delta.a,f

	load	(sinptr+a),a	; sin a
	load	(r14+b),b	; cos a
	load	(sinptr+c),c	; sin b
	load	(r14+d),d	; cos b
	load	(sinptr+e),e	; sin d
	load	(r14+f),f	; cos d

	move	a,acfbe
	imult	c,acfbe
 add	r20,acfbe
	sharq	#FP_BITS,acfbe
	imult	f,acfbe
	move	b,r7
	imult	e,r7
	add	r7,acfbe

	move	b,r8
	move	a,aebcf
	neg	r8
	imult	e,aebcf
	imult	c,r8
 add	r20,r8
	sharq	#FP_BITS,r8
	imult	f,r8
	add	r8,aebcf

	move	b,bceaf
	imult	c,bceaf
 add	r20,bceaf
	sharq	#FP_BITS,bceaf
	imult	e,bceaf
	move	f,r9
	imult	a,r9
	add	r9,bceaf

	neg	a
	move	f,r10
	move	a,bface
	imult	b,r10
	imult	c,bface
 add	r20,bface
	sharq	#FP_BITS,bface
	imult	e,bface
	add	r10,bface

	imult	d,b
	imult	d,a
	neg	e
	imult	d,f
	imult	e,d

 add r20,acfbe
 add r20,aebcf
 add r20,bceaf
 add r20,bface
 add r20,a
 add r20,b
 add r20,f
 add r20,d
	sharq	#FP_BITS,acfbe
	sharq	#FP_BITS,aebcf
	sharq	#FP_BITS,bceaf
	sharq	#FP_BITS,bface
	sharq	#FP_BITS,a
	sharq	#FP_BITS,b
	sharq	#FP_BITS,f
	sharq	#FP_BITS,d

	UNREG	e

	movefa	position.a,r14
	movefa	z_pos.a,r12
	load	(r14),r17
	load	(r14+4),r18
	load	(r14+8),r19
	add	r12,r19

	movefa	dots.a,r14
	movei	#rdots,r15
	load	(r14),r10
	addq	#4,r14
	move	pc,r21
.rot
	load	(r14),r11
	load	(r14+4),r12
	load	(r14+8),r13
	addq	#12,r14

	imultn	f,r11
	imacn	d,r12
	imacn	c,r13
	resmac	r16
	imultn	acfbe,r11
	imacn	bface,r12
	imacn	a,r13
	resmac	r4

	imultn	aebcf,r11
	imacn	bceaf,r12
	imacn	b,r13
	resmac	r11
 add r20,r16
 add r20,r4
 add r20,r11
	sharq	#FP_BITS,r16
	sharq	#FP_BITS,r4

	add	r17,r16
	sharq	#FP_BITS,r11
	store	r16,(r15)
	add	r19,r11
	add	r18,r4
	store	r11,(r15+8)
	subq	#3,r10
	store	r4,(r15+4)
	jump	ne,(r21)
	addqt	#12,r15

	jump	(LR)
	nop
	unreg a,b,c,d,f,acfbe,aebcf,bceaf,bface,dot_cnt

;;; ----------------------------------------
;;; projection
;;; ----------------------------------------

x		reg 0!
y		reg 1!
z		reg 2!
sign		reg 3
x_center	reg 4
di		reg 5
cnt		reg 6
PROJ		reg 7

projection::
	movefa	dots.a,cnt
	movei	#.proj,PROJ
	load	(cnt),cnt
	movei	#rdots,r14
	movei	#pxy,r15
	movei	#160,x_center
	movei	#1<<(FP_BITS-1),r8
	movei	#col,r9
.proj
	load	(r14+8),z
	moveq	#1,sign
	abs	z
	movei	#100<<FP_BITS,di
	jr	cc,.pos_z
	div	z,di			; 120*256/z
	subq	#2,sign
.pos_z
//->	shlq	#2,z
	movei	#255,x
	sub	z,x
	sat8	x
	store	x,(r9)
	addq	#4,r9

	load	(r14),x
	or	x,x
	movei	#100,r2
	load	(r14+4),y
	or	y,y
	addq	#12,r14


	imult	sign,di		; get sign back
	imult	di,x
	imult	di,y
	add	r8,x
	add	r8,y
	sharq	#FP_BITS,x
	sharq	#FP_BITS,y
	add	x_center,x
	sub	y,r2
	store	x,(r15)
	subq	#3,cnt
	store	r2,(r15+4)
	jump	ne,(PROJ)
	addqt	#8,r15

	jump	(LR)
	nop

 UNREG x,y,z,sign,di,cnt,PROJ,x_center

;;; ----------------------------------------
;;; Draw cube
;;;
POLY	reg 21
DRAW	reg 20
FACES	reg 19
fcnt	reg 18

y0	reg 4
x0	reg 3
color	reg 2!			; re-use tmp2
y1	reg 1!
x1	reg 0!

draw_cube::
	PUSH	LR
	PUSH	r0
	movei	#draw,DRAW
	movefa	faces.a,FACES
	movei	#$f02200,blitter
	load	(FACES),fcnt
	movei	#poly,POLY
	addq	#4,FACES
.loop
	load	(FACES),r0
	load	(SP),r1
	BL	(POLY)
	subq	#1,fcnt
	jr	ne,.loop
	addq	#4,FACES

	addq	#4,SP
	RTS

	UNREG	x0,y0,x1,y1,color
;;; ----------------------------------------
;;; poly(vertice_list, color)
;;;
;;; Register usage: r0-r16
;;;

p0	REG 5
p1	reg 6
p2	reg 7

poly::
	move	r0,r13
	move	r1,r12

	move	r0,p0
	shlq	#6,r0
	shrq	#26,p0
	move	r0,p1
	shlq	#3,p0
	shrq	#26,p1
	shlq	#6,r0
	shlq	#3,p1
	move	r0,p2
	shrq	#26,p2
	shlq	#3,p2

	movei	#pxy,r15

	load	(r15+p1),r1
	move	r1,r2
	load	(r15+p0),r0
	sub	r0,r1		; p1.x - p0.x
	load	(r15+p2),r0
	sub	r0,r2		; p1.x - p2.x
	addq	#4,r15
	load	(r15+p2),r0
	load	(r15+p1),r3
	sub	r3,r0		; p2.y - p1.y
	load	(r15+p0),r4
	sub	r4,r3		; p1.y - p0.y
	imult	r1,r0
	imult	r2,r3

	movefa	jitcounter.a,r2
	cmpq	#0,r2
	moveq	#3,r11
 IF JITTER = 1
	jr	mi,.nohide
 ENDIF
	add	r3,r0
	jump	pl,(LR)
.nohide
	move	LR,r16
	and	r13,r11		; count
	addq	#3,r11
	movei	#col,r17
	UNREG	p0,p1,p2

.loop
	move	r13,r3
	shrq	#26,r3
	shlq	#6,r13
	shlq	#3,r3
	move	r13,r0
	move	r3,r5
	shrq	#26,r0
	shrq	#1,r5
	add	r17,r5
	load	(r15+r3),r4
	shlq	#3,r0
	subq	#4,r3
	move	r0,r6
	load	(r15+r3),r3
	shrq	#1,r6
	add	r17,r6
	load	(r15+r0),r1
	subq	#4,r0
	load	(r5),r5
//->	move	r12,r2
	load	(r15+r0),r0
	load	(r6),r6
	add	r5,r6
	shrq	#1,r6
	move	r6,r2
	or	r12,r2
	BL	(DRAW)
	movei	#.loop,r2
	subq	#1,r11
	jump	ne,(r2)
	nop
	jump	(r16)
	nop

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
	or	x0,y0

	WAITBLITTER

	store	color,(blitter+_BLIT_PATD)
	store	color,(blitter+_BLIT_PATD+4) ;VJ

	movei	#BLIT_PITCH1|BLIT_PIXEL16|BLIT_WID|BLIT_XADDINC,tmp0
	movefa	currScreen.a,color
	store	tmp0,(blitter+_BLIT_A1_FLAGS)
	store	color,(blitter)	;_BLIT_A1_BASE

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
	bset	#6,tmp1		; B_CLIPA1
	jump	(LR)
	store	tmp1,(blitter+_BLIT_CMD)

	UNREG	dx,dy,m,cnt,dir_x,step_y,a1inc
	UNREG	x0,y0,x1,y1,color

draw_e::
draw_size	equ draw_e-draw
	echo "DRAW: %ddraw_size"
 IF DEBUG = 1
	include "hexscr.js"
 ENDIF
	align 32

cube:		dc.l cube_dots,cube_faces,cube_pos,0
diamant:	dc.l dia_dots,dia_faces,diamant_pos,0
ball		dc.l ball_dots,ball_faces,ball_pos,0
last_object	dc.l 0

	echo " Cube: %Hcube Diamant: %Hdiamant"

cube_pos	dc.l 0,0,0
diamant_pos	dc.l 0,0,0
ball_pos	dc.l 0,0,40

cube2_pos:	dc.l 110,60,60
diamant2_pos:	dc.l 0,-20,10
ball2_pos	dc.l -130,50,70

	MACRO DOT
	dc.l \0,\1,\2
	ENDM

	macro init_poly
	SWITCH \#
	CASE 3
	dc.l	(\0<<26)|(\1<<20)|(\2<<14)|(\0<<8)|0
	case 4
	dc.l	(\0<<26)|(\1<<20)|(\2<<14)|(\3<<8)|(\0<<2)|1
	ENDS
	endm

dia_dots:
//->	dc.l 6*3
//->	DOT -10,-15,0
//->	DOT 20,30,0
//->	DOT 50,-20,0
//->	DOT 40,-20,0
//->	DOT 20,20,0
//->	DOT 00,-20,0
//->
	dc.l 6*3
	DOT -40,-40,  0
	DOT -40, 40,  0
	DOT  40, 40,  0
	DOT  40,-40,  0
	DOT   0,  0,-60
	DOT   0,  0, 60

cube_dots:
	dc.l 8*3
	DOT -40,-40,-40
	DOT  40,-40,-40
	DOT  40,-40, 40
	DOT -40,-40, 40
	DOT -40, 40,-40
	DOT  40, 40,-40
	DOT  40, 40, 40
	DOT -40, 40, 40


cube_faces:
	dc.l 6
	init_poly 0,1,5,4
	init_poly 2,3,7,6
	init_poly 1,2,6,5
	init_poly 3,0,4,7
	init_poly 4,5,6,7
	init_poly 3,2,1,0

dia_faces:
//->	dc.l 2
//->	init_poly 5,4,1,0
//->	init_poly 4,3,2,1


	dc.l 8
	init_poly 4,1,0
	init_poly 4,2,1
	init_poly 4,3,2
	init_poly 4,0,3
	init_poly 1,5,0
	init_poly 2,5,1
	init_poly 3,5,2
	init_poly 0,5,3

 IF 1
ball_dots:
	dc.l 42*3
	DOT $0000,$0000,-70
	DOT $0029,$0000,-57
	DOT $0021,$0018,-57
	DOT $000D,$0027,-57
	DOT -13,$0027,-57
	DOT -33,$0018,-57
	DOT -41,$0000,-57
	DOT -33,-24,-57
	DOT -13,-39,-57
	DOT $000D,-39,-57
	DOT $0021,-24,-57
	DOT $0043,$0000,-22
	DOT $0036,$0027,-22
	DOT $0015,$003F,-22
	DOT $FFFFFFEB,$003F,-22
	DOT $FFFFFFCA,$0027,-22
	DOT $FFFFFFBD,$0000,-22
	DOT $FFFFFFCA,-39,-22
	DOT $FFFFFFEB,$FFFFFFC1,-22
	DOT $0015,$FFFFFFC1,-22
	DOT $0036,-39,-22
	DOT $0043,$0000,$0016
	DOT $0036,$0027,$0016
	DOT $0015,$003F,$0016
	DOT $FFFFFFEB,$003F,$0016
	DOT $FFFFFFCA,$0027,$0016
	DOT $FFFFFFBD,$0000,$0016
	DOT $FFFFFFCA,-39,$0016
	DOT $FFFFFFEB,$FFFFFFC1,$0016
	DOT $0015,$FFFFFFC1,$0016
	DOT $0036,-39,$0016
	DOT $0029,$0000,$0039
	DOT $0021,$0018,$0039
	DOT $000D,$0027,$0039
	DOT -13,$0027,$0039
	DOT -33,$0018,$0039
	DOT -41,$0000,$0039
	DOT -33,-24,$0039
	DOT -13,-39,$0039
	DOT $000D,-39,$0039
	DOT $0021,-24,$0039
	DOT 0,0,70

	macro init_poly2
	SWITCH \#
	CASE 3
	dc.l	(\2<<26)|(\1<<20)|(\0<<14)|(\2<<8)|0
	case 4
	dc.l	(\3<<26)|(\2<<20)|(\1<<14)|(\0<<8)|(\3<<2)|1
	ENDS
	endm
ball_faces:
	dc.l 50
	init_poly2 0,2,1
	init_poly2 0,3,2
	init_poly2 0,4,3
	init_poly2 0,5,4
	init_poly2 0,6,5
	init_poly2 0,7,6
	init_poly2 0,8,7
	init_poly2 0,9,8
	init_poly2 0,10,9
	init_poly2 0,1,10
	init_poly2 1,2,12,11
	init_poly2 2,3,13,12
	init_poly2 3,4,14,13
	init_poly2 4,5,15,14
	init_poly2 5,6,16,15
	init_poly2 6,7,17,16
	init_poly2 7,8,18,17
	init_poly2 8,9,19,18
	init_poly2 9,10,20,19
	init_poly2 10,1,11,20
	init_poly2 11,12,22,21
	init_poly2 12,13,23,22
	init_poly2 13,14,24,23
	init_poly2 14,15,25,24
	init_poly2 15,16,26,25
	init_poly2 16,17,27,26
	init_poly2 17,18,28,27
	init_poly2 18,19,29,28
	init_poly2 19,20,30,29
	init_poly2 20,11,21,30
	init_poly2 21,22,32,31
	init_poly2 22,23,33,32
	init_poly2 23,24,34,33
	init_poly2 24,25,35,34
	init_poly2 25,26,36,35
	init_poly2 26,27,37,36
	init_poly2 27,28,38,37
	init_poly2 28,29,39,38
	init_poly2 29,30,40,39
	init_poly2 30,21,31,40
	init_poly2 31,32,41
	init_poly2 32,33,41
	init_poly2 33,34,41
	init_poly2 34,35,41
	init_poly2 35,36,41
	init_poly2 36,37,41
	init_poly2 37,38,41
	init_poly2 38,39,41
	init_poly2 39,40,41
	init_poly2 40,31,41
 ENDIF
	align 4
varbase_::
	RSSET	varbase_
	RSL	gpu_stack,32
	RSL	LastJoy,2
	RSL	endofram

	RSSET $1fe000
	RSL	rdots,50*3
	RSL	pxy::,50*2
	RSL	col,50
	RSL	sintab,256+64

	echo "EOR %Hendofram"

;;->	REGMAP
