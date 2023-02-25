;-*-asm-*-

	.include "68k_inc/jaguar.inc"

DSP_STACK_SIZE	equ	32	; long words
DSP_USP			equ		(D_ENDRAM-(4*DSP_STACK_SIZE))
DSP_ISP			equ		(DSP_USP-(4*DSP_STACK_SIZE))

LSP_DSP_Audio_frequence .equ 32000
nb_bits_virgule_offset  .equ   11  ; 11 ok DRAM/ 8 avec samples en ram DSP
DSP_DEBUG               .equ    0
I2S_during_Timer1       .equ    0  ; 0= I2S waits while timer 1 / 1=IMASK cleared while Timer 1
LSP_avancer_module      .equ    1  ; 1=incremente position dans le module

channel_1        .equ        1
channel_2        .equ        1
channel_3        .equ        1
channel_4        .equ        1

silence	EQU $20

	.dsp
	.org	D_RAM
DSP_base_memoire:
	movei	#LSP_load,r0
	jump	(r0)
	nop
	.align 16
; I2S interrupt
	movei	#DSP_LSP_routine_interruption_I2S,r17
	movei	#D_FLAGS,r30
	jump	(r17)
	load	(r30),r29	; read flags
; Timer 1 interrupt
	movei	#DSP_LSP_routine_interruption_Timer1,r12 ; 6 octets
	movei	#D_FLAGS,r11				; 6 octets
	jump	(r12)					; 2 octets
	load	(r11),r13	; read flags
; Timer 2 interrupt
	movei	#DSP_LSP_routine_interruption_Timer2,r12
	movei	#D_FLAGS,r11
	jump	(r12)
	load	(r11),r13	; read flags

	.long
LSPVars:
m_byteStream:		dc.l	0	;  0 :  byte stream			0
m_wordStream:		dc.l	0	;  4 :  word stream			1
m_codeTableAddr:	dc.l	0	;  8 :  code table addr		2
m_escCodeRewind:	dc.l	0	; 12 :  rewind special escape code	3
m_escCodeSetBpm:	dc.l	0	; 16 :  set BPM escape code			4
m_lspInstruments:	dc.l	0	; 20 :  LSP instruments table addr	5
m_relocDone:		dc.l	0	; 24 :  reloc done flag		6
m_currentBpm:		dc.l	0	; 28 :  current BPM			7
m_byteStreamLoop:	dc.l	0	; 32 :  byte stream loop point		8
m_wordStreamLoop:	dc.l	0	; 36 :  word stream loop point		9

;;->; External 0 interrupt
;;->	.rept	8
;;->		nop
;;->	.endr
;;->; External 1 interrupt
;;->	.rept	8
;;->		nop
;;->	.endr

; ----------------------------------
; DSP : routines en interruption I2S
; ----------------------------------
; registres permanents : R31/R30/R29
; utilisés : 	R29/R30/R31
; 		R22/R23/R24/R25/R26/R27/R28
;		R17/R16
; resultats samples = R18/R19/R20/R21
;


; R16 = 4 octets en cours channel 3 / LSP_DSP_PAULA_AUD3DAT
; R24 = 4 octets en cours channel 2 / LSP_DSP_PAULA_AUD2DAT
; R25 = 4 octets en cours channel 1 / LSP_DSP_PAULA_AUD1DAT
; R28 = 4 octets en cours channel 0 / LSP_DSP_PAULA_AUD0DAT


; I2S : replay sample
;	- version simple, lit un octet à chaque fois
;	- puis version plus compleque : lit 1 long, et utilise ses octets
DSP_LSP_routine_interruption_I2S:

	store		R18,(R26)	; write left channel
	store		R19,(R27)	; write right channel

	.if		DSP_DEBUG
; change la couleur du fond
	movei	#$777,R26
	movei	#BG,r27
	storew	r26,(r27)
	.endif

; version complexe avec stockage de 4 octets
; et tout en registres / alternatifs

; ----------
; channel 3
;	movei		#LSP_DSP_PAULA_internal_location3,R1
;	movei		#LSP_DSP_PAULA_internal_increment3,R2
;	movei		#LSP_DSP_PAULA_internal_length3,R3
;	movei		#LSP_DSP_PAULA_AUD3LEN,R4
;	movei		#LSP_DSP_PAULA_AUD3L,R5
		;movei		#LSP_DSP_PAULA_internal_location3,R28		; adresse sample actuelle, a virgule
		;movefa		R1,R28
		;movei		#LSP_DSP_PAULA_internal_increment3,R27
		;load		(R28),R26				; R26=current pointeur sample 16:16
		movefa		R1,R26					; alt R1 = direct sample adress
		movefa		R2,R27					; alt R2 = direct increment value

		;load		(R27),R27				; R27=increment 16:16
		move		R26,R17					; R17 = pointeur sample a virgule avant increment
		;movei		#LSP_DSP_PAULA_internal_length3,R25		; =FIN
		movefa		R3,R23					; alt R3 = (LSP_DSP_PAULA_internal_length3)
		add	R27,R26					; R26=adresse+increment , a virgule
		;load		(R25),R23
		movefa		R0,R22					; alt R0 = mask $FFFFFFFC = 11111111 11111111 11111111 11111100
		cmp	R23,R26
		jr	mi,DSP_LSP_routine_interruption_I2S_pas_fin_de_sample_channel3
		;nop
		shrq		#nb_bits_virgule_offset,R17				; ancien pointeur adresse sample partie entiere

; fin de sample => on recharge les infos des registres externes
		shlq		#32-nb_bits_virgule_offset,R26
		;movei		#LSP_DSP_PAULA_AUD3LEN,R27	; fin, a virgule
		movefa		R4,R27				; alt R4 = direct (LSP_DSP_PAULA_AUD3LEN)
		shrq		#32-nb_bits_virgule_offset,R26		; on ne garde que la virgule
		;movei		#LSP_DSP_PAULA_AUD3L,R24	; sample location a virgule
		; movefa		R5,R24
		movefa		R5,R23				; alt R5 = direct (LSP_DSP_PAULA_AUD3L)
		;load		(R27),R27
		;load		(R24),R23
		;store		R27,(R25)			; update internal sample end, a virgule
		moveta		R27,R3				; update alt R3 = (LSP_DSP_PAULA_internal_length3)
		or	R23,R26				; on garde la virgule en cours

DSP_LSP_routine_interruption_I2S_pas_fin_de_sample_channel3:
		moveta		R26,R1				; store internal sample pointeur, a virgule dans alt R1
		;store		R26,(R28)			; stocke internal sample pointeur, a virgule

; read sample datas
		shrq		#nb_bits_virgule_offset,R26				; nouveau pointeur adresse sample partie entiere
						;shrq		#nb_bits_virgule_offset,R17				; ancien pointeur adresse sample partie entiere
		move		R26,R27				; R27 = nouveau pointeur sample
		and	R22,R17				; ancien pointeur sample modulo 4
		and	R22,R26				; nouveau pointeur sample modulo 4
		;movei		#LSP_DSP_PAULA_AUD3DAT,R28	; 4 octets actuels
		;subq		#4,R28				; de LSP_DSP_PAULA_internal_location3 => LSP_DSP_PAULA_AUD3DAT
		not	R22			; => %11
		;load		(R28),R16			; R21 = octets actuels en stock
		and	R22,R27				; R27 = position octet à lire
		cmp	R17,R26
		jr	eq,DSP_LSP_routine_interruption_I2S_pas_nouveau_long_word3
		shlq		#3,R27				; numero d'octet à lire * 8

; il faut rafraichir R21
		load		(R26),R16			; lit 4 nouveaux octets de sample
		;store		R16,(R28)			; rafraichit le stockage des 4 octets

DSP_LSP_routine_interruption_I2S_pas_nouveau_long_word3:
		;movei		#LSP_DSP_PAULA_AUD3VOL,R23/R24
		;subq		#4,R28				; de LSP_DSP_PAULA_AUD3DAT => LSP_DSP_PAULA_AUD3VOL

		move		R16,R21				; 4 octets dispos dans registre de travail

		neg	R27			; -0 -8 -16 -24

; R27=numero d'octet à lire
; ch2
		;movei		#LSP_DSP_PAULA_internal_increment2,R27

		sh	R27,R21				; shift les 4 octets en stock vers la gauche, pour positionner l'octet à lire en haut
		movefa		R21,R23				; alt R21 = volume channel 3
		;load		(R23),R23			; R23 = volume : 6 bits
		sharq		#24,R21				; descends l'octet à lire
		movefa		R7,R27				; alt R7 = direct increment value channel 2
; ch2
		imult		R23,R21				; unsigned multiplication : unsigned sample * volume => 8bits + 6 bits = 14 bits

; R21=sample channel 3 on 14 bits

; ----------
; channel 2
;	movei		#LSP_DSP_PAULA_internal_location2,R6
;	movei		#LSP_DSP_PAULA_internal_increment2,R7
;	movei		#LSP_DSP_PAULA_internal_length2,R8
;	movei		#LSP_DSP_PAULA_AUD2LEN,R9
;	movei		#LSP_DSP_PAULA_AUD2L,R10
		;load		(R27),R27				; R27=increment 16:16
		;movei		#LSP_DSP_PAULA_internal_location2,R28		; adresse sample actuelle, a virgule
		;movefa		R6,R28
		;movei		#LSP_DSP_PAULA_internal_length2,R25		; =FIN

		;movei		#LSP_DSP_PAULA_internal_increment2,R27
		;load		(R28),R26				; R26=current pointeur sample 16:16
		movefa		R6,R26					; alt R1 = direct sample adress
		movefa		R8,R23					; alt R8 = (LSP_DSP_PAULA_internal_length2)
		move		R26,R17					; R17 = pointeur sample a virgule avant increment
		add	R27,R26					; R26=adresse+increment , a virgule
		;load		(R25),R23
		movefa		R0,R22
		cmp	R23,R26
		jr	mi,DSP_LSP_routine_interruption_I2S_pas_fin_de_sample_channel2
		shrq		#nb_bits_virgule_offset,R17				; ancien pointeur adresse sample partie entiere

; fin de sample => on recharge les infos des registres externes
		shlq		#32-nb_bits_virgule_offset,R26
		;movei		#LSP_DSP_PAULA_AUD2LEN,R27	; fin, a virgule
		movefa		R9,R27				; alt R9 = direct (LSP_DSP_PAULA_AUD2LEN)
		shrq		#32-nb_bits_virgule_offset,R26		; on ne garde que la virgule
		;movei		#LSP_DSP_PAULA_AUD2L,R24	; sample location a virgule
		;movefa		R10,R24
		movefa		R10,R23				; alt R5 = direct (LSP_DSP_PAULA_AUD2L)
		;load		(R27),R27
		;load		(R24),R23
		;store		R27,(R25)			; update internal sample end, a virgule
		moveta		R27,R8				; update alt R8 = (LSP_DSP_PAULA_internal_length2)
		or	R23,R26				; on garde la virgule en cours

DSP_LSP_routine_interruption_I2S_pas_fin_de_sample_channel2:
		moveta		R26,R6				; store internal sample pointeur, a virgule dans alt R6
		;store		R26,(R28)			; stocke internal sample pointeur, a virgule


		shrq		#nb_bits_virgule_offset,R26				; nouveau pointeur adresse sample partie entiere
		;shrq		#nb_bits_virgule_offset,R17				; ancien pointeur adresse sample partie entiere
		move		R26,R27				; R27 = nouveau pointeur sample
		and	R22,R17				; ancien pointeur sample modulo 4
		and	R22,R26				; nouveau pointeur sample modulo 4
		;movei		#LSP_DSP_PAULA_AUD2DAT,R28	; 4 octets actuels
		;subq		#4,R28				; de LSP_DSP_PAULA_internal_location2 => LSP_DSP_PAULA_AUD2DAT
		not	R22			; => %11
		;load		(R28),R20			; R20 = octets actuels en stock
		and	R22,R27				; R27 = position octet à lire
		cmp	R17,R26
		jr	eq,DSP_LSP_routine_interruption_I2S_pas_nouveau_long_word2
		;nop
		shlq		#3,R27			; numero d'octet à lire * 8

; il faut rafraichir R20
		load		(R26),R24			; lit 4 nouveaux octets de sample
		;store		R24,(R28)			; rafraichit le stockage des 4 octets

DSP_LSP_routine_interruption_I2S_pas_nouveau_long_word2:
		;movei		#LSP_DSP_PAULA_AUD2VOL,R23
		;subq		#4,R28				; de LSP_DSP_PAULA_AUD2DAT => LSP_DSP_PAULA_AUD2VOL

		move		R24,R20				; 4 octets dispos dans registre de travail

		neg	R27			; -0 -8 -16 -24
; R27=numero d'octet à lire
; ch1
		;movei		#LSP_DSP_PAULA_internal_increment1,R27

		sh	R27,R20				; shift les 4 octets en stock vers la gauche, pour positionner l'octet à lire en haut
		movefa		R22,R23				; alt R22 = volume channel 2
		;load		(R23),R23			; R23 = volume : 6 bits
		sharq		#24,R20				; descends l'octet à lire
		movefa		R12,R27				; alt R12 = direct increment value channel 1
		imult		R23,R20				; unsigned multiplication : unsigned sample * volume => 8bits + 6 bits = 14 bits

; R20=sample channel 2 on 14 bits

; ----------
; channel 1
;	movei		#LSP_DSP_PAULA_internal_location1,R11
;	movei		#LSP_DSP_PAULA_internal_increment1,R12
;	movei		#LSP_DSP_PAULA_internal_length1,R13
;	movei		#LSP_DSP_PAULA_AUD1LEN,R14
;	movei		#LSP_DSP_PAULA_AUD1L,R15
		;movei		#LSP_DSP_PAULA_internal_location1,R28		; adresse sample actuelle, a virgule
		;movefa		R11,R28
		;load		(R28),R26				; R26=current pointeur sample 16:16
		movefa		R11,R26					; alt R11 = direct sample adress

		;load		(R27),R27				; R27=increment 16:16
		movefa		R13,R23					; alt R13 = (LSP_DSP_PAULA_internal_length1)
		move		R26,R17					; R17 = pointeur sample a virgule avant increment
		;movei		#LSP_DSP_PAULA_internal_length1,R25		; =FIN
		add	R27,R26					; R26=adresse+increment , a virgule
		;load		(R25),R23
		movefa		R0,R22
		cmp	R23,R26
		jr	mi,DSP_LSP_routine_interruption_I2S_pas_fin_de_sample_channel1
		;nop
		shrq		#nb_bits_virgule_offset,R17				; ancien pointeur adresse sample partie entiere

; fin de sample => on recharge les infos des registres externes
		shlq		#32-nb_bits_virgule_offset,R26
		;movei		#LSP_DSP_PAULA_AUD1LEN,R27	; fin, a virgule
		movefa		R14,R27				; alt R14 = direct (LSP_DSP_PAULA_AUD1LEN)
		shrq		#32-nb_bits_virgule_offset,R26		; on ne garde que la virgule
		;movei		#LSP_DSP_PAULA_AUD1L,R24	; sample location a virgule
		;movefa		R15,R24
		movefa		R15,R23
		;load		(R27),R27
		;load		(R24),R23
		;store		R27,(R25)			; update internal sample end, a virgule
		moveta		R27,R13				; update alt R13 = (LSP_DSP_PAULA_internal_length1)
		or	R23,R26				; on garde la virgule en cours

DSP_LSP_routine_interruption_I2S_pas_fin_de_sample_channel1:
		moveta		R26,R11				; store internal sample pointeur, a virgule dans alt R11
		;store		R26,(R28)			; stocke internal sample pointeur, a virgule


		shrq		#nb_bits_virgule_offset,R26				; nouveau pointeur adresse sample partie entiere
		;shrq		#nb_bits_virgule_offset,R17				; ancien pointeur adresse sample partie entiere
		move		R26,R27				; R27 = nouveau pointeur sample
		and	R22,R17				; ancien pointeur sample modulo 4
		and	R22,R26				; nouveau pointeur sample modulo 4
		;movei		#LSP_DSP_PAULA_AUD1DAT,R28	; 4 octets actuels
		;subq		#4,R28				; de LSP_DSP_PAULA_internal_location1 => LSP_DSP_PAULA_AUD1DAT
		not	R22			; => %11
		;load		(R28),R19			; R19 = octets actuels en stock
		and	R22,R27				; R27 = position octet à lire
		cmp	R17,R26
		jr	eq,DSP_LSP_routine_interruption_I2S_pas_nouveau_long_word1
		;nop
		shlq		#3,R27			; numero d'octet à lire * 8

; il faut rafraichir R19
		load		(R26),R25			; lit 4 nouveaux octets de sample
		;store		R19,(R28)			; rafraichit le stockage des 4 octets

DSP_LSP_routine_interruption_I2S_pas_nouveau_long_word1:
		;movei		#LSP_DSP_PAULA_AUD1VOL,R23
		;subq		#4,R28				; de LSP_DSP_PAULA_AUD1DAT => LSP_DSP_PAULA_AUD1VOL

		move		R25,R19				; 4 octets dispos dans registre de travail

		neg	R27			; -0 -8 -16 -24


; R27=numero d'octet à lire
; ch0
		;movei		#LSP_DSP_PAULA_internal_increment0,R27

		sh	R27,R19				; shift les 4 octets en stock vers la gauche, pour positionner l'octet à lire en haut
		movefa		R23,R23				; alt R23 = volume channel 1
		; load		(R28),R23			; R23 = volume : 6 bits
		sharq		#24,R19				; descends l'octet à lire
; ch0
		;movei		#LSP_DSP_PAULA_internal_location0,R28		; adresse sample actuelle, a virgule
		movefa		R17,R27				; alt R17 = direct increment value channel 0
		imult		R23,R19				; unsigned multiplication : unsigned sample * volume => 8bits + 6 bits = 14 bits

; R19=sample channel 1 on 14 bits

; ----------
; channel 0
;	movei		#LSP_DSP_PAULA_internal_location0,R16
;	movei		#LSP_DSP_PAULA_internal_increment0,R17
;	movei		#LSP_DSP_PAULA_internal_length0,R18
;	movei		#LSP_DSP_PAULA_AUD0LEN,R19
;	movei		#LSP_DSP_PAULA_AUD0L,R20
		;movefa		R16,R28
		;load		(R28),R26				; R26=current pointeur sample 16:16
		movefa		R16,R26					; alt R16 = direct sample adress channl 0
		movefa		R18,R23					; alt R18 = (LSP_DSP_PAULA_internal_length0)
		move		R26,R17					; R17 = pointeur sample a virgule avant increment
		;movei		#LSP_DSP_PAULA_internal_length0,R25		; =FIN
		;movefa		R18,R25
		add	R27,R26					; R26=adresse+increment , a virgule
		;load		(R25),R23
		movefa		R0,R22					; -FFFFFFC
		cmp	R23,R26
		jr	mi,DSP_LSP_routine_interruption_I2S_pas_fin_de_sample_channel0
		shrq		#nb_bits_virgule_offset,R17				; ancien pointeur adresse sample partie entiere

; fin de sample => on recharge les infos des registres externes
		shlq		#32-nb_bits_virgule_offset,R26
		;movei		#LSP_DSP_PAULA_AUD0LEN,R27	; fin, a virgule
		movefa		R19,R27
		shrq		#32-nb_bits_virgule_offset,R26		; on ne garde que la virgule
		;movei		#LSP_DSP_PAULA_AUD0L,R24	; sample location a virgule
		movefa		R20,R23
		;load		(R27),R27
		;load		(R24),R23
		;store		R27,(R25)			; update internal sample end, a virgule
		moveta		R27,R18				; update alt R18 = (LSP_DSP_PAULA_internal_length0)
		or	R23,R26				; on garde la virgule en cours

DSP_LSP_routine_interruption_I2S_pas_fin_de_sample_channel0:
		; store		R26,(R28)		; stocke internal sample pointeur, a virgule
		moveta		R26,R16	; store internal sample pointeur, a virgule dans alt R16


		shrq		#nb_bits_virgule_offset,R26				; nouveau pointeur adresse sample partie entiere
		move		R26,R27				; R27 = nouveau pointeur sample
		and	R22,R17				; ancien pointeur sample modulo 4
		and	R22,R26				; nouveau pointeur sample modulo 4
		;movei		#LSP_DSP_PAULA_AUD0DAT,R28	; 4 octets actuels
		;subq		#4,R28				; de LSP_DSP_PAULA_internal_location0 => LSP_DSP_PAULA_AUD0DAT
		not	R22			; => %11
		;load		(R28),R18			; R18 = octets actuels en stock
		and	R22,R27				; R27 = position octet à lire
		cmp	R17,R26
		jr	eq,DSP_LSP_routine_interruption_I2S_pas_nouveau_long_word0
		shlq		#3,R27			; numero d'octet à lire * 8

; il faut rafraichir R18
		load		(R26),R28			; lit 4 nouveaux octets de sample
		;store		R18,(R28)			; rafraichit le stockage des 4 octets

DSP_LSP_routine_interruption_I2S_pas_nouveau_long_word0:
		;movei		#LSP_DSP_PAULA_AUD0VOL,R23
		;subq		#4,R28				; de LSP_DSP_PAULA_AUD0DAT => LSP_DSP_PAULA_AUD0VOL

		move		R28,R18				; 4 octets dispos dans registre de travail

		neg	R27			; -0 -8 -16 -24
; R27=numero d'octet à lire


; suite
		.if	channel_2=0
	moveq	#0,R19
		.endif
		.if	channel_3=0
	moveq	#0,R20
		.endif
		add	R20,R19		; R19 = right 15 bits unsigned
;--

		sh	R27,R18				; shift les 4 octets en stock vers la gauche, pour positionner l'octet à lire en haut
		movefa		R24,R23				; alt R24 = volume channel 0
		;load		(R28),R23			; R23 = volume : 6 bits
		sharq		#24,R18				; descends l'octet à lire

; suite
		;movei		#$8000,R26
		movei		#L_I2S,R27

		imult		R23,R18				; unsigned multiplication : unsigned sample * volume => 8bits + 6 bits = 14 bits

; R18=sample channel 0 on 14 bits




; Stéreo Amiga:
; les canaux 0 et 3 formant la voie stéréo gauche et 1 et 2 la voie stéréo droite
; R18=channel 0
; R19=channel 1
; R20=channel 2
; R21=channel 3
		.if	channel_1=0
	moveq	#0,R18
		.endif
		.if	channel_4=0
	moveq	#0,R21
		.endif

		;movei		#$8000,R26
		movei		#L_I2S+4,R26
		add	R21,R18		; R18 = left 15 bits unsigned
		;add	R20,R19		; R19 = right 15 bits unsigned
		shlq		#1,R19
		shlq		#1,R18		; 16 bits unsigned

		;sub	R26,R18		; 16 bits signed
		;sub	R26,R19

; moved to top of I2S
		;store		R19,(R27)	; write right channel
		;store		R18,(R26)	; write left channel





	.if		DSP_DEBUG
; change la couleur du fond
	movei	#$000,R26
	movei	#BG,r27
	storew	r26,(r27)
	.endif


;------------------------------------
; return from interrupt I2S
	load	(r31),r17	; return address
	bset	#10,r29		; clear latch 1 = I2S
	addqt	#2,r17		; next instruction
	bclr	#3,r29		; clear IMASK
	addq	#4,r31		; pop from stack
	jump	t,(r17)		; return
	store	r29,(r30)	; restore flags

;--------------------------------------------
; ---------------- Timer 1 ------------------
;--------------------------------------------
; autorise interruptions, pour timer I2S
;
; registres utilisés :
;		R13/R11   /R31
;		R0/R1/R2/R3/R4/R5/R6/R7/R8/R9/R10  R12/R13/R14


DSP_LSP_routine_interruption_Timer1:
	.if		I2S_during_Timer1=1
	bclr	#3,r13		; clear IMASK
	store	r13,(r11)	; restore flags
	.endif

; gestion replay LSP

	movei		#LSPVars,R14
	load		(R14),R0			; R0 = byte stream

DSP_LSP_Timer1_process:
	moveq	#0,r3
	moveq	#0,R2
	bset	#8,r3		; r3 = $100
DSP_LSP_Timer1_cloop:
	loadb	(R0),R6			; R6 = byte code
	addq	#1,R0

	cmpq	#0,R6
	jr	eq,DSP_LSP_Timer1_cloop
	add	R3,R2

	sub	r3,r2
DSP_LSP_Timer1_swCode:
	add		R6,R2
	move		R2,R6
	add		R2,R2
	load		(R14+2),R3	; R3=code table / m_codeTableAddr
	add		R2,R3

	loadw		(R3),R2			; R2 = code
	cmpq		#0,R2
	movei		#DSP_LSP_Timer1_noInst,R12
	jump		eq,(R12)
	load		(R14+3),R4	; R4=escape code rewind / m_escCodeRewind
	cmp		R4,R2
	movei		#DSP_LSP_Timer1_r_rewind,R12
	jump		eq,(R12)
	cmp		R4,R2
	movei		#DSP_LSP_Timer1_r_chgbpm,R12
	jump		eq,(R12)
	load		(R14+4),R4	; R4=escape code set bpm / m_escCodeSetBpm

;--------------------------
; gestion des volumes
;--------------------------
; test volume canal 3
	btst		#7,R2
	loadb		(R0),R4
	jr	eq,DSP_LSP_Timer1_noVd
	btst		#6,R2
	addqt		#1,R0
	moveta		R4,R21			; alt R21 = volume channel 3
	loadb		(R0),R4
DSP_LSP_Timer1_noVd:
; test volume canal 2
	jr	eq,DSP_LSP_Timer1_noVc
	btst		#5,R2
	addqt		#1,R0
	moveta		R4,R22			; alt R22 = volume channel 2
	loadb		(R0),R4
DSP_LSP_Timer1_noVc:
; test volume canal 1
	jr	eq,DSP_LSP_Timer1_noVb
	btst		#4,R2
	addqt		#1,R0
	moveta		R4,R23			; alt R23 = volume channel 1
	loadb		(R0),R4
DSP_LSP_Timer1_noVb:
; test volume canal 0
	jr	eq,DSP_LSP_Timer1_noVa
	nop
	addq		#1,R0
	moveta		R4,R24			; alt R24 = volume channel 0
DSP_LSP_Timer1_noVa:

	.if	LSP_avancer_module=1
	store		R0,(R14)			; store byte stream ptr
	.endif
	addq		#4,R14			; avance a word stream ptr
	load		(R14),R0			; R0 = word stream

;--------------------------
; gestion des notes
;--------------------------
; test period canal 3
    movei	#LSP_DSP_PAULA_AUD3PER,R5
    btst	#3,R2
    loadw	(R0),R4
    jr		eq,DSP_LSP_Timer1_noPd
    btst	#2,R2
    addqt	#2,R0
    store	R4,(R5)
    loadw	(R0),R4
DSP_LSP_Timer1_noPd:
; test period canal 2
    subqt	#4,r5
    jr		eq,DSP_LSP_Timer1_noPc
    btst	#1,R2
    addqt	#2,R0
    store	R4,(R5)
    loadw	(R0),R4
DSP_LSP_Timer1_noPc:
; test period canal 1
    subqt	#4,r5
    jr		eq,DSP_LSP_Timer1_noPb
    btst	#0,R2
    addqt	#2,R0
    store	R4,(R5)
    loadw	(R0),R4
DSP_LSP_Timer1_noPb:
; test period canal 0
    jr		eq,DSP_LSP_Timer1_noPa
    subqt	#4,r5

    addqt	#2,R0
    store	R4,(R5)
DSP_LSP_Timer1_noPa:

; pas de test des 8 bits du haut en entier pour zapper la lecture des instruments
; tst.w	d0			; d0.w, avec d0.b qui a avancé ! / beq.s	.noInst

	load		(R14+4),R5		; R5= instrument table  ( =+$10)  = a2   / m_lspInstruments-1 = 5-1

;--------------------------
; gestion des instruments
;--------------------------
;--- test instrument voie 3

	movei		#LSP_DSP_repeat_pointeur3,R7
	btst		#15,R2
	movei		#DSP_LSP_Timer1_skip3,R12
	jr		ne,DSP_LSP_Timer1_setIns3
	btst		#14,R2
	jump		eq,(R12)
	nop

; repeat voie 3
	load		(R7),R3			; pointeur sauvegardé, sur infos de repeats
	addqt	#4,r7				;LSP_DSP_repeat_length3,R8
	load		(R7),R4
	moveta		R3,R5		; alt R5 = (LSP_DSP_PAULA_AUD3L)
	jump		(R12)		; jump en DSP_LSP_Timer1_skip3
	moveta		R4,R4		; new length => alt R4


DSP_LSP_Timer1_setIns3:
	loadw		(R0),R3		; offset de l'instrument par rapport au precedent
; addition en .w
; passage en .L
	shlq		#16,R3
	addq		#2,R0
	sharq		#16,R3
	add		R3,R5		;R5=pointeur datas instruments

	;movei		#LSP_DSP_PAULA_AUD3L,R7
	loadw		(R5),R6
	addq		#2,R5
	shlq		#16,R6
	loadw		(R5),R8
	or		R8,R6
	;movei		#LSP_DSP_PAULA_AUD3LEN,R8
	shlq		#nb_bits_virgule_offset,R6
	;store		R6,(R7)		; stocke le pointeur sample a virgule dans LSP_DSP_PAULA_AUD3L
	addq		#2,R5
	moveta		R6,R5		; alt R5 = (LSP_DSP_PAULA_AUD3L)
	loadw		(R5),R9		; .w = R9 = taille du sample
	shlq		#nb_bits_virgule_offset,R9		; en 16:16
	add		R6,R9		; taille devient fin du sample, a virgule
	;store		R9,(R8)		; stocke la nouvelle fin a virgule
	moveta		R9,R4		; new length => alt R4
	addq		#2,R5		; positionne sur pointeur de repeat
; repeat pointeur
	loadw		(R5),R4
	addq		#2,R5
	shlq		#16,R4
	loadw		(R5),R8
	or		R8,R4
	addq		#2,R5
	shlq		#nb_bits_virgule_offset,R4
	store		R4,(R7)		; pointeur sample repeat, a virgule
; repeat length
	loadw		(R5),R8		; .w = R8 = taille du sample
	addqt		#4,r7		;LSP_DSP_repeat_length3
	shlq		#nb_bits_virgule_offset,R8		; en 16:16
	add		R4,R8
; test le reset pour prise en compte immediate du changement de sample
	btst		#14,R2
	store		R8,(R7)		; stocke la nouvelle taille
//->	subq		#4,R5	; moved down

	jr		eq,DSP_LSP_Timer1_noreset3
	subqt		#4,R5

; reset a travers le dmacon, il faut rafraichir : LSP_DSP_PAULA_internal_location3 & LSP_DSP_PAULA_internal_length3 & LSP_DSP_PAULA_internal_offset3=0
	;movei		#LSP_DSP_PAULA_internal_location3,R7
	;movei		#LSP_DSP_PAULA_internal_length3,R8
	;store		R6,(R7)		; stocke le pointeur sample dans LSP_DSP_PAULA_internal_location3
	moveta		R6,R1		; alt R1 = (LSP_DSP_PAULA_internal_location3)
	;store		R9,(R8)		; stocke la nouvelle taille en 16:16: dans LSP_DSP_PAULA_internal_length3
	moveta		R9,R3		; alt R3 = (LSP_DSP_PAULA_internal_length3)
; remplace les 4 octets en stock
	move		R6,R12
	shrq		#nb_bits_virgule_offset+2,R12	; enleve la virgule  + 2 bits du bas
	;movei		#LSP_DSP_PAULA_AUD3DAT,R8
	shlq		#2,R12
	load		(R12),R16		; R16 = 4 octets dispos channel 3
	;store		R7,(R8)

DSP_LSP_Timer1_noreset3:
DSP_LSP_Timer1_skip3:

;--- test instrument voie 2
	movei		#LSP_DSP_repeat_pointeur2,R7
	btst		#13,R2
	movei		#DSP_LSP_Timer1_skip2,R12
	jr		ne,DSP_LSP_Timer1_setIns2
	btst		#12,R2
	jump		eq,(R12)
	nop

; repeat voie 2
	load		(R7),R3			; pointeur sauvegardé, sur infos de repeats
	addqt	#4,r7				;LSP_DSP_repeat_length2
	load		(R7),R4
	moveta		R3,R10
	jump		(R12)		; jump en DSP_LSP_Timer1_skip3
	moveta		R4,R9

DSP_LSP_Timer1_setIns2:
	loadw		(R0),R3		; offset de l'instrument par rapport au precedent
; addition en .w
; passage en .L
	shlq		#16,R3
	addq		#2,R0
	sharq		#16,R3
	add	R3,R5		;R5=pointeur datas instruments

	;movei		#LSP_DSP_PAULA_AUD2L,R7
	loadw		(R5),R6
	addq		#2,R5
	shlq		#16,R6
	loadw		(R5),R8
	or	R8,R6
	;movei		#LSP_DSP_PAULA_AUD2LEN,R8
	shlq		#nb_bits_virgule_offset,R6
	;store		R6,(R7)		; stocke le pointeur sample a virgule dans LSP_DSP_PAULA_AUD2L
	moveta		R6,R10
	addq		#2,R5
	loadw		(R5),R9		; .w = R9 = taille du sample
	shlq		#nb_bits_virgule_offset,R9		; en 16:16
	add	R6,R9		; taille devient fin du sample, a virgule
	;store		R9,(R8)		; stocke la nouvelle fin a virgule
	moveta		R9,R9
	addq		#2,R5		; positionne sur pointeur de repeat
; repeat pointeur
	loadw		(R5),R4
	addq		#2,R5
	shlq		#16,R4
	loadw		(R5),R8
	or		R8,R4
	addq		#2,R5
	shlq		#nb_bits_virgule_offset,R4
	store		R4,(R7)		; pointeur sample repeat, a virgule
; repeat length
	addqt		#4,r7	;LSP_DSP_repeat_length2
	loadw		(R5),R8		; .w = R8 = taille du sample
	shlq		#nb_bits_virgule_offset,R8		; en 16:16
	add	R4,R8
; test le reset pour prise en compte immediate du changement de sample
	btst		#12,R2
	store		R8,(R7)		; stocke la nouvelle taille
//->	subq		#4,R5	; moved down

	jr		eq,DSP_LSP_Timer1_noreset2
	subqt		#4,R5

; reset a travers le dmacon, il faut rafraichir : LSP_DSP_PAULA_internal_location2 & LSP_DSP_PAULA_internal_length2 & LSP_DSP_PAULA_internal_offset2=0
	;movei		#LSP_DSP_PAULA_internal_location2,R7
	;movei		#LSP_DSP_PAULA_internal_length2,R8
	;store		R6,(R7)		; stocke le pointeur sample dans LSP_DSP_PAULA_internal_location2
	moveta		R6,R6		; R6 = (LSP_DSP_PAULA_internal_location2)
	;store		R9,(R8)		; stocke la nouvelle taille en 16:16: dans LSP_DSP_PAULA_internal_length2
	moveta		R9,R8
; remplace les 4 octets en stock
	move		R6,R12
	shrq		#nb_bits_virgule_offset+2,R12	; enleve la virgule  + 2 bits du bas
	;movei		#LSP_DSP_PAULA_AUD2DAT,R8
	shlq		#2,R12
	load		(R12),R24		; R24 = 4 octets dispos channel 2
	;store		R7,(R8)


DSP_LSP_Timer1_noreset2:
DSP_LSP_Timer1_skip2:

;--- test instrument voie 1
	movei		#LSP_DSP_repeat_pointeur1,R7
	btst		#11,R2
	movei		#DSP_LSP_Timer1_skip1,R12
	jr		ne,DSP_LSP_Timer1_setIns1
	btst		#10,R2
	jump		eq,(R12)
	nop

; repeat voie 1
	load		(R7),R3			; pointeur sauvegardé, sur infos de repeats
	addqt	#4,r7				;LSP_DSP_repeat_length1,R4
	load		(R7),R4
	moveta		R3,R15
	jump		(R12)		; jump en DSP_LSP_Timer1_skip1
	moveta		R4,R14

DSP_LSP_Timer1_setIns1:
	loadw		(R0),R3		; offset de l'instrument par rapport au precedent
; addition en .w
; passage en .L
	shlq		#16,R3
	addq		#2,R0
	sharq		#16,R3
	add		R3,R5		;R5=pointeur datas instruments



	;movei		#LSP_DSP_PAULA_AUD1L,R7
	loadw		(R5),R6
	addq		#2,R5
	shlq		#16,R6
	loadw		(R5),R8
	or	R8,R6
	;movei		#LSP_DSP_PAULA_AUD1LEN,R8
	shlq		#nb_bits_virgule_offset,R6
	;store		R6,(R7)		; stocke le pointeur sample a virgule dans LSP_DSP_PAULA_AUD1L
	moveta		R6,R15
	addq		#2,R5
	loadw		(R5),R9		; .w = R9 = taille du sample
	shlq		#nb_bits_virgule_offset,R9		; en 16:16
	add	R6,R9		; taille devient fin du sample, a virgule
	;store		R9,(R8)		; stocke la nouvelle fin a virgule
	moveta		R9,R14
	addq		#2,R5		; positionne sur pointeur de repeat
; repeat pointeur
	loadw		(R5),R4
	addq		#2,R5
	shlq		#16,R4
	loadw		(R5),R8
	or		R8,R4
	addq		#2,R5
	shlq		#nb_bits_virgule_offset,R4
	store		R4,(R7)		; pointeur sample repeat, a virgule
; repeat length
	addqt		#4,r7	;LSP_DSP_repeat_length1
	loadw		(R5),R8		; .w = R8 = taille du sample
	shlq		#nb_bits_virgule_offset,R8		; en 16:16
	add	R4,R8
; test le reset pour prise en compte immediate du changement de sample
	btst		#10,R2
	store		R8,(R7)		; stocke la nouvelle taille
//->	subq		#4,R5

	jr		eq,DSP_LSP_Timer1_noreset1
	subqt		#4,R5

; reset a travers le dmacon, il faut rafraichir : LSP_DSP_PAULA_internal_location1 & LSP_DSP_PAULA_internal_length1 & LSP_DSP_PAULA_internal_offset1=0
	;movei		#LSP_DSP_PAULA_internal_location1,R7
	;movei		#LSP_DSP_PAULA_internal_length1,R8
	;store		R6,(R7)		; stocke le pointeur sample dans LSP_DSP_PAULA_internal_location1
	moveta		R6,R11		; alt R11 = (LSP_DSP_PAULA_internal_location1)
	;store		R9,(R8)		; stocke la nouvelle taille en 16:16: dans LSP_DSP_PAULA_internal_length1
	moveta		R9,R13
; remplace les 4 octets en stock
	move		R6,R12
	shrq		#nb_bits_virgule_offset+2,R12	; enleve la virgule  + 2 bits du bas
	;movei		#LSP_DSP_PAULA_AUD1DAT,R8
	shlq		#2,R12
	load		(R12),R25	; R25 = 4 octets dispos channel 1
	; store		R7,(R8)


DSP_LSP_Timer1_noreset1:
DSP_LSP_Timer1_skip1:

;--- test instrument voie 0
	movei		#LSP_DSP_repeat_pointeur0,R7
	btst		#9,R2
	movei		#DSP_LSP_Timer1_skip0,R12
	jr		ne,DSP_LSP_Timer1_setIns0
	btst		#8,R2
	jump		eq,(R12)
	nop

; repeat voie 0
	load		(r7),R3			; pointeur sauvegardé, sur infos de repeats
	addqt	#4,r7				;LSP_DSP_repeat_length0,R4
	load		(R7),R4
	moveta		R3,R20
	jump		(R12)		; jump en DSP_LSP_Timer1_skip0
	moveta		R4,R19

DSP_LSP_Timer1_setIns0:
	loadw		(R0),R3		; offset de l'instrument par rapport au precedent
; addition en .w
; passage en .L
	shlq		#16,R3
	addq		#2,R0
	sharq		#16,R3
	add		R3,R5		;R5=pointeur datas instruments

	;movei		#LSP_DSP_PAULA_AUD0L,R7
	loadw		(R5),R6
	addq		#2,R5
	shlq		#16,R6
	loadw		(R5),R8
	or		R8,R6
	;movei		#LSP_DSP_PAULA_AUD0LEN,R8
	shlq		#nb_bits_virgule_offset,R6
	;store		R6,(R7)		; stocke le pointeur sample a virgule dans LSP_DSP_PAULA_AUD0L
	moveta		R6,R20
	addq		#2,R5
	loadw		(R5),R9		; .w = R9 = taille du sample
	shlq		#nb_bits_virgule_offset,R9		; en 16:16
	add	R6,R9		; taille devient fin du sample, a virgule
	;store		R9,(R8)		; stocke la nouvelle fin a virgule
	moveta		R9,R19
	addq		#2,R5		; positionne sur pointeur de repeat
; repeat pointeur
	loadw		(R5),R4
	addq		#2,R5
	shlq		#16,R4
	loadw		(R5),R8
	or		R8,R4
	addq		#2,R5
	shlq		#nb_bits_virgule_offset,R4
	store		R4,(R7)		; pointeur sample repeat, a virgule
; repeat length
	addqt		#4,R7	;LSP_DSP_repeat_length0
	loadw		(R5),R8		; .w = R8 = taille du sample
	shlq		#nb_bits_virgule_offset,R8		; en 16:16
	add		R4,R8
; test le reset pour prise en compte immediate du changement de sample
	btst		#8,R2

	store		R8,(R7)		; stocke la nouvelle taille
//->	subq		#4,R5 ; moved down
	jr		eq,DSP_LSP_Timer1_noreset0
	subq		#4,R5
; reset a travers le dmacon, il faut rafraichir : LSP_DSP_PAULA_internal_location0 & LSP_DSP_PAULA_internal_length0 & LSP_DSP_PAULA_internal_offset0=0
	;movei		#LSP_DSP_PAULA_internal_location0,R7
	;movei		#LSP_DSP_PAULA_internal_length0,R8
	;store		R6,(R7)		; stocke le pointeur sample dans LSP_DSP_PAULA_internal_location0
	moveta		R6,R16		; alt R16 = (LSP_DSP_PAULA_internal_location0)
	;store		R9,(R8)		; stocke la nouvelle taille en 16:16: dans LSP_DSP_PAULA_internal_length0
	moveta		R9,R18

; remplace les 4 octets en stock
	move		R6,R12
	shrq		#nb_bits_virgule_offset+2,R12	; enleve la virgule  + 2 bits du bas
	;movei		#LSP_DSP_PAULA_AUD0DAT,R8
	shlq		#2,R12
	load		(R12),R28	; R28 = 4 octets dispos channel 0
	;store		R7,(R8)
DSP_LSP_Timer1_noreset0:
DSP_LSP_Timer1_skip0:



DSP_LSP_Timer1_noInst:
	.if	LSP_avancer_module=1
	store		R0,(R14)	; store word stream (or byte stream if coming from early out)
	.endif


; - fin de la conversion du player LSP
; ------------------------------------

; ---------------------------------------
; elements d'emulation Paula
; calcul des increments
; calcul de l'increment a partir de la note Amiga : (3546895 / note) / frequence I2S
; ---------------------------------------

; conversion period => increment voie 0
	movei	#LSP_DSP_PAULA_AUD0PER,R8
	movei	#LSP_DSP_PAULA_AUD1PER,R9
	movei	#DSP_frequence_de_replay_reelle_I2S,R0
	load	(R0),R0
	movei	#3546895,R3
	load	(R8),R2
	addqt	#8,r8
	load	(r9),r1
	addqt	#8,r9
	cmpq	#0,R2		; AUD0PER
	moveq	#0,R4
	jr	eq,.2
	moveta	R4,R17	; direct increment value channel 0
	move	R3,R4
	div	R2,R4	; (3546895 / note)
	shlq	#nb_bits_virgule_offset,R4
	div	R0,R4	; (3546895 / note) / frequence I2S en 16:16
	moveta	R4,R17	; direct increment value channel 0
.2:

; conversion period => increment voie 1
	load	(R8),R2
	addqt	#4,r2
	cmpq	#0,R1		; AUD1PER
	moveq	#0,R4
	jr	eq,.22
	moveta	R4,R12	; direct increment value channel 1
	move	R3,R4
	div	R1,R4	; (3546895 / note)
	shlq	#nb_bits_virgule_offset,R4
	div	R0,R4	; (3546895 / note) / frequence I2S en 16:16
	moveta	R4,R12	; direct increment value channel 1
.22:

; conversion period => increment voie 2
	load	(R9),R1
	cmpq	#0,R2		;AUD2PER
	moveq	#0,R4
	jr	eq,.23
	moveta	R4,R7	; direct increment value channel 2
	move	R3,R4
	div	R2,R4	; (3546895 / note)
	shlq	#nb_bits_virgule_offset,R4
	div	R0,R4	; (3546895 / note) / frequence I2S en 16:16
	moveta	R4,R7	; direct increment value channel 2
.23:

; conversion period => increment voie 3
	cmpq	#0,R1		;AUD3PER
	moveq	#0,R4
	jr	eq,.24
	moveta	R4,R2	; direct increment value channel 3
	move	R3,R4
	div	R1,R4	; (3546895 / note)
	shlq	#nb_bits_virgule_offset,R4
	div	R0,R4	; (3546895 / note) / frequence I2S en 16:16
	moveta	R4,R2	; direct increment value channel 3
.24:

;--------------------------------------------------


;------------------------------------
; return from interrupt Timer 1
	load	(r31),r12	; return address
	;bset	#10,r13		; clear latch 1 = I2S
	bset	#11,r13		; clear latch 1 = timer 1
	addqt	#2,r12		; next instruction
	;bset	#12,r13		; clear latch 1 = timer 2
	bclr	#3,r13		; clear IMASK
	addq	#4,r31		; pop from stack
	jump	t,(r12)		; return
	store	r13,(r11)	; restore flags

;------------------------------------
;rewind
DSP_LSP_Timer1_r_rewind:
;	movei		#LSPVars,R14
;	load		(R14),R0			; R0 = byte stream
	load		(R14+8),R0	; bouclage : R0 = byte stream / m_byteStreamLoop = 8
	movei		#DSP_LSP_Timer1_process,R12
	load		(R14+9),R3	; m_wordStreamLoop=9
	jump		(R12)
	store		R3,(R14+1)		; m_wordStream=1

;------------------------------------
; change bpm
DSP_LSP_Timer1_r_chgbpm:
	loadb		(R0),R8
	movei		#DSP_LSP_Timer1_process,R12
	store		R8,(R14+7)		; R3=nouveau bpm / m_currentBpm = 7
;application nouveau bpm dans Timer 1
	movei	#60*256,R10
	;shlq	#8,R10		; 16 bits de virgule
	div	R8,R10		; 60/bpm
	movei	#24*65536,R9		; 24=> 5 bits
	or	R10,R10
	;shlq	#16,R9
	div	R10,R9		; R9=
	shrq	#8,R9		; R9=frequence replay
	;move	R9,R11
; frequence du timer 1
	movei	#182150,R10		; 26593900 / 146 = 182150
	div	R9,R10
	move	R10,R14
	subq	#1,R14			; -1 pour parametrage du timer 1
; 26593900 / 50 = 531 878 => 2 × 73 × 3643 => 146*3643
	movei	#JPIT1,r10		; F10000
	movei	#145*65536,r9		; Timer 1 Pre-scaler
	;shlq	#16,r12
	or	R14,R9
	store	r9,(r10)		; JPIT1 & JPIT2

	jump		(R12)
	addq		#1,R0




; ------------------- N/A ------------------
DSP_LSP_routine_interruption_Timer2:
; ------------------- N/A ------------------

;------------------------------------
; return from interrupt Timer 2
	load	(r31),r12	; return address
	;bset	#10,r13		; clear latch 1 = I2S
	;bset	#11,r13		; clear latch 1 = timer 1
	bset	#12,r13		; clear latch 1 = timer 2
	bclr	#3,r13		; clear IMASK
	addq	#4,r31		; pop from stack
	addqt	#2,r12		; next instruction
	jump	t,(r12)		; return
	store	r13,(r11)	; restore flags



; ------------- main DSP ------------------
DSP_routine_init_DSP:
; assume run from bank 1
	movei	#DSP_ISP+(DSP_STACK_SIZE*4),r31	; init isp
	moveq	#0,r1
	moveta	r31,r31			; ISP (bank 0)
	movei	#DSP_USP+(DSP_STACK_SIZE*4),r31	; init usp

; calculs des frequences deplacé dans DSP
; sclk I2S
	movei	#$00F14003,r0
	loadb	(r0),r3
	btst	#4,r3
	movei	#415530<<8,r1	;frequence_Video_Clock_divisee*128
	jr	eq,initPAL
	nop
	movei	#415483<<8,r1	;frequence_Video_Clock_divisee*128
initPAL:
    movei    #LSP_DSP_Audio_frequence,R0
    div      R0,R1
    movei    #128,R2
    add      R2,R1		; +128 = +0.5
    shrq     #8,R1
    subq     #1,R1
    movei    #DSP_parametre_de_frequence_I2S,r2
    store    R1,(R2)
;calcul inverse
    addq    #1,R1
    add     R1,R1		; *2
    add     R1,R1		; *2
    shlq    #4,R1	; *16

	btst	#4,r3
	movei	#26593900,r0	;frequence_Video_Clock
	jr	eq,initPAL2
	nop
	movei	#26590906,r0	;frequence_Video_Clock
initPAL2:
    div      R1,R0
    movei    #DSP_frequence_de_replay_reelle_I2S,R2
    store    R0,(R2)
; init I2S
	movei	#SCLK,r10
	movei	#SMODE,r11
	movei	#DSP_parametre_de_frequence_I2S,r12
	movei	#%001101,r13	; SMODE bascule sur RISING
	load	(r12),r12		; SCLK
	store	r12,(r10)
	store	r13,(r11)


; init Timer 1
; frq = 24/(60/bpm)
	movei	#LSP_BPM_frequence_replay,R11
	load	(R11),R11
	movei	#60*256,R10
	;shlq	#8,R10		; 16 bits de virgule
	div	R11,R10		; 60/bpm
	movei	#24*65536,R9		; 24=> 5 bits
	or	R10,R10
	;shlq	#16,R9
	div	R10,R9		; R9=
	or	R9,R9
	shrq	#8,R9		; R9=frequence replay

	move	R9,R11


; frequence du timer 1
	movei	#182150,R10		; 26593900 / 146 = 182150
	div	R11,R10
	move	R10,R13

	subq	#1,R13			; -1 pour parametrage du timer 1



; 26593900 / 50 = 531 878 => 2 × 73 × 3643 => 146*3643
	movei	#JPIT1,r10		; F10000
	;movei	#JPIT2,r11		; F10002
	movei	#145*65536,r12		; Timer 1 Pre-scaler
	;shlq	#16,r12
	or		R13,R12

	store	r12,(r10)		; JPIT1 & JPIT2


; init timer 2
	movei	#JPIT3,r10		; F10004
	;movei	#JPIT4,r11		; F10006
	movei	#145*65536,r12	; Timer 1 Pre-scaler
	movei	#955-1,r13		; 951=200hz
	or		R13,R12
	store	r12,(r10)		; JPIT1 & JPIT2


; enable interrupts
	movei	#D_FLAGS,r30

; prod version
	movei	#D_I2SENA|D_TIM1ENA|D_TIM2ENA|REGPAGE,r29	; I2S+Timer 1+timer 2
; prod version

	;movei	#D_I2SENA|D_TIM1ENA|REGPAGE,r29	; I2S+Timer 1
	;movei	#D_I2SENA|REGPAGE,r29			; I2S only


	;movei	#D_TIM1ENA|REGPAGE,r29			; Timer 1 only
	;movei	#D_TIM2ENA|REGPAGE,r29			; Timer 2 only


;----------------------------
; registres pour replay reel samples dans I2S
	movei		#L_I2S+4,R1
	moveta		R1,R26
	movei		#L_I2S,R1
	moveta		R1,R27
	moveq		#0,R1
	moveta		R1,R18
	moveta		R1,R19

;----------------------------
; variables pour movfa
	movei		#$FFFFFFFC,R0			; OK
; channel 3
	;movei		#LSP_DSP_PAULA_internal_location3,R1	; OK
	;movei		#LSP_DSP_PAULA_internal_increment3,R2	; OK
	;movei		#LSP_DSP_PAULA_internal_length3,R3		; OK
	;movei		#LSP_DSP_PAULA_AUD3LEN,R4		; OK
	;movei		#LSP_DSP_PAULA_AUD3L,R5

	movei		#silence<<nb_bits_virgule_offset,R1
	moveq		#0,R2
	movei		#(silence+4)<<nb_bits_virgule_offset,R3
	movei		#(silence+4)<<nb_bits_virgule_offset,R4
	movei		#silence<<nb_bits_virgule_offset,R5
	moveta		R2,R16					; init les 4 octets en cours de channel 3

;channel 2
	;movei		#LSP_DSP_PAULA_internal_location2,R6	; OK
	;movei		#LSP_DSP_PAULA_internal_increment2,R7	; OK
	;movei		#LSP_DSP_PAULA_internal_length2,R8
	;movei		#LSP_DSP_PAULA_AUD2LEN,R9		; OK
	;movei		#LSP_DSP_PAULA_AUD2L,R10		; OK

	movei		#silence<<nb_bits_virgule_offset,R6
	moveq		#0,R7
	movei		#(silence+4)<<nb_bits_virgule_offset,R8
	movei		#(silence+4)<<nb_bits_virgule_offset,R9
	movei		#silence<<nb_bits_virgule_offset,R10



;channel 1
	;movei		#LSP_DSP_PAULA_internal_location1,R11
	;movei		#LSP_DSP_PAULA_internal_increment1,R12
	;movei		#LSP_DSP_PAULA_internal_length1,R13
	;movei		#LSP_DSP_PAULA_AUD1LEN,R14
	;movei		#LSP_DSP_PAULA_AUD1L,R15

	movei		#silence<<nb_bits_virgule_offset,R11
	moveq		#0,R12
	movei		#(silence+4)<<nb_bits_virgule_offset,R13
	movei		#(silence+4)<<nb_bits_virgule_offset,R14
	movei		#silence<<nb_bits_virgule_offset,R15


;channel 0
	;movei		#LSP_DSP_PAULA_internal_location0,R16
	;movei		#LSP_DSP_PAULA_internal_increment0,R17
	;movei		#LSP_DSP_PAULA_internal_length0,R18
	;movei		#LSP_DSP_PAULA_AUD0LEN,R19
	;movei		#LSP_DSP_PAULA_AUD0L,R20

	movei		#silence<<nb_bits_virgule_offset,R16
	moveq		#0,R17
	movei		#(silence+4)<<nb_bits_virgule_offset,R18
	movei		#(silence+4)<<nb_bits_virgule_offset,R19
	movei		#silence<<nb_bits_virgule_offset,R20


;---------------
; volumes : R21/R22/R23/R24
; dispos : R25/R26




; registres used for main loop: R31/R30/R29/R27/R28
	store	r29,(r30)
	nop
	nop

DSP_boucle_centrale:
	movei	#LSP_DSP_oldflag,R27
	load	(R27),R28
	movei	#LSP_DSP_flag,R29
	load	(R29),R30

	cmp	R28,R30
	movei	#DSP_boucle_centrale,R29
	jump	eq,(R29)
//->	nop
; flags are different, handles new flag
	cmpq	#0,R30
	movei	#DSP_boucle_centrale,R28
	jr		ne,DSP_switch_ON
	store	R30,(R27)
; DSP switch off
	movei	#D_FLAGS,r30
	movei	#D_TIM2ENA|REGPAGE,r27
	jump	(R28)
	store	R27,(R30)			; just timer 2

DSP_switch_ON:
	movei	#D_I2SENA|D_TIM1ENA|D_TIM2ENA|REGPAGE,r27	; I2S+Timer 1+timer 2
	movei	#D_FLAGS,r30
	jump	(R28)
	store	R27,(R30)

	.phrase

;EDZTMP1:					dc.l	$120771

LSP_DSP_flag:		dc.l	0		; DSP replay flag 0=OFF / 1=ON
LSP_DSP_oldflag:	dc.l	0

DSP_frequence_de_replay_reelle_I2S:			dc.l	0
DSP_UN_sur_frequence_de_replay_reelle_I2S:	dc.l	0
DSP_parametre_de_frequence_I2S:		dc.l	0

LSP_PAULA:
; variables Paula
; channel 0
;LSP_DSP_PAULA_AUD0L:		dc.l	silence<<nb_bits_virgule_offset	; Audio channel 0 location
;LSP_DSP_PAULA_AUD0LEN:		dc.l	(silence+4)<<nb_bits_virgule_offset	; en bytes !
LSP_DSP_PAULA_AUD0PER:		dc.l	$DEADDEAD		; period , a transformer en increment
LSP_DSP_PAULA_AUD1PER:		dc.l	$DEADDEAD		; period , a transformer en increment
LSP_DSP_PAULA_AUD2PER:		dc.l	$DEADDEAD		; period , a transformer en increment
LSP_DSP_PAULA_AUD3PER:		dc.l	$DEADDEAD		; period , a transformer en increment		+8
;LSP_DSP_PAULA_AUD0VOL:		dc.l	0		; volume
;LSP_DSP_PAULA_AUD0DAT:		dc.l	0		; long word en cours d'utilisation / stocké / buffering
;LSP_DSP_PAULA_internal_location0:	dc.l	silence<<nb_bits_virgule_offset		; internal register : location of the sample currently played
LSP_DSP_PAULA_internal_increment0:	dc.l	$DEADDEAD		; internal register : increment linked to period 16:16
;LSP_DSP_PAULA_internal_length0:		dc.l	(silence+4)<<nb_bits_virgule_offset	; internal register : length of the sample currently played
LSP_DSP_repeat_pointeur0:	dc.l	silence<<nb_bits_virgule_offset
LSP_DSP_repeat_length0:		dc.l	(silence+4)<<nb_bits_virgule_offset
; channel 1
;LSP_DSP_PAULA_AUD1L:		dc.l	silence<<nb_bits_virgule_offset	; Audio channel 0 location
;LSP_DSP_PAULA_AUD1LEN:		dc.l	(silence+4)<<nb_bits_virgule_offset	; en bytes !

;LSP_DSP_PAULA_AUD1VOL:		dc.l	0		; volume
;LSP_DSP_PAULA_AUD1DAT:		dc.l	0		; long word en cours d'utilisation / stocké / buffering
;LSP_DSP_PAULA_internal_location1:	dc.l	silence<<nb_bits_virgule_offset		; internal register : location of the sample currently played
LSP_DSP_PAULA_internal_increment1:	dc.l	$DEADDEAD		; internal register : increment linked to period 16:16
;LSP_DSP_PAULA_internal_length1:		dc.l	(silence+4)<<nb_bits_virgule_offset	; internal register : length of the sample currently played
LSP_DSP_repeat_pointeur1:	dc.l	silence<<nb_bits_virgule_offset
LSP_DSP_repeat_length1:		dc.l	(silence+4)<<nb_bits_virgule_offset
; channel 2
;LSP_DSP_PAULA_AUD2L:		dc.l	silence<<nb_bits_virgule_offset	; Audio channel 0 location
;LSP_DSP_PAULA_AUD2LEN:		dc.l	(silence+4)<<nb_bits_virgule_offset	; en bytes !

;LSP_DSP_PAULA_AUD2VOL:		dc.l	0		; volume
;LSP_DSP_PAULA_AUD2DAT:		dc.l	0		; long word en cours d'utilisation / stocké / buffering
;LSP_DSP_PAULA_internal_location2:	dc.l	silence<<nb_bits_virgule_offset		; internal register : location of the sample currently played
LSP_DSP_PAULA_internal_increment2:	dc.l	$DEADDEAD		; internal register : increment linked to period 16:16
;LSP_DSP_PAULA_internal_length2:		dc.l	(silence+4)<<nb_bits_virgule_offset	; internal register : length of the sample currently played
LSP_DSP_repeat_pointeur2:	dc.l	silence<<nb_bits_virgule_offset
LSP_DSP_repeat_length2:		dc.l	(silence+4)<<nb_bits_virgule_offset
; channel 3
;LSP_DSP_PAULA_AUD3L:		dc.l	$0		; silence<<nb_bits_virgule_offset	; Audio channel 0 location						0
;LSP_DSP_PAULA_AUD3LEN:		dc.l	$0			;(silence+4)<<nb_bits_virgule_offset	; en bytes !						+4

;LSP_DSP_PAULA_AUD3VOL:		dc.l	0		; volume										+12
;LSP_DSP_PAULA_AUD3DAT:		dc.l	0		; long word en cours d'utilisation / stocké / buffering					+16
;LSP_DSP_PAULA_internal_location3:	dc.l	silence<<nb_bits_virgule_offset		; internal register : location of the sample currently played		+20
LSP_DSP_PAULA_internal_increment3:	dc.l	$DEADDEAD		; internal register : increment linked to period 16:16					+24
;LSP_DSP_PAULA_internal_length3:		dc.l	(silence+4)<<nb_bits_virgule_offset	; internal register : length of the sample currently played			+28
LSP_DSP_repeat_pointeur3:	dc.l	silence<<nb_bits_virgule_offset						;			+32
LSP_DSP_repeat_length3:		dc.l	(silence+4)<<nb_bits_virgule_offset							;			+36

;offset_LSP_DSP_PAULA_internal_location0		.equ	((LSP_DSP_PAULA_internal_location0-LSP_PAULA)/4)



LSP_BPM_frequence_replay:		dc.l	25
	.phrase

LSP_load:
	include "lsp_init.das"
	movei	#DSP_routine_init_DSP,r0
	jump	(r0)
	nop

;---------------------
; FIN DE LA RAM DSP
YM_DSP_fin:
;---------------------
SOUND_DRIVER_SIZE .equ YM_DSP_fin-DSP_base_memoire
    .print    "--- Sound driver code size (DSP): ", /u SOUND_DRIVER_SIZE, " bytes / 8192 ---"
	.print "LSPVars ",/lx LSPVars
	.print "LSP_BPM_frequence_replay ",/lx LSP_BPM_frequence_replay
	.print "DSP_routine_init_DSP ",/lx DSP_routine_init_DSP

 if LSP_BPM_frequence_replay != $f1b6ec
	print "!!!!!!!!!!!!"
 endif
