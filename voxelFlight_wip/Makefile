DEMO=voxel

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

vjd vjd_rom vj_rom vj: _68KFLAGS+= -DDEBUG

%.o	: %.js
	$(TJASS) $(TJFLAGS) $<

ALL: $(DEMO).cof $(DEMO).j64

$(DEMO).o : $(DEMO).js

$(DEMO)_68k.o : $(DEMO)_68k.S $(DEMO).o $(DEMO).equ
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

include Rules.launch

.ONESHELL:
.PHONY: clean
clean:
	rm -f *.o
	rm -f *.equ
	rm -f *~
	rm -f *.cof *.j64 *.rom *.abs
