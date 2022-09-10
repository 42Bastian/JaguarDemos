	.68000

	.include "68k_inc/jaguar.inc"
	.include "68k_inc/blit_eq.inc"
	.include "68k_mac/help.mac"
	.include "voxel.equ"
****************
vars		= $0001000

max_x_txt	= 320
max_y_txt	= 3*8

max_x		= rez_x
max_y_gr	= 200

txt_screen	= $000c0000
logo_screen	= txt_screen+(max_x_txt/8)*max_y_txt
parameter	= $f03ff0

ScreenMode	EQU CRY16|VIDEN|PWIDTH4|BGEN|CSYNC
******************
* variables

	RSRESET
	RSB obl,256
	RSL obls,2

	RSW a_vde
	RSW a_vdb
	RSW dummy
	.include "68k_var/text_scr.var"
	RSL StackBottom,200
	RSL stack,1

vars_len	= RSCOUNT
	IF vars_len > (100*1024)
	FAIL
	ENDIF
******************


init_68k:
	INCLUDE "68k_inc/startup.inc"
******************
* Main
	lea	vars,a6
	lea	stack(a6),sp
	lea	$f00000,a5

	move.l	a6,a0
	move.l	#vars_len,d0
	bsr	memzero

	lea	$f03000+$8000,a0
	move.l	#4096,d0
	bsr	memzero		; zero complete GPU ram

	lea	screen0,a0
	move.l	#$20000,d0
	bsr	memzero

	lea	map,a0
	move.l	#$100000,d0
	bsr	memzero

	lea	logo,a0
	lea	logo_screen,a1
	moveq	#8*9,d0
	bsr	memcpy

	;; Setup Text screen
	move.w	#254,d0
	move.l	#$1000F7F0,d1
	lea	txt_screen,a0
	move.l	a0,TextScreen(a6)
	bsr	InitTxtScreen

	;; Video setup
	bsr	VideoInit
	bsr	InitOP
	move.w #ScreenMode,$28(a5)

	bsr	InitGPU

	;; Initial text out
	clr.l	Cursor(a6)
	lea	Hallo(pc),a0
	bsr	PrintA0

	.globl again
again:
	stop	#$2000		; wait for GPU interrupt

	suba.l	a4,a4

	moveq	#2,d1
	move.l	d1,Cursor(a6)

	move.l	(a4)+,d0
	bsr	PrintDEZ2	; time

	addq.w	#1,Cursor(a6)
	move.l	(a4),d0
	clr.l	(a4)+
	bsr	PrintDEZ2	; VBLs per frame

	bsr.s	printVal
	bsr.s	printVal
	bsr.s	printVal
	bsr.s	printVal
	bsr.s	printVal

	bra.s	again
printVal:
	addq.w	#1,Cursor(a6)
	move.l	(a4)+,d0
	bra	PrintDEZ

******************
	.include "68k_inc/text_scr.inc"
******************
* InitGPU
InitGPU:
	lea	$00F02110,a4
	lea	GPUcode+4(pc),a0
	moveq	#0,d0
	move.l	d0,4(a4)	; GPU halt
	movea.l (a0)+,a1	; destination
	lea	$10(a1),a3	; skip 68k irq vector
	move.l	a3,(a4)		; set GPU PC
	move.l	(a0)+,d0	; Length in Bytes
	adda.l	#$8000,a1	; 32bit writes
	bsr	memcpy

	lea	parameter,a0
	movem.l	obls(a6),d0-d1
	moveq	#opl_size/8,d2
	movem.l	d0-d2,(a0)

	moveq.l	#1,d0
	move.l	d0,4(a4)	; start GPU
	rts

	.phrase
	dc.l	0		; dummy to align code after BJL header
GPUcode:
	.incbin "voxel.o"
*****************
*    CopyOBL	*
CopyOBL:
	move.l	obls(a6),a1
	lea	obl(a6),a0
	moveq	#(obl1-obl0)/4-1,d0
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

	bsr	CopyOBL		; initial copy

	moveq	#0,d0
	move.w	a_vde(a6),d0
	move.w	d0,d1
	bclr	#0,d1
	move.w  d0,$48(a5)            ;; vde
	addq	#4,d0
	move.w d0,$4e(a5)

	lea	obl(a6),a0
	move.l	a0,d0
	swap	d0
	move.l	d0,OLP-_BASE(a5)
	move.l	#$1F02<<16,INT1-_BASE(a5)
	lea	my_irq(pc),a0
	move.l	a0,$00000100.w
	rts
******************
* IRQ
my_irq:
	move.l	#$202<<16,INT1
	rte

obls_50hz:	dc.l	obl0, obl1
obls_60hz:	dc.l	obl0_60hz, obl1_60hz

;;; memzero
;;; a0 - destination
;;; d0 - size
memzero:
	move.l	(sp)+,a2	; get return address (zeroing stack!)
mz0:
	move.l	d0,d1
	cmp.l	#$20000,d0
	blo.s	mz1
	move.l	#$20000,d1
mz1:
	sub.l	d1,d0
	lea	A1_BASE,a1
	move.l	a0,(a1)
	adda.l	d1,a0
	move.l	#BLIT_PITCH1|BLIT_PIXEL32|BLIT_WID3584|BLIT_XADDPHR,_BLIT_A1_FLAGS(a1)
	lsr.l	#2,d1
	bset	#16,d1
	move.l	d1,_BLIT_COUNT(a1)
	moveq	#0,d1
	move.l	d1,_BLIT_A1_PIXEL(a1)
	move.l	d1,_BLIT_CMD(a1)
wbl1:
	move.l	_BLIT_CMD(a1),d1
	btst	#0,d1
	beq.s	wbl1
	tst.l	d0
	bne.s	mz0
	jmp	(a2)

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
Hallo:	dc.b "Jaguar Voxel Flight WIP 0.4    x-rez "
 IF max_x = 320
	dc.b "320"
 ENDIF
 IF max_x = 256
	dc.b "256"
 ENDIF
 IF max_x = 192
	dc.b "192"
 ENDIF
 IF max_x = 160
	dc.b "160"
 ENDIF
	;;    0123456789012345678901234567890123456789
	dc.b "A/C:Speed U/D:H L/R:Dir 0:Stop 1/3:z",0

	.phrase
logo:
	;;    0123456789ABCDEF0123456789ABCDEF
	dc.l %11111111111111111111111111111110,0
	dc.l %10000000000000000000000000000010,0
	dc.l %10110001101000010010001000100010,0
	dc.l %10101010001010101001010101010010,0
	dc.l %10110001001110001000000100010010,0
	dc.l %10101000100010010000001000100010,0
	dc.l %10110011000010111000011101110010,0
	dc.l %10000000000000000000000000000010,0
	dc.l %11111111111111111111111111111110,0

*****************
* Objekte

vde_pal		equ (PAL_VMID+PAL_HEIGHT)/2+1
vde_ntsc	equ (NTSC_VMID+NTSC_HEIGHT)/2+1

bpp		= 4
gr_phrase	= max_x/4
y_start_pal	= 29
y_start_ntsc	= 24

	.phrase
obl0:

	.objproc
	.org	vars
 branch VC < 25,_stop0
 branch VC > vde_pal,_stop0
 branch	VC = vde_pal-1, _gpu01
 nop
 IF max_x < 320
 scbitmap screen0,9,y_start_pal+max_y_txt,gr_phrase,gr_phrase,max_y_gr,320.0/max_x,1.0,0.5,bpp,0,NOTRANS RELEASE,0,1
 ELSE
 bitmap screen0,9,y_start_pal+max_y_txt,gr_phrase,gr_phrase,max_y_gr,bpp,0,NOTRANS RELEASE,0,1
 ENDIF
 bitmap	txt_screen, 9,y_start_pal,(max_x_txt/64),(max_x_txt/64),max_y_txt, 0,127, TRANS RELEASE,0,1
 bitmap	logo_screen, 10,y_start_pal+max_y_txt+max_y_gr-9,1,1,9, 0,127,TRANS  RELEASE,0,1
 jump	_stop0
_gpu01:
 gpuobj 1
_stop0:
 stop

	.68000
obl1:
	.objproc
	.org	vars
 branch VC < 25,_stop1
 branch VC > vde_pal,_stop1
 branch	VC = vde_pal-1, _gpu11
 nop
 IF max_x < 320
 scbitmap screen1,9,y_start_pal+max_y_txt,gr_phrase,gr_phrase,max_y_gr,320.0/max_x,1.0,0.5,bpp,0,NOTRANS RELEASE,0,1
 ELSE
 bitmap screen1,9,y_start_pal+max_y_txt,gr_phrase,gr_phrase,max_y_gr,bpp,0,NOTRANSS RELEASE,0,1
 ENDIF
 bitmap	txt_screen, 9,y_start_pal,(max_x_txt/64),(max_x_txt/64),max_y_txt, 0,127, TRANS RELEASE,0,1
 bitmap	logo_screen, 10,y_start_pal+max_y_txt+max_y_gr-9,1,1,9, 0,127, TRANS RELEASE,0,1
 jump	_stop0
_gpu11:
 gpuobj 0
_stop1:
 stop
;; ======================================== 60Hz
	.68000
	.dphrase
obl0_60hz:
	.objproc
	.org	vars
 branch VC < 25,_stop0_60hz
 branch VC > vde_ntsc,_stop0_60hz
 branch	VC = vde_ntsc-1, _gpu01_60hz
 nop
 IF max_x < 320
 scbitmap screen0,11,y_start_ntsc+max_y_txt,gr_phrase,gr_phrase,max_y_gr,320.0/max_x,1.0,0.5,bpp,0,NOTRANS RELEASE,0,1
 ELSE
 bitmap screen0,11,y_start_ntsc+max_y_txt,gr_phrase,gr_phrase,max_y_gr,bpp,0,NOTRANS RELEASE,0,1
 ENDIF
 bitmap	txt_screen, 11,y_start_ntsc,(max_x_txt/64),(max_x_txt/64),max_y_txt, 0,127, TRANS RELEASE,0,1
 bitmap	logo_screen, 12,y_start_ntsc+max_y_txt+max_y_gr-9,1,1,9, 0,127, TRANS RELEASE,0,1
 jump	_stop0_60hz
_gpu01_60hz:
 gpuobj 0
_stop0_60hz:
 stop

	.68000
obl1_60hz:
	.objproc
	.org	vars
 branch VC < 25,_stop1_60hz
 branch VC > vde_ntsc,_stop1_60hz
 branch	VC = vde_ntsc-1, _gpu11_60hz
 nop
 IF max_x < 320
 scbitmap screen1,11,y_start_ntsc+max_y_txt,gr_phrase,gr_phrase,max_y_gr,320.0/max_x,1.0,0.5,bpp,0,NOTRANS RELEASE,0,1
 ELSE
 bitmap screen1,11,y_start_ntsc+max_y_txt,gr_phrase,gr_phrase,max_y_gr,bpp,0,NOTRANS RELEASE,0,1
 ENDIF
 bitmap	txt_screen, 11,y_start_ntsc,(max_x_txt/64),(max_x_txt/64),max_y_txt, 0,127, TRANS RELEASE,0,1
 bitmap	logo_screen, 12,y_start_ntsc+max_y_txt+max_y_gr-9,1,1,9, 0,127,TRANS  RELEASE,0,1
 jump	_stop1_60hz
_gpu11_60hz:
 gpuobj 1
_stop1_60hz:
 stop
	.68000
	.phrase
_end_60hz:

opl_size	= _end_60hz-obl1_60hz

	print "OPL (phrases) ",/u opl_size/8

jag_end:
	BSS

	END
