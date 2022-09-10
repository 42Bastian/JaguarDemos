;-*-Asm-*-
	GPU

	include <js/macro/help.mac>
	include <js/macro/joypad1.mac>
	include <js/symbols/blit_eq.js>
	include <js/symbols/jagregeq.js>
	include <js/symbols/joypad.js>

	UNREG	SP,SP.a,LR,LR.a

	;; return values
_MS_PER_FRAME	equ 0
_VBLS_PER_FRAME	equ 4
_HEIGHT		equ 8
_X_POS		equ 12
_Y_POS		equ 16
_ANGLE		equ 20
_Z		equ 24

map::		equ $00100000
screen0::	equ $00080000
screen1::	equ $000a0000
clut		equ $110

parameter	equ $f03ff0

NO_MAP		EQU 0

	;; canvas
rez_x::		equ 192		; 160/192/256/320
rez_y		equ 200

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

	;; landscape
scale_height	equ 160
horizon		equ 150

INITIAL_Z	equ 84
Z_STEP		equ 4

if Z_STEP = 4
MAX_Z		equ 112
endif
if Z_STEP = 3
MAX_Z		equ 110
endif
if Z_STEP = 2
MAX_Z		equ 128
endif

	;; modify height map
SEED		equ $3563335	; $F363330
SMOOTH		equ 1		; > 0 => smooth landscape
REDUCE_HEIGHT	equ 60

	;; Fixpoint (do not change!)
FP_BITS		EQU 7
FP		EQU (1<<FP_BITS)


	;; global registers
IRQ_SP.a	REG 31
IRQ_RTS.a	REG 30
IRQ_FLAGADDR.a	REG 29
IRQ_FLAG.a	REG 28
obl1.a		reg 27
obl0.a		reg 26
obl_size.a	reg 25
LR.a		reg 24
map_base.a	reg 23
max_z.a		reg 22

IRQScratch4.a	REG  4
IRQScratch3.a	REG  3
IRQScratch2.a	REG  2
IRQScratch1.a	REG  1
IRQScratch0.a	REG  0

IRQ_SP		REG 31
IRQ_RTS		REG 30
IRQ_FLAGADDR	REG 29
LR		REG 28
VBLFlag		REG 27
map_base	reg 26
mask		reg 25

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

	run $f03000
GPUstart::
	load	(IRQ_FLAGADDR.a),IRQ_FLAG.a
	movei	#cpu_irq,IRQScratch0.a
	bset	#9+0,IRQ_FLAG.a
	load	(IRQ_SP.a),IRQ_RTS.a
	jump	(IRQScratch0.a)
	bclr	#3,IRQ_FLAG.a

	org	$f03010

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
	movei	#op_irq,IRQScratch0.a
	bset	#9+3,IRQ_FLAG.a
	load	(IRQ_SP.a),IRQ_RTS.a
	jump	(IRQScratch0.a)
	bclr	#3,IRQ_FLAG.a

	org	$f03050
op_irq::
	move	obl0.a,IRQScratch0.a
	movei	#$1000,IRQScratch1.a
	move	obl_size.a,IRQScratch3.a
.l	loadp	(IRQScratch0.a),IRQScratch2.a
	addqt	#8,IRQScratch0.a
	subq	#1,IRQScratch3.a
	storep	IRQScratch2.a,(IRQScratch1.a)
	jr	ne,.l
	addq	#8,IRQScratch1.a

	moveq	#1,IRQScratch0.a
	moveta	IRQScratch0.a,VBLFlag

	moveq	#_VBLS_PER_FRAME,IRQScratch0.a
	load	(IRQScratch0.a),IRQScratch1.a
	addq	#1,IRQScratch1.a
	store	IRQScratch1.a,(IRQScratch0.a)

	movei	#$f00026,IRQScratch1.a
	jr	irq_return
	storew	IRQScratch1.a,(IRQScratch1.a) ; resume OP

timer_irq::
	nop
irq_return
	addqt	#2,IRQ_RTS.a
	moveta	IRQ_RTS.a,IRQ_RTS
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

	movei	#1<<14|%11111<<9,r0	; clear all ints, REGPAGE = 1
	store	r0,(IRQ_FLAGADDR)
	nop
	nop

	movei	#IRQ_STACK,IRQ_SP
	moveta	IRQ_SP,IRQ_SP.a

	;; get OP lists from 68k
	movei	#parameter,r15
	load	(r15),r0
	moveta	r0,obl0.a
	load	(r15+4),r0
	moveta	r0,obl1.a
	load	(r15+8),r0
	moveta	r0,obl_size.a

	movei	#1<<14|%11111<<9|%01000<<4,r0
	store	r0,(IRQ_FLAGADDR)
	nop
	nop

	;;
	;; prepare CLUT
	;;
	movei	#clut,r0
	;; water
	moveq	#10,r1
	movei	#$0030,r2
.clut1
	subq	#1,r1
	storew	r2,(r0)
	addqt	#8,r2
	jr	ne,.clut1
	addqt	#2,r0

	;; beach
	movei	#$fee0fee0,r2
	store	r2,(r0)
	addq	#4,r0

	;; gras
	movei	#110-12,r1
	movei	#$8f80,r2
	moveq	#20,r3
	movei	#$0100,r4
.clut2
	storew	r2,(r0)
	subq	#1,r3
	jr	ne,.c2
	nop
	sub	r4,r2
	moveq	#20,r3
.c2
	subq	#1,r1
	addqt	#2,r0
	jr	ne,.clut2
	subqt	#1,r2

	;; soil
	movei	#180-110,r1
	movei	#$f460,r2
.clut3
	storew	r2,(r0)
	subq	#1,r1
	addqt	#2,r0
	jr	ne,.clut3
	subqt	#1,r2

	movei	#256-180,r1
	movei	#$8820,r2
.clut4
	storew	r2,(r0)
	subq	#1,r1
	addqt	#2,r0
	jr	ne,.clut4
	addqt	#4,r2

;;; ----------------------------------------
;;; Generate Map
;;; ----------------------------------------
RAND		REG 99
STEP_LOOP	REG 99
DIAMANT		REG 99
GET_H		REG 99
X_LOOP		REG 99
Y_LOOP		REG 99
step		REG 99
x		REG 99
y		REG 99
y_step		REG 99
ptr0		reg 99
ptr1		reg 99
h_ul		reg 99
h_lr		reg 99
h_ur		reg 99
h_ll		reg 99
h0		reg 99
h1		reg 99
lc		reg 99
y_count		reg 99
x_count		reg 99
rnd		reg 99

genmap::
	movei	#SEED,rnd
	movei	#random,RAND
	movei	#diamant,DIAMANT
	movei	#map,map_base
	moveta	map_base,map_base.a
	moveq	#1,step
	movei	#get_h,GET_H
	shlq	#9,step
	moveq	#1,lc
	movei	#1023,mask

 IF NO_MAP = 0
	movei	#.step_loop,STEP_LOOP
	movei	#.x_loop,X_LOOP
	movei	#.y_loop,Y_LOOP

.step_loop:
	move	step,x
	move	lc,x_count

.x_loop:
	move	step,y_step
	move	step,y
	shlq	#10,y_step
	move	lc,y_count

.y_loop:
	move	step,r0
	move	step,r1
	neg	r0
	neg	r1
	BL	(GET_H)
	move	r0,h_ul

	move	step,r0
	move	step,r1
	BL	(GET_H)
	move	r0,h_lr

	move	step,r1
	move	step,r0
	neg	r1
	BL	(GET_H)
	move	r0,h_ur

	move	step,r0
	move	step,r1
	neg	r0
	BL	(GET_H)
	move	r0,h_ll

	move	h_lr,h0
	add	h_ur,h0
	add	h_ul,h0
	add	h_ll,h0
	shrq	#2,h0

	BL	(RAND)
	move	y,ptr0
	add 	r0,h0
	shlq	#10,ptr0
	sat8	h0
	add	x,ptr0
	add	map_base,ptr0

	storeb	h0,(ptr0)

	shlq	#1,h0

	move	h_ll,h1
	add	h_ul,h1
	BL	(DIAMANT)
	sub	step,r0
	storeb	h1,(r0)

	move	h_ul,h1
	add	h_ur,h1
	BL	(DIAMANT)
	sub	y_step,r0
	storeb	h1,(r0)

	move	h_ur,h1
	add	h_lr,h1
	BL	(DIAMANT)

	move	step,tmp1
	add	y,tmp1
	and	mask,tmp1
	shlq	#10,tmp1
	add	map_base,tmp1
	add	x,tmp1
	storeb	h1,(tmp1)

	move	h_lr,h1
	add	h_ll,h1
	BL	(DIAMANT)

	move	step,tmp0
	move	y,tmp1
	add	x,tmp0
	shlq	#10,tmp1
	and	mask,tmp0
	add	map_base,tmp1
	add	tmp0,tmp1

	add	step,y
	subq	#1,y_count
	storeb	h1,(tmp1)
	jump	ne,(Y_LOOP)
	add	step,y

	add	step,x
	subq	#1,x_count
	jump	ne,(X_LOOP)
	add	step,x

	shrq	#1,step
	jump	ne,(STEP_LOOP)
	shlq	#1,lc

	UNREG	Y_LOOP,X_LOOP,STEP_LOOP,y_step,ptr1
	UNREG	DIAMANT
	UNREG	h_ul,h_lr,h_ll,h_ur,lc,x_count,y_count

;;; ----------------------------------------
;;; Smoothie
;;; ----------------------------------------
 IF SMOOTH > 0
round		REG 99
LOOP		REG 99
sum		REG 99
BG		reg 99

smoothie::
	movei	#.loop,LOOP
	movei	#$f00058,BG
	moveq	#SMOOTH,round
	move	mask,y
	move	mask,x
.loop
	move	x,r0
	xor	y,r0
	storew	r0,(BG)

	moveq	#1,tmp0
	moveq	#0,tmp1
	BL	(GET_H)		; (x+1,y)
	move	r0,sum
	moveq	#1,tmp0
	moveq	#1,tmp1
	BL	(GET_H)		; (x+1,y+1)
	add	r0,sum
	moveq	#0,tmp0
	moveq	#1,tmp1
	BL	(GET_H)		; (x,y+1)
	add	r0,sum
	moveq	#1,tmp0
	moveq	#0,tmp1
	subq	#2,tmp0
	BL	(GET_H)		; (x-1,y)
	add	r0,sum
	moveq	#1,tmp0
	moveq	#1,tmp1
	subq	#2,tmp0
	BL	(GET_H)		; (x-1,y+1)
	add	r0,sum
	moveq	#1,tmp0
	subq	#2,tmp0
	move	tmp0,tmp1
	BL	(GET_H)		; (x-1,y-1)
	add	r0,sum
	moveq	#1,tmp1
	moveq	#1,tmp0
	subq	#2,tmp1
	BL	(GET_H)		; (x+1,y-1)
	add	r0,sum
	moveq	#1,tmp1
	moveq	#0,tmp0
	subq	#2,tmp1
	BL	(GET_H)		; (x,y-1)
	add	r0,sum
	moveq	#0,tmp0
	moveq	#0,tmp1
	BL	(GET_H)		; (x,y)
	add	r0,sum
	moveq	#9,r0
	div	r0,sum
	subq	#1,x
	jump	pl,(LOOP)
	storeb	sum,(tmp1)

	subq	#1,y
	jump	pl,(LOOP)
	move	mask,x

	subq	#1,round
	jump	pl,(LOOP)
	move	mask,y

	UNREG	round,LOOP,sum,BG
 ENDIF

;;; ----------------------------------------
;;; reduce height
;;; ----------------------------------------

 IF REDUCE_HEIGHT > 0
	moveq	#0,r10
	move	map_base,r0
	movei	#1024*1024,r1
	movei	#REDUCE_HEIGHT,r2
	movei	#.adj,r5
.adj	loadb	(r0),r4
	sub	r2,r4
	sat8	r4
	add	r4,r10
	subq	#1,r1
	storeb	r4,(r0)
	jump	ne,(r5)
	addq	#1,r0
 ENDIF


 ELSE
	UNREG	Y_LOOP,X_LOOP,STEP_LOOP,y_step,ptr1
	UNREG	DIAMANT
	UNREG	h_ul,h_lr,h_ll,h_ur,lc,x_count,y_count

	;; Fill "map" with a pattern to check color gradients
	movei	#$f00058,r9
	move	map_base,r0
	move	mask,r1
	move	mask,r2
	movei	#.x1,r10
.x1
	move	r1,r3
	move	r2,r4
	shrq	#3,r3
	shrq	#3,r4
	xor	r4,r3

	storeb	r3,(r0)
	loadb	(r0),r4
	cmp	r3,r4
	jr	eq,.ok
	nop
.error
	storew	r0,(r9)
	jr	.error
	addq	#1,r0
.ok
	subq	#1,r1
	jr	pl,.x1
	addqt	#1,r0
	subq	#1,r2
	jump	pl,(r10)
	move	mask,r1

 ENDIF
	movei	#main,r0
	jump	(r0)
//->	nop

diamant:
	add	h0,h1
	moveta	LR,LR.a
	sharq	#2,h1
	BL	(RAND)
	movefa	LR.a,LR
	add	r0,h1
	move	ptr0,r0
	jump	(LR)
	sat8	h1

get_h:
	add	x,tmp0
	add	y,tmp1
	and	mask,tmp0
	and	mask,tmp1
	add	map_base,tmp0
	shlq	#10,tmp1
	add	tmp0,tmp1
	jump	(LR)
	loadb	(tmp1),r0


	UNREG x,y,h0,h1,ptr0,GET_H,RAND
;;; ----------------------------------------
;;; RANDOM

random::
	move	rnd,tmp1
	rorq	#7,tmp1
	xor	tmp1,rnd

	move	rnd,tmp1
	shlq	#9,tmp1
	xor	tmp1,rnd

	move	rnd,tmp1
	shrq	#5,tmp1
	xor	tmp1,rnd

	movei	#$5556,tmp2	; 1/3*65535
	move	step,r0
	mult	step,tmp2
//->	move	step,tmp2
	subqt	#1,r0
//->	shrq	#2,tmp2
	shrq	#16,tmp2
	and	rnd,r0
	jump	(LR)
	sub	tmp2,r0

	unreg step,rnd,map_base

genmap_size	equ *-genmap
	echo "genmap size %Dgenmap_size"
;;; -----------------------------------------------------------------------
blitter		reg 14
sinptr		reg 15

currScreen.a	REG 99
BG.a		REG 99
LOOP.a		REG 99
py.a		reg 99
px.a		reg 99
pit.a		reg 99
time.a		reg 99
speed.a		reg 99
height.a	reg 99
dheight.a	reg 99

phi.a		reg 99
co.a		reg 99
si.a		reg 99

main::
	movei	#sintab,r15
	move	r15,r14
	movei	#128*4,r3
	movei	#127,r1
	moveq	#0,r2
singen:
	subq	#2,r1
	move	r2,r0
	shrq	#12-FP_BITS,r0
	store	r0,(r14)
	neg	r0
	add	r1,r2
	store	r0,(r14+r3)
	jr	ne,singen
	addqt	#4,r14

	movei	#$f02200,blitter

	movei	#$f00058,r0
	moveta	r0,BG.a
	movei	#screen1,r0
	moveta	r0,currScreen.a
	;--------------------
	;- Init ms-Timer
	movei	#$f00050,r0
	movei	#(26591-1)<<16|($ffff),r1
	store	r1,(r0)			; Start timer
	addq	#2,r0
	moveta	r0,pit.a

	movei	#160*FP,tmp0
	movei	#228*FP,tmp1
	moveta	tmp0,px.a
	moveta	tmp1,py.a
	movei	#INITIAL_Z,r0
	moveq	#0,r1
	moveta	r0,max_z.a
	moveq	#_Z,r2
	moveta	r1,speed.a
	store	r0,(r2)

	movei	#140<<7,r0
	moveq	#0,r1
	moveta	r0,height.a
	moveta	r1,dheight.a
	moveq	#0,r0
	moveta	r0,phi.a
	moveta	r0,si.a
	bset	#6+2,r0
	load	(sinptr+r0),r0
	moveta	r0,co.a

	move	PC,r0
	addq	#6,r0
	moveta	r0,LOOP.a
loop:

	moveq	#3,tmp0
	movei	#$f02114,tmp1
	store	tmp0,(tmp1)	; wakeup 68k

	xor	VBLFlag,VBLFlag
waitStart:
	jr	eq,waitStart	; wait for VBL
	cmpq	#0,VBLFlag

	movefa	pit.a,r0
	loadw	(r0),r0
	moveta	r0,time.a

;;; ------------------------------
;;; CLS
;;; ------------------------------
	moveq	#0,tmp0
	store	tmp0,(blitter+_BLIT_PATD)
	store	tmp0,(blitter+_BLIT_PATD+4)
	store	tmp0,(blitter+$40)
	store	tmp0,(blitter+$44)
	bset	#10,tmp0	   ; == $400
	store	tmp0,(blitter+$70)	; int inc
	movei	#BLIT_PITCH1|BLIT_PIXEL16|BLIT_WID|BLIT_XADDPHR,tmp0
	movefa	currScreen.a,tmp1
	store	tmp0,(blitter+_BLIT_A1_FLAGS)
	store	tmp1,(blitter)	;_BLIT_A1_BASE
	moveq	#0,tmp1
	movei	#(1<<16)|(rez_y*rez_x),tmp0
	store	tmp1,(blitter+_BLIT_A1_PIXEL)
	movei	#B_PATDSEL|B_GOURD,tmp1
	store	tmp0,(blitter+_BLIT_COUNT)
	store	tmp1,(blitter+_BLIT_CMD)
;;; ------------------------------
;;; Map
;;; ------------------------------
 IF 0
	;; draw part of the map
	movefa	currScreen.a,r0
	move	map_base,r1
        movei   #200,r2
	movei	#clut,r3
	movei	#1024-rez_x,r6
_y:
        movei   #rez_x,r4
_x:     loadb   (r1),r5
        addq    #1,r1
	shlq	#1,r5
	add	r3,r5
	loadw	(r5),r5
        subq    #1,r4
        storew  r5,(r0)
        jr      ne,_x
        addq    #2,r0

        subq    #1,r2
        jr      ne,_y
        add     r6,r1
 ENDIF

;;; ------------------------------
;;; Landscape
;;; ------------------------------
mh		reg 99
z		REG 99
dz		REG 99
xl		reg 99
yl		reg 99
dx		reg 99
dy		reg 99
invz		reg 99
x		reg 99
mx		reg 99
my		reg 99
h0		reg 99
h1		reg 99
Z_LOOP		reg 99
X_LOOP		reg 99
SKIP		reg 99
color		reg 99
ybuffer		reg 99
h0_next 	reg 99
z_cnt		reg 99
height		reg 99

	movei	#.x_loop,X_LOOP
	movei	#.z_loop,Z_LOOP
	movei	#.skip,SKIP

	;; clear y buffer
	movei	#y_buffer+$8000,r0
	movei	#rez_x,r1
	moveq	#0,r2
.cl	subq	#1,r1
	store	r2,(r0)
	jr	ne,.cl
	addqt	#4,r0

	moveq	#0,dz
	movefa	py.a,yl
	bset	#FP_BITS,dz
	moveq	#30,mh
	move	dz,z

	movefa	max_z.a,z_cnt
	;; prepare stripe drawing
	movei	#BLIT_PITCH1|BLIT_PIXEL16|BLIT_WID|BLIT_XADD0|BLIT_YADD1,tmp1
	WAITBLITTER 		; wait for CLS to finish
	store	tmp1,(blitter+_BLIT_A1_FLAGS)

.z_loop:
	movei	#scale_height<<(2*FP_BITS),invz
	div	z,invz		; scaling

 IF rez_x != 256
	moveq	#4096/rez_x,tmp0
 ENDIF
	movefa	si.a,dy
	movefa	co.a,dx
	imult	z,dy
	imult	z,dx
	move	dy,yl		; yl = z*si
	move	dx,xl		; xl = z*co
	sub	dx,yl		; yl = z*si - z*co
	add	dy,xl		; xl = z*co + z*si
	neg	dy
	sharq	#FP_BITS,dx	; dx = 2*z*co
	sharq	#FP_BITS,dy	; dy = -2*z*si
	move	dx,tmp1
 IF rez_x = 256
	sharq	#12-1-4,dx
	sharq	#12-1-4,dy
 ELSE
	imult	tmp0,dx		; not imult !!!!
	imult	tmp0,dy
	sharq	#12-1,dx
	sharq	#12-1,dy
 ENDIF
	sharq	#FP_BITS,xl
	sharq	#FP_BITS,yl

	neg	xl
	movefa	px.a,tmp0
	movefa	py.a,tmp1
	add	tmp0,xl
	add	tmp1,yl

	REGMAP

	moveq	#0,h0_next
	movei	#rez_x,x
	movei	#y_buffer,ybuffer
	movefa	height.a,height
	movefa	dheight.a,r0
	movei	#rez_x,r1
	imult	r0,r1
	add	r1,height
.x_loop:
	movefa	map_base.a,tmp0
	move	yl,my
	move	xl,mx
	shrq	#FP_BITS,my
	shrq	#FP_BITS,mx
	and	mask,my
	and	mask,mx
	shlq	#10,my
	add	tmp0,mx
	add	my,mx

	movei	#50*FP,tmp0
	move	h0_next,h0
	loadb	(mx),h0_next		; get next height from map

	;; find max. h0 within z = 0..50
	cmp	z,tmp0
	move	h0,color
	jr	mi,.noh
	moveq	#12,tmp0
	cmp	mh,h0
	jr	mi,.noh
	nop
	move	h0,mh
.noh
	;; Water and beach flat
	cmp	tmp0,h0
	move	height,r1
	jr	pl,.now
	shlq	#1,color
	move	tmp0,h0
.now
	shrq	#7,r1
	movei	#horizon,tmp0	; horizon (fix)
	sat8	r1
	sub	r1,h0
	imult	invz,h0
	sharq	#FP_BITS+1,h0
	load	(ybuffer),h1
	add	tmp0,h0
	movei	#clut,tmp0
	jump	mi,(SKIP)
	cmp	h0,h1
	move	h0,tmp2
	jump	pl,(SKIP)
	sub	h1,tmp2
	movei	#rez_y,tmp1
	jump	mi,(SKIP)
	add	tmp0,color
	sub	h0,tmp1
	loadw	(color),color
	jump	mi,(SKIP)
	addq	#1,tmp1
	bset	#16,tmp2
	shlq	#16,tmp1
	store	h0,(ybuffer)
	or	x,tmp1
	movei	#B_PATDSEL,h1	; re-use h1
	WAITBLITTER
	store	tmp1,(blitter+_BLIT_A1_PIXEL)
	store	tmp2,(blitter+_BLIT_COUNT)
	store	color,(blitter+_BLIT_PATD)
	store	color,(blitter+_BLIT_PATD+4) ;VJ only
	store	h1,(blitter+_BLIT_CMD)
.skip
	movefa	dheight.a,r0
	sub	r0,height

	add	dy,yl
	subq	#1,x
	addqt	#4,ybuffer
	jump	pl,(X_LOOP)
	add	dx,xl

	add	dz,z
	subq	#1,z_cnt
	addqt	#3,dz
	jump	ne,(Z_LOOP)
	nop

 UNREG Z_LOOP,X_LOOP,SKIP,height
 UNREG z,dz,xl,yl,dx,invz,x,mx,my,h0,h1,color,ybuffer,h0_next,z_cnt

;;; ------------------------------
;;; move
speed		reg 10
abs_speed	reg 9

	JOYPAD1 3

	movefa	speed.a,abs_speed
	movefa	speed.a,speed
	abs	abs_speed

	movefa	height.a,r1
	shrq	#7,r1
	btst	#JOY_0_BIT,r3
	jr	eq,.no_stop
	btst	#JOY_DOWN_BIT,r3
	moveq	#0,speed
	moveq	#0,abs_speed
.no_stop
	moveq	#4,r0
	jr	ne,.up_down
	btst	#JOY_UP_BIT,r3
	jr	eq,.no_updown
	subq	#4,r0
	subq	#4,r0
.up_down:
	cmpq	#6,abs_speed
	jr	mi,.no_updown
	add	r0,r1
	add	r0,r1
.no_updown
	addq	#8,mh
	cmp	mh,r1
	jr	pl,.h_ok
	nop
	move	mh,r1
.h_ok:
	sat8	r1
	moveq	#_HEIGHT,tmp0
	store	r1,(tmp0)
	shlq	#7,r1
	moveta	r1,height.a
	UNREG	mh

	;; 1/3 - max. z
	btst	#JOY_3_BIT,r3
	moveq	#2,r0
	jr	ne,.plusz
	btst	#JOY_1_BIT,r3
	jr	eq,.no_minusz
	subq	#4,r0
.plusz
	movefa	max_z.a,r1
	movei	#MAX_Z,r2
	add	r0,r1
	cmp	r1,r2
	jr	mi,.no_minusz
	moveq	#_Z,r0
	moveta	r1,max_z.a
	store	r1,(r0)
.no_minusz

	btst	#JOY_A_BIT,r3
	jr	ne,.inc_speed
	moveq	#1,r1
	btst	#JOY_C_BIT,r3
	subqt	#2,r1
	jr	eq,.no_speed
	nop
.inc_speed:
	add	r1,speed
.no_speed
	movefa	phi.a,r0
	btst	#JOY_RIGHT_BIT,r3
	movei	#.no_move,r2
	jr	ne,.move_x
	moveq	#4,r1
	btst	#JOY_LEFT_BIT,r3
	subqt	#8,r1
	jr	ne,.move_x
	nop
	jump	(r2)
	moveq	#0,r1

.move_x:
	move	speed,r2
	abs	r2
	cmpq	#5,r2		; rotate stronger if speed is higher
	jr	mi,.no_phi_inc
	nop
	shlq	#1,r1
.no_phi_inc
	add	r1,r0
	shlq	#32-10,r0
	shrq	#32-10,r0
	moveta	r0,phi.a
	load	(sinptr+r0),r2
	moveta	r2,si.a
	movei	#64*4,r2
	add	r0,r2
	shlq	#32-10,r2
	shrq	#32-10,r2
	load	(sinptr+r2),r2
	moveta	r2,co.a
.no_move
	moveq	#_ANGLE,r2
	shrq	#2,r0
	store	r0,(r2)
	shlq	#1,r1
	moveta	r1,dheight.a

	movefa	si.a,r0
	movefa	px.a,r2

	imult	speed,r0
	sub	r0,r2
	shlq	#22-FP_BITS,r2
	shrq	#22-FP_BITS,r2
	moveq	#_X_POS,r0
	moveta	r2,px.a
	shrq	#FP_BITS,r2
	store	r2,(r0)

	movefa	co.a,r0
	imult	speed,r0
	movefa	py.a,r2
	sub	r0,r2
	shlq	#22-FP_BITS,r2
	shrq	#22-FP_BITS,r2
	moveq	#_Y_POS,r0
	moveta	r2,py.a
	shrq	#FP_BITS,r2
	store	r2,(r0)

	moveta	speed,speed.a

	UNREG speed
;;; ------------------------------
;;; time

	movefa	pit.a,r0
	movefa	time.a,r1
	loadw	(r0),r0
	sub	r0,r1
	moveq	#_MS_PER_FRAME,r0
	store	r1,(r0)

;;; ------------------------------
;;; swap

	movefa	obl0.a,r0
	movefa	obl1.a,r1
	moveta	r0,obl1.a
	moveta	r1,obl0.a
	movei	#screen0^screen1,r1
	movefa	currScreen.a,r2
	movefa	LOOP.a,r0
	xor	r1,r2
	jump	(r0)
	moveta	r2,currScreen.a

	align 4
LastJoy:	ds.l 2
sintab:		ds.l 256+1
y_buffer:
y_buffer_end:	equ y_buffer+rez_x*4
	echo "y_buffer_end %Hy_buffer_end"
