;-*-Asm-*-

START_X		equ 4
START_Y		equ 5
START_ANGLE	equ 0

WORLD_WIDTH	equ 31

HORIZONTAL_SCAN EQU 1


;;; ****************************************
;;; Fixpoint (max. 9, else rounding errors appear)

FP_BITS		EQU 8
FP		EQU (1<<FP_BITS)


;;; -----------------------------------------------------------------------
	MODULE main, MODend_irq

sinptr		reg 15

BG.a		REG 99
LOOP.a		REG 99
world0.a	REG 99
world.a		reg 99

angle.a		reg 99
dirX.a		reg 99
dirY.a		reg 99
planeX.a	reg 99
planeY.a	reg 99
posX.a		reg 99
posY.a		reg 99

	movei	#$f00058,r0
	moveta	r0,BG.a

	movei	#START_X*FP-FP/3,tmp0
	movei	#START_Y*FP-FP/2,tmp1
	moveta	tmp0,posX.a
	moveta	tmp1,posY.a
	movei	#START_ANGLE<<2,tmp0
	moveta	tmp0,angle.a
	movei	#worldMap,tmp0
	moveta	tmp0,world.a

 IF LOCK_VBL = 1
	xor	VBLFlag,VBLFlag
 ENDIF
	move	PC,r0
	addq	#6,r0
	moveta	r0,LOOP.a
loop:
	movefa	BG.a,tmp0
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

	movefa	BG.a,tmp0
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
x		reg 99
y		reg 99
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
fp		reg 99
world		reg 99
stripeCount	reg 99

cameraX0.a	reg 99
deltaCameraX.a	reg 99

sideDistX.a	reg 99
sideDistY.a	reg 99

dump	reg 99
	movefa	angle.a,tmp2

;;->  dirX = -co(angle);
;;->  dirY = si(angle);
;;->  planeX = 5*si(angle)/8;
;;->  planeY = 5*co(angle)/8;

planeX	reg 99
planeY	reg 99

	movei	#64*4,tmp0
	add	tmp2,tmp0
	shlq	#32-10,tmp0
	shlq	#32-10,tmp2
	shrq	#32-10,tmp0
	shrq	#32-10,tmp2
	load	(sinptr+tmp0),dirX
	load	(sinptr+tmp2),dirY
	moveq	#20,tmp1
	move	dirX,planeY
	move	dirY,planeX
	neg	dirX
	imult	tmp1,planeX
	imult	tmp1,planeY
	sharq	#5,planeX
	sharq	#5,planeY
	moveta	planeX,planeX.a
	moveta	planeY,planeY.a

	unreg	planeX,planeY

	moveq	#0,fp
	movei	#rez_x-1,x
	bset	#FP_BITS,fp

	move	fp,tmp2
	subq	#1,tmp2
	movefa	posX.a,tmp0
	movefa	posY.a,tmp1
	and	tmp2,tmp0
	and	tmp2,tmp1
	moveta	tmp0,sideDistX.a
	moveta	tmp1,sideDistY.a

mapX		reg 99
mapY		reg 99

	movefa	posY.a,mapY
	movefa	posX.a,mapX
	shrq	#FP_BITS,mapY
	shrq	#FP_BITS,mapX
	movefa	world.a,world
	moveq	#WORLD_WIDTH,tmp0
	add	mapX,world
	mult	tmp0,mapY
	add	mapY,world
	moveta	world,world0.a

	unreg	mapX,mapY

	moveq	#0,tmp0
	bset	#2*FP_BITS,tmp0
	moveta	tmp0,cameraX0.a

	movei	#2*FP*FP/rez_x,tmp0
	moveta	tmp0,deltaCameraX.a

	movei	#$20000,dump
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
	moveq	#0,deltaDistX
	bset	#FP_BITS*2,deltaDistX
	subq	#1,deltaDistX
	move	deltaDistX,deltaDistY

	move	rayDirX,tmp0
	abs	tmp0
	moveq	#0,stepX
	jr	eq,.zeroRayX
	moveq	#0,sideDistX

	div	tmp0,deltaDistX
	movefa	sideDistX.a,sideDistX
	moveq	#1,stepX
	jr	cs,.negRayX
	subq	#2,stepX

	neg	sideDistX
	moveq	#1,stepX
	add	fp,sideDistX
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
	moveq	#WORLD_WIDTH,stepY
	jr	cc,.posRayY
	neg	stepY

	neg	sideDistY
	moveq	#WORLD_WIDTH,stepY
	add	fp,sideDistY
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


side		reg 99
left		reg 99
color		reg 99
height		reg 99
perpWallDist	reg 99

	moveq	#0,color
	movefa	world0.a,world
.wall_loop
	cmpq	#0,color
	jr	ne,.doneWall
	cmp	sideDistX,sideDistY
	jr	mi,.yStep
	nop
	moveq	#0,side
	move	sideDistX,perpWallDist
	add	stepX,world
	add	deltaDistX,sideDistX
	jr	.wall_loop
	loadb	(world),color

.yStep:
	moveq	#1,side
	move	sideDistY,perpWallDist
	add	stepY,world
	add	deltaDistY,sideDistY
	jr	.wall_loop
	loadb	(world),color
.doneWall

	unreg	world

//->    //Calculate _height of line to draw on screen
//->    int line_height;
//->    line_height = (_height*fp / perpWallDist);

	movei	#rez_y*FP,height
	div	perpWallDist,height

//->      int wallX; //where exactly  the wall was hit
//->      if (side == 0) wallX = (posY - perpWallDist * rayDirY/fp);
//->      else           wallX = (posX + perpWallDist * rayDirX/fp);
//->
//->      //x coordinate on the texture
//->      int texX = wallX & (texWidth-1);
//->
//->      /* mirror texture depending on side */
//->      if ( front || right ) texX ^= (texWidth-1);
//->
//->      // How much to increase the texture coordinate per screen pixel
//->      int step = fp*texWidth / line_height;
//->      // Starting texture coordinate
//->      int texPos = 0;
//->      if ( drawStart == 0 ) {
//->        texPos = (drawStart - _height / 2 + line_height / 2) * step;
//->      }

wallX	reg 99

	cmpq	#0,side
	movefa	posX.a,wallX
	jr	ne,.front2
	move	rayDirX,tmp0

	neg	perpWallDist
	movefa	posY.a,wallX
	move	rayDirY,tmp0
.front2
	imult	perpWallDist,tmp0
	sharq	#FP_BITS,tmp0
	add	tmp0,wallX

	shrq	#1,height
	unreg	perpWallDist
	unreg 	rayDirX,rayDirY
//->    // side == 1 => left
//->    // side == 0 => back
//->    boolean front = (side == 0 && stepX < 0);
//->    boolean right = (side == 1 && stepY < 0);

	moveq	#0,tmp2
	shlq	#4,side
	moveq	#0,tmp0
	jr	eq,.frontCol
	cmpq	#0,stepY
	jr	pl,.leftBlock
	nop
	jr	.leftBlock
	bset	#0,tmp2
.frontCol
	cmpq	#0,stepX
	jr	mi,.leftBlock
	nop
	bset	#0,tmp2
.leftBlock

bcount		reg 99
height.a	reg 99
texY.a		reg 99

	moveta	tmp0,texY.a	; set texture start at 0
	movei	#(rez_y/2),y
	move	height,bcount
	sub	height,y
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
	btst	#7,color
	movei	#textureTable,texture
	jump	eq,(tmp0)
	bclr	#7,color

	btst	#0,tmp2		; backside ?
	moveq	#0,tmp2
	jr	ne,.no_tex_mirror
	bset	#16+7,tmp2

	not	wallX
.no_tex_mirror
	movefa	height.a,height
	div	height,tmp2	; stretch value

	add	color,texture
	load	(texture),texture

	shlq	#32-FP_BITS,wallX
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
	xor	tmp2,color
	moveq	#0,tmp2
	add	side,color
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

	unreg height,x,y,side,left,fp,bcount
	unreg stepX,stepY,sideDistX,sideDistY,deltaDistX,deltaDistY
	unreg cameraX,color
	unreg sideDistX.a,sideDistY.a,world0.a,cameraX0.a,deltaCameraX.a

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
	moveq	#1<<2,tmp1
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
	moveq	#26,tmp2
	btst	#JOY_UP_BIT,r3
	movefa	posX.a,posX
	jr	ne,.forward
	movefa	posY.a,posY
	neg	tmp2
	btst	#JOY_DOWN_BIT,r3
	movei	#.neither2,tmp0
	jump	eq,(tmp0)
.forward

	imult	tmp2,dirX
	imult	tmp2,dirY
	sharq	#FP_BITS-1,dirX
	sharq	#FP_BITS-1,dirY
	move	dirX,tmp0
	move	dirY,tmp1
	sharq	#1,dirX
	sharq	#1,dirY
	add	posX,dirX	; new posX
	add	posX,tmp0	; check pos
	neg	dirY
	neg	tmp1
	add	posY,dirY
	add	posY,tmp1

	sharq	#FP_BITS,tmp0	; nx
	sharq	#FP_BITS,tmp1	; ny

	move	posX,tmp3
	moveq	#WORLD_WIDTH,tmp2
	sharq	#FP_BITS,tmp3
	mult	tmp2,tmp1
	movefa	world.a,tmp2
	add	tmp1,tmp2
	add	tmp3,tmp2
	loadb	(tmp2),tmp2
	move	posY,tmp3
	cmpq	#0,tmp2
	moveq	#WORLD_WIDTH,tmp2
	jr	ne,.no_xMove
	sharq	#FP_BITS,tmp3
	moveta	dirY,posY.a
.no_xMove:
	movefa	world.a,tmp1
	mult	tmp2,tmp3
	add	tmp0,tmp1
	add	tmp3,tmp1
	loadb	(tmp1),tmp0
	cmpq	#0,tmp0
	jr	ne,.neither2
	nop
	moveta	dirX,posX.a
.neither2

	unreg dirX,dirY,posX,posY,tmp3
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
	movefa	posX.a,r0
	shrq	#FP_BITS,r0
	movei	#$00020008,r1
	BL	(r4)

	movefa	posY.a,r0
	shrq	#FP_BITS,r0
	movei	#$0002000D,r1
	BL	(r4)

	movei	#PrintDEC_YX,r4
	movefa	angle.a,r0
	shrq	#2,r0
	movei	#$00020012,r1
	BL	(r4)

	movefa	LOOP.a,r0
	jump	(r0)
	nop

;;; ----------------------------------------
;;; Text output
max_x_txt	equ rez_x_txt
max_y_txt	equ rez_y_txt

	include <js/inc/txtscr.inc>
	align 4
end:
	echo "end: %hend"

	ENDMODULE main
