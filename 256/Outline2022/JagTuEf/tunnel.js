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

 IFD DEBUG
OBL	EQU $36fe0 		; DEBUG
 ELSE
OBL	EQU $37000
 ENDIF

 IFD MODEL_M
STUB_SIZE	EQU 28
 ELSE
STUB_SIZE	EQU 16
 ENDIF

OBL_UPDATE_M	EQU $4804
OBL_UPDATE_K    EQU $58f8

	include <js/symbols/jagregeq.js>

	;; ROM sets this mode
ScreenMode	EQU CRY16|VIDEN|PWIDTH4|BGEN|CSYNC

LOOPY		REG 31
LOOPX		REG 30
VBLCOUNTER	REG 29
BG_COL		REG 28
screen_ptr	REG 27
TABLE		REG 26
obl		REG 25

min256		REG 19
midx		REG 17
midy		REG 16
sign		REG 15
_x		REG 14
_y		REG 13
x		REG 12
y		REG 11
sgn		REG 10

table		equ $50000
screen		EQU $100000

	RUN $00F035AC
start:
	;; patch OBL update
 IFD MODEL_M
	;; expect r13 = $13 when started by BIOS
	movei	#OBL_UPDATE_M-_68k_e+STUB_SIZE,r1
patch:
	load	(r14),r3
	subq	#3,r13
	store	r3,(r14+r1)
	jr	ne,patch
	subqt	#4,r14
 ELSE
	moveq	#4,r0
	store	r0,(r14+8)	; write stop-object
	movei	#OBL_UPDATE_K,r0
	moveq	#_68k_e-_68k-4,r1
	sub	r1,r14
	store	r14,(r0)	; patch OBL0
 ENDIF
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

	move	pc,MAIN		; Atari says, this does not work ;-)
	shlq	#1,midy
	addq	#6,MAIN

main:
	moveq	#screen>>16,screen_ptr
	movefa	TABLE,TABLE
	shlq	#16,screen_ptr
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
	moveq	#0,r4
	addqt	#8,TABLE
	move	r3,r2
	shrq	#16,r3
	sub	frameCounter,r2
	add	frameCounter,r3
	xor	r3,r2
	btst	#4,r2
	jr	ne,noc
	btst	#0,r1
	move	r9,r4
noc:
	jr	ne,odd
	bset	#15,r4
	rorq	#16,r4
odd:
	store	r4,(screen_ptr)
	subq	#1,r0
	addqt	#4,screen_ptr
	jump	ne,(LOOP)
	load	(TABLE),r3

	subq	#1,r1
	jump	ne,(LOOP)
	move	midx,r0

	jump	(MAIN)
	addq	#1,frameCounter

	.long			; 68k code must be long aligned
end:
size	set end-start

free	set WANTED_SIZE-size-STUB_SIZE
free0	set free

	IF free < 0
WANTED_SIZE	SET WANTED_SIZE+64
BLOCKS		SET BLOCKS+1
free		set free+64
	ENDIF

	if free > 0
	REPT	WANTED_SIZE-size-STUB_SIZE
	dc.b	$42
	ENDR
	endif
_68k:
	.incbin "irqstub.img"
_68k_e:
_xx	equ (_68k_e - _68k)
	IF (_68k_e - _68k) <> STUB_SIZE
	echo "irqstub size changed, fix copy routine:%d_xx %dSTUB_SIZE"
	ENDIF

patch_size	equ (patche-start)+(_68k_e-_68k)
	echo "GPU Size:%dsize | 68k+patcher size: %dpatch_size | Free:%dfree0"
	echo "%dWANTED_SIZE Last: %x_68k_e"
 END
