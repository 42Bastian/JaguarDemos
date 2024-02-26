;-*-asm-*-

	gpu

	include <js/macro/help.mac>
	include <js/macro/joypad1.mac>
	include <js/macro/module.mac>
	include <js/symbols/blit_eq.js>
	include <js/symbols/jagregeq.js>

	include "canvas.h"
	include "globalreg.h"

MOD	EQU 1

ScreenMode	EQU CRY16|VIDEN|PWIDTH4|BGEN|CSYNC

	run $6020
;;->	run $802020

	movei	#$f02100,IRQ_FLAGADDR
	moveta	IRQ_FLAGADDR,IRQ_FLAGADDR.a

	movei	#1<<14|%11111<<9,r0	; clear all ints, REGPAGE = 1
	store	r0,(IRQ_FLAGADDR)
	nop
	nop

	INITMODULE irq
	INITMODULE main

	movei	#ScreenMode,r0
	movei	#$f00028,r1
	storew	r0,(r1)

	movei	#IRQ_STACK,IRQ_SP
	moveta	IRQ_SP,IRQ_SP.a
	movei	#stacktop,SP
;;; ------------------------------
	include <js/inc/videoinit.inc>
;;; ------------------------------

	movei	#$f14003,r0
	loadb	(r0),r0
	movei	#obl0,r28
	btst	#4,r0
	movei	#obl1,r27
	jr	eq,pal
	nop
	movei	#obl0_60hz,r28
	movei	#obl1_60hz,r27
pal:
	movei	#obl_size/8,r26
;;->	movei	#hexfont,r25
	movei	#ASCII,r25

	movei	#logo_screen,r0
	movei	#logo,r1
	movei	#8*9/4,r2
	nop
cpy_logo:
	load	(r1),r3
	addq	#4,r1
	subq	#1,r2
	store	r3,(r0)
	jr	nz,cpy_logo
	addq	#4,r0

	moveq	#$10,r0
	shlq	#4,r0
	movei	#JOYSTICK,r1
	storew	r0,(r1)
	nop
	movei	#DSP_code,r0
	movei	#DSP_RAM,r1
	movei	#(DSP_code_e-DSP_code),r2
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

	;; get OP lists from 68k
	move	r28,r1
	moveq	#16,r2
	shlq	#1,r2
	add	r2,r28
	moveta	r28,obl0.a
	add	r2,r27		; skip branch objects
	moveta	r27,obl1.a
	move	r26,r0
	subq	#4,r0
	moveta	r0,obl_size.a

	movei	#obl,r0
	nop
	move	r0,r4
.cpyobl0:
	loadp	(r1),r3
	addq	#8,r1
	subq	#1,r26
	storep	r3,(r0)
	jr	nz,.cpyobl0
	addq	#8,r0

	rorq	#16,r4
	moveq	#$f,r14
	shlq	#20,r14
	store	r4,(r14+32)

 IFD DEBUG
	movei	#254,r0
	movei	#$1000F7F0,r1
	movei	#txt_screen,r2
	movei	#hexfont,r3
	movei	#InitHexScreen,r4
	BL	(r4)
 ENDIF

	movei	#254,r0
	movei	#$1000F7F0,r1
	movei	#txt_screen,r2
	movei	#ASCII,r3
	movei	#InitTxtScreen,r4
	BL	(r4)

	movei	#hello,r0
	moveq	#0,r1
	movei	#PrintString_YX,r2
	BL	(r2)

	movei	#1<<14|%11111<<9|%01000<<4,r0
	store	r0,(IRQ_FLAGADDR)
	nop
	nop

	MBL	main

 IFD DEBUG
	align 4
hexfont::
	.ibytes <font/hexfont_8x5.bin>
 ENDIF
	align 4
ASCII::
	.ibytes <font/light8x8.fnt>
	;;   0123456789012345678901234567890123456789a
hello::
	dc.b "YARC reloaded / 100% GPU/DSP code",0

	align 4
logo:
	;;    0123456789ABCDEF0123456789ABCDEF
	dc.l %11111111111111111111111111111110,0
	dc.l %10000000000000000000000000000010,0
	dc.l %10110001101000010010001001100010,0
	dc.l %10101010001010101001010100010010,0
	dc.l %10110001001110001000000100100010,0
	dc.l %10101000100010010000001000010010,0
	dc.l %10110011000010111000011101100010,0
	dc.l %10000000000000000000000000000010,0
	dc.l %11111111111111111111111111111110,0

*****************
* Objekte
	align 8
obl0:
	ibytes "obl0_50.img"

obl1:
	ibytes "obl1_50.img"
;; ======================================== 60Hz

obl0_60hz:
	ibytes "obl0_60.img"

obl1_60hz:
	ibytes  "obl1_60.img"
_end_60hz:

obl_size	EQU obl1-obl0

	echo "OBL size %Dobl_size"

 IF MOD = 1
DSP_code:
	ibytes	"lsp_v15.bin"
DSP_code_e:

	.long
LSP_module_music_data:
	.ibytes "mod/my.lsmusic"
	.long
LSP_module_sound_bank:
	.ibytes "mod/my.lsbank"
LSP_music_end:
 ENDIF
	include "cube.js"
