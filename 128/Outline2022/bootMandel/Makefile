DEMO=mandel

V?=0

ifeq ($(V),0)
Q=@
else
Q=#
endif

all: $(DEMO).j64

TJASS= lyxass

TJFLAGS= -w -d

%.bin	: %.js
	$Q$(TJASS) $(TJFLAGS) -o $@ $<

$(DEMO).XXX: $(DEMO).bin
	$Qjagcrypt -q -u -tursi $<

.ONESHELL:
$(DEMO).j64: $(DEMO).XXX
	$Qcp $< $@
	bzcat $(BJL_ROOT)/bin/allff.bin.bz2 >>$@
	truncate -s 8K $@

vj: $(DEMO).cof
	$Qvirtualjaguar $<

vjd: $(DEMO).cof
	$Qvirtualjaguar -D $<

.PHONY: jaggd
jaggd: $(DEMO).j64
	$Qjaggd -q -rd -uxr $<,a:0x800000

.PHONY: jaggd_cof
jaggd_cof: $(DEMO).cof
	$Qjaggd.exe -q -rd -ux $<,a:0x4000,x:0x4000

.ONESHELL:
vj.j64: $(DEMO).XXX
	$Qcp $< $@
	bzcat $(BJL_ROOT)/bin/allff.bin.bz2 >>$@
	truncate -s 1M $@

vjd_rom: vj.j64
	$Qvirtualjaguar -b -D $<

vj_rom: vj.j64
	$Qvirtualjaguar -b $<


.PHONY: clean
clean:
	$Qrm -f *.equ *.XXX *~ *.img *.bak *.cof *.o
