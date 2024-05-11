;; -*-asm-*-
;;; OutlineScroller
;;; ----------------------------------------
;;; Author: 42Bastian
;;; Release: Outline 2024
;;; Size: 256b (8b free)
;;; ----------------------------------------

	gpu

	include <js/symbols/jagregeq.js>
	include <js\symbols\blit_eq.js>
	include <js/macro/help.mac>

	UNREG SP,LR.a,SP.a

//->MINIHEX	EQU 1

 IFD MODEL_M
 echo "Model M"
 ENDIF

 IFD MINIHEX
WANTED_SIZE	SET 512
 ELSE
WANTED_SIZE	SET 256
 ENDIF

BLOCKS		SET (WANTED_SIZE/64)		; max. is 10

OBL		EQU $37000

		regtop 31


bg_col		reg 15
blitter		reg 14
mh6		reg 6
mh5		reg 5
mh4		reg 4
mh3		reg 3
mh2		reg 2
tmp1		reg 1
tmp0		reg 0

screen_ptr	reg 22
LOOPX		reg 99
LOOPY		reg 99
x		reg 99
y		reg 99
restart		reg 99
blit_count	reg 99
frame		reg 99
pattern		reg 99
pat_ptr		reg 99
color		reg 99
blit_cmd	reg 99


MACRO WAITBLITTER
.\wait@	load (blitter+$38),r0
	shrq #1,r0
	jr cc,.\wait@
//->	nop
ENDM

	RUN $00F035AC		; Start address after decryption. Fix!!!
start:
 IFD MODEL_M
	movei	#$5076,r14
 ELSE
	movei	#$5064,r14
 ENDIF
	storew	r3,(r14)	; Disable BIOS double buffering (r3 == 0)

	movei	#$37120,r0
	storeb	r4,(r0)		; disable Jaguar logo

	movei	#$f1a114,r0	; disable DSP -> Roaar
	store	r3,(r0)
;;; ----------------------------------------
;;; setup
;;; ----------------------------------------
	shlq	#10,screen_ptr

	movei	#$f02200,blitter
	store	screen_ptr,(blitter)	;_BLIT_A1_BASE
	movei   #$3720c,r1
        store   screen_ptr,(r1)
	movei	#$10000|(-12&0xffff),r0
	store	r0,(blitter+_BLIT_A1_STEP)
	movei	#BLIT_PITCH1|BLIT_PIXEL16|BLIT_WID320|BLIT_XADDPHR,r0
	store	r0,(blitter+_BLIT_A1_FLAGS)
	movei	#(12<<16)|12,blit_count
	movei	#BLIT_UPDA1|BLIT_PATDSEL,blit_cmd
	moveq	#0,frame

	move	pc,restart
superloop:
	moveq	#$f,bg_col
	shlq	#20,bg_col

wvbl:
	load	(bg_col+4),r0
	bclr	#0,r0
	shlq	#2+16,r0
	jr	ne,wvbl
	store	r0,(bg_col+$58)

wvbl2:
	bclr	#2+16,r0
	load	(bg_col+4),r0
	jr	eq,wvbl2
	shlq	#2+16,r0

	subq	#1,frame
	jr	pl,wvbl
	moveq	#5,r0

	moveq	#1,frame
	movei	#pattern_,r15
	moveq	#0,r1
	moveq	#0,r4
.shft	load	(r15),r2
	load	(r15+20),r3
	store	r2,(r1)
	shlq	#1,r3
	addc	r2,r2
	addc	r4,r3
	addq	#4,r1
	store	r2,(r15)
	subq	#1,r0
	store	r3,(r15+20)
	jr	ne,.shft
	addqt	#4,r15

	moveq	#0,x
	moveq	#5,y
	move	pc,LOOPX
.loopx
	moveq	#0,pat_ptr
	move	pc,LOOPY
.loopy
	load	(pat_ptr),pattern
	rorq	#31,pattern
	store	pattern,(pat_ptr)
	addqt	#4,pat_ptr
	subc	color,color
	movei	#$e020e020,r0
	xor	r0,color
	WAITBLITTER

	move	y,r0
	store	color,(blitter+_BLIT_PATD)
	addq	#4,r0
	store	color,(blitter+_BLIT_PATD+4)
	shlq	#4+16,r0
	or	x,r0
	addq	#32,r0
	store	r0,(blitter+_BLIT_A1_PIXEL)
	subq	#1,y
	store	blit_count,(blitter+_BLIT_COUNT)
	jump	ne,(LOOPY)
	store	blit_cmd,(blitter+_BLIT_CMD)

	addq	#16,x
	btst	#8,x
	jump	eq,(LOOPX)
	moveq	#5,y

	jump	(restart)
	nop

	align	4
pattern_:
	;;    0123456789ABCDEF0123456789ABCDEF
	dc.l %00000011000111001001110111010010
	dc.l %00000100101001001001000010010010
	dc.l %01000100101001001001000010010110
	dc.l %00000100101001001001000010011010
	dc.l %00000011001001011101000111010010

	dc.l %11100001111001100111100010000000
	dc.l %10000000100010010010000010000000
	dc.l %11000000010010110001001111000101
	dc.l %10000001001011010100101010000000
	dc.l %11100000110001100011001000000000




 IFD MINIHEX
	include <js/inc/minihex.inc>
 ENDIF
;;; ----------------------------------------
end:
size	set end-start

free	set WANTED_SIZE-size
free 	set free

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

	echo "GPU Size:%dsize | Free:%dfree "
	echo "%dWANTED_SIZE"
 END
