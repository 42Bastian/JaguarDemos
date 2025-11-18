;-*-asm-*-
	.align 4
prisma_points:
	DC.L 5
	PT 0,0,-100
	PT 100,0,0		 ; tip
	PT -30,49,0
	PT -30,-80,0
	PT 0,0,100

prisma_faces:
	dc.l 6
	tri 0,1,2, $7030
	tri 4,2,1, $7030
	tri 0,2,3, $7030
	tri 1,3,4, $7830
	tri 3,1,0, $7030
	tri 4,3,2, $7830

prisma_normals:
 dc.l  6
 NT  -85 , -225 , 85
 NT  -85 , -225 , -85
 NT  245 , 0 , 73
 NT  -118 , 193 , -118
 NT  -118 , 193 , 118
 NT  245 , 0 , -73
prisma_vnormals:
 dc.l  5
 VNT  0 , 0 , -256
 VNT  256 , 0 , 0
 VNT  -133 , 218 , 0
 VNT  -89 , -239 , 0
 VNT  0 , 0 , 256
