;; -*-asm-*-
;;; JagRoto512
;;; Boot-intro Rotozoomer with 3 different textures
;;; 8 Bytes free

	gpu

WANTED_SIZE	SET (512)
BLOCKS		SET (WANTED_SIZE/64)		; max. is 10 (640 bytes)

 IFD MODEL_M
OBL	EQU $36fe0 		; DEBUG
 ELSE
OBL	EQU $37000
 ENDIF

OBL_UPDATE_M	EQU $4804
OBL_UPDATE_K    EQU $58f8

 IFD MODEL_M
 IFD DEBUG
STUB_SIZE	EQU 40
 ELSE
STUB_SIZE	EQU 36
 ENDIF
 ELSE
STUB_SIZE	EQU 16
 ENDIF

	include <js/symbols/jagregeq.js>
	include <js/symbols/blit_eq.js>
	include <js/macro/help.mac>

	;; free unused registers
	unreg SP, LR, SP.a, LR.a

	;; start register pool from top (no interrupts)
	regtop 31

	;; DSP sinus table
sin_tab		equ $f1d200

	;; place of the Jaguar picture in boot-ROM
 IFD MODEL_M
jaguar_pic	equ $e07110 // 64*64*CRY
 ELSE
jaguar_pic	equ $e06b80
 ENDIF

	;; RAM copies of the textures
JagTexture	equ $20000
MandleTexture	equ $80000

	;; resolution
scr_max_x	equ 224
scr_max_y	equ 224

	if scr_max_y <> scr_max_x
	error "x != y"
	endif

screen		EQU $100000

	;; That's where ROM does entrypt the load to
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

	;; patch a "stop #$2000", here not needed
//->	movei	#$4e722000,r0	; stop #$2000
//->	movei	#$509e,r1
//->	store	r0,(r1)
 ELSE
	echo "MODEL K"
	moveq	#4,r0
	store	r0,(r14+8)	; write stop-object
	movei	#OBL_UPDATE_K,r0
	moveq	#_68k_e-_68k-4,r1
	sub	r1,r14
	store	r14,(r0)	; patch OBL0

 ENDIF
patche:
	;; switch to 8 bit ROM for the Jaguar picture
	moveq	#15,r0
	shlq	#20,r0
	movei	#$1861,r1
	storew	r1,(r0)

        movei   #jaguar_pic,r0
	moveq	#JagTexture>>16,r1
	shlq	#16,r1
	moveq	#1,r2
	shlq	#10,r2
cp:	loadp	(r0),r3
	addqt	#8,r0
	subq	#1,r2
	storep	r3,(r1)
	jr	ne,cp
	addqt	#8,r1

;;; ----------------------------------------
genau		equ 13
delta0		EQU 88

	;; Register usage
delta		reg 99
XLOOP		reg 99
YLOOP		reg 99
screen_ptr	reg 99
iter_count	reg 99
color		reg 99
temp1		reg 99
temp2		reg 99
x_count		reg 99
y_count		reg 99
_r1		reg 99
_i1		reg 99
_i0		reg 99
_r0		reg 99
_i		reg 99
_r		reg 99

	moveq	#256/16,y_count
	shlq	#4,y_count

	moveq	#delta0/4,delta
	shlq	#2,delta

	moveq	#MandleTexture>>16,screen_ptr
	shlq	#16,screen_ptr

	movei	#230*delta0/2,_i0
yloop:
	move	pc,YLOOP

	moveq	#256/16,x_count
	shlq	#4,x_count

	moveq	#31,_r0
	shlq	#8,_r0
xloop:
	move	pc,XLOOP
	move	delta,iter_count
	moveq	#$F,color
	shlq	#12,color
	move	_r0,_r1
	move	_i0,_i
iter_loop
	move	_r1,_r
	move	_i,_i1
	imult	_r1,_r1			; r^2
	imult	_i1,_i1			; i^2

	move	_r1,temp1
	sub	_i1,_r1			; r^2-i^2
	add	_i1,temp1		; r^2+i^2
	shrq	#2*genau+2,temp1
	addqt	#8,color
	jr	nz,iter_end

	imult	_r,_i
	sharq	#genau,_r1		; normalize
	sharq	#genau-1,_i

	add	_r0,_r1			; temp2 = r^2-i^2+r0

	subq	#1,iter_count
	jr	nz,iter_loop
	add	_i0,_i			; i = 2*i*r+i0

	moveq	#1,color
iter_end:
	storew	color,(screen_ptr)
	subq	#1,x_count
	addqt	#2,screen_ptr
	jump	nz,(XLOOP)
	sub	delta,_r0

	subq	#1,y_count
	jump	nz,(YLOOP)
	sub	delta,_i0

	unreg delta,XLOOP,YLOOP,screen_ptr
	unreg iter_count,color,temp1,temp2,x_count,y_count
	unreg _r1,_i1,_r0,_i0,_i,_r
;; ----------------------------------------

sintab		reg 15
blitter		reg 14

timer		reg 99
main		reg 99
loopy		reg 99
loopx		reg 99
screen_ptr	reg 99
blit_size	reg 99
buffer1		reg 99
buffer0		reg 99
cur_buffer	reg 99
width		reg 99
obl		reg 99
y		reg 99
x		reg 99
u		reg 99
v		reg 99
si		reg 99
co		reg 99
u0		reg 99
v0		reg 99
pixel		reg 99
rscale		reg 99
dscale		reg 99
XOR_TXT		reg 99
pattern		reg 99
last		reg 99

	regmap

	movei	#$f02200,blitter
	movei	#sin_tab,sintab
	movei	#$f03000,buffer0
	moveq	#448/32,width
	shlq	#5,width
	move	buffer0,buffer1
	move	width,blit_size
	add	width,buffer1
	bset	#16,blit_size
	movei	#OBL,obl
	movei	#.xor,XOR_TXT

	movei	#BLIT_PITCH1|BLIT_PIXEL8|BLIT_WID3584|BLIT_XADDPHR,r0
	store	r0,(blitter+_BLIT_A1_FLAGS)
	store	r0,(blitter+_BLIT_A2_FLAGS)

	moveq	#1,rscale
	moveq	#1,dscale
	moveq	#0,timer
	moveq	#0,pattern
	move	pc,main
loop:
	movei	#$f00058,r0
	moveq	#0,r2
	storew	r2,(r0)		;clear border (ROM sets to red after a while)
 IFD MODEL_M
	;; double buffering
	movei	#$481c,r0
	load	(r0),r1
	bset	#25,r2
	move	r1,screen_ptr
	shrq	#8,screen_ptr
	xor	r2,r1
	store	r1,(r0)
 ELSE
	moveq	#screen>>16,screen_ptr
	shlq	#16,screen_ptr
 ENDIF

	moveq	#scr_max_y/16,y
	shlq	#4,y

	;; first two patterns are XOR (generated), first right, second left
	;; turning
	cmpq	#0,pattern
	move	timer,r0
	jr	ne,.1
	addq	#1,timer
	subq	#4,timer
.1

	;; +32 for cosine
	moveq	#1,r1
	shlq	#5,r1
	add	r0,r1

	;; limit to 128 entries
	shlq	#25,r0
	shlq	#25,r1
	shrq	#25-2,r0
	shrq	#25-2,r1

	load	(sintab+r1),co
	load	(sintab+r0),si
	imult	rscale,co
	imult	rscale,si
	sharq	#3+8,co
	sharq	#3+8,si

	;; center
	moveq	#scr_max_y/8,u
	shlq	#2,u		; 112
	move	u,r0
	neg	u
	imult	si,r0		; r0 = 112*si
	imult	co,u		; u  = -112*co
	move	u,v		; v  = -112*co
	add	r0,u		; u  = -112*co+112*si
	sub	r0,v		; v  = -112*co-112*si

	moveq	#scr_max_x/16,x
	move	pc,loopy
	addq	#4,loopy
ly:
	shlq	#4,x

	move	u,u0
	move	v,v0

	moveq	#0,last
	move	buffer0,cur_buffer
	move	pc,loopx
	addq	#4,loopx
lx:
	move	u0,r0
	move	v0,r1
	sharq	#8,r0
	cmpq	#2,pattern
	jump	mi,(XOR_TXT)
	sharq	#8,r1

	;; textures are 256x256 or 64x64
	moveq	#24,r3
	cmpq	#2,pattern
	moveq	#8,r4
	jr	eq,.mandeltx
	moveq	#MandleTexture>>16,r2
	addq	#2,r3
	subq	#2,r4
	moveq	#JagTexture>>16,r2
.mandeltx
	neg	r3
	neg	r4
        sh	r3,r0
        sh	r3,r1
	neg	r3
        sh	r3,r0
        sh	r3,r1
        sh	r4,r0
        add     r0,r1

	shlq	#16,r2
        shlq    #1,r1
        add     r1,r2
	move	last,r1
	jr	.ok
        loadw   (r2),last	; DRAM is slow, so wait one round
.xor
	bclr	#4,r0
	bclr	#2,r1
	xor	r0,r1
	shlq	#24,r1
	shrq	#23,r1
	bset	#15,r1
.ok
	add	co,u0
	add	si,v0

	btst	#0,x
	jr	eq,even
	or	r1,pixel
	store	pixel,(cur_buffer)
	addq	#4,cur_buffer
even
	subq	#1,x
	jump	nz,(loopx)
	shlq	#16,pixel

	;; write one line to screen memory

	store	screen_ptr,(blitter)	;_BLIT_A1_BASE
	store	buffer0,(blitter+_BLIT_A2_BASE)
	movei	#BLIT_SRCEN|BLIT_LFU_REPLACE,r1
	store	x,(blitter+_BLIT_A1_PIXEL)
	add	width,screen_ptr
	store	x,(blitter+_BLIT_A2_PIXEL)
	store	blit_size,(blitter+_BLIT_COUNT)
	store	r1,(blitter+_BLIT_CMD)

	;; next line
	sub	si,u
	add	co,v

	;; swap write buffer
	xor	buffer0,buffer1
	xor	buffer1,buffer0

	subq	#1,y
	moveq	#scr_max_x/16,x
	jump	ne,(loopy)
	xor	buffer0,buffer1

	add	dscale,rscale
	jr	ne,.nozero
	btst	#6,rscale
	addqt	#1,rscale
	addq	#1,pattern
	shlq	#30,pattern
	shrq	#30,pattern
	jump	(main)
	neg	dscale
.nozero
	jump	eq,(main)
	nop
	jump	(main)
	neg	dscale

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
