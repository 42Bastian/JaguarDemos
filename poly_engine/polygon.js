;; -*-asm-*-

LYXASS	EQU 1
	gpu

	include <js/symbols/jagregeq.js>
	include <js/symbols/blit_eq.js>
	include <js/macro/help.mac>
	include <js/macro/module.mac>

	include "globalreg.h"
	include "video.h"
	include "structs.inc"

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

	macro face ; p1,p2,p3,p4,col
	dc.w \0*8,\1*8,\2*8,\4
	dc.w \0*8,\2*8,\3*8,\4
	endm

	macro tri			; p1,p2,p3,col
	dc.w \0*8,\1*8,\2*8,\3
	endm

	macro PT
	dc.w 0, \0/2 & $ffff,\1/2 & $ffff,\2/2 & $ffff
	endm

	macro NT
	dc.w 0, \0 & $ffff,\1 & $ffff,\2 & $ffff
	endm



//->object_array	equ $20000

torus_data	equ $20000

torus_rotated	equ torus_data
torus_moved	equ torus_rotated+144*_3d_size
torus_projected	equ torus_moved+144*_3d_size
torus_normals_rotated	equ torus_projected+144*proj_size
torus_visible	equ torus_normals_rotated+288*_3d_size
torus_end	equ torus_visible+288*4
torus_size	equ torus_end-torus_rotated

cube_data	equ torus_end

cube_rotated	equ cube_data
cube_moved	equ cube_rotated+8*_3d_size
cube_projected	equ cube_moved+8*_3d_size
cube_normals_rotated	equ cube_projected+8*proj_size
cube_visible	equ cube_normals_rotated+12*_3d_size
cube_end	equ cube_visible+12*4
cube_size	equ cube_end-cube_rotated

kugel_data	equ cube_end
kugel_rotated	equ kugel_data
kugel_moved	equ kugel_rotated+134*_3d_size
kugel_normals_rotated	equ kugel_moved+134*_3d_size
kugel_projected	equ kugel_normals_rotated+(24+122*2)*_3d_size
kugel_visible	equ kugel_projected+134*proj_size
kugel_end	equ kugel_visible+(24+122*2)*4
kugel_size	equ kugel_end-kugel_rotated


torus2_data	equ kugel_end
torus2_rotated	equ torus2_data
torus2_moved	equ torus2_rotated+144*_3d_size
torus2_projected equ torus2_moved+144*_3d_size
torus2_normals_rotated	equ torus2_projected+49*proj_size
torus2_visible	equ torus2_normals_rotated+288*_3d_size
torus2_end	equ torus2_visible+288*4
torus2_size	equ torus2_end-torus2_rotated

cube2_data	equ torus2_end

cube2_rotated	equ cube2_data
cube2_moved	equ cube2_rotated+8*_3d_size
cube2_projected	equ cube2_moved+8*_3d_size
cube2_normals_rotated	equ cube2_projected+8*proj_size
cube2_visible	equ cube2_normals_rotated+12*_3d_size
cube2_end	equ cube2_visible+12*4
cube2_size	equ cube2_end-cube2_rotated

prisma_data	equ cube2_end

prisma_rotated	equ prisma_data
prisma_moved	equ prisma_rotated+5*_3d_size
prisma_projected equ prisma_moved+5*_3d_size
prisma_normals_rotated	equ prisma_projected+5*proj_size
prisma_visible	equ prisma_normals_rotated+6*_3d_size
prisma_end	equ prisma_visible+6*4
prisma_size	equ prisma_end-prisma_rotated

diamant_data	equ prisma_end

diamant_rotated	equ diamant_data
diamant_moved	equ diamant_rotated+20*_3d_size
diamant_projected equ diamant_moved+20*_3d_size
diamant_normals_rotated	equ diamant_projected+20*proj_size
diamant_visible	equ diamant_normals_rotated+36*_3d_size
diamant_end	equ diamant_visible+36*4
diamant_size	equ diamant_end-diamant_rotated

PLANE_PTS	equ 121
PLANE_FCS	equ 162
plane_data	equ diamant_end

plane_rotated	equ plane_data
plane_moved	equ plane_rotated+PLANE_PTS*_3d_size
plane_projected equ plane_moved+PLANE_PTS*_3d_size
plane_normals_rotated	equ plane_projected+PLANE_PTS*proj_size
plane_visible	equ plane_normals_rotated+PLANE_FCS*_3d_size
plane_end	equ plane_visible+PLANE_FCS*4
plane_size	equ plane_end-plane_rotated


IRQ_STACK	equ $f03020-4


reci_tab	equ $f03ffc-max_x*4
stacktop	equ reci_tab-4

	echo "stacktop %H stacktop"

	RSSET $2000
	RSL	OBJECT_LIST,16
	RSL	CAMERA_X
	RSL	CAMERA_Y
	RSL	CAMERA_Z
	RSL	LIGHT_X
	RSL	LIGHT_Y
	RSL	LIGHT_Z
	RSL	FAR_Z
	RSL	OBJECT_PTR
	RSL	ANGLE_X
	RSL	ANGLE_Y
	RSL	ANGLE_Z
	RSL	X_POS
	RSL	Y_POS
	RSL	Z_POS
	RSL	LastJoy,2

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
	include "poly_mmu.js"
	include "control.js"

skip_modules
	movei	#$f02100,IRQ_FLAGADDR
	moveta	IRQ_FLAGADDR,IRQ_FLAGADDR.a

	movei	#1<<14|%11111<<9,r0	; clear all ints, REGPAGE = 1
	store	r0,(IRQ_FLAGADDR)
	nop
	nop

	INITMODULE irq

	movei	#x_save,tmp0
	moveta	tmp0,x_save.a

	movei	#IRQ_STACK,IRQ_SP
	moveta	IRQ_SP,IRQ_SP.a
	movei	#stacktop,SP

	nop

	movei	#memzero,r4
	moveq	#8,r0
	movei	#$4000-8,r1
	BL	(r4)

	movei	#memzero,r4
	movei	#$20000,r0
	movei	#$200000-$20000,r1
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

	;;
	;; setup 1/x table
	;;
	movei	#reci_tab,r0
	movei	#max_x,r1
	move	r1,r2
	shlq	#2,r2
	add	r2,r0
.loop1
	moveq	#0,r3
	bset	#fp_reci,r3
	div	r1,r3
	subq	#1,r1
	store	r3,(r0)
	jr	ne,.loop1
	subq	#4,r0
	store	r1,(r0)		; div by 0

	movei	#254,r0
	movei	#$0FF0F0FF,r1
	movei	#TxtScreen,r2
	movei	#ASCII,r3
	movei	#InitTxtScreen,r4
	BL	(r4)

	movei	#x_save,tmp0		; save left/right X in internal RAM
	moveta	tmp0,x_save.a

	movei	#max_y,r1
	movei	#(max_x)<<(16+fp_rez),r2	; minX:maxX
	movei	#col_tab,r3
	moveq	#0,r4
.loop0
	subq	#1,r1
	store	r4,(r3)
	addqt	#4,r3
	store	r4,(r3)
	addqt	#4,r3
	store	r2,(tmp0)
	jr	nn,.loop0
	addqt	#4,tmp0

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

	moveq	#$10,r1
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
	moveq	#$10,r1
	shlq	#16+8,r1
	store	r1,(r0)

	movei	#1<<14|%11111<<9|%01000<<<4,r1
	store	r1,(IRQ_FLAGADDR)
	nop
	nop

	movei	#OBJECT_LIST,r0
	movei	#OBJECT_PTR,r1
	store	r0,(r1)

	macro ADD_OBJ
	movei	#obj_\0,r1
	store	r1,(r0)
	addq	#4,r0
	endm

	ADD_OBJ torus2
	ADD_OBJ plane
	ADD_OBJ kugel
	ADD_OBJ torus
	ADD_OBJ diamant
	ADD_OBJ cube
	ADD_OBJ cube2
;;->	ADD_OBJ prisma

	movei	#CAMERA_X,r15
	movei	#0,r0
	store	r0,(r15+CAMERA_Z-CAMERA_X)	; camera z
	movei	#3300,r0
	store	r0,(r15+FAR_Z-CAMERA_X)

	movei	#0,r0
	movei	#-242,r1
	movei	#80,r2
	store	r0,(r15+LIGHT_X-CAMERA_X)
	store	r1,(r15+LIGHT_Y-CAMERA_X)
	store	r2,(r15+LIGHT_Z-CAMERA_X)

	movei	#VID_PIT0,tmp1
	movei	#(26591-1)<<16|0,tmp0
	store	tmp0,(tmp1)

//->	MyINITMODULE poly_mmu
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

//->	movei	#$00F00058,r0
//->	storew	r0,(r0)
	xor	VBLFlag,VBLFlag
	nop
//->	movei	#$00F00058,r0
//->	storew	VBLFlag,(r0)
.wvbl:
	or	VBLFlag,VBLFlag
	jr	eq,.wvbl
	nop


	moveq	#0,r1
	subq	#1,r1
	movei	#$00F00052,r0
	storew	r1,(r0)

	MyINITMODULE poly_mmu
	MBL	poly_mmu

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
	moveq	#0,r1
	movefa	dump.a,r0
	movei	#PrintDEC_YX,r2
	BL	(r2)

	movei	#main_loop,r0
	jump	(r0)
	nop

	include "txtscr.inc"

****************
	align 4
txt_ptr	reg 7
minihex_screen_width	equ max_x
	include <js/inc/minihex.inc>
	unreg txt_ptr

;-----------------------------------------
;- Copy overlay routine
;-----------------------------------------
blitter	reg 14
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
******************
* text-data
Hallo:		DC.B "move: A/B/C + U/D // change focus: O",0
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


ende:		equ *
	echo "ENDE : %Hende"

end
