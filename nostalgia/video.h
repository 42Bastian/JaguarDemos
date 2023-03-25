;-*-asm-*-
;;->SC_BITMAPS equ 1

max_x_txt	equ 320
max_y_txt	equ 3*8

max_x		equ 256
max_y_gr	equ 200

screen0		equ $00180000
screen1		equ $00190000
txt_screen	equ $001c0000
******************

ScreenMode	EQU RGB16|VIDEN|PWIDTH3|BGEN|CSYNC

bpp		equ 3
gr_phrase	equ max_x/8

 IF ^^defined _PAL
vde		equ (PAL_VMID+PAL_HEIGHT)/2+1
y_start		equ 31
 ELSE
vde		equ (NTSC_VMID+NTSC_HEIGHT)/2+1
y_start		equ 27
 ENDIF
