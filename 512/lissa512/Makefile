DEMO=lissa512

MODEL_M?=1
TIMING ?= 0
PAL?=1
V?=0

ifeq ($(V),0)
Q=@
else
Q=#
endif

ifeq ($(MODEL_M),1)
TJFLAGS+= -D MODEL_M
DEMO_EXT=_m
else
DEMO_EXT=_k
endif

all: $(DEMO)$(DEMO_EXT).j64

TJASS= lyxass
TJFLAGS= -w -d

ifeq ($(TIMING),1)
TJFLAGS+= -D TIMING
endif

ifeq ($(DEBUG),1)
TJFLAGS+= -D DEBUG
endif

.PRECIOUS: %.img %.bin

.SUFFIXES:

.SUFFIXES: .S .o .bin .js .img .XXX .j64

$(DEMO)$(DEMO_EXT).bin : $(DEMO).js dsp.bin
	$Q$(TJASS) $(TJFLAGS) -o $@ $<

%.bin : %.js
	$Q$(TJASS) $(TJFLAGS) -o $@ $<

%.img: %.o
	$Q$(RLN) -rw -z -n -a $(PATCH_ADDRESS) x x -o $@ $<

$(DEMO)$(DEMO_EXT).XXX: $(DEMO)$(DEMO_EXT).bin
	$Qjagcrypt -q -u -tursi $<

.ONESHELL:
$(DEMO)$(DEMO_EXT).j64: $(DEMO)$(DEMO_EXT).XXX
	$Qcp $< $@
	bzcat $(BJL_ROOT)/bin/allff.bin.bz2 >>$@
	truncate -s 32K $@

.ONESHELL:
vj.j64: $(DEMO)$(DEMO_EXT).XXX
	$Qcp $< $@
	bzcat $(BJL_ROOT)/bin/allff.bin.bz2 >>$@
	truncate -s 128K $@

include ../Rules.launch

.PHONY: clean
clean:
	$Qrm -f *.equ *.XXX *~ *.img *.bak *.cof *.o vj.j64 *.bin

.PHONY: real-clean
real-clean: clean
	$Qrm -f  *.j64
