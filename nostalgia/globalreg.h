;;; -*-asm-*-
;; Global registers
IRQ_SP.a	REG 31!
IRQ_RTS.a	REG 30!
IRQ_FLAGADDR.a	REG 29
IRQ_FLAG.a	REG 28
obl1.a		reg 27
obl0.a		reg 26
screen0.a	reg 25
screen1.a	reg 24
time_total.a	reg 23
rerun.a		reg 22
VID_PIT.a	reg 21
info_counter.a	reg 20
info_index.a	reg 19
wire_mode.a	reg 18

IRQScratch4.a	REG  4
IRQScratch3.a	REG  3
IRQScratch2.a	REG  2
IRQScratch1.a	REG  1
IRQScratch0.a	REG  0

VBLFlag		REG 29
lastPIT		REG 28

	regtop 27

x_save.a	reg 99
DRAW_LINES.a	reg 99
frame_ptr.a	reg 99
frameCounter.a	reg 99

MAIN_LOOP	reg 99
frame_ptr	reg 99
clut		reg 99
FRAME_LOOP	reg 99

INFO_TABLE	reg 15
blitter		reg 14

tmp3		reg 3
tmp2		reg 2
tmp1		reg 1
tmp0		reg 0
