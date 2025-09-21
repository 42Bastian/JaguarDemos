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
	tri 1,3,4, $7030
	tri 3,1,0, $7030
	tri 4,3,2, $7030

prisma_normals:
