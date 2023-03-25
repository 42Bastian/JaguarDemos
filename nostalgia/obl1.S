	.include "68k_inc/jaguar.inc"
	.include "video.h"

	.objproc
	.org	$1000
 branch VC < 25,_stop1
 branch	VC < vde, obl1_scr
 branch	VC > vde, _stop1
_gpu1:
 gpuobj 1
_stop1:
 stop
	.qphrase
obl1_scr:
 bitmap screen1,9+80,y_start+max_y_txt,gr_phrase,gr_phrase,max_y_gr,bpp,0,NOTRANS RELEASE,0,1
 bitmap	txt_screen, 9+52,y_start,(max_x_txt/64),(max_x_txt/64),max_y_txt, 0,127, TRANS RELEASE,0,1
obl1_scr_e:
 stop
obl1_e:
