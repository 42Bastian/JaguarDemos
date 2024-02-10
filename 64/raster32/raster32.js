;; -*-asm-*-
;;;  raster32
;;; ----------------------------------------
;;; Author: 42Bastian
;;; Release: LoveByte 2024
;;; Size: 28 Bytes
;;; ----------------------------------------

	gpu

WANTED_SIZE	SET 32

OBL		EQU $37000

		regtop 31

bg_col		reg 15

	RUN $00F035AC		; Start address after decryption. Fix!!!
start:
	movei	#$f1a114,r0	; disable DSP -> Roaar
	store	r3,(r0)
	moveq	#$f,r15
	shlq	#20,r15
	movei	#$120+OBL,r14
wvbl:
	subq	#31,r1
	load	(r15+4),r0
	shlq	#3+16,r0
	store	r4,(r14)    ; disable logo object (r4 < 0)
	add	r1,r0
	jr	wvbl
	store	r0,(r15+$58)


;;; ----------------------------------------
end:
size	set end-start

free	set WANTED_SIZE-size

	if free > 0
	REPT	free
	dc.b	$42
	ENDR

	echo "GPU Size:%dsize | Free:%dfree"
	echo "Wanted: %dWANTED_SIZE"

 END
