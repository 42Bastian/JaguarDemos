DEMO=rc

OS:=$(shell uname -s)

TJASS= lyxass
RMAC= rmac
RLN= rln

_68KFLAGS=-4 ~oall -i$(BJL_ROOT)
TJFLAGS= -w

%.o	: %.js
	$(TJASS) $(TJFLAGS) $<

ALL: $(DEMO).cof $(DEMO).j64

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

.PHONY: obl
obl: $(OBL)

$(DEMO).o : rc.js rc_main.js $(OBL) irq.inc world.inc  phobyx_128x128.inc\
	    globalreg.h hively_player.bin
	$(TJASS) -d $(TJFLAGS) rc.js

hively_player.bin: hively_player_v21.S
	rmac -4 -fb -u -i$(BJL_ROOT)/68k_inc $<
	rln -z -n -a f1b000 x x -o $@ hively_player_v21.o

rc_68k.o : rc_68k.S $(DEMO).o
	$(RMAC) $(_68KFLAGS) $(DEMO)_68k.S

rc.cof: rc_68k.o
	@$(RLN) -z -e -a 4000 x x -o $@ $<

rc.rom: rc_68k.o
	@$(RLN) -rw -z -n -a 802000 x x -o $@ $<

phobyx_128x128.inc: phobyx_128x128.tga
	@tga2cry -f cry8 -o $@ -nodata -maxcolors 16 -basecolor 32 $<

.ONESHELL:
rc.j64: rc.rom
	@cat $(BJL_ROOT)/bin/fastbt2_nb.bin $< >$@
	cat $< >> $@
	bzcat $(BJL_ROOT)/bin/allff.bin.bz2 >> $@
	truncate -s 128K $@

.ONESHELL:
vj.j64: rc.rom
	@cat $(BJL_ROOT)/bin/fastbt2_nb.bin $< >$@
	cat $< >> $@
	bzcat $(BJL_ROOT)/bin/allff.bin.bz2 >> $@
	truncate -s 1M $@


.PHONY: rom
rom: rc.j64

include Rules.launch

.ONESHELL:
.PHONY: clean
clean:
	rm -f *.o
	rm -f *.equ
	rm -f *~
	rm -f *.rom *.abs vj.j64

real-clean:
	rm -f *.cof *.j64 hively_player.bin
