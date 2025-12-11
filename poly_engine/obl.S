	.include "68k_inc/jaguar.inc"
	.include "video.h"

 IF ^^defined _PAL
vde	equ vde_pal
y_start	equ y_start_pal
 ELSE
vde	equ vde_ntsc
y_start	equ y_start_ntsc
 ENDIF

 IF ^^defined __0
screen	equ screen0
 ELSE
screen	equ screen1
 ENDIF

 if max_x != max_x_txt
text_x = (max_x-max_x_txt)/2
 else
text_x = 0
 endif

bpp		= 4
gr_phrase	= max_x/4

 IF max_x = 384
gr_x	equ 20
 ELSE
gr_x	equ 0
 endif
	.objproc
	.org	op_list
 branch VC < y_start,_stop0
 branch	VC < vde, _bm
 branch	VC > vde, _stop0
_gpu0:
 gpuobj 2
_stop0:
 stop
	.qphrase
_bm:
 IF max_x < 320
 IF ^^defined background
 scbitmap background,0,y_start,320*2/8,320*2/8,200,320.0/max_x,1.0,1.0,4,0,NOTRANS RELEASE,0,1
 ENDIF
 IF ^^defined background
 scbitmap screen,0,y_start,gr_phrase,gr_phrase,max_y-1,320.0/max_x,1.0,320.0/max_x,bpp,0,TRANS RELEASE,0,1
 ELSE
 scbitmap screen,0,y_start,gr_phrase,gr_phrase,max_y-1,320.0/max_x,1.0,320.0/max_x,bpp,0,NOTRANS RELEASE,0,1
 ENDIF
 ELSE
 IF ^^defined background
 IF max_x != 320
 scbitmap background,0,y_start,320*2/8,320*2/8,200-1,1.2,1.0,max_x/320.0,4,0,NOTRANS RELEASE,0,1
 ELSE
 bitmap background,0,y_start,320*2/8,320*2/8,200,4,0,NOTRANS RELEASE,0,1
 ENDIF
 ENDIF

 IF ^^defined background
 bitmap screen,0,y_start,gr_phrase,gr_phrase,max_y,bpp,0,TRANS RELEASE,0,1
 ELSE
 bitmap screen,gr_x,y_start,gr_phrase,gr_phrase,max_y,bpp,0,NOTRANS RELEASE,0,1
 ENDIF

 ENDIF
 bitmap	TxtScreen, gr_x+text_x,y_start+max_y,(max_x_txt/64),(max_x_txt/64),max_y_txt, 0,127, NOTRANS RELEASE,0,1
 bitmap	logo_screen, gr_x,y_start+max_y-10,1,1,9, 0,0,TRANS  RELEASE,0,1
 stop

	.qphrase
