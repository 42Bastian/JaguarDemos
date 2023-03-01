	;; Global registers
IRQ_SP.a	REG 31
IRQ_RTS.a	REG 30
IRQ_FLAGADDR.a	REG 29
IRQ_FLAG.a	REG 28
obl1.a		reg 27
obl0.a		reg 26
screen0.a	reg 25
SP.a		reg 24
screen1.a	reg 23
time_total.a	reg 22
rerun.a		reg 21
VID_PIT.a	reg 20
info_counter.a	reg 19
info_index.a	reg 18

IRQScratch4.a	REG  4
IRQScratch3.a	REG  3
IRQScratch2.a	REG  2
IRQScratch1.a	REG  1
IRQScratch0.a	REG  0

IRQ_SP		REG 31
IRQ_RTS		REG 30
IRQ_FLAGADDR	REG 29
VBLFlag		REG 28
lastPIT		REG 27
LR		reg 26
SP		reg 25

	regtop 24

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
