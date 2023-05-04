DEMO=stars_256

MODEL_M?=1
TIMING ?= 0
PAL?=1

V?=0
ifeq ($(V),0)
Q=@
else
Q=#
endif


all: $(DEMO).j64

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

.PRECIOUS: %.img %.bin

.SUFFIXES:

.SUFFIXES: .S .o .bin .js .img .XXX .j64

%.bin : %.js
	$Qecho $<
	$Q$(TJASS) $(TJFLAGS) -o $@ $<

%.o : %.S
	$Q$(RMAC) $(_68KFLAGS) $< -o $@

%.img: %.o
	$Q$(RLN) -rw -z -n -a $(PATCH_ADDRESS) x x -o $@ $<

.PHONY: cof
cof: $(DEMO).cof

$(DEMO).bin: irqstub.img

$(DEMO).o: $(DEMO).bin

$(DEMO).cof: $(DEMO).o
	$Q$(RLN) -z -e -a 4000 x x -o $@ $<

$(DEMO).XXX: $(DEMO).bin
	$Qjagcrypt -q -u -tursi $<

.ONESHELL:
$(DEMO).j64: $(DEMO).XXX
	$Qcp $< $@
	bzcat $(BJL_ROOT)/bin/allff.bin.bz2 >>$@
	truncate -s 16K $@

vj: $(DEMO).cof
	$Qvirtualjaguar $<

vjd: $(DEMO).cof
	$Qvirtualjaguar -D $<

.PHONY: jaggd
jaggd: $(DEMO).j64
	$Qjaggd -q -rd -uxr $<,a:0x800000

.PHONY: jaggd_cof
jaggd_cof: $(DEMO).cof
	$Qjaggd.exe -q -rd -ux $<,a:0x4000,x:0x4000

.ONESHELL:
vj.j64: $(DEMO).XXX
	$Qcp $< $@
	bzcat $(BJL_ROOT)/bin/allff.bin.bz2 >>$@
	truncate -s 1M $@

vjd_rom: vj.j64
	$Qvirtualjaguar -b -D $<

vj_rom: vj.j64
	$Qvirtualjaguar -b $<


.PHONY: clean
clean:
	$Qrm -f *.equ *.XXX *~ *.img *.bak *.cof *.o
