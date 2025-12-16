;;-*-asm-*-
;; Global registers
	unreg LR,LR.a,SP,SP.a

IRQ_SP.a	REG 31
IRQ_RTS.a	REG 30
IRQ_FLAGADDR.a	REG 29
IRQ_FLAG.a	REG 28
obl1.a		reg 27
obl0.a		reg 26
screen1.a	reg 25
screen0.a	reg 24
vbl_counter.a	reg 23
VBLFlag.a	reg 22
dump.a		reg 21
dump0.a		reg 20


IRQScratch4.a	REG  4
IRQScratch3.a	REG  3
IRQScratch2.a	REG  2
IRQScratch1.a	REG  1
IRQScratch0.a	REG  0

IRQ_SP		REG 31
IRQ_RTS		REG 30
IRQ_FLAGADDR	REG 29
LR		reg 28
SP		reg 27


	regtop 26

tmp3		reg 3
tmp2		reg 2
tmp1		reg 1
tmp0		reg 0
