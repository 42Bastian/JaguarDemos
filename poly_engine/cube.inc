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

 IF TEXTURE = 1
  tri 0, 1, 5, %001011<<8 	; front
  tri 0, 5, 4, %001101<<8 		; front

  tri 2, 3, 7, %001011<<8 		; back
  tri 2, 7, 6, %001101<<8 		; back

  tri 1, 2, 6, %01001011<<8 		; right
  tri 1, 6, 5, %01001101<<8 		; right

  tri 3, 0, 4, %01001011<<8 		; left
  tri 3, 4, 7, %01001101<<8 		; left

  tri 3, 2, 1, %001011<<8 		; bottom
  tri 3, 1, 0, %001101<<8 		; bottom

  tri 4, 5, 6, %001011<<8 		; top
  tri 4, 6, 7, %001101<<8 		; top
 ELSE
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
 ENDIF
cube2_faces:
	dc.l 12
 IF TEXTURE = 1
  tri 0, 1, 5, %11001011<<8 	; front
  tri 0, 5, 4, %11001101<<8 		; front

  tri 2, 3, 7, %11001011<<8 		; back
  tri 2, 7, 6, %11001101<<8 		; back

  tri 1, 2, 6, %01001011<<8 		; right
  tri 1, 6, 5, %01001101<<8 		; right

  tri 3, 0, 4, %01001011<<8 		; left
  tri 3, 4, 7, %01001101<<8 		; left

  tri 3, 2, 1, %11001011<<8 		; bottom
  tri 3, 1, 0, %11001101<<8 		; bottom

  tri 4, 5, 6, %11001011<<8 		; top
  tri 4, 6, 7, %11001101<<8 		; top
 ELSE
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
endif

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
