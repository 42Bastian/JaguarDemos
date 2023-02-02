;;; -*-asm-*-
;;; Mona port to 100% GPU
;;;

	gpu

BLOCKS	EQU (256/64) 			; max. is 10

	;; BootROM sets up two screen buffers
screen	equ $100000
screen2	equ $125800

	RUN $00F035AC
start:
	;; disable 2nd screen (needs 8 bytes!)
;;-> IFD MODEL_M
;;->	movei	#$5079,r0
;;-> ELSE
;;->	movei	#$5071,r0
;;-> ENDIF
;;->	storeb	r1,(r0)
;;->xxxx
;;->	jr	xxxx
;;->	nop
bc		reg 9	;set 0 by ROM
screen_ptr	reg 28
seed		reg 26
y		reg 25
LOOP0		reg 24
x		reg 23
mask		reg 22		; set FF by ROM
rndcnt		reg 21
LOOP1		reg 20
color		reg 19
BRUSH		reg 14		; points to last long written
eormask		reg 10
increment	reg 8
seedmask	reg 6		; $ffffffff by rom

	shlq	#16,seedmask	; => $ffff0000

	moveq	#$130000>>16,screen_ptr
	shlq	#16,screen_ptr
	movei	#$7ec80000,seed
	movei	#$4c11db7,eormask
	shlq	#5,bc
	shrq	#1,mask

	move	pc,LOOP0
loop0:
	movei	#$f8a5b9ff,color
	btst	#1+4,bc
	load	(BRUSH),x
	jr	eq,.1
	and	seedmask,seed

	subq	#4,BRUSH
	shlq	#16,x
	movei	#$d8e90001,color

.1	btst	#2+4,bc
	jr	eq,.3
	shrq	#16,x
	rorq	#16,color
.3
	or	x,seed

	move	bc,rndcnt

	movei	#$3702a,r0	; address of BM object flags
	subq	#32,bc
.done
	jr	eq,.done
	storew	r17,(r0)	;disable TRANS (r17 = $15)
	move	x,y
	shrq	#8,y

	move	pc,LOOP1
loop1:
	add	seed,seed
	jr	cc,.2
	moveq	#20,r0
	xor	eormask,seed

	btst	#7,seed
	moveq	#1,increment
	jr	eq,.2
	move	seed,r5
	subq	#2,increment
.2
	btst	#1,r5
	jr	eq,._y
	add	increment,y
	add	increment,x
	sub	increment,y
._y
	and	mask,x
	and	mask,y
	shlq	#4,r0
	mult	y,r0
	add	x,r0
	shlq	#1,r0

	add	screen_ptr,r0
	subq	#1,rndcnt
	jump	ne,(LOOP1)
	storew	color,(r0)

	jump	(LOOP0)
end1:

	;; place brush at end!
s1 equ (BLOCKS*64)-(end1-start+128)
	if s1 > 0
	echo "%ds1"
	ds.b	s1
	endif

	;; reverse order !
brush:
	dc.w $2BB9, $2139, $9E37, $2C44, $96CE, $25A7, $AF9D, $312E
	dc.w $238F, $C07B, $1E14, $B23D, $3EAF, $AD63, $5240, $8D3C
	dc.w $AC72, $80C7, $1877, $B8E2, $3EBB, $E916, $0413, $0A09
	dc.w $B0F1, $532C, $8A96, $2914, $B242, $B114, $D431, $542B
	dc.w $D57A, $3051, $7DFC, $0D7D, $29AD, $A32C, $8AF7, $0859
	dc.w $90A3, $A347, $DF19, $97F5, $3D11, $26D6, $2093, $209C
	dc.w $D0B1, $9CD2, $70B5, $0280, $B83E, $B05A, $0EBD, $9378
	dc.w $8A91, $1B0B, $0E3C, $F59B, $2F9B, $072B, $030A, $37BE
	;; The End
	echo "%Hbrush"
end:
size	equ end-start
free	equ (BLOCKS*64)-size

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
