;; -*-asm-*-

LYXASS	EQU 1
GPU	EQU 1

	gpu

 IFND MOD
MOD		EQU 1
 ENDIF
 IFND LOCK_VBL
LOCK_VBL	EQU 0
 ENDIF

	include <js/symbols/jagregeq.js>
	include <js/symbols/blit_eq.js>
	include <js/macro/help.mac>
	include <js/macro/joypad1.mac>
	include <js/macro/module.mac>
	include <js/symbols/joypad.js>

	UNREG	LR
	include "globalreg.h"
	include "video.h"
	include "hively.inc"

 IF rez_x = 320
BLIT_WID	EQU BLIT_WID320
 ENDIF

 IF rez_x = 256
BLIT_WID	EQU BLIT_WID256
 ENDIF

 IF rez_x = 192
BLIT_WID	EQU BLIT_WID192
 ENDIF

 IF rez_x = 160
BLIT_WID	EQU BLIT_WID160
 ENDIF


LastJoy		equ $f03ff8
stacktop	equ LastJoy-8

IRQ_STACK	equ $f03020

	RSSET $3000

	include <js/var/txtscr.var>
	RSL sintab,256

	MACRO WAITBLITTER
.\waitblit	load (blitter+$38),tmp0
	btst	#0,tmp0
	jr	z,.\waitblit
	nop
	ENDM

	MACRO	BRK
.\x	jr	.\x
	nop
	ENDM

	run $4008
********************
* init
init:
	movei	#$f02100,IRQ_FLAGADDR.a
	moveta	IRQ_FLAGADDR.a,IRQ_FLAGADDR.a
	movei	#(1<<14)|(%11111<<9),r0	; clear all ints, REGPAGE = 1
	store	r0,(IRQ_FLAGADDR.a)
	nop
	nop

	INITMODULE irq

	movei	#IRQ_STACK,r0
	moveta	r0,IRQ_SP.a
	movei	#stacktop,SP
;;->	moveta	SP,SP.a
	nop
;;; ------------------------------
	include <js/inc/videoinit.inc>

	movei	#$f00028,r0
	movei	#ScreenMode,r1
	storew	r1,(r0)

;;; init CLUT
clut	reg	99
clut2	reg	99

	movei	#$f00400,clut
	moveq	#0,tmp1
	storew	tmp1,(clut)
	addqt	#2,clut
	movei	#$8840,tmp1
	storew	tmp1,(clut)	; sky
	movei	#$f860,tmp1
	addqt	#2,clut
	storew	tmp1,(clut)	; floor

	movei	#wall_colors,tmp0
	movei	#$f00400+$40*2,clut
	movei	#$f00400+$50*2,clut2
	moveq	#16,tmp1
.iclut0:
	loadw	(tmp0),tmp2
	addqt	#2,tmp0
	storew	tmp2,(clut)
	bclr	#7,tmp2
	addqt	#2,clut
	subq	#1,tmp1
	storew	tmp2,(clut2)
	jr	ne,.iclut0
	addqt	#2,clut2

;;; Phobyx texture
	movei	#$f00400+32*2,clut
	movei	#phobyx_128x128_palette,r2
	loadw	(r2),tmp1
	nop
.iclut1:
	addqt	#2,r2
	loadw	(r2),r3
	subq	#1,tmp1
	storew	r3,(clut)
	jr	ne,.iclut1
	addqt	#2,clut

;;; Mandel
	movei	#$f00400+16*2,clut
	moveq	#16,tmp1
	movei	#$f000,tmp2
.iclut2:
	storew	tmp2,(clut)
	subq	#1,tmp1
	addqt	#16,tmp2
	jr	ne,.iclut2
	addqt	#2,clut

;;; wall1
	movei	#$f00400+112*2,clut
	movei	#w3d_wall1_palette,r2
	loadw	(r2),tmp1
	nop
.iclut3:
	addqt	#2,r2
	loadw	(r2),r3
	subq	#1,tmp1
	storew	r3,(clut)
	jr	ne,.iclut3
	addqt	#2,clut
;;; wall2
	movei	#$f00400+80*2,clut
	movei	#w3d_wall2_palette,r2
	loadw	(r2),tmp1
	nop
.iclut4:
	addqt	#2,r2
	loadw	(r2),r3
	subq	#1,tmp1
	storew	r3,(clut)
	jr	ne,.iclut4
	addqt	#2,clut
;;; door
	movei	#$f00400+134*2,clut
	movei	#door1_palette,r2
	loadw	(r2),tmp1
	nop
.iclut5:
	addqt	#2,r2
	loadw	(r2),r3
	subq	#1,tmp1
	storew	r3,(clut)
	jr	ne,.iclut5
	addqt	#2,clut

	UNREG	clut,clut2
;;; ------------------------------
 IF  MOD = 1
	movei	#DSP_start,r0
	movei	#DSP_RAM,r1
	movei	#(DSP_end-DSP_start),r2
	nop
cpy_dsp:
	load	(r0),r3
	addq	#4,r0
	subq	#4,r2
	store	r3,(r1)
	jr	pl,cpy_dsp
	addq	#4,r1

	movei	#DSP_flag_replay_ON_OFF,r14
	movei	#song,r0
	store	r0,(r14+16)
	movei	#$100,r0
	store	r0,(r14+12)
	movei	#binPrecalcTable,r0
	store	r0,(r14+8)
	movei	#panning_table,r0
	store	r0,(r14+4)
	moveq	#0,r0
	store	r0,(r14)
	nop
 ENDIF

;;; ----------------------------------------
;;; Stretch DSP sine table to 256 entries
;;;
	movei	#$f1d200,r0
	movei	#127,r1
	moveq	#0,r2
	movei	#sintab,r15
	move	r15,r3
	store	r2,(r15)
	addq	#4,r15
cpy_sin:
	load	(r0),r4
	add	r4,r2
	sharq	#15-FP_BITS+1,r2
	store	r2,(r15)
	move	r4,r2
	sharq	#15-FP_BITS,r4
	store	r4,(r15+4)
	subq	#1,r1
	addqt	#8,r15
	jr	pl,cpy_sin
	addq	#4,r0
	move	r3,r15

	nop
	INITMODULE mandel
	MBL	mandel

;;; Init PIT for time measurement
	movei	#VID_PIT0,tmp1
	movei	#26590<<16|$ffff,tmp0
	store	tmp0,(tmp1)
	addq	#2,tmp1
	moveta	tmp1,VID_PIT.a

;;; Copy logo to object
	movei	#logo,tmp0
	movei	#logo_screen,tmp1
	moveq	#9,tmp2
.cpy_logo:
	loadp	(tmp0),tmp3
	addq	#8,tmp0
	subq	#1,tmp2
	storep	tmp3,(tmp1)
	jr	pl,.cpy_logo
	addqt	#8,tmp1

	movei	#$f02200,blitter

	movei	#screen0,r0
	moveta	r0,screen0.a

	store	r0,(blitter)
	movei	#BLIT_PITCH1|BLIT_PIXEL32|BLIT_WID3584|BLIT_XADDPHR,tmp0
	store	tmp0,(blitter+_BLIT_A1_FLAGS)
	xor	tmp0,tmp0
	movei	#1<<16|((rez_x*rez_y)>>2),tmp1
	store	tmp0,(blitter+_BLIT_A1_PIXEL)
	store	tmp1,(blitter+_BLIT_COUNT)
	store	tmp0,(blitter+_BLIT_CMD)
	nop
	WAITBLITTER	; done later down the road

	movei	#screen1,r0
	moveta	r0,screen1.a

	store	r0,(blitter)
	movei	#BLIT_PITCH1|BLIT_PIXEL32|BLIT_WID3584|BLIT_XADDPHR,tmp0
	store	tmp0,(blitter+_BLIT_A1_FLAGS)
	xor	tmp0,tmp0
	movei	#1<<16|((rez_x*rez_y)>>2),tmp1
	store	tmp0,(blitter+_BLIT_A1_PIXEL)
	store	tmp1,(blitter+_BLIT_COUNT)
	store	tmp0,(blitter+_BLIT_CMD)
	WAITBLITTER	; done later down the road

	INITMODULE main

	movei	#254,r0
	movei	#$1003f2F0,r1
	movei	#txt_screen,r2
	movei	#ASCII,r3
	movei	#InitTxtScreen,r4
	BL	(r4)

	movei	#PrintString_YX,r5
	movei	#Hallo,r0
	moveq	#0,r1
	BL	(r5)

	nop
	movei	#PrintString_YX,r5
	movei	#info,r0
	moveq	#0,r1
	bset	#16,r1
	BL	(r5)

	movei	#ms,r0
	moveq	#2,r1
	shlq	#16,r1
	BL	(r5)

	nop
	movei	#$f14003,r0
	loadb	(r0),r0
	movei	#obl0,r10
	btst	#4,r0
	movei	#obl1,r11
	jr	eq,pal
	nop
	movei	#$100377F0,r1
	movei	#$f00400+254*2,r0
	store	r1,(r0)
	movei	#obl0_60hz,r10
	movei	#obl1_60hz,r11
pal:
	move	r10,r1
	addq	#32,r1
	addq	#32,r1
	moveta	r1,obl0.a
	addq	#32,r11
	addq	#32,r11
	moveta	r11,obl1.a

	moveq	#$10,r1
	shlq	#8,r1
	moveq	#31,r2
	shlq	#1,r2
.cpyobl:
	loadp	(r10),r3
	addqt	#8,r10
	subq	#2,r2
	storep	r3,(r1)
	jr	pl,.cpyobl
	addqt	#8,r1

	movei	#$f00020,r0
	moveq	#$10,r1
	shlq	#16+8,r1
	store	r1,(r0)

 IF MOD = 1
	moveq	#0,r0
	bset	#14,r0
	movei	#$f1a100,r1
	store	r0,(r1)
	movei	#$f1b000,r0
	addq	#16,r1
	store	r0,(r1)	; PC
	addq	#4,r1
	moveq	#1,r0
	store	r0,(r1)	; GO
 ENDIF

	movefa	IRQ_FLAGADDR.a,r0
	movei	#1<<14|%11111<<9|%01000<<4,r1
	store	r1,(r0)
	nop
	nop

	nop
	MBL	main

;;; ----------------------------------------
;;; Read pad1
;;;

	UNREG tmp0,tmp1,tmp2,tmp3
joypad::
	JOYPAD1
	movei	#LastJoy,r0
	nop
	jump	(LR)
	load	(r0),r0

tmp3	reg 3
tmp2	reg 2
tmp1	reg 1
tmp0	reg 0

;;; ----------------------------------------
;;; Interrupt module
	include "irq.inc"

;;; ----------------------------------------
;;; main module
	include "rc_main.js"

;;; ----------------------------------------
;;; Mandelbrot texture
	include "mandel.inc"
;;; ----------------------------------------
;;; Object lists (still needs rmac)

	align 8
obl0:
	.ibytes "obl0_50.img"
obl1:
	.ibytes "obl1_50.img"

obl0_60hz:
	.ibytes "obl0_60.img"

obl1_60hz:
	.ibytes "obl1_60.img"

;;; ----------------------------------------
	align 4
ASCII::
	.ibytes <font/light8x8.fnt>

info_table:
	dc.l Optimize,info,LSPInfo
	;;    0123456789012345678901234567890123456789
Hallo:	dc.b "       Raycasting Demo for Jaguar       ",0
info:	dc.b "Written 2024 / 42Bastian       "
 IF HORIZONTAL_SCAN = 1
	dc.b "hor "
 ELSE
	dc.b "ver "
 ENDIF
 IF rez_x = 320
	dc.b "320"
 ENDIF
 IF rez_x = 256
	dc.b "256"
 ENDIF
 IF rez_x = 192
	dc.b "192"
 ENDIF
 IF rez_x = 160
	dc.b "160"
 ENDIF
	dc.b 0
ms:	dc.b "01ms  X:00 Y:00 A:00                    ",0

LSPInfo:
	dc.b "HVL player by Ericde45 / HVL : gone    ",0
Optimize:
	dc.b "       GPU and DSP only /  no 68K       ",0

	.phrase
logo:
	;;    0123456789ABCDEF0123456789ABCDEF
	dc.l %11111111111111111111111111111110,0
	dc.l %10000000000000000000000000000010,0
	dc.l %10110001101000010010001001000010,0
	dc.l %10101010001010101001010101010010,0
	dc.l %10110001001110001000000101110010,0
	dc.l %10101000100010010000001000010010,0
	dc.l %10110011000010111000011100010010,0
	dc.l %10000000000000000000000000000010,0
	dc.l %11111111111111111111111111111110,0

;;; ----------------------------------------

	align 16
	include "world.inc"
	echo "World: %hworldMap"
;;; ----------------------------------------
;;; color
	long
wall_colors:
	dc.w	$8fff,$80ff,$7fff,$40ff,$34ff,$10ff,$1fff,$3fff
	dc.w	$ffff,$77ff,$f8ff,$08ff,$F2ff,$11ff,$88ff,$70ff

;;; ----------------------------------------
;;; Texture(s)

	include "phobyx_128x128.inc"
	include "w3d_wall1.inc"
	include "w3d_wall2.inc"
	include "door1.inc"

;;; ----------------------------------------
	phrase
	IF MOD = 1
DSP_start:
	ibytes "hively_player.bin"
DSP_end:
	long
song:
        .incbin "mod/gone.ahx.streambits"
	long
binPrecalcTable:
	ibytes "AHX_FilterPrecalc.bin"
	long
panning_table:
	ibytes "AHX_panning.bin"
	ENDIF
