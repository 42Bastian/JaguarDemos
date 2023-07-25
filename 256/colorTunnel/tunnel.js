;;; -*-asm-*-
;;; ----------------------------------------
;;; JagTuEf - Boot Intro
;;; Model M: 28 byte 68k, 226 bytes GPU => 254 in total
;;; Model K: 16 byte 68k, 228 bytes GPU => 244 in total
;;;
	;; -*-asm-*-
	gpu

WANTED_SIZE	SET 256
BLOCKS		SET (WANTED_SIZE/64)		; max. is 10

OBL		EQU $37000 		; DEBUG

	include <js/symbols/jagregeq.js>

	;; ROM sets this mode
ScreenMode	EQU CRY16|VIDEN|PWIDTH4|BGEN|CSYNC

LOOPY		REG 31
LOOPX		REG 30
VBLCOUNTER	REG 29
BG_COL		REG 28
screen_ptr	REG 14
TABLE		REG 26
obl		REG 25

min256		REG 19
midx		REG 17
midy		REG 16
sign		REG 15
_x		REG 27
_y		REG 13
x		REG 12
y		REG 11
sgn		REG 10

table		equ $40000
screen		EQU $100000

	RUN $00F035AC
start:
	;; patch OBL update
 IFD MODEL_M
	movei	#$5076,r14	; 5076 : Disable BIOS double buffering
 ELSE
	movei	#$5064,r14
 ENDIF
	storew	r3,(r14)	; 5064 : Disable BIOS double buffering
	movei	#$f1a114,r0
	store	r3,(r0)
	subq	#1,r3
	movei	#$37120,r0
	storeb	r3,(r0)		; disable logo object
patche:
 IFD TIMING
	movei	#$f00058,BG_COL
	movei	#OBL,obl
 ENDIF
	moveq	#table>>16,TABLE
	shlq	#16,TABLE
	moveta	TABLE,TABLE

	moveq	#10,midx
	shlq	#4,midx		; 160
	moveq	#15,midy
	shlq	#3,midy		; 120
	move	midy,y
	shlq	#1,y

	move	pc,LOOPY
ly:
	move	midx,x
	shlq	#1,x

	move	pc,LOOPX
lx:
	move	x,_x
	move	y,_y
	sub	midx,_x
	sub	midy,_y
	move	_x,sign
	xor	_y,sign

	imultn	_x,_x		; x^2
	imacn	_y,_y		; y^2
	resmac	r4		; x^2+y^2

	movefa	TABLE,r5	; $50000
	div	r4,r5

	abs	_x
	abs	_y

	cmp	_y,_x
	jr	cc,noswap
	moveq	#1,sgn

	xor	_x,_y
	xor	_y,_x
	xor	_x,_y

	subq	#2,sgn
noswap:
	shlq	#8,_y
	addq	#1,_x		; prevent div by zero
	div	_x,_y		; => z

	UNREG	_y
z	REG	13

	move	z,r7
	shlq	#5,r7
	imult	sgn,r7		; r7 = sg*32*z

	move	min256,r8
	add	z,r8
	imult	z,r8		; r8 = z*(z-256)

	movei	#692,r9
	imult	r9,z
	shlq	#2,r9		; 2552 =~ 692*4
	add	r9,z		; z = 2552+692*z/256
	imult	r8,z
	sharq	#8+8+8,z	; /256/256

	imult	sgn,z		; z = sg*(z*(z-256)/256)*(2552+692*z/256)/256
	sub	z,r7

	btst	#31,sign
	jr	ne,nox
	sharq	#8,r7

	not	r7
nox:
	sat8	r5
	storew	r7,(TABLE)
	addqt	#2,TABLE
	storew	r5,(TABLE)
	addqt	#2,TABLE
	not	r5
	subq	#1,x
	storeb	r5,(TABLE)
	jump	ne,(LOOPX)
	addqt	#2,TABLE

	subq	#1,y
	jump	ne,(LOOPY)

	UNREG	LOOPX,LOOPY,sgn,x,y,_x,z,min256
;; -----------------------------------

MAIN		REG 31
LOOP		REG 30
frameCounter	REG 11		; was y
_ror		reg 24

	moveq	#0,_ror
	shlq	#1,midy
	move	pc,MAIN

main:
	shlq	#20,frameCounter
	moveq	#screen>>16,screen_ptr
	shrq	#20,frameCounter
	movefa	TABLE,TABLE
	shlq	#16,screen_ptr
	movei	#$3720c,r0
	store	screen_ptr,(r0)
 IFD TIMING
	storew	r0,(BG_COL)
wvbl:
	shrq	#8,r1
	cmp	r1,screen_ptr
	jr	ne,wvbl
	load	(obl),r1
	storew	BG_COL,(BG_COL)
 ENDIF
	move	midy,r1
	move	midx,r0

	move	pc,LOOP
	load	(TABLE),r3
	addq	#6,LOOP
loop:
	addqt	#4,TABLE
	loadb	(TABLE),r9
	move	r3,r2
	shrq	#16,r3
	sub	frameCounter,r2
	add	frameCounter,r3
	xor	r3,r2
	mult	r3,r9
	shlq	#27,r2
	addqt	#8,TABLE
	shrq	#31,r2
	imult	r2,r9
	ror	_ror,r9
	subq	#1,r0
	store	r9,(screen_ptr)
	addqt	#4,screen_ptr
	jump	ne,(LOOP)
	load	(TABLE),r3

	moveq	#20,r9
	moveq	#15,r8
	shlq	#5,r9
	shlq	#7,r8
	add	r9,screen_ptr
	add	r8,TABLE
	subq	#2,r1
	addqt	#16,_ror
	jump	ne,(LOOP)
	move	midx,r0

	jump	(MAIN)
	addqt	#1,frameCounter


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

patch_size	equ (patche-start)
	echo "GPU Size:%dsize | Patch size %dpatch_size | Free:%dfree0"
	echo "%dWANTED_SIZE"
 END
