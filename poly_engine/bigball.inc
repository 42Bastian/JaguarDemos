;-*-asm-*-
	.align 4

kugel_points:
	DC.L 134
	PT $0000,$0000,$FFFFFf9c
	PT $001A,$0000,$FFFFFF9F
	PT $0016,$000D,$FFFFFF9F
	PT $000D,$0016,$FFFFFF9F ; 0
	PT $0000,$001A,$FFFFFF9F
	PT $FFFFFFF3,$0016,$FFFFFF9F
	PT $FFFFFFEA,$000D,$FFFFFF9F
	PT $FFFFFFE6,$0000,$FFFFFF9F ; 4
	PT $FFFFFFEA,$FFFFFFF3,$FFFFFF9F
	PT $FFFFFFF3,$FFFFFFEA,$FFFFFF9F
	PT $0000,$FFFFFFE6,$FFFFFF9F
	PT $000D,$FFFFFFEA,$FFFFFF9F ; 8
	PT $0016,$FFFFFFF3,$FFFFFF9F
	PT $0032,$0000,$FFFFFFA9
	PT $002B,$0019,$FFFFFFA9
	PT $0019,$002B,$FFFFFFA9 ; 12
	PT $0000,$0032,$FFFFFFA9
	PT $FFFFFFE7,$002B,$FFFFFFA9
	PT $FFFFFFD5,$0019,$FFFFFFA9
	PT $FFFFFFCE,$0000,$FFFFFFA9 ; 16
	PT $FFFFFFD5,$FFFFFFE7,$FFFFFFA9
	PT $FFFFFFE7,$FFFFFFD5,$FFFFFFA9
	PT $0000,$FFFFFFCE,$FFFFFFA9
	PT $0019,$FFFFFFD5,$FFFFFFA9 ; 20
	PT $002B,$FFFFFFE7,$FFFFFFA9
	PT $0047,$0000,$FFFFFFB9
	PT $003D,$0023,$FFFFFFB9
	PT $0023,$003D,$FFFFFFB9 ; 24
	PT $0000,$0047,$FFFFFFB9
	PT $FFFFFFDD,$003D,$FFFFFFB9
	PT $FFFFFFC3,$0023,$FFFFFFB9
	PT $FFFFFFB9,$0000,$FFFFFFB9 ; 28
	PT $FFFFFFC3,$FFFFFFDD,$FFFFFFB9
	PT $FFFFFFDD,$FFFFFFC3,$FFFFFFB9
	PT $0000,$FFFFFFB9,$FFFFFFB9
	PT $0023,$FFFFFFC3,$FFFFFFB9 ; 32
	PT $003D,$FFFFFFDD,$FFFFFFB9
	PT $0057,$0000,$FFFFFFCE
	PT $004B,$002B,$FFFFFFCE
	PT $002B,$004B,$FFFFFFCE ; 36
	PT $0000,$0057,$FFFFFFCE
	PT $FFFFFFD5,$004B,$FFFFFFCE
	PT $FFFFFFB5,$002B,$FFFFFFCE
	PT $FFFFFFA9,$0000,$FFFFFFCE ; 40
	PT $FFFFFFB5,$FFFFFFD5,$FFFFFFCE
	PT $FFFFFFD5,$FFFFFFB5,$FFFFFFCE
	PT $0000,$FFFFFFA9,$FFFFFFCE
	PT $002B,$FFFFFFB5,$FFFFFFCE ; 44
	PT $004B,$FFFFFFD5,$FFFFFFCE
	PT $0061,$0000,$FFFFFFE6
	PT $0054,$0030,$FFFFFFE6
	PT $0030,$0054,$FFFFFFE6 ; 48
	PT $0000,$0061,$FFFFFFE6
	PT $FFFFFFD0,$0054,$FFFFFFE6
	PT $FFFFFFAC,$0030,$FFFFFFE6
	PT $FFFFFF9F,$0000,$FFFFFFE6 ; 52
	PT $FFFFFFAC,$FFFFFFD0,$FFFFFFE6
	PT $FFFFFFD0,$FFFFFFAC,$FFFFFFE6
	PT $0000,$FFFFFF9F,$FFFFFFE6
	PT $0030,$FFFFFFAC,$FFFFFFE6 ; 56
	PT $0054,$FFFFFFD0,$FFFFFFE6
	PT $0064,$0000,$0000
	PT $0057,$0032,$0000
	PT $0032,$0057,$0000 ; 60
	PT $0000,$0064,$0000
	PT $FFFFFFCE,$0057,$0000
	PT $FFFFFFA9,$0032,$0000; 64
	PT $FFFFFF9C,$0000,$0000 ; 67
	PT $FFFFFFA9,$FFFFFFCE,$0000
	PT $FFFFFFCE,$FFFFFFA9,$0000
	PT $0000,$FFFFFF9C,$0000
	PT $0032,$FFFFFFA9,$0000 ; 68
	PT $0057,$FFFFFFCE,$0000
	PT $0061,$0000,$001A
	PT $0054,$0030,$001A
	PT $0030,$0054,$001A ; 72
	PT $0000,$0061,$001A
	PT $FFFFFFD0,$0054,$001A
	PT $FFFFFFAC,$0030,$001A
	PT $FFFFFF9F,$0000,$001A ; 76
	PT $FFFFFFAC,$FFFFFFD0,$001A
	PT $FFFFFFD0,$FFFFFFAC,$001A
	PT $0000,$FFFFFF9F,$001A
	PT $0030,$FFFFFFAC,$001A ; 80
	PT $0054,$FFFFFFD0,$001A
	PT $0057,$0000,$0032
	PT $004B,$002B,$0032
	PT $002B,$004B,$0032 ; 84
	PT $0000,$0057,$0032
	PT $FFFFFFD5,$004B,$0032
	PT $FFFFFFB5,$002B,$0032
	PT $FFFFFFA9,$0000,$0032 ; 88
	PT $FFFFFFB5,$FFFFFFD5,$0032
	PT $FFFFFFD5,$FFFFFFB5,$0032
	PT $0000,$FFFFFFA9,$0032
	PT $002B,$FFFFFFB5,$0032 ; 92
	PT $004B,$FFFFFFD5,$0032
	PT $0047,$0000,$0047
	PT $003D,$0023,$0047
	PT $0023,$003D,$0047 ; 96
	PT $0000,$0047,$0047
	PT $FFFFFFDD,$003D,$0047
	PT $FFFFFFC3,$0023,$0047
	PT $FFFFFFB9,$0000,$0047 ; 100
	PT $FFFFFFC3,$FFFFFFDD,$0047
	PT $FFFFFFDD,$FFFFFFC3,$0047
	PT $0000,$FFFFFFB9,$0047
	PT $0023,$FFFFFFC3,$0047 ; 104
	PT $003D,$FFFFFFDD,$0047
	PT $0032,$0000,$0057
	PT $002B,$0019,$0057
	PT $0019,$002B,$0057 ; 108
	PT $0000,$0032,$0057
	PT $FFFFFFE7,$002B,$0057
	PT $FFFFFFD5,$0019,$0057
	PT $FFFFFFCE,$0000,$0057 ; 112
	PT $FFFFFFD5,$FFFFFFE7,$0057
	PT $FFFFFFE7,$FFFFFFD5,$0057
	PT $0000,$FFFFFFCE,$0057
	PT $0019,$FFFFFFD5,$0057 ; 116
	PT $002B,$FFFFFFE7,$0057
	PT $001A,$0000,$0061
	PT $0016,$000D,$0061
	PT $000D,$0016,$0061 ; 120
	PT $0000,$001A,$0061
	PT $FFFFFFF3,$0016,$0061
	PT $FFFFFFEA,$000D,$0061
	PT $FFFFFFE6,$0000,$0061 ; 124
	PT $FFFFFFEA,$FFFFFFF3,$0061
	PT $FFFFFFF3,$FFFFFFEA,$0061
	PT $0000,$FFFFFFE6,$0061
	PT $000D,$FFFFFFEA,$0061 ; 128
	PT $0016,$FFFFFFF3,$0061
	PT $0000,$0000,$0064 ; 132

kugel_faces:
	dc.l (24+120*2)

col_ball	equ $f030


 tri 0,2,1,   $f040
 tri 0,3,2,   $f040
 tri 0,4,3,   $f040
 tri 0,5,4,   $f040
 tri 0,6,5,   $f040
 tri 0,7,6,   $f040
 tri 0,8,7,   $f040
 tri 0,9,8,   $f040
 tri 0,10,9,  $ff40
 tri 0,11,10, $ff40
 tri 0,12,11, $f040
 tri 0,1,12 , $f040

;;; 2nd ring
 tri 14,2,1,   col_ball
 tri 13,14,1,   col_ball
 tri 15,3,2,   col_ball
 tri 14,15,2,   col_ball
 tri 16,4,3,   col_ball
 tri 15,16,3,   col_ball
 tri 17,5,4,   col_ball
 tri 16,17,4,   col_ball
 tri 18,6,5,   col_ball
 tri 17,18,5,   col_ball
 tri 19,7,6,   col_ball
 tri 18,19,6,   col_ball
 tri 20,8,7,   col_ball
 tri 19,20,7,   col_ball
 tri 21,9,8,   col_ball
 tri 20,21,8,   col_ball
 tri 22,10,9,  col_ball
 tri 21,22,9,  col_ball
 tri 23,11,10, col_ball
 tri 22,23,10, col_ball
 tri 24,12,11, col_ball
 tri 23,24,11, col_ball
 tri 13,1,12,  col_ball
 tri 24,13,12,  col_ball
;;; 3rd ring
 tri 26,14,13, col_ball
 tri 25,26,13, col_ball
 tri 27,15,14, col_ball
 tri 26,27,14, col_ball
 tri 28,16,15, col_ball
 tri 27,28,15, col_ball
 tri 29,17,16, col_ball
 tri 28,29,16, col_ball
 tri 30,18,17, col_ball
 tri 29,30,17, col_ball
 tri 31,19,18, col_ball
 tri 30,31,18, col_ball
 tri 32,20,19, col_ball
 tri 31,32,19, col_ball
 tri 33,21,20, col_ball
 tri 32,33,20, col_ball
 tri 34,22,21, col_ball
 tri 33,34,21, col_ball
 tri 35,23,22, col_ball
 tri 34,35,22, col_ball
 tri 36,24,23, col_ball
 tri 35,36,23, col_ball
 tri 25,13,24, col_ball
 tri 36,25,24, col_ball
;;; 4th
 tri 38,26,25, col_ball
 tri 37,38,25, col_ball
 tri 39,27,26, col_ball
 tri 38,39,26, col_ball
 tri 40,28,27, col_ball
 tri 39,40,27, col_ball
 tri 41,29,28, col_ball
 tri 40,41,28, col_ball
 tri 42,30,29, col_ball
 tri 41,42,29, col_ball
 tri 43,31,30, col_ball
 tri 42,43,30, col_ball
 tri 44,32,31, col_ball
 tri 43,44,31, col_ball
 tri 45,33,32, col_ball
 tri 44,45,32, col_ball
 tri 46,34,33, col_ball
 tri 45,46,33, col_ball
 tri 47,35,34, col_ball
 tri 46,47,34, col_ball
 tri 48,36,35, col_ball
 tri 47,48,35, col_ball
 tri 37,25,36, col_ball
 tri 48,37,36, col_ball
;;; 5th
 tri 50,38,37, col_ball
 tri 49,50,37, col_ball
 tri 51,39,38, col_ball
 tri 50,51,38, col_ball
 tri 52,40,39, col_ball
 tri 51,52,39, col_ball
 tri 53,41,40, col_ball
 tri 52,53,40, col_ball
 tri 54,42,41, col_ball
 tri 53,54,41, col_ball
 tri 55,43,42, col_ball
 tri 54,55,42, col_ball
 tri 56,44,43, col_ball
 tri 55,56,43, col_ball
 tri 57,45,44, col_ball
 tri 56,57,44, col_ball
 tri 58,46,45, col_ball
 tri 57,58,45, col_ball
 tri 59,47,46, col_ball
 tri 58,59,46, col_ball
 tri 60,48,47, col_ball
 tri 59,60,47, col_ball
 tri 49,37,48, col_ball
 tri 60,49,48, col_ball
;;; 6th
 tri 62,50,49, col_ball
 tri 61,62,49, col_ball
 tri 63,51,50, col_ball
 tri 62,63,50, col_ball
 tri 64,52,51, col_ball
 tri 63,64,51, col_ball
 tri 65,53,52, col_ball
 tri 64,65,52, col_ball
 tri 66,54,53, col_ball
 tri 65,66,53, col_ball
 tri 67,55,54, col_ball
 tri 66,67,54, col_ball
 tri 68,56,55, col_ball
 tri 67,68,55, col_ball
 tri 69,57,56, col_ball
 tri 68,69,56, col_ball
 tri 70,58,57, col_ball
 tri 69,70,57, col_ball
 tri 71,59,58, col_ball
 tri 70,71,58, col_ball
 tri 72,60,59, col_ball
 tri 71,72,59, col_ball
 tri 61,49,60, col_ball
 tri 72,61,60, col_ball
;;; 7th
 tri 74,62,61, col_ball
 tri 73,74,61, col_ball
 tri 75,63,62, col_ball
 tri 74,75,62, col_ball
 tri 76,64,63, col_ball
 tri 75,76,63, col_ball
 tri 77,65,64, col_ball
 tri 76,77,64, col_ball
 tri 78,66,65, col_ball
 tri 77,78,65, col_ball
 tri 79,67,66, col_ball
 tri 78,79,66, col_ball
 tri 80,68,67, col_ball
 tri 79,80,67, col_ball
 tri 81,69,68, col_ball
 tri 80,81,68, col_ball
 tri 82,70,69, col_ball
 tri 81,82,69, col_ball
 tri 83,71,70, col_ball
 tri 82,83,70, col_ball
 tri 84,72,71, col_ball
 tri 83,84,71, col_ball
 tri 73,61,72, col_ball
 tri 84,73,72, col_ball
;;; 8th
 tri 86,74,73,  col_ball
 tri 85,86,73,  col_ball
 tri 87,75,74,  col_ball
 tri 86,87,74,  col_ball
 tri 88,76,75,  col_ball
 tri 87,88,75,  col_ball
 tri 89,77,76,  col_ball
 tri 88,89,76,  col_ball
 tri 90,78,77,  col_ball
 tri 89,90,77,  col_ball
 tri 91,79,78,  col_ball
 tri 90,91,78,  col_ball
 tri 92,80,79,  col_ball
 tri 91,92,79,  col_ball
 tri 93,81,80,  col_ball
 tri 92,93,80,  col_ball
 tri 94,82,81,  col_ball
 tri 93,94,81,  col_ball
 tri 95,83,82,  col_ball
 tri 94,95,82,  col_ball
 tri 96,84,83,  col_ball
 tri 95,96,83,  col_ball
 tri 85,73,84,  col_ball
 tri 96,85,84,  col_ball
;;; 9th
 tri 98,86,85,col_ball
 tri 97  ,98,85,col_ball
 tri 99,87,86,col_ball
 tri 98  ,99,86,col_ball
 tri 100,88,87,col_ball
 tri 99 ,100,87,col_ball
 tri 101,89,88,col_ball
 tri 100,101,88,col_ball
 tri 102,90,89,col_ball
 tri 101,102,89,col_ball
 tri 103,91,90,col_ball
 tri 102,103,90,col_ball
 tri 104,92,91,col_ball
 tri 103,104,91,col_ball
 tri 105,93,92,col_ball
 tri 104,105,92,col_ball
 tri 106,94,93,col_ball
 tri 105,106,93,col_ball
 tri 107,95,94,col_ball
 tri 106,107,94,col_ball
 tri 108,96,95,col_ball
 tri 107,108,95,col_ball
 tri 97,85,96,col_ball
 tri 108 ,97,96,col_ball
;;; 10th
 tri 110,98,97,  col_ball
 tri 109 ,110,97,  col_ball
 tri 111,99,98,  col_ball
 tri 110 ,111,98,  col_ball
 tri 112,100,99,  col_ball
 tri 111,112,99,  col_ball
 tri 113,101,100, col_ball
 tri 112,113,100, col_ball
 tri 114,102,101, col_ball
 tri 113,114,101, col_ball
 tri 115,103,102, col_ball
 tri 114,115,102, col_ball
 tri 116,104,103, col_ball
 tri 115,116,103, col_ball
 tri 117,105,104, col_ball
 tri 116,117,104, col_ball
 tri 118,106,105, col_ball
 tri 117,118,105, col_ball
 tri 119,107,106, col_ball
 tri 118,119,106, col_ball
 tri 120,108,107, col_ball
 tri 119,120,107, col_ball
 tri 109, 97,108, col_ball
 tri 120,109,108, col_ball
;;; 11th
 tri 122,110,109, col_ball
 tri 121,122,109, col_ball
 tri 123,111,110, col_ball
 tri 122,123,110, col_ball
 tri 124,112,111, col_ball
 tri 123,124,111, col_ball
 tri 125,113,112, col_ball
 tri 124,125,112, col_ball
 tri 126,114,113, col_ball
 tri 125,126,113, col_ball
 tri 127,115,114, col_ball
 tri 126,127,114, col_ball
 tri 128,116,115, col_ball
 tri 127,128,115, col_ball
 tri 129,117,116, col_ball
 tri 128,129,116, col_ball
 tri 130,118,117, col_ball
 tri 129,130,117, col_ball
 tri 131,119,118, col_ball
 tri 130,131,118, col_ball
 tri 132,120,119, col_ball
 tri 131,132,119, col_ball
 tri 121,109,120, col_ball
 tri 132,121,120, col_ball

 tri 133,121,122, $7830
 tri 133,122,123, $7830
 tri 133,123,124, $7830
 tri 133,124,125, $7830
 tri 133,125,126, $7830
 tri 133,126,127, $7830
 tri 133,127,128, $7830
 tri 133,128,129, $7830
 tri 133,129,130, $7830
 tri 133,130,131, $7830
 tri 133,131,132, $7830
 tri 133,132,121, $7830

	align 4
kugel_normals:
	dc.l (24+120*2)
 NT  29 , 9 , 254
 NT  21 , 21 , 254
 NT  9 , 29 , 254
 NT  -9 , 29 , 254
 NT  -21 , 21 , 254
 NT  -29 , 9 , 254
 NT  -29 , -9 , 254
 NT  -21 , -21 , 254
 NT  -9 , 29 , 254
 NT  9 , 29 , 254

 NT  21 , -21 , 254
 NT  29 , -9 , 254

 NT  -95 , -29 , 235
 NT  -97 , -27 , 234
 NT  -71 , -71 , 235
 NT  -71 , -71 , 235
 NT  -30 , -97 , 234
 NT  -27 , -96 , 235
 NT  29 , -95 , 235
 NT  27 , -97 , 234
 NT  71 , -71 , 235
 NT  71 , -71 , 235
 NT  97 , -30 , 234
 NT  96 , -27 , 235
 NT  95 , 29 , 235
 NT  97 , 27 , 234
 NT  71 , 71 , 235
 NT  71 , 71 , 235
 NT  30 , 97 , 234
 NT  27 , 96 , 235
 NT  -29 , 95 , 235
 NT  -27 , 97 , 234
 NT  -71 , 71 , 235
 NT  -71 , 71 , 235
 NT  -97 , 30 , 234
 NT  -96 , 27 , 235
 NT  -153 , -43 , 200
 NT  -152 , -43 , 200
 NT  -113 , -113 , 199
 NT  -113 , -113 , 199
 NT  -42 , -152 , 200
 NT  -43 , -153 , 200
 NT  43 , -153 , 200
 NT  43 , -152 , 200
 NT  113 , -113 , 199
 NT  113 , -113 , 199
 NT  152 , -42 , 200
 NT  153 , -43 , 200
 NT  153 , 43 , 200
 NT  152 , 43 , 200
 NT  113 , 113 , 199
 NT  113 , 113 , 199
 NT  42 , 152 , 200
 NT  43 , 153 , 200
 NT  -43 , 153 , 200
 NT  -43 , 152 , 200
 NT  -113 , 113 , 199
 NT  -113 , 113 , 199
 NT  -152 , 42 , 200
 NT  -153 , 43 , 200
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
 NT  -63 , -228 , 95
 NT  -61 , -228 , 98
 NT  63 , -227 , 98
 NT  62 , -229 , 95
 NT  167 , -167 , 97
 NT  167 , -167 , 97
 NT  228 , -63 , 95
 NT  228 , -61 , 98
 NT  227 , 63 , 98
 NT  229 , 62 , 95
 NT  167 , 167 , 97
 NT  167 , 167 , 97
 NT  63 , 228 , 95
 NT  61 , 228 , 98
 NT  -63 , 227 , 98
 NT  -62 , 229 , 95
 NT  -167 , 167 , 97
 NT  -167 , 167 , 97
 NT  -228 , 63 , 95
 NT  -228 , 61 , 98
 NT  -244 , -66 , 33
 NT  -246 , -64 , 28
 NT  -179 , -179 , 34
 NT  -179 , -179 , 34
 NT  -66 , -245 , 28
 NT  -63 , -245 , 33
 NT  66 , -244 , 33
 NT  64 , -246 , 28
 NT  179 , -179 , 34
 NT  179 , -179 , 34
 NT  245 , -66 , 28
 NT  245 , -63 , 33
 NT  244 , 66 , 33
 NT  246 , 64 , 28
 NT  179 , 179 , 34
 NT  179 , 179 , 34
 NT  66 , 245 , 28
 NT  63 , 245 , 33
 NT  -66 , 244 , 33
 NT  -64 , 246 , 28
 NT  -179 , 179 , 34
 NT  -179 , 179 , 34
 NT  -245 , 66 , 28
 NT  -245 , 63 , 33
 NT  -245 , -63 , -33
 NT  -245 , -66 , -28
 NT  -179 , -179 , -34
 NT  -179 , -179 , -34
 NT  -64 , -246 , -28
 NT  -66 , -244 , -33
 NT  63 , -245 , -33
 NT  66 , -245 , -28
 NT  179 , -179 , -34
 NT  179 , -179 , -34
 NT  246 , -64 , -28
 NT  244 , -66 , -33
 NT  245 , 63 , -33
 NT  245 , 66 , -28
 NT  179 , 179 , -34
 NT  179 , 179 , -34
 NT  64 , 246 , -28
 NT  66 , 244 , -33
 NT  -63 , 245 , -33
 NT  -66 , 245 , -28
 NT  -179 , 179 , -34
 NT  -179 , 179 , -34
 NT  -246 , 64 , -28
 NT  -244 , 66 , -33
 NT  -228 , -61 , -98
 NT  -228 , -63 , -95
 NT  -167 , -167 , -97
 NT  -167 , -167 , -97
 NT  -62 , -229 , -95
 NT  -63 , -227 , -98
 NT  61 , -228 , -98
 NT  63 , -228 , -95
 NT  167 , -167 , -97
 NT  167 , -167 , -97
 NT  229 , -62 , -95
 NT  227 , -63 , -98
 NT  228 , 61 , -98
 NT  228 , 63 , -95
 NT  167 , 167 , -97
 NT  167 , 167 , -97
 NT  62 , 229 , -95
 NT  63 , 227 , -98
 NT  -61 , 228 , -98
 NT  -63 , 228 , -95
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
 NT  -153 , -43 , -200
 NT  -152 , -42 , -200
 NT  -113 , -113 , -199
 NT  -113 , -113 , -199
 NT  -43 , -152 , -200
 NT  -43 , -153 , -200
 NT  43 , -153 , -200
 NT  42 , -152 , -200
 NT  113 , -113 , -199
 NT  113 , -113 , -199
 NT  152 , -43 , -200
 NT  153 , -43 , -200
 NT  153 , 43 , -200
 NT  152 , 42 , -200
 NT  113 , 113 , -199
 NT  113 , 113 , -199
 NT  43 , 152 , -200
 NT  43 , 153 , -200
 NT  -43 , 153 , -200
 NT  -42 , 152 , -200
 NT  -113 , 113 , -199
 NT  -113 , 113 , -199
 NT  -152 , 43 , -200
 NT  -153 , 43 , -200
 NT  -96 , -27 , -235
 NT  -97 , -30 , -234
 NT  -71 , -71 , -235
 NT  -71 , -71 , -235
 NT  -27 , -97 , -234
 NT  -29 , -95 , -235
 NT  27 , -96 , -235
 NT  30 , -97 , -234
 NT  71 , -71 , -235
 NT  71 , -71 , -235
 NT  97 , -27 , -234
 NT  95 , -29 , -235
 NT  96 , 27 , -235
 NT  97 , 30 , -234
 NT  71 , 71 , -235
 NT  71 , 71 , -235
 NT  27 , 97 , -234
 NT  29 , 95 , -235
 NT  -27 , 96 , -235
 NT  -30 , 97 , -234
 NT  -71 , 71 , -235
 NT  -71 , 71 , -235
 NT  -97 , 27 , -234
 NT  -95 , 29 , -235
 NT  29 , 9 , -254
 NT  21 , 21 , -254
 NT  9 , -29 , -254
 NT  -9 , -29 , -254
 NT  -21 , 21 , -254
 NT  -29 , 9 , -254
 NT  -29 , -9 , -254
 NT  -21 , -21 , -254

 NT  -9 , 29 , -254
 NT  9 , 29 , -254

 NT  21 , -21 , -254
 NT  29 , -9 , -254

kugel_vnormals:
 dc.l  134
 VNT  0 , 0 , -256
 VNT  66 , 0 , -247
 VNT  56 , 33 , -247
 VNT  33 , 56 , -247
 VNT  0 , 66 , -247
 VNT  -33 , 56 , -247
 VNT  -56 , 33 , -247
 VNT  -66 , 0 , -247
 VNT  -56 , -33 , -247
 VNT  -33 , -56 , -247
 VNT  0 , -66 , -247
 VNT  33 , -56 , -247
 VNT  56 , -33 , -247
 VNT  127 , 0 , -221
 VNT  109 , 63 , -222
 VNT  63 , 109 , -222
 VNT  0 , 127 , -221
 VNT  -63 , 109 , -222
 VNT  -109 , 63 , -222
 VNT  -127 , 0 , -221
 VNT  -109 , -63 , -222
 VNT  -63 , -109 , -222
 VNT  0 , -127 , -221
 VNT  63 , -109 , -222
 VNT  109 , -63 , -222
 VNT  181 , 0 , -181
 VNT  156 , 89 , -181
 VNT  89 , 156 , -181
 VNT  0 , 181 , -181
 VNT  -89 , 156 , -181
 VNT  -156 , 89 , -181
 VNT  -181 , 0 , -181
 VNT  -156 , -89 , -181
 VNT  -89 , -156 , -181
 VNT  0 , -181 , -181
 VNT  89 , -156 , -181
 VNT  156 , -89 , -181
 VNT  221 , 0 , -127
 VNT  192 , 110 , -128
 VNT  110 , 192 , -128
 VNT  0 , 221 , -127
 VNT  -110 , 192 , -128
 VNT  -192 , 110 , -128
 VNT  -221 , 0 , -127
 VNT  -192 , -110 , -128
 VNT  -110 , -192 , -128
 VNT  0 , -221 , -127
 VNT  110 , -192 , -128
 VNT  192 , -110 , -128
 VNT  247 , 0 , -66
 VNT  214 , 122 , -66
 VNT  122 , 214 , -66
 VNT  0 , 247 , -66
 VNT  -122 , 214 , -66
 VNT  -214 , 122 , -66
 VNT  -247 , 0 , -66
 VNT  -214 , -122 , -66
 VNT  -122 , -214 , -66
 VNT  0 , -247 , -66
 VNT  122 , -214 , -66
 VNT  214 , -122 , -66
 VNT  256 , 0 , 0
 VNT  221 , 127 , 0
 VNT  127 , 221 , 0
 VNT  0 , 256 , 0
 VNT  -127 , 221 , 0
 VNT  -221 , 127 , 0
 VNT  -256 , 0 , 0
 VNT  -221 , -127 , 0
 VNT  -127 , -221 , 0
 VNT  0 , -256 , 0
 VNT  127 , -221 , 0
 VNT  221 , -127 , 0
 VNT  247 , 0 , 66
 VNT  214 , 122 , 66
 VNT  122 , 214 , 66
 VNT  0 , 247 , 66
 VNT  -122 , 214 , 66
 VNT  -214 , 122 , 66
 VNT  -247 , 0 , 66
 VNT  -214 , -122 , 66
 VNT  -122 , -214 , 66
 VNT  0 , -247 , 66
 VNT  122 , -214 , 66
 VNT  214 , -122 , 66
 VNT  221 , 0 , 127
 VNT  192 , 110 , 128
 VNT  110 , 192 , 128
 VNT  0 , 221 , 127
 VNT  -110 , 192 , 128
 VNT  -192 , 110 , 128
 VNT  -221 , 0 , 127
 VNT  -192 , -110 , 128
 VNT  -110 , -192 , 128
 VNT  0 , -221 , 127
 VNT  110 , -192 , 128
 VNT  192 , -110 , 128
 VNT  181 , 0 , 181
 VNT  156 , 89 , 181
 VNT  89 , 156 , 181
 VNT  0 , 181 , 181
 VNT  -89 , 156 , 181
 VNT  -156 , 89 , 181
 VNT  -181 , 0 , 181
 VNT  -156 , -89 , 181
 VNT  -89 , -156 , 181
 VNT  0 , -181 , 181
 VNT  89 , -156 , 181
 VNT  156 , -89 , 181
 VNT  127 , 0 , 221
 VNT  109 , 63 , 222
 VNT  63 , 109 , 222
 VNT  0 , 127 , 221
 VNT  -63 , 109 , 222
 VNT  -109 , 63 , 222
 VNT  -127 , 0 , 221
 VNT  -109 , -63 , 222
 VNT  -63 , -109 , 222
 VNT  0 , -127 , 221
 VNT  63 , -109 , 222
 VNT  109 , -63 , 222
 VNT  66 , 0 , 247
 VNT  56 , 33 , 247
 VNT  33 , 56 , 247
 VNT  0 , 66 , 247
 VNT  -33 , 56 , 247
 VNT  -56 , 33 , 247
 VNT  -66 , 0 , 247
 VNT  -56 , -33 , 247
 VNT  -33 , -56 , 247
 VNT  0 , -66 , 247
 VNT  33 , -56 , 247
 VNT  56 , -33 , 247
 VNT  0 , 0 , 256
