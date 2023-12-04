DEMO=pattern38
V?=0

ifeq ($(V),0)
Q=@
else
Q=#
endif

MODEL_M?=1

DEMO_EXT=
ifneq ($(MODEL_M),1)
DEMO_EXT=_K
else
DEMO_EXT=_M
endif

all: $(DEMO)$(DEMO_EXT).j64

TJASS= lyxass

ifeq ($(MODEL_M),1)
TJFLAGS= -w -d -D MODEL_M=1
else
TJFLAGS= -w -d
endif

%.bin	: %.js
	$Q$(TJASS) $(TJFLAGS) -o $@ $<

$(DEMO).XXX: $(DEMO).bin
	$Qjagcrypt -q -u -tursi $<

.ONESHELL:
$(DEMO)$(DEMO_EXT).j64: $(DEMO).XXX
	$Qcp $< $@
	bzcat $(BJL_ROOT)/bin/allff.bin.bz2 >>$@
	truncate -s 128K $@

.ONESHELL:
vj.j64: $(DEMO).XXX
	$Qcp $< $@
	bzcat $(BJL_ROOT)/bin/allff.bin.bz2 >>$@
	truncate -s 128K $@

include ../Rules.launch

.PHONY: clean
clean:
	$Qrm -f  *.equ *.XXX *~ *.img *.bak *.cof *.o
