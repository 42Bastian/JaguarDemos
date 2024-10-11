;-*-Asm-*-

START_X		equ 6
START_Y		equ 16
START_ANGLE	equ 90

WORLD_WIDTH	equ 31

;;; ****************************************
;;; Fixpoint (max. 7, else rounding errors appear)

FP_BITS		EQU 7
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

	movei	#START_X*FP+FP/2,tmp0
	movei	#START_Y*FP+FP/2,tmp1
	moveta	tmp0,posX.a
	moveta	tmp1,posY.a
	movei	#START_ANGLE<<2,tmp0
	moveta	tmp0,angle.a
	movei	#worldMap,tmp0
	moveta	tmp0,world.a

	move	PC,r0
	addq	#6,r0
	moveta	r0,LOOP.a
loop:
	movefa	BG.a,tmp0
	xor	tmp1,tmp1
	storew	tmp1,(tmp0)

	xor	VBLFlag,VBLFlag
waitStart:
	jr	eq,waitStart
	or	VBLFlag,VBLFlag

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

buffer.a	reg 99
sideDistX.a	reg 99
sideDistY.a	reg 99

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
	moveq	#7,tmp1
	move	dirX,planeY
	move	dirY,planeX
	neg	dirX
	imult	tmp1,planeX
	imult	tmp1,planeY
	sharq	#3,planeX
	sharq	#3,planeY
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
;;; ----------------------------------------
;;; draw loop
	;; prepare stripe drawing
.x_loop:
	//cameraX = 2*x*fp/_width-fp;
	move	x,cameraX
	shlq	#FP_BITS+1,cameraX
	movei	#rez_x,tmp0
	div	tmp0,cameraX

//->    int mapX = int(posX) & ~(int(fp)-1);
//->    int mapY = int(posY) & ~(int(fp)-1);

	move	fp,deltaDistX
	mult	fp,deltaDistX
	move	deltaDistX,deltaDistY

;;->    rayDirX = (dirX + planeX * cameraX/fp);
;;->    rayDirY = (dirY + planeY * cameraX/fp);

	movefa	planeX.a,rayDirX
	movefa	planeY.a,rayDirY

	sub	fp,cameraX

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
	imult	deltaDistX,sideDistX
	sharq	#FP_BITS,sideDistX
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
	imult	deltaDistY,sideDistY
	sharq	#FP_BITS,sideDistY
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

	moveq	#0,color
	movefa	world0.a,world
.wall_loop
	cmpq	#0,color
	jr	ne,.doneWall
	cmp	sideDistX,sideDistY
	jr	mi,.yStep
	nop
	moveq	#0,side
	add	stepX,world
	add	deltaDistX,sideDistX
	jr	.wall_loop
	loadb	(world),color

.yStep:
	moveq	#1,side
	add	stepY,world
	add	deltaDistY,sideDistY
	jr	.wall_loop
	loadb	(world),color
.doneWall

	unreg	world


//->    int perpWallDist;
//->    if (side == 0) perpWallDist = (sideDistX - deltaDistX);
//->    else           perpWallDist = (sideDistY - deltaDistY);

perpWallDist	reg 99

	cmpq	#0,side
	move	deltaDistX,tmp0
	jr	eq,.front
	move	sideDistX,perpWallDist

	move	deltaDistY,tmp0
	move	sideDistY,perpWallDist
.front
	sub	tmp0,perpWallDist

//->    //Calculate _height of line to draw on screen
//->    int line_height;
//->    line_height = (_height*fp / perpWallDist);
	movei	#rez_y*FP/2,height
	div	perpWallDist,height


//->      int wallX; //where exactly  the wall was hit
//->      if (side == 0) wallX = (posY - perpWallDist * rayDirY/fp);
//->      else           wallX = (posX + perpWallDist * rayDirX/fp);
//->
//->      //x coordinate on the texture
//->      int texX = (wallX*texWidth)/fp & (texWidth-1);
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

	unreg	perpWallDist
	unreg 	rayDirX,rayDirY
//->    // side == 1 => left
//->    // side == 0 => back
//->    boolean front = (side == 0 && stepX < 0);
//->    boolean right = (side == 1 && stepY < 0);

	moveq	#0,tmp2
	shlq	#4,side
	jr	eq,.frontCol
	cmpq	#0,stepY
	jr	pl,.leftBlock
	nop
	jr	.leftBlock
	bset	#0,tmp2
.frontCol
	bset	#0,tmp2
	cmpq	#0,stepX
	jr	pl,.leftBlock
	nop
	bclr	#0,tmp2
.leftBlock

bcount	reg 99

	movei	#rez_y/2,y
	move	height,bcount
	sub	height,y
	jr	pl,.ok
	shlq	#16+1,bcount
	moveq	#0,y
	movei	#rez_y<<16|1,bcount
	movei	#rez_y/2,height
.ok
	bset	#0,bcount
	shlq	#16,y
	or	x,y

	movei	#.no_texture,tmp0
	btst	#7,color
	movei	#textureTable,tmp1
	jump	eq,(tmp0)
	bclr	#7,color
	add	color,tmp1
	load	(tmp1),tmp1

	btst	#0,tmp2
	jr	ne,.xx
	nop
	not	wallX
.xx
	shlq	#32-7,wallX
	shrq	#32-7,wallX

	WAITBLITTER

	movei	#BLIT_PITCH1|BLIT_PIXEL8|BLIT_WID128|BLIT_XADDPIX,tmp0
	store	tmp1,(blitter)
	store	tmp0,(blitter+_BLIT_A1_FLAGS)
	moveq	#0,tmp0
	store	wallX,(blitter+_BLIT_A1_PIXEL)
	store	tmp0,(blitter+_BLIT_A1_FPIXEL)

	movei	#128<<16,tmp2
	div	height,tmp2
	shrq	#1,tmp2
	move	tmp2,tmp1
	movei	#((-1) & 0xffff),tmp0
	shrq	#16,tmp1
	shlq	#16,tmp1
	or	tmp1,tmp0
	store	tmp0,(blitter+_BLIT_A1_STEP)

	shlq	#16,tmp2
	store	tmp2,(blitter+_BLIT_A1_FSTEP)

	movefa	screen1.a,tmp0
	store	tmp0,(blitter+_BLIT_A2_BASE)
	movei	#BLIT_PITCH1|BLIT_PIXEL8|BLIT_WID|BLIT_XADDPIX,tmp0
	movei	#0<<16|((rez_x-1) & 0xffff),tmp1
	store	tmp0,(blitter+_BLIT_A2_FLAGS)
	store	tmp1,(blitter+_BLIT_A2_STEP)
	store	y,(blitter+_BLIT_A2_PIXEL)
	store	bcount,(blitter+_BLIT_COUNT)
	movei	#.next,tmp1
	movei	#BLIT_LFU_REPLACE|BLIT_SRCEN|BLIT_UPDA1|BLIT_UPDA2|BLIT_DSTA2|BLIT_UPDA1F,tmp0
	jump	(tmp1)
	store	tmp0,(blitter+_BLIT_CMD)

.no_texture
	add	side,color
	xor	tmp2,color

	movei	#B_PATDSEL,tmp2
	movei	#BLIT_PITCH1|BLIT_PIXEL8|BLIT_WID|BLIT_XADD0|BLIT_YADD1,tmp3

	WAITBLITTER

	movefa	screen1.a,tmp0
	store	tmp0,(blitter)
	store	tmp3,(blitter+_BLIT_A1_FLAGS)
	store	y,(blitter+_BLIT_A1_PIXEL)
	store	bcount,(blitter+_BLIT_COUNT)
	store	color,(blitter+_BLIT_PATD)
//->	store	color,(blitter+_BLIT_PATD+4) ;VJ only
	store	tmp2,(blitter+_BLIT_CMD)
.next
	subq	#1,x
	movei	#.x_loop,tmp0
	jump	pl,(tmp0)
	nop
.donex

	unreg height,x,y,side,left,fp,buffer.a,bcount

	unreg stepX,stepY,sideDistX,sideDistY,deltaDistX,deltaDistY
	unreg cameraX,color

	unreg sideDistX.a,sideDistY.a,world0.a

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
	moveq	#10,tmp2
	btst	#JOY_UP_BIT,r3
	movefa	posX.a,posX
	jr	ne,.forward
	movefa	posY.a,posY
	subq	#20,tmp2
	btst	#JOY_DOWN_BIT,r3
	movei	#.neither2,tmp0
	jump	eq,(tmp0)
.forward
	imult	tmp2,dirX
	imult	tmp2,dirY
	sharq	#FP_BITS,dirX
	sharq	#FP_BITS,dirY
	add	dirX,posX
	sub	dirY,posY
 IF 0
	move	posX,tmp0
	move	posY,tmp1
	shrq	#FP_BITS,tmp0
	shrq	#FP_BITS,tmp1
	moveq	#WORLD_WIDTH,tmp2
	mult	tmp2,tmp1
	movefa	world.a,tmp2
	add	tmp0,tmp2
	add	tmp1,tmp2
	loadb	(tmp2),tmp0
	cmpq	#0,tmp0
	jr	ne,.neither2
	nop
 ENDIF
	moveta	posX,posX.a
	moveta	posY,posY.a
.neither2

	unreg dirX,dirY,posX,posY
;;; ------------------------------
;;; time

	movefa	VID_PIT.a,tmp0
	loadw	(tmp0),tmp0

	movei	#$ffff,tmp1
	movei	#PrintDEC2_YX,r4
	xor	tmp1,tmp0
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
