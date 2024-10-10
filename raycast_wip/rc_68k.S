	.68000

	.include "68k_inc/jaguar.inc"
	.include "68k_inc/blit_eq.inc"
	.include "68k_mac/help.mac"

start:
	jmp	init

	.phrase
GPUcode:
	.incbin "rc.o"
	.phrase
init:
	lea	start,a0
	cmpa.l	#$4000,a0
	beq.s	cof_boot
	lea	GPUcode,a0
	movea.w	#$4008,a1
	move.l	#(init-GPUcode),d0
	bsr	memcpy

cof_boot:
	lea	$00F02110,a4
	move.w	#$4008,a0
	moveq	#0,d0
	move.l	d0,4(a4)	; GPU halt
	move.l	d0,$c(a4)	; divide control
	move.l	a0,(a4)		; set GPU PC

	moveq.l	#1,d0
	move.l	d0,4(a4)	; start GPU

endless:
	stop	#$2700		; wait for GPU interrupt
	bra.s	endless

;;; memcpy with blitter
;;; A0 -> A1, size D0
memcpy:
	move.l	d0,d2
mcp0:
	cmp.l	#$20000,d2
	bls.s	mcp1
	move.l	#$20000,d0
mcp1:
	sub.l	d0,d2
	lea	A1_BASE,a2
	move.l	a1,(a2)
	move.l	a0,_BLIT_A2_BASE(a2)
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
