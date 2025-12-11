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
LR_save		reg 99
reci		reg 99
DARK_DIST	reg 99



PROJ_REZ	equ 15

project_object::
	move	LR,LR_save
	load	(curr_object+obj_rotated),m_ptr
	load	(m_ptr),m_cnt
	addq	#4,m_ptr
	movei	#(max_x>>1),xcenter
	movei	#(max_y>>1),ycenter

	load	(m_ptr),x1
	load	(m_ptr+4),y1
	movei	#dark_dist*dark_dist,DARK_DIST
	load	(m_ptr+8),z1

	load	(curr_object+obj_vnormals_rotated),rvn_ptr
	addq	#4+12,rvn_ptr

	load	(curr_object+obj_projected),proj_ptr
	move	pc,LOOP
	movei	#$0000ffff,mask
	addq	#4+6,LOOP
.loop
	addqt	#16,m_ptr
	cmpq	#0,z1
	movei	#1<<PROJ_REZ,reci
	jr	pl,.ok_z
	store	z1,(proj_ptr)	; save original Z
	moveq	#1,z1
.ok_z
	div	z1,reci
	addqt	#4,proj_ptr

	imultn	z1,z1
	imacn	x1,x1
	resmac	tmp1

	sub	DARK_DIST,tmp1
	moveq	#0,tmp0
	jr	mi,.no_darken
	neg	tmp1

	move	tmp1,tmp0

.no_darken
	store	tmp0,(rvn_ptr)
	addq	#16,rvn_ptr

	neg	y1
	load	(m_ptr),x2
	load	(m_ptr+4),y2
	load	(m_ptr+8),z2

 IF NO_ASPECT_FIX = 1
	imult	reci,y1
	imult	reci,x1
	sharq	#7,y1
	sharq	#7,x1
	add	xcenter,x1
	add	ycenter,y1
	shlq	#16,x1
	and	mask,y1
	move	z2,z1
 ELSE
 IF max_x = 384
	imult	reci,y1
_fix_ntsc_aspect:
	moveq	#aspect_patch_pal,tmp2
//->	moveq	#aspect_patch_ntsc,tmp2
	imult	reci,x1
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
	imult	reci,y1
_fix_ntsc_aspect:
	moveq	#aspect_patch_pal,tmp2
;;->	moveq	#aspect_patch_ntsc,tmp2
	imult	reci,x1
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
	imult	reci,x1
_fix_ntsc_aspect:
	movei	#aspect_patch_pal,tmp2
//->	movei	#aspect_patch_ntsc,tmp2
	imult	reci,y1
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

	jump	(LR_save)
	nop

	UNREG m_cnt,m_ptr,LOOP
	UNREG xcenter,ycenter
	UNREG x1,y1,z1
	UNREG x2,y2,z2
	UNREG proj_ptr,mask
	UNREG rvn_ptr
	UNREG LR_save
	UNREG reci
	UNREG DARK_DIST
