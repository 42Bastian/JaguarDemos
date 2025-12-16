;; -*-asm-*-
	MODULE irq,$f03020
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
	load	(IRQ_SP.a),IRQ_RTS.a
	bset	#9+3,IRQ_FLAG.a
	bclr	#3,IRQ_FLAG.a
	cmpq	#0,VBLFlag.a
	move	obl0.a,IRQScratch0.a
	jr	ne,.no_swap
	subq	#1,vbl_counter.a
	jr	pl,.no_swap
	nop
_patch_fps:
	moveq	#FPS-1,vbl_counter.a
	moveq	#1,VBLFlag.a
	move	obl1.a,obl0.a
	move	IRQScratch0.a,obl1.a

	move	screen0.a,IRQScratch1.a
	move	screen1.a,screen0.a
	move	IRQScratch1.a,screen1.a

	move	obl0.a,IRQScratch0.a
.no_swap
	movei	#op_list+$40,IRQScratch1.a
	moveq	#18-1,IRQScratch3.a
.l
	loadp	(IRQScratch0.a),IRQScratch2.a
	addqt	#8,IRQScratch0.a
	subq	#1,IRQScratch3.a
	storep	IRQScratch2.a,(IRQScratch1.a)
	jr	pl,.l
	addq	#8,IRQScratch1.a

	movei	#$f00026,IRQScratch1.a
	jr	irq_return
	storew	IRQScratch1.a,(IRQScratch1.a) ; resume OP

timer_irq::
	nop
irq_return
	addqt	#2,IRQ_RTS.a
	movefa	IRQ_SP,IRQ_SP.a
	moveta	IRQ_RTS.a,IRQ_RTS ; only for VJ needed
	jump	(IRQ_RTS.a)
	store	IRQ_FLAG.a,(IRQ_FLAGADDR.a)
	align	16
	ENDMODULE irq
