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

obl0_50.img: obl0.S canvas.h
	$(Q)$(RMAC) -D_PAL $(_68KFLAGS) $< -o $@.o
	$(RLN) -rw -z -n -a $(OBL_START) x x -o $@ $@.o
	rm -f $@.o

obl1_50.img: obl1.S canvas.h
	$(Q)$(RMAC) -D_PAL $(_68KFLAGS) $< -o $@.o
	$(RLN) -rw -z -n -a $(OBL_START) x x -o $@ $@.o
	rm -f $@.o

obl0_60.img: obl0.S canvas.h
	$(Q)$(RMAC) $(_68KFLAGS) $< -o $@.o
	$(RLN)  -rw -z -n -a $(OBL_START) x x -o $@ $@.o
	rm -f $@.o

obl1_60.img: obl1.S canvas.h
	$(Q)$(RMAC) $(_68KFLAGS) $< -o $@.o
	$(RLN) -rw -z -n -a $(OBL_START) x x -o $@ $@.o
	rm -f $@.o

OBL=obl0_50.img obl1_50.img obl0_60.img obl1_60.img

%.do: %.das
	$(RMAC) $(_68KFLAGS) $< -o $@

lsp_v15.bin: lsp_init.das

%.bin : %.do
	$(RLN) -z  -n -a 0 x x -o $@ $<

cube_init.o: cube_init.js $(OBL) lsp_v15.bin cube.js
	$Qtouch cube.o
	$(TJASS) $(TJFLAGS) -o $@ cube_init.js
	$(TJASS) $(TJFLAGS) -o cube.o cube.js
	$(TJASS) $(TJFLAGS) -o $@ cube_init.js

%.bin : %.js
	$(TJASS) -d $(TJFLAGS) -o $@ $<

%.img: %.o
	$(Q)$(RLN) -rw -z -n -a $(OBL_START) x x -o $@ $<

$(DEMO).j64: $(DEMO)_init.o $(DEMO).o sbl.XXX
	$Qcp sbl.XXX $@
	cat $(DEMO)_init.o >> $@
	bzcat $(BJL_ROOT)/bin/allff.bin.bz2 >>$@
	truncate -s 1M $@

vj.j64: $(DEMO)_init.o  $(DEMO).o sbl.XXX
	$Qcp sbl.XXX $@
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
	rm -f vj.j64 *.cof *.rom *.abs *.img *.bin *.do
