	;; -*-asm-*-
	gpu

WANTED_SIZE	SET 32
BLOCKS		SET (WANTED_SIZE/64)		; max. is 10


	RUN $00F035AC
start:
	movei	#$70600003,r0
	movei	#$f00020,r14
wait	subq	#8,r21
	jr	pl,wait
retry:
	store	r0,(r14)
	bset	#11,r14
again:
	addq	#9,r21
	addq	#4,r10
	store	r21,(r14+r10)
	shlq	#24-2,r10
	jr	again
	shrq	#24-2,r10

	;; GPU RAM cleared by ROM,
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
