	.include "68k_inc/jaguar.inc"
	.include "video.h"

	.objproc
	.org	OBL_START
obl1:
 branch VC < 25,_stop0
 branch	VC < vde, obl1_scr
 branch	VC > vde, _stop0
_gpu0:
 gpuobj 1
_stop0:
 stop
	.qphrase
obl1_scr:
 bitmap screen1,9+32,y_start,gr_phrase,gr_phrase,max_y,bpp,0,NOTRANS RELEASE,0,1
obl1_scr_e:
 stop
obl1_e:
obl_size equ obl1_e-obl1
obl_scr_size equ obl1_scr_e-obl1_scr

	print "OPL (phrases) ",/u obl_size/8
	print "OPL scr (phrases) ",/u obl_scr_size/8
	print "OPL scr (address) ",/xl obl1_scr
