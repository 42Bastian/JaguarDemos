;-*-asm-*-

	;; modify height map
SEED		equ $3563335	; $F363330
SMOOTH		equ 1		; > 0 => smooth landscape
REDUCE_HEIGHT	equ 76


;;; ----------------------------------------
;;; Generate Map
;;; ----------------------------------------

 regmap

RAND		REG 99
STEP_LOOP	REG 99
DIAMANT		REG 99
GET_H		REG 99
X_LOOP		REG 99
Y_LOOP		REG 99
step		REG 99
x		REG 99
y		REG 99
y_step		REG 99
ptr0		reg 99
ptr1		reg 99
h_ul		reg 99
h_lr		reg 99
h_ur		reg 99
h_ll		reg 99
h0		reg 99
h1		reg 99
lc		reg 99
y_count		reg 99
x_count		reg 99
rnd		reg 99


	MODULE genmap,MODend_irq

	movei	#SEED,rnd
	movei	#random,RAND
	movei	#diamant,DIAMANT
	movei	#map,map_base
	moveta	map_base,map_base.a
	moveq	#1,step
	movei	#get_h,GET_H
	shlq	#6,step
	moveq	#1,lc
	movei	#127,mask

	movei	#.step_loop,STEP_LOOP
	movei	#.x_loop,X_LOOP
	movei	#.y_loop,Y_LOOP

.step_loop:
	move	step,x
	move	lc,x_count

.x_loop:
	move	step,y_step
	move	step,y
	shlq	#7,y_step
	move	lc,y_count

.y_loop:
	move	step,r0
	move	step,r1
	neg	r0
	neg	r1
	BL	(GET_H)
	move	r0,h_ul

	move	step,r0
	move	step,r1
	BL	(GET_H)
	move	r0,h_lr

	move	step,r1
	move	step,r0
	neg	r1
	BL	(GET_H)
	move	r0,h_ur

	move	step,r0
	move	step,r1
	neg	r0
	BL	(GET_H)
	move	r0,h_ll

	move	h_lr,h0
	add	h_ur,h0
	add	h_ul,h0
	add	h_ll,h0
	shrq	#2,h0

	BL	(RAND)
	move	y,ptr0
	add 	r0,h0
	shlq	#10,ptr0
	sat8	h0
	add	x,ptr0
	add	map_base,ptr0

	storeb	h0,(ptr0)

	shlq	#1,h0

	move	h_ll,h1
	add	h_ul,h1
	BL	(DIAMANT)
	sub	step,r0
	storeb	h1,(r0)

	move	h_ul,h1
	add	h_ur,h1
	BL	(DIAMANT)
	sub	y_step,r0
	storeb	h1,(r0)

	move	h_ur,h1
	add	h_lr,h1
	BL	(DIAMANT)

	move	step,tmp1
	add	y,tmp1
	and	mask,tmp1
	shlq	#10,tmp1
	add	map_base,tmp1
	add	x,tmp1
	storeb	h1,(tmp1)

	move	h_lr,h1
	add	h_ll,h1
	BL	(DIAMANT)

	move	step,tmp0
	move	y,tmp1
	add	x,tmp0
	shlq	#10,tmp1
	and	mask,tmp0
	add	map_base,tmp1
	add	tmp0,tmp1

	add	step,y
	subq	#1,y_count
	storeb	h1,(tmp1)
	jump	ne,(Y_LOOP)
	add	step,y

	add	step,x
	subq	#1,x_count
	jump	ne,(X_LOOP)
	add	step,x

	shrq	#1,step
	jump	ne,(STEP_LOOP)
	shlq	#1,lc

	UNREG	Y_LOOP,X_LOOP,STEP_LOOP,y_step,ptr1
	UNREG	DIAMANT
	UNREG	h_ul,h_lr,h_ll,h_ur,lc,x_count,y_count

;;; ----------------------------------------
;;; reduce height
;;; ----------------------------------------

 IF REDUCE_HEIGHT > 0
	moveq	#0,r10
	move	map_base,r0
	movei	#1024*1024,r1
	movei	#REDUCE_HEIGHT,r2
	movei	#.adj,r5
.adj	loadb	(r0),r4
	sub	r2,r4
	sat8	r4
	add	r4,r10
	subq	#1,r1
	storeb	r4,(r0)
	jump	ne,(r5)
	addq	#1,r0
 ENDIF

;;; ----------------------------------------
;;; Smoothie
;;; ----------------------------------------
 IF SMOOTH > 0
round		REG 99
LOOP		REG 99
sum		REG 99
BG		reg 99

smoothie::
	movei	#.loop,LOOP
	movei	#$f00058,BG
	moveq	#SMOOTH,round
	move	mask,y
	move	mask,x
.loop
	move	x,r0
	xor	y,r0
	storew	r0,(BG)

	moveq	#1,tmp0
	moveq	#0,tmp1
	BL	(GET_H)		; (x+1,y)
	move	r0,sum
	moveq	#1,tmp0
	moveq	#1,tmp1
	BL	(GET_H)		; (x+1,y+1)
	add	r0,sum
	moveq	#0,tmp0
	moveq	#1,tmp1
	BL	(GET_H)		; (x,y+1)
	add	r0,sum
	moveq	#1,tmp0
	moveq	#0,tmp1
	subq	#2,tmp0
	BL	(GET_H)		; (x-1,y)
	add	r0,sum
	moveq	#1,tmp0
	moveq	#1,tmp1
	subq	#2,tmp0
	BL	(GET_H)		; (x-1,y+1)
	add	r0,sum
	moveq	#1,tmp0
	subq	#2,tmp0
	move	tmp0,tmp1
	BL	(GET_H)		; (x-1,y-1)
	add	r0,sum
	moveq	#1,tmp1
	moveq	#1,tmp0
	subq	#2,tmp1
	BL	(GET_H)		; (x+1,y-1)
	add	r0,sum
	moveq	#1,tmp1
	moveq	#0,tmp0
	subq	#2,tmp1
	BL	(GET_H)		; (x,y-1)
	add	r0,sum
	moveq	#0,tmp0
	moveq	#0,tmp1
	BL	(GET_H)		; (x,y)
	add	r0,sum
	moveq	#9,r0
	div	r0,sum
	subq	#1,x
	jump	pl,(LOOP)
	storeb	sum,(tmp1)

	subq	#1,y
	jump	pl,(LOOP)
	move	mask,x

	subq	#1,round
	jump	pl,(LOOP)
	move	mask,y

	UNREG	round,LOOP,sum,BG
 ENDIF

	POPLR

diamant:
	add	h0,h1
	moveta	LR,LR.a
	sharq	#2,h1
	BL	(RAND)
	movefa	LR.a,LR
	add	r0,h1
	move	ptr0,r0
	jump	(LR)
	sat8	h1

get_h:
	add	x,tmp0
	add	y,tmp1
	and	mask,tmp0
	and	mask,tmp1
	add	map_base,tmp0
	shlq	#10,tmp1
	add	tmp0,tmp1
	jump	(LR)
	loadb	(tmp1),r0


	UNREG x,y,h0,h1,ptr0,GET_H,RAND
;;; ----------------------------------------
;;; RANDOM

random::
	move	rnd,tmp1
	rorq	#7,tmp1
	xor	tmp1,rnd

	move	rnd,tmp1
	shlq	#9,tmp1
	xor	tmp1,rnd

	move	rnd,tmp1
	shrq	#5,tmp1
	xor	tmp1,rnd

	movei	#$5556,tmp2	; 1/3*65535
	move	step,r0
	mult	step,tmp2
//->	move	step,tmp2
	subqt	#1,r0
//->	shrq	#2,tmp2
	shrq	#16,tmp2
	and	rnd,r0
	jump	(LR)
	sub	tmp2,r0

	unreg step,rnd

	ENDMODULE genmap

	echo "ENDE (genmap): %HMODend_genmap"
