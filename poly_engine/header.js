;-*-asm-*-
	.gpu
	run	$800410

	include "polygon.equ"

	echo "%Xstart"
	dc.l start
	dc.l datae-data
data:
	ibytes	"polygon.bin.lz4",8
datae
