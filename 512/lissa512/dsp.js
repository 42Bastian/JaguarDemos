;-*-asm-*-
	dsp

	run $f1b010

	addq	#1,r10

// t*(2-(1&-t>>11))*(5+(3&t>>14))>>(3&t>>8)|t>>2
// by: SthephanShi

	move	r10,r0
	neg	r0
	shrq	#11,r0
	moveq	#1,r1
	and	r1,r0
	neg	r0
	addq	#2,r0
	mult	r10,r0

	move	r10,r1
	shrq	#14,r1
	moveq	#3,r2
	and	r2,r1
	addq	#5,r1
	mult	r1,r0

	move	r10,r1
	shrq	#8,r1
	moveq	#3,r2
	and	r2,r1
	sha	r2,r0
	shlq	#3,r0		; fix for Jaguar

	move	r10,r1
	shrq	#2,r1
	or	r1,r0
	;;
	shlq	#24,r0
	shrq	#18,r0

	movei	#$f1a148,r15
	store	r0,(r15)
	store	r0,(r15+4)

//->	shrq	#8,r0
//->	movei	#$f03000,r15
//->	load	(r15),r1
//->	storeb	r0,(r1)
//->	addq	#1,r1
//->	shlq	#24,r1
//->	shrq	#24,r1
//->	store	r1,(r15)

	load	(r29),r28
init0
	bset	#9+1,r28
	movefa	r31,r31
	bclr	#3,r28
	store	r28,(r29)
	align	4
wait:	jr	wait
	addqt	#1,r16
init:
	movei	#$f1a100,r29
	moveta	r29,r29
	load	(r29),r28
	move	pc,r31
	moveta	r31,r31
	jr	init0
	bset	#5,r28
	align	4
