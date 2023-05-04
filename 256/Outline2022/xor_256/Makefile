DEMO=xor_256

MODEL_M?=1

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

ifeq ($(DEBUG),1)
_68KFLAGS+= -DDEBUG
TJFLAGS+= -D DEBUG
endif

.PRECIOUS: %.img %.bin

.SUFFIXES:

.SUFFIXES: .S .o .bin .js .img .XXX .j64

%.bin : %.js
	@$(TJASS) $(TJFLAGS) -o $@ $<

%.o : %.S
	@$(RMAC) $(_68KFLAGS) $< -o $@

%.img: %.o
	@$(RLN) -rw -z -n -a $(PATCH_ADDRESS) x x -o $@ $<

.PHONY: cof
cof: $(DEMO).cof

$(DEMO).bin: irqstub.img

$(DEMO).o: $(DEMO).bin

$(DEMO).cof: $(DEMO).o
	@$(RLN) -z -e -a 4000 x x -o $@ $<

$(DEMO).XXX: $(DEMO).bin
	jagcrypt -q -u -tursi $<

$(DEMO).j64: $(DEMO).XXX
	@cp $< $@
	bzcat $(BJL_ROOT)/bin/allff.bin.bz2 >>$@
	truncate -s 16K $@

vj: $(DEMO).cof
	virtualjaguar $<

vjd: $(DEMO).cof
	virtualjaguar -D $<

.PHONY: jaggd
jaggd: $(DEMO).j64
	@jaggd -q -rd -uxr $<,a:0x800000

.PHONY: jaggd_cof
jaggd_cof: $(DEMO).cof
	@jaggd.exe -q -rd -ux $<,a:0x4000,x:0x4000

vj.j64: $(DEMO).XXX
	@cp $< $@
	bzcat $(BJL_ROOT)/bin/allff.bin.bz2 >>$@
	truncate -s 1M $@

vjd_rom: vj.j64
	virtualjaguar -b -D $<

vj_rom: vj.j64
	virtualjaguar -b $<


.PHONY: clean
clean:
	@rm -f *.equ *.XXX *~ *.img *.bak *.cof *.o
