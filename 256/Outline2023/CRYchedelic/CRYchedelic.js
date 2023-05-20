;; -*-asm-*-
;;; ----------------------------------------
;;; CRYchedelic
;;; Author: 42Bastian
;;; Release: Outline 2023
;;; ----------------------------------------
;;; Model M: 6 bytes free
;;; Model K: 6 bytes free
;;; ----------------------------------------

//->TIMING	EQU 1

	gpu

 IFD MODEL_M
 echo "Model M"
 ENDIF

WANTED_SIZE	SET 256

BLOCKS		SET (WANTED_SIZE/64)		; max. is 10

OBL		EQU $37020

	include <js/symbols/jagregeq.js>
	include <js/symbols/blit_eq.js>

	REGTOP 31
blitter		reg 14
tmp1		reg 1
tmp0		reg 0

lr		reg 99
main		reg 99
blit_count	reg 99
blit_cmd	reg 99
screen_ptr	reg 99
LOOP		reg 99
obl		reg 99
PLOT		reg 99
current_scr	reg 99
restart		reg 99
base_color	reg 99
radius		reg 99
xc		reg 99
yc		reg 99
bg_col		reg 99
d		reg 99
y0		reg 99
x0		reg 99


MACRO WAITBLITTER
.\wait@
	load (blitter+$38),tmp0
	shrq #1,tmp0
	jr cc,.\wait@
	nop
ENDM

	RUN $00F035AC		; Start address after decryption. Fix!!!
start:
 IFD MODEL_M
	movei	#$5076,r14
 ELSE
	movei	#$5070,r14
 ENDIF
	storew	r3,(r14)

	movei	#$f1a114,r0	; disable DSP -> Roaar
	store	r3,(r0)

;;; setup
 IFD TIMING
	movei	#$f00058,bg_col
 ENDIF
	moveq	#16,screen_ptr
	shlq	#16,screen_ptr

	movei	#$f02200,blitter
	store	screen_ptr,(blitter)	;_BLIT_A1_BASE

	moveq	#25,tmp0
	shlq	#16,tmp0
	store	tmp0,(blitter+_BLIT_A1_PIXEL)
	moveq	#15,tmp0
	shlq	#12,tmp0
	store	tmp0,(blitter+_BLIT_PATD)
	moveq	#0,tmp0
	bset	#6,tmp0				; = $200
	store	tmp0,(blitter+$70)		; int inc
	movei	#BLIT_PITCH1|BLIT_PIXEL16|BLIT_WID320|BLIT_XADDPIX,tmp0
	store	tmp0,(blitter+_BLIT_A1_FLAGS)
	movei	#(204<<16)|(320),tmp0
	movei	#B_PATDSEL|B_GOURD,blit_cmd
	store	tmp0,(blitter+_BLIT_COUNT)
	store	blit_cmd,(blitter+_BLIT_CMD)

	moveq	#1,blit_count
	movei	#$3720c,current_scr
	store	screen_ptr,(current_scr)
	bset	#16,blit_count
	movei	#OBL,obl

	moveq	#10,xc
	shlq	#4,xc
	moveq	#29,yc
	shlq	#2,yc

	movei	#plot,PLOT
	move	pc,restart
superloop:
	moveq	#26,radius
	shlq	#2,radius

;;; main loop
mainloop:
 IFD TIMING
	moveq	#0,r0
 ENDIF
wvbl:	load	(obl),r1
	shrq	#8,r1
	cmp	screen_ptr,r1
	jr	ne,wvbl
 IFD TIMING
	storew	r0,(bg_col)
	storew	bg_col,(bg_col)
 ENDIF
	move	pc,main
;;; ------------------------------
	moveq	#3,d
	move	radius,y0
	sub	radius,d
	moveq	#0,x0

	move	pc,LOOP
	addq	#4,LOOP
.loop
	move	x0,r1
	move	y0,r2

	move	pc,lr
	jump	(PLOT)
	addq	#2,lr		; x,y

	jump	(PLOT)		; -x,y
	neg	x0

	jump	(PLOT)		; -x,-y
	neg	y0

	jump	(PLOT)		; x,-y
	neg	x0

	move	r1,y0		; x0 => y0
	move	r2,x0		; y0 => x0

	jump	(PLOT)
	addq	#4,lr		; y,x

	jump	(PLOT)		; -y,x
	neg	x0

	jump	(PLOT)		; -y,-x
	neg	y0

	jump	(PLOT)		; y,-x
	neg	x0

	move	r1,x0

	cmp	r2,r1		; r2 == saved y0, r1 == saved x0
	move	r2,y0
	jr	pl,.done
	cmpq	#0,d
	addqt	#1,x0
	jr	mi,.xx
	move	x0,r0
	subqt	#1,y0
	addqt	#1,r0
	sub	y0,r0
.xx
	shlq	#2,r0
	addq	#6,r0
	jump	(LOOP)
	add	r0,d
.done
;;; ------------------------------
	subq	#1,radius
	jump	pl,(main)
	addq	#5,base_color

	jump	(restart)

//->	nop

plot:
	move	y0,r0
	add	yc,r0
	shlq	#16,r0
	or	xc,r0
	add	x0,r0
	store	r0,(blitter+_BLIT_A1_PIXEL)

	WAITBLITTER

	move	base_color,r0
	store	r0,(blitter+_BLIT_PATD)
	store	blit_count,(blitter+_BLIT_COUNT)
	addq	#4,lr
	store	blit_cmd,(blitter+_BLIT_CMD)
	jump	(lr)
	addqt	#1,base_color

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
