;; -*-asm-*-
;;; JaGol256
;;; ----------------------------------------
;;; Game of Live : 19200 cells
;;; Author: 42Bastian
;;; Release: Outline 2023
;;; ----------------------------------------
;;; Model M:  0 bytes free (with zoom)
;;; Model K: 12 bytes free
;;; ----------------------------------------

max_y	equ 120

	gpu

 IFD MODEL_M
 echo "Model M"
 ENDIF

WANTED_SIZE	SET 256

BLOCKS		SET (WANTED_SIZE/64)		; max. is 10

OBL		EQU $37020

jagscrn		EQU $15d000

scale		reg 31
main		reg 30
rnd		reg 29
obl		reg 28
screen_ptr	reg 27
x		reg 26
y		reg 25
table		reg 24
my		reg 23
py		reg 22
LOOPX		reg 21
LOOPY		reg 20
table1		reg 19
generation	reg 18
restart		reg 17
base_color	reg 16
table0		reg 15
current_scr	reg 14

tmp1		reg 1
tmp0		reg 0

	RUN $00F035AC		; Start address after decryption. Fix!!!
start:
 IFD MODEL_M
	movei	#$4e722000,r0	; stop #$2000
	movei	#$5098-4,r14
	store	r0,(r14+4)
	subq	#34-4,r14	; 5076 : Disable BIOS double buffering
	storew	r3,(r14)
 ELSE
	movei	#$20004e71,r0
	movei	#$509c,r14
	storew	r0,(r14)
	subq	#4,r14
	store	r0,(r14)
	addq	#1,r0		; nop => stop
	subq	#2,r14
	storew	r0,(r14)
	subq	#32,r14
	storew	r3,(r14)	; 5076 : Disable BIOS double buffering
 ENDIF

 IFD MODEL_M
	movei	#$3714a,scale
	storeb	r3,(scale)
 ENDIF
	movei	#$f1a114,r0	; disable DSP -> Roaar
	store	r3,(r0)
;;; setup
	moveq	#2,table
	moveq	#16,screen_ptr
	moveq	#20,py
	shlq	#16,screen_ptr
	shlq	#5,py		; py = 320*2
	move	py,my
	neg	my

	movei	#OBL,obl
	movei	#$3720c,current_scr

	move	pc,restart
superloop:
	bset	#7,generation

;;; Init "world" and clear Jaguar logo
	movei	#jagscrn,r5

	movei	#160*max_y*4,r0
	moveq	#2,r15
	shlq	#16,r15		; world
.l1
	;; random
	move	rnd,r4
	rorq	#7,r4
	xor	rnd,r4
	move	r4,rnd
	shlq	#9,r4
	xor	rnd,r4
	move	r4,rnd
;;->	rorq	#3,r4
;;->	xor	r4,rnd

	move	rnd,r2
	shrq	#31,r2
	store	r2,(r15+r0)
	shrq	#1,r2
	subq	#4,r0
	storeb	r2,(r5)		; clear logo
	jr	ne,.l1
	addqt	#1,r5

	move	rnd,base_color
	shlq	#8,base_color	; CRY color
	subq	#1,base_color	; full brightness

;;; main loop
	move	pc,main
mainloop:
 IFD MODEL_M
	moveq	#31,r1
	loadb	(scale),r2
	addq	#1,r1
	cmp	r1,r2
	jr	pl,no_scale
	addq	#1,r2
	storeb	r2,(scale)
no_scale
 ENDIF
	bset	#19,r0
	store	screen_ptr,(current_scr)

wvbl:	load	(obl),r1
	shrq	#8,r1
	cmp	screen_ptr,r1
	jr	ne,wvbl
	moveq	#max_y/4,y
	xor	r0,screen_ptr
	move	py,x
	shlq	#2,y

	move	table,table0
	move	screen_ptr,r10
	shlq	#16,table0

	moveq	#4,table1
	xor	table,table1
	move	table1,table
	shlq	#16,table1

	move	pc,LOOPY
//->	addq	#4,LOOPY
.loopy
	load	(table0),r3		; x,y
	load	(table0+py),r4		; x,y+1
	load	(table0+my),r5		; x,y-1
	subq	#4,table0
	load	(table0),r0		; x-1,y
	load	(table0+py),r1		; x-1,y+1
	load	(table0+my),r2		; x-1,y-1
	addq	#8,table0
	load	(table0+py),r6		; x+1,y+1
	load	(table0),r7		; x+1,y
	load	(table0+my),r8		; x+1,y-1

	add	r1,r0
	add	r2,r0
	add	r4,r0
	add	r5,r0
	add	r6,r0
	add	r7,r0
	add	r8,r0
	or	r3,r0

	move	r0,r3
	cmpq	#3,r0
	moveq	#1,r1
	jr	eq,.alive
	move	base_color,r0
	shrq	#8,r0		; remove brightness
	moveq	#0,r1		; cell is dead
	shlq	#3,r0
	or	r3,r0		; number of neighbours => brightness
	shlq	#5,r0
.alive
	store	r1,(table1)
	addq	#4,table1
	subq	#4,x
	storew	r0,(r10)
	jump	ne,(LOOPY)
	addq	#4,r10		; skip pixel

	subq	#1,y
	move	py,x
	jump	ne,(LOOPY)
	add	py,r10		; skip one line

;; ----------------------------------------
	subq	#1,generation
	jump	ne,(main)
	moveq	#0,r0

	jump	(restart)
	nop
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
