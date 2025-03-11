	.include "68k_inc/jaguar.inc"
	.include "video.h"

	.objproc
	.org	OBL_START
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
 bitmap screen0,9+32,y_start,gr_phrase,gr_phrase,max_y,bpp,0,NOTRANS RELEASE,0,1
obl0_scr_e:
 stop
obl0_e:
obl_size equ obl0_e-obl0
obl_scr_size equ obl0_scr_e-obl0_scr

	print "OPL (phrases) ",/u obl_size/8
	print "OPL scr (phrases) ",/u obl_scr_size/8
	print "OPL scr (address) ",/xl obl0_scr
