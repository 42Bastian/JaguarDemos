rez_x		equ 320	; 160/192/256/320
rez_y		equ 200

max_x_txt	equ 320
max_y_txt	equ 4*6

max_x		equ rez_x
max_y_gr	equ 200

screen0		equ $00080000
screen1		equ $000a0000
txt_screen	equ $000c0000
logo_screen	equ txt_screen+(max_x_txt/8)*max_y_txt
