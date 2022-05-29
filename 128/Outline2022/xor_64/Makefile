DEMO=xor_64

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

vj: $(DEMO).cof
	virtualjaguar $<

vjd: $(DEMO).cof
	virtualjaguar -D $<

.PHONY: jaggd
jaggd: $(DEMO).j64
	jaggd -rd -uxr $<,a:0x800000

.PHONY: jaggd_cof
jaggd_cof: $(DEMO).cof
	jaggd.exe -rd -ux $<,a:0x4000,x:0x4000

vj.j64: $(DEMO).XXX
	cp $< $@
	bzcat $(BJL_ROOT)/bin/allff.bin.bz2 >>$@
	truncate -s 1M $@

vjd_rom: vj.j64
	virtualjaguar -b -D $<

vj_rom: vj.j64
	virtualjaguar -b $<


.PHONY: clean
clean:
	rm -f  *.equ *.XXX *~ *.img *.bak *.cof *.o
