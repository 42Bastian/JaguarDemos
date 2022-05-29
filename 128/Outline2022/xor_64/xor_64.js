	;; -*-asm-*-
	gpu

RECORDING_DELAY EQU 1	// only needed to let the TV sync before start recording

WANTED_SIZE	EQU 64
BLOCKS		EQU (WANTED_SIZE/64)		; max. is 10

	;; Resolution is 320x239x16
screen	EQU $100000
screen2	EQU $125800

	include <js/symbols/jagregeq.js>

	;; ROM sets this mode
ScreenMode	EQU CRY16|VIDEN|PWIDTH4|BGEN|CSYNC

	RUN $00F035AC
start:
	movei	#$0001f000,r5
	;; recording delay
wait:	subq	#4,r0
	jr	ne,wait

	move	pc,r31

	moveq	#screen>>16,r14
	movei	#screen2-screen-4,r1
	shlq	#16,r14
	moveq	#240/16,r2
	shlq	#4,r2

	move	pc,r28		; r28 = lx
loop:
	move	r6,r7
	add	r2,r7
	xor	r27,r7
	btst	#0,r2
	jr	eq,odd
	or	r5,r7
	rorq	#16,r7
odd:
	store	r7,(r14)
	subq	#2,r27
	addqt	#4,r14
	jump	nz,(r28)
	store	r7,(r14+r1)

	subq	#1,r2
	moveq	#320/16,r27
	jump	ne,(r28)
	shlq	#4,r27

	jump	(r31)
	addq	#2,r6

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
