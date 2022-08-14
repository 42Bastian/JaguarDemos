	.68000

	.include "68k_inc/jaguar.inc"	; get equates

 IF ^^defined TIMING
ScreenMode	EQU CRY16|VIDEN|PWIDTH4|BGEN|CSYNC
 ELSE
ScreenMode	EQU CRY16|VIDEN|PWIDTH4|BGEN|CSYNC
 ENDIF


screen	EQU $100000

 IF ^^defined MODEL_M
OBL_START	EQU $6fe0
 ELSE
OBL_START	EQU $7000
 ENDIF

 IF ^^defined MODEL_M
my_irq:
	dc.w	OBL_START
	move.w	#ScreenMode,$f00028
 IF ^^defined DEBUG
	movem.l	OBL0(pc),d0-d3		; get object
 ELSE
	movem.l	OBL0(pc),d0-d1/d3	; get object
	moveq	#3,d2			; second phrase
 ENDIF
	movem.l	d0-d3,(a1)		; write bm object (stop in front)
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
	bitmap screen, 58, 44, 224/4, 224/4, 224 ,4, 0, NOTRANS, 0 ,1
 ELSE
	bitmap screen, 58, 27, 256/4, 256/4, 224 ,4, 0, NOTRANS, 0 ,1
 ENDIF
 ELSE
	;; below objects are modfied to jump to existing stop objects!
	;; 3rd word is removed and replaced by moveq!
 IF ^^defined MODEL_M
	;; Model M has branch/stop objects "before" the BM object.
 IF ^^defined _PAL
	dc.l (screen<<8)|$6d,$fe3802c0,$80e0c03a
 ELSE
	dc.l (screen<<8)|$6d,$fe3802c0,$80e0c03a
 ENDIF
 ELSE
 IF ^^defined _PAL
	bitmap screen, 35, 44, 256/4, 256/4, 240 ,4, 1, NOTRANS, 0 ,1
 ELSE
	bitmap screen, 35, 27, 256/4, 256/4, 224 ,4, 1, NOTRANS, 0 ,1
 ENDIF
 ENDIF
 ENDIF
	.68000
OBL0_end:
	.long
