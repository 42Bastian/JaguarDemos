	.68000
x:	stop	#$2700
	bra.s	x

wait:
	stop	#$2000
	move.l	$10.w,d0
	bne.s	wait
	move.l	d0,a0
	jmp	(a0)
	nop
