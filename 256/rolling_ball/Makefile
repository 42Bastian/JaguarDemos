DEMO=rb

MODEL_M?=1
TIMING ?= 0
PAL?=1
V?=0

ifeq ($(V),0)
Q=@
else
Q=#
endif


TJASS= lyxass
RMAC= rmac
RLN= rln

_68KFLAGS=-4 ~oall -i$(BJL_ROOT)
TJFLAGS= -w -d


ifeq ($(MODEL_M),1)
TJFLAGS+= -D MODEL_M
DEMO_EXT=_m
else
DEMO_EXT=_k
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

all: $(DEMO)$(DEMO_EXT).j64

.PRECIOUS: %.img %.bin

.SUFFIXES:

.SUFFIXES: .S .o .bin .js .img .XXX .j64

$(DEMO)$(DEMO_EXT).bin : $(DEMO).js
	$Q$(TJASS) $(TJFLAGS) -o $@ $<

%.o : %.S
	$Q$(RMAC) $(_68KFLAGS) $< -o $@

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
