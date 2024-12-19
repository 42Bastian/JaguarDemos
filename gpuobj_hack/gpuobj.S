	.68000

	.include "68k_inc/jaguar.inc"
	.include "68k_inc/blit_eq.inc"
	.include "68k_mac/help.mac"

****************
vars		= $0001000

max_x_txt	= 256
max_y_txt	= 3*8

max_x		= 320
max_y_gr	= 200

screen0		= $00160000
screen1		= $00190000
txt_screen	= $001c0000

ScreenMode	EQU RGB16|VIDEN|PWIDTH4|CSYNC
******************
* variables

	RSRESET
	RSB obl,256
	RSL obls,2
	RSL screen

	RSW a_vde
	RSW a_vdb
	RSW VI_count
	RSW swap_flag
	RSW gpu_flag
	RSW op_flag

	.include "68k_var/text_scr.var"
	RSL max_time
	RSL last_time
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

	lea	$f03000+$8000,a0
	move.l	#4096,d0
	bsr	memzero		; zero complete GPU ram

	lea	screen0,a0
	move.l	#$20000,d0
	bsr	memzero

	lea	screen1,a0
	move.l	#$20000,d0
	bsr	memzero

	lea	$f00400,a0
	moveq	#0,d0
.clut:	move.w	d0,(a0)+
	subq.b	#1,d0
	bne.s	.clut

	;; Setup Text screen
	move.w	#254,d0
	move.l	#$1000F7f0,d1
	lea	txt_screen,a0
	move.l	a0,TextScreen(a6)
	bsr	InitTxtScreen
;;;********************
;;; Video setup
	bsr	VideoInit
	bsr	InitOP
	move.w #ScreenMode,$f00028

	bsr	InitGPU

	move	#$2000,sr

;;; Initial text out
	clr.l	Cursor(a6)
	lea	Hallo(pc),a0
	bsr	PrintA0
	.globl again
again:
	moveq	#1,d1
	move.l	d1,Cursor(a6)
	move.w	VI_count(a6),d0
	bsr	PrintHEXl

	move.l	0.w,d0
	bsr	PrintHEXl

	bsr	StartGPU

	bsr	swap		; now show last frame and wait for VBL
	bra	again

******************
	.include "68k_inc/text_scr.inc"
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

	lea	$F03FF0,a0
	move.l	screen(a6),4(a0)

	move.l	#1,d0
	move.l	d0,$00F02114	; start GPU
	rts
******************
* StartGPU
StartGPU:
	lea	$F03FF0,a0
	move.l	screen(a6),4(a0)
	move.l	#$5,$f02114	; CPU->GPU interrupt
	moveq	#1,d7
waitGPU:
	stop	#$2000		; wait for VBL or GPU interrupt
	tst.l	d7		; GPU done? != 0 => no
	bne.s	waitGPU
	rts

	.phrase
	dc.l	0		; dummy to align code after BJL header
GPUcode:
	.incbin "tom.o"
*****************
*    CopyOBL	*
CopyOBL:
	move.w	op_flag(a6),d0
	add.w	#obls,d0
	move.l	(a6,d0.w),a1
	lea	obl(a6),a0
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
	move.l	#screen1,screen(a6)

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
	move.l	#$1F03<<16,INT1-_BASE(a2)
	lea	my_irq(pc),a0
	move.l	a0,$00000100.w
	rts
******************
* swap
swap:
	tst.w	swap_flag(a6)
	beq.s	done
	stop	#$2000		; swap pending, so wait
done:
	move.w	gpu_flag(a6),d1
	addq.w	#4,d1
	and.w	#4,d1
	move.w	d1,gpu_flag(a6)
	move.l	screens(pc,d1.w),screen(a6)
	subq.w	#1,swap_flag(a6)
	rts
******************
* IRQ
my_irq:
	movem.l d0-d2/a0-a1,-(sp)
	move.w	INT1,d2

	btst	#0,d2
	beq.s	no_vi

	clr.w	swap_flag(a6)
	addq.w	#1,VI_count(a6)
	bra.s	cont_irq
no_vi:
	moveq	#0,d7
cont_irq:
	lsl.w	#8,d2
	or.w	#C_VIDENA|C_GPUENA,d2
	swap	d2
	move.l	d2,INT1

	movem.l (sp)+,d0-d2/a0-a1
	rte

screens:	dc.l	screen1,screen0
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
******************
* text-data
	;;    0123456789012345678901234567890123456789
Hallo:	dc.b "Jaguar GPUOBJ interrupt demo            ",0

*****************
* Objekte

vde_pal		equ (PAL_VMID+PAL_HEIGHT)/2-1
vde_ntsc	equ (NTSC_VMID+NTSC_HEIGHT)/2-1

bpp		= 4
gr_phrase	= max_x/4
y_start_pal	= 29
y_start_ntsc	= 29

	.align 128
obl0:
obl1	equ obl0+128
	.objproc
	.org	vars
 branch VC < 25,_stop0
 branch VC > vde_pal,_stop0
 gpuobj 1
 branch	VC < vde_pal, _scr0
 gpuobj  $4000+obl1|$10000000
_stop0:
 stop
	.qphrase
_scr0:
//-> bitmap screen0,21,y_start_pal+max_y_txt+1,gr_phrase,gr_phrase,max_y_gr,bpp,0,TRANS RELEASE,0,1
 bitmap	txt_screen, 17,y_start_pal+40,(max_x_txt/64),(max_x_txt/64),max_y_txt, 0,127, NOTRANS RELEASE,0,1
 stop
	.68000
obl0_end:
	.align 128
_obl1:
	.objproc
	.org	vars
 branch VC < 25,_stop1
 branch VC > vde_pal,_stop1
 gpuobj 1
 branch	VC < vde_pal, _scr1
 gpuobj $4000+obl0|$10000000
_stop1:
 stop
	.qphrase
_scr1:
//-> bitmap screen1,21,y_start_pal+max_y_txt+1,gr_phrase,gr_phrase,max_y_gr,bpp,0,TRANS RELEASE,0,1
 bitmap	txt_screen, 17,y_start_pal+40,(max_x_txt/64),(max_x_txt/64),max_y_txt, 0,127, NOTRANS RELEASE,0,1
 stop

;; ======================================== 60Hz
	.68000
	.align 128
obl0_60hz:
obl1_60hz	equ obl0_60hz+128
	.objproc
	.org	vars
_obl0_60hz:
 branch VC < 25,_stop0_60hz
 branch VC > vde_ntsc,_stop0_60hz
 gpuobj 1
 branch	VC < vde_ntsc, _scr0_60hz
 gpuobj  $4000+obl1_60hz|$10000000
_stop0_60hz:
 stop
	.qphrase
_scr0_60hz:
//-> bitmap screen0,21,y_start_ntsc+max_y_txt+1,gr_phrase,gr_phrase,max_y_gr,bpp,0,TRANS RELEASE,0,1
 bitmap	txt_screen, 17,y_start_ntsc,(max_x_txt/64),(max_x_txt/64),max_y_txt, 0,127, NOTRANS RELEASE,0,1
 stop
	.68000
obl0_end_60hz:
	.align 128
_obl1_60hz:
	.objproc
	.org	vars
 branch VC < 25,_stop1_60hz
 branch VC > vde_ntsc,_stop1_60hz
 gpuobj 1
 branch	VC < vde_ntsc, _scr1_60hz
 gpuobj $4000+obl0_60hz|$10000000
_stop1_60hz:
 stop
	.qphrase
_scr1_60hz:
//-> bitmap screen1,21,y_start_ntsc+max_y_txt+1,gr_phrase,gr_phrase,max_y_gr,bpp,0,TRANS RELEASE,0,1
 bitmap	txt_screen, 17,y_start_ntsc,(max_x_txt/64),(max_x_txt/64),max_y_txt, 0,127, NOTRANS RELEASE,0,1
 stop
	.68000

jag_end:
	BSS

	print "obl0: ",/x _obl0_60hz
	print "_scr1: ",/x _scr1
	print "_obl1: ",/x _obl1
	END
