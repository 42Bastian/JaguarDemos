;-*- asm -*-


h_ptr	reg 99
sintab	reg 99
costab	reg 99
x	reg 99
y	reg 99
z	reg 99
max_y	reg 99
h	reg 99
ws	reg 99
LOOPXZ	reg 99
t1	reg 99
t2	reg 99
t3	reg 99
t4	reg 99
mask	reg 99

buildPlane::
	MODULE buildPlane,MODend_irq

	movei	#511<<2,mask
	movei	#sinTab,costab
	move	costab,sintab
	addq	#2,sintab
	moveq	#30,h
	shlq	#2,h
	movei	#_plane_y,h_ptr
	moveq	#0,ws
	bset	#wordsize_bits,ws
	move	ws,z
	move	ws,x
	move	pc,LOOPXZ
	addq	#4,LOOPXZ
.loopxz
	move	x,tmp0
	shlq	#4+2,tmp0
	and	mask,tmp0
	add	sintab,tmp0
	loadw	(tmp0),t1
	imult	h,t1
	sharq	#15,t1

	move	z,tmp1
	shlq	#4+2,tmp1
	and	mask,tmp1
	add	costab,tmp1
	loadw	(tmp1),t2
	imultn	h,t2
	sharq	#15,t2
	move	x,tmp1
	shlq	#3+2,tmp1
	and	mask,tmp1
	loadw	(tmp1),tmp1
	imult	tmp1,t2
	sharq	#15,t2

	move	x,tmp0
	add	z,tmp0
	shlq	#3+2,tmp0
	and	mask,tmp0
	add	sintab,tmp0
	loadw	(tmp0),t3
	imult	h,t3
	sharq	#15,t3

	move	z,tmp1
	shlq	#5+2,tmp1
	and	mask,tmp1
	add	sintab,tmp1
	loadw	(tmp1),t4
	imult	h,t4
	sharq	#15+1,t4

	move	t1,y
	add	t2,y
	add	t3,y
	add	t4,y
	sat8	y
	subq	#1,x
	storeb	y,(h_ptr)
	jump	ne,(LOOPXZ)
	addq	#1,h_ptr
	subq	#1,z
	move	ws,x
	jump	ne,(LOOPXZ)
	nop

	jump	(LR)
	nop


	ENDMODULE buildPlane

	echo "ENDE (buildPlane): %HMODend_buildPlane"
