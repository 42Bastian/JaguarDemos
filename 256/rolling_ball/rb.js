;; -*-asm-*-
;;; ----------------------------------------
;;; Rollin'ball
;;; Party: Sommarhack'24
;;; Compo: 256b intro
;;; Author: 42Bastian
;;;
;;; ----------------------------------------
//->TIMING	EQU 1

	gpu

 IFD MODEL_M
 echo "Model M"
 ENDIF

WANTED_SIZE	SET 256

BLOCKS		SET (WANTED_SIZE/64)		; max. is 10

	include <js/symbols/jagregeq.js>
	include <js/symbols/blit_eq.js>

	REGTOP 31
screen_ptr	reg 22
blitter		reg 15
i2s_left	reg 14
blit_cmd	reg 3
tmp2		reg 2
tmp1		reg 1
tmp0		reg 0


lr		reg 99
main		reg 99
base_color	reg 99

PLOT		reg 99
current_scr	reg 99
restart		reg 99
radius		reg 99
xc		reg 99
yc		reg 99

t1		reg 99
t2		reg 99
y0		reg 99
x0		reg 99
x		reg 99
y		reg 99
xc0		reg 99
yc0		reg 99
dyc		reg 99
dxc		reg 99
frame		reg 99
frame2		reg 99
snd		reg 99

MACRO WAITBLITTER
.\wait@
	load (blitter+$38),tmp0
	shrq #1,tmp0
	jr cc,.\wait@
//->	nop
ENDM

	RUN $00F035AC		; Start address after decryption. Fix!!!
start:
 IFD MODEL_M
	movei	#$5076,r14
 ELSE
	movei	#$5070,r14
 ENDIF
	storew	r3,(r14)	; disable BIOS double buffering (r3 == 0)

	movei	#$37120,r0
	storeb	r4,(r0)		; disable Jaguar logo

	movei	#$f1a114,i2s_left	; disable DSP -> Roaar
	store	r3,(i2s_left)

;;; setup
	shlq	#10,screen_ptr
	movei	#$3720c,current_scr
	move	screen_ptr,r1
.cls
	subq	#1,r0
	store	r3,(r1)
	jr	ne,.cls
	addqt	#4,r1

	bset	#16,blit_cmd

	moveq	#0,frame
	movei	#plot,PLOT
	move	pc,restart
superloop:
	moveq	#25,radius
	shlq	#2,radius

	moveq	#10,xc0
	moveq	#29,yc0
	shlq	#4+7,xc0
	shlq	#2+7,yc0

;;; main loop
mainloop:
	addq	#7,frame
	store	screen_ptr,(current_scr)
	movei	#$37000,r1
wvbl:	load	(r1),r0
	shrq	#8,r0
	xor	screen_ptr,r0
	jr	ne,wvbl

	bset	#18,tmp0
	xor	tmp0,screen_ptr

//->	moveq	#0,tmp0
	move	screen_ptr,base_color
	movei	#$f1d200,r15	; DSP sine table
	bset	#7,tmp0
	move	frame,tmp1
	move	frame,tmp2
	add	tmp0,tmp1
	subq	#1,tmp0
	move	tmp0,dyc
	move	tmp0,dxc
	shlq	#2,tmp0
	and	tmp0,tmp1
	load	(r15+tmp1),tmp1
	and	tmp0,tmp2
	load	(r15+tmp2),tmp2

	imult	tmp1,dyc
	imult	tmp2,dxc
	sharq	#15-1,dyc
	sharq	#15-1,dxc

	movei	#$f02200,blitter
	store	screen_ptr,(blitter)	;_BLIT_A1_BASE
	movei	#BLIT_PITCH1|BLIT_PIXEL16|BLIT_WID320|BLIT_XADDPIX,tmp0
	store	tmp0,(blitter+_BLIT_A1_FLAGS)

	move	pc,main
//->	addq	#4,main
_main::
	add	dxc,xc0
	add	dyc,yc0
	move	xc0,xc
	move	yc0,yc
	shrq	#7,xc
	shrq	#7,yc

;;; ------------------------------
	move	radius,x
	move	radius,t1
	moveq	#0,y
	moveq	#0,y0

.loop
	move	pc,lr
	jump	(PLOT)
	move	x,x0

//->	move	x,y0	; done in PLOT
	jump	(PLOT)
	move	y,x0

	addqt	#1,y
	cmp	x,y
	jr	pl,.done
	add	y,t1

	move	t1,t2
	sub	x,t2
	jr	mi,.loop
	move	y,y0

	move	t2,t1
	jr	.loop
	subqt	#1,x
.done
;;; ------------------------------
	subq	#3,radius
	jump	pl,(main)
	addqt	#7,base_color

	jump	(restart)
//->	nop

plot:
	;; sound
	store	snd,(i2s_left+(L_DAC-$f1a114))
	store	snd,(i2s_left+(R_DAC-$f1a114))

	xor	frame,snd
	add	frame,snd

	;; draw hline
	move	yc,r2
	move	xc,r1
	add	y0,r2
	sub	x0,r1
	shlq	#16,r2
	or	r1,r2
	move	x0,r1
	WAITBLITTER
	bset	#17,r1
	neg	y0
	store	r2,(blitter+_BLIT_A1_PIXEL)
	store	r1,(blitter+_BLIT_COUNT)
	store	base_color,(blitter+_BLIT_PATD)

	jump	mi,(PLOT)
	store	blit_cmd,(blitter+_BLIT_CMD)

	addq	#4,lr
	jump	(lr)
	move	x,y0

end:
size	set end-start

free	set WANTED_SIZE-size
free0	set free

	IF free < 0
WANTED_SIZE	SET WANTED_SIZE+64
BLOCKS		SET BLOCKS+1
free		set free+64
	ENDIF
	if free > 0
	REPT	WANTED_SIZE-size
	dc.b	$42
	ENDR
	endif

	regmap

	echo "GPU Size:%dsize | Free:%dfree0"
	echo "%dWANTED_SIZE"

 END
