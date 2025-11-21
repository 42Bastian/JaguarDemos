;; -*-asm-*-

LYXASS	EQU 1
	gpu

DRAW2		equ 1
GOURAUD		set 1

MOD		EQU 1
chip		equ 0
gone		equ 1

	include <js/symbols/jagregeq.js>
	include <js/symbols/blit_eq.js>
	include <js/macro/help.mac>
	include <js/macro/module.mac>

	include "globalreg.h"
	include "video.h"
	include "structs.inc"
	include "engine.h"
 IF MOD = 1
	include "hively.inc"
 ENDIF

CAM_X		equ -220
CAM_Y		equ 80
CAM_Z		equ 50
CAM_ANGLE	equ 0

MACRO MyINITMODULE
.\dest equ (MODrun_\0)+$8000
 IF MODrun_\0 >= $f03000
	movei #(MODrun_\0)+$8000,r0	; dest-adr
 ELSE
	movei #(MODrun_\0),r0	; dest-adr
 ENDIF
	movei #MODstart_\0,r1
	movei #1<<16|(MODlen_\0 >> 2),r2
	movei #overlay,r3
	BL (r3)
ENDM

stacktop	equ $f03ffc

IRQ_STACK	equ $f03020-4

 IFND DRAW2
x_save		equ stacktop-16*4-(max_y+1)*8
 ENDIF

object_data	equ $e0000
tri_ptrs_ram	equ $100000
tri_array_ram	equ $168000

	macro	defobj 	; name,npoints,nfaces
	RSB	\0_rotated,	 	4+\1*_3d_size
	RSB	\0_projected,		4+\1*proj_size
	RSB	\0_normals_rotated,	4+\2*_3d_size
	RSB	\0_vnormals_rotated,	4+\1*_3d_size
	RSB	\0_visible,		4+\2*4
;;->	echo "\0 p %H\0_projected"
;;->	echo "\0 r %H\0_rotated"
//->	echo "\0 n %H\0_normals_rotated"
;;->	echo "\0 v %H\0_vnormals_rotated"
	endm

	RSSET object_data
	defobj	torus,144,288
	defobj	cube,8,12
	defobj	kugel,134,264
	defobj	torus2,144,288
	defobj	cube2,8,12
	defobj	prisma,5,6
	defobj	diamant,20,36
//->	defobj	plane, 121,162
	defobj	plane, dia*dia, 2*(dia-1)*(dia-1)
	RSB	plane_faces,(dia-1)*(dia-1)*2
	echo "End of object: %hRSADDR"


	echo "stacktop %H stacktop"
 IFD x_save
	echo "x_save %H x_save"
 ENDIF

	RSSET $1000
	RSL	OBJECT_LIST,32
	RSL	CAMERA_X
	RSL	CAMERA_Y
	RSL	CAMERA_Z
	RSL	CAMERA_ANGLE_Y
	RSL	LIGHT_X
	RSL	LIGHT_Y
	RSL	LIGHT_Z
	RSL	RLIGHT_X
	RSL	RLIGHT_Y
	RSL	RLIGHT_Z
	RSL	OBJECT_PTR
	RSL	ANGLE_X
	RSL	ANGLE_Y
	RSL	ANGLE_Z
	RSL	X_POS
	RSL	Y_POS
	RSL	Z_POS
	RSL	USE_GOURAUD
	RSL	LastJoy,2

_CAMERA_Y	EQU CAMERA_Y-CAMERA_X
_CAMERA_Z	EQU CAMERA_Z-CAMERA_X
_CAMERA_ANGLE_Y	EQU CAMERA_ANGLE_Y-CAMERA_X
_LIGHT_X	EQU LIGHT_X-CAMERA_X
_LIGHT_Y	EQU LIGHT_Y-CAMERA_X
_LIGHT_Z	EQU LIGHT_Z-CAMERA_X
_RLIGHT_X	EQU RLIGHT_X-CAMERA_X
_RLIGHT_Y	EQU RLIGHT_Y-CAMERA_X
_RLIGHT_Z	EQU RLIGHT_Z-CAMERA_X

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
	movei	#skip_modules,r0
	jump	(r0)
	nop
	include "irq.js"
//->	include "genmap.inc"
	include "engine.js"
	include "control.js"

skip_modules
	movei	#$f02100,IRQ_FLAGADDR
	moveta	IRQ_FLAGADDR,IRQ_FLAGADDR.a

	movei	#1<<14|%11111<<9,r0	; clear all ints, REGPAGE = 1
	store	r0,(IRQ_FLAGADDR)
	nop
	nop

	INITMODULE irq

	movei	#IRQ_STACK,IRQ_SP
	moveta	IRQ_SP,IRQ_SP.a
	movei	#stacktop,SP

	nop

	movei	#memzero,r4
	moveq	#8,r0
	movei	#$4000-8,r1
	BL	(r4)

	movei	#memzero,r4
	movei	#ende,r0
	movei	#$200000-ende,r1
	BL	(r4)
;;; ------------------------------
	include <js/inc/videoinit.inc>

	movei	#$f00028,r0
	movei	#VID_MODE,r1
	storew	r1,(r0)

	moveq	#0,r0
	movei	#$f00400,r1
	store	r0,(r1)
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
 ENDIF
;;; ------------------------------

	movei	#254,r0
	movei	#$0FF0F0FF,r1
	movei	#TxtScreen,r2
	movei	#ASCII,r3
	movei	#InitTxtScreen,r4
	BL	(r4)

 IFND DRAW2
	movei	#x_save,tmp0		; save left/right X in internal RAM
	movei	#max_y,r1
	movei	#(max_x)<<(16),r2	; minX:maxX
.loop0
	subq	#1,r1
	store	r2,(tmp0)
	jr	nn,.loop0
	addqt	#8,tmp0
 ENDIF
	movei	#PrintString_YX,r5
	movei	#Hallo,r0
	moveq	#0,r1
	BL	(r5)

	movei	#ms,r0
	moveq	#2,r1
	shlq	#16,r1
	BL	(r5)

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

	moveq	#op_list>>8,r1
	shlq	#8,r1
	moveq	#31,r2
	shlq	#2,r2
	nop
.cpyobl:
	load	(r10),r3
	addqt	#4,r10
	subq	#1,r2
	store	r3,(r1)
	jr	pl,.cpyobl
	addqt	#4,r1

	movei	#$f00020,r0
	moveq	#op_list>>8,r1
	shlq	#16+8,r1
	store	r1,(r0)

	movei	#1<<14|%11111<<9|%01000<<<4,r1
	store	r1,(IRQ_FLAGADDR)
	nop
	nop

 IF MOD = 1
	moveq	#0,r0
	bset	#14,r0
	movei	#$f1a100,r14
	store	r0,(r14)
	movei	#$f1b000,r0
	store	r0,(r14+$10)	; PC
	moveq	#1,r0
	store	r0,(r14+$14)	; GO
 ENDIF

	movei	#OBJECT_LIST,r0
	movei	#OBJECT_PTR,r1
	store	r0,(r1)

	macro ADD_OBJ
	movei	#obj_\0,r1
	store	r1,(r0)
	addq	#4,r0
	endm

	ADD_OBJ torus2
	ADD_OBJ torus
	ADD_OBJ diamant
	ADD_OBJ cube
	ADD_OBJ cube2
	ADD_OBJ prisma
	ADD_OBJ kugel

	movei	#CAMERA_X,r15
	movei	#CAM_X,r0
	store	r0,(r15)			; camera x
	movei	#CAM_Y,r0
	store	r0,(r15+CAMERA_Y-CAMERA_X)	; camera y
	movei	#CAM_Z,r0
	store	r0,(r15+CAMERA_Z-CAMERA_X)	; camera z
	movei	#CAM_ANGLE*8,r0
	store	r0,(r15+CAMERA_ANGLE_Y-CAMERA_X); camera angle

	movei	#139,r0
	movei	#-105,r1
	movei	#-157,r2
	store	r0,(r15+LIGHT_X-CAMERA_X)
	store	r1,(r15+LIGHT_Y-CAMERA_X)
	store	r2,(r15+LIGHT_Z-CAMERA_X)

	movei	#VID_PIT0,tmp1
	movei	#(26591-1)<<16|0,tmp0
	store	tmp0,(tmp1)

	movei	#createPlaneFaces,r0
	BL	(r0)

//->	MyINITMODULE engine
//->	MyINITMODULE control

	xor	r0,r0
	moveta	r0,vbl_counter.a
****************
* main loop
main_loop:
//->	movei	#drawHex,r8
//->	movefa	screen0.a,r7
//->	movefa	vbl_counter.a,r0
//->	BL	(r8)

	xor	VBLFlag,VBLFlag
	nop
	movei	#$00F00058,r0
	storew	r0,(r0)
.wvbl:
	or	VBLFlag,VBLFlag
	jr	eq,.wvbl
	nop

	moveq	#0,r1
	subq	#1,r1
	movei	#$00F00052,r0
	storew	r1,(r0)

	MyINITMODULE engine
	MBL	engine

	movei	#$00F00052,r0
	loadw	(r0),r0
	neg	r0
	shlq	#16,r0
	shrq	#16,r0
	PUSH	r0

	MyINITMODULE control
	MBL	control

	POP	r0
	moveq	#0,r1
	bset	#17,r1
	movei	#PrintDEC2_YX,r2
	BL	(r2)

	movefa	dump.a,r0
	moveq	#0,r1
	movei	#PrintDEC_YX,r2
	BL	(r2)

	movei	#main_loop,r0
	jump	(r0)
	nop

sqrt::
	normi	r0,r1
	move	r0,r2
	addq	#23,r1
	moveq	#0,r0
	bclr	#0,r1
	moveq	#1,r3
	neg	r1
	jr	.enter
	sh	r1,r3
.loop
	shrq	#2,r3
.enter
	move	r0,r1
	jump	eq,(LR)
	add	r3,r1
	cmp	r1,r2
	jr	cs,.loop
	shrq	#1,r0
	sub	r1,r2
	jr	.loop
	add	r3,r0

	include <js/inc/txtscr.inc>

****************
	align 4
txt_ptr	reg 7
minihex_screen_width	equ max_x
	include <js/inc/minihex.inc>
	unreg txt_ptr

;-----------------------------------------
;- Copy overlay routine
;-----------------------------------------
blitter		reg 14

overlay::
	movei	#BLIT_A1_BASE,blitter
.wbl
	load (blitter+_BLIT_CMD),r3
	shrq #1,r3
	jr cc,.wbl
	nop

	store r0,(blitter)
	store r1,(blitter+_BLIT_A2_BASE)
	movei #BLIT_PITCH1|BLIT_PIXEL32|BLIT_WID3584|BLIT_XADDPHR,r0
	moveq #0,r1
	store r0,(blitter+_BLIT_A1_FLAGS)
	store r0,(blitter+_BLIT_A2_FLAGS)
	store r1,(blitter+_BLIT_A1_PIXEL)
	store r1,(blitter+_BLIT_A2_PIXEL)

	movei #BLIT_SRCEN|BLIT_LFU_REPLACE|BLIT_BUSHI,r1
	store r2,(blitter+_BLIT_COUNT)
	store r1,(blitter+_BLIT_CMD)

.wbl2
	shrq #1,r1
	jr cc,.wbl2
	load (blitter+_BLIT_CMD),r1
	jump	(LR)
	nop

	unreg	blitter

****************************************
* Create the triangles for the landscape
*
* Done only once
****************************************
createPlaneFaces::

face_ptr	reg 99
p0		reg 99
p1		reg 99
p2		reg 99
p3		reg 99
LOOPZX		reg 99
ix		reg 99
iz		reg 99

	movei	#plane_faces+4,face_ptr

	moveq	#0,p0
	moveq	#1,p1
	moveq	#dia,p2
	moveq	#dia+1,p3

	moveq	#dia-1,iz
	moveq	#dia-1,ix
	move	PC,LOOPZX
	addq	#4,LOOPZX
.loopxz
	storew	p0,(face_ptr)
	addq	#2,face_ptr
	storew	p1,(face_ptr)
	addq	#2,face_ptr
	storew	p2,(face_ptr)
	addq	#4,face_ptr

	storew	p1,(face_ptr)
	addq	#2,face_ptr
	storew	p3,(face_ptr)
	addq	#2,face_ptr
	storew	p2,(face_ptr)
	addqt	#1,p0
	addqt	#1,p1
	addqt	#1,p2
	subq	#1,ix
	addqt	#1,p3
	jump	ne,(LOOPZX)
	addqt	#4,face_ptr

	addqt	#1,p0
	addqt	#1,p1
	addqt	#1,p2
	subq	#1,iz
	addqt	#1,p3
	jump	ne,(LOOPZX)
	moveq	#dia-1,ix

	movei	#plane_faces,tmp0
	sub	tmp0,face_ptr
	shrq	#3,face_ptr
	jump	(LR)
	store	face_ptr,(tmp0)

	unreg ix,iz,p0,p1,p2,p3,face_ptr,LOOPZX
******************
* text-data
Hallo:		dc.b 0
	DC.B "move: A/B/C + U/D // change focus: O",0
FaceTxt:	DC.B " faces/",0
PointsTxt:	DC.B " points",0
ms:		DC.B "  ms/f X= 123456 Y= 123456 Z= 123456",0
	EVEN

	align 8
obl0:
	.ibytes "obl0_50.bin"
obl1:
	.ibytes "obl1_50.bin"

obl0_60hz:
	.ibytes "obl0_60.bin"

obl1_60hz:
	.ibytes "obl1_60.bin"

	align 4
ASCII::
	.ibytes <font/light8x8.fnt>

	.align 8
	include <js/inc/memzero.inc>
	include <js/inc/memset.inc>
	include "pobjects.inc"
	include "sintab.inc"
	include "plane2.inc"

	IF MOD = 1
	align 8
DSP_start:
	ibytes "hively_player.bin"
DSP_end:
	.long
song:
 if chip = 1
        .incbin "mod/chiprolled.hvl.streambits"
 endif
 if gone = 1
        .incbin "mod/gone.ahx.streambits"
 endif
	.long
binPrecalcTable:
	ibytes "AHX_FilterPrecalc.bin"
	.long
panning_table:
	ibytes "AHX_panning.bin"
	ENDIF

nnormals	equ (plane_vnormals - plane_normals)/16

	echo "plane y:  %Hplane_y"
	echo "plane col:%Hplane_col"
	echo "plane n:  %Hplane_normals"
	echo "plane n#: %Dnnormals"
	echo "plane v:  %Hplane_vnormals"
	echo "plane pro:%Xplane_projected"
	echo "plane fcs:%Xplane_faces"

	align	32
ende:		equ *
	echo "ENDE : %Hende"

	end
