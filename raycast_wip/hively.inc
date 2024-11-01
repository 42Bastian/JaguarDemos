;-*-asm-*-
;;; ----------------------------------------
;;; parameters
DSP_song                        equ $f1d000-4
DSP_master_volume               equ $f1d000-8
DSP_filterPreCalcTable          equ $f1d000-12
DSP_panning_table               equ $f1d000-16
;;; 0 = running
;;; 1 = i2S stopping
;;; 2 = timer1 stopping / I2S stopped
;;; 3 = main stopping
;;; 4 = DSP stopped
;;; 5 = pause playing
;;; 6 = (re)start new song
DSP_flag_replay_ON_OFF          equ $f1d000-20
; xxxxxxCx xxBx2580 147*oxAP 369#RLDU
DSP_pad2                        equ $f1d000-24 ; read by 68k/GPU
DSP_pad1                        equ $f1d000-28 ; read by 68k/GPU
DSP_real_sample_rate 		equ $f1d000-32 ; read by 68k/GPU
DSP_stream_pos                  equ $f1d000-36 ; read by 68k/GPU
DSP_sample_ptr			equ $f1d000-40
DSP_sample_size			equ $f1d000-44
DSP_sample_fade			equ $f1d000-48 ; 0 => left, $100 => right (TBD)
DSP_sample_volume		equ $f1d000-52 ; 0 => silent, $100 full   (TBD)


;;; ----------------------------------------
;;; Song header
song_NB_channel         equ 0
song_speed_multiplier   equ 1
song_panningLeft        equ 2
song_panningRight       equ 3
song_rm_channels        equ 4
song_restart_word	equ 8
song_restart_bit	equ 12
song_length             equ 16
song_header_size        equ 20
