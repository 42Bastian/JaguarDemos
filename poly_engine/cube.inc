;-*-asm-*-
	.align 4

cube_points:
	DC.L 8
	PT -50,-50,-50
	PT  50,-50,-50
	PT  50,-50, 50
	PT -50,-50, 50
	PT -50, 50,-50
	PT  50, 50,-50
	PT  50, 50, 50
	PT -50, 50, 50

cube_faces:
	dc.l 12

  tri 0, 1, 5, $003f		; front
  tri 0, 4, 5, $003f		; front
  tri 2, 3, 7, $ff2f		; back
  tri 2, 6, 7, $ff2f		; back
  tri 1, 2, 6, $c83f		; right
  tri 1, 5, 6, $c83f		; right
  tri 0, 4, 7, $703f		; left
  tri 0, 3, 7, $703f		; left
  tri 3, 2, 1, $8f3f		; bottom
  tri 3, 0, 1, $8f3f		; bottom
  tri 7, 4, 5, $cf00		; top
  tri 7, 6, 5, $cf00		; top

cube2_faces:
	dc.l 12
  tri 0, 1, 5, $883f		; front
  tri 0, 4, 5, $883f		; front
  tri 2, 3, 7, $882f		; back
  tri 2, 6, 7, $882f		; back
  tri 1, 2, 6, $883f		; right
  tri 1, 5, 6, $883f		; right
  tri 0, 4, 7, $883f		; left
  tri 0, 3, 7, $883f		; left
  tri 3, 2, 1, $883f		; bottom
  tri 3, 0, 1, $883f		; bottom
  tri 7, 4, 5, $8800		; top
  tri 7, 6, 5, $8800		; top


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

  VNT  147, 147, 147,
  VNT  -147, 147, 147,
  VNT  -147, 147, -147,
  VNT  147, 147, -147,
  VNT  147, -147, 147,
  VNT  -147, -147, 147,
  VNT  -147, -147, -147,
  VNT  147, -147, -147

//-> VNT  -147 , -147 , -147
//-> VNT  147 , -147 , -147
//-> VNT  147 , -147 , 147
//-> VNT  -147 , -147 , 147
//-> VNT  -147 , 147 , -147
//-> VNT  147 , 147 , -147
//-> VNT  147 , 147 , 147
//-> VNT  -147 , 147 , 147
