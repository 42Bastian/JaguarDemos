;;; -*-asm-*-
; a0: music data (any mem)
; a1: sound bank data (chip mem)

a0	.equr r10
a1	.equr r11
a2	.equr r12
_a0	.equr r13
__a0	.equr r16

LOOP	.equr r20
dummy	.equr r21

	movei	#$20-8,r14
	moveq	#0,r1
	store	r0,(r14+2)
	store	r0,(r14+3)
	store	r0,(r14+4)

	load	(r14),a0
	load	(r14+1),a1
	addq	#4,a0
	addq	#4,a0		;skip ID
	addq	#2,a0		;skip version
	movei	#LSPVars,r14

	loadw	(a0),r6
	addq	#2,a0
	store	r6,(r14+(m_currentBpm-LSPVars)/4)		; default BPM
	movei	#LSP_BPM_frequence_replay,r0
	store	r6,(r0)

	loadw	(a0),r6
	addq	#2,a0
	store	r6,(r14+(m_escCodeRewind-LSPVars)/4)

	loadw	(a0),r6
	addq	#2,a0
	store	r6,(r14+(m_escCodeSetBpm-LSPVars)/4)
//->load	(a0),r20; nb de ticks du module en tout = temps de replay ( /BPM)
	addq	#4,a0

	loadw	(a0),r0		; instrument count
	addq	#2,a0

	move	a0,a2
	subq	#12,a2	; LSP data has -12 offset on instrument tab ( to win 2 cycles in fast player :) )

	store	a2,(r14+(m_lspInstruments-LSPVars)/4); instrument tab addr ( minus 4 )

	move	a0,__a0
	addq	#2,__a0

	move	pc,LOOP
	addq	#4,LOOP
.relocLoop:
	loadw	(a0),r5		; pointeur sample
	loadw	(__a0),r21
	shlq	#16,r5
	or	r21,r5
	add	a1,r5		; passage de relatif en absolu

	move	r5,r21
	storew	r21,(__a0)	; pointeur sample
	shrq	#16,r21
	storew	r21,(a0)

	move	a0,_a0
	addq	#4,_a0
	loadw	(_a0),r6		; taille en words
	shlq	#1,r6
	storew	r6,(_a0)		; taille en bytes

	move	a0,_a0
	addq	#6,_a0

	load	(_a0),r6		; pointeur sample repeat
	add	a1,r6			; passage de relatif en absolu
	cmp	r5,r6	; corrige pointeur de repeat avant le debut
	jr	pl,.ok_loop
	nop
	move	r5,r6
.ok_loop:
	store	r6,(_a0)		; pointeur sample repeat

	move	a0,_a0
	addq	#10,_a0
	loadw	(_a0),r6		; taille repeat en words
	shlq	#1,r6
	storew	r6,(_a0)		; taille repeat en bytes

.relocated:
	subq	#1,r0
	addqt	#12,__a0
	jump	ne,(LOOP)
	addqt	#12,a0

	loadw	(a0),r0		; codes count (+2)
	addq	#2,a0

	store	a0,(r14+(m_codeTableAddr-LSPVars)/4) 	; code table
	shlq	#1,r0
	add	r0,a0
	move	a0,__a0
	addq	#2,__a0

	loadw	(a0),r0		; word stream size
	loadw	(__a0),r21
	shlq	#16,r0
	or	r21,r0
	addq	#4,a0
	addq	#4,__a0

	loadw	(a0),r1		; byte stream loop point
	loadw	(__a0),r21
	shlq	#16,r1
	or	r21,r1
	addq	#4,a0
	addq	#4,__a0

	loadw	(a0),r2		; word stream loop point
	loadw	(__a0),r21
	shlq	#16,r2
	or	r21,r2
	addq	#4,a0

	store	a0,(r14+(m_wordStream-LSPVars)/4)
	move	a0,a1
	add	r0,a1		; byte stream
	store	a1,(r14)	;+m_byteStream-LSPVars)
	add	r2,a0
	add	r1,a1
	store	a0,(r14+(m_wordStreamLoop-LSPVars)/4)
	store	a1,(r14+(m_byteStreamLoop-LSPVars)/4)
