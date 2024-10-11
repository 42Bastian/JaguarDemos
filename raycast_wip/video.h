;-*-asm-*-

rez_x_txt	equ 320
rez_y_txt	equ 3*8

rez_x		equ 256
rez_y		equ 240

logo_screen	equ $0015f000
MandelTexture	equ $00160000
XorTexture	equ MandelTexture+128*128
Xor2Texture	equ XorTexture+128*128
screen0		equ $00170000
screen1		equ $00190000
txt_screen	equ $001c0000
******************

ScreenMode	EQU CRY16|VIDEN|PWIDTH4|BGEN|CSYNC

bpp		equ 3
gr_phrase	equ rez_x/8


 IF ^^defined _PAL
vde		equ (PAL_VMID+PAL_HEIGHT)/2+1
y_start		equ 25
 ELSE
vde		equ (NTSC_VMID+NTSC_HEIGHT)/2+1
y_start		equ 13
 ENDIF
