DEMO=sier64

all: $(DEMO).j64

TJASS= lyxass

TJFLAGS= -w -d

%.bin	: %.js
	$(TJASS) $(TJFLAGS) -o $@ $<

$(DEMO).XXX: $(DEMO).bin
	jagcrypt -u -tursi $<

$(DEMO).j64: $(DEMO).XXX
	cp $< $@
	bzcat $(BJL_ROOT)/bin/allff.bin.bz2 >>$@
	truncate -s 8K $@

clean:
	rm -f  *.equ *.XXX *~

vj.j64: $(DEMO).XXX
	cp $< $@
	bzcat $(BJL_ROOT)/bin/allff.bin.bz2 >>$@
	truncate -s 1M $@

vjd_rom: vj.j64
	virtualjaguar -b -D $<

vj_rom: vj.j64
	virtualjaguar -b $<

.PHONY: jaggd
jaggd: $(DEMO).j64
	jaggd -rd -uxr $<,a:0x800000
