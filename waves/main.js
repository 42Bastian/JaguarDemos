;; -*-asm-*-

LYXASS	EQU 1
	gpu

	include <js/symbols/jagregeq.js>
	include <js/symbols/blit_eq.js>
	include <js/macro/help.mac>
	include <js/macro/module.mac>

	unreg LR,LR.a,SP,SP.a

	include "globalreg.h"
	include "video.h"

//->TIMING		EQU 0

IRQ_STACK	equ $f03020

x_save		equ $2000
col_tab		equ $6000
dot_tab		equ $10000

LastJoy		equ $f03ff8
Gouraud		equ $f03ff4
stacktop	equ $f03ff0


	RSSET $f03000

	MACRO WAITBLITTER
.\waitblit	load (blitter+$38),tmp0
	btst	#0,tmp0
	jr	eq,.\waitblit
	nop
	ENDM

	MACRO BPT
.\b	jr	.\b
	nop
	ENDM

	run $4020
********************
* init
init::
	movei	#$f02100,IRQ_FLAGADDR
	moveta	IRQ_FLAGADDR,IRQ_FLAGADDR.a

	movei	#1<<14|%11111<<9,r0	; clear all ints, REGPAGE = 1
	store	r0,(IRQ_FLAGADDR)
	nop
	nop

	INITMODULE irq

	INITMODULE waves

	movei	#IRQ_STACK,IRQ_SP
	moveta	IRQ_SP,IRQ_SP.a
	movei	#stacktop,SP
	nop

	include <js/inc/videoinit.inc>

	movei	#$f00028,r0
	movei	#ScreenMode,r1
	storew	r1,(r0)

	movei	#$f14003,r0
	loadb	(r0),r0
	moveq	#0,r1
	movei	#obl0,r10
	btst	#4,r0
	movei	#obl1,r11
	jr	eq,pal
	addq	#32,r1
	movei	#obl0_60Hz,r10
	movei	#obl1_60Hz,r11
pal:
	add	r10,r1
	addq	#32,r1
	moveta	r1,obl0.a
	addq	#32,r11
	addq	#32,r11
	moveta	r11,obl1.a

	moveq	#$10,r1
	moveq	#12,r2
	shlq	#8,r1
	nop
.cpyobl:
	loadp	(r10),r3
	addqt	#8,r10
	subq	#1,r2
	storep	r3,(r1)
	jr	pl,.cpyobl
	addqt	#8,r1

	movei	#$f00020,r0
	moveq	#$10,r1
	shlq	#16+8,r1
	store	r1,(r0)

	movei	#screen0,r0
	moveta	r0,screen1.a
	movei	#screen1,r0
	moveta	r0,screen0.a

	movei	#1<<14|%11111<<9|%01000<<<4,r1
	store	r1,(IRQ_FLAGADDR)
	nop
	nop

	movei	#$f02200,r0
	moveta	r0,blitter.a

	movei	#Gouraud,r0
	movei	#B_PATDSEL|B_GOURD,r1
	store	r1,(r0)

	movei	#waves,r0
	nop
	jump	(r0)

	include "irq.js"
	include "waves.js"
obl0:
	ibytes	"obl0_50.img"
obl1:
	ibytes	"obl1_50.img"

obl0_60Hz:
	ibytes	"obl0_60.img"
obl1_60Hz:
	ibytes	"obl1_60.img"

end:
size	set end-init
	echo "Size: %D size"
