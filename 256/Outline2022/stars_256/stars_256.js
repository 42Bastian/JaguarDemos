;; -*-asm-*-
;;; BootStarField
;;; 256x256 4864 stars, 50FPS
;;; 256x224 4096 stars, 60FPS
;;;
;;; Model M:
;;; 188 Byte GPU Intro code, 36 bytes 68k, 32 bytes GPU patch code
;;;
	gpu

WANTED_SIZE	SET 256
BLOCKS		SET (WANTED_SIZE/64)		; max. is 10

 IFD MODEL_M
OBL	EQU $36fe0 		; DEBUG
 ELSE
OBL	EQU $37000
 ENDIF

OBL_UPDATE_M	EQU $4804
OBL_UPDATE_K    EQU $58f8

 IFD MODEL_M
 IFD DEBUG
STUB_SIZE	EQU 56
 ELSE
STUB_SIZE	EQU 36
 ENDIF
 ELSE
STUB_SIZE	EQU 16
 ENDIF

screen	EQU $100000

	include <js/symbols/jagregeq.js>
	include <js\symbols\blit_eq.js>

MACRO WAITBLITTER
.\wait@	load (blitter+$38),r0
	shrq #1,r0
	jr cc,.\wait@
	nop
ENDM

	RUN $00F035AC
start:
	;; patch OBL update
 IFD MODEL_M
	movei	#OBL_UPDATE_M-_68k_e+STUB_SIZE,r1
	moveq	#STUB_SIZE/4,r13
patch:
	load	(r14),r3
	subq	#1,r13
	store	r3,(r14+r1)
	jr	ne,patch
	subqt	#4,r14

	movei	#$4e722000,r0	; stop #$2000
	movei	#$5098,r1
	store	r0,(r1)

 ELSE
	moveq	#4,r0
	store	r0,(r14+8)	; write stop-object
	movei	#OBL_UPDATE_K,r0
	moveq	#_68k_e-_68k-4,r1
	sub	r1,r14
	store	r14,(r0)	; patch OBL0
 ENDIF
patche:

screen_ptr	reg 29
rnd		reg 28
count		reg 27
mask		reg 26
LOOP		reg 20
INNER		reg 19
SKIP		reg 18
INIT		reg 17
blitter		reg 15
stars_db	reg 14
CLEAR		reg 13
center		reg 12
base_color	reg 11
obl		reg 10
blitcount	reg  9

	moveq	#16,center
	shlq	#3,center
 IFD DEBUG
	move	pc,rnd		; only needed for vj
 ENDIF
 IFD TIMING
	movei	#$f00058,r21
 ENDIF
	moveq	#screen>>16,screen_ptr
	shlq	#16,screen_ptr
	movei	#OBL,obl
	movei	#skip,SKIP
	movei	#$f02200,blitter
	movei	#BLIT_PITCH1|BLIT_PIXEL32|BLIT_WID3584|BLIT_XADDPHR,r0
	store	r0,(blitter+_BLIT_A1_FLAGS)
	store	screen_ptr,(blitter)	;_BLIT_A1_BASE
 IFD _PAL
	movei	#(1<<16)|(256*256/2),blitcount
 ELSE
	movei	#(1<<16)|(256*224/2),blitcount
 ENDIF
loop:
	move	pc,LOOP
	moveq	#0,mask
wvbl:
	load	(r10),stars_db		; get bits 63..32 from BM object
	shrq	#8,stars_db		; make it an address
	cmp	screen_ptr,stars_db	; OP done with it?
	jr	ne,wvbl
 IFD _PAL
	moveq	#19,count		; jump-slot filling
 ELSE
	moveq	#16,count		; jump-slot filling
 ENDIF

 IFD TIMING
	storew	r21,(r21)
 ENDIF
	;; clear screen
	store	mask,(blitter+_BLIT_A1_PIXEL)
	store	blitcount,(blitter+_BLIT_COUNT)
	store	mask,(blitter+_BLIT_CMD)

//->	WAITBLITTER

	subq	#1,mask
 IFD TIMING
	storew	mask,(r21)
 ENDIF
	shrq	#24,mask	; mask = 255
	movei	#$8800,base_color
	shlq	#8,count
inner:
	move	pc,INNER
	moveq	#init-inner,INIT
	add	INNER,INIT
	load	(stars_db),r2	; z
	subqt	#8,stars_db
	subq	#1,r2
	load	(stars_db+12),r0 ; x
	jump	pl,(SKIP)
	load	(stars_db+16),r1	; y
init:
	;; random
	move	rnd,r4
	rorq	#7,r4
	xor	rnd,r4
	move	r4,rnd
	shlq	#9,r4
	xor	r4,rnd
	;;
	move	rnd,r0
	move	rnd,r1
	shlq	#24,r0
	shlq	#16,r1
	sharq	#21-4,r0
	sharq	#21-4,r1
	store	r0,(stars_db+12)
	store	r1,(stars_db+16)
	move	rnd,r2
	sat8	r2
	add	mask,r2
skip:
	abs	r0
	jr	cc,_plx
	moveq	#1,r4
	subqt	#2,r4
_plx:
	div	r2,r0

	abs	r1
	jr	cc,_ply
	moveq	#1,r5
	subqt	#2,r5
_ply:
	imult	r4,r0

	div	r2,r1

	add	center,r0
	store	r2,(stars_db+8)

	jump	mi,(INIT)
	cmp	mask,r0
	jump	gt,(INIT)
	sat8	r2
	imult	r5,r1
	xor	mask,r2
	add	center,r1
	jump	mi,(INIT)
	shlq	#8,r1

	or	base_color,r2

	add	r1,r0
	shlq	#1,r0
	add	screen_ptr,r0
	subq	#1,count
	storew	r2,(r0)
	jump	ne,(INNER)
	subqt	#8,stars_db

	jump	(LOOP)
 IFD TIMING
	storew	count,(r21)
 ENDIF
	;; GPU RAM cleared by ROM,

	;; 68k code must be long aligned
	.long
end:

size	set end-start
intro	set end-patche

free	set WANTED_SIZE-size-STUB_SIZE
free0	set free

	IF free < 0
WANTED_SIZE	SET WANTED_SIZE+64
BLOCKS		SET BLOCKS+1
free		set free+64
	ENDIF
	if free > 0
	REPT	WANTED_SIZE-size-STUB_SIZE
	dc.b	$42
	ENDR
	endif
_68k:
	.incbin "irqstub.img"
_68k_e:
	IF (_68k_e - _68k) <> STUB_SIZE
	echo "irqstub size changed, fix copy routine:%d_xx"
	ENDIF

patch_size	equ (patche-start)+(_68k_e-_68k)
	echo "GPU Size:%dintro | (68k+patch) size: %dpatch_size | Free:%dfree0"
	echo "%dWANTED_SIZE"
