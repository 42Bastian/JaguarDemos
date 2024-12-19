DEMO=gpuobj

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

$(DEMO).o : tom.o

boot.o:	boot.S $(DEMO).bin
	@$(RMAC) $(_68KFLAGS) boot.S

$(DEMO).o : $(DEMO).S
	$(RMAC) $(_68KFLAGS) $(DEMO).S

$(DEMO).cof: $(DEMO).o
	@$(RLN) -z -e -a 4000 x x -o $@ $<

$(DEMO).bin: $(DEMO).o
	$(RLN) -z -a 4000 x x -o $@ $<

rom: $(DEMO).rom
$(DEMO).rom: boot.o
	$(RLN) -rw -z -n -a 802000 x x -o $@ $<

.ONESHELL:
$(DEMO).j64: $(DEMO).rom
	@cat $(BJL_ROOT)/bin/fastbt2_nb.bin $< >$@
	cat $< >> $@
	bzcat $(BJL_ROOT)/bin/allff.bin.bz2 >> $@
	truncate -s 128K $@


include Rules.launch

.ONESHELL:
.PHONY: clean
clean:
	rm -f *.o
	rm -f *.equ
	rm -f *~
	rm -f *.cof *.rom *.abs *.bin
