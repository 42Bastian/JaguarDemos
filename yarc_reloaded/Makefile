DEMO=cube

OS:=$(shell uname -s)

V?=0
ifeq ($(V),0)
Q=@
else
Q=#
endif

TJASS= lyxass
RMAC= rmac
RLN= rln

DEBUG?= 1

_68KFLAGS=-4 ~oall -i$(BJL_ROOT)
TJFLAGS= -w -s

ifeq ($(DEBUG),1)
_68KFLAGS+= -DDEBUG
TJFLAGS+= -D DEBUG
endif

.PRECIOUS: %.img %.bin

.SUFFIXES:

.SUFFIXES: .S .o .bin .js .img .XXX .j64

ALL: $(DEMO).j64

OBL_START=1000

.ONESHELL:
obl0_50.img: obl0.S canvas.h
	$(Q)$(RMAC) -D_PAL $(_68KFLAGS) $< -o $@.o
	$(RLN) -rw -z -n -a $(OBL_START) x x -o $@ $@.o
	rm -f $@.o

.ONESHELL:
obl1_50.img: obl1.S canvas.h
	$(Q)$(RMAC) -D_PAL $(_68KFLAGS) $< -o $@.o
	$(RLN) -rw -z -n -a $(OBL_START) x x -o $@ $@.o
	rm -f $@.o

.ONESHELL:
obl0_60.img: obl0.S canvas.h
	$(Q)$(RMAC) $(_68KFLAGS) $< -o $@.o
	$(RLN)  -rw -z -n -a $(OBL_START) x x -o $@ $@.o
	rm -f $@.o

.ONESHELL:
obl1_60.img: obl1.S canvas.h
	$(Q)$(RMAC) $(_68KFLAGS) $< -o $@.o
	$(RLN) -rw -z -n -a $(OBL_START) x x -o $@ $@.o
	rm -f $@.o

OBL=obl0_50.img obl1_50.img obl0_60.img obl1_60.img

cube_init.o: $(OBL) cube.js lsp_v15.bin

%.bin : %.js
	$(Q)$(TJASS) -d $(TJFLAGS) -o $@ $<

%.img: %.o
	$(Q)$(RLN) -rw -z -n -a $(OBL_START) x x -o $@ $<

%.o : %.js
	$(Q)$(TJASS) $(TJFLAGS) $<

.ONESHELL:
$(DEMO).j64: $(DEMO)_init.o
	$(Q)cp sbl.XXX $@
	cat $(DEMO)_init.o >> $@
	bzcat $(BJL_ROOT)/bin/allff.bin.bz2 >>$@
	truncate -s 1M $@

include Rules.launch

.ONESHELL:
.PHONY: clean
clean:
	$(Q)rm -f *.o
	rm -f *.equ
	rm -f *~
	rm -f *.j64 *.cof *.rom *.abs *.img $(DEMO)*.bin
