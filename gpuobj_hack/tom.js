;-*-asm-*-
	GPU

	include <js/macro/help.mac>

	UNREG	SP,SP.a,LR,LR.a

screen0		= $00160000
screen1		= $00190000

Flag	equ $f03ff0
screen	equ $f03ff4

rez_x	equ 320
rez_y	equ 200
bpp	equ 16

IRQ_SP.a	REG 31
IRQ_RTS.a	REG 30
IRQ_FLAGADDR.a	REG 29
IRQ_FLAG.a	REG 28
color.a		reg 99
BG.a		reg 99
time.a		reg 99
hiword.a	reg 99

IRQScratch4.a	REG  4
IRQScratch3.a	REG  3
IRQScratch2.a	REG  2
IRQScratch1.a	REG  1
IRQScratch0.a	REG  0

IRQ_SP		REG 31
IRQ_RTS		REG 30
IRQ_FLAGADDR	REG 29

VBLFlag		REG 99
CPUIrqFlag	REG 99
color		REG 99
LOOP		REG 99
BG		REG 99

tmp1		reg 1
tmp0		reg 0

IRQ_STACK	EQU $f03FF0

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
//->	nop

	move	BG.a,r0
	moveq	#20,r1
	move	color.a,r3
	shlq	#2,r1
	add	time.a,r3
.fillLB
	xor	r1,r3
	move	r3,r4
	shlq	#16,r4
	or	r3,r4
	xor	r1,r3
	store	r4,(hiword.a)
	storep	r4,(r0)

	subq	#1,r1
	jr	pl,.fillLB
	addq	#8,r0
.skip_pattern
	bset	#9+3,IRQ_FLAG.a
	load	(IRQ_SP.a),IRQ_RTS.a
	bclr	#3,IRQ_FLAG.a

	movei	#$f00010,IRQScratch1.a
	load	(IRQScratch1.a),IRQScratch0.a ; load 2nd word of GPUOBJ
	rorq	#16,IRQScratch0.a
	movei	#$1000,IRQScratch1.a
	jr	mi,.vbl
	shrq	#3,IRQScratch0.a
	jr	.exit_gpu
	addqt	#1,color.a
.vbl
	moveq	#15,IRQScratch3.a
.l	loadp	(IRQScratch0.a),IRQScratch2.a
	addqt	#8,IRQScratch0.a
	subq	#1,IRQScratch3.a
	storep	IRQScratch2.a,(IRQScratch1.a)
	jr	pl,.l
	addq	#8,IRQScratch1.a

	moveq	#1,color.a
	addq	#1,time.a
	moveta	color.a,VBLFlag
.exit_gpu

	movei	#$f00026,IRQScratch1.a
//->	storew	IRQScratch1.a,(BG.a)
	jr	irq_return
	storew	IRQScratch1.a,(IRQScratch1.a) ; resume OP

timer_irq::
	movefa	color,IRQScratch0.a
	addq	#1,IRQScratch0.a
	moveta	IRQScratch0.a,color

irq_return
	addqt	#2,IRQ_RTS.a
	addqt	#4,IRQ_SP.a
	moveta	IRQ_RTS.a,IRQ_RTS.a ; only for VJ needed
	store	IRQ_FLAG.a,(IRQ_FLAGADDR.a)
	jump	(IRQ_RTS.a)
	nop

cpu_irq:
	moveq	#1,IRQScratch0.a
	jr	irq_return
	moveta	IRQScratch0.a,CPUIrqFlag

init::
	movei	#$f02100,IRQ_FLAGADDR
	moveta	IRQ_FLAGADDR,IRQ_FLAGADDR.a

	movei	#1<<14|%11111<<9,r0	; clear all ints, REGPAGE = 1
	store	r1,(IRQ_FLAGADDR)
	nop
	nop				; wait

	movei	#IRQ_STACK,IRQ_SP
	moveta	IRQ_SP,IRQ_SP.a

//->	movei	#1<<14|%11111<<9|%01101<<4,r0
	movei	#1<<14|%11111<<9|%01000<<4,r0
	store	r0,(IRQ_FLAGADDR)
	nop
	nop

	movei	#$f00058,BG
	moveq	#0,r0
	storew	r0,(BG)
	moveta	r0,color.a
	moveta	r0,time.a
	movei	#$f02118,r0
	moveta	r0,hiword.a

	movei	#$f01800,r0
	moveta	r0,BG.a

;--------------------
;- Init ms-Timer
	movei	#$f00050,r0
	movei	#(26591-1)<<16|(2-1),r1
	store	r1,(r0)			; Start timer

	moveq	#0,color
	movei	#loop,LOOP
	movei	#Flag,r15
loop:
	moveq	#3,tmp0
	movei	#$f02114,tmp1
	store	tmp0,(tmp1)	; wakeup 68k

	xor	VBLFlag,VBLFlag
waitVBL:
	jr	eq,waitVBL
	cmpq	#0,VBLFlag

	load	(r15+4),r2	; get screen base
	movei	#rez_x*rez_y/2,r5

	subq	#2,r2
	;; 14.2 cycles per byte
.fill
	move	r5,r1
	move	r5,r0
	shrq	#5,r1
	add	r20,r0
	xor	r1,r0
	subq	#1,r5
	addqt	#4,r2
//->	jr	ne,.fill
	storew	r0,(r2)

	jump	(LOOP)
	addq	#1,r20

	align 4
