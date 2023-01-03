* JAG_BALL
* written : 6.8.94
* last change : 27.12.22
*	15.10.96/24.09.95/21.10.94/29.8.94/22.8.94/8.8.94/7.8.94
*
* (c) 1994 Bastian Schick
*
* Steuerung :
* up + ABC => XYZ-Add +1
* down + ABC => XYZ-Add -1
* 1/2/3 => XYZ-Add != XYZ-Add
* 4/5/6 => XYZ-Add = 0
* 0	=> X-Add = Y-Add = Z-Add = 0
* Option => reset

	.68000

TJ_ASS	EQU 0

	include "68k_inc/jaguar.inc"
	include "68k_mac/help.mac"
	include "68k_inc/blit_eq.inc"
	include "68k_var/objects.var"

BITMAP		EQU 1	; 1 = build /|\ Bitmap
COLORMAP	EQU 1	; 1 = build CRY map
BALL		EQU 1
MMULT		EQU 0

DEBUG		EQU 0

ScreenMode	EQU CRY16|VIDEN|PWIDTH4|BGEN|CSYNC

TextWidth	EQU 1	; 2*8 Bytes
TextHeight	EQU 24
TWB		EQU TextWidth*8

screen		EQU $100000
screen1		EQU $100008
z_buffer	EQU $100010
TextScreen	EQU screen-TWB*TextHeight
vars		EQU $050000
max_y		EQU 240

	RSRESET

	RSB obj0_list, 256
	RSB obj1_list, 256
	RSW count_obj, 1
	RSL joy_pad,   3
	RSL points,    1
	RSW flag,      1
	RSW scr_flag,  1
	RSW radius,    1
	RSL log,       1
	RSL _normal,   1
	RSL alpha_add, 1
	RSL beta_add,  1
	RSL delta_add, 1
	RSL alpha,     1
	RSL beta,      1
	RSL delta,     1
	RSL last,      1
	RSL Cursor,    1
	RSW a_vde,     1
	RSW a_vdb,     1
	RSL endofvars, 1

vars_size EQU RSCOUNT

jag_prg:
start:
	INCLUDE "68k_inc/startup.inc"
;-----------------
	move	#$2700,sr
	lea	$3FFC,sp
	lea	vars,a6
	move.l	a6,a0
	move.l	#vars_size,d0
	bsr	memzero

	lea	$f03000+$8000,a0
	move.l	#4096,d0
	bsr	memzero	; zero complete GPU ram

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
	move.w	#80,radius(a6)
	;; create dots
	bsr	xaxe
	bsr	yaxe
	bsr	zaxe
	IF BALL = 1
	bsr	kugel
	ENDIF

	IF COLORMAP = 1
	bsr	ColorMap
	ENDIF
	IF BITMAP = 1
	bsr	MakeBitMap
	ENDIF

	;; init screens
	lea	screen1,a5
	bsr	cls
	bsr	swap
	bsr	cls
	bsr	swap


	move.l	points(a6),d0
	clr.l	Cursor(a6)
	bsr	PrintDEC

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
	bsr	PrintDEC

ok:
	move.l  #TWB*8,Cursor(a6)
	bsr	PrintDEC

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
;;->	illegal
	bra	lo0
no_reset:
	btst	#28,d0	; PAUSE
	beq.s	no_break
;;->	illegal
	nop
	bra	lo0

no_break:
	btst	#29,d0	; "A"
	beq.s	no_A
	btst	#20,d0	; up
	beq.s	skip0
	subq.l	#1,d5
skip0:
	btst	#21,d0
	beq.s	cont_joy
	addq.l	#1,d5
	bra.s	cont_joy
no_A:
	btst	#25,d0	; "B"
	beq.s	no_B
	btst	#20,d0	; up
	beq.s	skip1
	subq.l	#1,d6
skip1:
	btst	#21,d0
	beq.s	cont_joy
	addq.l	#1,d6
	bra.s	cont_joy
no_B:
	btst	#13,d0	; "C"
	beq.s	cont_joy
	btst	#20,d0	; up
	beq.s	skip2
	subq.l	#1,d7
skip2:
	btst	#21,d0
	beq.s	cont_joy
	addq.l	#1,d7
cont_joy:
	btst	#4,d0	; "0"
	beq.s	no_0
	moveq	#0,d5
	moveq	#0,d6
	moveq	#0,d7
no_0:
	btst	#19,d0	; "1"
	beq.s	skip3
	neg.l	d5
skip3:
	btst	#7,d0	; "2"
	beq.s	skip4
	neg.l	d6
skip4:
	btst	#3,d0	; "3"
	beq.s	skip5
	neg.l	d7
skip5:
	btst	#18,d0	; "4"
	beq.s	skip6
	moveq	#0,d5
skip6:
	btst	#6,d0	; "5"
	beq.s	skip7
	moveq	#0,d6
skip7:
	btst	#2,d0	; "6"
	beq.s	skip8
	moveq	#0,d7
skip8:
	btst	#9,d0
	beq.s	no_opt
	moveq	#0,d5
	moveq	#0,d6
	moveq	#0,d7
	movem.l d5-d7,alpha(a6)
no_opt:
	movem.l d5-d7,alpha_add(a6)
	bra	lo


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

InitOP:
	lea	obj1_list(a6),a0	; background list
	lea	obj0_list(a6),a1	; active list address
	lea	Objekte(pc),a2	; source
	bsr	MakeOBL

	bsr	CopyOBL

	lea	$F00000,a0
	lea	obj0_list(a6),a1
	move.l	a1,d0
	swap	d0
	move.l	d0,$20(a0)
	clr.w	$26(a0)	; OPF
	move.w	#$1F01,$E0(a0)
	move.w	#ScreenMode,$28(a0)
	clr.w	$E2(a0)
	lea	my_irq(pc),a0
	move.l	a0,$0100.w
	move.w	#$2000,sr
	rts

my_irq:
	movem.l	d0-d1/a0-a1,-(sp)
	move.w	$F000E0,d0
	btst	#0,d0
	beq.s	no_vi
	bsr	CopyOBL
	move.w	scr_flag(a6),$F00026
	clr.w	flag(a6)

	move.w	#$0101,$F000E0
no_vi:
	clr.w	$F000E2
	movem.l	(sp)+,d0-d1/a0-a1
	rte
*****************
* swap
*****************
swap:
	not.w	scr_flag(a6)
	move.l	a5,d0
	eor.b	#8,d0
	move.l	d0,a5

	subq.w	#1,flag(a6)
swap1:
	stop	#$2000
	tst.w	flag(a6)
	bne.s	swap1
	rts
*****************
* Objects
*****************
Objekte:
 BRA_OBJ start_obj,30,"<",-7	; y<30 => STOP
 BRA_OBJ end_obj,500,">",-7	; y>500 => STOP
* Info
 BITMAP_OBJ TextScreen,24,60,TextHeight,0,0,TextWidth,TextWidth,0,4,0,NEXT_OBJ

 BRA_OBJ ofl_obj,$7ff,OBJ_BRANCH_OPFLAG,-6

 BITMAP_OBJ screen,20,36,max_y,4,3,(320*2*3)>>3,(320*2)>>3,0,4,0,NEXT_OBJ
 STOP_OBJ 0,0

 BITMAP_OBJ screen1,20,36,max_y,4,3,(320*2*3)>>3,(320*2)>>3,0,4,0,NEXT_OBJ
* EOL
 EOL_OBJ

*******************
* InitGPU
*****************
InitGPU:
	lea	$00F02110,a4
	lea	GPUcode+4(pc),a0
	moveq	#0,d0
	move.l	d0,4(a4)	; GPU halt
	movea.l (a0)+,a1	; destination
	lea	$10(a1),a3	; skip 68k irq vector
	move.l	a3,(a4)	; set GPU PC
	move.l	(a0)+,d0	; Length in Bytes
	adda.l	#$8000,a1	; 32bit writes
	bra	memcpy

	.phrase
	dc.l	0	; dummy to align code after BJL header

GPUcode:
 IF MMULT = 1
	.incbin 'ROT5Z_MM.O'
 ELSE
	.incbin 'ROTATEZ5.O'
 ENDIF

; IN : d0	alpha
;      d1	beta
;      d2	gamma
DoGPU:
	lea	$F04000-11*4,a0
 move.l	#BLIT_XADDPIX|BLIT_WID320|BLIT_ZOFFS1|BLIT_PIXEL16|BLIT_PITCH3,d3
	tst.w	scr_flag(a6)
	beq.s	ok_dg
 move.l	#BLIT_XADDPIX|BLIT_WID320|BLIT_ZOFFS2|BLIT_PIXEL16|BLIT_PITCH3,d3

ok_dg:
	move.l	d3,(a0)+
	addq.l	#4,a0	; was: color table (now unused)
	move.l	a5,(a0)+	; draw screen

	lea	sin_tab(pc),a1
	move.w	#$01FC,d4
	lsl.w	#2,d2
	move.w	#32*4,d3
	add.w	d2,d3
	and.w	d4,d2
	and.w	d4,d3
	move.l	0(a1,d3.w),(a0)+ ; cos gamma
	move.l	0(a1,d2.w),(a0)+ ; sin gamma
	lsl.w	#2,d1
	move.w	#32*4,d3
	add.w	d1,d3
	and.w	d4,d1
	and.w	d4,d3
	move.l	0(a1,d3.w),(a0)+ ; cos beta
	move.l	0(a1,d1.w),(a0)+ ; sin beta
	lsl.w	#2,d0
	move.w	#32*4,d3
	add.w	d0,d3
	and.w	d4,d0
	and.w	d4,d3
	move.l	0(a1,d3.w),(a0)+ ; cos alpha
	move.l	0(a1,d0.w),(a0)+ ; sin alpha

	move.l	points(a6),(a0)+
	move.l	_normal(a6),(a0)+ ; vertices
	lea	$F02110,a0
	move.l	GPUcode+4(pc),(a0)+
	move.w	#$01|(1<<11),d0
	move.l	d0,(a0)
wait_gpu1:
	move.l  (a0),d0
	lsr.w	#1,d0
	bcs.s	wait_gpu1
	rts
*****************
* PrintBin
*****************
 IF 0
PrintBIN:
	movem.l d0-d2,-(sp)
	moveq	#31,d1
	move.l	d0,d2
loop_pb:
	moveq	#0,d0
	add.l	d2,d2
	bcc.s	ok_pb
	addq.w	#1,d0
ok_pb:
	bsr	PrintZiffer
	dbra	d1,loop_pb
	movem.l (sp)+,d0-d2
	rts
ENDIF
*****************
* PrintDEC
*****************
PrintDEC:
	movem.l d0/a0-a1,-(sp)
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

PrintZiffer2:
	lsl.w	#3,d0
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
*****************
* PrintDEC2
*****************
 IF 0
PrintDEC2:
	divu	#10,d0
	bsr.s	PrintZiffer
	swap	d0
	ext.l	d0
	bsr.s	PrintZiffer
	rts
 ENDIF
PrintZiffer:
	movem.l d0/a0-a1,-(sp)
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

InitTxtScreen:
	lea	TextScreen,a0
	move.l	#$F0FF,$F00400
	move.w	#TWB*TextHeight-1,d0
	moveq	#0,d1
loop_its:
	move.l  d1,(a0)+
	dbra	d0,loop_its
	rts

_0:	.incbin 'ZAHLEN.BIN'
****************************************
** CLS
****************************************
cls:	movem.l d0/a0,-(sp)
	lea	$F02200,a0
	move.l	a5,(a0)
 move.l	#BLIT_XADDPHR|BLIT_WID320|BLIT_ZOFFS1|BLIT_PIXEL32|BLIT_PITCH3,d0
	tst.w	scr_flag(a6)
	beq.s	ok_cls
 move.l	#BLIT_XADDPHR|BLIT_WID320|BLIT_ZOFFS2|BLIT_PIXEL32|BLIT_PITCH3,d0
ok_cls:
	move.l	d0,BLIT_A1_FLAGS(a0)
	moveq	#0,d0
	move.l	d0,BLIT_A1_PIXEL_PTR(a0)
	move.l	d0,BLIT_A1_PIXEL_FRACT(a0)
;;->	move.l	#$01800180,BLIT_SRC_Z1(a0)
;;->	move.l	#$01800180,BLIT_SRC_Z1+4(a0)
	move.l	d0,BLIT_SRC_Z1(a0)
	move.l	d0,BLIT_SRC_Z1+4(a0)
	move.l	d0,BLIT_SRC_Z2(a0)
	move.l	d0,BLIT_SRC_Z2+4(a0)
	move.l	d0,BLIT_PATTERN_DATA(a0)
	move.l	d0,BLIT_PATTERN_DATA+4(a0)
 IF ^^defined BPE
	move.l	#(2<<16)|(max_y*320/2),$3C(a0)
 ELSE
	move.l	#(1<<16)|(max_y*320/2),$3C(a0)
 ENDIF
	move.l	#BLIT_PATDSEL|BLIT_DSTWRZ,$38(a0)
wait_cls:
	move.l  BLIT_COMMAND(a0),d0
	btst	#0,d0
	beq.s	wait_cls
	movem.l (sp)+,d0/a0
	rts

kugel:
	moveq	#63,d7
	lea	sin_tab(pc),a0

	moveq	#0,d6	; sin_phi
	move.w	#32*4,d5	; cos_phi

loop_k1:
	movea.w #127,a1
	moveq	#0,d4	; sin_theta
	move.w	#32*4,d3	; cos_theta

loop_k2:
	move.l  0(a0,d6.w),d0	; sin(phi)
	muls	radius(a6),d0
	swap	d0
	rol.l	#1,d0
	move.w	d0,d2	; d2=r*sin(phi)

	move.l	0(a0,d4.w),d1	; sin(theta)
	muls	d1,d0
	swap	d0
	rol.l	#1,d0	; x=r*sin(phi)*sin(theta)

	move.l	0(a0,d3.w),d1
	muls	d2,d1
	swap	d1
	rol.l	#1,d1	; y=r*sin(phi)*cos(theta)

	move.l	0(a0,d5.w),d2
	muls	radius(a6),d2
	swap	d2
	rol.l	#1,d2	; z=r*cos(phi)

	move.w	#$1000,(a2)+
	move.w	d0,(a2)+
	move.w	d1,(a2)+
	move.w	d2,(a2)+

	addq.l	#1,points(a6)

	addq.w	#4,d3
	addq.w	#4,d4
	and.w	#$01FC,d3
	and.w	#$01FC,d4
	subq.w	#1,a1
	move.w	a1,d0
	bpl.s	loop_k2
	addq.w	#4,d5
	addq.w	#4,d6
	and.w	#$01FC,d5
	and.w	#$01FC,d6
	dbra	d7,loop_k1
	rts

xaxe:
	moveq	#20,d7
	move.w	#$F000,d0
	moveq	#0,d1
	move.w	radius(a6),d1
	move.l	d1,d2
	neg.l	d2
	moveq	#0,d3
	moveq	#0,d4
loop_xaxe:
	movem.w d0-d1/d3-d4,(a2)
	addq.l	#8,a2
	movem.w d0/d2-d4,(a2)
	addq.l	#8,a2
	addq.l	#2,points(a6)
	addq.l	#1,d1
	subq.l	#1,d2
	dbra	d7,loop_xaxe
	rts

yaxe:
	move.w  #20,d7
	move.w	#$9E00,d0
	moveq	#0,d1
	moveq	#0,d2
	move.w	radius(a6),d2
	move.l	d2,d3
	neg.l	d3
	moveq	#0,d4
loop_yaxe:
	movem.w	d0-d1/d3-d4,(a2)
	addq	#8,a2
	movem.w	d0-d2/d4,(a2)
	addq	#8,a2
	addq.l	#2,points(a6)
	addq.l	#1,d2
	subq.l	#1,d3
	dbra	d7,loop_yaxe
	rts

zaxe:
	move.w  #20,d7
	move.w	#$C800,d0
	moveq	#0,d1
	moveq	#0,d2
	moveq	#0,d3
	move.w	radius(a6),d3
	move.l	d3,d4
	neg.l	d4
loop_zaxe:
	movem.w	d0-d3,(a2)
	addq	#8,a2
	movem.w	d0-d2/d4,(a2)
	addq	#8,a2
	addq.l	#2,points(a6)
	addq.l	#1,d3
	subq.l	#1,d4
	dbra	d7,loop_zaxe
	rts
 IF COLORMAP = 1
ColorMap:
	moveq	#63,d7
	move.l	#$FF00,d5
	moveq	#100,d1	; y
	moveq	#-20,d2
	moveq	#31,d3	; z
loop0_cm:
	moveq	#31,d0	; x
	moveq	#63,d6
loop1_cm:
	move.w	d6,d5
	lsr.w	#2,d5
	ror.w	#4,d5
	or.w	d7,d5
	lsr.b	#2,d5
	ror.w	#4,d5

	move.w	d5,(a2)+
	move.w	d0,(a2)+
	move.w	d1,(a2)+
	move.w	d3,(a2)+

	addq.l	#1,points(a6)
	subq.l	#1,d0
	dbra	d6,loop1_cm
	subq.l	#1,d3
	dbra	d7,loop0_cm
	rts
 ENDIF
 IF BITMAP = 1
MakeBitMap:
	moveq	#63,d7
	move.l	#$f8008000,d5
	moveq	#20,d1	; y
	moveq	#-20,d2
	moveq	#-63,d3	; z
	lea	bitmap(pc),a0
loop0_mbm:
	moveq	#-63,d0	; y
	move.l	(a0)+,d4
	moveq	#31,d6
loop1_mbm:
	btst	d6,d4
	beq.s	no_point1_mbm
	move.w	d5,(a2)+
	move.w	d0,(a2)+
	move.w	d1,(a2)+
	move.w	d3,(a2)+

	swap	d5
	move.w	d5,(a2)+
	swap	d5
	move.w	d0,(a2)+
	move.w	d2,(a2)+
	neg.w	d3
	move.w	d3,(a2)+
	neg.w	d3
	addq.l	#2,points(a6)
no_point1_mbm:
	addq.l  #1,d0
	dbra	d6,loop1_mbm
	move.l	(a0)+,d4
	moveq	#31,d6
loop2_mbm:
	btst	d6,d4
	beq.s	no_point2_mbm
	move.w	d5,(a2)+
	move.w	d0,(a2)+
	move.w	d1,(a2)+
	move.w	d3,(a2)+

	swap	d5
	move.w	d5,(a2)+
	swap	d5
	move.w	d0,(a2)+
	move.w	d2,(a2)+
	neg.w	d3
	move.w	d3,(a2)+
	neg.w	d3
	addq.l	#2,points(a6)
no_point2_mbm:
	addq.l  #1,d0
	dbra	d6,loop2_mbm
	addq.l	#1,d3
	dbra	d7,loop0_mbm
	rts
bitmap:	.incbin 'BITMAP.BIN'
 ENDIF

	include "68k_inc/memzero.inc"
	include "68k_inc/memcpy.inc"
	include "68k_inc/objects.inc"
	include "68k_inc/videoinit.inc"
	include "68k_inc/joypad1.inc"
sin_tab:
	DC.L 0,1608,3212,4808,6393,7962,9512,11039
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
