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
rvn_ptr		reg 99


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

	load	(curr_object+obj_vnormals_rotated),rvn_ptr
	addq	#4+12,rvn_ptr

	load	(curr_object+obj_projected),proj_ptr
	move	pc,LOOP
	movei	#$0000ffff,mask
	addq	#4+6,LOOP
.loop
	addqt	#16,m_ptr
	move	z1,tmp1		; save original Z
	cmpq	#0,z1
	movei	#1<<PROJ_REZ,tmp0
	jr	pl,.ok_z
	store	z1,(proj_ptr)	; save original Z
	moveq	#1,z1
.ok_z
	div	z1,tmp0
	addqt	#4,proj_ptr

	imultn	tmp1,tmp1
	imacn	x1,x1
	resmac	tmp1

	movei	#dark_dist*dark_dist,tmp2
	sub	tmp2,tmp1
	movei	#.no_darken,tmp2
	jump	mi,(tmp2)
	moveq	#0,tmp2
	PUSH	r0,LR
	move	tmp1,tmp0
	movei	#sqrt,tmp1
	BL	(tmp1)
	neg	r0
	move	r0,r2
	POP	r0,LR
.no_darken
	store	tmp2,(rvn_ptr)
	addq	#16,rvn_ptr

	neg	y1
	load	(m_ptr),x2
	load	(m_ptr+4),y2
	load	(m_ptr+8),z2

 IF NO_ASPECT_FIX = 1
	imult	tmp0,y1
	imult	tmp0,x1
	sharq	#7,y1
	sharq	#7,x1
	add	xcenter,x1
	add	ycenter,y1
	shlq	#16,x1
	and	mask,y1
	move	z2,z1
 ELSE
 IF max_x = 384
	imult	tmp0,y1
_fix_ntsc_aspect:
	moveq	#aspect_patch_pal,tmp2
//->	moveq	#aspect_patch_ntsc,tmp2
	imult	tmp0,x1
	sharq	#7,y1
	sharq	#7,x1
	imult	tmp2,y1
	add	xcenter,x1
	sharq	#5,y1
	add	ycenter,y1
	and	mask,y1

	move	z2,z1
	shlq	#16,x1
 ENDIF
 IF max_x = 320
	imult	tmp0,y1
_fix_ntsc_aspect:
	moveq	#aspect_patch_pal,tmp2
;;->	moveq	#aspect_patch_ntsc,tmp2
	imult	tmp0,x1
	sharq	#7,y1
	sharq	#7,x1
	imult	tmp2,y1
	add	xcenter,x1
	sharq	#4,y1
	add	ycenter,y1
	and	mask,y1

	move	z2,z1
	shlq	#16,x1
 ENDIF
 IF max_x = 640
	imult	tmp0,x1
_fix_ntsc_aspect:
	movei	#aspect_patch_pal,tmp2
//->	movei	#aspect_patch_ntsc,tmp2
	imult	tmp0,y1
	sharq	#7,x1
	sharq	#7,y1
	imult	tmp2,y1
	sharq	#6,y1
	add	ycenter,y1
	and	mask,y1
	add	xcenter,x1
	move	z2,z1
	shlq	#16,x1
 ENDIF
 ENDIF 				; NO_ASPECT_FIX
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
	UNREG rvn_ptr
