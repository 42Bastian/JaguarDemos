;-*-asm-*-
DSP_song                        equ $f1d000-4
DSP_master_volume               equ $f1d000-8
DSP_filterPreCalcTable          equ $f1d000-12
DSP_panning_table               equ $f1d000-16
;;; 0 = running
;;; 1 = i2S en cours d'arret
;;; 2 = timer1 en cours d'arret
;;; 3 = main en cours d'arret
;;; 4 = totalement arreté
;;; 5 = pause playing
DSP_flag_replay_ON_OFF          .equ $f1d000-20
; xxxxxxCx xxBx2580 147*oxAP 369#RLDU
DSP_pad2                        .equ $f1d000-24 ; read by 68k/GPU
DSP_pad1                        .equ $f1d000-28 ; read by 68k/GPU
DSP_frequence_de_replay_reelle_I2S .equ $f1d000-32 ; read by 68k/GPU
DSP_stream_pos                  .equ $f1d000-36 ; read by 68k/GPU
