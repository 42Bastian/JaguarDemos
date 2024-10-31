;-*-Asm-*-

START_X		equ $340
START_Y		equ $200
START_ANGLE	equ 167

WORLD_WIDTH	equ 32

HORIZONTAL_SCAN EQU 1


;;; ****************************************
;;; Fixpoint (max. 9, else rounding errors appear)

FP_BITS		EQU 8
FP		EQU (1<<FP_BITS)


;;; -----------------------------------------------------------------------
	MODULE main, MODend_irq

world0.a	REG 99
world.a		reg 99

angle.a		reg 99
doorAddress.a	reg 99
planeX.a	reg 99
planeY.a	reg 99
posX.a		reg 99
posY.a		reg 99
doorPos.a	reg 99
doorInc.a	reg 99

	movei	#START_X,tmp0
	movei	#START_Y,tmp1
	moveta	tmp0,posX.a
	moveta	tmp1,posY.a
	movei	#START_ANGLE<<2,tmp0
	moveta	tmp0,angle.a
	movei	#worldMap,tmp0
	moveta	tmp0,world.a

	movei	#128,tmp0
	moveta	tmp0,doorPos.a
	moveq	#0,tmp0
	moveta	tmp0,doorInc.a

 IF LOCK_VBL = 1
	xor	VBLFlag,VBLFlag
 ENDIF
mainLoop:
	movei	#$f00058,r0
	xor	tmp1,tmp1
	storew	tmp1,(tmp0)

 IF LOCK_VBL = 0
	xor	VBLFlag,VBLFlag
waitStart:
	jr	eq,waitStart
	or	VBLFlag,VBLFlag
 ELSE
waitStart:
	or	VBLFlag,VBLFlag
	jr	ne,waitStart
	nop
	moveq	#2,VBLFlag
 ENDIF
	movei	#$ffff,r1
	movefa	VID_PIT.a,r0
	storew	r1,(r0)

	movei	#$f00058,r0
	storew	tmp0,(tmp0)

;;; ------------------------------
;;; CLS
;;; ------------------------------
	;; sky
	movei	#$01010101,tmp0
	store	tmp0,(blitter+_BLIT_PATD)
	store	tmp0,(blitter+_BLIT_PATD+4)
	movei	#BLIT_PITCH1|BLIT_PIXEL32|BLIT_WID|BLIT_XADDPHR,tmp0
	movefa	screen1.a,tmp1
	store	tmp0,(blitter+_BLIT_A1_FLAGS)
	store	tmp1,(blitter)	;_BLIT_A1_BASE
	moveq	#0,tmp1
	movei	#(1<<16)|(rez_y*rez_x/8),tmp2
	store	tmp1,(blitter+_BLIT_A1_PIXEL)
	movei	#B_PATDSEL,tmp1
	store	tmp2,(blitter+_BLIT_COUNT)
	store	tmp1,(blitter+_BLIT_CMD)
	WAITBLITTER
	;; floor
	movei	#$02020202,tmp0
	store	tmp0,(blitter+_BLIT_PATD)
	store	tmp0,(blitter+_BLIT_PATD+4)
	movei	#B_PATDSEL,tmp1
	store	tmp2,(blitter+_BLIT_COUNT)
	store	tmp1,(blitter+_BLIT_CMD)
//->	WAITBLITTER


;;; ------------------------------
;;; Playfield
;;; ------------------------------
dirX		reg 99
dirY		reg 99
cameraX		reg 99
rayDirX		reg 99
rayDirY		reg 99
stepX		reg 99
stepY		reg 99
sideDistX	reg 99
sideDistY	reg 99
deltaDistX	reg 99
deltaDistY	reg 99
//->fp		reg 99
world		reg 99
stripeCount	reg 99

cameraX0.a	reg 99
deltaCameraX.a	reg 99

sideDistX.a	reg 99
sideDistY.a	reg 99


	movefa	angle.a,tmp2

;;->  dirX = -co(angle);
;;->  dirY = si(angle);
;;->  planeX = 5*si(angle)/8;
;;->  planeY = 5*co(angle)/8;

planeX	reg 99
planeY	reg 99
sinptr	reg 15

	movei	#64*4,tmp0
	movei	#sintab,r15
	add	tmp2,tmp0
	shlq	#32-10,tmp0
	shlq	#32-10,tmp2
	shrq	#32-10,tmp0
	shrq	#32-10,tmp2
	load	(sinptr+tmp0),dirX
	load	(sinptr+tmp2),dirY
	moveq	#24,tmp1
	move	dirX,planeY
	move	dirY,planeX
	neg	dirX
	imult	tmp1,planeX
	imult	tmp1,planeY
	sharq	#5,planeX
	sharq	#5,planeY
	moveta	planeX,planeX.a
	moveta	planeY,planeY.a

	unreg	planeX,planeY,sinptr

x		reg 99

	moveq	#0,tmp2
	movei	#rez_x-1,x
	bset	#FP_BITS,tmp2
	subq	#1,tmp2
	movefa	posX.a,tmp0
	movefa	posY.a,tmp1
	and	tmp2,tmp0
	and	tmp2,tmp1
	moveta	tmp0,sideDistX.a
	moveta	tmp1,sideDistY.a

mapX		reg 99
mapY		reg 99

	movefa	world.a,world
	movefa	posY.a,mapY
	movefa	posX.a,mapX
	shrq	#FP_BITS,mapY
	shrq	#FP_BITS-1,mapX
	shlq	#5+1,mapY
	bclr	#0,mapX
	add	mapY,world
	add	mapX,world
	moveta	world,world0.a

	unreg	mapX,mapY

	moveq	#0,tmp0
	bset	#2*FP_BITS,tmp0
	moveta	tmp0,cameraX0.a

	movei	#2*FP*FP/rez_x,tmp0
	moveta	tmp0,deltaCameraX.a

;;; ----------------------------------------
;;; draw loop
	;; prepare stripe drawing
.x_loop:
	movefa	cameraX0.a,tmp0
	movefa	deltaCameraX.a,tmp1

	move	tmp0,cameraX
	sub	tmp1,tmp0
	shrq	#FP_BITS,cameraX
	moveta	tmp0,cameraX0.a

;;->    rayDirX = (dirX + planeX * cameraX/fp);
;;->    rayDirY = (dirY + planeY * cameraX/fp);

	movefa	planeX.a,rayDirX
	movefa	planeY.a,rayDirY
	imult	cameraX,rayDirX
	imult	cameraX,rayDirY
	sharq	#FP_BITS,rayDirX
	sharq	#FP_BITS,rayDirY
	add	dirX,rayDirX
	add	dirY,rayDirY

//->    if ( rayDirX != 0 ) {
//->      deltaDistX = abs(fp*fp / rayDirX);
//->
//->      if (rayDirX < 0) {
//->        stepX = -1;
//->        sideDistX = sideDistX * deltaDistX/fp;
//->      } else {
//->        stepX = 1;
//->        sideDistX = (fp - sideDistX) * deltaDistX/fp;
//->      }
//->    }
	moveq	#0,tmp2
	moveq	#0,deltaDistX
	bset	#FP_BITS,tmp2
	bset	#FP_BITS*2-1,deltaDistX
	subq	#1,deltaDistX
	move	deltaDistX,deltaDistY

	move	rayDirX,tmp0
	abs	tmp0
	moveq	#0,stepX
	jr	eq,.zeroRayX
	moveq	#0,sideDistX

	div	tmp0,deltaDistX
	movefa	sideDistX.a,sideDistX
	moveq	#2,stepX
	jr	cs,.negRayX
	subq	#4,stepX

	neg	sideDistX
	moveq	#2,stepX
	add	tmp2,sideDistX
.negRayX
	mult	deltaDistX,sideDistX
	shrq	#FP_BITS,sideDistX
.zeroRayX

	move	rayDirY,tmp0
	abs	tmp0
	moveq	#0,stepY
	jr	eq,.zeroRayY
	moveq	#0,sideDistY

	div	tmp0,deltaDistY
	movefa	sideDistY.a,sideDistY
	movei	#WORLD_WIDTH*2,stepY
	jr	cc,.posRayY
	neg	stepY

	neg	sideDistY
	neg	stepY
	add	tmp2,sideDistY
.posRayY:
	mult	deltaDistY,sideDistY
	shrq	#FP_BITS,sideDistY
.zeroRayY


//->    while (hit == 0 ) {
//->      //jump to next map square, either in x-direction, or in y-direction
//->      if (sideDistX < sideDistY) {
//->        sideDistX += deltaDistX;
//->        mapX += stepX;
//->        side = 0;
//->      } else {
//->        sideDistY += deltaDistY;
//->        mapY += stepY;
//->        side = 1;
//->      }
//->      //Check if ray has hit a wall
//->      hit = worldMap[int(mapX/fp)][int(mapY/fp)];
//->    }

color		reg 99
wallX		reg 99
wallSide	reg 99
dperp		reg 3!
dwx		reg 99
dwy		reg 99
dwxy		reg 99
sideDist	reg 99
Y_STEP		reg 99
DONE_WALL 	reg 99

	move	deltaDistY,dwy
	move	deltaDistX,dwx
	imult	rayDirX,dwy
	imult	rayDirY,dwx
	sharq	#FP_BITS,dwy
	sharq	#FP_BITS,dwx
	neg	dwy

	regmap

	movei	#.yStep,Y_STEP
	movei	#.done_wall,DONE_WALL

	move	pc,tmp1
	movefa	world0.a,world
	addq	#6,tmp1
.wall_loop
	cmp	sideDistX,sideDistY
	jump	mi,(Y_STEP)
	nop
	jump	eq,(Y_STEP)
	moveq	#1,wallSide
	move	sideDistY,sideDist
	move	deltaDistX,dperp
	move	stepX,tmp0
	sharq	#1,dperp
	shrq	#31,tmp0
	add	tmp0,wallSide
	move	dwx,dwxy
	move	sideDistX,tmp2
	move	rayDirY,tmp0
	movefa	posY.a,wallX
	neg	tmp0
	add	stepX,world
	jr	.wall_cont
	add	deltaDistX,sideDistX
.yStep:
	moveq	#4,wallSide
	move	deltaDistY,dperp
	move	stepY,tmp0
	sharq	#1,dperp
	shrq	#31,tmp0
	sub	tmp0,wallSide
	move	dwy,dwxy
	move	sideDistY,tmp2
	move	sideDistX,sideDist
	movefa	posX.a,wallX
	move	rayDirX,tmp0
	add	stepY,world
	add	deltaDistY,sideDistY
.wall_cont
	imult	tmp2,tmp0
	loadw	(world),color
	sharq	#FP_BITS-1,tmp0
	cmpq	#0,color
	jump	eq,(tmp1)
	add	tmp0,wallX

	move	color,tmp0

	shrq	#7,tmp0
	jump	eq,(DONE_WALL)	; normal wall
	cmpq	#4,tmp0		; open door
	jump	eq,(tmp1)
	sub	dwxy,wallX
	add	dperp,tmp2

	cmp	sideDist,tmp2
	movei	#127,tmp3
	jump	pl,(tmp1)
	cmpq	#6,tmp0
	jr	eq,.closed_door
	shlq	#32-8,wallX
	movefa	doorPos.a,tmp3
.closed_door
	shlq	#1,tmp3
	shrq	#32-8,wallX
	sub	tmp3,wallX
	jump	pl,(tmp1)
	nop
	jr	.noMi
.done_wall:
	shrq	#1,wallX
	btst	#0,wallSide
	jr	ne,.noMi
.mi
	nop

	not	wallX
.noMi
	shlq	#32-7,wallX
	shrq	#32-7,wallX

	unreg 	rayDirX,rayDirY,world,Y_STEP,dwx,dwy,dwxy,DONE_WALL

height		reg 99
bcount		reg 99
y		reg 99

height.a	reg 99
texY.a		reg 99


	movei	#rez_y*FP/4,height
	div	tmp2,height

	moveq	#0,tmp0
	movei	#(rez_y/2),y
	moveta	tmp0,texY.a	; set texture start at 0
	sub	height,y
	move	height,bcount
	moveta	height,height.a	; save height for texture Y pos adjustment
	jr	pl,.ok
	shlq	#16+1,bcount	; move to Y position and double

	neg	y
	moveta	y,texY.a
	moveq	#0,y
	movei	#(rez_y<<16)|1,bcount
	movei	#rez_y/2,height
.ok
	shlq	#16,y
	bset	#0,bcount
	or	x,y

texture	reg 99

	movei	#.no_texture,tmp0
	btst	#6,color
	movei	#textureTable,texture
	jump	eq,(tmp0)
	shlq	#32-6,color
	moveq	#0,tmp2
	shrq	#32-6,color
	bset	#16+7,tmp2
	movefa	height.a,height
	div	height,tmp2	; stretch value

	add	color,texture
	load	(texture),texture

	shlq	#32-7,wallX
	moveq	#0,tmp1
	shrq	#32-7,wallX
	movefa	texY.a,tmp0
 IF HORIZONTAL_SCAN = 1
	shlq	#16,wallX
 ENDIF
	or	tmp2,tmp1	; move stretch to tmp1 and handle scoreboard bug
	cmpq	#0,tmp0		; != 0 => not full texture visible
	jr	eq,.oky
	shrq	#1,tmp2		; half stretch
	mult	tmp2,tmp0
	shrq	#16,tmp0
 IF HORIZONTAL_SCAN = 0
	shlq	#16,tmp0
 ENDIF
	or	tmp0,wallX
.oky
	shrq	#16+1,tmp1	; get integer part and divide by two
 IF HORIZONTAL_SCAN = 0
	movei	#((-1) & 0xffff),tmp0
	shlq	#16,tmp1
	or	tmp0,tmp1
 ENDIF

 IF HORIZONTAL_SCAN = 1
	movei	#BLIT_PITCH1|BLIT_PIXEL8|BLIT_WID128|BLIT_XADDINC,tmp3
 ELSE
	movei	#BLIT_PITCH1|BLIT_PIXEL8|BLIT_WID128|BLIT_XADDPIX,tmp3
 ENDIF
	WAITBLITTER

	store	texture,(blitter)

	UNREG texture

	store	tmp3,(blitter+_BLIT_A1_FLAGS)
	moveq	#0,tmp0
	store	wallX,(blitter+_BLIT_A1_PIXEL)
	shlq	#16,tmp2	; fractional part of stretch
	store	tmp0,(blitter+_BLIT_A1_FPIXEL)

 IF HORIZONTAL_SCAN = 1
	shrq	#16,tmp2	; x stretch => horizontal scan
	store	tmp1,(blitter+_BLIT_A1_INC)
	store	tmp2,(blitter+_BLIT_A1_FINC)
 ELSE
	store	tmp2,(blitter+_BLIT_A1_FSTEP)
 ENDIF
	movefa	screen1.a,tmp0
 IF HORIZONTAL_SCAN = 0
	store	tmp1,(blitter+_BLIT_A1_STEP)
 ENDIF

	store	tmp0,(blitter+_BLIT_A2_BASE)
	movei	#BLIT_PITCH1|BLIT_PIXEL8|BLIT_WID|BLIT_XADDPIX,tmp1
	movei	#1<<16|((-1) & 0xffff),tmp0
	store	tmp1,(blitter+_BLIT_A2_FLAGS)
	store	tmp0,(blitter+_BLIT_A2_STEP)

	movei	#.next,tmp1
 IF HORIZONTAL_SCAN = 1
	movei	#BLIT_LFU_REPLACE|BLIT_SRCEN|BLIT_UPDA2|BLIT_DSTA2,tmp2
 ELSE
	movei	#BLIT_LFU_REPLACE|BLIT_SRCEN|BLIT_UPDA1|BLIT_UPDA2|BLIT_DSTA2|BLIT_UPDA1F,tmp2
 ENDIF
	jump	(tmp1)
	store	y,(blitter+_BLIT_A2_PIXEL)

.no_texture
	shrq	#32-6,color
	moveq	#0,tmp2
	add	wallSide,color
	bset	#16,tmp2	;B_PATDSEL

	movei	#BLIT_PITCH1|BLIT_PIXEL8|BLIT_WID|BLIT_XADD0|BLIT_YADD1,tmp3

	WAITBLITTER

	movefa	screen1.a,tmp0
	store	tmp3,(blitter+_BLIT_A1_FLAGS)
	store	tmp0,(blitter)
	moveq	#0,tmp0
	store	y,(blitter+_BLIT_A1_PIXEL)
	bset	#16,tmp0
	store	color,(blitter+_BLIT_PATD)
	store	tmp0,(blitter+_BLIT_A1_STEP)

.next
	movei	#.x_loop,tmp0
	subq	#1,x
	store	bcount,(blitter+_BLIT_COUNT)
	jump	pl,(tmp0)
	store	tmp2,(blitter+_BLIT_CMD)

	unreg height,x,y,bcount
	unreg stepX,stepY,sideDistX,sideDistY,deltaDistX,deltaDistY
	unreg cameraX,color,wallSide
	unreg sideDistX.a,sideDistY.a,world0.a,cameraX0.a,deltaCameraX.a
;;; ----------------------------------------
;;; handle door

doorAddress	reg 99

	movefa	doorAddress.a,doorAddress

	movei	#128,tmp2
	movefa	doorInc.a,tmp0
	loadw	(doorAddress),tmp3
	cmpq	#0,tmp0
	movefa	doorPos.a,tmp1
	jr	eq,.noDoorMoving
	add	tmp0,tmp1
	jr	ne,.notOpen
	cmp	tmp2,tmp1
.doorOpened:
	jr	.doorOpenCloseDone
	bclr	#8,tmp3
.notOpen:
	jr	ne,.doorDone
	nop
	bset	#8,tmp3
.doorOpenCloseDone:
	moveq	#0,tmp0
	bclr	#7,tmp3
.doorDone:
	storew	tmp3,(doorAddress)
	moveta	tmp0,doorInc.a
	moveta	tmp1,doorPos.a
.noDoorMoving

	unreg doorAddress
;;; ------------------------------
;;; move

posX	reg 99
posY	reg 99

	movefa	angle.a,tmp0
	addq	#4,tmp0

	movei	#joypad,r0
	BL	(r0)
	move	r0,r3

	movefa	angle.a,tmp0
	btst	#JOY_RIGHT_BIT,r3
 IF LOCK_VBL = 1
	moveq	#1<<3,tmp1
 ELSE
	moveq	#1<<2,tmp1
 ENDIF
	jr	ne,.left
	btst	#JOY_LEFT_BIT,r3
	jr	eq,.neither
	nop
	neg	tmp1
.left
	add	tmp1,tmp0
	shlq	#32-10,tmp0
	shrq	#32-10,tmp0
	moveta	tmp0,angle.a
.neither
	movei	#64,tmp2
	btst	#JOY_UP_BIT,r3
	movefa	posX.a,posX
	jr	ne,.forward
	movefa	posY.a,posY
	neg	tmp2
	btst	#JOY_DOWN_BIT,r3
	movei	#.neither2,tmp0
	jump	eq,(tmp0)
.forward

dirX1	reg 99
dirY1	reg 99
	move dirX,dirX1
	move dirY,dirY1

	imult	tmp2,dirX1
	imult	tmp2,dirY1
	sharq	#FP_BITS-1,dirX1
	sharq	#FP_BITS-1,dirY1
	move	dirX1,tmp0
	move	dirY1,tmp1
	sharq	#2,dirX1
	sharq	#2,dirY1
	add	posX,dirX1	; new posX
	add	posX,tmp0	; check pos
	neg	dirY1
	neg	tmp1
	add	posY,dirY1
	add	posY,tmp1

	sharq	#FP_BITS-1,tmp0	; nx
	sharq	#FP_BITS,tmp1	; ny
	bclr	#0,tmp0

	move	posX,tmp3
	sharq	#FP_BITS-1,tmp3
	shlq	#5+1,tmp1
	bclr	#0,tmp3
	movefa	world.a,tmp2
	add	tmp1,tmp2
	add	tmp3,tmp2
	loadw	(tmp2),tmp2
	move	posY,tmp3
	cmpq	#0,tmp2
	jr	eq,.okX
	sharq	#FP_BITS,tmp3
	shrq	#7,tmp2
	cmpq	#4,tmp2
	jr	ne,.no_xMove
	nop
.okX
	moveta	dirY1,posY.a
.no_xMove:
	shlq	#5+1,tmp3
	movefa	world.a,tmp1
	add	tmp0,tmp1
	add	tmp3,tmp1
	loadw	(tmp1),tmp0
	cmpq	#0,tmp0
	jr	eq,.okY
	shrq	#7,tmp0
	cmpq	#4,tmp0
	jr	ne,.neither2
	nop
.okY
	moveta	dirX1,posX.a
.neither2

	unreg dirX1,dirY1

;;; ----------------------------------------
;;; Check: Open door
tmp4	reg 99
no_door_open reg 99
	movei	#.no_door_open,no_door_open
	btst	#JOY_B_BIT,r3
	jump	eq,(no_door_open)

	moveq	#3,tmp2
	move	dirX,tmp0
	move	dirY,tmp1
	imult	tmp2,tmp0
	imult	tmp2,tmp1
	sharq	#2,tmp0
	sharq	#2,tmp1
	movefa	posX.a,tmp2
	neg	tmp1
	movefa	posY.a,tmp4
	add	tmp2,tmp0
	add	tmp4,tmp1

	movefa	world.a,tmp4
	sharq	#FP_BITS,tmp1
	sharq	#FP_BITS-1,tmp0
	shlq	#5+1,tmp1
	bclr	#0,tmp0
	add	tmp1,tmp4
	add	tmp0,tmp4

	loadw	(tmp4),tmp0
	btst	#9,tmp0
	jump	eq,(no_door_open)	; no door
	btst	#7,tmp0
	jump	ne,(no_door_open)	; moving door

	btst	#JOY_B_BIT,r3
	movefa	doorPos.a,tmp2
	jump	eq,(no_door_open)
	nop
	bset	#7,tmp0
	storew	tmp0,(tmp4)
	moveta	tmp4,doorAddress.a
	btst	#8,tmp0
	moveq	#0,tmp4
	jr	eq,.closing
	moveq	#2,tmp1

	bset	#7,tmp4
	neg	tmp1
.closing:
	moveta	tmp1,doorInc.a
	moveta	tmp4,doorPos.a

.no_door_open:
//->	movei	#PrintHEX_YX,r4
//->	moveq	#0,r1
//->	BL	(r4)

	unreg dirX,dirY,posX,posY,tmp4,no_door_open
;;; ------------------------------
;;; time
	movefa	VID_PIT.a,tmp0
	loadw	(tmp0),tmp0
	shlq	#16,tmp0
	not	tmp0
	shrq	#16,tmp0

	movei	#PrintDEC2_YX,r4
	movei	#$00020000,r1
	BL	(r4)
.no_time:
//->	movei	#PrintHEX_YX,r4
	movefa	posX.a,r0
	shrq	#FP_BITS,r0
	movei	#$00020008,r1
	BL	(r4)

	movefa	posY.a,r0
	shrq	#FP_BITS,r0
	movei	#$0002000D,r1
//->	movei	#$00020011,r1
	BL	(r4)

	movei	#PrintDEC_YX,r4
	movefa	angle.a,r0
	shrq	#2,r0
//->	movefa	doorPos.a,r0
	movei	#$00020012,r1
//->	movei	#$00020012+9,r1
	BL	(r4)

//->	movefa	doorInc.a,r0
//->	movei	#$00010012,r1
//->	BL	(r4)

	movei	#mainLoop,r0
	jump	(r0)
	nop

;;; ----------------------------------------
;;; Text output
max_x_txt	equ rez_x_txt
max_y_txt	equ rez_y_txt

	include <js/inc/txtscr.inc>

	align 4
textureTable:
	dc.l	phobyx_128x128,MandelTexture,XorTexture,Xor2Texture,w3d_wall1
	dc.l	w3d_wall2,door1

end:
	echo "end: %hend"

	ENDMODULE main
