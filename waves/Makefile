DEMO=waves

MODEL_M?=1
TIMING ?= 0
PAL?=1
V?=0

ifeq ($(V),0)
Q=@
else
Q=#
endif

all: $(DEMO).cof

TJASS= lyxass
RMAC= rmac
RLN= rln

_68KFLAGS=-4 ~oall -i$(BJL_ROOT)
TJFLAGS+= -w -d

ifeq ($(MODEL_M),1)
PATCH_ADDRESS=4804
_68KFLAGS+= -DMODEL_M
TJFLAGS+= -D MODEL_M
else
PATCH_ADDRESS=58f2
endif

ifeq ($(TIMING),1)
TJFLAGS+= -D TIMING
_68KFLAGS+= -DTIMING
endif

ifeq ($(DEBUG),1)
_68KFLAGS+= -DDEBUG
TJFLAGS+= -D DEBUG
endif

ifeq ($(BPE),1)
TJFLAGS+= -D BPE
endif

.PRECIOUS: %.img %.bin

.SUFFIXES:

.SUFFIXES: .S .o .bin .js .img .XXX .j64

%.bin : %.js
	$Q$(TJASS) $(TJFLAGS) -o $@ $<

%.o : %.S
	$Q$(RMAC) $(_68KFLAGS) $< -o $@

%.img: %.o
	$Q$(RLN) -rw -z -n -a $(PATCH_ADDRESS) x x -o $@ $<

OBL_START=4096

obl0_50.img: obl0.S video.h
	$(Q)$(RMAC) -fr -D_PAL -DOBL_START=$(OBL_START) $(_68KFLAGS) $< -o $@

obl1_50.img: obl1.S video.h
	$(Q)$(RMAC) -fr -D_PAL -DOBL_START="$(OBL_START)" $(_68KFLAGS) $< -o $@

obl0_60.img: obl0.S video.h
	$(Q)$(RMAC) -fr -DOBL_START=$(OBL_START) $(_68KFLAGS) $< -o $@

obl1_60.img: obl1.S video.h
	$(Q)$(RMAC) -fr -DOBL_START=$(OBL_START) $(_68KFLAGS) $< -o $@

OBL=obl0_50.img obl1_50.img obl0_60.img obl1_60.img

main.bin: main.js waves.js $(OBL) globalreg.h

.PHONY: cof
cof: $(DEMO).cof

$(DEMO)_m68k.o: main.bin

$(DEMO).cof: $(DEMO)_m68k.o
	$Q$(RLN) -z -e -a 4000 x x -o $@ $<

$(DEMO).XXX: $(DEMO).bin
	$Qjagcrypt -q -u -tursi $<

.ONESHELL:
$(DEMO).j64: $(DEMO).XXX
	$Qcp $< $@
	bzcat $(BJL_ROOT)/bin/allff.bin.bz2 >>$@
	truncate -s 32K $@

.ONESHELL:
vj.j64: $(DEMO).XXX
	$Qcp $< $@
	bzcat $(BJL_ROOT)/bin/allff.bin.bz2 >>$@
	truncate -s 128K $@

include Rules.launch

.PHONY: clean
clean:
	$Qrm -f *.equ *.XXX *~ *.bak *.o vj.j64 *.bin

.PHONY: real-clean
real-clean: clean
	$Qrm -f  *.j64 *.img *.cof
