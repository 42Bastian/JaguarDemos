DEMO=polygon

MOD?=0

OS:=$(shell uname -s)

TJASS= lyxass
RMAC= rmac
RLN= rln

_68KFLAGS=-4 ~oall -i$(BJL_ROOT)
//->TJFLAGS= -w -sh

TJFLAGS+= -D MOD=$(MOD)

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

ALL: $(DEMO).j64

obl0_50.bin: obl.S video.h
	$(RMAC) $(_68KFLAGS) -fr -D_PAL -D__0 $< -o $@

obl1_50.bin: obl.S video.h
	$(RMAC) $(_68KFLAGS) -fr -D_PAL -D__1 $< -o $@

obl0_60.bin: obl.S video.h
	$(RMAC) $(_68KFLAGS) -fr -D_NTSC -D__0 $< -o $@

obl1_60.bin: obl.S video.h
	$(RMAC) $(_68KFLAGS) -fr -D_NTSC -D__1 $< -o $@

OBL=obl0_50.bin obl1_50.bin obl0_60.bin obl1_60.bin video.h

OBJ_INC=torus.inc structs.inc cube.inc bigball.inc  diamant.inc pobjects.inc
OBJ_INC+= prisma.inc planex.inc

SRC_INC= visible.inc project.inc draw2.inc draw.inc rotate.inc draw2_nog.inc
SRC_INC+= gouraud.inc createplane.inc sintab.inc addobj.inc
SRC_INC+= buildPlane.inc

$(DEMO).o :control.js irq.js globalreg.h engine.h hively_player.bin

$(DEMO).o : $(DEMO).js engine.js $(OBL) $(OBJ_INC) $(SRC_INC)
	$(TJASS)  $(TJFLAGS) $<

$(DEMO).j64: $(DEMO).o
	@cat sbl.XXX >$@
	cat $< >> $@
	bzcat $(BJL_ROOT)/bin/allff.bin.bz2 >> $@
ifeq ($(MOD),0)
	truncate -s 512K $@
else
	truncate -s 1024K $@
endif

hively_player.bin: hively_player_v21.S
	rmac -4 -fb -u -i$(BJL_ROOT)/68k_inc $<
	rln -z -n -a f1b000 x x -o $@ hively_player_v21.o

include Rules.launch

.ONESHELL:
.PHONY: clean
clean:
	rm -f *.o
	rm -f *.equ
	rm -f *~
	rm -f *.cof *.j64 *.rom *.abs
