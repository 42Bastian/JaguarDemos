;; -*-asm-*-
;;;  Plasmosis
;;; ----------------------------------------
;;; Author: 42Bastian
;;; Release: post-LoveByte 2024
;;; Size: 128 Bytes
;;; ----------------------------------------

	gpu

WANTED_SIZE	SET 128

OBL		EQU $37000

screen_ptr	reg 22
bg_col		reg 15
_r4		reg 4
tmp1		reg 1
tmp0		reg 0

LOOP		reg 99
rnd		reg 99
current_scr	reg 99
restart		reg 99
obl		reg 99
MAIN		reg 99

	RUN $00F035AC		; Start address after decryption. Fix!!!
start:
 IFD MODEL_M
	movei	#$5076,r14
 ELSE
	movei	#$5064,r14
 ENDIF
	storew	r3,(r14)	; Disable BIOS double buffering (r3 == 0)
 IFD MODEL_M
	addq	#$20-2,r14 	; $5094
	movei	#$4e722000,r0	; stop #$2000
	store	r0,(r14+$4)
 ENDIF
	movei	#$f1a114,r0	; disable DSP -> Roaar
	store	r3,(r0)
	moveq	#$120/16,r15
	shlq	#4,r15
	movei	#OBL,obl
	store	r4,(r15+obl)    ; disable logo object (r4 < 0)

	shlq	#10,screen_ptr
	movei   #$3720c,current_scr
        store   screen_ptr,(current_scr)
 IF 1
	;; random
.fill
	move	rnd,r20
	rorq	#7,r20
	xor	rnd,r20
	move	r20,rnd
	shlq	#9,r20
	xor	r20,rnd

	move	rnd,r0
	shlq	#15,r0
	shrq	#13,r0
	add	screen_ptr,r0
	subq	#2,obl
	jr	pl,.fill
	storew	rnd,(r0)

 ENDIF

_640	reg 99
ptr	reg 99
off	reg 99

	moveq	#10,_640
	shlq	#6,_640
_pc	move	PC,LOOP
	addq	#.loop-_pc,LOOP
	move	pc,MAIN
	addq	#4,MAIN
main:
	move	screen_ptr,ptr
	movei	#320*239/2,r0
.loop
	subq	#7,r1
	shrq	#1,r1
	move	r1,r2
	shlq	#16,r2
	or	r1,r2
	store	r2,(ptr)
	moveq	#1,off
	addqt	#4,ptr
	and	r1,off
	mult	_640,off
	add	ptr,off
	subq	#1,r0
	loadw	(off),r2
	jump	ne,(LOOP)
	add	r2,r1

	jump	(MAIN)
//->	nop

;;; ----------------------------------------
end:
size	set end-start

free	set WANTED_SIZE-size

	if free > 0
	REPT	free
	dc.b	$42
	ENDR
	endif

	echo "GPU Size:%dsize | Free:%dfree"
	echo "Wanted: %dWANTED_SIZE"

 END
