;-*-asm-*-

	gpu

	include <js/macro/help.mac>
	include <js/macro/joypad1.mac>
	include <js/symbols/blit_eq.js>
	include <js/symbols/jagregeq.js>

	.include "canvas.h"

MOD::		EQU 1

ScreenMode	EQU CRY16|VIDEN|PWIDTH4|BGEN|CSYNC

	run $6000

	movei	#$f02100,r1
	movei	#1<<14|%11111<<9,r0	; clear all ints, REGPAGE = 1
	store	r0,(r1)
	nop
	nop
	nop

	movei	#ScreenMode,r0
	movei	#$f00028,r1
	storew	r0,(r1)

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

	movei	#logo_screen,r0
	movei	#logo,r1
	movei	#8*9/4,r2

cpy_logo:
	load	(r1),r3
	addq	#4,r1
	subq	#1,r2
	store	r3,(r0)
	jr	nz,cpy_logo
	addq	#4,r0

 IF MOD = 1
	movei	#DSP_code,r0
	movei	#DSP_RAM,r1
	movei	#(DSP_code_e-DSP_code),r2
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


	movei	#$f03000+8000,r0
	movei	#GPUcode+4,r1
	load	(r1),r2		; dest
	move	r2,r3
	addq	#4,r1
	load	(r1),r4		; size
	addq	#4,r1

	nop
cpy:	load	(r1),r5
	addq	#4,r1
	subq	#4,r4
	store	r5,(r2)
	jr	pl,cpy
	addq	#4,r2


	jump	(r3)
	nop


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

	.phrase
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

	.phrase
 ENDIF

 IFD DEBUG
	align 4
hexfont::
	.ibytes <font/hexfont_8x5.bin>
 ENDIF
	align 4
ASCII::
	.ibytes <font/light8x8.fnt>
	;;   0123456789012345678901234567890123456789a
Hello::
	dc.b "YARC reloaded / 100% GPU/DSP code",0

	align 16
GPUcode:
	.ibytes "cube.o"
