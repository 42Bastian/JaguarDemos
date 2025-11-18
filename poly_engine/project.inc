;-*-asm-*-
****************
* 3D->2D
*          (x'+x_pos)*256
* x_proj = ---------------
*           z'+z_pos
*
*          (y'+y_pos)*256
* y_proj = ---------------
*           z'+z_pos
****************
m_ptr		reg 14


m_cnt		reg 99
x1		reg 99
y1		reg 99
z1		reg 99
x2		reg 99
y2		reg 99
z2		reg 99
xcenter		REG 99
ycenter		REG 99
proj_ptr	reg 99
LOOP		reg 99
mask		reg 99


PROJ_REZ	equ 15

project_object::
	load	(curr_object+obj_rotated),m_ptr
	load	(m_ptr),m_cnt
	addq	#4,m_ptr
	movei	#(max_x>>1),xcenter
	movei	#(max_y>>1),ycenter

	load	(m_ptr),x1
	load	(m_ptr+4),y1
	load	(m_ptr+8),z1
	load	(curr_object+obj_projected),proj_ptr
	move	pc,LOOP
	movei	#$0000ffff,mask
	addq	#4+6,LOOP
.loop
	addqt	#16,m_ptr
	cmpq	#1,z1
	movei	#1<<PROJ_REZ,tmp0
	jr	pl,.ok_z
	store	z1,(proj_ptr)	; save original Z
	moveq	#1,z1
.ok_z
	div	z1,tmp0
	addqt	#4,proj_ptr
	neg	y1
	load	(m_ptr),x2
	load	(m_ptr+4),y2
	load	(m_ptr+8),z2

 IF max_x = 384
	imult	tmp0,y1
	imult	tmp0,x1
	sharq	#7,y1
	sharq	#7,x1
	add	ycenter,y1
	add	xcenter,x1
	and	mask,y1
	shlq	#16,x1
	move	z2,z1
 ELSE
 IF max_x = 320
	imult	tmp0,x1
	moveq	#21,tmp1
	imult	tmp0,y1
	sharq	#7,x1
	sharq	#7,y1
	imult	tmp1,x1
	add	ycenter,y1
	sharq	#5,x1
	and	mask,y1
	add	xcenter,x1
	move	z2,z1
	shlq	#16,x1
 ELSE
	imult	tmp0,x1
	moveq	#21,tmp1
	imult	tmp0,y1
	sharq	#7,x1
	sharq	#7,y1
	imult	tmp1,x1
	add	ycenter,y1
	sharq	#4,x1
	and	mask,y1
	add	xcenter,x1
	move	z2,z1
	shlq	#16,x1
 ENDIF
 ENDIF
	or	x1,y1
	move	x2,x1
	store	y1,(proj_ptr)	; save Xscreen/Yscreen
	subq	#1,m_cnt
	move	y2,y1
	jump	nz,(LOOP)
	addqt	#4,proj_ptr

	jump	(LR)
	nop

	UNREG m_cnt,m_ptr,LOOP
	UNREG xcenter,ycenter
	UNREG x1,y1,z1
	UNREG x2,y2,z2
	UNREG proj_ptr,mask
