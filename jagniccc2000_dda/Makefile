DEMO=jagniccc

OS:=$(shell uname -s)

TJASS= lyxass
RMAC= rmac
RLN= rln

_68KFLAGS=-4 ~oall -i$(BJL_ROOT)
TJFLAGS= -w

ifdef NODRAW
TJFLAGS+= -D NO_DRAW
endif

ifdef DEBUG
_68KFLAGS+= -DDEBUG
endif

ifdef SKUNK
_68KFLAGS+= -DSKUNK
endif

jaggd vj upload: _68KFLAGS+= -DSKUNK

vjd vjd_rom vj_rom vj: _68KFLAGS+= -DDEBUG

%.o	: %.js
	$(TJASS) $(TJFLAGS) $<

%.o	: %.S
	$(RMAC) $(_68KFLAGS) $<

ALL: $(DEMO).cof $(DEMO).j64

depack.o: $(DEMO).pck

$(DEMO).o : poly.o scene.S lsp.S

$(DEMO).cof: $(DEMO).o
	@$(RLN) -z -e -a 4000 x x -m -o $@ $<

$(DEMO).pck: $(DEMO).bin
	tp +j $< -o $@

$(DEMO).bin: $(DEMO).o
	@$(RLN) -rw -z -n -a 4000 4000 x -m -o $@ $<

$(DEMO).rom: depack.o
	@$(RLN) -rw -z -n -a 8002000 x x -m -o $@ $<

.ONESHELL:
$(DEMO).j64: $(DEMO).rom
	@cat $(BJL_ROOT)/bin/Univ.bin $< >$@
	cat $< >> $@
	bzcat $(BJL_ROOT)/bin/allff.bin.bz2 >> $@
	truncate -s 1M $@

.PHONY: vjd
vjd: $(DEMO).cof
	virtualjaguar -D $<

.PHONY: vj
vj: $(DEMO).cof
	virtualjaguar $<

.PHONY: vj_rom
vjd_rom: $(DEMO).j64
ifdef BIOS
	virtualjaguar -b -D $<
else
	virtualjaguar -D $<
endif


.PHONY: vj_rom
vj_rom: $(DEMO).j64
ifdef BIOS
	virtualjaguar -b $<
else
	virtualjaguar $<
endif

.PHONY: reset
reset:
	jcp -r
	wait

.PHONY: flash
flash: $(DEMO).j64
	jcp -ef $<

.PHONY: upload
.ONESHELL:
upload: $(DEMO).cof
	@jcp -q $< 0x4000

.PHONY: jaggd
jaggd: $(DEMO).cof
	jaggd.exe -rd -stub -ux $<

.PHONY: jaggd_rom
jaggd_rom: $(DEMO).rom
	jaggd.exe -rd -stub -ux $<,a:\$$802000,x:\$$802000

.ONESHELL:
.PHONY: clean
clean:
	rm -f *.o
	rm -f *.equ
	rm -f *~
	rm -f *.cof *.rom *.abs *.bin *.pck
