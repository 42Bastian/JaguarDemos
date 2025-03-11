	.text
	move.l	#$f02110,a0
	lea.l	gpu(pc),a1
	move.l	a1,(a0)+
	moveq	#1,d0
	move.l	d0,(a0)
.stop:
	stop	#$2700
	bra.s	.stop
	.dphrase
gpu:	incbin	"main.bin"

	if gpu == $20
	else
	error "fix gpu code"
	endif
