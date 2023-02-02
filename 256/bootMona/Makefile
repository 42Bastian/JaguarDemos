DEMO=bootmona
MODEL_M?=1
V?=0

ifeq ($(V),0)
Q=@
else
Q=#
endif

ifeq ($(MODEL_M),1)
_68KFLAGS+= -DMODEL_M
TJFLAGS+= -D MODEL_M
endif

all: $(DEMO).j64

TJASS= lyxass

TJFLAGS+= -w -d

%.bin	: %.js
	$Q$(TJASS) $(TJFLAGS) -o $@ $<

$(DEMO).XXX: $(DEMO).bin
	$Qjagcrypt -q -u -tursi $<

.ONESHELL:
$(DEMO).j64: $(DEMO).XXX
	$Qcp $< $@
	bzcat $(BJL_ROOT)/bin/allff.bin.bz2 >>$@
	truncate -s 16K $@

.ONESHELL:
vj.j64: $(DEMO).XXX
	$Qcp $< $@
	bzcat $(BJL_ROOT)/bin/allff.bin.bz2 >>$@
	truncate -s 128K $@

include ../Rules.launch

.PHONY: clean
clean:
	$Qrm -f *.bin *.equ *.XXX *~ *.img *.bak *.cof *.o
