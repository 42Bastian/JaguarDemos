	;; -*-asm-*-
	gpu

WANTED_SIZE	EQU 64*2
BLOCKS		EQU (WANTED_SIZE/64)		; max. is 10

CLEAR_LOGO	EQU 1

VBL_COUNTER	EQU $3721c

screen2_ptr	reg 28
rnd		reg 27
_240		reg 26
_320		reg 25
LOOP		reg 24
screen_ptr	reg 14

	;; Resolution is 320x239x16
screen	EQU $100000
screen2	EQU $125800
jagscrn EQU $15d000

	include <js/symbols/jagregeq.js>

	;; ROM sets this mode
ScreenMode	EQU CRY16|VIDEN|PWIDTH4|BGEN|CSYNC

	RUN $00F035AC
start:
 IFD CLEAR_LOGO
	moveq	#31,r1
	shlq	#13,r1
	movei	#jagscrn,r2
clear1:
	subq	#8,r1
	store	r3,(r2)		; r3 == 0 by ROM
	jr	nz,clear1
	addqt	#4,r2
 ENDIF
	moveq	#screen>>16,screen_ptr
	movei	#screen2-screen,screen2_ptr
	shlq	#16,screen_ptr

	moveq	#160/16,r12
	shlq	#4,r12
	move	r12,r11
	subq	#7,r12
	move	pc,LOOP
loop:
	;; random
	move	rnd,r4
	rorq	#7,r4
	xor	rnd,r4
	move	r4,rnd
	shlq	#9,r4
	xor	r4,rnd
	shrq	#5,r4
	xor	r4,rnd

	;;
	move	rnd,r0
	moveq	#3,r9
	and	r9,r0
	jump	eq,(LOOP)
	subq	#1,r0
	moveq	#0,r1
	jr	eq,ok

	subq	#1,r0
	moveq	#15,r9
	jr	eq,ok
	move	r12,r1

	moveq	#31,r9
	movei	#(109<<16)|79,r1

ok:	shrq	#1,r10		; y|x >>= 1
	bclr	#15,r10		; clear remainder Y/2
	add	r1,r10
	move	r10,r3
	shrq	#14,r3		;r3 = y*4
	mult	r11,r3		;r3 = y*640
	move	r10,r2
	bclr	#0,r2
	shlq	#16,r2
	shrq	#15,r2
	add	r2,r3
	bset	#15-7,r9	; set color base
	btst	#0,r10
	load	(screen_ptr+r3),r30
	jr	ne,odd
	shlq	#7,r9
	shlq	#16,r9
odd:
	or	r30,r9
	store	r9,(screen_ptr+r3)
	add	screen2_ptr,r3
	jump	(LOOP)
	store	r9,(screen_ptr+r3)

end:
size	equ end-start
free	equ WANTED_SIZE-size

	echo "Size:%dsize  Free:%dfree"
   IF ((BLOCKS*64)-size) > 0
	REPT (BLOCKS*64)-size
	dc.b $42
	ENDR
   ELSE
     if (BLOCKS*64)-size != 0
	REPT ((BLOCKS+1)*64)-size
	dc.b $42
	ENDR
     ENDIF
   ENDIF
 END
