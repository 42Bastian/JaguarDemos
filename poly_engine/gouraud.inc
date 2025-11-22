;-*-asm-*-
 IF GOURAUD = 1
****************
* gouraud lightning
*
vn_ptr		reg 14

g_ptr		reg 99
p_cnt		reg 99
v_ptr		reg 99
l_x		reg 99
l_y		reg 99
l_z		reg 99
LOOP		reg 99
vn_x		reg 99
vn_y		reg 99
vn_z		reg 99

gouraud::
	movei	#LIGHT_X,r14
	load	(r14),l_x
	load	(r14+4),l_y
	load	(r14+8),l_z

	load	(curr_object+obj_vnormals_rotated),vn_ptr
	cmpq	#0,vn_ptr
	load	(vn_ptr),p_cnt
	jump	eq,(LR)
	addq	#4,vn_ptr

	move	pc,LOOP
	move	vn_ptr,g_ptr
	addq	#4+2,LOOP
.loop
	load	(vn_ptr),vn_x
	load	(vn_ptr+4),vn_y
	load	(vn_ptr+8),vn_z
	addq	#16,vn_ptr

	imultn	l_x,vn_x
	imacn	l_y,vn_y
	imacn	l_z,vn_z
	resmac	tmp1

	sharq	#8,tmp1
	sat8	tmp1

	subq	#1,p_cnt
	storeb	tmp1,(g_ptr)
	jr	ne,.loop
	addq	#1,g_ptr

	jump	(LR)
	nop

	unreg	vn_ptr,v_ptr,p_cnt,g_ptr
	unreg	l_x,vn_x
	unreg	l_y,vn_y
	unreg	l_z,vn_z
	unreg	LOOP
 ENDIF
