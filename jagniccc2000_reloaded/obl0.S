	.include "68k_inc/jaguar.inc"
	.include "video.h"

	.objproc
	.org	$1000
obl0:
 branch VC < 25,_stop0
 branch	VC < vde, obl0_scr
 branch	VC > vde, _stop0
_gpu0:
 gpuobj 1
_stop0:
 stop
	.qphrase
obl0_scr:
 IF ^^defined SC_BITMAPS
 scbitmap screen0,9+32+257,y_start+max_y_txt+1,gr_phrase,gr_phrase,max_y_gr,0.5,0.5,0.5,bpp,0,NOTRANS RELEASE,0,1
 scbitmap screen0,9+32+257+63,y_start+max_y_txt+1+101,gr_phrase,gr_phrase,max_y_gr,0.25,0.25,0.25,bpp,0,NOTRANS REFLECT RELEASE,0,1
 scbitmap screen0,9+32+257+65,y_start+max_y_txt+1+101,gr_phrase,gr_phrase,max_y_gr,0.125,0.125,0.125,bpp,0,NOTRANS RELEASE,0,1
 scbitmap screen0,9+32+257+65+33,y_start+max_y_txt+1+101+25,gr_phrase,gr_phrase,max_y_gr,0.0625,0.0625,0.0625,bpp,0,NOTRANS RELEASE,0,1
 ENDIF
 bitmap screen0,9+32,y_start+max_y_txt+1,gr_phrase,gr_phrase,max_y_gr,bpp,0,NOTRANS RELEASE,0,1
 bitmap	txt_screen, 9+80,y_start,(max_x_txt/64),(max_x_txt/64),max_y_txt, 0,127, TRANS RELEASE,0,1
obl0_scr_e:
 stop
obl0_e:
obl_size equ obl0_e-obl0
obl_scr_size equ obl0_scr_e-obl0_scr

	print "OPL (phrases) ",/u obl_size/8
	print "OPL scr (phrases) ",/u obl_scr_size/8
	print "OPL scr (address) ",/xl obl0_scr
