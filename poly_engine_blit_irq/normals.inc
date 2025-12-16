****************
;;; Calculate normals
;;;
;;;       x = y0*(z1-z2) + y1*(z2-z0) + y2*(z0-z1);
;;;       y = z0*(x1-x2) + z1*(x2-x0) + z2*(x0-x1);
;;;       z = x0*(y1-y2) + x1*(y2-y0) + x2*(y0-y1);

m_ptr		reg 14

x0		reg 99
y0		reg 99
z0		reg 99
x1		reg 99
y1		reg 99
z1		reg 99
x2		reg 99
y2		reg 99
z2		reg 99
d0		reg 99
d1		reg 99
d2		reg 99
xn		reg 99
yn		reg 99
zn		reg 99
fce_ptr		reg 99
n_ptr		reg 99
fce_cnt		reg 99
LOOP		reg 99


normals::
	load	(curr_object+obj_faces),fce_ptr
	load	(curr_object+obj_rotated),tmp0
	load	(fce_ptr),fce_cnt
	load	(curr_object+obj_normals),n_ptr
	addq	#4,fce_ptr
	addq	#4,tmp0		; skip counter

	move	pc,LOOP
	addq	#4,LOOP
.loop
	loadw	(fce_ptr),z0
	addq	#2,fce_ptr
	loadw	(fce_ptr),z1
	addq	#2,fce_ptr
	loadw	(fce_ptr),z2
	addq	#4,fce_ptr
	shlq	#1,z0
	shlq	#1,z1
	shlq	#1,z2
	move	tmp0,m_ptr
	load	(m_ptr+z0),x0
	load	(m_ptr+z1),x1
	load	(m_ptr+z2),x2
	addq	#4,m_ptr
	load	(m_ptr+z0),y0
	load	(m_ptr+z1),y1
	load	(m_ptr+z2),y2
	addq	#4,m_ptr
	load	(m_ptr+z0),z0
	load	(m_ptr+z1),z1
	load	(m_ptr+z2),z2

	move	z1,d0
	move	z2,d1
	move	z0,d2
	sub	z2,d0
	sub	z0,d1
	sub	z1,d2

	imultn	y0,d0
	imacn	y1,d1
	imacn	y2,d2
	resmac	xn

	move	x1,d0
	move	x2,d1
	move	x0,d2
	sub	x2,d0
	sub	x0,d1
	sub	x1,d2

	imultn	z0,d0
	imacn	z1,d1
	imacn	z2,d2
	resmac	yn

	move	y1,d0
	move	y2,d1
	move	y0,d2
	sub	y2,d0
	sub	y0,d1
	sub	y1,d2

	imultn	x0,d0
	imacn	x1,d1
	imacn	x2,d2
	resmac	zn

	store	xn,(n_ptr)
	addq	#4,n_ptr
	store	yn,(n_ptr)
	addq	#4,n_ptr
	subq	#1,fce_cnt
	store	zn,(n_ptr)
	jump	ne,(LOOP)
	addq	#8,n_ptr

	jump	(LR)
	nop

	unreg	x0,y0,z0, x1,y1,z1, x2,y2,z2, xn,yn,zn, d0,d1,d2
	unreg	fce_ptr,n_ptr,fce_cnt,m_ptr
	unreg	LOOP
