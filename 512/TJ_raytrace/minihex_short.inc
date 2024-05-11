;-*-asm-*-
; minihex - a super tiny hex output with 4x6 chars
;;;
;;; Parameter:
;;; r0       - value
;;; LR      - return address
;;; txt_ptr - points to a 16BPP screen address
;;;
;;; out:
;;; txt_ptr points to next digit postition
;;;
;;; Register use: r1-r6
;;;

 IFND minihex_screen_width
minihex_screen_width	equ 320
 ENDIF
 IFND minihex_pixel_size
minihex_pixel_size	equ 2
 ENDIF
	;;
	align	4
drawHex::
	moveq	#4,r5
dh_pc
	move	pc,r6
	subq	#1,r5
	jump	mi,(LR)
	rorq	#28,r0
drawDigit::
	moveq	#14,r3
	and	r0,r3
	addq	#(_0-dh_pc)/2,r3
	shlq	#1,r3
	add	r6,r3
	btst	#0,r0
	load	(r3),r1
	jr	eq,.even
	move	txt_ptr,r4
	shlq	#16,r1
.even
	addqt	#4*minihex_pixel_size,txt_ptr
	shrq	#16,r1
.ly
	moveq	#3,r2
.lx
	shrq	#1,r1
	jump	eq,(r6)
	subc	r3,r3		; 0 or -1
	subq	#1,r2
 IF minihex_pixel_size = 2
	storew	r3,(r4)
	jr	ne,.lx
	addqt	#2,r4
 ELSE
	storeb	r3,(r4)
	jr	ne,.lx
	addqt	#1,r4
 ENDIF
	movei	#(minihex_screen_width-3)*minihex_pixel_size,r2
	moveq	#0,r3
 IF minihex_pixel_size = 2
	storew	r3,(r4)
 ELSE
	storeb	r3,(r4)
 ENDIF
	jr	.ly
	add	r2,r4

_000	equ %000
_100	equ %001
_010	equ %010
_110	equ %011
_001	equ %100
_101	equ %101
_011	equ %110
_111	equ %111

	align 4
	MACRO char
_\0
	dc.w $8000|(\5<<12)|(\4<<9)|(\3<<6)|(\2<<3)|(\1<<0)
	ENDM

	char 0,_010,_101,_101,_101,_010
	char 1,_010,_110,_010,_010,_010
	char 2,_010,_101,_001,_010,_111
	char 3,_110,_001,_010,_001,_110
	char 4,_100,_101,_111,_001,_001
	char 5,_111,_100,_110,_001,_110
	char 6,_011,_100,_110,_101,_010
	char 7,_111,_001,_001,_010,_010
	char 8,_010,_101,_010,_101,_010
	char 9,_010,_101,_011,_001,_110
	char A,_010,_101,_111,_101,_101
	char B,_110,_101,_110,_101,_110
	char C,_010,_101,_100,_101,_010
	char D,_110,_101,_101,_101,_110
	char E,_111,_100,_110,_100,_111
	char F,_111,_100,_110,_100,_100
drawHex_e:
sizedh	equ drawHex_e-drawHex
	echo "drawHex:%HdrawHex %Dsizedh _0 %H_0"

dd	equ (_0-dh_pc)/2
	echo "D: %Ddd"
