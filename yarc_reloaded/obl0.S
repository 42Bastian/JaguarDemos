	.include "68k_inc/jaguar.inc"
	.include "canvas.h"
	.include "cube.equ"

 IF ^^defined _PAL
vde		equ (PAL_VMID+PAL_HEIGHT)/2+1
y_start		equ 29
 ELSE
vde		equ (NTSC_VMID+NTSC_HEIGHT)/2+1
y_start		equ 24
 ENDIF

bpp		= 4
gr_phrase	= max_x/4

	.objproc
	.org	$1000
 branch VC < 25,_stop0
 branch	VC < vde, _bm
 branch	VC > vde, _stop0
_gpu0:
 gpuobj 1
_stop0:
 stop
	.qphrase
_bm:
 IF max_x < 320
 scbitmap screen0,9,y_start+max_y_txt,gr_phrase,gr_phrase,max_y_gr,320.0/max_x,1.0,0.5,bpp,0,NOTRANS RELEASE,0,1
 ELSE
 bitmap screen0,9,y_start+max_y_txt,gr_phrase,gr_phrase,max_y_gr,bpp,0,NOTRANS RELEASE,0,1
 ENDIF
 IF DEBUG = 1
 bitmap	txt_screen, 9,y_start,(max_x_txt/64),(max_x_txt/64),max_y_txt, 0,127, TRANS RELEASE,0,1
 ENDIF
 bitmap	logo_screen, 10,y_start+max_y_txt+max_y_gr-9,1,1,9, 0,127,TRANS  RELEASE,0,1
 stop
