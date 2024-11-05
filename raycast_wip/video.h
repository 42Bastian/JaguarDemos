;-*-asm-*-

rez_x_txt	equ 320
rez_y_txt	equ 3*8

rez_x		equ 192
rez_y		equ 200

MandelTexture	equ $00160000
XorTexture	equ MandelTexture+128*128
Xor2Texture	equ XorTexture+128*128

screen0		equ $001c0000
screen1		equ $001e0000
txt_screen	equ $001ff000
logo_screen	equ $001fff00
******************

ScreenMode	EQU CRY16|VIDEN|PWIDTH4|BGEN|CSYNC

bpp		equ 3
gr_phrase	equ rez_x/8


 IF ^^defined _PAL
rez_y_screen	equ 240
y_start		equ 17
vde		equ rez_y_screen+y_start*2+1
_vde		equ (PAL_VMID+PAL_HEIGHT)/2+1

 ELSE
rez_y_screen	equ 200
y_start		equ 13
vde		equ rez_y_screen+y_start*2+1
_vde		equ (NTSC_VMID+NTSC_HEIGHT)/2+1
 ENDIF

logo_y equ	(rez_y*(rez_y_screen*32/rez_y)+16)/32+y_start*2+1
