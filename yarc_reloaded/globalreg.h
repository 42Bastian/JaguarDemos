	UNREG	SP,SP.a,LR,LR.a

;; global registers
IRQ_SP.a	REG 31
IRQ_RTS.a	REG 30
IRQ_FLAGADDR.a	REG 29
IRQ_FLAG.a	REG 28
obl1.a		reg 27
obl0.a		reg 26
obl_size.a	reg 25
LR.a		reg 24
SP.a		reg 23

IRQScratch4.a	REG  4
IRQScratch3.a	REG  3
IRQScratch2.a	REG  2
IRQScratch1.a	REG  1
IRQScratch0.a	REG  0

IRQ_SP		REG 31
VBLFlag		REG 22
IRQ_RTS		REG 30 ; only for VJ needed
IRQ_FLAGADDR	REG 29
LR		REG 24
SP		REG 23

tmp2		reg 2
tmp1		reg 1
tmp0		reg 0
