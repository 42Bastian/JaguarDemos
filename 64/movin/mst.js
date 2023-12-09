;; -*-asm-*-
;;;  Movin' saw tooth
;;; ----------------------------------------
;;; Author: 42Bastian
;;; Release: Sillyventure WE 2023
;;; ----------------------------------------
;;; Size: 64 Bytes
;;; ----------------------------------------

	gpu

	include <js/symbols/jagregeq.js>
	include <js/macro/help.mac>

	UNREG LR,SP,LR.a,SP.a

 IFD MODEL_M
 echo "Model M"
 ENDIF

WANTED_SIZE	SET 64

BLOCKS		SET (WANTED_SIZE/64)		; max. is 10

OBL		EQU $37000

		regtop 31

screen_ptr	reg 22		; fix! (ROM data)

current_scr	reg 99
restart		reg 99
frame		reg 99

	RUN $00F035AC		; Start address after decryption. Fix!!!
start:
	shlq	#12,screen_ptr	; is $ff after decoding
 IFD MODEL_M
	movei	#$5076,r0
 ELSE
	movei	#$5064,r0
 ENDIF
	storew	r3,(r0)		; Disable BIOS double buffering (r3 == 0)
	movei	#$3720c,current_scr
	store	screen_ptr,(current_scr)

	moveq	#31,r5
	bset	#7,r5
	move	pc,restart
superloop:
	move	screen_ptr,r0
	moveq	#30,r1
	shlq	#4,r1
.loop
	move	r1,r13
	move	r3,r4
	add	frame,r13
	and	r5,r4
	and	r5,r13
	add	frame,r4
	add	r13,r4

	subq	#2,r3
	storew	r4,(r0)
	jr	pl,.loop
	addq	#2,r0

	subq	#2,r1
	moveq	#20,r3
	jr	ne,.loop
	shlq	#4+1,r3

	jump	(restart)
	addq	#3,frame
;;; ----------------------------------------
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
