	;; -*-asm-*-
	gpu

WANTED_SIZE	SET 256
BLOCKS		SET (WANTED_SIZE/64)		; max. is 10

 IFD MODEL_M
OBL	EQU $36fe0 		; DEBUG
 ELSE
OBL	EQU $37000
 ENDIF

 IFD MODEL_M
   IFD DEBUG
STUB_SIZE	EQU 32
   ELSE
STUB_SIZE	EQU 28
  ENDIF
 ELSE
STUB_SIZE	EQU 16
 ENDIF

OBL_UPDATE_M	EQU $4804
OBL_UPDATE_K    EQU $58f2

//->TIMING	EQU 0

	include <js/symbols/jagregeq.js>
	include <js\symbols\blit_eq.js>

	;; ROM sets this mode
ScreenMode	EQU CRY16|VIDEN|PWIDTH4|BGEN|CSYNC

screen		EQU $1d0000

bg_col		reg 31
main		reg 30
loopy		reg 29
loopx		reg 28
screen_ptr	reg 27
blit_size	reg 26
buffer1		reg 24
buffer0		reg 23
base_color	reg 21
blitter		reg 14
cur_buffer	reg 13
width		reg 12
obl		reg 11

	RUN $00F035AC
start:
	;; patch OBL update
	;; patch OBL update
 IFD MODEL_M
	;; expect r13 = $13 when started by BIOS
	movei	#OBL_UPDATE_M-(start+WANTED_SIZE)+STUB_SIZE,r1
patch:
	load	(r14),r3
	subq	#3,r13
	store	r3,(r14+r1)
	jr	ne,patch
	subqt	#4,r14
 ELSE
	moveq	#4,r0
	store	r0,(r14+8)	; write stop-object
	movei	#OBL_UPDATE_K,r0
	moveq	#_68k_e-_68k-4,r1
	sub	r1,r14
	store	r14,(r0)	; patch OBL0
 ENDIF
patche:
	movei	#$f02200,blitter
	moveq	#640/64,width
	movei	#$f03000,buffer0
	shlq	#6,width
	move	buffer0,buffer1
	move	width,blit_size
	add	width,buffer1
	bset	#16,blit_size
	movei	#OBL,obl
 IFD TIMING
	movei	#$f00058,bg_col
 ENDIF
	movei	#BLIT_PITCH1|BLIT_PIXEL8|BLIT_WID3584|BLIT_XADDPHR,r0
	store	r0,(blitter+_BLIT_A1_FLAGS)
	store	r0,(blitter+_BLIT_A2_FLAGS)

	move	pc,main
	addq	#4,main
loop:

 IFD TIMING
	storew	buffer0,(bg_col)
 ENDIF
	moveq	#screen>>16,screen_ptr
	shlq	#16,screen_ptr
wvbl:	load	(obl),r1
	shrq	#8,r1
	cmp	r1,screen_ptr
	jr	ne,wvbl
	moveq	#272/16,r2
 IFD TIMING
	storew	bg_col,(bg_col)
 ENDIF
	shlq	#4,r2
	move	pc,loopy
	moveq	#320/16,r3
	addq	#6,loopy
ly:
	shlq	#4,r3
	move	r2,r10
	add	r6,r10

	move	pc,loopx
	move	buffer0,cur_buffer
	addq	#6,loopx
lx:
	move	r3,r5
	move	r10,r4
	move	r10,r9
	add	r6,r5
	xor	r3,r4
	move	r5,r7
	subq	#2,r3
	xor	r2,r5
	xor	r3,r9
	shlq	#8,r5
	subq	#2,r7
	or	r4,r5
	xor	r2,r7
	move	r5,r4
	shlq	#8,r7
	shlq	#16,r4
	or	r9,r7
	or	r5,r4
	move	r7,r8
	store	r4,(cur_buffer)
	shlq	#16,r8
	addqt	#4,cur_buffer
	or	r7,r8
	subq	#2,r3
	store	r8,(cur_buffer)
	jump	nz,(loopx)
	addqt	#4,cur_buffer

	store	screen_ptr,(blitter)	;_BLIT_A1_BASE
	store	buffer0,(blitter+_BLIT_A2_BASE)
	movei	#BLIT_SRCEN|BLIT_LFU_REPLACE,r1
	store	r3,(blitter+_BLIT_A1_PIXEL)
	add	width,screen_ptr
	store	r3,(blitter+_BLIT_A2_PIXEL)
	store	blit_size,(blitter+_BLIT_COUNT)
	store	r1,(blitter+_BLIT_CMD)

	;; swap write buffer
	xor	buffer0,buffer1
	xor	buffer1,buffer0
	xor	buffer0,buffer1

	subq	#1,r2
	jump	ne,(loopy)
	moveq	#320/16,r3

	jump	(main)
	addq	#2,r6

	;; GPU RAM cleared by ROM,
	.long			; 68k code must be long aligned
end:
size	set end-start

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
_xx	equ (_68k_e - _68k)
	IF (_68k_e - _68k) <> STUB_SIZE
	echo "irqstub size changed, fix copy routine:%d_xx %dSTUB_SIZE"
	ENDIF

patch_size	equ (patche-start)+(_68k_e-_68k)
	echo "GPU Size:%dsize | 68k+patcher size: %dpatch_size | Free:%dfree0"
	echo "%dWANTED_SIZE Last: %x_68k_e"

 END
