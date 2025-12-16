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
	jr	.cont_op
	cmpq	#0,VBLFlag.a


	org	$f03040
blit:
	load	(IRQ_FLAGADDR.a),IRQ_FLAG.a
	movei	#blit_irq,IRQScratch0.a
	bset	#9+4,IRQ_FLAG.a
	load	(IRQ_SP.a),IRQ_RTS.a
	jump	(IRQScratch0.a)
	bclr	#3,IRQ_FLAG.a
.cont_op:
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

blit_irq:
	cmpq	#0,blit_cnt.a
	jr	eq,irq_return
	cmp	blit_cnt.a,r15
	jr	ne,.not_done
	nop
	bclr	#8,IRQ_FLAG.a	; disable BLIT_IRQ
	jr	irq_return
	moveq	#0,blit_cnt.a
.not_done:
	movei	#$f02200,r14
	load	(r15),r4
	load	(r15+4),r5
	load	(r15+8),r6
	load	(r15+12),r7
	load	(r15+16),r8
	load	(r15+20),r9
	load	(r15+24),r10
	load	(r15+28),r11

	store	r4,(r14+_BLIT_A2_PIXEL)
	store	r5,(r14+_BLIT_A1_PIXEL)
	store	r6,(r14+_BLIT_A1_FPIXEL)
	store	r7,(r14+_BLIT_A1_BASE)
	store	r8,(r14+_BLIT_A1_INC)
	store	r9,(r14+_BLIT_A1_FINC)
	store	r10,(r14+_BLIT_IINC)
	movei	#BLIT_SRCEN|BLIT_LFU_REPLACE|BLIT_DSTA2|BLIT_UPDA1|BLIT_SRCSHADE|BLIT_GOURZ,r0
	movei	#irq_return,r1
	store	r11,(r14+ _BLIT_COUNT)
	store	r0,(r14+_BLIT_CMD)

	jump	(r1)
	addq	#32,r15


	align	16
	ENDMODULE irq
