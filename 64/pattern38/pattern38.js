;; -*-asm-*-
	gpu
//LOVEBYTE23	EQU 1 // uncomment for Compo version

WANTED_SIZE	EQU 64
BLOCKS		EQU (WANTED_SIZE/64)		; max. is 10

	;; Resolution is 320x239x16
screen	EQU $100000

	RUN $00F035AC
start:
	movei	#$5079,r3
	storeb	r1,(r3)
 IFD LOVEBYTE23
	moveq	#10,r3
	shlq	#6,r3
 ELSE
	shrq	#5,r3		; r3 = 643
 ENDIF
again:
	moveq	#screen>>16,r14
	shlq	#16,r14
loop:
	move	r14,r7
	div	r3,r7
	move	r7,r5
	add	r6,r7
	mult	r14,r7
	shrq	#11,r5
	storew	r7,(r14)
	jr	z,loop
	addqt	#2,r14

	jr	again
	subq	#4,r6

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
