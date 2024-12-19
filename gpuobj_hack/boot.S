	.68000

	.include "68k_inc/jaguar.inc"
	.include "68k_inc/blit_eq.inc"
	.include "68k_mac/help.mac"

start:
	jmp	init
	nop
exe:
	.incbin "gpuobj.bin",,36
	.phrase
init:
	lea	exe,a0
	move.w	#$4000,a1
	move.l	#(init-exe),d0
	bsr	memcpy
	jmp	$4000.w

;;; memcpy with blitter
;;; A0 -> A1, size D0
memcpy:
	move.l	d0,d2
mcp0:
	move.l	d2,d0
	cmp.l	#$20000,d2
	bls.s	mcp1
	move.l	#$20000,d0
mcp1:
	sub.l	d0,d2
	lea	A1_BASE,a2
	move.l	a1,(a2)
	add.l	d0,a1
	move.l	a0,_BLIT_A2_BASE(a2)
	add.l	d0,a0
	move.l	#BLIT_PITCH1|BLIT_PIXEL32|BLIT_WID3584|BLIT_XADDPHR,d1
	move.l	d1,_BLIT_A1_FLAGS(a2)
	move.l	d1,_BLIT_A2_FLAGS(a2)
	moveq	#0,d1
	move.l	d1,_BLIT_A1_PIXEL(a2)
	move.l	d1,_BLIT_A2_PIXEL(a2)

	lsr.l	#2,d0
	bset	#16,d0
	move.l	d0,_BLIT_COUNT(a2)
	move.l	#BLIT_SRCEN|BLIT_LFU_REPLACE,d0
	move.l	d0,_BLIT_CMD(a2)
mc_wbl1:
	move.l	_BLIT_CMD(a2),d0
	btst	#0,d0
	beq.s	mc_wbl1
	tst.l	d2
	bne.s	mcp0
	rts


jag_end:
	BSS

	END
