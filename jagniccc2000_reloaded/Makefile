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

rom bpe_rom jaggd_rom vj_rom vjd_rom: _68KFLAGS+= -DROM

rom: $(DEMO).j64

all: $(DEMO).j64

OBL_START=1000

obl0_50.img: obl0.S video.h
	$(Q)$(RMAC) -D_PAL $(_68KFLAGS) $< -o $@.o
	$(RLN) -rw -z -n -a $(OBL_START) x x -o $@ $@.o
	rm -f $@.o

obl1_50.img: obl1.S video.h
	$(Q)$(RMAC) -D_PAL $(_68KFLAGS) $< -o $@.o
	$(RLN) -rw -z -n -a $(OBL_START) x x -o $@ $@.o
	rm -f $@.o

obl0_60.img: obl0.S video.h
	$(Q)$(RMAC) $(_68KFLAGS) $< -o $@.o
	$(RLN)  -rw -z -n -a $(OBL_START) x x -o $@ $@.o
	rm -f $@.o

obl1_60.img: obl1.S video.h
	$(Q)$(RMAC) $(_68KFLAGS) $< -o $@.o
	$(RLN) -rw -z -n -a $(OBL_START) x x -o $@ $@.o
	rm -f $@.o

OBL=obl0_50.img obl1_50.img obl0_60.img obl1_60.img

$(DEMO).o : $(DEMO).js poly.js $(OBL) lsp_v15.lib scene.img
	$(TJASS)  $(TJFLAGS) $<

%.o	: %.js
	$(TJASS) -s $(TJFLAGS) $<

%.o	: %.S
	$(RMAC) $(_68KFLAGS) $<

scene.img: scene.S
	$(Q)$(RMAC) $(_68KFLAGS) $< -o $@.o
	$(RLN) -rw -z -n -a $(OBL_START) x x -o $@ $@.o
	rm -f $@.o

.ONESHELL:
$(DEMO).j64: $(DEMO).o
	@cat sbl.XXX >$@
	cat $< >> $@
	bzcat $(BJL_ROOT)/bin/allff.bin.bz2 >> $@
	truncate -s 1M $@

.ONESHELL:
vj.j64: $(DEMO).j64
	cp $< $@

include Rules.launch


.ONESHELL:
.PHONY: clean
clean:
	rm -f *.o
	rm -f *.equ
	rm -f *~
	rm -f *.cof *.rom *.abs *.bin *.pck *.img
