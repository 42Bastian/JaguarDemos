	.include "68k_inc/jaguar.inc"
	.include "video.h"

	.objproc
	.org	$1000
obl0:
 branch VC < y_start,_stop0
 branch	VC < vde, obl0_scr
 branch	VC > vde, _stop0
_gpu0:
 gpuobj 1
_stop0:
 stop

	.qphrase
obl0_scr:
 scbitmap screen1,11,y_start,gr_phrase,gr_phrase,rez_y,320.0/rez_x,1.0*rez_y_screen/rez_y,1.0*rez_y_screen/rez_y,bpp,0,NOTRANS RELEASE,0,1
 bitmap	txt_screen, 11,y_start,(rez_x_txt/64),(rez_x_txt/64),rez_y_txt, 0,127, TRANS RELEASE,0,1
 bitmap	logo_screen, 11,logo_y-9,1,1,9, 0,127,TRANS  RELEASE,0,1
obl0_scr_e:
 stop
obl0_e:
obl_size equ obl0_e-obl0
obl_scr_size equ obl0_scr_e-obl0_scr
