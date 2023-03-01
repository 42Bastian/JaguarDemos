	.include "68k_inc/jaguar.inc"
	include "video.h"

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
 IF ^^defined SC_BITMAPS
 scbitmap screen1,9+32+257,y_start+max_y_txt+1,gr_phrase,gr_phrase,max_y_gr,0.5,0.5,0.5,bpp,0,NOTRANS RELEASE,0,1
 scbitmap screen1,9+32+257+63,y_start+max_y_txt+1+101,gr_phrase,gr_phrase,max_y_gr,0.25,0.25,0.25,bpp,0,NOTRANS REFLECT RELEASE,0,1
 scbitmap screen1,9+32+257+65,y_start+max_y_txt+1+101,gr_phrase,gr_phrase,max_y_gr,0.125,0.125,0.125,bpp,0,NOTRANS RELEASE,0,1
 scbitmap screen1,9+32+257+65+33,y_start+max_y_txt+1+101+25,gr_phrase,gr_phrase,max_y_gr,0.0625,0.0625,0.0625,bpp,0,NOTRANS RELEASE,0,1
 ENDIF
 bitmap screen1,9+32,y_start+max_y_txt+1,gr_phrase,gr_phrase,max_y_gr,bpp,0,NOTRANS RELEASE,0,1
 bitmap	txt_screen, 9+80,y_start,(max_x_txt/64),(max_x_txt/64),max_y_txt, 0,127, TRANS RELEASE,0,1
obl1_scr_e:
 stop
obl1_e:
