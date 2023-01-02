* JAG_BALL
* geschrieben : 6.8.94
* last change : 27.12.22
*		15.10.96/24.09.95/21.10.94/29.8.94/22.8.94/8.8.94/7.8.94
*
* (c) 1994 Bastian Schick
*
* Steuerung :
* Pfeil hoch + ABC => XYZ-Add +1
* Pfeil runter + ABC => XYZ-Add -1
* 1/2/3 => XYZ-Add != XYZ-Add
* 4/5/6 => XYZ-Add = 0
* 0	=> X-Add = Y-Add = Z-Add = 0
* Option => alles auf Null

	.68000

	include "68k_inc/jaguar.inc"
	include "68k_mac/help.mac"
	include "68k_inc/blit_eq.inc"

BITMAP		EQU 1		; 1 = Bitmap darstellen
COLORMAP	EQU 1		; 1 = Farben darstellen
BALL		EQU 1
MMULT		EQU 1

DEBUG		EQU 0

ScreenMode	EQU CRY16|VIDEN|PWIDTH4|BGEN|CSYNC

TextWidth	EQU 2		; 2*8 Bytes
TextHeight	EQU 24
TWB		EQU TextWidth*8

screen		EQU $100000
screen1		EQU $100008
z_buffer	EQU $100010
TextScreen	EQU screen-TWB*TextHeight
vars		EQU $050000
max_y		EQU 240


max_points	EQU 15000

		RSRESET

	RSB obj0_list, 256
	RSB obj1_list, 256
	RSW count_obj,1
	RSL joy_pad,  3
	RSL points,   1
	RSW flag,     1
	RSW scr_flag, 1
	RSW radius,   1
	RSL log,      1
	RSL _normal,  1
	RSL gedreht0, 1
	RSL color,    1
	RSL alpha_add,1
	RSL beta_add, 1
	RSL delta_add,1
	RSL alpha,    1
	RSL beta,     1
	RSL delta,    1
	RSL last,     1
	RSL Cursor,   1
	RSW a_vde,    1
	RSW a_vdb,    1
	RSL endofvars,   1

vars_size EQU RSCOUNT

jag_prg:
start:
	INCLUDE "68k_inc/startup.inc"
;-----------------
		move	#$2700,sr
		lea	$3FFC,sp
		lea	vars,a6
		move.l	a6,a0
		moveq	#vars_size/4-1,d0
clrbss:		clr.l	(a0)+
		dbra	d0,clrbss

		move.l	#26590<<16|$ffff,PIT0	; 1/1000s-Timer

		bsr	InitTxtScreen

		bsr	VideoInit
		bsr	InitOP
		bsr	InitGPU

		clr.l	points(a6)
		lea	endofvars+8(a6),a0
		move.l	a0,d0
		addq.l	#7,d0
		and.w	#$FFF8,d0
		move.l	d0,_normal(a6)	; phrase align for LOADP
		movea.l d0,a2
		add.l	#max_points*8,d0
		move.l	d0,gedreht0(a6)
		add.l	#max_points*12,d0
		movea.l d0,a4
		move.l	d0,color(a6)
		add.l	#max_points*2,d0
		move.w	#80,radius(a6)
	;; create dots
		bsr	xaxe
		bsr	yaxe
		bsr	zaxe
	IF COLORMAP = 1
		bsr	ColorMap
	ENDIF
	IF BITMAP = 1
		bsr	MakeBitMap
	ENDIF
	IF BALL = 1
		bsr	kugel
	ENDIF

	;; init screens
		lea	screen+8,a5
		bsr	cls
		bsr	swap
		bsr	cls
		bsr	swap


		move.l	points(a6),d0
		clr.l	Cursor(a6)
		bsr	PrintDEZ

		moveq	#0,d0
		move.l	d0,alpha_add(a6)
		move.l	d0,beta_add(a6)
		move.l	d0,delta_add(a6)
		move.l	d0,alpha(a6)
		move.l	d0,beta(a6)
		move.l	d0,delta(a6)
lo0:
		move.l	#1,last(a6)
lo:
		move.w	PIT1,d7
		bsr	cls
		movem.l alpha(a6),d0-d2
		bsr	DoGPU
		sub.w	PIT1,d7
		bsr	swap

		move.w	d7,d0
		ext.l	d0
		cmp.l	last(a6),d0
		blo.s	ok
		move.l	d0,last(a6)
		move.l	#TWB*16,Cursor(a6)
		bsr	PrintDEZ

ok:		move.l  #TWB*8,Cursor(a6)
		bsr	PrintDEZ

		movem.l alpha(a6),d0-d2
		movem.l alpha_add(a6),d5-d7
		add.l	d5,d0
		add.l	d6,d1
		add.l	d7,d2
		moveq	#$7F,d3
		and.l	d3,d0
		and.l	d3,d1
		and.l	d3,d2
		movem.l d0-d2,alpha(a6)
		bsr	GetJoyPad1
		move.l	joy_pad+4(a6),d0
		beq.s	lo
		btst	#28,d0
		beq.s	no_reset
;;->		illegal
		bra	lo0
no_reset:
		btst	#28,d0		; PAUSE
		beq.s	no_break
;;->		illegal
		nop
		bra	lo0

no_break:	btst	#29,d0	; "A"
		beq.s	no_A
		btst	#20,d0		; up
		beq.s	skip0
		subq.l	#1,d5
skip0:
		btst	#21,d0
		beq.s	cont_joy
		addq.l	#1,d5
		bra.s	cont_joy
no_A:		btst	#25,d0	; "B"
		beq.s	no_B
		btst	#20,d0		; up
		beq.s	skip1
		subq.l	#1,d6
skip1:
		btst	#21,d0
		beq.s	cont_joy
		addq.l	#1,d6
		bra.s	cont_joy
no_B:		btst	#13,d0		; "C"
		beq.s	cont_joy
		btst	#20,d0		; up
		beq.s	skip2
		subq.l	#1,d7
skip2:
		btst	#21,d0
		beq.s	cont_joy
		addq.l	#1,d7
cont_joy:	btst	#4,d0		; "0"
		beq.s	no_0
		moveq	#0,d5
		moveq	#0,d6
		moveq	#0,d7
no_0:		btst	#19,d0		; "1"
		beq.s	skip3
		neg.l	d5
skip3:
		btst	#7,d0		; "2"
		beq.s	skip4
		neg.l	d6
skip4:
		btst	#3,d0		; "3"
		beq.s	skip5
		neg.l	d7
skip5:
		btst	#18,d0		; "4"
		beq.s	skip6
		moveq	#0,d5
skip6:
		btst	#6,d0		; "5"
		beq.s	skip7
		moveq	#0,d6
skip7:
		btst	#2,d0		; "6"
		beq.s	skip8
		moveq	#0,d7
skip8:
		btst	#9,d0
		beq.s	no_opt
		moveq	#0,d5
		moveq	#0,d6
		moveq	#0,d7
		movem.l d5-d7,alpha(a6)
no_opt:		movem.l d5-d7,alpha_add(a6)
		bra	lo

*******************
* Init- und Hilfsroutine fuer den Bildschirm
* (c) 1994 Bastian Schick
**************************
NEXT_OBJ	EQU 1

***************************************
* BitMap oder Scaled BitMap - Objekte *
***************************************
	RSRESET
	RSW obj_bm_type,  1		; Type
	RSW obj_bm_l,     1		; Groeﬂe des Objektes (fuer MakeOBL)
	RSL obj_bm_data,  1		; Data
	RSW obj_bm_x,     1		; X
	RSW obj_bm_y,     1		; Y pos in Halbzeilen
	RSW obj_bm_height,1		; Hoehe ODER cc bei BRANCH OBJECT
	RSW obj_bm_link,  1		; naechstes Objekt in Objekten
	RSB obj_bm_bits,   1		; Bits pro Pixel
	RSB obj_bm_pitch,  1		; Pitch
	RSW obj_bm_dwidth, 1		; Breite in Phrases
	RSW obj_bm_iwidth, 1		; Bildbreite (sichtbar)
	RSB obj_bm_cindex, 1		; Farb-Offset
	RSB obj_bm_flags,  1		; Flags
	RSW obj_bm_firstpx,1		; FirstPixel
obj_bm_len	EQU RSCOUNT

	RSB obj_dummy1,   1
	RSB obj_sc_rem,   1
	RSB obj_sc_vscale,1
	RSB obj_sc_hscale,1		; Ergaenzungen fuer Scaled BitMap
obj_sc_len	EQU RSCOUNT

*************
* GPU-Object *
*************
	RSRESET
	RSW obj_gp_type, 1
	RSW obj_gp_l,    1		; Groeﬂe des Objektes (fuer MakeOBL)
	RSW obj_gp_y,    1
	RSL obj_gp_data1,1
	RSL obj_gp_data2,1
	RSW obj_gp_link, 1

obj_gp_len	EQU RSCOUNT
*****************
* Branch-Object *
*****************
	RSRESET
	RSW obj_br_type,1
	RSW obj_br_l,   1		; Groeﬂe des Objektes (fuer MakeOBL)
	RSW obj_br_y,   1
	RSW obj_br_cc,  1		; Bedingung
	RSW obj_br_link,2
obj_br_len	EQU RSCOUNT

	macro BRA_OBJ y_pos,cc,dest
	dc.w 3,obj_br_len
	dc.w \y_pos	    ;; y
	if \cc = "<"
	dc.w 1
	else
	if \cc = ">"
	dc.w 2
	else
	if \cc = "="
	dc.w 0
        else
	dc.w \cc
	endif
	endif
	endif
	dc.w \dest,NEXT_OBJ
	endm

	macro BRA2_OBJ y_pos,cc,_if,_else
	dc.w 3,obj_br_len
	dc.w \y_pos	    ;; y
	if \cc = "<"
	dc.w 1
	else
	if \cc = ">"
	dc.w 2
	else
	if \cc = "="
	dc.w 0
        else
	dc.w \cc
	endif
	endif
	endif
	dc.w \_if,\_else
	endm

***************
* Stop-Object *
***************
	RSRESET
	RSW obj_st_type, 1
	RSW obj_st_l,    1
	RSW obj_st_int,  1
	RSL obj_st_data1,1
	RSL obj_st_data2,1
obj_st_len	EQU RSCOUNT

	macro	STOP_OBJ
	dc.w	4,obj_st_len,0
	dc.l	0,0
	endm

;;; ----------------------------------------
;;; MakeOBL()
;;; A0 - background list
;;; A1 - active list
;;; A2 - object description
;;; ----------------------------------------
MakeOBL:	movem.l d0-a4,-(sp)

		move.l	#$FF000000,d4
		move.l	a1,a4		; start merken
		lea	-32(a1),a1 	; prepapre for add
		moveq	#0,d7		; object counter
loop_mo:	lea	32(a1),a1
loop_mo1:	lea	(a2),a3		; Ptr auf akt. Objekt retten
		movem.w (a2)+,d1/d5	; Type
		tst.w	d1
		bpl.s	ok_mo
		cmp.w	#$AFFE,d1
		beq	exit_mo
		lea	-4(a2,d5.w),a2
		bra.s	loop_mo1

ok_mo:		addq.w  #1,d7
		and.w	#7,d1
		ext.l	d1
		move.w	d1,d0
		subq.w	#2,d0
		bmi	bm_sc_mo
		beq	gpu_mo		; 2=GPU-Object
		subq.w	#2,d0
		bmi.s	branch_mo	; 3=Branch Object
* Stop-Objekt erzeugen
		moveq	#1,d0
		and.w	(a2)+,d0
		lsl.w	#3,d0
		or.w	d0,d1		; Interrupt Flag
		movem.l (a2)+,d0/d2

		lsl.l	#4,d2
		or.l	d2,d1
		move.l	d0,(a0)+
		move.l	d1,(a0)+
		lea	24(a0),a0
		bra.s	loop_mo
* branch_object
branch_mo:	move.w  #$07FF,d0
		and.w	(a2)+,d0
		lsl.w	#3,d0
		or.w	d0,d1		; Ypos
		moveq	#7,d0
		and.w	(a2)+,d0
		swap	d0
		lsr.l	#2,d0
		or.l	d0,d1		; CC

		move.l	a1,d3		; akt. Pos merken
		move.w	(a2)+,d0	; naechstes Objekt falls CC true
		bpl.s	ok_bra_mo
		neg.w	d0
		move.l	a4,d3		; sonst absolute
ok_bra_mo:	asl.w	#5,d0		; * 32
		ext.l	d0
		add.l	d3,d0
		lsr.l	#3,d0
		ror.l	#8,d0
		move.l	d0,d3
		and.l	d4,d0
		or.l	d0,d1		; Link (24..31)
		move.l	d3,d0
		and.l	#$FFFFFF,d0
		move.l	d0,(a0)+
		move.l	d1,(a0)+

		move.w	#($07FF<<3)|3,d1 ; Branch Always
		ext.l	d1
		move.w	(a2)+,d0	; naechstes Objekt
		asl.w	#5,d0		; * 32
		ext.l	d0
		add.l	a1,d0
		lsr.l	#3,d0
		ror.l	#8,d0
		move.l	d0,d3
		and.l	d4,d0
		or.l	d0,d1		; Link (24..31)
		move.l	d3,d0
		and.l	#$FFFFFF,d0
		move.l	d0,(a0)+
		move.l	d1,(a0)+
		lea	16(a0),a0
		bra	loop_mo
* GPU Object
gpu_mo:		move.w  #$03FF,d0
		and.w	(a2)+,d0
		lsl.w	#3,d0
		or.w	d0,d1
		movem.l (a2)+,d0/d2
		swap	d2
		lsr.w	#3,d2
		and.w	#$E000,d2
		or.l	d2,d1
		move.l	d0,(a0)+
		move.l	d1,(a0)+

		move.w	#($07FF<<3)|3,d1 ; Branch Always
		ext.l	d1
		move.w	(a2)+,d0	; naechstes Objekt
		lsl.w	#5,d0		; * 32
		ext.l	d0
		add.l	a1,d0
		lsr.l	#3,d0
		ror.l	#8,d0
		move.l	d0,d3
		and.l	d4,d0
		or.l	d0,d1		; Link (24..31)
		move.l	d3,d0
		and.l	#$FFFFFF,d0
		move.l	d0,(a0)+
		move.l	d1,(a0)+
		lea	16(a0),a0
		bra	loop_mo

* BitMap oder Scaled BitMap
bm_sc_mo:	moveq	#$F8,d0
		and.l	(a2)+,d0	; Data-Adress (3..23)
		bpl.s	ok_bm_sc_mo
		add.l	a6,d0
		add.l	vars,d0
ok_bm_sc_mo:	lsl.l	#8,d0		; an 63..43

		move.l	#$0fff,d6
		and.w	(a2)+,d6	; X (im 2. Phrase 0..11)

		move.w	(a2)+,d3
		and.w	#$07FF,d3
		lsl.w	#3,d3
		or.w	d3,d1		; Y-Pos (3..13)

		move.l	#$03ff,d3
		and.w	(a2)+,d3
		swap	d3
		lsr.l	#2,d3
		or.l	d3,d1		; Hoehe (14..23)

		move.w	(a2)+,d3	; naechstes Objekt
		lsl.w	#5,d3		; * 32
		ext.l	d3
		add.l	a1,d3
		lsr.l	#3,d3
		ror.l	#8,d3
		move.l	d3,d2		; Link retten
		and.l	d4,d3
		or.l	d3,d1		; Link (24..31)

		move.l	d2,d3
		and.l	#$FFFFFF,d3
		or.l	d3,d0
		move.l	d0,(a0)+
		move.l	d1,(a0)+

		moveq	#7,d0
		and.b	(a2)+,d0
		ror.w	#4,d0
		or.w	d0,d6		; Depth (12..14)

		moveq	#7,d0
		and.b	(a2)+,d0
		swap	d0
		lsr.l	#1,d0
		or.l	d0,d6		; Pitch (15..17)

		moveq	#0,d0
		move.w	(a2)+,d0
		and.w	#$03FF,d0
		lsl.w	#2,d0
		swap	d0
		or.l	d0,d6		; Dwidth (18..27)

		moveq	#0,d0
		move.w	(a2)+,d0
		and.w	#$03FF,d0
		ror.l	#4,d0
		move.l	d0,d1
		clr.w	d0
		or.l	d0,d6		; IWidth (28..31)
		ext.l	d1		; und (32..37)

		move.w	#$FE,d0
		and.b	(a2)+,d0
		lsr.b	#1,d0

		lsl.w	#6,d0
		or.w	d0,d1		; Index (38..44)

		moveq	#$0F,d0
		and.b	(a2)+,d0
		swap	d0
		lsr.l	#3,d0
		or.l	d0,d1		; Flags (45..48)

		moveq	#$3F,d0
		and.w	(a2)+,d0

		add.w	d0,d0
		swap	d0
		or.l	d0,d1
		move.l	d1,(a0)+
		move.l	d6,(a0)+

		lea	16(a0),a0
		cmp.w	#obj_sc_len,d5	; Sized Object
		bne	loop_mo
		move.l	(a2)+,-12(a0)
		bra	loop_mo

exit_mo:	clr.l	(a0)+
		moveq	#4,d0
		move.l	d0,(a0)+
		addq.w	#1,d7
		move.w	d7,count_obj(a6)
		movem.l (sp)+,d0-a4
		rts

CopyOBL:
		lea	obj0_list(a6),a0
		lea	obj1_list(a6),a1
		move.w	count_obj(a6),d1
		subq	#1,d1
cobl:
		REPT 8
		move.l	(a1)+,(a0)+
		ENDR
		dbra	d1,cobl
		rts

*****************
*   videoinit	*
	.include "68k_inc/videoinit.inc"
*****************
InitOP:
		lea	obj1_list(a6),a0	; background list
		lea	obj0_list(a6),a1	; active list address
		lea	Objekte(pc),a2		; source
		bsr	MakeOBL

		bsr	CopyOBL

		lea	$F00000,a0
		lea	obj0_list(a6),a1
		move.l	a1,d0
		swap	d0
		move.l	d0,$20(a0)
		clr.w	$26(a0)		; OPF
		move.w	#$1F01,$E0(a0)
		move.w	#ScreenMode,$28(a0)
		clr.w	$E2(a0)
		move	sr,d0
		lea	my_irq(pc),a0
		move.l	a0,$0100.w
		and.w	#$F8FF,d0
		move	d0,sr
		rts

my_irq:		movem.l	d0-d1/a0-a1,-(sp)
		move.w	$F000E0,d0
		btst	#0,d0
		beq.s	no_vi
		bsr	CopyOBL
		move.w	scr_flag(a6),$F00026
		clr.w	flag(a6)

		move.w	#$0101,$F000E0
no_vi:		clr.w	$F000E2
		movem.l	(sp)+,d0-d1/a0-a1
		rte


swap:		not.w	scr_flag(a6)
		move.l	a5,d0
		eor.b	#8,d0
		move.l	d0,a5

		subq.w	#1,flag(a6)
swap1:		stop	#$2000
		tst.w	flag(a6)
		bne.s	swap1
		rts

Objekte:
		BRA_OBJ 30,"<",-7		; y<30 => STOP
		BRA_OBJ 500,">",-7		; y>500 => STOP
* Info
		DC.W 1,obj_sc_len
		DC.L TextScreen
		DC.W 24,60,TextHeight
		DC.W NEXT_OBJ
		DC.B 0,1
		DC.W TextWidth,TextWidth ; Breite
		DC.B 0,4
		DC.W 0
		DC.B 0,$40,$40,$40

		BRA_OBJ $7ff,3,-6		; OPFLAG set?

screen1_type:	DC.W 0,obj_bm_len
		DC.L screen
		DC.W 20,35,max_y
		DC.W NEXT_OBJ
		DC.B 4,3
		DC.W (320*2*3)>>3,(320*2*1)>>3
		DC.B 0,4
		DC.W 0
		STOP_OBJ

screen2_type:	DC.W 0,obj_bm_len
		DC.L screen1
		DC.W 20,35,max_y
		DC.W NEXT_OBJ
		DC.B 4,3
		DC.W (320*2*3)>>3,(320*2*1)>>3
		DC.B 0,4
		DC.W 0
* EOL
		DC.W $AFFE
*******************

InitGPU:	lea	$F02110,a0
		moveq	#0,d0
		move.w	#$3E00,d0
		move.l	d0,-$10(a0)
		lea	GPUcode+4(pc),a1
		moveq	#0,d0
		move.l	d0,4(a0)	; GPU halt
		movea.l (a1)+,a2
		move.l	a2,(a0)
		move.l	(a1)+,d1	; Laenge in Bytes
		lsr.l	#2,d1
copy_gpu:	move.l  (a1)+,(a2)+
		dbra	d1,copy_gpu
		sub.l	#$010000,d1
		bpl.s	copy_gpu
		rts
GPUcode:
		IF MMULT = 1
		.incbin 'ROT5Z_MM.O'
		ELSE
		.incbin 'ROTATEZ5.O'
		ENDIF

; IN : d0	alpha
;      d1	beta
;      d2	gamma
DoGPU:		lea	$F04000-11*4,a0
 move.l	#BLIT_XADDPIX|BLIT_WID320|BLIT_ZOFFS1|BLIT_PIXEL16|BLIT_PITCH3,d3
		move.l	color(a6),d4
		tst.w	scr_flag(a6)
		beq.s	ok_dg
 move.l	#BLIT_XADDPIX|BLIT_WID320|BLIT_ZOFFS2|BLIT_PIXEL16|BLIT_PITCH3,d3

ok_dg:		move.l	d3,(a0)+
		move.l	d4,(a0)+	; Farb-Werte der Pixel
		move.l	a5,(a0)+	; Bildschirm-Speicher

		lea	sin_tab(pc),a1
		move.w	#$01FC,d4
		lsl.w	#2,d2
		move.w	#32*4,d3
		add.w	d2,d3
		and.w	d4,d2
		and.w	d4,d3
		move.l	0(a1,d3.w),(a0)+ ; sin gamma
		move.l	0(a1,d2.w),(a0)+ ; cos gamma
		lsl.w	#2,d1
		move.w	#32*4,d3
		add.w	d1,d3
		and.w	d4,d1
		and.w	d4,d3
		move.l	0(a1,d3.w),(a0)+ ; sin beta
		move.l	0(a1,d1.w),(a0)+ ; cos beta
		lsl.w	#2,d0
		move.w	#32*4,d3
		add.w	d0,d3
		and.w	d4,d0
		and.w	d4,d3
		move.l	0(a1,d3.w),(a0)+ ; sin alpha
		move.l	0(a1,d0.w),(a0)+ ; cos alpha

		move.l	points(a6),(a0)+ ; Anzahl der Punkte
		move.l	_normal(a6),(a0)+ ; Koordinaten
		lea	$F02110,a0
		move.l	GPUcode+4(pc),(a0)+
		move.w	#$01|(1<<11),d0
		move.l	d0,(a0)
wait_gpu1:
		move.l  (a0),d0
		lsr.w	#1,d0
		bcs.s	wait_gpu1
		rts

PrintBIN:	movem.l d0-d2,-(sp)
		moveq	#31,d1
		move.l	d0,d2
loop_pb:	moveq	#0,d0
		add.l	d2,d2
		bcc.s	ok_pb
		addq.w	#1,d0
ok_pb:		bsr	PrintZiffer
		dbra	d1,loop_pb
		movem.l (sp)+,d0-d2
		rts

PrintDEZ:	movem.l d0/a0-a1,-(sp)
		lea	TextScreen,a1
		adda.l	Cursor(a6),a1
		addq.l	#5,Cursor(a6)
		divu	#10000,d0
		bsr.s	PrintZiffer2
		swap	d0
		ext.l	d0
		divu	#1000,d0
		bsr.s	PrintZiffer2
		swap	d0
		ext.l	d0
		divu	#100,d0
		bsr.s	PrintZiffer2
		swap	d0
		ext.l	d0
		divu	#10,d0
		bsr.s	PrintZiffer2
		swap	d0
		ext.l	d0
		bsr.s	PrintZiffer2
		movem.l (sp)+,d0/a0-a1
		rts

PrintZiffer2:	lsl.w	#3,d0
		lea	_0(pc),a0
		lea	0(a0,d0.w),a0
		move.b	(a0)+,(a1)+
		move.b	(a0)+,1*TWB-1(a1)
		move.b	(a0)+,2*TWB-1(a1)
		move.b	(a0)+,3*TWB-1(a1)
		move.b	(a0)+,4*TWB-1(a1)
		move.b	(a0)+,5*TWB-1(a1)
		move.b	(a0)+,6*TWB-1(a1)
		move.b	(a0)+,7*TWB-1(a1)
		rts

PrintDEZ2:	divu	#10,d0
		bsr.s	PrintZiffer
		swap	d0
		ext.l	d0
		bsr.s	PrintZiffer
		rts

InitTxtScreen:	lea	TextScreen,a0
		move.l	#$F0FF,$F00400
		move.w	#TWB*TextHeight-1,d0
		moveq	#0,d1
loop_its:	move.l  d1,(a0)+
		dbra	d0,loop_its
		rts

PrintZiffer:	movem.l d0/a0-a1,-(sp)
		lea	TextScreen,a1
		adda.l	Cursor(a6),a1
		addq.l	#1,Cursor(a6)
		lsl.w	#3,d0
		lea	_0(pc,d0.w),a0
		move.b	(a0)+,(a1)+
		move.b	(a0)+,1*TWB-1(a1)
		move.b	(a0)+,2*TWB-1(a1)
		move.b	(a0)+,3*TWB-1(a1)
		move.b	(a0)+,4*TWB-1(a1)
		move.b	(a0)+,5*TWB-1(a1)
		move.b	(a0)+,6*TWB-1(a1)
		move.b	(a0)+,7*TWB-1(a1)
		movem.l (sp)+,d0/a0-a1
		rts
_0:		.incbin 'ZAHLEN.BIN'

cls:		movem.l d0/a0,-(sp)
		lea	$F02200,a0
		move.l	a5,(a0)
		move.l	#BLIT_WID320|BLIT_ZOFFS1|BLIT_PIXEL32|BLIT_PITCH3,4(a0)
		tst.w	scr_flag(a6)
		beq.s	ok_cls
		move.l	#BLIT_WID320|BLIT_ZOFFS2|BLIT_PIXEL32|BLIT_PITCH3,4(a0)
ok_cls:		moveq	#0,d0
		move.l	d0,$0C(a0)
		move.l	d0,$18(a0)
		move.l	d0,$58(a0)
		move.l	d0,$5C(a0)
		move.l	d0,$60(a0)
		move.l	d0,$64(a0)
		move.l	d0,$68(a0)
		move.l	d0,$6C(a0)
		move.l	#(max_y<<16)|(320/2),$3C(a0)
		move.l	#(4<<18)|BLIT_PATDSEL|BLIT_DSTWRZ,$38(a0)
wait:		move.l  $38(a0),d0
		btst	#0,d0
		beq.s	wait
		movem.l (sp)+,d0/a0
		rts

kugel:		moveq	#63,d7
		lea	sin_tab(pc),a0

		move.w	#0,d6		; sin_phi
		move.w	#32*4,d5	; cos_phi

loop_k1:	movea.w #127,a1
		moveq	#0,d4		; sin_theta
		move.w	#32*4,d3	; cos_theta

loop_k2:	move.l  0(a0,d6.w),d0	; sin(phi)
		muls	radius(a6),d0
		swap	d0
		add.w	d0,d0
		move.w	d0,d2		; d2=r*sin(phi)
		move.l	0(a0,d4.w),d1	; sin(theta)
		muls	d1,d0
		swap	d0
		rol.l	#1,d0
; x=r*sin(phi)*sin(theta)
		move.l	0(a0,d3.w),d1
		muls	d2,d1
		swap	d1
		rol.l	#1,d1
; y=r*sin(phi)*cos(theta)
		move.l	0(a0,d5.w),d2
		muls	radius(a6),d2
		swap	d2
		rol.l	#1,d2
; z=r*cos(phi)
		ext.l	d0
		move.l	d0,(a2)+
		move.w	d1,(a2)+
		move.w	d2,(a2)+


		lsl.w	#8,d0
;		move.w	d0,(a4)+
		move.w	#$1020,(a4)+
		addq.l	#1,points(a6)

		addq.w	#4,d3
		addq.w	#4,d4
		and.w	#$01FF,d3
		and.w	#$01FF,d4
		subq.w	#1,a1
		move.w	a1,d0
		bpl.s	loop_k2
		addq.w	#4,d5
		addq.w	#4,d6
		and.w	#$01FC,d5
		and.w	#$01FC,d6
		dbra	d7,loop_k1
		rts

xaxe:		moveq	#20,d7
		move.l	#$F000F000,d6
		moveq	#0,d0
		moveq	#0,d1
		moveq	#0,d2
		move.w	radius(a6),d0
		move.w	d0,d1
		neg.l	d1
		moveq	#0,d2
		moveq	#0,d3
loop_xaxe:	clr.w	(a2)+
		movem.w d0/d2-d3,(a2)
		addq.l	#6,a2
		clr.w	(a2)+
		movem.w d1-d3,(a2)
		addq.l	#6,a2
		move.l	d6,(a4)+
		addq.l	#2,points(a6)
		addq.l	#1,d0
		subq.l	#1,d1
		dbra	d7,loop_xaxe
		rts

yaxe:		move.w  #20,d7
		move.l	#$9E009E00,d6
		moveq	#0,d0
		moveq	#0,d1
		moveq	#0,d2
		move.w	radius(a6),d1
		move.w	d1,d2
		neg.l	d2
		moveq	#0,d3
loop_yaxe:	move.l  d0,(a2)+
		move.w	d1,(a2)+
		move.w	d3,(a2)+
		move.l	d0,(a2)+
		move.w	d2,(a2)+
		move.w	d3,(a2)+
		move.l	d6,(a4)+
		addq.l	#2,points(a6)
		addq.l	#1,d1
		subq.l	#1,d2
		dbra	d7,loop_yaxe
		rts

zaxe:		move.w  #20,d7
		move.l	#$C000C000,d6
		moveq	#0,d0
		moveq	#0,d1
		moveq	#0,d2
		move.w	radius(a6),d2
		move.w	d2,d3
		neg.l	d3
loop_zaxe:	move.l  d0,(a2)+
		move.w	d1,(a2)+
		move.w	d2,(a2)+

		move.l	d0,(a2)+
		move.w	d1,(a2)+
		move.w	d3,(a2)+
		move.l	d6,(a4)+
		addq.l	#2,points(a6)
		addq.l	#1,d2
		subq.l	#1,d3
		dbra	d7,loop_zaxe
		rts
 IF COLORMAP = 1
ColorMap:	moveq	#63,d7
		move.l	#$FF00,d5
		moveq	#100,d1		; y
		moveq	#-20,d2
		moveq	#31,d3		; z
loop0_cm:	moveq	#31,d0		; x
		moveq	#63,d6
loop1_cm:
		move.l	d0,(a2)+
		move.w	d1,(a2)+
		move.w	d3,(a2)+

		move.w	d6,d5
		lsr.w	#2,d5
		ror.w	#4,d5
		or.w	d7,d5
		lsr.b	#2,d5
		ror.w	#4,d5
		move.w	d5,(a4)+

		addq.l	#1,points(a6)
		subq.l	#1,d0
		dbra	d6,loop1_cm
		subq.l	#1,d3
		dbra	d7,loop0_cm
		rts
 ENDIF
 IF BITMAP = 1
MakeBitMap:	moveq	#63,d7
		move.l	#$8000f800,d5
		moveq	#20,d1		; y
		moveq	#-20,d2
		moveq	#-63,d3		; z
		lea	bitmap(pc),a0
loop0_mbm:	moveq	#-63,d0	; y
		move.l	(a0)+,d4
		moveq	#31,d6
loop1_mbm:	btst	d6,d4
		beq.s	no_point1_mbm
		move.l	d0,(a2)+
		move.w	d1,(a2)+
		move.w	d3,(a2)+

		move.l	d0,(a2)+
		move.w	d2,(a2)+
	neg.w	d3
		move.w	d3,(a2)+
	neg.w	d3
		move.l	d5,(a4)+
		addq.l	#2,points(a6)
no_point1_mbm:	addq.l  #1,d0
		dbra	d6,loop1_mbm
		move.l	(a0)+,d4
		moveq	#31,d6
loop2_mbm:	btst	d6,d4
		beq.s	no_point2_mbm
		move.l	d0,(a2)+
		move.w	d1,(a2)+
		move.w	d3,(a2)+

		move.l	d0,(a2)+
		move.w	d2,(a2)+
	neg.w	d3
		move.w	d3,(a2)+
	neg.w	d3
		move.l	d5,(a4)+
		addq.l	#2,points(a6)
no_point2_mbm:	addq.l  #1,d0
		dbra	d6,loop2_mbm
		addq.l	#1,d3
		dbra	d7,loop0_mbm
		rts
bitmap:		.incbin 'BITMAP.BIN'
 ENDIF

JoyA_1		EQU $810E
JoyA_2		EQU $810D
JoyA_3		EQU $810B
JoyA_4		EQU $8107

GetJoyPad1:	movem.l d0-d2/a0,-(sp)
		move.l	#$F0FFFFFC,d1
		moveq	#$FF,d2
		lea	$F14000,a0
		move.w	#JoyA_1,(a0)
		move.l	(a0),d0
		or.l	d1,d0
		ror.l	#4,d0
		and.l	d0,d2

		move.w	#JoyA_2,(a0)
		move.l	(a0),d0
		or.l	d1,d0
		ror.l	#8,d0
		and.l	d0,d2

		move.w	#JoyA_3,(a0)
		move.l	(a0),d0
		or.l	d1,d0
		rol.l	#6,d0
		rol.l	#6,d0
		and.l	d0,d2

		move.w	#JoyA_4,(a0)
		move.l	(a0),d0
		or.l	d1,d0
		rol.l	#8,d0
		and.l	d0,d2

		not.l	d2
		lea	joy_pad(a6),a0
		move.l	(a0),d0
		move.l	d0,d1
		move.l	d2,(a0)
		and.l	#$FF0FFFFF,d2
		eor.l	d2,d0
		or.l	#$F00000,d2
		and.l	d2,d0
		move.l	d0,4(a0)
		move.l	(a0),d2
		eor.l	d2,d1
		and.l	d2,d1
		move.l	d1,8(a0)
		movem.l (sp)+,d0-d2/a0
		rts

sin_tab:	DC.L 0,1608,3212,4808,6393,7962,9512,11039
		DC.L 12539,14010,15446,16846,18204,19519,20787,22005
		DC.L 23170,24279,25329,26319,27245,28105,28898,29621
		DC.L 30273,30852,31356,31785,32137,32412,32609,32728
		DC.L 32767,32728,32609,32412,32137,31785,31356,30852
		DC.L 30273,29621,28898,28105,27245,26319,25329,24279
		DC.L 23170,22005,20787,19519,18204,16846,15446,14010
		DC.L 12539,11039,9512,7962,6393,4808,3212,1608
		DC.L 0,-1608,-3212,-4808,-6393,-7962,-9512,-11039
		DC.L -12539,-14010,-15446,-16846,-18204,-19519,-20787,-22005
		DC.L -23170,-24279,-25329,-26319,-27245,-28105,-28898,-29621
		DC.L -30273,-30852,-31356,-31785,-32137,-32412,-32609,-32728
		DC.L -32767,-32728,-32609,-32412,-32137,-31785,-31356,-30852
		DC.L -30273,-29621,-28898,-28105,-27245,-26319,-25329,-24279
		DC.L -23170,-22005,-20787,-19519,-18204,-16846,-15446,-14010
		DC.L -12539,-11039,-9512,-7962,-6393,-4808,-3212,-1608

jag_end:
		END
