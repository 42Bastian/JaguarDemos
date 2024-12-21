;-*-asm-*-
	GPU

	include <js/macro/help.mac>
	include <js/symbols/jagregeq.js>
	include <js\symbols\blit_eq.js>

	UNREG	SP,SP.a,LR,LR.a

WIDTH	EQU 400

IRQ_SP.a	REG 31
IRQ_RTS.a	REG 30
IRQ_FLAGADDR.a	REG 29
IRQ_FLAG.a	REG 28
LB.a		reg 99
VC.a		reg 99
time.a		reg 99
hiword.a	reg 99
OB0.a		reg 99
OPF.a		reg 99
VBLcount.a	reg 99
photo.a		reg 99
SKIP.a		reg 99
y_count.a	reg 99
ptr.a		reg 99
blitter.a	reg 14

IRQScratch4.a	REG  4
IRQScratch3.a	REG  3
IRQScratch2.a	REG  2
IRQScratch1.a	REG  1
IRQScratch0.a	REG  0

IRQ_SP		REG 31
IRQ_RTS		REG 30
IRQ_FLAGADDR	REG 29

blitter		reg 14

LOOP		REG 99
pic0		reg 99
pic1		reg 99
pic2		reg 99


tmp1		reg 1
tmp0		reg 0

IRQ_STACK	EQU $f03FF0

	run $f03000

GPUstart::
	movei	#cpu_irq,IRQScratch0.a
	load	(IRQ_FLAGADDR.a),IRQ_FLAG.a
	jump	(IRQScratch0.a)
	bset	#9+0,IRQ_FLAG.a

	org	$f03010
	movei	#init,r0
	jump	(r0)
	nop

	org	$f03020
timer::
	movei	#timer_irq,IRQScratch0.a
	load	(IRQ_FLAGADDR.a),IRQ_FLAG.a
	jump	(IRQScratch0.a)
	bset	#9+2,IRQ_FLAG.a

	org	$f03030
op::
	load	(IRQ_FLAGADDR.a),IRQ_FLAG.a
	movei	#WIDTH*2,r4
	loadw	(VC.a),r3
	bset	#9+3,IRQ_FLAG.a

	move	r3,r1
	bclr	#11,r3		; clear top/bottom flag
	shrq	#11,r1		; copy top/bottom flag to bit 0
	movei	#60+2,r2	; boundary (see obl0!)
//->	jr	eq.empty
	or	r1,r3		; set odd/even
	sub	r2,r3		; => line index
	move	photo.a,r2
	jr	pl,.no_vbl
	mult	r3,r4		; r4 = line ptr
	movei	#201,y_count.a
	addq	#1,VBLcount.a
.no_vbl:
	add	r4,r2
	subq	#1,y_count.a
	jr	pl,.no_blank
.empty	nop
	movei	#$100000,r2
.no_blank
	store	LB.a,(blitter)
	moveq	#0,r0
	store	r2,(blitter+_BLIT_A2_BASE)
	store	r0,(blitter+_BLIT_A1_PIXEL)
	store	r0,(blitter+_BLIT_A2_PIXEL)
	movei	#BLIT_SRCEN|BLIT_LFU_REPLACE,r1
	movei	#1<<16|200,r0
	store	r0,(blitter+_BLIT_COUNT)
	store	r1,(blitter+_BLIT_CMD)

skip:
	storew	IRQScratch0.a,(OPF.a)
	load	(IRQ_SP.a),IRQ_RTS.a
	addqt	#4,IRQ_SP.a
	addqt	#2,IRQ_RTS.a
	bclr	#3,IRQ_FLAG.a
	moveta	IRQ_RTS.a,IRQ_RTS.a ; only for VJ needed
	store	IRQ_FLAG.a,(IRQ_FLAGADDR.a)
	jump	(IRQ_RTS.a)
	nop

timer_irq::
//->	movefa	color,IRQScratch0.a
//->	addq	#1,IRQScratch0.a
//->	moveta	IRQScratch0.a,color

irq_return
	load	(IRQ_SP.a),IRQ_RTS.a
	addqt	#4,IRQ_SP.a
	addqt	#2,IRQ_RTS.a
	bclr	#3,IRQ_FLAG.a
	moveta	IRQ_RTS.a,IRQ_RTS.a ; only for VJ needed
	store	IRQ_FLAG.a,(IRQ_FLAGADDR.a)
	jump	(IRQ_RTS.a)
	nop

cpu_irq:
	moveq	#1,IRQScratch0.a
	jr	irq_return
	nop
//->	moveta	IRQScratch0.a,CPUIrqFlag

init::
	movei	#$f02100,IRQ_FLAGADDR
	moveta	IRQ_FLAGADDR,IRQ_FLAGADDR.a

	movei	#1<<14|%11111<<9,r0	; clear all ints, REGPAGE = 1
	store	r0,(IRQ_FLAGADDR)
	nop
	nop				; wait

	movei	#IRQ_STACK,IRQ_SP
	moveta	IRQ_SP,IRQ_SP.a

	movei	#$100000,r0
	moveq	#0,r1
	movei	#400/2,r2
.clr
	subq	#1,r2
	store	r1,(r0)
	jr	ne,.clr
	addq	#4,r0

	moveta	r0,time.a
	movei	#$f02118,r0
	moveta	r0,hiword.a
	movei	#$f01900+$8000,r0
	moveta	r0,LB.a
	movei	#$f00006,r0
	moveta	r0,VC.a
	movei	#$f00010,r0
	moveta	r0,OB0.a
	movei	#$f00026,r0
	moveta	r0,OPF.a
	movei	#$f03ff0,r14
	load	(r14),pic0
	load	(r14+4),pic1
	load	(r14+8),pic2
	moveta	pic0,photo.a
	movei	#skip,r0
	moveta	r0,SKIP.a
	movei	#$10000,r0
	moveta	r0,ptr.a
	movei	#$f02200,blitter
	moveta	blitter,blitter.a

	movei	#BLIT_PITCH1|BLIT_PIXEL32|BLIT_WID3584|BLIT_XADDPIX,r0
	store	r0,(blitter+_BLIT_A1_FLAGS)
	store	r0,(blitter+_BLIT_A2_FLAGS)

	moveq	#0,r0
	movei	#HC,r1
	storew	r0,(r1)
	addq	#1,r0
	movei	#VC,r1
	storew	r0,(r1)

//->	movei	#1<<14|%11111<<9|%01101<<4,r0
	movei	#1<<14|%11111<<9|%01000<<4,r0
	store	r0,(IRQ_FLAGADDR)
	nop
	nop

;--------------------
;- Init ms-Timer
	movei	#$f00050,r0
	movei	#(26591-1)<<16|(2-1),r1
	store	r1,(r0)			; Start timer

	movei	#loop,LOOP
	xor	r0,r0
	moveta	r0,VBLcount.a
loop:
	movefa	VBLcount.a,r3
	move	pic0,r0
	shrq	#7,r3
	jump	eq,(LOOP)
	nop
	move	pic1,pic0
	move	pic2,pic1
	move	r0,pic2
	moveta	pic0,photo.a

	xor	r0,r0
	moveta	r0,VBLcount.a

	jump	(LOOP)
	nop

	align 4
	regmap
