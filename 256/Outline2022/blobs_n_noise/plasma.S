;;; Debug helper to load the GPU code to allow development

	.68000

 	.include "68k_mac/help.mac"
 	.include "68k_inc/jaguar.inc"	; get equates
 	.include "68k_mac/video.mac"
 	.include "../addresses.inc"

ScreenMode	EQU CRY16|VIDEN|PWIDTH4|BGEN|CSYNC

VID_MODE	EQU PAL

screen		EQU $1d0000

stacktop	equ $4000	; ROM sets SP to this address

 IF ^^defined DEBUG
   IF ^^defined MODEL_M
OBL		equ $36fe0
   ELSE
OBL		equ $37000
   ENDIF
 ELSE
OBL		equ $37000
 ENDIF

;---------------
start:
	lea	$f00000,a5
	VideoInit
	move.w	#ScreenMode,$28(a5)
;;; --------------------
;;; Init Interrupts
;;; --------------------
	bsr.s	init_irq
;;; --------------------
;;; Start GPU (max. 1k)
;;; --------------------
	clr.l	VBL_COUNTER
	lea	$400(a5),a0
	lea	gpu(pc),a2
	lea	$2110(A5),a3
	lea	$35ac-$2110-8(a3),a4
	move.w	#$f000,d1
	moveq	#0,d0
	move.l	a4,(a3)+
copy_gpu:
	move.l	(a2)+,(a4)+	; GPU
	move.w	d1,(a0)+
	addq.b	#2,d1
	addq.b	#1,d0
	bne.s	copy_gpu
	addq.l	#1,(a3)		; start GPU

;;; --------------------
;;; Init OP
;;; --------------------
	move.l	#OBL,d0
	swap	d0
	move.l	d0,$20(a5)		; OPL = $0
	move.w	#$2000,sr		; release IRQs
main:
	;; stopping will speed up, but BIOS code does not use it!
//->	stop	#$2000		; release bus until interrupt
	bra.s	main

;;****************
;;      IRQ      *
init_irq:
	lea	my_irq(pc),a0
	move.l	a0,$0100.w
	move.w	sr,-(sp)
my_irq:
	addq.l	#1,VBL_COUNTER
	movem.l	OBL0(pc),d0-d5
	movem.l	d0-d5,OBL
	moveq	#-1,d1
	move.l	d1,$e0(a5)
	rte

OBL0:
	.objproc
	.org	OBL
	bitmap screen, 11, 27, 320/4, 320/4, 240 ,4, 0,NOTRANS, 0 ,1
	stop
	.68000

OBL0_end:
	VideoData

gpu:
	.gpu
	.org $f035ac-8
	movei	#$f035ac+28,r14	;Intro expects r14 to point to a valid address!
	moveq	#$15,r13
	.incbin	"plasma.bin"
	.68000
gpue:

jag_end:

	END
