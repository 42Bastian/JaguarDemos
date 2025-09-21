 macro _tri			; p1,p2,p3,col
 dc.w \0*8,\2*8,\1*8,\3
 endm

torus_points:
	dc.l 144
 PT 100, 0, 0
 PT 97, 0, 10
 PT 90, 0, 17
 PT 80, 0, 20
 PT 70, 0, 17
 PT 63, 0, 10
 PT 60, 0, 0
 PT 63, 0, -10
 PT 70, 0, -17
 PT 80, 0, -20
 PT 90, 0, -17
 PT 97, 0, -10
 PT 87, 50, 0
 PT 84, 49, 10
 PT 78, 45, 17
 PT 69, 40, 20
 PT 61, 35, 17
 PT 54, 31, 10
 PT 52, 30, 0
 PT 54, 31, -10
 PT 61, 35, -17
 PT 69, 40, -20
 PT 78, 45, -17
 PT 84, 49, -10
 PT 50, 87, 0
 PT 49, 84, 10
 PT 45, 78, 17
 PT 40, 69, 20
 PT 35, 61, 17
 PT 31, 54, 10
 PT 30, 52, 0
 PT 31, 54, -10
 PT 35, 61, -17
 PT 40, 69, -20
 PT 45, 78, -17
 PT 49, 84, -10
 PT 0, 100, 0
 PT 0, 97, 10
 PT 0, 90, 17
 PT 0, 80, 20
 PT 0, 70, 17
 PT 0, 63, 10
 PT 0, 60, 0
 PT 0, 63, -10
 PT 0, 70, -17
 PT 0, 80, -20
 PT 0, 90, -17
 PT 0, 97, -10
 PT -50, 87, 0
 PT -49, 84, 10
 PT -45, 78, 17
 PT -40, 69, 20
 PT -35, 61, 17
 PT -31, 54, 10
 PT -30, 52, 0
 PT -31, 54, -10
 PT -35, 61, -17
 PT -40, 69, -20
 PT -45, 78, -17
 PT -49, 84, -10
 PT -87, 50, 0
 PT -84, 49, 10
 PT -78, 45, 17
 PT -69, 40, 20
 PT -61, 35, 17
 PT -54, 31, 10
 PT -52, 30, 0
 PT -54, 31, -10
 PT -61, 35, -17
 PT -69, 40, -20
 PT -78, 45, -17
 PT -84, 49, -10
 PT -100, 0, 0
 PT -97, 0, 10
 PT -90, 0, 17
 PT -80, 0, 20
 PT -70, 0, 17
 PT -63, 0, 10
 PT -60, 0, 0
 PT -63, 0, -10
 PT -70, 0, -17
 PT -80, 0, -20
 PT -90, 0, -17
 PT -97, 0, -10
 PT -87, -50, 0
 PT -84, -49, 10
 PT -78, -45, 17
 PT -69, -40, 20
 PT -61, -35, 17
 PT -54, -31, 10
 PT -52, -30, 0
 PT -54, -31, -10
 PT -61, -35, -17
 PT -69, -40, -20
 PT -78, -45, -17
 PT -84, -49, -10
 PT -50, -87, 0
 PT -49, -84, 10
 PT -45, -78, 17
 PT -40, -69, 20
 PT -35, -61, 17
 PT -31, -54, 10
 PT -30, -52, 0
 PT -31, -54, -10
 PT -35, -61, -17
 PT -40, -69, -20
 PT -45, -78, -17
 PT -49, -84, -10
 PT 0, -100, 0
 PT 0, -97, 10
 PT 0, -90, 17
 PT 0, -80, 20
 PT 0, -70, 17
 PT 0, -63, 10
 PT 0, -60, 0
 PT 0, -63, -10
 PT 0, -70, -17
 PT 0, -80, -20
 PT 0, -90, -17
 PT 0, -97, -10
 PT 50, -87, 0
 PT 49, -84, 10
 PT 45, -78, 17
 PT 40, -69, 20
 PT 35, -61, 17
 PT 31, -54, 10
 PT 30, -52, 0
 PT 31, -54, -10
 PT 35, -61, -17
 PT 40, -69, -20
 PT 45, -78, -17
 PT 49, -84, -10
 PT 87, -50, 0
 PT 84, -49, 10
 PT 78, -45, 17
 PT 69, -40, 20
 PT 61, -35, 17
 PT 54, -31, 10
 PT 52, -30, 0
 PT 54, -31, -10
 PT 61, -35, -17
 PT 69, -40, -20
 PT 78, -45, -17
 PT 84, -49, -10

torus_faces:
	dc.l 288
 _tri 0, 12, 13, $00f0
 _tri 0, 13, 1, $00f0
 _tri 1, 13, 14, $22ff
 _tri 1, 14, 2, $22ff
 _tri 2, 14, 15, $2020
 _tri 2, 15, 3, $2020
 _tri 3, 15, 16, $ff20
 _tri 3, 16, 4, $ff20
 _tri 4, 16, 17, $8f20
 _tri 4, 17, 5, $8f20
 _tri 5, 17, 18, $8c20
 _tri 5, 18, 6, $8c20
 _tri 6, 18, 19, $d020
 _tri 6, 19, 7, $d020
 _tri 7, 19, 20, $7020
 _tri 7, 20, 8, $7020
 _tri 8, 20, 21, $7820
 _tri 8, 21, 9, $7820
 _tri 9, 21, 22, $820
 _tri 9, 22, 10, $820
 _tri 10, 22, 23, $8820
 _tri 10, 23, 11, $8820
 _tri 11, 23, 12, $4420
 _tri 11, 12, 0, $4420

col_torus equ $0730

 _tri 12, 24, 25, col_torus
 _tri 12, 25, 13, col_torus
 _tri 13, 25, 26, col_torus
 _tri 13, 26, 14, col_torus
 _tri 14, 26, 27, col_torus
 _tri 14, 27, 15, col_torus
 _tri 15, 27, 28, col_torus
 _tri 15, 28, 16, col_torus
 _tri 16, 28, 29, col_torus
 _tri 16, 29, 17, col_torus
 _tri 17, 29, 30, col_torus
 _tri 17, 30, 18, col_torus
 _tri 18, 30, 31, col_torus
 _tri 18, 31, 19, col_torus
 _tri 19, 31, 32, col_torus
 _tri 19, 32, 20, col_torus
 _tri 20, 32, 33, col_torus
 _tri 20, 33, 21, col_torus
 _tri 21, 33, 34, col_torus
 _tri 21, 34, 22, col_torus
 _tri 22, 34, 35, col_torus
 _tri 22, 35, 23, col_torus
 _tri 23, 35, 24, col_torus
 _tri 23, 24, 12, col_torus
 _tri 24, 36, 37, col_torus
 _tri 24, 37, 25, col_torus
 _tri 25, 37, 38, col_torus
 _tri 25, 38, 26, col_torus
 _tri 26, 38, 39, col_torus
 _tri 26, 39, 27, col_torus
 _tri 27, 39, 40, col_torus
 _tri 27, 40, 28, col_torus
 _tri 28, 40, 41, col_torus
 _tri 28, 41, 29, col_torus
 _tri 29, 41, 42, col_torus
 _tri 29, 42, 30, col_torus
 _tri 30, 42, 43, col_torus
 _tri 30, 43, 31, col_torus
 _tri 31, 43, 44, col_torus
 _tri 31, 44, 32, col_torus
 _tri 32, 44, 45, col_torus
 _tri 32, 45, 33, $f0f0
 _tri 33, 45, 46, $f0f0
 _tri 33, 46, 34, col_torus
 _tri 34, 46, 47, col_torus
 _tri 34, 47, 35, col_torus
 _tri 35, 47, 36, col_torus
 _tri 35, 36, 24, col_torus
 _tri 36, 48, 49, col_torus
 _tri 36, 49, 37, col_torus
 _tri 37, 49, 50, col_torus
 _tri 37, 50, 38, col_torus
 _tri 38, 50, 51, col_torus
 _tri 38, 51, 39, col_torus
 _tri 39, 51, 52, col_torus
 _tri 39, 52, 40, col_torus
 _tri 40, 52, 53, col_torus
 _tri 40, 53, 41, col_torus
 _tri 41, 53, 54, col_torus
 _tri 41, 54, 42, col_torus
 _tri 42, 54, 55, col_torus
 _tri 42, 55, 43, col_torus
 _tri 43, 55, 56, col_torus
 _tri 43, 56, 44, col_torus
 _tri 44, 56, 57, col_torus
 _tri 44, 57, 45, col_torus
 _tri 45, 57, 58, col_torus
 _tri 45, 58, 46, col_torus
 _tri 46, 58, 59, col_torus
 _tri 46, 59, 47, col_torus
 _tri 47, 59, 48, col_torus
 _tri 47, 48, 36, col_torus
 _tri 48, 60, 61, col_torus
 _tri 48, 61, 49, col_torus
 _tri 49, 61, 62, col_torus
 _tri 49, 62, 50, col_torus
 _tri 50, 62, 63, col_torus
 _tri 50, 63, 51, col_torus
 _tri 51, 63, 64, col_torus
 _tri 51, 64, 52, col_torus
 _tri 52, 64, 65, col_torus
 _tri 52, 65, 53, col_torus
 _tri 53, 65, 66, col_torus
 _tri 53, 66, 54, col_torus
 _tri 54, 66, 67, col_torus
 _tri 54, 67, 55, col_torus
 _tri 55, 67, 68, col_torus
 _tri 55, 68, 56, col_torus
 _tri 56, 68, 69, col_torus
 _tri 56, 69, 57, col_torus
 _tri 57, 69, 70, col_torus
 _tri 57, 70, 58, col_torus
 _tri 58, 70, 71, col_torus
 _tri 58, 71, 59, col_torus
 _tri 59, 71, 60, col_torus
 _tri 59, 60, 48, col_torus
 _tri 60, 72, 73, col_torus
 _tri 60, 73, 61, col_torus
 _tri 61, 73, 74, col_torus
 _tri 61, 74, 62, col_torus
 _tri 62, 74, 75, col_torus
 _tri 62, 75, 63, col_torus
 _tri 63, 75, 76, col_torus
 _tri 63, 76, 64, col_torus
 _tri 64, 76, 77, col_torus
 _tri 64, 77, 65, col_torus
 _tri 65, 77, 78, col_torus
 _tri 65, 78, 66, col_torus
 _tri 66, 78, 79, col_torus
 _tri 66, 79, 67, col_torus
 _tri 67, 79, 80, col_torus
 _tri 67, 80, 68, col_torus
 _tri 68, 80, 81, col_torus
 _tri 68, 81, 69, col_torus
 _tri 69, 81, 82, col_torus
 _tri 69, 82, 70, col_torus
 _tri 70, 82, 83, col_torus
 _tri 70, 83, 71, col_torus
 _tri 71, 83, 72, col_torus
 _tri 71, 72, 60, col_torus
 _tri 72, 84, 85, col_torus
 _tri 72, 85, 73, col_torus
 _tri 73, 85, 86, col_torus
 _tri 73, 86, 74, col_torus
 _tri 74, 86, 87, col_torus
 _tri 74, 87, 75, col_torus
 _tri 75, 87, 88, col_torus
 _tri 75, 88, 76, col_torus
 _tri 76, 88, 89, col_torus
 _tri 76, 89, 77, col_torus
 _tri 77, 89, 90, col_torus
 _tri 77, 90, 78, col_torus
 _tri 78, 90, 91, col_torus
 _tri 78, 91, 79, col_torus
 _tri 79, 91, 92, col_torus
 _tri 79, 92, 80, col_torus
 _tri 80, 92, 93, col_torus
 _tri 80, 93, 81, col_torus
 _tri 81, 93, 94, col_torus
 _tri 81, 94, 82, col_torus
 _tri 82, 94, 95, col_torus
 _tri 82, 95, 83, col_torus
 _tri 83, 95, 84, col_torus
 _tri 83, 84, 72, col_torus
 _tri 84, 96, 97, col_torus
 _tri 84, 97, 85, col_torus
 _tri 85, 97, 98, col_torus
 _tri 85, 98, 86, col_torus
 _tri 86, 98, 99, col_torus
 _tri 86, 99, 87, col_torus
 _tri 87, 99, 100, col_torus
 _tri 87, 100, 88, col_torus
 _tri 88, 100, 101, col_torus
 _tri 88, 101, 89, col_torus
 _tri 89, 101, 102, col_torus
 _tri 89, 102, 90, col_torus
 _tri 90, 102, 103, col_torus
 _tri 90, 103, 91, col_torus
 _tri 91, 103, 104, col_torus
 _tri 91, 104, 92, col_torus
 _tri 92, 104, 105, col_torus
 _tri 92, 105, 93, col_torus
 _tri 93, 105, 106, col_torus
 _tri 93, 106, 94, col_torus
 _tri 94, 106, 107, col_torus
 _tri 94, 107, 95, col_torus
 _tri 95, 107, 96, col_torus
 _tri 95, 96, 84, col_torus
 _tri 96, 108, 109, col_torus
 _tri 96, 109, 97, col_torus
 _tri 97, 109, 110, col_torus
 _tri 97, 110, 98, col_torus
 _tri 98, 110, 111, col_torus
 _tri 98, 111, 99, col_torus
 _tri 99, 111, 112, col_torus
 _tri 99, 112, 100, col_torus
 _tri 100, 112, 113, col_torus
 _tri 100, 113, 101, col_torus
 _tri 101, 113, 114, col_torus
 _tri 101, 114, 102, col_torus
 _tri 102, 114, 115, col_torus
 _tri 102, 115, 103, col_torus
 _tri 103, 115, 116, col_torus
 _tri 103, 116, 104, col_torus
 _tri 104, 116, 117, col_torus
 _tri 104, 117, 105, col_torus
 _tri 105, 117, 118, col_torus
 _tri 105, 118, 106, col_torus
 _tri 106, 118, 119, col_torus
 _tri 106, 119, 107, col_torus
 _tri 107, 119, 108, col_torus
 _tri 107, 108, 96, col_torus
 _tri 108, 120, 121, col_torus
 _tri 108, 121, 109, col_torus
 _tri 109, 121, 122, col_torus
 _tri 109, 122, 110, col_torus
 _tri 110, 122, 123, col_torus
 _tri 110, 123, 111, col_torus
 _tri 111, 123, 124, col_torus
 _tri 111, 124, 112, col_torus
 _tri 112, 124, 125, col_torus
 _tri 112, 125, 113, col_torus
 _tri 113, 125, 126, col_torus
 _tri 113, 126, 114, col_torus
 _tri 114, 126, 127, col_torus
 _tri 114, 127, 115, col_torus
 _tri 115, 127, 128, col_torus
 _tri 115, 128, 116, col_torus
 _tri 116, 128, 129, col_torus
 _tri 116, 129, 117, col_torus
 _tri 117, 129, 130, col_torus
 _tri 117, 130, 118, col_torus
 _tri 118, 130, 131, col_torus
 _tri 118, 131, 119, col_torus
 _tri 119, 131, 120, col_torus
 _tri 119, 120, 108, col_torus
 _tri 120, 132, 133, col_torus
 _tri 120, 133, 121, col_torus
 _tri 121, 133, 134, col_torus
 _tri 121, 134, 122, col_torus
 _tri 122, 134, 135, col_torus
 _tri 122, 135, 123, col_torus
 _tri 123, 135, 136, col_torus
 _tri 123, 136, 124, col_torus
 _tri 124, 136, 137, col_torus
 _tri 124, 137, 125, col_torus
 _tri 125, 137, 138, col_torus
 _tri 125, 138, 126, col_torus
 _tri 126, 138, 139, col_torus
 _tri 126, 139, 127, col_torus
 _tri 127, 139, 140, col_torus
 _tri 127, 140, 128, col_torus
 _tri 128, 140, 141, col_torus
 _tri 128, 141, 129, col_torus
 _tri 129, 141, 142, col_torus
 _tri 129, 142, 130, col_torus
 _tri 130, 142, 143, col_torus
 _tri 130, 143, 131, col_torus
 _tri 131, 143, 132, col_torus
 _tri 131, 132, 120, col_torus
 _tri 132, 0, 1, col_torus
 _tri 132, 1, 133, col_torus
 _tri 133, 1, 2, col_torus
 _tri 133, 2, 134, col_torus
 _tri 134, 2, 3, col_torus
 _tri 134, 3, 135, col_torus
 _tri 135, 3, 4, col_torus
 _tri 135, 4, 136, col_torus
 _tri 136, 4, 5, col_torus
 _tri 136, 5, 137, col_torus
 _tri 137, 5, 6, col_torus
 _tri 137, 6, 138, col_torus
 _tri 138, 6, 7, col_torus
 _tri 138, 7, 139, col_torus
 _tri 139, 7, 8, col_torus
 _tri 139, 8, 140, col_torus
 _tri 140, 8, 9, col_torus
 _tri 140, 9, 141, col_torus
 _tri 141, 9, 10, col_torus
 _tri 141, 10, 142, col_torus
 _tri 142, 10, 11, col_torus
 _tri 142, 11, 143, col_torus
 _tri 143, 11, 0, col_torus
 _tri 143, 0, 132, col_torus

 align	   4
torus_normals:
	dc.l 288
  NT -236, -61, -77
  NT -237, -63, -71
  NT -177, -47, -178
  NT -177, -47, -177
  NT -71, -18, -245
  NT -73, -20, -244
  NT 77, 21, -242
  NT 73, 18, -244
  NT 165, 42, -190
  NT 177, 51, -177
  NT 240, 69, -54
  NT 237, 63, -71
  NT 241, 64, 54
  NT 236, 68, 70
  NT 163, 47, 190
  NT 178, 45, 178
  NT 78, 20, 242
  NT 73, 20, 244
  NT -70, -19, 245
  NT -73, -19, 244
  NT -177, -47, 178
  NT -177, -47, 177
  NT -235, -62, 77
  NT -237, -61, 71
  NT -174, -174, -69
  NT -174, -174, -69
  NT -127, -127, -181
  NT -127, -127, -181
  NT -52, -52, -244
  NT -52, -52, -244
  NT 56, 56, -243
  NT 56, 56, -243
  NT 121, 121, -190
  NT 121, 121, -190
  NT 177, 177, -53
  NT 177, 177, -53
  NT 177, 177, 53
  NT 177, 177, 53
  NT 121, 121, 190
  NT 121, 121, 190
  NT 56, 56, 243
  NT 56, 56, 243
  NT -52, -52, 244
  NT -52, -52, 244
  NT -127, -127, 181
  NT -127, -127, 181
  NT -174, -174, 69
  NT -174, -174, 69
  NT -61, -237, -71
  NT -62, -235, -77
  NT -47, -177, -177
  NT -47, -177, -178
  NT -19, -73, -244
  NT -19, -70, -245
  NT 20, 73, -244
  NT 20, 78, -242
  NT 45, 178, -178
  NT 47, 163, -190
  NT 68, 236, -70
  NT 64, 241, -54
  NT 63, 237, 71
  NT 69, 240, 54
  NT 51, 177, 177
  NT 42, 165, 190
  NT 18, 73, 244
  NT 21, 77, 242
  NT -20, -73, 244
  NT -18, -71, 245
  NT -47, -177, 177
  NT -47, -177, 178
  NT -63, -237, 71
  NT -61, -236, 77
  NT 61, -236, -77
  NT 63, -237, -71
  NT 47, -177, -178
  NT 47, -177, -177
  NT 18, -71, -245
  NT 20, -73, -244
  NT -21, 77, -242
  NT -18, 73, -244
  NT -42, 165, -190
  NT -51, 177, -177
  NT -69, 240, -54
  NT -63, 237, -71
  NT -64, 241, 54
  NT -68, 236, 70
  NT -47, 163, 190
  NT -45, 178, 178
  NT -20, 78, 242
  NT -20, 73, 244
  NT 19, -70, 245
  NT 19, -73, 244
  NT 47, -177, 178
  NT 47, -177, 177
  NT 62, -235, 77
  NT 61, -237, 71
  NT 174, -174, -69
  NT 174, -174, -69
  NT 127, -127, -181
  NT 127, -127, -181
  NT 52, -52, -244
  NT 52, -52, -244
  NT -56, 56, -243
  NT -56, 56, -243
  NT -121, 121, -190
  NT -121, 121, -190
  NT -177, 177, -53
  NT -177, 177, -53
  NT -177, 177, 53
  NT -177, 177, 53
  NT -121, 121, 190
  NT -121, 121, 190
  NT -56, 56, 243
  NT -56, 56, 243
  NT 52, -52, 244
  NT 52, -52, 244
  NT 127, -127, 181
  NT 127, -127, 181
  NT 174, -174, 69
  NT 174, -174, 69
  NT 237, -61, -71
  NT 235, -62, -77
  NT 177, -47, -177
  NT 177, -47, -178
  NT 73, -19, -244
  NT 70, -19, -245
  NT -73, 20, -244
  NT -78, 20, -242
  NT -178, 45, -178
  NT -163, 47, -190
  NT -236, 68, -70
  NT -241, 64, -54
  NT -237, 63, 71
  NT -240, 69, 54
  NT -177, 51, 177
  NT -165, 42, 190
  NT -73, 18, 244
  NT -77, 21, 242
  NT 73, -20, 244
  NT 71, -18, 245
  NT 177, -47, 177
  NT 177, -47, 178
  NT 237, -63, 71
  NT 236, -61, 77
  NT 236, 61, -77
  NT 237, 63, -71
  NT 177, 47, -178
  NT 177, 47, -177
  NT 71, 18, -245
  NT 73, 20, -244
  NT -77, -21, -242
  NT -73, -18, -244
  NT -165, -42, -190
  NT -177, -51, -177
  NT -240, -69, -54
  NT -237, -63, -71
  NT -241, -64, 54
  NT -236, -68, 70
  NT -163, -47, 190
  NT -178, -45, 178
  NT -78, -20, 242
  NT -73, -20, 244
  NT 70, 19, 245
  NT 73, 19, 244
  NT 177, 47, 178
  NT 177, 47, 177
  NT 235, 62, 77
  NT 237, 61, 71
  NT 174, 174, -69
  NT 174, 174, -69
  NT 127, 127, -181
  NT 127, 127, -181
  NT 52, 52, -244
  NT 52, 52, -244
  NT -56, -56, -243
  NT -56, -56, -243
  NT -121, -121, -190
  NT -121, -121, -190
  NT -177, -177, -53
  NT -177, -177, -53
  NT -177, -177, 53
  NT -177, -177, 53
  NT -121, -121, 190
  NT -121, -121, 190
  NT -56, -56, 243
  NT -56, -56, 243
  NT 52, 52, 244
  NT 52, 52, 244
  NT 127, 127, 181
  NT 127, 127, 181
  NT 174, 174, 69
  NT 174, 174, 69
  NT 61, 237, -71
  NT 62, 235, -77
  NT 47, 177, -177
  NT 47, 177, -178
  NT 19, 73, -244
  NT 19, 70, -245
  NT -20, -73, -244
  NT -20, -78, -242
  NT -45, -178, -178
  NT -47, -163, -190
  NT -68, -236, -70
  NT -64, -241, -54
  NT -63, -237, 71
  NT -69, -240, 54
  NT -51, -177, 177
  NT -42, -165, 190
  NT -18, -73, 244
  NT -21, -77, 242
  NT 20, 73, 244
  NT 18, 71, 245
  NT 47, 177, 177
  NT 47, 177, 178
  NT 63, 237, 71
  NT 61, 236, 77
  NT -61, 236, -77
  NT -63, 237, -71
  NT -47, 177, -178
  NT -47, 177, -177
  NT -18, 71, -245
  NT -20, 73, -244
  NT 21, -77, -242
  NT 18, -73, -244
  NT 42, -165, -190
  NT 51, -177, -177
  NT 69, -240, -54
  NT 63, -237, -71
  NT 64, -241, 54
  NT 68, -236, 70
  NT 47, -163, 190
  NT 45, -178, 178
  NT 20, -78, 242
  NT 20, -73, 244
  NT -19, 70, 245
  NT -19, 73, 244
  NT -47, 177, 178
  NT -47, 177, 177
  NT -62, 235, 77
  NT -61, 237, 71
  NT -174, 174, -69
  NT -174, 174, -69
  NT -127, 127, -181
  NT -127, 127, -181
  NT -52, 52, -244
  NT -52, 52, -244
  NT 56, -56, -243
  NT 56, -56, -243
  NT 121, -121, -190
  NT 121, -121, -190
  NT 177, -177, -53
  NT 177, -177, -53
  NT 177, -177, 53
  NT 177, -177, 53
  NT 121, -121, 190
  NT 121, -121, 190
  NT 56, -56, 243
  NT 56, -56, 243
  NT -52, 52, 244
  NT -52, 52, 244
  NT -127, 127, 181
  NT -127, 127, 181
  NT -174, 174, 69
  NT -174, 174, 69
  NT -237, 61, -71
  NT -235, 62, -77
  NT -177, 47, -177
  NT -177, 47, -178
  NT -73, 19, -244
  NT -70, 19, -245
  NT 73, -20, -244
  NT 78, -20, -242
  NT 178, -45, -178
  NT 163, -47, -190
  NT 236, -68, -70
  NT 241, -64, -54
  NT 237, -63, 71
  NT 240, -69, 54
  NT 177, -51, 177
  NT 165, -42, 190
  NT 73, -18, 244
  NT 77, -21, 242
  NT -73, 20, 244
  NT -71, 18, 245
  NT -177, 47, 177
  NT -177, 47, 178
  NT -237, 63, 71
  NT -236, 61, 77
  if 0
torus_vnormals:
	dc.l 144
 NT -256, 0, 0
 NT -218, 2, -132
 NT -130, 4, -220
 NT 1, 6, -255
 NT 129, 4, -221
 NT 219, 4, -131
 NT 256, 0, 0
 NT 219, -4, 131
 NT 129, -4, 221
 NT 1, -6, 255
 NT -130, -4, 220
 NT -218, -2, 132
 NT -222, -127, 0
 NT -190, -105, -133
 NT -114, -59, -221
 NT -1, 7, -255
 NT 105, 65, -223
 NT 189, 114, -128
 NT 221, 128, -3
 NT 189, 107, 133
 NT 112, 59, 222
 NT 5, -4, 255
 NT -108, -68, 221
 NT -188, -111, 132
 NT -127, -222, 0
 NT -111, -188, -132
 NT -68, -108, -221
 NT -4, 5, -255
 NT 59, 112, -222
 NT 107, 189, -133
 NT 128, 221, 3
 NT 114, 189, 128
 NT 65, 105, 223
 NT 7, -1, 255
 NT -59, -114, 221
 NT -105, -190, 133
 NT 0, -256, 0
 NT -2, -218, -132
 NT -4, -130, -220
 NT -6, 1, -255
 NT -4, 129, -221
 NT -4, 219, -131
 NT 0, 256, 0
 NT 4, 219, 131
 NT 4, 129, 221
 NT 6, 1, 255
 NT 4, -130, 220
 NT 2, -218, 132
 NT 127, -222, 0
 NT 105, -190, -133
 NT 59, -114, -221
 NT -7, -1, -255
 NT -65, 105, -223
 NT -114, 189, -128
 NT -128, 221, -3
 NT -107, 189, 133
 NT -59, 112, 222
 NT 4, 5, 255
 NT 68, -108, 221
 NT 111, -188, 132
 NT 222, -127, 0
 NT 188, -111, -132
 NT 108, -68, -221
 NT -5, -4, -255
 NT -112, 59, -222
 NT -189, 107, -133
 NT -221, 128, 3
 NT -189, 114, 128
 NT -105, 65, 223
 NT 1, 7, 255
 NT 114, -59, 221
 NT 190, -105, 133
 NT 256, 0, 0
 NT 218, -2, -132
 NT 130, -4, -220
 NT -1, -6, -255
 NT -129, -4, -221
 NT -219, -4, -131
 NT -256, 0, 0
 NT -219, 4, 131
 NT -129, 4, 221
 NT -1, 6, 255
 NT 130, 4, 220
 NT 218, 2, 132
 NT 222, 127, 0
 NT 190, 105, -133
 NT 114, 59, -221
 NT 1, -7, -255
 NT -105, -65, -223
 NT -189, -114, -128
 NT -221, -128, -3
 NT -189, -107, 133
 NT -112, -59, 222
 NT -5, 4, 255
 NT 108, 68, 221
 NT 188, 111, 132
 NT 127, 222, 0
 NT 111, 188, -132
 NT 68, 108, -221
 NT 4, -5, -255
 NT -59, -112, -222
 NT -107, -189, -133
 NT -128, -221, 3
 NT -114, -189, 128
 NT -65, -105, 223
 NT -7, 1, 255
 NT 59, 114, 221
 NT 105, 190, 133
 NT 0, 256, 0
 NT 2, 218, -132
 NT 4, 130, -220
 NT 6, -1, -255
 NT 4, -129, -221
 NT 4, -219, -131
 NT 0, -256, 0
 NT -4, -219, 131
 NT -4, -129, 221
 NT -6, -1, 255
 NT -4, 130, 220
 NT -2, 218, 132
 NT -127, 222, 0
 NT -105, 190, -133
 NT -59, 114, -221
 NT 7, 1, -255
 NT 65, -105, -223
 NT 114, -189, -128
 NT 128, -221, -3
 NT 107, -189, 133
 NT 59, -112, 222
 NT -4, -5, 255
 NT -68, 108, 221
 NT -111, 188, 132
 NT -222, 127, 0
 NT -188, 111, -132
 NT -108, 68, -221
 NT 5, 4, -255
 NT 112, -59, -222
 NT 189, -107, -133
 NT 221, -128, 3
 NT 189, -114, 128
 NT 105, -65, 223
 NT -1, -7, 255
 NT -114, 59, 221
 NT -190, 105, 133
 endif