;-*-asm-*-
	.align 4

kugel_points:
	DC.L 134
 PT  0 , 0 , -100
 PT  26 , 0 , -97
 PT  22 , 13 , -97
 PT  13 , 22 , -97
 PT  0 , 26 , -97
 PT  -13 , 22 , -97
 PT  -22 , 13 , -97
 PT  -26 , 0 , -97
 PT  -22 , -13 , -97
 PT  -13 , -22 , -97
 PT  0 , -26 , -97
 PT  13 , -22 , -97
 PT  22 , -13 , -97
 PT  50 , 0 , -87
 PT  43 , 25 , -87
 PT  25 , 43 , -87
 PT  0 , 50 , -87
 PT  -25 , 43 , -87
 PT  -43 , 25 , -87
 PT  -50 , 0 , -87
 PT  -43 , -25 , -87
 PT  -25 , -43 , -87
 PT  0 , -50 , -87
 PT  25 , -43 , -87
 PT  43 , -25 , -87
 PT  71 , 0 , -71
 PT  61 , 35 , -71
 PT  35 , 61 , -71
 PT  0 , 71 , -71
 PT  -35 , 61 , -71
 PT  -61 , 35 , -71
 PT  -71 , 0 , -71
 PT  -61 , -35 , -71
 PT  -35 , -61 , -71
 PT  0 , -71 , -71
 PT  35 , -61 , -71
 PT  61 , -35 , -71
 PT  87 , 0 , -50
 PT  75 , 43 , -50
 PT  43 , 75 , -50
 PT  0 , 87 , -50
 PT  -43 , 75 , -50
 PT  -75 , 43 , -50
 PT  -87 , 0 , -50
 PT  -75 , -43 , -50
 PT  -43 , -75 , -50
 PT  0 , -87 , -50
 PT  43 , -75 , -50
 PT  75 , -43 , -50
 PT  97 , 0 , -26
 PT  84 , 48 , -26
 PT  48 , 84 , -26
 PT  0 , 97 , -26
 PT  -48 , 84 , -26
 PT  -84 , 48 , -26
 PT  -97 , 0 , -26
 PT  -84 , -48 , -26
 PT  -48 , -84 , -26
 PT  0 , -97 , -26
 PT  48 , -84 , -26
 PT  84 , -48 , -26
 PT  100 , 0 , 0
 PT  87 , 50 , 0
 PT  50 , 87 , 0
 PT  0 , 100 , 0
 PT  -50 , 87 , 0
 PT  -87 , 50 , 0
 PT  -100 , 0 , 0
 PT  -87 , -50 , 0
 PT  -50 , -87 , 0
 PT  0 , -100 , 0
 PT  50 , -87 , 0
 PT  87 , -50 , 0
 PT  97 , 0 , 26
 PT  84 , 48 , 26
 PT  48 , 84 , 26
 PT  0 , 97 , 26
 PT  -48 , 84 , 26
 PT  -84 , 48 , 26
 PT  -97 , 0 , 26
 PT  -84 , -48 , 26
 PT  -48 , -84 , 26
 PT  0 , -97 , 26
 PT  48 , -84 , 26
 PT  84 , -48 , 26
 PT  87 , 0 , 50
 PT  75 , 43 , 50
 PT  43 , 75 , 50
 PT  0 , 87 , 50
 PT  -43 , 75 , 50
 PT  -75 , 43 , 50
 PT  -87 , 0 , 50
 PT  -75 , -43 , 50
 PT  -43 , -75 , 50
 PT  0 , -87 , 50
 PT  43 , -75 , 50
 PT  75 , -43 , 50
 PT  71 , 0 , 71
 PT  61 , 35 , 71
 PT  35 , 61 , 71
 PT  0 , 71 , 71
 PT  -35 , 61 , 71
 PT  -61 , 35 , 71
 PT  -71 , 0 , 71
 PT  -61 , -35 , 71
 PT  -35 , -61 , 71
 PT  0 , -71 , 71
 PT  35 , -61 , 71
 PT  61 , -35 , 71
 PT  50 , 0 , 87
 PT  43 , 25 , 87
 PT  25 , 43 , 87
 PT  0 , 50 , 87
 PT  -25 , 43 , 87
 PT  -43 , 25 , 87
 PT  -50 , 0 , 87
 PT  -43 , -25 , 87
 PT  -25 , -43 , 87
 PT  0 , -50 , 87
 PT  25 , -43 , 87
 PT  43 , -25 , 87
 PT  26 , 0 , 97
 PT  22 , 13 , 97
 PT  13 , 22 , 97
 PT  0 , 26 , 97
 PT  -13 , 22 , 97
 PT  -22 , 13 , 97
 PT  -26 , 0 , 97
 PT  -22 , -13 , 97
 PT  -13 , -22 , 97
 PT  0 , -26 , 97
 PT  13 , -22 , 97
 PT  22 , -13 , 97
 PT  0 , 0 , 100

kugel_faces:
	dc.l 264

col_ball	equ $f010
col_ball1	equ $8810

 tri 2, 0, 1,   col_ball1
 tri 3, 0, 2,   col_ball
 tri 4, 0, 3,   col_ball1
 tri 5, 0, 4,   col_ball
 tri 6, 0, 5,   col_ball1
 tri 7, 0, 6,   col_ball
 tri 8, 0, 7,   col_ball1
 tri 9, 0, 8,   col_ball
 tri 10,0, 9,   col_ball1
 tri 11,0,10,   col_ball
 tri 12,0,11,   col_ball1
 tri 1, 0,12 ,  col_ball
;;; 2nd ring
 tri 14,2,1,   col_ball
 tri 13,14,1,   col_ball
 tri 15,3,2,   col_ball1
 tri 14,15,2,   col_ball1
 tri 16,4,3,   col_ball
 tri 15,16,3,   col_ball
 tri 17,5,4,   col_ball1
 tri 16,17,4,   col_ball1
 tri 18,6,5,   col_ball
 tri 17,18,5,   col_ball
 tri 19,7,6,   col_ball1
 tri 18,19,6,   col_ball1
 tri 20,8,7,   col_ball
 tri 19,20,7,   col_ball
 tri 21,9,8,   col_ball1
 tri 20,21,8,   col_ball1
 tri 22,10,9,  col_ball
 tri 21,22,9,  col_ball
 tri 23,11,10, col_ball1
 tri 22,23,10, col_ball1
 tri 24,12,11, col_ball
 tri 23,24,11, col_ball
 tri 13,1,12,  col_ball1
 tri 24,13,12,  col_ball1
;;; 3rd ring
 tri 26,14,13, col_ball1
 tri 25,26,13, col_ball1
 tri 27,15,14, col_ball
 tri 26,27,14, col_ball
 tri 28,16,15, col_ball1
 tri 27,28,15, col_ball1
 tri 29,17,16, col_ball
 tri 28,29,16, col_ball
 tri 30,18,17, col_ball1
 tri 29,30,17, col_ball1
 tri 31,19,18, col_ball
 tri 30,31,18, col_ball
 tri 32,20,19, col_ball1
 tri 31,32,19, col_ball1
 tri 33,21,20, col_ball
 tri 32,33,20, col_ball
 tri 34,22,21, col_ball1
 tri 33,34,21, col_ball1
 tri 35,23,22, col_ball
 tri 34,35,22, col_ball
 tri 36,24,23, col_ball1
 tri 35,36,23, col_ball1
 tri 25,13,24, col_ball
 tri 36,25,24, col_ball
;;; 4th
 tri 38,26,25, col_ball
 tri 37,38,25, col_ball
 tri 39,27,26, col_ball1
 tri 38,39,26, col_ball1
 tri 40,28,27, col_ball
 tri 39,40,27, col_ball
 tri 41,29,28, col_ball1
 tri 40,41,28, col_ball1
 tri 42,30,29, col_ball
 tri 41,42,29, col_ball
 tri 43,31,30, col_ball1
 tri 42,43,30, col_ball1
 tri 44,32,31, col_ball
 tri 43,44,31, col_ball
 tri 45,33,32, col_ball1
 tri 44,45,32, col_ball1
 tri 46,34,33, col_ball
 tri 45,46,33, col_ball
 tri 47,35,34, col_ball1
 tri 46,47,34, col_ball1
 tri 48,36,35, col_ball
 tri 47,48,35, col_ball
 tri 37,25,36, col_ball1
 tri 48,37,36, col_ball1
;;; 5th
 tri 50,38,37, col_ball1
 tri 49,50,37, col_ball1
 tri 51,39,38, col_ball
 tri 50,51,38, col_ball
 tri 52,40,39, col_ball1
 tri 51,52,39, col_ball1
 tri 53,41,40, col_ball
 tri 52,53,40, col_ball
 tri 54,42,41, col_ball1
 tri 53,54,41, col_ball1
 tri 55,43,42, col_ball
 tri 54,55,42, col_ball
 tri 56,44,43, col_ball1
 tri 55,56,43, col_ball1
 tri 57,45,44, col_ball
 tri 56,57,44, col_ball
 tri 58,46,45, col_ball1
 tri 57,58,45, col_ball1
 tri 59,47,46, col_ball
 tri 58,59,46, col_ball
 tri 60,48,47, col_ball1
 tri 59,60,47, col_ball1
 tri 49,37,48, col_ball
 tri 60,49,48, col_ball
;;; 6th
 tri 62,50,49, col_ball
 tri 61,62,49, col_ball
 tri 63,51,50, col_ball1
 tri 62,63,50, col_ball1
 tri 64,52,51, col_ball
 tri 63,64,51, col_ball
 tri 65,53,52, col_ball1
 tri 64,65,52, col_ball1
 tri 66,54,53, col_ball
 tri 65,66,53, col_ball
 tri 67,55,54, col_ball1
 tri 66,67,54, col_ball1
 tri 68,56,55, col_ball
 tri 67,68,55, col_ball
 tri 69,57,56, col_ball1
 tri 68,69,56, col_ball1
 tri 70,58,57, col_ball
 tri 69,70,57, col_ball
 tri 71,59,58, col_ball1
 tri 70,71,58, col_ball1
 tri 72,60,59, col_ball
 tri 71,72,59, col_ball
 tri 61,49,60, col_ball1
 tri 72,61,60, col_ball1
;;; 7th
 tri 74,62,61, col_ball1
 tri 73,74,61, col_ball1
 tri 75,63,62, col_ball
 tri 74,75,62, col_ball
 tri 76,64,63, col_ball1
 tri 75,76,63, col_ball1
 tri 77,65,64, col_ball
 tri 76,77,64, col_ball
 tri 78,66,65, col_ball1
 tri 77,78,65, col_ball1
 tri 79,67,66, col_ball
 tri 78,79,66, col_ball
 tri 80,68,67, col_ball1
 tri 79,80,67, col_ball1
 tri 81,69,68, col_ball
 tri 80,81,68, col_ball
 tri 82,70,69, col_ball1
 tri 81,82,69, col_ball1
 tri 83,71,70, col_ball
 tri 82,83,70, col_ball
 tri 84,72,71, col_ball1
 tri 83,84,71, col_ball1
 tri 73,61,72, col_ball
 tri 84,73,72, col_ball
;;; 8th
 tri 86,74,73,  col_ball
 tri 85,86,73,  col_ball
 tri 87,75,74,  col_ball1
 tri 86,87,74,  col_ball1
 tri 88,76,75,  col_ball
 tri 87,88,75,  col_ball
 tri 89,77,76,  col_ball1
 tri 88,89,76,  col_ball1
 tri 90,78,77,  col_ball
 tri 89,90,77,  col_ball
 tri 91,79,78,  col_ball1
 tri 90,91,78,  col_ball1
 tri 92,80,79,  col_ball
 tri 91,92,79,  col_ball
 tri 93,81,80,  col_ball1
 tri 92,93,80,  col_ball1
 tri 94,82,81,  col_ball
 tri 93,94,81,  col_ball
 tri 95,83,82,  col_ball1
 tri 94,95,82,  col_ball1
 tri 96,84,83,  col_ball
 tri 95,96,83,  col_ball
 tri 85,73,84,  col_ball1
 tri 96,85,84,  col_ball1
;;; 9th
 tri 98,86,85,  col_ball1
 tri 97  ,98,85,col_ball1
 tri 99,87,86,  col_ball
 tri 98  ,99,86,col_ball
 tri 100,88,87, col_ball1
 tri 99 ,100,87,col_ball1
 tri 101,89,88, col_ball
 tri 100,101,88,col_ball
 tri 102,90,89, col_ball1
 tri 101,102,89,col_ball1
 tri 103,91,90, col_ball
 tri 102,103,90,col_ball
 tri 104,92,91, col_ball1
 tri 103,104,91,col_ball1
 tri 105,93,92, col_ball
 tri 104,105,92,col_ball
 tri 106,94,93, col_ball1
 tri 105,106,93,col_ball1
 tri 107,95,94, col_ball
 tri 106,107,94,col_ball
 tri 108,96,95, col_ball1
 tri 107,108,95,col_ball1
 tri 97,85,96, col_ball
 tri 108 ,97,96,col_ball
;;; 10th
 tri 110,98,97,   col_ball
 tri 109 ,110,97, col_ball
 tri 111,99,98,   col_ball1
 tri 110 ,111,98, col_ball1
 tri 112,100,99,  col_ball
 tri 111,112,99,  col_ball
 tri 113,101,100, col_ball1
 tri 112,113,100, col_ball1
 tri 114,102,101, col_ball
 tri 113,114,101, col_ball
 tri 115,103,102, col_ball1
 tri 114,115,102, col_ball1
 tri 116,104,103, col_ball
 tri 115,116,103, col_ball
 tri 117,105,104, col_ball1
 tri 116,117,104, col_ball1
 tri 118,106,105, col_ball
 tri 117,118,105, col_ball
 tri 119,107,106, col_ball1
 tri 118,119,106, col_ball1
 tri 120,108,107, col_ball
 tri 119,120,107, col_ball
 tri 109, 97,108, col_ball1
 tri 120,109,108, col_ball1
;;; 11th
 tri 122,110,109, col_ball1
 tri 121,122,109, col_ball1
 tri 123,111,110, col_ball
 tri 122,123,110, col_ball
 tri 124,112,111, col_ball1
 tri 123,124,111, col_ball1
 tri 125,113,112, col_ball
 tri 124,125,112, col_ball
 tri 126,114,113, col_ball1
 tri 125,126,113, col_ball1
 tri 127,115,114, col_ball
 tri 126,127,114, col_ball
 tri 128,116,115, col_ball1
 tri 127,128,115, col_ball1
 tri 129,117,116, col_ball
 tri 128,129,116, col_ball
 tri 130,118,117, col_ball1
 tri 129,130,117, col_ball1
 tri 131,119,118, col_ball
 tri 130,131,118, col_ball
 tri 132,120,119, col_ball1
 tri 131,132,119, col_ball1
 tri 121,109,120, col_ball
 tri 132,121,120, col_ball

 tri 121,133,122, col_ball
 tri 122,133,123, col_ball1
 tri 123,133,124, col_ball
 tri 124,133,125, col_ball1
 tri 125,133,126, col_ball
 tri 126,133,127, col_ball1
 tri 127,133,128, col_ball
 tri 128,133,129, col_ball1
 tri 129,133,130, col_ball
 tri 130,133,131, col_ball1
 tri 131,133,132, col_ball
 tri 132,133,121, col_ball1

	align 4
kugel_normals:
	dc.l 264
 NT  -27 , -9 , 254
 NT  -19 , -19 , 254
 NT  -9 , -27 , 254
 NT  9 , -27 , 254
 NT  19 , -19 , 254
 NT  27 , -9 , 254
 NT  27 , 9 , 254
 NT  19 , 19 , 254
 NT  9 , 27 , 254
 NT  -9 , 27 , 254
 NT  -19 , 19 , 254
 NT  -27 , 9 , 254
 NT  -94 , -29 , 236
 NT  -97 , -26 , 235
 NT  -70 , -70 , 235
 NT  -71 , -71 , 235
 NT  -30 , -96 , 235
 NT  -26 , -96 , 235
 NT  29 , -94 , 236
 NT  26 , -97 , 235
 NT  70 , -70 , 235
 NT  71 , -71 , 235
 NT  96 , -30 , 235
 NT  96 , -26 , 235
 NT  94 , 29 , 236
 NT  97 , 26 , 235
 NT  70 , 70 , 235
 NT  71 , 71 , 235
 NT  30 , 96 , 235
 NT  26 , 96 , 235
 NT  -29 , 94 , 236
 NT  -26 , 97 , 235
 NT  -70 , 70 , 235
 NT  -71 , 71 , 235
 NT  -96 , 30 , 235
 NT  -96 , 26 , 235
 NT  -153 , -43 , 200
 NT  -153 , -43 , 200
 NT  -113 , -113 , 199
 NT  -113 , -113 , 199
 NT  -42 , -153 , 200
 NT  -43 , -153 , 199
 NT  43 , -153 , 200
 NT  43 , -153 , 200
 NT  113 , -113 , 199
 NT  113 , -113 , 199
 NT  153 , -42 , 200
 NT  153 , -43 , 199
 NT  153 , 43 , 200
 NT  153 , 43 , 200
 NT  113 , 113 , 199
 NT  113 , 113 , 199
 NT  42 , 153 , 200
 NT  43 , 153 , 199
 NT  -43 , 153 , 200
 NT  -43 , 153 , 200
 NT  -113 , 113 , 199
 NT  -113 , 113 , 199
 NT  -153 , 42 , 200
 NT  -153 , 43 , 199
 NT  -197 , -56 , 153
 NT  -198 , -55 , 151
 NT  -145 , -145 , 152
 NT  -145 , -145 , 152
 NT  -56 , -198 , 151
 NT  -55 , -197 , 152
 NT  56 , -197 , 153
 NT  55 , -198 , 151
 NT  145 , -145 , 152
 NT  145 , -145 , 152
 NT  198 , -56 , 151
 NT  197 , -55 , 152
 NT  197 , 56 , 153
 NT  198 , 55 , 151
 NT  145 , 145 , 152
 NT  145 , 145 , 152
 NT  56 , 198 , 151
 NT  55 , 197 , 152
 NT  -56 , 197 , 153
 NT  -55 , 198 , 151
 NT  -145 , 145 , 152
 NT  -145 , 145 , 152
 NT  -198 , 56 , 151
 NT  -197 , 55 , 152
 NT  -227 , -63 , 98
 NT  -229 , -62 , 95
 NT  -167 , -167 , 97
 NT  -167 , -167 , 97
 NT  -63 , -228 , 94
 NT  -61 , -228 , 98
 NT  63 , -227 , 98
 NT  62 , -229 , 95
 NT  167 , -167 , 97
 NT  167 , -167 , 97
 NT  228 , -63 , 94
 NT  228 , -61 , 98
 NT  227 , 63 , 98
 NT  229 , 62 , 95
 NT  167 , 167 , 97
 NT  167 , 167 , 97
 NT  63 , 228 , 94
 NT  61 , 228 , 98
 NT  -63 , 227 , 98
 NT  -62 , 229 , 95
 NT  -167 , 167 , 97
 NT  -167 , 167 , 97
 NT  -228 , 63 , 94
 NT  -228 , 61 , 98
 NT  -245 , -65 , 32
 NT  -246 , -63 , 28
 NT  -179 , -179 , 34
 NT  -179 , -179 , 34
 NT  -66 , -245 , 28
 NT  -63 , -245 , 33
 NT  65 , -245 , 32
 NT  63 , -246 , 28
 NT  179 , -179 , 34
 NT  179 , -179 , 34
 NT  245 , -66 , 28
 NT  245 , -63 , 33
 NT  245 , 65 , 32
 NT  246 , 63 , 28
 NT  179 , 179 , 34
 NT  179 , 179 , 34
 NT  66 , 245 , 28
 NT  63 , 245 , 33
 NT  -65 , 245 , 32
 NT  -63 , 246 , 28
 NT  -179 , 179 , 34
 NT  -179 , 179 , 34
 NT  -245 , 66 , 28
 NT  -245 , 63 , 33
 NT  -245 , -63 , -33
 NT  -245 , -66 , -28
 NT  -179 , -179 , -34
 NT  -179 , -179 , -34
 NT  -63 , -246 , -28
 NT  -65 , -245 , -32
 NT  63 , -245 , -33
 NT  66 , -245 , -28
 NT  179 , -179 , -34
 NT  179 , -179 , -34
 NT  246 , -63 , -28
 NT  245 , -65 , -32
 NT  245 , 63 , -33
 NT  245 , 66 , -28
 NT  179 , 179 , -34
 NT  179 , 179 , -34
 NT  63 , 246 , -28
 NT  65 , 245 , -32
 NT  -63 , 245 , -33
 NT  -66 , 245 , -28
 NT  -179 , 179 , -34
 NT  -179 , 179 , -34
 NT  -246 , 63 , -28
 NT  -245 , 65 , -32
 NT  -228 , -61 , -98
 NT  -228 , -63 , -94
 NT  -167 , -167 , -97
 NT  -167 , -167 , -97
 NT  -62 , -229 , -95
 NT  -63 , -227 , -98
 NT  61 , -228 , -98
 NT  63 , -228 , -94
 NT  167 , -167 , -97
 NT  167 , -167 , -97
 NT  229 , -62 , -95
 NT  227 , -63 , -98
 NT  228 , 61 , -98
 NT  228 , 63 , -94
 NT  167 , 167 , -97
 NT  167 , 167 , -97
 NT  62 , 229 , -95
 NT  63 , 227 , -98
 NT  -61 , 228 , -98
 NT  -63 , 228 , -94
 NT  -167 , 167 , -97
 NT  -167 , 167 , -97
 NT  -229 , 62 , -95
 NT  -227 , 63 , -98
 NT  -197 , -55 , -152
 NT  -198 , -56 , -151
 NT  -145 , -145 , -152
 NT  -145 , -145 , -152
 NT  -55 , -198 , -151
 NT  -56 , -197 , -153
 NT  55 , -197 , -152
 NT  56 , -198 , -151
 NT  145 , -145 , -152
 NT  145 , -145 , -152
 NT  198 , -55 , -151
 NT  197 , -56 , -153
 NT  197 , 55 , -152
 NT  198 , 56 , -151
 NT  145 , 145 , -152
 NT  145 , 145 , -152
 NT  55 , 198 , -151
 NT  56 , 197 , -153
 NT  -55 , 197 , -152
 NT  -56 , 198 , -151
 NT  -145 , 145 , -152
 NT  -145 , 145 , -152
 NT  -198 , 55 , -151
 NT  -197 , 56 , -153
 NT  -153 , -43 , -199
 NT  -153 , -42 , -200
 NT  -113 , -113 , -199
 NT  -113 , -113 , -199
 NT  -43 , -153 , -200
 NT  -43 , -153 , -200
 NT  43 , -153 , -199
 NT  42 , -153 , -200
 NT  113 , -113 , -199
 NT  113 , -113 , -199
 NT  153 , -43 , -200
 NT  153 , -43 , -200
 NT  153 , 43 , -199
 NT  153 , 42 , -200
 NT  113 , 113 , -199
 NT  113 , 113 , -199
 NT  43 , 153 , -200
 NT  43 , 153 , -200
 NT  -43 , 153 , -199
 NT  -42 , 153 , -200
 NT  -113 , 113 , -199
 NT  -113 , 113 , -199
 NT  -153 , 43 , -200
 NT  -153 , 43 , -200
 NT  -96 , -26 , -235
 NT  -96 , -30 , -235
 NT  -71 , -71 , -235
 NT  -70 , -70 , -235
 NT  -26 , -97 , -235
 NT  -29 , -94 , -236
 NT  26 , -96 , -235
 NT  30 , -96 , -235
 NT  71 , -71 , -235
 NT  70 , -70 , -235
 NT  97 , -26 , -235
 NT  94 , -29 , -236
 NT  96 , 26 , -235
 NT  96 , 30 , -235
 NT  71 , 71 , -235
 NT  70 , 70 , -235
 NT  26 , 97 , -235
 NT  29 , 94 , -236
 NT  -26 , 96 , -235
 NT  -30 , 96 , -235
 NT  -71 , 71 , -235
 NT  -70 , 70 , -235
 NT  -97 , 26 , -235
 NT  -94 , 29 , -236
 NT  -27 , -9 , -254
 NT  -19 , -19 , -254
 NT  -9 , -27 , -254
 NT  9 , -27 , -254
 NT  19 , -19 , -254
 NT  27 , -9 , -254
 NT  27 , 9 , -254
 NT  19 , 19 , -254
 NT  9 , 27 , -254
 NT  -9 , 27 , -254
 NT  -19 , 19 , -254
 NT  -27 , 9 , -254

kugel_vnormals:
 dc.l  134
 VNT  0 , 0 , 256
 VNT  -69 , -4 , 246
 VNT  -56 , -39 , 246
 VNT  -30 , -62 , 246
 VNT  4 , -69 , 246
 VNT  39 , -56 , 246
 VNT  62 , -30 , 246
 VNT  69 , 4 , 246
 VNT  56 , 39 , 246
 VNT  30 , 62 , 246
 VNT  -4 , 69 , 246
 VNT  -39 , 56 , 246
 VNT  -62 , 30 , 246
 VNT  -127 , -2 , 222
 VNT  -108 , -66 , 221
 VNT  -62 , -111 , 221
 VNT  2 , -127 , 222
 VNT  66 , -108 , 221
 VNT  111 , -62 , 221
 VNT  127 , 2 , 222
 VNT  108 , 66 , 221
 VNT  62 , 111 , 221
 VNT  -2 , 127 , 222
 VNT  -66 , 108 , 221
 VNT  -111 , 62 , 221
 VNT  -181 , -2 , 181
 VNT  -155 , -93 , 181
 VNT  -90 , -157 , 180
 VNT  2 , -181 , 181
 VNT  93 , -155 , 181
 VNT  157 , -90 , 180
 VNT  181 , 2 , 181
 VNT  155 , 93 , 181
 VNT  90 , 157 , 180
 VNT  -2 , 181 , 181
 VNT  -93 , 155 , 181
 VNT  -157 , 90 , 180
 VNT  -221 , 0 , 128
 VNT  -190 , -112 , 129
 VNT  -110 , -191 , 128
 VNT  0 , -221 , 128
 VNT  112 , -190 , 129
 VNT  191 , -110 , 128
 VNT  221 , 0 , 128
 VNT  190 , 112 , 129
 VNT  110 , 191 , 128
 VNT  0 , 221 , 128
 VNT  -112 , 190 , 129
 VNT  -191 , 110 , 128
 VNT  -247 , 0 , 64
 VNT  -213 , -124 , 67
 VNT  -122 , -214 , 67
 VNT  0 , -247 , 64
 VNT  124 , -213 , 67
 VNT  214 , -122 , 67
 VNT  247 , 0 , 64
 VNT  213 , 124 , 67
 VNT  122 , 214 , 67
 VNT  0 , 247 , 64
 VNT  -124 , 213 , 67
 VNT  -214 , 122 , 67
 VNT  -256 , 0 , 0
 VNT  -222 , -127 , 0
 VNT  -127 , -222 , 0
 VNT  0 , -256 , 0
 VNT  127 , -222 , 0
 VNT  222 , -127 , 0
 VNT  256 , 0 , 0
 VNT  222 , 127 , 0
 VNT  127 , 222 , 0
 VNT  0 , 256 , 0
 VNT  -127 , 222 , 0
 VNT  -222 , 127 , 0
 VNT  -247 , 0 , -64
 VNT  -214 , -122 , -67
 VNT  -124 , -213 , -67
 VNT  0 , -247 , -64
 VNT  122 , -214 , -67
 VNT  213 , -124 , -67
 VNT  247 , 0 , -64
 VNT  214 , 122 , -67
 VNT  124 , 213 , -67
 VNT  0 , 247 , -64
 VNT  -122 , 214 , -67
 VNT  -213 , 124 , -67
 VNT  -221 , 0 , -128
 VNT  -191 , -110 , -128
 VNT  -112 , -190 , -129
 VNT  0 , -221 , -128
 VNT  110 , -191 , -128
 VNT  190 , -112 , -129
 VNT  221 , 0 , -128
 VNT  191 , 110 , -128
 VNT  112 , 190 , -129
 VNT  0 , 221 , -128
 VNT  -110 , 191 , -128
 VNT  -190 , 112 , -129
 VNT  -181 , 2 , -181
 VNT  -157 , -90 , -180
 VNT  -93 , -155 , -181
 VNT  -2 , -181 , -181
 VNT  90 , -157 , -180
 VNT  155 , -93 , -181
 VNT  181 , -2 , -181
 VNT  157 , 90 , -180
 VNT  93 , 155 , -181
 VNT  2 , 181 , -181
 VNT  -90 , 157 , -180
 VNT  -155 , 93 , -181
 VNT  -127 , 2 , -222
 VNT  -111 , -62 , -221
 VNT  -66 , -108 , -221
 VNT  -2 , -127 , -222
 VNT  62 , -111 , -221
 VNT  108 , -66 , -221
 VNT  127 , -2 , -222
 VNT  111 , 62 , -221
 VNT  66 , 108 , -221
 VNT  2 , 127 , -222
 VNT  -62 , 111 , -221
 VNT  -108 , 66 , -221
 VNT  -69 , 4 , -246
 VNT  -62 , -30 , -246
 VNT  -39 , -56 , -246
 VNT  -4 , -69 , -246
 VNT  30 , -62 , -246
 VNT  56 , -39 , -246
 VNT  69 , -4 , -246
 VNT  62 , 30 , -246
 VNT  39 , 56 , -246
 VNT  4 , 69 , -246
 VNT  -30 , 62 , -246
 VNT  -56 , 39 , -246
 VNT  0 , 0 , -256
