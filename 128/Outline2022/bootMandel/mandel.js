;;; Mandel128
;;; Mandelbrot set in 128 bytes GPU
;;;

	;; -*-asm-*-
	gpu

BLOCKS	EQU (128/64) 			; max. is 10

	include <js/symbols/jagregeq.js>

genau		equ 13
delta0		EQU 88
r_min0		EQU 9116
i_max0		EQU 12992

	;; Register usage
max_x		reg 26
max_y		reg 25

screen_ptr2	reg 23
base_color	reg 22
delta		reg 21
screen		reg 20
delta2		reg 19
XLOOP		reg 18
YLOOP		reg 17
ITER_LOOP	reg 16
screen_ptr	reg 14
r_max		reg 13
iter_count	reg 12
color		reg 11
temp1		reg 10
temp2		reg  9
x_count		reg  8
y_count		reg  7
_r1		reg  6
_i1		reg  5
_i0		reg  4
_r0		reg  3
_i		reg  2
_r		reg  1
pixel		reg  0

	;; BootROM sets up two screen buffers
screen	equ $100000
screen2 equ $125800

	RUN $00F035AC
start:
	;; recording delay
wait:	subq	#4,r0
	jr	ne,wait

	moveq	#15,base_color
	shlq	#12,base_color

	moveq	#240/16,y_count
	shlq	#4,y_count

	moveq	#delta0/4,delta
	shlq	#2,delta

	moveq	#screen>>16,screen_ptr
	shlq	#16,screen_ptr
	movei	#screen2-screen,screen_ptr2

	moveq	#31,r_max
	shlq	#8,r_max

	movei	#220*delta0/2,_i0

yloop:
	move	pc,YLOOP

	moveq	#320/16,x_count
	shlq	#4,x_count
	move	r_max,_r0
xloop:
	move	pc,XLOOP
	move	delta,iter_count
	move	base_color,color
	move	_r0,_r
	move	_r0,_r1
	move	_i0,_i
	move	_i0,_i1
iter_loop
	move	pc,ITER_LOOP
	imult	_r1,_r1			; r^2
	imult	_i1,_i1			; i^2

	move	_r1,temp1
	move	_r1,temp2
	add	_i1,temp1		; r^2+i^2
	sub	_i1,temp2		; r^2-i^2
	shrq	#2*genau+2,temp1
	addqt	#4,color
	jr	nz,iter_end

	imult	_r,_i
	sharq	#genau,temp2		; normalize
	sharq	#genau-1,_i

	add	_r0,temp2		; temp2 = r^2-i^2+r0
	add	_i0,_i			; i = 2*i*r+i0

	move	temp2,_r
	subq	#1,iter_count
	move	_i,_i1
	jump	nz,(ITER_LOOP)
	move	temp2,_r1

	moveq	#1,color
iter_end:
	sub	delta,_r0
	btst	#0,x_count
	jr	ne,no
	or	color,pixel

	store	pixel,(screen_ptr)
	store	pixel,(screen_ptr+screen_ptr2)
	addq	#4,screen_ptr
no:
	subq	#1,x_count
	jump	nz,(XLOOP)
	shlq	#16,pixel

	subq	#1,y_count
	jump	nz,(YLOOP)
	sub	delta,_i0

theend:
	jr	theend
	;; The End
//->	movei	#$f02114,r0
//->	store	y_count,(r0)

	;; GPU RAM cleared by ROM,

end:
size	equ end-start
free	equ 128-size

	echo "Size:%dsize  Free:%dfree"
   IF ((BLOCKS*64)-size) > 0
	REPT (BLOCKS*64)-size
	dc.b $42
	ENDR
   ELSE
     if (BLOCKS*64)-size != 0
	REPT ((BLOCKS+1)*64)-size
	dc.b $42
	ENDR
     ENDIF
   ENDIF
 END
