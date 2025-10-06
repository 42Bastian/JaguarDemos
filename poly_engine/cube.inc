;-*-asm-*-
	.align 4

cube_points:
	DC.L 8
	PT -50,-50,-50
	PT 50,-50,-50
	PT 50,-50,50
	PT -50,-50,50
	PT -50,50,-50
	PT 50,50,-50
	PT 50,50,50
	PT -50,50,50

cube_faces:
	dc.l 12
	face 0,1,5,4, $003f		; front
	face 2,3,7,6, $803f		; back
	face 1,2,6,5, $c83f		; right
	face 0,4,7,3, $c03f		; left
	face 3,2,1,0, $8f3f		; bottom
	face 7,4,5,6, $cf3f		; top

cube2_faces:
	dc.l 12
	face 0,1,5,4, $881f		; front
	face 2,3,7,6, $881f		; back
	face 1,2,6,5, $881f		; right
	face 0,4,7,3, $801f		; left
	face 3,2,1,0, $881f		; bottom
	face 7,4,5,6, $881f		; top

	align	4
cube_normals:
cube2_normals:
	dc.l	12
 NT  0 , 0 , 256
 NT  0 , 0 , 256
 NT  0 , 0 , -256
 NT  0 , 0 , -256
 NT  -256 , 0 , 0
 NT  -256 , 0 , 0
 NT  256 , 0 , 0
 NT  256 , 0 , 0
 NT  0 , 256 , 0
 NT  0 , 256 , 0
 NT  0 , -256 , 0
 NT  0 , -256 , 0

cube_vnormals:
cube2_vnormals:
 dc.l  8
 VNT  -147 , -147 , -147
 VNT  147 , -147 , -147
 VNT  147 , -147 , 147
 VNT  -147 , -147 , 147
 VNT  -147 , 147 , -147
 VNT  147 , 147 , -147
 VNT  147 , 147 , 147
 VNT  -147 , 147 , 147
