;; -*-asm-*-
;;;  Invaders
;;; ----------------------------------------
;;; Author: 42Bastian
;;; Release: LoveByte 2025
;;; ----------------------------------------
;;; Size: 256 bytes
;;; ----------------------------------------

	gpu

	include <js/symbols/jagregeq.js>
	include <js/symbols/blit_eq.js>
	include <js/macro/help.mac>

	UNREG LR,SP,LR.a,SP.a

//->TIMING	SET 1

 IFD MODEL_M
 echo "Model M"
 ENDIF

 IFD TIMING
WANTED_SIZE	SET 256+64
 ELSE
WANTED_SIZE	SET 256
 ENDIF

BLOCKS		SET (WANTED_SIZE/64)		; max. is 10

OBL		EQU $37000

		regtop 31

LR		reg 31
DSP_BASE		reg 15
blitter		reg 14
sine_tab	reg 14!
screen_ptr	reg 22
tmp2		reg 2
tmp1		reg 1
tmp0		reg 0

cur_scr		reg 99
color		reg 99
restart		reg 99
obl		reg 99
frame		reg 99
center_x	reg 99
x_size		reg 99
x_limie		reg 99
x		reg 99
z		reg 99
max_z		reg 99
LOOP_X		REG 99
LOOP_Z		REG 99
SINE		reg 99
bg		reg 99
_160		reg 99
sine_mask	reg 99
hi		reg 99
reci		reg 99
NO_DRAW		reg 99
sin_z		reg 99
dac		reg 99
ldac		reg 99

	RUN $00F035AC		; Start address after decryption. Fix!!!
start:
 IFD MODEL_M
	movei	#$5076,r0
 ELSE
	movei	#$5064,r0
 ENDIF
	storew	r3,(r0)		; Disable BIOS double buffering (r3 == 0)

	movei	#OBL+$120,obl
	store	r4,(obl)    	; disable logo object (r4 < 0)

	movei	#$f1a100,DSP_BASE
	store	r3,(DSP_BASE+$14)	; disable DSP -> Roaar

//->VAL_SCLK	equ ((26593900*4/10000+128)>>8)-1
//->	moveq	#31,r1
//->	addq	#VAL_SCLK-31,r1
//->	store	r1,(DSP_BASE+$50)
//->	moveq	#%001101,r1
//->	store	r1,(DSP_BASE+$54)

;;; ----------------------------------------
;;; setup
;;; ----------------------------------------
	movei	#$3720c,cur_scr
	shrq	#9,obl
	shlq	#9,obl

	moveq	#10,center_x
	shlq	#4+1,center_x
	moveq	#5,_160
	shlq	#4,_160

 IFD TIMING
	movei	#$f00058,bg
 ENDIF
snd_cnt	reg 99
	moveq	#0,snd_cnt

	move	pc,restart
superloop:
	load	(cur_scr),screen_ptr
 IFD TIMING
	storew	screen_ptr,(bg)
 ENDIF
wvbl:	load	(obl),r1
	shrq	#8,r1
	cmp	screen_ptr,r1
	jr	ne,wvbl
	moveq	#0,z
 IFD TIMING
	storew	bg,(bg)
 ENDIF

	movei	#$f02200,blitter
	;; clear screen
	movei	#BLIT_PITCH1|BLIT_PIXEL32|BLIT_WID3584|BLIT_XADDPHR,r1
	store	r1,(blitter+_BLIT_A1_FLAGS)

	store	screen_ptr,(blitter)	;_BLIT_A1_BASE
	moveq	#$19,r1
	store	z,(blitter+_BLIT_A1_PIXEL)
	shlq	#12,r1	       ; ~=  (1<<16)|(320*220/2)
	store	r1,(blitter+_BLIT_COUNT)
	store	z,(blitter+_BLIT_CMD)

	movei	#$f1d600,sine_tab ; DSP sine table

	move	pc,LOOP_Z
loop_z:
	moveq	#29,tmp0
	moveq	#0,reci
	shlq	#4,tmp0
	bset	#15,reci
	sub	z,tmp0
	div	tmp0,reci
	move	frame,sin_z
	sub	z,sin_z
	shlq	#32-9,sin_z
	shrq	#32-9,sin_z
	load	(sine_tab+sin_z),sin_z
//->	moveq	#0,sin_z

hi_f	reg 99

	move	_160,x
	addq	#2,snd_cnt
	neg	x
;;; --------------------
	move	snd_cnt,r0
	neg	r0
	shrq	#11,r0
	moveq	#1,r1
	and	r1,r0
	neg	r0
	addq	#2,r0
	mult	snd_cnt,r0

	move	snd_cnt,r1
	shrq	#10,r1
	moveq	#3,r2
	and	r2,r1
	addq	#5,r1
	mult	r1,r0

	move	snd_cnt,r1
	shrq	#9,r1
	moveq	#3,r2
	and	r2,r1
	sha	r2,r0
	shlq	#3,r0

	move	snd_cnt,r1
	shrq	#6,r1
	or	r1,r0

	move	snd_cnt,r1
	shlq	#8,r1
	shrq	#15+8,r1
;;->	addq	#1,r1
	mult	r1,r0

	;;
	shlq	#24-2,r0
	shrq	#18,r0

	add	ldac,dac
	shrq	#1,dac
	move	r0,ldac
;;; --------------------
	move	PC,LOOP_X
//->	addq	#2,LOOP_X
loop_x:
	store	dac,(DSP_BASE+$48)
	store	dac,(DSP_BASE+$4c)

	move	frame,hi_f
	add	x,hi_f
	shlq	#32-9,hi_f
	shrq	#32-9,hi_f
	load	(sine_tab+hi_f),hi

	add	sin_z,hi
	move	hi,color
	sharq	#11-1,hi

	move	x,tmp0
	moveq	#31,tmp1
	imult	reci,tmp0
	bset	#6,tmp1
	sharq	#15-8-1,tmp0
	sub	hi,tmp1
	add	center_x,tmp0
	subq	#2,tmp0

	mult	reci,tmp1
	shrq	#15-8,tmp1
	mult	center_x,tmp1
	shlq	#1,tmp1
	add	tmp0,tmp1

	not	color
	add	screen_ptr,tmp1
	shrq	#4,color
	cmp	x,_160
	storew	color,(tmp1)
	jump	pl,(LOOP_X)
	addqt	#8,x

	cmp	z,center_x	; max_z!
	jump	ne,(LOOP_Z)
	addq	#4,z

	jump	(restart)
	addq	#4,frame

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
	echo "Wanted %dWANTED_SIZE"

 END
