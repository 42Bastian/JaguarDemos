DEMO=yarc

OS:=$(shell uname -s)

TJASS= lyxass
RMAC= rmac
RLN= rln

_68KFLAGS=-4 ~oall -i$(BJL_ROOT)
TJFLAGS= -w -s

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

#vjd vjd_rom vj_rom vj: _68KFLAGS+= -DDEBUG

%.o	: %.js
	$(TJASS) $(TJFLAGS) $<

ALL: $(DEMO).cof $(DEMO).j64

$(DEMO).o : $(DEMO).js

$(DEMO)_68k.o : $(DEMO)_68k.S $(DEMO).o $(DEMO).equ lsp_v15.S
	$(RMAC) $(_68KFLAGS) $(DEMO)_68k.S

$(DEMO).cof: $(DEMO)_68k.o
	@$(RLN) -z -e -a 4000 x x -o $@ $<

$(DEMO).rom: $(DEMO)_68k.o
	@$(RLN) -rw -z -n -a 802000 x x -o $@ $<

.ONESHELL:
$(DEMO).j64: $(DEMO).rom
	@cat $(BJL_ROOT)/bin/Univ.bin $< >$@
	cat $< >> $@
	bzcat $(BJL_ROOT)/bin/allff.bin.bz2 >> $@
	truncate -s 1M $@

.PHONY: vjd
vjd: $(DEMO).cof
	virtualjaguar -D $< &

.PHONY: vj
vj: $(DEMO).cof
	virtualjaguar $< &

.PHONY: vj_rom
vjd_rom: $(DEMO).j64
ifdef BIOS
	virtualjaguar -b -D $< &
else
	virtualjaguar -D $< &
endif


.PHONY: vj_rom
vj_rom: $(DEMO).j64
ifdef BIOS
	virtualjaguar -b $< &
else
	virtualjaguar $< &
endif

.PHONY: reset
reset:
	@jcp -q  -r
	sleep 0.8

.PHONY: flash
flash: $(DEMO).j64
	jcp -ef $<

.PHONY: upload
.ONESHELL:
upload: $(DEMO).cof
	@jcp -q $< 0x4000

.PHONY: jaggd
jaggd: $(DEMO).cof
	jaggd.exe -rd -stub -ux $<,a:0x4000,x:0x4000

.PHONY: jaggd_rom
jaggd_rom: $(DEMO).rom
	jaggd.exe -rd -stub -ux $<,a:0x802000,x:0x802000

bpe: $(DEMO).cof
	/fun/jaguar/BigPEmu/BigPEmu.exe $< &
	true

bpe_rom: $(DEMO).j64
	/fun/jaguar/BigPEmu/BigPEmu.exe $< &
	true

.ONESHELL:
.PHONY: clean
clean:
	rm -f *.o
	rm -f *.equ
	rm -f *~
	rm -f *.rom *.abs
