;; -*-asm-*-

LYXASS	EQU 1
	gpu

DRAW2		equ 1
GOURAUD		set 1
SOFTCLIP	set 1
LANDSCAPE	set 1
TEXTURE		set 1
FPS		set 1		; fixed frame rate

IFND MOD
MOD		EQU 0
ENDIF

chip		equ 0
gone		equ 1
galactic	equ 0

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


CAM_X		equ -402
CAM_Y		equ 50
CAM_Z		equ 2238
//->CAM_Z		equ 2408 	; texture glitch
CAM_ANGLE	equ 288

;;->CAM_X		equ -280
;;->CAM_Y		equ 50
;;->CAM_Z		equ 1900
;;->CAM_ANGLE	equ 52

//->CAM_X		equ -318
//->CAM_Y		equ 50
//->CAM_Z		equ 2468
//->CAM_ANGLE	equ 256

	echo "TxtScreen: %H TxtScreen"
	echo "screen1:   %H screen1"
	echo "screen0:   %H screen0"

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

 IF DRAW2 = 0
x_save		equ stacktop-16*4-(max_y+1)*8
 ENDIF

object_data	equ $110000

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
 IF 0
	set@	0
	rept 40
	defobj	cube@,8,12
	inc@
	endr
 ENDIF
	defobj	cube2,8,12
	defobj	prisma,5,6
	defobj	diamant,20,36


	defobj	plane, dia*dia, 2*(dia-1)*(dia-1)
	RSB	plane_faces,4+(dia-1)*(dia-1)*2*face_size
	RSW	_plane_normals,2+2*(world_size-1)*(world_size-1)*4
	RSW	_plane_vnormals,2+world_size*world_size*4
	RSB	_plane_y,world_size*world_size
	echo "End of object: %hRSADDR"
	RSALIGN 8
	RSB	blit_buf,32*4900
blit_buf_end equ RSADDR
	RSL	tri_ptrs_ram,256
	RSB	tri_array_ram,_tri_size*900
mem_end	EQU RSADDR

 if mem_end > logo_screen
	echo "********************"
	fail "Out of memory"
	echo "********************"
 endif

	echo "blit_buf %H blit_buf"
	echo "blit_buf_end %H blit_buf_end"
	echo "memory end: %H mem_end"

	echo "stacktop %H stacktop"
 IFD x_save
	echo "x_save %H x_save"
 ENDIF

	RSSET $1000
	RSL	OBJECT_LIST,64
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
	RSL	USE_PHRASE
	RSL	IS_PAL
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

	echo "RSPC: %H RSADDR"

	MACRO WAITBLITTER
.\waitblit
	load (blitter+$38),tmp0
	btst	#0,tmp0
	jr	z,.\waitblit
	nop
	ENDM

	run $2000
//->	run $6000 		; for VJ
start::
********************
* init
init:
	movei	#skip_modules,r0
	nop
	jump	(r0)
	nop
	dc.l	$4e722700
	include "irq.js"
//->	include "genmap.inc"
	include "engine.js"
	include "control.js"
	include "buildplane.inc"

	align	4
skip_modules


	movei	#$f02100,IRQ_FLAGADDR
	moveta	IRQ_FLAGADDR,IRQ_FLAGADDR.a

	movei	#1<<14|%11111<<9,r0	; clear all ints, REGPAGE = 1
	store	r0,(IRQ_FLAGADDR)
	nop
	nop

patch_fps		equ _patch_fps-MODrun_irq+MODstart_irq

	movei	#$00F14003,r0
	loadb	(r0),r0
	movei	#patch_fps,r1
	btst	#4,r0
	loadw	(r1),r0
	jr	eq,.no_fps_fix
	addq	#32,r0		; increase "MOVEQ"
	storew	r0,(r1)
.no_fps_fix:

	INITMODULE irq

	movei	#IRQ_STACK,IRQ_SP
	moveta	IRQ_SP,IRQ_SP.a
	movei	#stacktop,SP

	movei	#memzero,r4
	movei	#$180,r0
	movei	#start-$120,r1
	BL	(r4)

	movei	#memzero,r4
	movei	#ende,r0
	movei	#$200000-ende,r1
	BL	(r4)

;;; ------------------------------
	include <js/inc/videoinit.inc>
;;; ------------------------------
;;; patch aspect ration for different resolutions
;;; in case of NTSC mode
;;;

 IF NO_ASPECT_FIX = 0
patch_aspect	equ _fix_ntsc_aspect-MODrun_engine+MODstart_engine
patch_aspect2	equ _fix_ntsc_aspect-MODrun_engine+MODstart_engine


	movei	#20*50,r4
	movei	#$00F14003,r0
	loadb	(r0),r0
	movei	#patch_aspect,r1
	btst	#4,r0
	movei	#patch_aspect2,r2
	jr	eq,.patch_pal
	nop
	movei	#16*60,r4
	addq	#10,r4
 IF max_x = 640
	movei	#aspect_patch_ntsc,r0
	addq	#2,r1
	addq	#2,r2
	storew	r0,(r1)
	storew	r0,(r2)
 else
	movei	#(35<<10)|aspect_patch_ntsc<<5|2,r0 ; moveq #n,r2
	storew	r0,(r1)
	storew	r0,(r2)
 endif

.patch_pal
	movei	#IS_PAL,r3
	store	r4,(r3)
;;->	echo "aspect2: %Hpatch_aspect"
;;->	echo "aspect2: %Hpatch_aspect2"
 ENDIF
;;; ------------------------------

	movei	#$f00028,r0
	movei	#VID_MODE,r1
	storew	r1,(r0)

	movei	#$ffcf,r0
	movei	#$f00400,r1
	store	r0,(r1)
;;; ------------------------------
	movei	#logo_screen,r0
	movei	#logo,r1
	movei	#8*10/4,r2
cpy_logo:
	load	(r1),r3
	addq	#4,r1
	subq	#1,r2
	store	r3,(r0)
	jr	nz,cpy_logo
	addq	#4,r0

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
	movei	#$120,r0
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

 IF DRAW2 = 0
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
	movei	#info,r0
	moveq	#3,r1
	shlq	#16,r1
	BL	(r5)

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

	movei	#1<<14|%11111<<9|%01000<<4,r1
	store	r1,(IRQ_FLAGADDR)
	nop
	nop

	nop
	MyINITMODULE buildPlane
	MBL	buildPlane

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

	ADD_OBJ kugel
//->	ADD_OBJ torus2
//->	ADD_OBJ torus
//->	ADD_OBJ diamant
	ADD_OBJ cube
 IF 0
	set@ 	0
	rept	40
	ADD_OBJ cube@
	inc@
	endr
 ENDIF
//->	ADD_OBJ cube2
//->	ADD_OBJ prisma


	movei	#CAMERA_X,r15
	movei	#CAM_X,r0
	store	r0,(r15)			; camera x
	movei	#CAM_Y,r0
	store	r0,(r15+CAMERA_Y-CAMERA_X)	; camera y
	movei	#CAM_Z,r0
	store	r0,(r15+CAMERA_Z-CAMERA_X)	; camera z
	movei	#CAM_ANGLE*4,r0
	store	r0,(r15+CAMERA_ANGLE_Y-CAMERA_X); camera angle

	movei	#139,r0
	movei	#-105,r1
	movei	#-157,r2
	store	r0,(r15+LIGHT_X-CAMERA_X)
	store	r1,(r15+LIGHT_Y-CAMERA_X)
	store	r2,(r15+LIGHT_Z-CAMERA_X)

	movei	#USE_GOURAUD,r0
	moveq	#0,r1
	not	r1
	store	r1,(r0)
	addq	#4,r0
	moveq	#0,r1
	store	r1,(r0)

	movei	#VID_PIT0,tmp1
	movei	#(26591-1)<<16|0,tmp0
	store	tmp0,(tmp1)

	movei	#createPlaneFaces,r0
	nop
	BL	(r0)


//->	MyINITMODULE engine
//->	MyINITMODULE control

	xor	r0,r0
	moveta	r0,blit_cnt.a
	moveta	r0,vbl_counter.a
****************
* main loop
main_loop:
	movei	#$00F00058,r1
	moveq	#0,r2
	storew	r1,(r1)


wait_blitter:
	movefa	blit_cnt.a,r0
	cmpq	#0,r0
	jr	ne,wait_blitter
	nop
	storew	r2,(r1)

	movei	#$00F00052,r2
	loadw	(r2),r0		; work time
	PUSH	r0

	moveq	#0,r0
	moveta	r0,VBLFlag.a
.wvbl:
	cmpq	#0,r0
	jr	eq,.wvbl
	movefa	VBLFlag.a,r0

	loadw	(r2),r0		; total frame time
	PUSH	r0

	moveq	#0,r1
	subq	#1,r1
	storew	r1,(r2)

	MyINITMODULE engine
	MBL	engine

//->	movei	#$00F00052,r0
//->	loadw	(r0),r0
//->	neg	r0
//->	shlq	#16,r0
//->	shrq	#16,r0
//->	PUSH	r0

	MyINITMODULE control
	MBL	control

blitter	reg 14

	movei	#$f02200,r14
.waitblit2:
	load	(blitter+$38),tmp2 ; wait for previous blit
	btst	#0,tmp2
	jr	eq,.waitblit2
	nop

	movei	#BLIT_PITCH1|BLIT_PIXEL16|BLIT_WID64|BLIT_XADDINC,tmp1
	movei	#BLIT_PITCH1|BLIT_PIXEL16|BLIT_WIDTH|BLIT_XADDPIX,tmp2
	store	tmp1,(r14+_BLIT_A1_FLAGS)
	store	tmp2,(r14+_BLIT_A2_FLAGS)
	movefa	screen0.a,tmp1
	store	tmp1,(r14+_BLIT_A2_BASE)

 unreg blitter

	movei	#blit_buf,r15
//->	movefa	blit_cnt.a,r0
//->	movei	#no_data,r1
//->	cmp	r0,r15
//->	jump	eq,(r1)
	load	(r15),r0
	load	(r15+4),r1
	load	(r15+8),r2
	load	(r15+12),r3
	load	(r15+16),r4
	load	(r15+20),r5
	load	(r15+24),r6
	load	(r15+28),r7
	addq	#32,r15
	moveta	r15,r15

	movei	#$f02200,r14
	store	r0,(r14+_BLIT_A2_PIXEL)
	store	r1,(r14+_BLIT_A1_PIXEL)
	store	r2,(r14+_BLIT_A1_FPIXEL)
	store	r3,(r14+_BLIT_A1_BASE)
	store	r4,(r14+_BLIT_A1_INC)
	store	r5,(r14+_BLIT_A1_FINC)
	store	r6,(r14+_BLIT_IINC)
	movei	#BLIT_SRCEN|BLIT_LFU_REPLACE|BLIT_DSTA2|BLIT_UPDA1|BLIT_SRCSHADE|BLIT_GOURZ,r0
	store	r7,(r14+ _BLIT_COUNT)

	movei	#1<<14|%11111<<9|%11000<<4,r1
	store	r1,(IRQ_FLAGADDR)
	nop
	nop

	store	r0,(r14+_BLIT_CMD)

//->wait_blitter2:
//->	movefa	blit_cnt.a,r0
//->	cmpq	#0,r0
//->	jr	ne,wait_blitter2
//->	nop
no_data:
	POP	r1
	neg	r1
	shlq	#16,r1
	shrq	#16,r1
	move	r1,r2
	shrq	#1,r2
	movei	#1000,r0
	add	r2,r0
	div	r1,r0

	moveq	#31,r1
	and	r1,r0
	moveq	#0,r1
	bset	#17,r1
	movei	#PrintDEC2_YX,r2
	BL	(r2)
.nofps
	POP	r0
	neg	r0
	shlq	#16,r0
	shrq	#16,r0

	moveq	#6,r1
	bset	#17,r1
	movei	#PrintDEC_YX,r2
	BL	(r2)

	movefa	dump.a,r0
	moveq	#0,r1
	movei	#PrintDEC_YX,r2
	BL	(r2)

//->	movefa	dump0.a,r0
	movefa	blit_cnt.a,r0
	moveq	#9,r1
	movei	#PrintHEX_YX,r2
	BL	(r2)

	movei	#main_loop,r0
	nop
	jump	(r0)
	nop

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

	align 4
overlay::
	movei	#BLIT_A1_BASE,blitter
	nop
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
	align	4
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
	nop

	moveq	#0,p0
	moveq	#1,p1
 IF dia < 31
	moveq	#dia,p2
	moveq	#dia+1,p3
	moveq	#dia-1,iz
	moveq	#dia-1,ix
 else
	movei	#dia,p2
	movei	#dia+1,p3
	movei	#dia-1,iz
	movei	#dia-1,ix
 endif
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

	nop
	addqt	#1,p0
	addqt	#1,p1
	addqt	#1,p2
	subq	#1,iz
	moveq	#dia-1,ix
	jump	ne,(LOOPZX)
	addqt	#1,p3

	movei	#plane_faces,tmp0
	sub	tmp0,face_ptr
	shrq	#3,face_ptr
	nop
	jump	(LR)
	store	face_ptr,(tmp0)

	unreg ix,iz,p0,p1,p2,p3,face_ptr,LOOPZX
******************
* text-data
Hallo:		DC.B " 000000 tris   move: 1/2/3 + U/D // focus: O",0
ms:		DC.B "00FPS  000000ms   X 123456 Y 123456 Z 123456",0
info:		dc.b "     3D poly engine (c)'25 42Bastian",0
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
logo:
	;;    0123456789ABCDEF0123456789ABCDEF
	dc.l %11111111111111111111111111111110,0
	dc.l %10000000000000000000000000000010,0
	dc.l %10110001101000010010001001110010,0
	dc.l %10101010001010101001010101000010,0
	dc.l %10110001001110001000000101100010,0
	dc.l %10101000100010010000001000010010,0
	dc.l %10110011000010111000011101100010,0
	dc.l %10000000000000000000000000000010,0
	dc.l %11111111111111111111111111111110,0

	align 4
ASCII::
	.ibytes <font/light8x8.fnt>

	.align 8
	include <js/inc/memzero.inc>
	include <js/inc/memset.inc>
	include <js/inc/memcpy.inc>
	include "pobjects.inc"
	include "sintab.inc"
	include "plane2.inc"

	include "texture.inc"
brick:
	incbin "brick_64x64.cry"
grass:
	incbin "grass_64x64.cry"
waves:
//->	rept 256*256
//->	dc.w	$80ff
//->	endr
	incbin "waves_64x64.cry"

	IF MOD = 1
	align 8
DSP_start:
	ibytes "hively_player.bin"
DSP_end:
	align 8
song:
 if chip = 1
        .incbin "mod/chiprolled.hvl.streambits"
 endif
 if gone = 1
        .incbin "mod/gone.ahx.streambits"
 endif
     if galactic = 1
	.incbin "mod/galactic_emeralds.hvl.streambits"
     endif
	.long
binPrecalcTable:
	ibytes "AHX_FilterPrecalc.bin"
	.long
panning_table:
	ibytes "AHX_panning.bin"
	ENDIF

nnormals	equ (plane_vnormals - plane_normals)/16

//->	echo "plane y:  %Hplane_y"
//->	echo "plane col:%Hplane_col"
//->	echo "plane n:  %Hplane_normals"
//->	echo "plane n#: %Dnnormals"
//->	echo "plane v:  %Hplane_vnormals"
//->	echo "plane pro:%Xplane_projected"
//->	echo "plane fcs:%Xplane_faces"

	align	32
ende:		equ *
	echo "ENDE : %Hende"

	end
