;; -*-asm-*-

LYXASS	EQU 1
	gpu

	include <js/symbols/jagregeq.js>
	include <js/symbols/blit_eq.js>
	include <js/macro/help.mac>
	include <js/macro/joypad1.mac>
	include <js/macro/module.mac>

	include "globalreg.h"
	include "video.h"

MOD		EQU 1
TIMING		EQU 0

* rez
max_y	equ max_y_gr

BLIT_WIDTH	equ BLIT_WID256

IRQ_STACK	equ $f03020

LastJoy		equ $80
x_save		equ $f03fe0-(max_y+1)*4
stacktop	equ x_save

	RSSET $f03000

	include <js/var/txtscr.var>

	MACRO WAITBLITTER
.\waitblit	load (blitter+$38),tmp0
	btst	#0,tmp0
	jr	z,.\waitblit
	nop
	ENDM

	run $4000
********************
* init
init:
	movei	#$f02100,r1
	moveta	r1,IRQ_FLAGADDR.a

	movei	#1<<14|%11111<<9,r0	; clear all ints, REGPAGE = 1
	store	r0,(r1)
	nop
	nop

	INITMODULE irq

	INITMODULE poly

	movei	#x_save,tmp0
	moveta	tmp0,x_save.a

	movei	#$f00400,clut
	movei	#IRQ_STACK,r0
	moveta	r0,IRQ_SP.a
	movei	#stacktop,SP
;;->	moveta	SP,SP.a

;;; ------------------------------
	nop
	include <js/inc/videoinit.inc>

	movei	#$f00028,r0
	movei	#ScreenMode,r1
	storew	r1,(r0)
	moveq	#0,r0
	store	r0,(clut)
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

	movei	#$20-8,r14
	movei	#LSP_module_music_data,r0
	store	r0,(r14)
	movei	#LSP_module_sound_bank,r0
	store	r0,(r14+4)

	moveq	#0,r0
	bset	#14,r0
	movei	#$f1a100,r14
	store	r0,(r14)
	movei	#$f1b000,r0
	store	r0,(r14+$10)	; PC
	moveq	#1,r0
	store	r0,(r14+$14)	; GO
 ENDIF
	;; Setup min/max X table
	movefa	x_save.a,tmp0
	movei	#max_y,tmp1
	movei	#max_x<<16|0,tmp2	; minX:maxX
.loop0
	subq	#1,tmp1
	store	tmp2,(tmp0)
	jr	nn,.loop0	; +1 as pivot
	addqt	#4,tmp0

	movei	#$f00400,tmp0
	movei	#16,tmp1
	movei	#palette,r2
.iclut
	loadw	(r2),r3
	addq	#2,r2
	subq	#1,tmp1
	storew	r3,(tmp0)
	jr	ne,.iclut
	addqt	#2,tmp0

	movei	#VID_PIT0,tmp1
	movei	#26590<<16|$ffff,tmp0
	store	tmp0,(tmp1)
	addq	#2,tmp1
	moveta	tmp1,VID_PIT.a

	nop
	movei	#254,r0
	movei	#$0040f740,r1
	movei	#txt_screen,r2
	movei	#ASCII,r3
	movei	#InitTxtScreen,r4
	BL	(r4)

	movei	#PrintString_YX,r5
	movei	#Hallo,r0
	moveq	#0,r1
	BL	(r5)

	movei	#ms,r0
	moveq	#2,r1
	shlq	#16,r1
	BL	(r5)

	movei	#scene,r0
	movei	#frame_table,r1
	movei	#$ff,r2
	move	r2,r3
	subq	#1,r3
	nop
.buildft
	store	r0,(r1)
	addq	#4,r1
.frame
	loadb	(r0),r4
	cmp	r2,r4
	jr	z,.done_bft
	cmp	r3,r4
	jr	z,.done_frame
	shlq	#28,r4
	shrq	#27,r4
	addq	#1,r0
	jr	.frame
	add	r4,r0
.done_frame
	moveq	#0,r4
	storeb	r4,(r0)
	jr	.buildft
	addq	#1,r0
.done_bft:
	subq	#4,r1
	moveq	#0,r0
	store	r0,(r1)

	movei	#screen0,r1
	moveta	r1,screen1.a
	movei	#screen1,r1
	moveta	r1,screen0.a

	movei	#$f14003,r0
	loadb	(r0),r0
	nop
	movei	#obl0,r10
	btst	#4,r0
	movei	#obl1,r11
	jr	eq,pal
	nop
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
	nop
.cpyobl:
	load	(r10),r3
	addqt	#4,r10
	subq	#1,r2
	store	r3,(r1)
	jr	pl,.cpyobl
	addqt	#4,r1

	movei	#$f00020,r0
	moveq	#$10,r1
	shlq	#16+8,r1
	store	r1,(r0)

	movefa	IRQ_FLAGADDR.a,r0
	movei	#1<<14|%11111<<9|%01000<<<4,r1
	store	r1,(r0)
	nop
	nop

	moveq	#0,r0
	moveta	r0,info_counter.a
	moveta	r0,info_index.a
	movei	#info_table,INFO_TABLE
	nop

;;->	movei	#poly,r0
;;->	jump	(r0)
;;->	nop
	MBL	poly

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

	include "poly.js"

	align 4
obl0:
	.ibytes "obl0_50.img"
obl1:
	.ibytes "obl1_50.img"

obl0_60hz:
	.ibytes "obl0_60.img"

obl1_60hz:
	.ibytes "obl1_60.img"

	IF MOD = 1
	align 8
DSP_start:
	ibytes "lsp_v15.lib"
DSP_end:
	.long
LSP_module_music_data:
	.ibytes "mod/desert2.lsmusic"

	.long
LSP_module_sound_bank:
	.ibytes "mod/desert2.lsbank"
	ENDIF

	align 4
ASCII::
	.ibytes <font/light8x8.fnt>

palette:
	dc.w $0000,$0842,$0904,$2082,$1906,$2106,$21c8,$4108
	dc.w $4908,$228b,$1b8f,$610d,$528f,$6311,$90d3,$ffff

	align 4
info_table:
	dc.l Optimize,info,LSPInfo,Leonard
	;;    0123456789012345678901234567890123456789
Hallo:	dc.b "    Nostalgic-O-Demo remix for Jaguar  ",0
info:	dc.b "        Written 2023 / 42Bastian       ",0
ms:	dc.b "  00ms 012345ms 012345ms 012345 frame  ",0

LSPInfo:
	dc.b "LSP by Ericde45 / MOD by laxity/kefrens",0
Leonard:
	dc.b "      Dataset by Leonard^Oxygene        ",0
Optimize:
	dc.b "       GPU and DSP only /  no 68K       ",0

	.long
scene:
	ibytes "SCENE_v1.dat"
	.long
scene_end:
	.align	4
	dc.l	0
frame_table:
	dc.l	0

	echo "FT:%Hframe_table"
