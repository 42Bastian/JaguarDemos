;; -*-asm-*-
;;; StarPath variation for Jaguar
;;; ----------------------------------------
;;; Running Tom & Jerry in parallel
;;; ----------------------------------------
;;; 0 Bytes free
;;; ----------------------------------------

	gpu

	include <js/symbols/jagregeq.js>
	include <js/macro/help.mac>

	UNREG LR,SP,LR.a,SP.a

 IFD MODEL_M
 echo "Model M"
 ENDIF

WANTED_SIZE	SET 256

BLOCKS		SET (WANTED_SIZE/64)		; max. is 10

OBL		EQU $37000

	regtop 31

sound		reg 15
ptr		reg 14

restart		reg 99
screen_ptr	reg 99

obl		reg 99
current_scr	reg 99
x1		reg 99
y1		reg 99
d0		reg 99
q		reg 99
x		reg 99
y		reg 99
XLOOP		reg 99
YLOOP		reg 99
timer		reg 99
color		reg 99
offset		reg 99
temp0		reg 99
temp1		reg 99
x0		reg 99
y0		reg 99
_ror		reg 99
lineoff		reg 99
noisetable	reg 99

	RUN $00F035AC		; Start address after decryption. Fix!!!
start:
 IFD MODEL_M
	movei	#$5076,r0
 ELSE
	movei	#$5064,r0
 ENDIF
	storew	r3,(r0)		; disable BIOS double buffering

	movei	#OBL+$120,r14
	store	r4,(r14)	; disable logo object (r4 < 0)

	movei	#DSP_FLAGS,r14
	movei	#($1f<<9)|(0<<14)|(1<<17),r4
	store	r3,(r14+DSP_CTRL-DSP_FLAGS)	; stop DSP
	store	r4,(r14)	; clear interrupts

 IFND MODEL_M
	moveq	#0,r0
	bset	#20,r0
	moveq	#3,r1
	shlq	#16,r1
.cls	subq	#1,r1
	store	r3,(r0)
	jr	pl,.cls
	addq	#4,r0
 ENDIF

	move	r14,r0
	bset	#12,r0		; => f1b100
	store	r0,(r14+DSP_PC-DSP_FLAGS)
	moveq	#31,r2
	shlq	#4,r2
__x	move	pc,r1
	addq	#dsp_code-__x,r1
.cpy
	load	(r1),r3
	addq	#4,r1
	subq	#1,r2
	store	r3,(r0)
	jr	ne,.cpy
	addq	#4,r0

	store	r0,(r0)		; needed, else DSP does not run?!

	moveq	#1,r0
	store	r0,(r14+DSP_CTRL-DSP_FLAGS)
	jr	.skip
	moveq	#4,offset

	align 4
dsp_code:
	moveq	#0,offset
	movei	#L_I2S,r15
	movei	#ROM_NOISE,noisetable

.skip
;;; setup
	moveq	#0,screen_ptr
	moveq	#0,_ror
	bset	#20,screen_ptr
	movei	#OBL,obl
	movei	#$3720c,current_scr

	moveq	#320>>4,lineoff
	shlq	#5,lineoff

	moveq	#0,timer

	move	pc,restart
superloop:
//->	cmpq	#0,offset
	moveq	#0,r0
//->	jr	eq,wvbl
	bset	#19,r0
	store	screen_ptr,(current_scr)

wvbl:	load	(obl),r1
	shrq	#8,r1
	cmp	screen_ptr,r1
	jr	ne,wvbl
	moveq	#15,y

	xor	r0,screen_ptr
	shlq	#4,y
	move	screen_ptr,ptr
	moveq	#0,y0

	move	pc,YLOOP
yloop:
	moveq	#0,x0
	move	lineoff,x
	move	pc,XLOOP
	addq	#4,XLOOP
xloop:
	move	y0,d0
	move	x0,x1
	shrq	#1,d0
	move	y0,y1
	add	x0,d0

	move	timer,q

scanloop:
	move	x1,color
	moveq	#15,temp1
	or	y1,color
	shrq	#8,color
	and	q,color
	cmp	color,temp1
	subqt	#12,d0
	jr	mi,.exit
	add	d0,x1
	addqt	#1,q
	jr	pl,scanloop
	add	y0,y1

.exit
	cmpq	#0,offset
	move	y0,temp0
	jr	ne,.gpu		; Sound only by DSP
	shlq	#26,temp0

	shrq	#26-2,temp0
	add	noisetable,temp0
	load	(temp0),temp0

	store	temp0,(r15)
	store	temp0,(r15+R_I2S-L_I2S)
.gpu
	shlq	#4,color
	moveq	#19,temp0
	bset	#14,color
	cmpq	#0,x1
	jr	pl,.stairs
	mult	temp0,color

	cmpq	#0,offset	; stars only by GPU
	move	y0,color
	jr	eq,.stairs
	move	y1,temp0
	add	x,y1
	shlq	#9,temp0
	shlq	#25,y1		; "random" stars
	jr	ne,.stairs
	or	y,temp0
	move	temp0,color
	bset	#7,color
.stairs
	addqt	#4,x0
	ror	_ror,color	; "swap" pixel every line
	subq	#8,x
	store	color,(ptr+offset)
	jump	ne,(XLOOP)
	addqt	#8,ptr

	add	lineoff,ptr	; skip one line
	subq	#2,y
	addqt	#2,y0
	jump	ne,(YLOOP)
	addqt	#16,_ror

	jump	(restart)
	addq	#1,timer

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

	echo "GPU Size:%dsize | Free:%dfree0"
	echo "%dWANTED_SIZE"

 END
