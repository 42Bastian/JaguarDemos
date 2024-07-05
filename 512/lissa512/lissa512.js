;; -*-asm-*-
;;; lissa512 - lissajous with 512 dots in 512b with bytebeat sound
;;; ----------------------------------------
;;; Author: 42Bastian
;;; Release: Nordlicht'24
;;; ----------------------------------------

	gpu

	include <js/symbols/jagregeq.js>
	include <js/symbols/blit_eq.js>

BLIT_WID	EQU BLIT_WID320

 IFD MODEL_M
 echo "Model M"
 ENDIF

WANTED_SIZE	SET 512

BLOCKS		SET (WANTED_SIZE/64)		; max. is 10

START_DSP	EQU 1

lissa_data	equ $50000
sine_table	equ $400

		regtop 31

	;; global registers
sinetable	reg 15
blitter		reg 14
tmp4		reg 4
tmp3		reg 3
tmp2		reg 2
tmp1		reg 1
tmp0		reg 0

screen_ptr	reg 99
LR		reg 99
MAIN		reg 99
center_x	reg 99
center_y	reg 99
frame		reg 99


	MACRO WAITBLITTER
.\wait@
	load (blitter+$38),tmp0
	shrq #1,tmp0
	jr cc,.\wait@
//->	nop			; be sure no movei follows!
	ENDM

	RUN $00F035AC		; Start address after decryption. Fix!!!
start:

 IFD MODEL_M
	movei	#$5076,r14
	storew	r3,(r14)	; Disable BIOS double buffering (r3 == 0)
	addq	#2,r14
	movei	#$4e722000,r0	; stop #$2000
	store	r0,(r14+$5098-$5078)
 ELSE
	movei	#$5064,r0
	storew	r3,(r0)		; Disable BIOS double buffering (r3 == 0)
 ENDIF

	movei	#$37120,r0
	store	r4,(r0)		; disable logo object (r4 < 0)

	movei	#$f1a100,r14
	movei	#($1f<<9)|(1<<14)|(1<<17),r4
	store	r3,(r14+$14)	; stop DSP
	store	r4,(r14)	; clear interrupts

	movei	#dsp_code,r0
	movei	#$f1b010,r1
	moveq	#(dsp_code_end-dsp_code)/4,r2
.cpy_dsp:
	load	(r0),r3
	addq	#4,r0
	subq	#1,r2
	store	r3,(r1)
	jr	pl,.cpy_dsp
	addq	#4,r1

	subq	#4+20,r1	; init code at end of DSP code
	store	r1,(r14+$10)
 IFD START_DSP
	moveq	#1,r1
	store	r1,(r14+$14)
 ELSE
	nop
	nop
 ENDIF

VAL_SCLK	equ ((26593900*4/8000+128)>>8)-1

	moveq	#31,r1
	addq	#VAL_SCLK-31,r1
	store	r1,(r14+$50)
	moveq	#%001101,r1
	store	r1,(r14+$54)
;;; ----------------------------------------
;;; setup
;;; ----------------------------------------
	moveq	#sine_table>>8,r15
	shlq	#8,r15
	moveq	#16,r6
	shlq	#3+2+1,r6
	moveq	#0,r2
	bset	#7,r2
	moveq	#0,r3
	moveq	#0,r7
singen:
	subq	#2,r2
	move	r3,r0
	add	r3,r7
	sharq	#1,r7
	store	r7,(r15)
	neg	r0
	neg	r7
	store	r7,(r15+r6)
	addqt	#4,r15
	store	r3,(r15)
	store	r0,(r15+r6)
	move	r3,r7
	add	r2,r3
	jr	ne,singen
	addqt	#4,r15

	;; init screen buffer

	moveq	#$8,screen_ptr
	shlq	#16,screen_ptr

	;;
	;; pre-calc lissajous
	;;

PHASE_A0	equ 10
PHASE_B0	equ 13
PHASE_C0	equ 7

data_table	reg 99
phase_a		reg 99
phase_b		reg 99
phase_c		reg 99
points		reg 99
snd		reg 99
LOOP		reg 99
add_frame	reg 99
start_bar	reg 99
end_bar		reg 99
bar_dec		reg 99

	moveq	#sine_table>>8,sinetable
	shlq	#8,sinetable
	moveq	#0,points
	moveq	#lissa_data>>16,data_table
	bset	#9,points
	shlq	#16,data_table

	move	pc,LOOP
//->	addq	#4,LOOP
.loop
	move	phase_a,r0
	move	pc,LR
	jr	sine
	addqt	#PHASE_A0,phase_a

	move	phase_b,r0
	jr	sine
	addqt	#PHASE_B0,phase_b

	addq	#12+4,LR
	move	phase_c,r0
sine:
	shlq	#23,r0
	shrq	#23-2,r0
	load	(sinetable+r0),r0
	moveq	#3,r1
	imult	r1,r0
	addq	#6,LR
	store	r0,(data_table)
	jump	(LR)
	addq	#4,data_table

	subq	#1,points
	jump	pl,(LOOP)
	addqt	#PHASE_C0,phase_c

	unreg	phase_a,phase_b,phase_c,sinetable,data_table

	;;
	;; main loop init
	;;
data_table	reg 15

	movei	#$f02200,blitter


	moveq	#1,add_frame
	moveq	#0,frame	; not needed, optional

	moveq	#0,end_bar
	bset	#8,end_bar
	move	end_bar,start_bar
	subq	#32,start_bar
	moveq	#2,bar_dec

	;;
	;; main loop
	;;
	move	pc,MAIN
main:
	moveq	#27,tmp0
	shlq	#2,tmp0		; top end to visually bounce bar
	sub	bar_dec,start_bar
	cmp	start_bar,tmp0
	jr	mi,.01
	sub	bar_dec,end_bar
	neg	bar_dec
.01
	moveq	#16,tmp0
	shlq	#5,tmp0
	cmp	start_bar,tmp0	; low end
	jr	ne,.02
	moveq	#$f,r15
	neg	bar_dec
.02
	btst	#9,frame
	moveq	#sine_table>>8,tmp2
	jr	eq,.1
	shlq	#20,r15		; => r15 = $f00000
	neg	add_frame
.1
	shlq	#8,tmp2
wvbl
	load	(r15+4),tmp0	; VC
	bclr	#0,tmp0
	shlq	#16+5,tmp0
	jr	eq,okvbl
	shrq	#16+5,tmp0
	cmp	tmp0,tmp1	; same line?
	jr	eq,wvbl		; yes, no new color
	cmp	end_bar,tmp0
	move	tmp0,tmp1
	jr	pl,wvbl0
	cmp	start_bar,tmp0
	jr	mi,wvbl0
	load	(tmp2),tmp0
	addq	#32,tmp2
	shlq	#16,tmp0
wvbl0
	jr	wvbl
okvbl
	store	tmp0,(r15+$58)

	bset	#18,r0
	movei	#$3720c,r1
	store	screen_ptr,(r1)
	xor	r0,screen_ptr
	store	screen_ptr,(blitter)	;_BLIT_A1_BASE
	moveq	#0,r0

	;; clear screen
	moveq	#$19,tmp1

	store	tmp0,(blitter+_BLIT_A1_PIXEL)
	movei	#BLIT_PITCH1|BLIT_PIXEL32|BLIT_WID3584|BLIT_XADDPHR,r2
	shlq	#12,tmp1
	store	r2,(blitter+_BLIT_A1_FLAGS)
	store	tmp1,(blitter+_BLIT_COUNT)
	store	tmp0,(blitter+_BLIT_CMD)

	WAITBLITTER

	moveq	#0,points
	moveq	#lissa_data>>16,data_table
	bset	#9,points
	shlq	#16,data_table

	moveq	#10,center_x
	moveq	#30,center_y
	shlq	#4,center_x
	shlq	#2,center_y

	move	pc,LOOP
//->	addq	#4,LOOP
.loop2
	load	(data_table),r0
	load	(data_table+4),r4
	load	(data_table+8),r2

	move	r0,r3
	move	r2,r5

	sharq	#8,r2
	sub	r2,r0
	store	r0,(data_table)	; nx = x-z/256

	sharq	#8,r3
	add	r3,r5
	store	r5,(data_table+8) ; nz = z+x/256

	sharq	#7,r0
	sharq	#7,r4

	add	center_x,r0
 	add	center_y,r4

	cmp	frame,points
	movei	#$f0fff0ff,r2
	jr	pl,.2
	shlq	#16,r4
	movei	#$88ff88ff,r2
.2
	store	r2,(blitter+_BLIT_PATD)
	movei	#BLIT_PITCH1|BLIT_PIXEL16|BLIT_WID|BLIT_XADDPIX,tmp1
	or	r0,r4
	store	tmp1,(blitter+_BLIT_A1_FLAGS)
	moveq	#1,tmp2
	store	r4,(blitter+_BLIT_A1_PIXEL)
	bset	#16,tmp2
	store	tmp2,(blitter+_BLIT_COUNT)
	bclr	#0,tmp2		; optional

	subq	#1,points
	store	tmp2,(blitter+_BLIT_CMD)
	jump	pl,(LOOP)
	addqt	#12,data_table

	jump	(MAIN)
	add	add_frame,frame
	align 4
dsp_code:
	ibytes "dsp.bin"
dsp_code_end:
end:
size	set end-start

	regmap

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
