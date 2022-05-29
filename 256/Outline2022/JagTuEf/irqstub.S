;;; 68k code which patches the OBL update of the BIOS code

	.68000

_PAL	equ 0

screen	EQU $100000

 IF ^^defined MODEL_M
   IF ^^defined DEBUG
	;; Replace branch objects with bitmap object
OBL_START	EQU $6fe0
   ELSE
OBL_START	EQU $7000
   ENDIF
 ELSE
OBL_START	EQU $7000
 ENDIF

my_irq:
 IF ^^defined MODEL_M
	dc.w	OBL_START
 IF ^^defined DEBUG
	movem.l	OBL0(pc),d0-d3		; get object
	movem.l	d0-d3,(a1)		; write bm object and stop
 ELSE
	movem.l	OBL0(pc),d0-d1/d3	; get object
	moveq	#5,d2			; second phrase
	movem.l	d0-d3,(a1)		; write bm object (stop in front)
 ENDIF
	rts
 ENDIF
OBL0:
	.objproc
	.org	$30000+OBL_START
 IF ^^defined _PAL
xpos 	equ 11
 ELSE
xpos	equ 12
 ENDIF

 IF ^^defined DEBUG
 IF ^^defined _PAL
	bitmap screen, 11, 27, 320/4, 320/4, 240 ,4, 0, NOTRANS, 0 ,1
 ELSE
	bitmap screen, 12, 25, 320/4, 320/4, 224 ,4, 0, NOTRANS, 0 ,1
 ENDIF
 ELSE
	;; below objects are modfied to jump to existing stop objects!
	;; 3rd word is removed and replaced by moveq!
 IF ^^defined MODEL_M
	;; Model M has branch/stop objects "before" the BM object.
 IF ^^defined _PAL
	dc.l (screen<<8)|$6d,$fe3c0180,$0140c001
 ELSE
	dc.l (screen<<8)|$6d,$fe3c01e0,$0140c00c
 ENDIF
 ELSE
 IF ^^defined _PAL
	bitmap screen, 11, 27, 320/4, 320/4, 240 ,4, 0, NOTRANS, 0 ,1
 ELSE
	bitmap screen, 12, 25, 320/4, 320/4, 224 ,4, 0, NOTRANS, 0 ,1
 ENDIF
 ENDIF
 ENDIF
	.68000
OBL0_end:
	.long			; align size to full 32bits
