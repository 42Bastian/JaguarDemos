;;; -*-asm-*-

moved		reg 15!
rotated		reg 14

counter		reg 99
x_pos		reg 99
y_pos		reg 99
z_pos		reg 99
x0		reg 99
y0		reg 99
z0		reg 99

move_object::
	load	(curr_object+obj_rotated),rotated
	load	(curr_object+obj_changed),x_pos
	load	(curr_object+obj_y),y_pos
	load	(curr_object+obj_moved),moved

	shlq	#16,x_pos
	move	y_pos,z_pos
	sharq	#16,x_pos
	shlq	#16,z_pos
	sharq	#16,y_pos
	sharq	#16,z_pos

	load	(rotated),counter
	addq	#4,rotated
	store	counter,(moved)
	addq	#4,moved
.loop
	load	(rotated),x0
	load	(rotated+4),y0
	load	(rotated+8),z0
	addq	#16,rotated
	add	x_pos,x0
	add	y_pos,y0
	add	z_pos,z0
	store	x0,(moved)
	store	y0,(moved+4)
	subq	#1,counter
	store	z0,(moved+8)
	jr	ne,.loop
	addq	#16,moved

	jump	(LR)
	movefa	save_curr_object.a,curr_object

	unreg rotated,moved
	unreg x_pos,y_pos,z_pos
	unreg counter,x0,y0,z0
