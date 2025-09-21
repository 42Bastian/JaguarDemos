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

max_x_txt	equ 320
max_y_txt	equ 3*8


//->background	equ $000e0000
screen0		equ $00100000
screen1		equ $00140000
TxtScreen	equ $00180000

vde_pal		equ (PAL_VMID+PAL_HEIGHT)/2+1
y_start_pal	equ 30

vde_ntsc	equ (NTSC_VMID+NTSC_HEIGHT)/2+1
y_start_ntsc	equ 24

ScreenMode	equ $6c1
