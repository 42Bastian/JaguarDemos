;;; -*-asm-*-
	.text
	.68000
	.org	$802000

	moveq	#4,d0
	move.l	d0,4.w
	moveq	#0,d0
	move.l	d0,$f00020	; move STOP object to 0

	lea	gpu_code(pc),a0
	lea	$f03000,a1
	lea	$f02100,a2

	move.l	#1<<14|$1f<<9|1,$(a2)
	move.l	a1,$10(a2)

	move.w	#(gpu_code_e-gpu_code)/4+2,d0 ; copy depack code
l1:
	move.l	(a0)+,(a1)+
	dbra	d0,l1

	moveq	#1,d0
	move.l	d0,$14(a2)	; start GPU
	stop	#$2700		; and stop 68k for ever
	long
gpu_code:
	.gpu

	org	$f03000
	movei	#end_gpu,r14	; hack: rmac cannot resolve 68k lables!
	load	(r14),r14	; get source address
	load	(r14),r21	; get destination address
	move	r21,r30
	load	(r14+1),r0	; get lenght in bytes
	addq	#8,r14
 IF LZ4 = 0
copy:	load	(r14),r1
	addq	#4,r14
	subq	#4,r0
	store	r1,(r21)
	jr	pl,copy
	addq	#4,r21
	jump	(r30)
	nop
 ELSE
	move	r14,r20
	move	r21,r30
	sat8	r14		; => $FF

; input:
;;; R20 : packed buffer
;;; R21 : output buffer
;;; r14 : $ff
;;; R0  : LZ4 packed block size (in bytes)
;;; r30 : return address
;;;
;;; Register usage (destroyed!)
;;; r1,r2,r11,r12,r13
;;;
;;; R1,R2     : temp register
;;; r11       : jump destination
;;; r13       : end of packed data

depack_lz4::
	move	R20,R13
	add	R0,R13		; packed buffer end
dpklz4_tokenLoop:
	move	pc,r11
	loadb	(R20),R0
	addqt	#1,R20
	moveq	#15,r1
	and	r0,r1
	shrq	#4,R0
	jr	eq,skip1
	cmpq	#15,R0
dpklz4_readLen1:
	loadb	(R20),R2
	jr	ne,dpklz4_litcopy
	addqt	#1,R20
	add	R2,R0
	jr	dpklz4_readLen1:
	cmp	R14,R2		; r2 = $ff ?

dpklz4_litcopy1:
	addqt	#1,R20
dpklz4_litcopy:
	subq	#1,R0
	storeb	R2,(R21)
	addqt	#1,R21
	jr	ne,dpklz4_litcopy1
skip1:
	loadb	(R20),R2

	; end test is always done just after literals
	cmp	R20,R13
	jump	eq,(r30)	; done? => return
	addqt	#1,R20
	loadb	(R20),R0
	addqt	#1,R20
	shlq	#8,R0
	add	R2,R0
	neg	r0
	cmpq	#15,r1
	addqt	#4,r1		; minimum match count: 4
	jr	ne,dpklz4_copy
	add	r21,r0		; source = dest - offset
dpklz4_readLoop2:
	loadb	(r20),r2
	add	R2,R1
	cmp	R14,R2		; r2 = $ff ?
	jr	eq,dpklz4_readLoop2
	addqt	#1,R20

dpklz4_copy:
	move	r0,r2
	xor	r21,r2
	btst	#0,r2
	loadb	(R0),R2
	jr	eq,copyloop2a
	btst	#0,r0

copyloop1:
	addq	#1,R0
	subq	#1,R1
	storeb	R2,(R21)
	addqt	#1,R21
	jr	ne,copyloop1
	loadb	(R0),R2

	jump	(R11)
	nop

copyloop2a:
	jr	eq,copyloop2
	nop
	addqt	#1,r0
	subq	#1,r1
	storeb	r2,(r21)
	addq	#1,r21
copyloop2:
	loadw	(r0),r2
	subq	#2,r1
	storew	r2,(r21)
	jump	eq,(r11)
	addqt	#2,r21
	jr	pl,copyloop2
	addqt	#2,r0

	jump	(r11)
	subq	#1,r21		; compensate last write
 ENDIF
	long
end_gpu:
	.68000
	long
gpu_code_e:
source:	.dc.l	__data

	include "polygon.equ"
__data:
	dc.l start
	dc.l datae-data
data:
 IF LZ4 = 0
	incbin	"polygon.bin"
 ELSE
	incbin	"polygon.bin.lz4",,8
 ENDIF
datae:
