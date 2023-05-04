	;; -*-asm-*-
	gpu

WANTED_SIZE	SET 256
BLOCKS		SET (WANTED_SIZE/64)		; max. is 10

 IFD DEBUG
OBL	EQU $36fe0 		; DEBUG
 ELSE
OBL	EQU $37000
 ENDIF

 IFD MODEL_M
STUB_SIZE	EQU 28
 ELSE
STUB_SIZE	EQU 16
 ENDIF

//->TIMING	EQU 0

	include <js/symbols/jagregeq.js>

OBL_UPDATE_M	EQU $4804
OBL_UPDATE_K    EQU $58f2

	;; ROM sets this mode
ScreenMode	EQU CRY16|VIDEN|PWIDTH4|BGEN|CSYNC

screen		EQU $1d0000

obl		reg 31
LOOP		reg 30
loopy		reg 29
loopx		reg 28
screen_ptr	reg 27
screen_end	reg 26
bg_col		reg 25
base_color	reg 21
dac		reg 20
counter		reg 19
last_dac	reg 18
SKIP		reg 17
sinus_table	reg 14

	RUN $00F035AC
start:
//->	jr	start
//->	nop
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
	;; Copy sinus table from DSP
	move	r14,r0
	movei	#$f1d200,r1
	bset	#7,r13
	move	r13,r12
cpy:
	load	(r1),r3
	addqt	#4,r1
	subq	#1,r13
	store	r3,(r0)
	jr	ne,cpy
	addq	#4,r0
	movei	#$f10000,r1
	movei	#(3324<<16)|$ffff,r0
	store	r0,(r1)			// 8kHz
	movei	#$f1a148,dac
	movei	#$f10038,counter
	movei	#skip,SKIP
 IFD TIMING
	movei   #OBL,obl
	movei	#$f00058,bg_col
 ENDIF
	bset	#5,r13		// = 32
	move	pc,LOOP
loop:
	moveq	#screen>>16,screen_ptr
	shlq	#16,screen_ptr
 IFD TIMING
	storew	r6,(bg_col)
wvbl:	load	(obl),r1
	shrq	#8,r1
	cmp	r1,screen_ptr
	jr	ne,wvbl
	nop
	storew	bg_col,(bg_col)
 ENDIF
	moveq	#240/16,r2
	move	pc,loopy
	shlq	#4,r2
	addq	#6,loopy
ly:
	moveq	#320/16,r3
	move	pc,loopx
	shlq	#4,r3
	addq	#6,loopx
lx:
	move	r2,r4
	move	r3,r5
	shlq	#25,r4
	add	r13,r5		; +32 => cosinus
	shrq	#23,r4
	shlq	#25,r5
	load	(r14+r4),r4
	shrq	#23,r5
	load	(r14+r5),r5
	add	r5,r4

	move	r6,r5
	move	r6,r8
	add	r2,r5
	add	r3,r8
	shlq	#24,r5
	shlq	#24,r8
	shrq	#23,r5
	shrq	#23,r8
	load	(r14+r5),r5
	load	(r14+r8),r8
	add	r5,r4
	add	r8,r4
;;; ----------------------------------------
q	REG 5

	loadw	(counter),q
	cmp	q,r9
	jump	eq,(SKIP)
	nop
	move	q,r9
	shrq	#1,q		; r5 = q

	moveq	#8,r8
	and	q,r8

	moveq	#15,r7
	shrq	#8,q
	and	r6,r7
	mult	r7,r8
//->	shlq	#3,r8

//->	moveq	#7,r7
//->	and	r6,r7
//->	shlq	#5,r7
//->	and	q,r7
//->	jr	ne,xxx
//->	nop
//->	shlq	#3,r8
//->xxx:
//->	btst	#3,q
//->	jr	eq,yyy
//->	shrq	#2,q
//->	or	q,r8
//->yyy:
	shlq	#20,r9
	jr	nz,x1
	shlq	#10,r8
	sat16	r8
x1:
	move	r8,r18
skip:
	store	r18,(dac)
	addq	#4,dac
	store	r18,(dac)
	subq	#4,dac
;;; ----------------------------------------

	shlq	#32-11-8,r4
	shrq	#11+10,r4

	btst	#0,r2
	jr	ne,odd
	bset	#15,r4
	rorq	#16,r4
odd:
	subq	#2,r3
	store	r4,(screen_ptr)
	jump	nz,(loopx)
	addqt	#4,screen_ptr

	subq	#1,r2
	jump	ne,(loopy)
	nop
	jump	(LOOP)
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
	echo "%dWANTED_SIZE"

 END
