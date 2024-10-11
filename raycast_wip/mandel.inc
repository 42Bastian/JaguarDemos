;-*-asm-*-
	MODULE mandel,MODend_irq
;;; ----------------------------------------
genau		equ 13
delta0		EQU 165

	;; Register usage
delta		reg 99
XLOOP		reg 99
YLOOP		reg 99
texture_ptr	reg 99
texture_ptr2	reg 99
iter_count	reg 99
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

	moveq	#128/16,y_count
	shlq	#4,y_count

	movei	#delta0,delta

	movei	#MandelTexture,texture_ptr

	movei	#-10564,_i0
	move	pc,YLOOP
	addq	#4,YLOOP
__pc	move	pc,XLOOP
	addq	#xloop-__pc,XLOOP
yloop:
	moveq	#128/16,x_count
	movei	#-16000,_r0
	shlq	#4,x_count
xloop:
	moveq	#15,iter_count
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
	jr	nz,iter_end

	imult	_r,_i
	sharq	#genau,_r1		; normalize
	sharq	#genau-1,_i

	add	_r0,_r1			; temp2 = r^2-i^2+r0

	subq	#1,iter_count
	jr	nz,iter_loop
	add	_i0,_i			; i = 2*i*r+i0

iter_end:
	addq	#16,iter_count
	add	delta,_r0
	subq	#1,x_count
	storeb	iter_count,(texture_ptr)
	jump	nz,(XLOOP)
	addqt	#1,texture_ptr

	subq	#1,y_count
	jump	nz,(YLOOP)
	add	delta,_i0


	movei	#127,y_count

	movei	#XorTexture,texture_ptr
	movei	#Xor2Texture,texture_ptr2

	move	pc,YLOOP
	addq	#4,YLOOP
__pc1	move	pc,XLOOP
	addq	#xloop1-__pc1,XLOOP
yloop1:
	movei	#127,x_count
xloop1:
	move	x_count,tmp0
	move	y_count,tmp1
	shrq	#2,tmp0
	shrq	#2,tmp1
	moveq	#15,tmp2
	xor	tmp1,tmp0
	and	tmp2,tmp0
	addqt	#16,tmp0
	storeb	tmp0,(texture_ptr)
	addqt	#32,tmp0
	addqt	#16,tmp0
	storeb	tmp0,(texture_ptr2)
	subq	#1,x_count
	addqt	#1,texture_ptr2
	jump	pl,(XLOOP)
	addqt	#1,texture_ptr

	subq	#1,y_count
	jump	pl,(YLOOP)
	add	delta,_i0

	jump	(LR)
	nop

	unreg delta,XLOOP,YLOOP,texture_ptr,texture_ptr2
	unreg iter_count,temp1,temp2,x_count,y_count
	unreg _r1,_i1,_r0,_i0,_i,_r
	ENDMODULE mandel
