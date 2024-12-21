	.68000

	.include "68k_inc/jaguar.inc"
	.include "68k_inc/blit_eq.inc"
	.include "68k_mac/help.mac"

txt_screen	equ $1f0000
****************
vars		= $0001000

max_x_txt	= 576
max_y_txt	= (2*8)

ScreenMode	EQU CRY16|VIDEN|PWIDTH2|CSYNC
******************
* variables

	RSRESET
	RSB obl,256
	RSL obls,2
	RSL screen

	RSW a_vde
	RSW a_vdb
	RSW VI_count

	RSL StackBottom,200
	RSL stack,1

vars_len	= RSCOUNT
	IF vars_len > (100*1024)
	FAIL
	ENDIF
******************


init:	INCLUDE "68k_inc/startup.inc"
******************
* Main
	lea	vars,a6
	lea	stack(a6),sp

	move.l	a6,a0
	move.l	#vars_len,d0
	bsr	memzero

	lea	$f01800,a0
	move.l	#360*4,d0
	bsr	memzero

	lea	$f00800,a0
	move.l	#360*4,d0
	bsr	memzero

	lea	$f03000+$8000,a0
	move.l	#4096,d0
	bsr	memzero		; zero complete GPU ram

;;;********************
;;; Video setup
	bsr	VideoInit
	bsr	InitOP
	move.w #ScreenMode,$f00028

	move.l	#$ffff00ff,$f0002a
	bsr	InitGPU

	.globl again
again:
	stop	#$2700		; swap pending, so wait
	bra.s	again

******************
* InitGPU
InitGPU:
	lea	$00F02110,a2
	lea	GPUcode+4(pc),a0
	moveq	#0,d0
	move.l	d0,4(a2)	; GPU halt
	movea.l (a0)+,a1	; destination
	lea	$10(a1),a3	; skip 68k irq vector
	move.l	a3,(a2)		; set GPU PC
	move.l	(a0)+,d0	; Length in Bytes
	addq.l	#3,d0		; round up
	adda.l	#$8000,a1	; 32bit writes
	bsr	memcpy

	lea	$f03ff0,a0
	move.l	#pic1,(a0)+
	move.l	#pic2,(a0)+
	move.l	#pic3,(a0)+

	move.l	#1,d0
	move.l	d0,$00F02114	; start GPU
	rts

	.phrase
	dc.l	0		; dummy to align code after BJL header
GPUcode:
	.incbin "tom.o"
*****************
*    CopyOBL	*
CopyOBL:
	lea	obl(a6),a0
	lea	obl0(pc),a1
	moveq	#(obl0_end-obl0)/4-1,d0
co:
	move.l	(a1)+,(a0)+
	dbra	d0,co
	rts
*****************
*   videoinit	*
	.include "68k_inc/videoinit.inc"
*****************
*    InitOP	*
InitOP:
	lea	obls_50hz(pc),a0
	btst	#4,$00F14003
	beq.s	io_pal
	lea	obls_60hz(pc),a0
io_pal:
	movem.l	(a0),d0-d1
	movem.l	d0-d1,obls(a6)

	bsr	CopyOBL

	lea	$00F00000,a2
	moveq	#0,d0
	move.w	a_vde(a6),d0
	move.w	d0,d1
	bclr	#0,d1
	addq	#4,d0
	move.w d0,$4e(a2)

	lea	obl(a6),a0
	move.l	a0,d0
	swap	d0
	move.l	d0,OLP-_BASE(a2)
	rts

obls_50hz:	dc.l	obl0, obl1
obls_60hz:	dc.l	obl0_60hz, obl1_60hz

;;; memzero
;;; a0 - destination
;;; d0 - size
memzero:
	move.l	(sp)+,a2
	lea	A1_BASE,a1
	move.l	a0,(a1)
	move.l	#BLIT_PITCH1|BLIT_PIXEL32|BLIT_WID3584|BLIT_XADDPHR,_BLIT_A1_FLAGS(a1)
	lsr.l	#2,d0
	bset	#16,d0
	move.l	d0,_BLIT_COUNT(a1)
	moveq	#0,d0
	move.l	d0,_BLIT_A1_PIXEL(a1)
	move.l	d0,_BLIT_CMD(a1)
wbl1:
	move.l	_BLIT_CMD(a1),d0
	btst	#0,d0
	beq.s	wbl1
	pea	(a2)
	rts

;;; memcpy with blitter
;;; A0 -> A1, size D0
memcpy:
	lea	A1_BASE,a2
	move.l	a1,(a2)
	move.l	a0,_BLIT_A2_BASE(a2)
	move.l	#BLIT_PITCH1|BLIT_PIXEL32|BLIT_WID3584|BLIT_XADDPHR,d1
	move.l	d1,_BLIT_A1_FLAGS(a2)
	move.l	d1,_BLIT_A2_FLAGS(a2)
	moveq	#0,d1
	move.l	d1,_BLIT_A1_PIXEL(a2)
	move.l	d1,_BLIT_A2_PIXEL(a2)

	lsr.w	#2,d0
	bset	#16,d0
	move.l	d0,_BLIT_COUNT(a2)
	move.l	#BLIT_SRCEN|BLIT_LFU_REPLACE,d0
	move.l	d0,_BLIT_CMD(a2)
mc_wbl1:
	move.l	_BLIT_CMD(a2),d0
	btst	#0,d0
	beq.s	mc_wbl1
	rts
*****************
* Objekte

vde_pal		equ (PAL_VMID+PAL_HEIGHT)/2-1
vde_ntsc	equ (NTSC_VMID+NTSC_HEIGHT)/2-1

bpp		= 4

y_start_pal	= 33
y_start_ntsc	= 29

	.align 128
obl0:
obl1	equ obl0+128
	.objproc
	.org	vars
 branch VC < 60/2,_stop0
 branch	VC > (60+404)/2, _stop0
_gpu0:
 gpuobj 1
_stop0:
 stop
	.68000
obl0_end:

;; ======================================== 60Hz
	.68000
	.align 128
obl0_60hz:
obl1_60hz	equ obl0_60hz+128
	.objproc
	.org	vars
_obl0_60hz:
 branch VC < 60/2,_stop0_60hz
 branch VC > (60+408)/2,_stop0_60hz
 gpuobj 1
_stop0_60hz:
 stop
	.68000
obl0_end_60hz:
	.align 2048
	.68000
pic1:
	incbin "candle.cry"
pic2:
	incbin "bird.cry"
pic3:
	incbin "voyager2.cry"

	print "pic1:",/lx pic1
	print "pic2:",/lx pic2
	print "pic2:",/lx pic3
jag_end:
	BSS

	END
