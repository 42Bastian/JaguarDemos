;-*-asm-*-
SC_BITMAPS equ 1

max_x_txt	equ 320
max_y_txt	equ 3*8

max_x		equ 320
max_y		equ 200

screen0		equ $00100000
screen1		equ $00140000
txt_screen	equ $001c0000
******************

ScreenMode	EQU CRY16|VIDEN|PWIDTH4|BGEN|CSYNC

bpp		equ 4
gr_phrase	equ max_x/(64/(1<<bpp))

 IF ^^defined _PAL
vde		equ (PAL_VMID+PAL_HEIGHT)/2+1
y_start		equ 31
 ELSE
vde		equ (NTSC_VMID+NTSC_HEIGHT)/2+1
y_start		equ 25
 ENDIF
