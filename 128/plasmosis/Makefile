DEMO=plasmosis

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
all: $(DEMO).j64
else
all: $(DEMO)_k.j64
endif

TJASS= lyxass
RMAC= rmac
RLN= rln

_68KFLAGS=-4 ~oall -i$(BJL_ROOT)
TJFLAGS= -w -d

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

ifeq ($(PAL),1)
TJFLAGS+= -D _PAL
_68KFLAGS+= -D_PAL
else
$(warning NTSC/60Hz does not work well!)
endif

ifeq ($(BPE),1)
TJFLAGS+= -D BPE
endif

TJFLAGS+=-w
.PRECIOUS: %.img %.bin

.SUFFIXES:

.SUFFIXES: .S .o .bin .js .img .XXX .j64

%.bin : %.js
	$Q$(TJASS) $(TJFLAGS) -o $@ $<

%.o : %.S
	$Q$(RMAC) $(_68KFLAGS) $< -o $@

%.img: %.o
	$Q$(RLN) -rw -z -n -a $(PATCH_ADDRESS) x x -o $@ $<

.PHONY: cof
cof: $(DEMO).cof

$(DEMO).o: $(DEMO).bin

$(DEMO).cof: $(DEMO).o
	$Q$(RLN) -z -e -a 4000 x x -o $@ $<

$(DEMO).XXX: $(DEMO).bin
	@cp $< $(DEMO).a
	truncate -s 512 $(DEMO).a
	$Qjagcrypt -q -u -tursi $(DEMO).a
	rm -f $(DEMO).a

.ONESHELL:
$(DEMO).j64: $(DEMO).XXX
	$Qcp $< $@
	bzcat $(BJL_ROOT)/bin/allff.bin.bz2 >>$@
	truncate -s 32K $@

.ONESHELL:
$(DEMO)_k.j64: $(DEMO).XXX
	$Qcp $< $@
	bzcat $(BJL_ROOT)/bin/allff.bin.bz2 >>$@
	truncate -s 32K $@

.ONESHELL:
vj.j64: $(DEMO).XXX
	$Qcp $< $@
	bzcat $(BJL_ROOT)/bin/allff.bin.bz2 >>$@
	truncate -s 128K $@

include ../Rules.launch

.PHONY: clean
clean:
	$Qrm -f *.equ *.XXX *~ *.img *.bak *.cof *.o vj.j64 *.bin
