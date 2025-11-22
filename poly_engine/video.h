;-*-asm-*-
* rez
max_x	equ 384
max_y	equ 200

IF max_x = 384
VID_MODE EQU $4c1
  ELSE
IF max_x = 640
VID_MODE EQU $2c1
ELSE
VID_MODE EQU $6c1
ENDIF
ENDIF

max_x_txt	equ max_x
max_y_txt	equ 5*8

op_list		equ $400

gfx_screen_size	equ max_x*max_y*2

TxtScreen	equ $001ffff0-(max_x_txt/8)*max_y_txt
screen1		equ TxtScreen - gfx_screen_size
screen0		equ screen1 - gfx_screen_size
logo_screen	equ screen0-10*8

vde_pal		equ (PAL_VMID+PAL_HEIGHT)/2+1
y_start_pal	equ 30

vde_ntsc	equ (NTSC_VMID+NTSC_HEIGHT)/2+1
y_start_ntsc	equ 24

ScreenMode	equ $6c1
