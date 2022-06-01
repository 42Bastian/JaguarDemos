	.68000

	.include "68k_inc/jaguar.inc"
	.include "68k_inc/blit_eq.inc"
	.include "68k_mac/help.mac"

ScreenMode	EQU RGB16|VIDEN|PWIDTH3|BGEN|CSYNC
****************
MOD	= 1
SC_BITMAPS	= 0
vars		= $0001000

max_x_txt	= 320
max_y_txt	= 3*8

max_x		= 256
max_y_gr	= 200

screen1		= $00180000
screen2		= $001a0000
txt_screen	= $001c0000


; real hardware needs lower sample frequencies than emulators
LSP_DSP_Audio_frequence .equ 24000
nb_bits_virgule_offset  .equ   11  ; 11 ok DRAM/ 8 avec samples en ram DSP
DSP_DEBUG               .equ    0
I2S_during_Timer1       .equ    0  ; 0= I2S waits while timer 1 / 1=IMASK cleared while Timer 1
LSP_avancer_module      .equ    1  ; 1=incremente position dans le module

channel_1        .equ        1
channel_2        .equ        1
channel_3        .equ        1
channel_4        .equ        1

******************
* variables

	RSRESET
	RSP obl,24
	.include "68k_var/text_scr.var"

	RSL obl_update,4
	RSL obl_orig
	RSL screen

	RSW a_vde
	RSW a_vdb
	RSW VI_count
	RSW swap_flag
	RSW flag
	RSB infoCounter
	RSB infoType

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
	bsr	memzero

	IF ^^defined MOD
	lea	D_RAM,a0
	move.l	#8192,d0
	bsr	memzero

	lea	YM_DSP_debut(pc),A0
	lea	D_RAM,A1
	move.l	#(YM_DSP_fin-DSP_base_memoire),d0
	bsr	memcpy

	; init LSP
	lea	LSP_module_music_data,a0
	lea	LSP_module_sound_bank,a1
	bsr	LSP_PlayerInit
	ENDIF

	;; Setup Text screen
	move.w	#254,d0
	move.l	#$1000F740,d1
	lea	txt_screen,a0
	move.l	a0,TextScreen(a6)
	bsr	InitTxtScreen
;;;********************
;;; Video setup
	bsr	VideoInit
	bsr	InitOP
	move.w #ScreenMode,$f00028

	bsr	InitGPU


	IF ^^defined MOD
	move.l    #REGPAGE,D_FLAGS
	move.l    #DSP_routine_init_DSP,D_PC
	move.l    #DSPGO,D_CTRL
	ENDIF

;;; Initial text out
	clr.l	Cursor(a6)
	lea	Hallo(pc),a0
	bsr	PrintA0

	lea	info(pc),a0
	bsr	PrintA0

	lea	ms(pc),a0
	bsr	PrintA0

wait_sync:
	stop	#$2000
	cmp.w	#20,VI_count(a6)
	bne.s	wait_sync

	move.b	#80,infoCounter(a6)
restart:
	move.l	#26590<<16|$ffff,PIT0	 ; 1/1000s-Timer
again:
	move.w	PIT1,d0
	bsr	StartGPU
	sub.w	PIT1,d0
	bsr	swap		; now show last frame and wait for VBL

	add.l	d0,last_time(a6)

	moveq	#2,d1
	move.l	d1,Cursor(a6)
	bsr	PrintDEZ2
	addq.w	#3,Cursor(a6)

	move.l	last_time(a6),d0
	bsr	PrintDEZ
	addq.w	#3,Cursor(a6)

	move.w	#-1,d0
	sub.w	PIT1,d0
	bsr	PrintDEZ
	addq.w	#3,Cursor(a6)

	move.l	$10.w,d0
	tst.l	d0
	bne.s	no_reset
final:
	stop	#$2000
	bsr	updateInfo
	IF ^^defined MOD
	move.l	DSP_pad1,d0
	beq.s	final
	ENDIF

	clr.l	last_time(a6)
	bra.s	restart

no_reset:
	bsr	PrintDEZ

	bsr	updateInfo
	bra	again

updateInfo:
	subq.b	#1,infoCounter(a6)
	bne.s	ui_exit

	lea	LSPInfo(pc),a0
	subq.b	#1,infoType(a6)
	beq.s	_lsp
	lea	Leonard(pc),a0
	bpl.s	_lsp
	addq.b	#3,infoType(a6)
	lea	info(pc),a0
_lsp:
	move.l	#1,Cursor(a6)
	bsr	PrintA0
	move.b	#200,infoCounter(a6)
ui_exit:
	rts
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
	move.l	a1,(a2)
	move.l	(a0)+,d0	; Length in Bytes
	adda.l	#$8000,a1
	bsr	memcpy

	lea	$F03FF0,a1
	lea	scene,a2
	move.l	a2,8(a1)

	moveq.l	#1,d0
	move.l	d0,$00F02114
	rts
******************
* StartGPU
StartGPU:
	lea	$F03FF0,a0
	move.l	screen(a6),4(a0)
	lea     scene,a1
	move.l  a1,8(a0)
	clr.l	(a0)
waitGPU:
	stop	#$2000		; wait for VBL or GPU interrupt
	tst.l	(a0)		; GPU done? no =>
	beq.s	waitGPU
	rts

	.phrase
	dc.l	0		; dummy
GPUcode:
	.incbin "poly.o"
*****************
*    CopyOBL	*
CopyOBL:
	move.l	obl_orig(a6),a1
	lea	obl(a6),a0
	move.w	#(obl1-obl0)/4-1,d0
cob:
	move.l	(a1)+,(a0)+
	dbra	d0,cob
	rts
*****************
*   videoinit	*
	.include "68k_inc/videoinit.inc"
*****************
*    InitOP	*
InitOP:
//->	move.w	#3<<6,$f00058
	lea	obl0(pc),a0
	lea	screen2,a1
	lea	obl1(pc),a2
	lea	screen1,a3
	btst	#4,$00F14003
	beq.s	io_pal

//->	move.w	#$7,$f00058
	lea	obl0_60hz(pc),a0
	lea	obl1_60hz(pc),a2
io_pal:
	movem.l	a0-a3,obl_update(a6)

	movem.l	a0-a1,obl_orig(a6)

	bsr	CopyOBL

	lea	$00F00000,a2
	moveq	#0,d0
	move.w	a_vde(a6),d0
	move.w	d0,d1
	bclr	#0,d1
	move.w  d0,$48(a2)            ;; vde
	addq	#4,d0
	move.w d0,$4e(a2)

	lea	obl(a6),a0
	move.l	a0,d0
	swap	d0
	move.l	d0,$0020(a2)	 ; OPL = $10000
	move.l	#$1F03<<16,INT1-_BASE(a2)
	lea	my_irq(pc),a0
	move.l	a0,$00000100.w
	rts
*****************
* Objekte

vde_pal		equ (PAL_VMID+PAL_HEIGHT)/2+1
vde_ntsc	equ (NTSC_VMID+NTSC_HEIGHT)/2+1

bpp		= 3
gr_phrase	= max_x/8
y_start_pal	= 29
y_start_ntsc	= 24

obl0:
	.objproc
	.org	vars
 branch VC < 25,_stop0
 branch VC > vde_pal,_stop0
 bitmap screen1,9+32,y_start_pal+max_y_txt+1,gr_phrase,gr_phrase,max_y_gr,bpp,0,NOTRANS RELEASE,0,1
 IF ^^defined SC_BITMAPS
 scbitmap screen1,9+32+257,y_start_pal+max_y_txt+1,gr_phrase,gr_phrase,max_y_gr,0.5,0.5,0.5,bpp,0,NOTRANS RELEASE,0,1
 scbitmap screen1,9+32+257+63,y_start_pal+max_y_txt+1+101,gr_phrase,gr_phrase,max_y_gr,0.25,0.25,0.25,bpp,0,NOTRANS REFLECT RELEASE,0,1
 scbitmap screen1,9+32+257+65,y_start_pal+max_y_txt+1+101,gr_phrase,gr_phrase,max_y_gr,0.125,0.125,0.125,bpp,0,NOTRANS RELEASE,0,1
 scbitmap screen1,9+32+257+65+33,y_start_pal+max_y_txt+1+101,gr_phrase,gr_phrase,max_y_gr,0.0625,0.0625,0.0625,bpp,0,NOTRANS RELEASE,0,1
 ENDIF
 bitmap	txt_screen, 9+80,y_start_pal,(max_x_txt/64),(max_x_txt/64),max_y_txt, 0,127, TRANS RELEASE,0,1
_stop0:
 stop
	.68000
obl1:
	.objproc
	.org	vars
 branch VC < 25,_stop1
 branch VC > vde_pal,_stop1
 bitmap screen2,9+32,y_start_pal+max_y_txt+1,gr_phrase,gr_phrase,max_y_gr,bpp,0,NOTRANS RELEASE,0,1
 IF ^^defined SC_BITMAPS
 scbitmap screen2,9+32+257,y_start_pal+max_y_txt+1,gr_phrase,gr_phrase,max_y_gr,0.5,0.5,0.5,bpp,0,NOTRANS RELEASE,0,1
 scbitmap screen2,9+32+257+63,y_start_pal+max_y_txt+1+101,gr_phrase,gr_phrase,max_y_gr,0.25,0.25,0.25,bpp,0,NOTRANS REFLECT RELEASE,0,1
 scbitmap screen2,9+32+257+65,y_start_pal+max_y_txt+1+101,gr_phrase,gr_phrase,max_y_gr,0.125,0.125,0.125,bpp,0,NOTRANS RELEASE,0,1
 scbitmap screen2,9+32+257+65+33,y_start_pal+max_y_txt+1+101,gr_phrase,gr_phrase,max_y_gr,0.0625,0.0625,0.0625,bpp,0,NOTRANS RELEASE,0,1
 ENDIF
 bitmap	txt_screen, 9+80,y_start_pal,(max_x_txt/64),(max_x_txt/64),max_y_txt, 0,127, TRANS RELEASE,0,1
_stop1:
 stop
	.68000
obl0_60hz:
	.objproc
	.org	vars
 branch VC < 25,_stop0_60hz
 branch VC > vde_ntsc,_stop0_60hz
 bitmap screen1,11+32,y_start_ntsc+max_y_txt+1,gr_phrase,gr_phrase,max_y_gr,bpp,0,NOTRANS RELEASE,0,1
 IF ^^defined SC_BITMAPS
 scbitmap screen1,11+32+257,y_start_ntsc+max_y_txt+1,gr_phrase,gr_phrase,max_y_gr,0.5,0.5,0.5,bpp,0,NOTRANS RELEASE,0,1
 scbitmap screen1,11+32+257+63,y_start_ntsc+max_y_txt+1+101,gr_phrase,gr_phrase,max_y_gr,0.25,0.25,0.25,bpp,0,NOTRANS REFLECT RELEASE,0,1
 scbitmap screen1,11+32+257+65,y_start_ntsc+max_y_txt+1+101,gr_phrase,gr_phrase,max_y_gr,0.125,0.125,0.125,bpp,0,NOTRANS RELEASE,0,1
 scbitmap screen1,11+32+257+65+33,y_start_ntsc+max_y_txt+1+101,gr_phrase,gr_phrase,max_y_gr,0.0625,0.0625,0.0625,bpp,0,NOTRANS RELEASE,0,1
 ENDIF
 bitmap	txt_screen, 11+80,y_start_ntsc,(max_x_txt/64),(max_x_txt/64),max_y_txt, 0,127, TRANS RELEASE,0,1
_stop0_60hz:
 stop
	.68000
obl1_60hz:
	.objproc
	.org	vars
 branch VC < 25,_stop1_60hz
 branch VC > vde_ntsc,_stop1_60hz
 bitmap screen2,11+32,y_start_ntsc+max_y_txt+1,gr_phrase,gr_phrase,max_y_gr,bpp,0,NOTRANS RELEASE,0,1
 IF ^^defined  SC_BITMAPS
 scbitmap screen2,11+32+257,y_start_ntsc+max_y_txt+1,gr_phrase,gr_phrase,max_y_gr,0.5,0.5,0.5,bpp,0,NOTRANS,0,1
 scbitmap screen2,11+32+257+63,y_start_ntsc+max_y_txt+1+101,gr_phrase,gr_phrase,max_y_gr,0.25,0.25,0.25,bpp,0,NOTRANS REFLECT,0,1
 scbitmap screen2,11+32+257+65,y_start_ntsc+max_y_txt+1+101,gr_phrase,gr_phrase,max_y_gr,0.125,0.125,0.125,bpp,0,NOTRANS,0,1
 scbitmap screen2,11+32+257+65+33,y_start_ntsc+max_y_txt+1+101,gr_phrase,gr_phrase,max_y_gr,0.0625,0.0625,0.0625,bpp,0,NOTRANS RELEASE,0,1
 ENDIF
 bitmap	txt_screen, 11+80,y_start_ntsc,(max_x_txt/64),(max_x_txt/64),max_y_txt, 0,127, TRANS RELEASE,0,1
_stop1_60hz:
 stop
	.68000
******************
* swap
swap:
	subq.w	#1,swap_flag(a6)
	stop	#$2000
	rts
******************
* IRQ
my_irq:	movem.l d0-d2/a0-a1,-(sp)
	move.w	INT1,d2
	btst	#0,d2
	beq.s	no_vi

	addq.w	#1,VI_count(a6)

	tst.w	swap_flag(a6)
	beq.s	no_swap

	lea	obl_update(a6),a0
	not.w	flag(a6)
	beq.s	mi1
	addq.l	#8,a0
mi1:
	movem.l	(a0),d0-d1
	move.l	d0,obl_orig(a6)
	move.l	d1,screen(a6)
	clr.w	swap_flag(a6)
no_swap:
	bsr	CopyOBL
no_vi:

cont_irq:
	lsl.w	#8,d2
	or.w	#C_VIDENA|C_GPUENA,d2
	swap	d2
	move.l	d2,INT1
	movem.l (sp)+,d0-d2/a0-a1
	rte

	IF ^^defined MOD
	include "lsp.S"
	ENDIF

;;; memzer
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
Hallo:	dc.b "(2nd) STNICCC 2000 port for Jaguar      ",0
info:	dc.b "Written at Outline 2022 / 42Bastian     ",0
ms:	dc.b "00ms 12345ms 12345ms 12345 frame(s)",0
LSPInfo:
	dc.b "   LSP by Ericde45 / MOD by Front6     ",0
Leonard:
	dc.b "     Dataset by Leonard^Oxygene        ",0

	.phrase
scene:
	include "scene.S"
	dc.w	-1
	.long
scene_end:

	IF ^^defined MOD
	.long
LSP_module_music_data:
	.incbin "trance_adventure.lsmusic"

	.long
LSP_module_sound_bank:
	.incbin "trance_adventure.lsbank"
	ENDIF

jag_end:
	BSS

	END
