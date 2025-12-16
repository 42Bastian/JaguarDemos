	include "jaguar.inc"
  .dsp

;;; Compiletime configuration
READ_PAD        equ 1
UPDATE_SONG_POS equ 0
DISPLAY_TIME    equ 0
;;; ----------------------------------------
;;; parameters
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
 .if READ_PAD = 1
; xxxxxxCx xxBx2580 147*oxAP 369#RLDU
DSP_pad2                        .equ $f1d000-24 ; read by 68k/GPU
DSP_pad1                        .equ $f1d000-28 ; read by 68k/GPU
 .endif
DSP_frequence_de_replay_reelle_I2S .equ $f1d000-32 ; read by 68k/GPU
DSP_stream_pos                  .equ $f1d000-36 ; read by 68k/GPU

;;; ----------------------------------------
;;; Configuration (constant)
max_NB_channels         equ 10
max_RM_channels         equ 4             ; max. RM buffers in DSP RAM
RM_channels             equ (1<<0)|(1<<1)|(1<<2)|(1<<9)
RM_buffers_main         equ $200        ; start of RM buffers in main
DSP_Audio_frequence     equ 32000

 ; mini freq = 16000 // freq amiga = 32000 // 32000/16000=2 => 2 bits // 128=>7 bits // 9 bits + signe : entiere = 10 bits
AHX_nb_bits_virgule_increment_period  .equ   16

SCLK_PAL        equ ((26593900*4/DSP_Audio_frequence+128)>>8)-1
DSP_frequence_de_replay_PAL equ 26593900/(SCLK_PAL+1)/64
A2J_RATIO_PAL   equ ((3546895<<9)/DSP_frequence_de_replay_PAL)<<(AHX_nb_bits_virgule_increment_period-9)

SCLK_NTSC       equ ((26590906*4/DSP_Audio_frequence+128)>>8)-1
DSP_frequence_de_replay_NTSC equ 26590906/(SCLK_NTSC+1)/64
A2J_RATIO_NTSC  equ ((3546895<<9)/DSP_frequence_de_replay_NTSC)<<(AHX_nb_bits_virgule_increment_period-9)

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
;;; ----------------------------------------

; HIVELY_datas_channels
DSP_index_vc_AudioVolume      equ  0
DSP_index_vc_Waveform         equ  1
DSP_index_vc_SquarePos        equ  2
DSP_index_vc_WaveLength       equ  3
DSP_index_vc_FilterPos        equ  4
DSP_index_vc_AudioPeriod      equ  5
DSP_index_vc_channel_on_off   equ  6
DSP_index_vc_RingWaveform     equ  7
DSP_index_vc_RingAudioPeriod  equ  8
DSP_index_vc__total           equ  9

; #AHX_enregistrements_N_voies
index_AHX_enregistrements_N_voies__I2S_offset        .equ 0
index_AHX_enregistrements_N_voies__I2S_increment     .equ 1
index_AHX_enregistrements_N_voies__I2S_mask_bouclage .equ 2
index_AHX_enregistrements_N_voies__I2S_buffer        .equ 3
index_AHX_enregistrements_N_voies__I2S_panning_left  .equ 4
index_AHX_enregistrements_N_voies__I2S_panning_right .equ 5
index_AHX_enregistrements_N_voies__I2S_offset__RM    .equ 6
index_AHX_enregistrements_N_voies__I2S_increment__RM .equ 7
index_AHX_enregistrements_N_voies__I2S_buffer__RM    .equ 8
AHX_enregistrements_N_voies__I2S_taille_totale       .equ 9

;------------------------------------------------------------
I2S_tmp_1                                .equr  R0
I2S_tmp_2                                .equr  R1
; voie G
I2S_offset_entier_et_virgule__voie_G     .equr  R2
I2S_increment_entier_et_virgule__voie_G  .equr  R3
I2S_mask_bouclage_voie_G                 .equr  R4
I2S_adresse_buffer_sample__voie_G        .equr  R5
; voie G
I2S_offset_entier_et_virgule__voie_D     .equr  R6
I2S_increment_entier_et_virgule__voie_D  .equr  R7
I2S_mask_bouclage_voie_D                 .equr  R8
I2S_adresse_buffer_sample__voie_D        .equr  R9

I2S_adresse_code_boucle                  .equr  R10
I2S_sample_gauche                        .equr  R11
I2S_sample_droite                        .equr  R12
I2S_mask_elimination_bits_adresse_pour_lecture_word   .equr    R13
I2S_pointeur_datas_voie_en_cours_G        .equr  R14
I2S_pointeur_datas_voie_en_cours_D        .equr  R15
I2S_compteur_nb_voie                      .equr  R16
I2S_increment_taille_AHX_enregistrements_N_voies  .equr  R17
I2S_pointeur_DAC_voie_G                   .equr  R18       ; init par moveta
I2S_pointeur_DAC_voie_D                   .equr  R19       ; init par moveta
; R20
I2S_tmp_3                                 .equr  R21
I2S_tmp_4                                 .equr  R22
I2S_tmp_sample_G                          .equr  R23
I2S_tmp_sample_D                          .equr  R24
I2S_routine_actuelle                      .equr  R28
I2S_save_flags                            .equr  R29
;R30=used
;R31=stack

 .org D_RAM

 movei  #DSP_routine_init,r0
 jump   (r0)
 nop
        .align 16
DSP_ISP:
;--------------------------------------------
; I2S interrupt
 movei  #D_FLAGS,r30
 movei  #DSP_NB_channels,I2S_compteur_nb_voie
 jump   (I2S_routine_actuelle)
 load   (r30),I2S_save_flags    ; read flags

;--------------------------------------------
; Timer 1 interrupt
 movei  #D_FLAGS,r30
 movei  #DSP_flag_replay_ON_OFF,I2S_tmp_1
 load   (r30),r29                 ; read flags
 load   (I2S_tmp_1),I2S_tmp_2
 moveq  #1,I2S_tmp_1
 cmpq   #2,I2S_tmp_2            ; stop timer 1?
 moveta I2S_tmp_1,r21           ; set flag for main loop
 jr     ne,DSP_LSP_routine_interruption_Timer1__pas_de_sortie
 bclr   #3,R29                  ; clear IMASK

 moveq  #3,I2S_tmp_3
 bclr   #6,R29                  ; clear Timer 1 Interrupt Enable Bit
 store  I2S_tmp_3,(I2S_tmp_1)

DSP_LSP_routine_interruption_Timer1__pas_de_sortie:
 load   (r31),I2S_tmp_3         ; return address
 bset   #11,R29                 ; clear latch 1 = timer 1
 addqt  #2,I2S_tmp_3            ; next instruction
 addq   #4,r31                  ; pop from stack
 jump   (I2S_tmp_3)             ; return
 store  R29,(R30)               ; restore flags

;;; --------------------------------------------------
; I2S:
; version sans adaptation du volume, avec SAT
I2S_N_voies:
 load   (I2S_compteur_nb_voie),I2S_compteur_nb_voie
 shrq   #1,I2S_compteur_nb_voie
 movei  #AHX_enregistrements_N_voies,I2S_pointeur_datas_voie_en_cours_G
 moveq  #AHX_enregistrements_N_voies__I2S_taille_totale,I2S_increment_taille_AHX_enregistrements_N_voies
 shlq   #2,I2S_increment_taille_AHX_enregistrements_N_voies
 move   I2S_pointeur_datas_voie_en_cours_G,I2S_pointeur_datas_voie_en_cours_D
 moveq  #%00000010,I2S_mask_elimination_bits_adresse_pour_lecture_word
 add    I2S_increment_taille_AHX_enregistrements_N_voies,I2S_pointeur_datas_voie_en_cours_D
 moveq  #0,I2S_sample_gauche
 add    I2S_increment_taille_AHX_enregistrements_N_voies,I2S_increment_taille_AHX_enregistrements_N_voies
 moveq  #0,I2S_sample_droite

; offset 16.16
; increment 16.16
; mask bouclage
; adresse buffer sample
 move pc,I2S_adresse_code_boucle
I2S_N_voies__boucle_voie:
 load  (I2S_pointeur_datas_voie_en_cours_G), I2S_offset_entier_et_virgule__voie_G
 load  (I2S_pointeur_datas_voie_en_cours_D), I2S_offset_entier_et_virgule__voie_D
 load  (I2S_pointeur_datas_voie_en_cours_G+index_AHX_enregistrements_N_voies__I2S_increment), I2S_increment_entier_et_virgule__voie_G
 load  (I2S_pointeur_datas_voie_en_cours_D+index_AHX_enregistrements_N_voies__I2S_increment), I2S_increment_entier_et_virgule__voie_D
 add  I2S_increment_entier_et_virgule__voie_G,I2S_offset_entier_et_virgule__voie_G

 load  (I2S_pointeur_datas_voie_en_cours_G+index_AHX_enregistrements_N_voies__I2S_mask_bouclage), I2S_mask_bouclage_voie_G
 add  I2S_increment_entier_et_virgule__voie_D,I2S_offset_entier_et_virgule__voie_D
 load  (I2S_pointeur_datas_voie_en_cours_D+index_AHX_enregistrements_N_voies__I2S_mask_bouclage), I2S_mask_bouclage_voie_D

 load  (I2S_pointeur_datas_voie_en_cours_G+index_AHX_enregistrements_N_voies__I2S_buffer), I2S_adresse_buffer_sample__voie_G
 load  (I2S_pointeur_datas_voie_en_cours_D+index_AHX_enregistrements_N_voies__I2S_buffer), I2S_adresse_buffer_sample__voie_D

 store  I2S_offset_entier_et_virgule__voie_G,(I2S_pointeur_datas_voie_en_cours_G)
 store  I2S_offset_entier_et_virgule__voie_D,(I2S_pointeur_datas_voie_en_cours_D)

 and    I2S_mask_bouclage_voie_G,I2S_offset_entier_et_virgule__voie_G      ; mask a virgule sur offset à virgule
 and    I2S_mask_bouclage_voie_D,I2S_offset_entier_et_virgule__voie_D

 sharq  #AHX_nb_bits_virgule_increment_period-1,I2S_offset_entier_et_virgule__voie_G   ; -2 pour *4   l'offset est multiplié par 4 car en 2 fois .W
 sharq  #AHX_nb_bits_virgule_increment_period-1,I2S_offset_entier_et_virgule__voie_D   ; -2 pour *4

 add    I2S_adresse_buffer_sample__voie_G,I2S_offset_entier_et_virgule__voie_G
 add    I2S_adresse_buffer_sample__voie_D,I2S_offset_entier_et_virgule__voie_D

 load   (I2S_offset_entier_et_virgule__voie_G),I2S_tmp_sample_G   ; lit le sample en .L, prémultiplié par le volume // l'arrondi à un multiple de 4 n'est pas important car lecture dans RAM DSP locale, donc lit la meme chose sur 0/1/2 ou 3
 load   (I2S_offset_entier_et_virgule__voie_D),I2S_tmp_sample_D

 and    I2S_mask_elimination_bits_adresse_pour_lecture_word,I2S_offset_entier_et_virgule__voie_G
 and    I2S_mask_elimination_bits_adresse_pour_lecture_word,I2S_offset_entier_et_virgule__voie_D
 shlq   #3,I2S_offset_entier_et_virgule__voie_G
 shlq   #3,I2S_offset_entier_et_virgule__voie_D
 sha    I2S_offset_entier_et_virgule__voie_G,I2S_tmp_sample_G
 sha    I2S_offset_entier_et_virgule__voie_D,I2S_tmp_sample_D

 ; si on a 2 words sur 1 .L
 ; l'adresse doit etre multipliée par 2, plus par 4
 ; and avec %00010000 : on elimine le reste de virgule, et on ne garde que 0 ou 1 sur l'adresse *2
 ; sharq #4 : de 0 ou 16 => 0 ou 1
 ; il faut aboutir a un sharq 0 ou 16
 ; ====> pas de sharq
 ; juste sharq adresse sur sample


; RM à gérer ici
; voie G
; load l'increment et si =0 => pas de RM
 load   (I2S_pointeur_datas_voie_en_cours_G+index_AHX_enregistrements_N_voies__I2S_increment__RM), I2S_increment_entier_et_virgule__voie_G
 load   (I2S_pointeur_datas_voie_en_cours_D+index_AHX_enregistrements_N_voies__I2S_increment__RM), I2S_increment_entier_et_virgule__voie_D
 cmpq   #0,I2S_increment_entier_et_virgule__voie_G
 jr     eq,I2S_N_voies__pas_de_RM__voie_G
; RM en voie G
 load   (I2S_pointeur_datas_voie_en_cours_G+index_AHX_enregistrements_N_voies__I2S_offset__RM), I2S_offset_entier_et_virgule__voie_G
 load   (I2S_pointeur_datas_voie_en_cours_G+index_AHX_enregistrements_N_voies__I2S_buffer__RM), I2S_adresse_buffer_sample__voie_G
 add    I2S_increment_entier_et_virgule__voie_G,I2S_offset_entier_et_virgule__voie_G
 store  I2S_offset_entier_et_virgule__voie_G,(I2S_pointeur_datas_voie_en_cours_G+index_AHX_enregistrements_N_voies__I2S_offset__RM)
 and    I2S_mask_bouclage_voie_G,I2S_offset_entier_et_virgule__voie_G
 sharq  #AHX_nb_bits_virgule_increment_period-2,I2S_offset_entier_et_virgule__voie_G   ; -2 pour *4
 add    I2S_adresse_buffer_sample__voie_G,I2S_offset_entier_et_virgule__voie_G
 load   (I2S_offset_entier_et_virgule__voie_G),I2S_increment_entier_et_virgule__voie_G   ; lit le sample en .L, du RM
 imult  I2S_increment_entier_et_virgule__voie_G,I2S_tmp_sample_G
 sharq  #7,I2S_tmp_sample_G
I2S_N_voies__pas_de_RM__voie_G:
; voie D
; load l'increment et si =0 => pas de RM
 cmpq   #0,I2S_increment_entier_et_virgule__voie_D
 jr     eq,I2S_N_voies__pas_de_RM__voie_D
; RM en voie G
 load   (I2S_pointeur_datas_voie_en_cours_D+index_AHX_enregistrements_N_voies__I2S_offset__RM), I2S_offset_entier_et_virgule__voie_D
 load   (I2S_pointeur_datas_voie_en_cours_D+index_AHX_enregistrements_N_voies__I2S_buffer__RM), I2S_adresse_buffer_sample__voie_D
 add    I2S_increment_entier_et_virgule__voie_D,I2S_offset_entier_et_virgule__voie_D
 store  I2S_offset_entier_et_virgule__voie_D,(I2S_pointeur_datas_voie_en_cours_D+index_AHX_enregistrements_N_voies__I2S_offset__RM)
 and    I2S_mask_bouclage_voie_D,I2S_offset_entier_et_virgule__voie_D
 sharq  #AHX_nb_bits_virgule_increment_period-2,I2S_offset_entier_et_virgule__voie_D   ; -2 pour *4
 add    I2S_adresse_buffer_sample__voie_D,I2S_offset_entier_et_virgule__voie_D
 load   (I2S_offset_entier_et_virgule__voie_D),I2S_increment_entier_et_virgule__voie_D   ; lit le sample en .L, du RM
 imult  I2S_increment_entier_et_virgule__voie_D,I2S_tmp_sample_D
 sharq  #7,I2S_tmp_sample_D
I2S_N_voies__pas_de_RM__voie_D:
; stereo panning
 load   (I2S_pointeur_datas_voie_en_cours_G+index_AHX_enregistrements_N_voies__I2S_panning_left),I2S_tmp_1     ; voie 1 / panning left
 load   (I2S_pointeur_datas_voie_en_cours_D+index_AHX_enregistrements_N_voies__I2S_panning_left),I2S_tmp_3     ; voie 2 / panning left
 load   (I2S_pointeur_datas_voie_en_cours_G+index_AHX_enregistrements_N_voies__I2S_panning_right),I2S_tmp_2    ; voie 1 / panning right
 load   (I2S_pointeur_datas_voie_en_cours_D+index_AHX_enregistrements_N_voies__I2S_panning_right),I2S_tmp_4    ; voie 2 / panning right

; sample * panning
; sample = 14 bits : 8+6(volume)
; panning = 8 bits
; 14+8=22
; 22-7=15
; 15+15 => 16
 imultn I2S_tmp_sample_G,I2S_tmp_1
 imacn  I2S_tmp_sample_D,I2S_tmp_3
 resmac I2S_tmp_1

 imultn I2S_tmp_sample_G,I2S_tmp_2
 imacn  I2S_tmp_sample_D,I2S_tmp_4
 resmac I2S_tmp_2

 sharq  #7,I2S_tmp_1
 sharq  #7,I2S_tmp_2

 add    I2S_tmp_1,I2S_sample_gauche
 add    I2S_tmp_2,I2S_sample_droite

 add    I2S_increment_taille_AHX_enregistrements_N_voies,I2S_pointeur_datas_voie_en_cours_G

 subq   #1,I2S_compteur_nb_voie
 jump   ne,(I2S_adresse_code_boucle)
 add    I2S_increment_taille_AHX_enregistrements_N_voies,I2S_pointeur_datas_voie_en_cours_D

 movei  #DSP_master_volume,I2S_tmp_1
 load   (I2S_tmp_1),I2S_tmp_1

 sat16s I2S_sample_gauche
 sat16s I2S_sample_droite

 imult  I2S_tmp_1,I2S_sample_gauche
 imult  I2S_tmp_1,I2S_sample_droite

 sharq  #8,I2S_sample_gauche
 sharq  #8,I2S_sample_droite

 sat16s  I2S_sample_gauche
 sat16s  I2S_sample_droite

 store  I2S_sample_gauche,(I2S_pointeur_DAC_voie_G)
 store  I2S_sample_droite,(I2S_pointeur_DAC_voie_D)
; return from interrupt I2S

 load   (r31),I2S_tmp_1        ; return address
 bclr   #3,I2S_save_flags       ; clear IMASK
 addqt  #2,I2S_tmp_1          ; next instruction
 bset   #10,I2S_save_flags      ; clear latch 1 = I2S
 addq   #4,r31                       ; pop from stack
 jump   (I2S_tmp_1)            ; return
 store  I2S_save_flags,(R30)  ; restore flags

;------------------------------------------
;------------------------------------------
; ------------- main DSP ------------------
;------------------------------------------
;------------------------------------------

song_data_ptr   equr    r29
multiplier      equr    r28
panningDftLeft	equr	r27
panningDftRight	equr	r26
panningTableL	equr	r25
panningTableR	equr	r24
nextVoice	equr	r23
rm_mask		equr	r22
local_data      equr    r15
voiceTable	equr	r14

;; local data indexes
streamingbits_index     equ 0
streamingbits_cur_index equ 1
streamingbits_end_index equ 2
NB_channel_index        equ 3

DSP_routine_init:
; assume run from bank 1
 movei  #DSP_ISP,r31    ; init isp
 moveta r31,r31         ; ISP (bank 0)

 movei  #DSP_song,song_data_ptr
 movei  #DSP_localData,local_data
 load   (song_data_ptr),song_data_ptr

 loadb  (song_data_ptr),r0 ;
 store  r0,(local_data+NB_channel_index)
 addq   #1,song_data_ptr

 loadb  (song_data_ptr),multiplier
 addq   #1,song_data_ptr
 loadb	(song_data_ptr),panningDftLeft
 addq   #1,song_data_ptr
 loadb	(song_data_ptr),panningDftRight
 addq   #1,song_data_ptr

 load	(song_data_ptr),rm_mask
 addq   #4,song_data_ptr

 addq	#8,song_data_ptr	; skip restart_word and bit

 load   (song_data_ptr),r0 ; length
 addq   #4,song_data_ptr

 store  song_data_ptr,(local_data)
 store  song_data_ptr,(local_data+streamingbits_cur_index)
 add    r0,song_data_ptr
 store  song_data_ptr,(local_data+streamingbits_end_index)

 ; gauche : 1 4 5 8 9  12 13 16
 ; droite : 2 3 6 7 10 11 14 15

initPanning:
 movei	#DSP_panning_table,panningTableL
 moveq	#0,panningTableR
 load	(panningTableL),panningTableL
 bset	#8,panningTableR
 add	panningTableL,panningTableR
 movei	#AHX_enregistrements_N_voies,voiceTable
 moveq	#AHX_enregistrements_N_voies__I2S_taille_totale,nextVoice
 shlq	#2,nextVoice
 moveta voiceTable,voiceTable
 moveta nextVoice,nextVoice

 move	panningDftLeft,r0
 move	panningDftLeft,r2
 add	panningTableL,r0
 add	panningTableR,r2
 loadb	(r0),r0
 loadb	(r2),r2

 move	panningDftRight,r1
 move	panningDftRight,r3
 add	panningTableL,r1
 add	panningTableR,r3
 loadb	(r1),r1
 loadb	(r3),r3
 moveq	#2,r4
initPanningLoop:
;;; #1
 store	r0,(voiceTable+index_AHX_enregistrements_N_voies__I2S_panning_left)
 store	r2,(voiceTable+index_AHX_enregistrements_N_voies__I2S_panning_right)
 add	nextVoice,voiceTable
;;; 2
 store	r1,(voiceTable+index_AHX_enregistrements_N_voies__I2S_panning_left)
 store	r3,(voiceTable+index_AHX_enregistrements_N_voies__I2S_panning_right)
 add	nextVoice,voiceTable
;;; 3
 store	r1,(voiceTable+index_AHX_enregistrements_N_voies__I2S_panning_left)
 store	r3,(voiceTable+index_AHX_enregistrements_N_voies__I2S_panning_right)
 add	nextVoice,voiceTable
;;; #4
 store	r0,(voiceTable+index_AHX_enregistrements_N_voies__I2S_panning_left)
 subq	#1,r4
 store	r2,(voiceTable+index_AHX_enregistrements_N_voies__I2S_panning_right)
 jr	ne,initPanningLoop
 add	nextVoice,voiceTable

;;; #9
 store	r0,(voiceTable+index_AHX_enregistrements_N_voies__I2S_panning_left)
 store	r2,(voiceTable+index_AHX_enregistrements_N_voies__I2S_panning_right)
 add	nextVoice,voiceTable
;;; 10
 store	r1,(voiceTable+index_AHX_enregistrements_N_voies__I2S_panning_left)
 store	r3,(voiceTable+index_AHX_enregistrements_N_voies__I2S_panning_right)
//-> add	nextVoice,voiceTable
;;; ----------------------------------------
;;; setup RM buffers

rm_buffer_int	equr	r27
rm_buffer_ext	equr	r26
buffer_offset	equr	r25
rm_channel_cnt	equr	r24
//->nextVoice	equr	r23
//->rm_mask		equr	r22
channel_cnt	equr	r21

 movefa voiceTable,voiceTable
 movefa nextVoice,nextVoice
 movei	#RM_buffers_main,rm_buffer_ext
 movei	#RM_buffers,rm_buffer_int
 moveq	#0,buffer_offset
 bset	#7+2,buffer_offset
 moveq	#max_RM_channels,rm_channel_cnt
 moveq	#max_NB_channels,channel_cnt
rm_init:
 shrq	#1,rm_mask
 move	rm_buffer_ext,r0
 jr	cc,rm_ext
 nop
 move	rm_buffer_int,r0
 subq	#1,rm_channel_cnt
 jr	ne,rm_set
 add	buffer_offset,rm_buffer_int
 jr	rm_set
 moveq	#0,rm_mask		; all internal buffers use, swith to ext.

rm_ext:
 move	rm_buffer_ext,r0
 add	buffer_offset,rm_buffer_ext
rm_set:
 subq	#1,channel_cnt
 store	r0,(voiceTable+index_AHX_enregistrements_N_voies__I2S_buffer__RM)
 jr	ne,rm_init
 add	nextVoice,voiceTable

;;; ----------------------------------------
;;; Setup timer1 and I2C
 movei  #A2J_RATIO_PAL,r12
 movei  #SCLK_PAL,r11
 movei  #DSP_frequence_de_replay_PAL,r10
 movei  #JOYBUTS,r0
 loadw  (r0),r3
 btst   #4,r3
 jr     eq,initPAL
 nop
 movei  #A2J_RATIO_NTSC,r12
 movei  #SCLK_NTSC,r11
 movei  #DSP_frequence_de_replay_NTSC,r10

initPAL:
 movei  #DSP_frequence_de_replay_reelle_I2S,R2
 store  R10,(R2)
 movei  #DSP_ratio_Amiga_Jaguar__a_virgule_9_bits,R2
 store  R12,(R2)

        ; moveta, constantes I2S
 movei  #L_I2S,R0
 moveta R0,I2S_pointeur_DAC_voie_D
 addq   #4,r0
 moveta R0,I2S_pointeur_DAC_voie_G
 movei  #I2S_N_voies,R0
 moveta R0,I2S_routine_actuelle

; init I2S
 movei  #SCLK,r0
 moveq  #%001101,r13     ; SMODE bascule sur RISING
 store  r11,(r0)         ; SCLK
 addq   #4,r0
 store  r13,(r0)         ; SMODE

; init Timer 1 = 50 HZ
 movei  #3643*2,R13             ; valeur pour 50 Hz (original 3643)
 div    multiplier,R13          ; divise pour avoir la bonne vitesse de replay
 subq   #1,R13                  ; -1 pour parametrage du timer 1

; 26593900 / 50 = 531 878 => 2 × 73 × 3643 => 146*3643
 movei  #JPIT1,r10
 movei  #(146/2-1)*65536,r12    ; Timer 1 Pre-scaler
 or     R13,R12
 store  r12,(r10)               ; JPIT1 & JPIT2

; enable interrupts
 movei  #D_FLAGS,r24
 movei  #D_I2SENA|D_TIM1ENA|REGPAGE,r29  ; I2S+Timer 1
 store  r29,(r24)                        ; demarre les timers
;------------------------------------------------------
;
; boucle centrale
;
;------------------------------------------------------

; ------------------------------
; decode stream AHX version bits
;HIVELY_datas_channels:
;  .rept  NB_channels
;  dc.l   0         ; vc_AudioVolume
;  dc.l   0         ; vc_Waveform
;  dc.l   0         ; vc_SquarePos
;  dc.l   0         ; vc_WaveLength
;  dc.l   0         ; vc_FilterPos
;  dc.l   0         ; vc_AudioPeriod
;  ; Ring Modulation : vc_Waveform+vc_WaveLength+vc_AudioPeriod
;  .endr

DSP_decode_bits__nb_bits_a_lire                      .equr    R0
DSP_decode_bits__bits_resultat                       .equr    R1
DSP_decode_bits__tmp0                                .equr    R2
DSP_decode_bits__tmp1                                .equr    R3
DSP_decode_bits__compteur_voies                      .equr    R4
DSP_decode_bits__flags_datas                         .equr    R5
;                                                    .equr    R6
DSP_decode_bits__taille_d_un_record_datas_channel    .equr    R7
DSP_decode_bits__tmp2                                .equr    R8
DSP_decode_bits__tmp3                                .equr    R9
DSP_decode_bits__adresse_pointeur_lecture_bits       .equr    R10
DSP_decode_bits__pointeur_lecture_bits               .equr    R11
DSP_decode_bits_bitcount                             .equr    R12 ; do not re-use!
;                                                    .equr    R13
DSP_decode_bits__datas_channels_destination          .equr    R14
DSP_decode_bits__datas_I2S_destination               .equr    R15
DSP_decode_bits__table_panning_voies                 .equr    R19
DSP_decode_bits_bitbuffer                            .equr    R20 ; do not re-use!
DSP_decode_bits__adresse_boucle_enreg_datas_channels .equr    R21
DSP_decode_bits__increment_datas_I2S_destination     .equr    R22

DSP_decode_bits__adresse_routine_lecture_bits        .equr    R27
DSP_decode_bits__adresse_retour                      .equr    R28

 moveq  #0,DSP_decode_bits_bitcount ; force loading first word

 moveq  #1,r21
DSP_boucle_centrale:

DSP_boucle_centrale__wait_for_timer1_and_68000tick:
 cmpq   #1,R21    ; attente du timer 1
 jr     ne,DSP_boucle_centrale__wait_for_timer1_and_68000tick
 nop

; change la couleur de fond - debug
 .if  DISPLAY_TIME = 1
 moveq  #$f,r14
 shlq   #20,r14
 store r14,(r14+$58/4)
 .endif

 movei  #D_FLAGS,r24
 load   (r24),r29
 bset   #4+1,r29                        ; enable I2S

 movei  #DSP_flag_replay_ON_OFF,R0
 load   (R0),R1
 movei  #DSP_sortie_finale,R2
 cmpq   #5,r1
 jr     ne,no_pause
 cmpq   #0,R1

 movei  #pause_music,r1
 bclr   #4+1,r29                        ; clear I2S
 jump   (r1)
 store  r29,(r24)

no_pause:
 jump   ne,(R2)         ; end
 nop
 store  r29,(r24)                        ; demarre les timers

 .if UPDATE_SONG_POS = 1
 movei  #DSP_localData,r14
 load   (r14+streamingbits_cur_index),r0
 load   (r14),r1
 sub    r1,r0
 movei  #DSP_stream_pos,r1
 store  r0,(r1)
 .endif

 movei  #AHX_enregistrements_N_voies,DSP_decode_bits__datas_I2S_destination
 moveq  #AHX_enregistrements_N_voies__I2S_taille_totale,DSP_decode_bits__increment_datas_I2S_destination
 shlq   #2,DSP_decode_bits__increment_datas_I2S_destination
 movei  #DSP_AHX_decode_streaming_V4__read_bits_from_bits_streaming,DSP_decode_bits__adresse_routine_lecture_bits
 movei  #DSP_module_streaming_bits_cur,DSP_decode_bits__adresse_pointeur_lecture_bits
 load   (DSP_decode_bits__adresse_pointeur_lecture_bits),DSP_decode_bits__pointeur_lecture_bits

; tester fin de stream = bouclage du stream
 movei  #DSP_module_streaming_bits_end,DSP_decode_bits__tmp0
 load   (DSP_decode_bits__tmp0),DSP_decode_bits__tmp0
 cmp    DSP_decode_bits__tmp0,DSP_decode_bits__pointeur_lecture_bits
 movei  #DSP_song,r14
 jr     cs,DSP_boucle_read_bits_per_channel__pas_fin_du_fichier
 load	(r14),r14
;;; restart
 load	(r14+song_restart_word/4),DSP_decode_bits__pointeur_lecture_bits
 add	r14,DSP_decode_bits__pointeur_lecture_bits
 load	(r14+song_restart_bit/4),DSP_decode_bits_bitcount
 addq	#song_header_size,DSP_decode_bits__pointeur_lecture_bits
 load   (DSP_decode_bits__pointeur_lecture_bits),DSP_decode_bits_bitbuffer
 addq	#4,DSP_decode_bits__pointeur_lecture_bits
 move	DSP_decode_bits_bitcount,DSP_decode_bits__compteur_voies
 subq	#32,DSP_decode_bits__compteur_voies
 sh	DSP_decode_bits__compteur_voies,DSP_decode_bits_bitbuffer ; remove "used" bits

DSP_boucle_read_bits_per_channel__pas_fin_du_fichier:
 movei  #DSP_NB_channels,DSP_decode_bits__compteur_voies
 load   (DSP_decode_bits__compteur_voies),DSP_decode_bits__compteur_voies

 movei  #DSP_HVL_table_panning_voies_de_base,DSP_decode_bits__table_panning_voies
 move   pc,DSP_decode_bits__adresse_boucle_enreg_datas_channels
DSP_boucle_read_bits_per_channel:
 load    (DSP_decode_bits__table_panning_voies),DSP_decode_bits__datas_channels_destination

; lecture des 8 bits de description/flags
 moveq  #8,DSP_decode_bits__nb_bits_a_lire     ; lit 7 bits => DSP_decode_bits__bits_resultat

 move   PC,DSP_decode_bits__adresse_retour
 jump   (DSP_decode_bits__adresse_routine_lecture_bits)
 addq   #6,DSP_decode_bits__adresse_retour

 move   DSP_decode_bits__bits_resultat,DSP_decode_bits__flags_datas

;--- 7
; vc_Pan : 8 bits
 movei  #DSP_AHX_decode_streaming_V2__boucle_voie__pas_de_vc_Pan,DSP_decode_bits__tmp0
 btst   #7,DSP_decode_bits__flags_datas
 jump   eq,(DSP_decode_bits__tmp0)
 moveq  #8,DSP_decode_bits__nb_bits_a_lire

 move   PC,DSP_decode_bits__adresse_retour
 jump   (DSP_decode_bits__adresse_routine_lecture_bits)
 addq   #6,DSP_decode_bits__adresse_retour

 ; R01=vc_Pan
; ici , convertir vc pan en ?
 moveq	#0,DSP_decode_bits__tmp1
 movei	#DSP_panning_table,DSP_decode_bits__tmp0
 load	(DSP_decode_bits__tmp0),DSP_decode_bits__tmp0
 bset	#8,DSP_decode_bits__tmp1
 add	DSP_decode_bits__tmp0,DSP_decode_bits__tmp1
 add    DSP_decode_bits__bits_resultat,DSP_decode_bits__tmp0
 add    DSP_decode_bits__bits_resultat,DSP_decode_bits__tmp1
 loadb  (DSP_decode_bits__tmp0),DSP_decode_bits__tmp0
 loadb  (DSP_decode_bits__tmp1),DSP_decode_bits__tmp1
 or     DSP_decode_bits__tmp0,DSP_decode_bits__tmp0
 or     DSP_decode_bits__tmp1,DSP_decode_bits__tmp1
 store  DSP_decode_bits__tmp0,(DSP_decode_bits__datas_I2S_destination+index_AHX_enregistrements_N_voies__I2S_panning_left)
 store  DSP_decode_bits__tmp1,(DSP_decode_bits__datas_I2S_destination+index_AHX_enregistrements_N_voies__I2S_panning_right)

;--- 6
DSP_AHX_decode_streaming_V2__boucle_voie__pas_de_vc_Pan:
; vc_AudioVolume : 6 bits
 btst   #6,DSP_decode_bits__flags_datas
 jr     eq,DSP_AHX_decode_streaming_V2__boucle_voie__pas_de_vc_AudioVolume
 moveq  #6,DSP_decode_bits__nb_bits_a_lire

 move   PC,DSP_decode_bits__adresse_retour
 jump   (DSP_decode_bits__adresse_routine_lecture_bits)
 addq   #6,DSP_decode_bits__adresse_retour

 store  DSP_decode_bits__bits_resultat,(DSP_decode_bits__datas_channels_destination) ;DSP_index_vc_AudioVolume

;--- 5
DSP_AHX_decode_streaming_V2__boucle_voie__pas_de_vc_AudioVolume:
; vc_Waveform : 2 bits
 btst   #5,DSP_decode_bits__flags_datas
 jr     eq,DSP_AHX_decode_streaming_V2__boucle_voie__pas_de_vc_Waveform
 moveq  #2,DSP_decode_bits__nb_bits_a_lire
 move   pc,DSP_decode_bits__adresse_retour
 jump   (DSP_decode_bits__adresse_routine_lecture_bits)
 addq   #6,DSP_decode_bits__adresse_retour

 store  DSP_decode_bits__bits_resultat,(DSP_decode_bits__datas_channels_destination+DSP_index_vc_Waveform)

;--- 4
DSP_AHX_decode_streaming_V2__boucle_voie__pas_de_vc_Waveform:
; vc_SquarePos : 6 bits
 btst   #4,DSP_decode_bits__flags_datas
 jr     eq,DSP_AHX_decode_streaming_V2__boucle_voie__pas_de_vc_SquarePos
 moveq  #6,DSP_decode_bits__nb_bits_a_lire

 move   pc,DSP_decode_bits__adresse_retour
 jump   (DSP_decode_bits__adresse_routine_lecture_bits)
 addq   #6,DSP_decode_bits__adresse_retour

 store  DSP_decode_bits__bits_resultat,(DSP_decode_bits__datas_channels_destination+DSP_index_vc_SquarePos)

;--- 3
DSP_AHX_decode_streaming_V2__boucle_voie__pas_de_vc_SquarePos:
; vc_WaveLength : 3 bits
 btst   #3,DSP_decode_bits__flags_datas
 jr     eq,DSP_AHX_decode_streaming_V2__boucle_voie__pas_de_vc_WaveLength
 moveq  #3,DSP_decode_bits__nb_bits_a_lire

 move   pc,DSP_decode_bits__adresse_retour
 jump   (DSP_decode_bits__adresse_routine_lecture_bits)
 addq   #6,DSP_decode_bits__adresse_retour

 store  DSP_decode_bits__bits_resultat,(DSP_decode_bits__datas_channels_destination+DSP_index_vc_WaveLength)

;--- 2
DSP_AHX_decode_streaming_V2__boucle_voie__pas_de_vc_WaveLength:
; vc_FilterPos : 6 bits
 btst   #2,DSP_decode_bits__flags_datas
 jr     eq,DSP_AHX_decode_streaming_V2__boucle_voie__pas_de_vc_FilterPos
 moveq  #6,DSP_decode_bits__nb_bits_a_lire

 move   pc,DSP_decode_bits__adresse_retour
 jump   (DSP_decode_bits__adresse_routine_lecture_bits)
 addq   #6,DSP_decode_bits__adresse_retour

 store  DSP_decode_bits__bits_resultat,(DSP_decode_bits__datas_channels_destination+DSP_index_vc_FilterPos)

;--- 1
DSP_AHX_decode_streaming_V2__boucle_voie__pas_de_vc_FilterPos:
; vc_AudioPeriod : 12 bits
 btst   #1,DSP_decode_bits__flags_datas
 jr     eq,DSP_AHX_decode_streaming_V2__boucle_voie__pas_de_vc_AudioPeriod
 moveq  #12,DSP_decode_bits__nb_bits_a_lire

 move   pc,DSP_decode_bits__adresse_retour
 jump   (DSP_decode_bits__adresse_routine_lecture_bits)
 addq   #6,DSP_decode_bits__adresse_retour
 store  DSP_decode_bits__bits_resultat,(DSP_decode_bits__datas_channels_destination+DSP_index_vc_AudioPeriod)

;--- 0
DSP_AHX_decode_streaming_V2__boucle_voie__pas_de_vc_AudioPeriod:
; Ring Modulation N/A
 btst   #0,DSP_decode_bits__flags_datas
 jr     eq,DSP_AHX_decode_streaming_V2__boucle_voie__pas_de_RM
 moveq  #1,DSP_decode_bits__nb_bits_a_lire

; en cas de RM, le bit est a 1 aussi si le RM vient d'etre coupé, dans ce cas là,
; vc_RingWaveform (1 bit) =0 + vc_RingAudioPeriod (12 bits) =0
; lecture vc_RingWaveform
 move   pc,DSP_decode_bits__adresse_retour
 jump   (DSP_decode_bits__adresse_routine_lecture_bits)
 addq   #6,DSP_decode_bits__adresse_retour

 store  DSP_decode_bits__bits_resultat,(DSP_decode_bits__datas_channels_destination+DSP_index_vc_RingWaveform)

; lecture vc_RingAudioPeriod
 moveq  #12,DSP_decode_bits__nb_bits_a_lire
 move   pc,DSP_decode_bits__adresse_retour
 jump   (DSP_decode_bits__adresse_routine_lecture_bits)
 addq   #6,DSP_decode_bits__adresse_retour

 store  DSP_decode_bits__bits_resultat,(DSP_decode_bits__datas_channels_destination+DSP_index_vc_RingAudioPeriod)

DSP_AHX_decode_streaming_V2__boucle_voie__pas_de_RM:
; check si channel on, si off on met le volume à zéro
 load   (DSP_decode_bits__datas_channels_destination+DSP_index_vc_channel_on_off),DSP_decode_bits__flags_datas
 or     DSP_decode_bits__flags_datas,DSP_decode_bits__flags_datas
 jr     ne,DSP_read_bits__pas_channel_off
 moveq  #0,DSP_decode_bits__nb_bits_a_lire

 store  DSP_decode_bits__nb_bits_a_lire,(DSP_decode_bits__datas_channels_destination)
//-> store  DSP_decode_bits__nb_bits_a_lire,(DSP_decode_bits__datas_channels_destination+DSP_index_vc_AudioVolume)

DSP_read_bits__pas_channel_off:
 subq   #1,DSP_decode_bits__compteur_voies
 addqt  #4,DSP_decode_bits__table_panning_voies
 jump   ne,(DSP_decode_bits__adresse_boucle_enreg_datas_channels)
 add    DSP_decode_bits__increment_datas_I2S_destination,DSP_decode_bits__datas_I2S_destination

 store  DSP_decode_bits__pointeur_lecture_bits,(DSP_decode_bits__adresse_pointeur_lecture_bits)

; FIN DE : decode stream AHX version bits
; ------------------------------

; ------------------------------
; interprete valeurs dans datas pour chaque channels pour remplir increment, mask et buffer
;
; increment en fonction de l'audioperiod
; mask en fonction de wavelength uniquement ?
;
;
; vc_AudioVolume
; vc_Waveform
; vc_SquarePos
; vc_WaveLength
; vc_FilterPos
; vc_AudioPeriod
;

; --------------- code de gestion du AHX vers I2S ------------------------
; triangle et sawtooth : lire N octets ( wavelength) / appliquer le filtre sur N octets/ appliquer le volume sur N octets            : 1 buffer temporaire = buffer_temp_wave
; square : generer 128 octets / apppliquer le filtre sur 128 octets / lire N octets ( wavelength) / appliquer le volume sur N octets     : possible sur 1 buffer temporaire : source et dest meme adresse lors de la selection des octets
; noise : generer 128 octets / apppliquer le filtre sur 128 octets / appliquer le volume sur 128 octets                      : 1 buffer temporaire
;
; 4 routines :
; - lire wavelength octets d'une source vers une dest
; - appliquer le filtre sur une source/dest pour N octets
; - appliquer le volume pour une source/dest sur N octets
; - square generer 128 octets
; - noise generer 128 octets


; - si volume=0 => buffer tout à zéro, rapidement, double dest
; il faut remplir volume OK // wavelength en octets OK // décaleur en fonction de wavelength OK // filterpos // increment pour envoi à I2S OK // mask pour bouclage pour envoi à I2S OK

                                                               ; reutilisable ?
DSP_genere_wave__tmp0                           .equr    R0    ;-------------
DSP_genere_wave__tmp1                           .equr    R1    ;-------------
DSP_genere_wave__tmp2                           .equr    R2    ;-------------
DSP_genere_wave__tmp3                           .equr    R3    ;-------------
DSP_genere_wave__tmp4                           .equr    R4    ;-------------
DSP_genere_wave__tmp5                           .equr    R5    ;-------------
DSP_genere_wave__ratio_amiga_jaguar             .equr    R6    ;  si necessaire
DSP_genere_wave__wavelength_en_octets           .equr    R7    ;   NON
DSP_genere_wave__increment_pour_lire_les_octets .equr    R8    ;   NON
DSP_genere_wave__compteur_channels              .equr    R9    ;   NON

DSP_genere_wave__volume                         .equr    R10    ;   NON
DSP_genere_wave__wavelength                     .equr    R11    ;   NON

DSP_genere_wave__filterpos                      .equr    R13    ;   NON
DSP_genere_wave__source_datas_channel           .equr    R14    ;   NON
DSP_genere_wave__dest_record_I2S                .equr    R15    ;   NON
DSP_genere_wave__decaleur_wavelength            .equr    R16    ;   -OUI-
DSP_genere_wave__mask_pour_I2S                  .equr    R17    ;   NON
DSP_genere_wave__waveform                       .equr    R18    ;   NON
DSP_genere_wave__squarepos                      .equr    R19    ;   NON

DSP_genere_wave__routines_a_executer            .equr    R21    ;  si necessaire
DSP_genere_wave__tmp6                           .equr    R22    ;-------------
DSP_genere_wave__tmp7                           .equr    R23    ;-------------
DSP_genere_wave__wavelength_en_octets__pour_filtre .equr R24    ;   NON
DSP_genere_wave__tmp9                           .equr    R25    ;-------------
DSP_genere_wave__tmp8                           .equr    R26    ;-------------
DSP_genere_wave__boucle_sur_un_channel          .equr    R27    ;   NON
DSP_genere_wave__routine_volume_a_zero          .equr    R28    ;  si necessaire
AHX__main__pointeur_adresse_routine_etape_suivante .equr R29    ;   NON
DSP_genere_wave__increment_RM_pour_I2S          .equr    R30    ;   NON

 movei  #AHX_enregistrements_N_voies,DSP_genere_wave__dest_record_I2S
 movei  #HIVELY_datas_channels,DSP_genere_wave__source_datas_channel
 movei  #DSP_ratio_Amiga_Jaguar__a_virgule_9_bits,DSP_genere_wave__ratio_amiga_jaguar
 movei  #DSP_NB_channels,DSP_genere_wave__compteur_channels
 load   (DSP_genere_wave__compteur_channels),DSP_genere_wave__compteur_channels

 movei  #DSP_genere_wave_routine_volume_a_zero,DSP_genere_wave__routine_volume_a_zero
 load   (DSP_genere_wave__ratio_amiga_jaguar),DSP_genere_wave__ratio_amiga_jaguar
 movei  #AHX_table_routines_a_executer,DSP_genere_wave__routines_a_executer

 move   pc,DSP_genere_wave__boucle_sur_un_channel
DSP_genere_wave__boucle:
//-> load   (DSP_genere_wave__source_datas_channel+DSP_index_vc_AudioVolume),DSP_genere_wave__volume
 load   (DSP_genere_wave__source_datas_channel),DSP_genere_wave__volume
 load   (DSP_genere_wave__source_datas_channel+DSP_index_vc_Waveform),DSP_genere_wave__waveform
 cmpq   #0,DSP_genere_wave__volume
 jump   eq,(DSP_genere_wave__routine_volume_a_zero)
 load   (DSP_genere_wave__source_datas_channel+DSP_index_vc_SquarePos),DSP_genere_wave__squarepos
 ; = wavelength : 0 à 5 ( 2^(n+2) ) // $04/$08/$10/$20/$40/$80  0=$04, 1=$08, 2=$10, 3=$20, 4=$40, 5=$80
 load   (DSP_genere_wave__source_datas_channel+DSP_index_vc_WaveLength),DSP_genere_wave__wavelength
 load   (DSP_genere_wave__source_datas_channel+DSP_index_vc_FilterPos),DSP_genere_wave__filterpos
 move   DSP_genere_wave__wavelength,DSP_genere_wave__decaleur_wavelength

 load   (DSP_genere_wave__source_datas_channel+DSP_index_vc_AudioPeriod),DSP_genere_wave__tmp0 ;DSP_genere_wave__audioperiod
 subq   #5,DSP_genere_wave__decaleur_wavelength
 moveq  #1,DSP_genere_wave__increment_pour_lire_les_octets
 addq   #2,DSP_genere_wave__wavelength   ; wavelength + 2
 sh     DSP_genere_wave__decaleur_wavelength,DSP_genere_wave__increment_pour_lire_les_octets
 moveq  #1,DSP_genere_wave__wavelength_en_octets
 neg    DSP_genere_wave__wavelength

 move   DSP_genere_wave__ratio_amiga_jaguar,DSP_genere_wave__tmp6
 sh     DSP_genere_wave__wavelength,DSP_genere_wave__wavelength_en_octets
 div    DSP_genere_wave__tmp0,DSP_genere_wave__tmp6
 or	DSP_genere_wave__tmp6,DSP_genere_wave__tmp6
 move   DSP_genere_wave__waveform,DSP_genere_wave__tmp0

 store  DSP_genere_wave__tmp6,(DSP_genere_wave__dest_record_I2S+index_AHX_enregistrements_N_voies__I2S_increment)
 movei  #buffer_temp_wave,DSP_genere_wave__tmp6                    ;dest pour triangle et sawtooth, variaiblisé pour gérer le RM
 shlq   #2,DSP_genere_wave__tmp0    ; waveform * 4
 move   DSP_genere_wave__wavelength_en_octets,DSP_genere_wave__mask_pour_I2S
 add    DSP_genere_wave__routines_a_executer,DSP_genere_wave__tmp0      ; choix de la routine suivant waveform
 movei  #AHX__main__routine__filtre,AHX__main__pointeur_adresse_routine_etape_suivante
 load   (DSP_genere_wave__tmp0),DSP_genere_wave__tmp0
 subq   #1,DSP_genere_wave__mask_pour_I2S    ; mask pour I2S
 jump   (DSP_genere_wave__tmp0)
 shlq   #AHX_nb_bits_virgule_increment_period,DSP_genere_wave__mask_pour_I2S   ; avec virgule
AHX__main__adresse_retour_vers_main_suivant_voie:
; gestion de Ring Modulation
 load   (DSP_genere_wave__source_datas_channel+DSP_index_vc_RingAudioPeriod),DSP_genere_wave__increment_RM_pour_I2S
 move   DSP_genere_wave__ratio_amiga_jaguar,DSP_genere_wave__tmp0
 cmpq   #0,DSP_genere_wave__increment_RM_pour_I2S
 load   (DSP_genere_wave__dest_record_I2S+index_AHX_enregistrements_N_voies__I2S_buffer__RM),DSP_genere_wave__tmp6    ; buffer dest = buffer RM
 jr     eq,DSP_genere_wave__boucle__apres_RM
 div    DSP_genere_wave__increment_RM_pour_I2S,DSP_genere_wave__tmp0
; buffer dans DSP_genere_wave__tmp6
 load   (DSP_genere_wave__source_datas_channel+DSP_index_vc_RingWaveform),DSP_genere_wave__tmp1
 shlq   #2,DSP_genere_wave__tmp1    ; RM waveform * 4

 ; choix de la routine suivant waveform pour RM : 0 ou 1
 add    DSP_genere_wave__routines_a_executer,DSP_genere_wave__tmp1

 load   (DSP_genere_wave__tmp1),DSP_genere_wave__tmp1
 move   DSP_genere_wave__tmp0,DSP_genere_wave__increment_RM_pour_I2S
 move   pc,AHX__main__pointeur_adresse_routine_etape_suivante
 jump   (DSP_genere_wave__tmp1)
 addq   #6,AHX__main__pointeur_adresse_routine_etape_suivante

DSP_genere_wave__boucle__apres_RM:
 store  DSP_genere_wave__increment_RM_pour_I2S,(DSP_genere_wave__dest_record_I2S+index_AHX_enregistrements_N_voies__I2S_increment__RM)
 store  DSP_genere_wave__mask_pour_I2S,(DSP_genere_wave__dest_record_I2S+index_AHX_enregistrements_N_voies__I2S_mask_bouclage)

DSP_genere_wave__boucle_recolle1:
; avancer les 2 pointeurs
; décompter le nb de channels
 moveq  #DSP_index_vc__total,DSP_genere_wave__tmp0
 shlq   #2,DSP_genere_wave__tmp0
 moveq  #AHX_enregistrements_N_voies__I2S_taille_totale,DSP_genere_wave__tmp1
 shlq   #2,DSP_genere_wave__tmp1
 add    DSP_genere_wave__tmp0,DSP_genere_wave__source_datas_channel
 subq   #1,DSP_genere_wave__compteur_channels
 jump   ne,(DSP_genere_wave__boucle_sur_un_channel)
 add    DSP_genere_wave__tmp1,DSP_genere_wave__dest_record_I2S

pause_music:
 if READ_PAD = 1
;-------------------------------------------------------------------------------
;         Gestion du PAD
;-------------------------------------------------------------------------------
;DSP_pad1
;DSP_pad2
; lecture des 2 pads
; Pads : mask = xxxx xxCx xxBx 2580 147* oxAP 369# RLDU
; dispos : R0 à R11/r14
 movei  #DSP_pad1,R14
 movei  #JOYSTICK,R0

 movei  #%00001111000000000000000000000000,R2  ; mask port 1
 movei  #%00000000000000000000000000000011,R3  ; mask port 1

 movei  #%11110000000000000000000000000000,R5  ; mask port 2
 movei  #%00000000000000000000000000001100,R6  ; mask port 2

; row 0
 MOVEI  #$817e,R1   ; =81<<8 + 0111 1110 = (A Pause) + (Right Left Down Up) / 81 pour bit 15 pour output + bit 8 pour  conserver le son ON : pad 1 & 2
         ; 1110 = row 0 of joypad = Pause A Up Down Left Right
 storew R1,(R0)    ; lecture row 0
 nop
 load   (R0),R1
 ;movei  #$F000000C,R3  ; mask port 2

; row0 = Pause A Up Down Left Right
; 0000 1111 0000 0000 0000 0000 0000 0011
;      RLDU                            Ap
 move   R1,R10    ; stocke pour lecture port 2

 move   R1,R4
 move   R10,R7
 and    R3,R4
 and    R6,R7
 and    R2,R1
 and    R5,R10
 shlq   #8,R4    ; R4=Ap xxxx xxxx
 shlq   #6,R7    ; R4=Ap xxxx xxxx
 shrq   #24,R1    ; R1=RLDU
 shrq   #28,R10    ; R10=RLDU
 or     R4,R1
 or     R7,R10
 move   R1,R8
 move   R10,R9

; row 1
 MOVEI  #$81BD,R1   ; #($81 << 8)|(%1011 << 4)|(%1101),(a2) ; (B D) + (1 4 7 *)
 storew R1,(R0)    ; lecture row 1
 nop
 load   (R0),R1
; row1 =
; 0000 1111 0000 0000 0000 0000 0000 0011
;      147*                            BD
 move   R1,R10    ; stocke pour lecture port 2
;row1 port 1&2

 move   R1,R4
 move   R10,R7
 and    R3,R4
 and    R6,R7
 shlq   #20,R4
 shlq   #18,R7
 and    R2,R1
 and    R5,R10
 shrq   #12,R1    ; R1=147*
 shrq   #16,R10    ; R10=147*
 or     R1,R4
 or     R7,R10
 or     R4,R8    ; R8= BD xxxx 147* xxAp xxxx RLDU
 or     R10,R9

; row 2
 MOVEI  #$81DB,R1   ; #($81 << 8)|(%1101 << 4)|(%1011),(a2) ; (C E) + (2 5 8 0)
 storew R1,(R0)    ; lecture row 2
 nop
 load   (R0),R1
 move   R1,R10    ; stocke pour lecture port 2

; row2 =
; 0000 1111 0000 0000 0000 0000 0000 0011
;      2580                            CE
; 24,8,22,12
 move   R1,R4
 move   R10,R7
 and    R3,R4
 and    R6,R7
 shlq   #24,R4
 shlq   #22,R7
 and    R2,R1
 and    R5,R10
 shrq   #8,R1    ; R1=147*
 shrq   #12,R10    ; R10=147*
 or     R1,R4
 or     R7,R10
 or     R4,R8    ; R8= BD xxxx 147* xxAp xxxx RLDU
 or     R10,R9

; row 3
 MOVEI  #$81E7,R1 ; #($81 << 8)|(%1110 << 4)|(%0111),(a2);(Option F) + (3 6 9 #)
 storew R1,(R0)    ; lecture row 3
 nop
 load  (R0),R1
; row3 =
; 0000 1111 0000 0000 0000 0000 0000 0011
;      369#                            oF
; l10,r20,l8,r24
 move   R1,R10    ; stocke pour lecture port 2

 move   R1,R4
 move   R10,R7
 and    R3,R4
 and    R6,R7
 shlq   #10,R4
 shlq   #8,R7
 and    R2,R1
 and    R5,R10
 shrq   #20,R1    ; R1=147*
 shrq   #24,R10    ; R10=147*
 or     R1,R4
 or     R7,R10
 or     R4,R8    ; R8= BD xxxx 147* xxAp xxxx RLDU
 or     R10,R9

 movei	#~$fcc00000,r0
 not    R8
 not    R9
 and	r0,r8
 and	r0,r9
 store  R8,(R14)
 store  R9,(R14+4/4)
;-------------------------------------------------------------------------------
;         FIN - Gestion du PAD
;-------------------------------------------------------------------------------
 .endif
;-------------------------------------------------------------------------------
; change la couleur de fond - debug
 .if  DISPLAY_TIME = 1
 moveq  #0,r0
 moveq  #$f,r14
 shlq   #20,r14
 store r0,(r14+$58/4)
 .endif
; ------------------------------
; retour boucle principale
; bouclage final

 movei  #DSP_boucle_centrale,R0
 jump   (R0)
 moveq  #3,R21

; sortie finale, extinction du DSP
DSP_sortie_finale:
; R0 = DSP_flag_replay_ON_OFF

__pc:
 move pc,r1
 addq #DSP_AHX_routine_interruption_I2S_shutdown_now__real_shutdown-__pc,r1
 moveta R1,I2S_routine_actuelle
DSP_sortie_finale__wait_for_timer1:
 load   (R0),R1
 cmpq   #3,R1
 jr     ne,DSP_sortie_finale__wait_for_timer1
 moveq  #4,R2

 store  r2,(r0)
 movei  #D_CTRL,R0
 moveq  #0,R1
.wait:
 jr     .wait
 store  R1,(R0)

DSP_AHX_routine_interruption_I2S_shutdown_now__real_shutdown:
 movei  #DSP_flag_replay_ON_OFF,I2S_tmp_3
 moveq  #2,I2S_tmp_2
 bclr   #3,I2S_save_flags       ; clear IMASK
 store  I2S_tmp_2,(I2S_tmp_3)   ; ask timer 1 to stop = 2
 bset   #10,I2S_save_flags      ; clear latch 1 = I2S
 load   (r31),I2S_tmp_1         ; return address
 bclr   #5,I2S_save_flags       ; clear I2S enabled => stop I2S
 addqt  #2,I2S_tmp_1            ; next instruction
 addqt  #4,r31                  ; pop from stack
 jump   (I2S_tmp_1)             ; return
 store  I2S_save_flags,(R30)    ; restore flags

;-------------------------------------------------------------------------------
;
;
; subroutines de remplissage des buffers
;
;
;-------------------------------------------------------------------------------

; ----------------
; triangle
; genere triangle dans buffer_temp_wave
;;; // execute AHX__main__routine__filtre
;;; // execute AHX__main__routine__volume
;;; // puis saute à AHX__main__adresse_retour_vers_main_suivant_voie

AHX_DSP_remplissage_buffer_triangle:
; 3 boucles
 move   DSP_genere_wave__increment_pour_lire_les_octets,DSP_genere_wave__tmp1
 move   DSP_genere_wave__wavelength_en_octets,DSP_genere_wave__tmp2
 shlq   #2,DSP_genere_wave__tmp1
 sharq  #1,DSP_genere_wave__tmp2
 move   DSP_genere_wave__tmp2,DSP_genere_wave__tmp3     ; R3 = compteur boucle 2
 moveq  #0,DSP_genere_wave__tmp5
 sharq  #1,DSP_genere_wave__tmp2                        ; R2 = compteur boucle 1
 movei  #127,DSP_genere_wave__tmp7
 move   DSP_genere_wave__tmp2,DSP_genere_wave__tmp4     ; R4 = compteur boucle 3

; boucle 1 : +4 par etape
AHX_DSP_remplissage_buffer_triangle__boucle1:
 store  DSP_genere_wave__tmp5,(DSP_genere_wave__tmp6)
 subq   #1,DSP_genere_wave__tmp2
 addqt  #4,DSP_genere_wave__tmp6
 jr     ne,AHX_DSP_remplissage_buffer_triangle__boucle1
 add    DSP_genere_wave__tmp1,DSP_genere_wave__tmp5

; boucle 2
AHX_DSP_remplissage_buffer_triangle__boucle2:
 cmp    DSP_genere_wave__tmp7,DSP_genere_wave__tmp5
 move   DSP_genere_wave__tmp5,DSP_genere_wave__tmp2
 jr     mi,AHX_DSP_remplissage_buffer_triangle__boucle2__test80
 subq   #1,DSP_genere_wave__tmp3
 move   DSP_genere_wave__tmp7,DSP_genere_wave__tmp2

AHX_DSP_remplissage_buffer_triangle__boucle2__test80:
 store  DSP_genere_wave__tmp2,(DSP_genere_wave__tmp6)

//-> subq    #1,DSP_genere_wave__tmp3   ; done above
 addqt  #4,DSP_genere_wave__tmp6
 jr     ne,AHX_DSP_remplissage_buffer_triangle__boucle2
 sub    DSP_genere_wave__tmp1,DSP_genere_wave__tmp5

; boucle 3
AHX_DSP_remplissage_buffer_triangle__boucle3:
 store  DSP_genere_wave__tmp5,(DSP_genere_wave__tmp6)
 subq   #1,DSP_genere_wave__tmp4
 addqt  #4,DSP_genere_wave__tmp6
 jr     ne,AHX_DSP_remplissage_buffer_triangle__boucle3
 add    DSP_genere_wave__tmp1,DSP_genere_wave__tmp5

 move   AHX__main__pointeur_adresse_routine_etape_suivante,DSP_genere_wave__tmp1
 movei  #AHX__main__routine__volume,AHX__main__pointeur_adresse_routine_etape_suivante
 jump   (DSP_genere_wave__tmp1)
 move   DSP_genere_wave__wavelength_en_octets,DSP_genere_wave__wavelength_en_octets__pour_filtre

; ----------------
; sawtooth
AHX_DSP_remplissage_buffer_sawtooth:
; genere sawtooth dans buffer_temp_wave
;;;  // execute AHX__main__routine__filtre
;;;  // execute AHX__main__routine__volume
;;; // puis saute à AHX__main__adresse_retour_vers_main_suivant_voie

; increment = AHX__main__increment_pour_lire_les_octets
 move   DSP_genere_wave__increment_pour_lire_les_octets,DSP_genere_wave__tmp1
 movei  #$FFFFFF80,DSP_genere_wave__tmp2
 add    DSP_genere_wave__tmp1,DSP_genere_wave__tmp1   ; +2 par étape
 move   DSP_genere_wave__wavelength_en_octets,DSP_genere_wave__tmp4

AHX_DSP_remplissage_buffer_sawtooth__generation_et_selection:
 store  DSP_genere_wave__tmp2,(DSP_genere_wave__tmp6)
 subq   #1,DSP_genere_wave__tmp4
 addqt  #4,DSP_genere_wave__tmp6
 jr     ne,AHX_DSP_remplissage_buffer_sawtooth__generation_et_selection
 add    DSP_genere_wave__tmp1,DSP_genere_wave__tmp2

 move   AHX__main__pointeur_adresse_routine_etape_suivante,DSP_genere_wave__tmp1
 movei  #AHX__main__routine__volume,AHX__main__pointeur_adresse_routine_etape_suivante
 jump   (DSP_genere_wave__tmp1)
 move   DSP_genere_wave__wavelength_en_octets,DSP_genere_wave__wavelength_en_octets__pour_filtre

; ----------------
; square
; square : generer 128 octets square / apppliquer le filtre / lire N octets
; ( wavelength) (suivante) / appliquer le volume (+1) // retour (+2)
; genere 128 octets de square

AHX_DSP_remplissage_buffer_square:
 ;movei  #pvt_squarePos,DSP_genere_wave__tmp1
 moveq  #0,DSP_genere_wave__wavelength_en_octets__pour_filtre
 moveq  #0,DSP_genere_wave__tmp3
 bset   #7,DSP_genere_wave__wavelength_en_octets__pour_filtre
 bset   #5,DSP_genere_wave__tmp3
 move   DSP_genere_wave__wavelength_en_octets__pour_filtre,DSP_genere_wave__tmp5

; relatif a wavelength
   ; R19 = -(5-wavelength) // R0 = squarepos
 sh     DSP_genere_wave__decaleur_wavelength,DSP_genere_wave__squarepos

; 32-(abs(position-32)) -1   : de 0 a 31
 subq   #32,DSP_genere_wave__squarepos
 movei  #buffer_temp_wave,DSP_genere_wave__tmp1    ; buffer dest 1
 abs    DSP_genere_wave__squarepos
 move   DSP_genere_wave__tmp1,DSP_genere_wave__tmp4
 moveq  #0,DSP_genere_wave__tmp6
 sub    DSP_genere_wave__squarepos,DSP_genere_wave__tmp3
 bset   #7,DSP_genere_wave__tmp6
 move   DSP_genere_wave__tmp6,DSP_genere_wave__tmp2
 subq   #1,DSP_genere_wave__tmp3                     ; = 0..31
 subqt  #2,DSP_genere_wave__tmp2                     ; 126
 jr     pl,.ok_positif_ou_zero
 neg    DSP_genere_wave__tmp6                        ; -128
 moveq  #0,DSP_genere_wave__tmp3

.ok_positif_ou_zero:
 move  DSP_genere_wave__tmp3,DSP_genere_wave__squarepos

; 0 : 126*-128//2*127
; 1 : 124*-128//4*127
; 31 : 64*-128//64*127
; nb -128 = 126-(2*nb) = R12
; nb 127 = 128 - (nb de 128) = R14

; compteur initial = -126 a -64
 add    DSP_genere_wave__tmp3,DSP_genere_wave__tmp3   ; * 2
 addqt  #4,DSP_genere_wave__tmp4   ; 2eme buffer = +4
 sub    DSP_genere_wave__tmp3,DSP_genere_wave__tmp2   ; 126-(2* [0..31] ) : 126 à 64
 sub    DSP_genere_wave__tmp2,DSP_genere_wave__tmp5

AHX_DSP_remplissage_buffer_square__boucle_moins_128:
 store  DSP_genere_wave__tmp6,(DSP_genere_wave__tmp1)
 store  DSP_genere_wave__tmp6,(DSP_genere_wave__tmp4)
 subq   #2,DSP_genere_wave__tmp2
 addqt  #8,DSP_genere_wave__tmp1
 jr     ne,AHX_DSP_remplissage_buffer_square__boucle_moins_128
 addqt  #8,DSP_genere_wave__tmp4

 not    DSP_genere_wave__tmp6     ; tmp6 = 127

AHX_DSP_remplissage_buffer_square__boucle_plus_127:
 store  DSP_genere_wave__tmp6,(DSP_genere_wave__tmp1)
 store  DSP_genere_wave__tmp6,(DSP_genere_wave__tmp4)
 subq   #2,DSP_genere_wave__tmp5
 addqt  #8,DSP_genere_wave__tmp1
 jr     ne,AHX_DSP_remplissage_buffer_square__boucle_plus_127
 addqt  #8,DSP_genere_wave__tmp4

; saut au filtre
 movei  #AHX__main__routine__filtre,DSP_genere_wave__tmp1
 movei  #AHX__main__routine__lire_N_octets,AHX__main__pointeur_adresse_routine_etape_suivante
 jump   (DSP_genere_wave__tmp1)
 move   DSP_genere_wave__wavelength_en_octets,DSP_genere_wave__wavelength_en_octets__pour_filtre

 ; ----------------
; noise
AHX_DSP_remplissage_buffer_noise:
; noise : generer 128 octets noise / apppliquer le filtre  / appliquer le volume (suivante) // retour (+1)
 moveq  #0,DSP_genere_wave__wavelength_en_octets
 bset   #7,DSP_genere_wave__wavelength_en_octets

 movei  #(($80-1)<<AHX_nb_bits_virgule_increment_period),DSP_genere_wave__mask_pour_I2S    ; force le mask en accord avec le nb d'octets
 movei  #buffer_temp_wave,DSP_genere_wave__tmp9
 movei  #AHX_DSP_Seed_Noise,DSP_genere_wave__tmp6
 move   DSP_genere_wave__wavelength_en_octets,DSP_genere_wave__tmp4
 moveq  #%00011010,DSP_genere_wave__tmp7
 bset   #7,DSP_genere_wave__tmp7                        ; %10011010
 load   (DSP_genere_wave__tmp6),DSP_genere_wave__tmp3     ; R3 = current seed
 move   DSP_genere_wave__wavelength_en_octets,DSP_genere_wave__tmp0
 subq   #1,DSP_genere_wave__tmp0 ; $7f
 move   DSP_genere_wave__tmp0,DSP_genere_wave__tmp8
 not    DSP_genere_wave__tmp8   ; $FFFFFF80
 move   DSP_genere_wave__wavelength_en_octets,DSP_genere_wave__wavelength_en_octets__pour_filtre   ; =128

 move   pc,DSP_genere_wave__tmp2
AHX_DSP_remplissage_buffer_noise__boucle:
; R0/R1/R2/R3/R4/R5/R6/R7/R8/R9/R10
 btst   #8,DSP_genere_wave__tmp3
 move   DSP_genere_wave__tmp3,DSP_genere_wave__tmp5
 jr     eq,AHX_routine_Main_noise__lower
 btst   #15,DSP_genere_wave__tmp3
 jr     ne,AHX_routine_Main_noise__weida
 move   DSP_genere_wave__tmp8,DSP_genere_wave__tmp5     ; = -128

 jr     AHX_routine_Main_noise__weida
 move   DSP_genere_wave__tmp0,DSP_genere_wave__tmp5     ; R0=$7F

AHX_routine_Main_noise__lower:
 shlq   #24,DSP_genere_wave__tmp5
 sharq  #24,DSP_genere_wave__tmp5    ; R5 reste signé, sur 8 bits
AHX_routine_Main_noise__weida:
 rorq   #5,DSP_genere_wave__tmp3
 xor    DSP_genere_wave__tmp7,DSP_genere_wave__tmp3
 store  DSP_genere_wave__tmp5,(DSP_genere_wave__tmp9)
 move   DSP_genere_wave__tmp3,DSP_genere_wave__tmp1
 rorq   #32-2,DSP_genere_wave__tmp3
//->  and   DSP_genere_wave__tmp6,DSP_genere_wave__tmp1 ; & $0000ffff, not needed
 addqt  #4,DSP_genere_wave__tmp9
 add    DSP_genere_wave__tmp3,DSP_genere_wave__tmp1
 shlq   #16,DSP_genere_wave__tmp1
 shrq   #16,DSP_genere_wave__tmp1 ; & $ffff
 xor    DSP_genere_wave__tmp1,DSP_genere_wave__tmp3
 subq   #1,DSP_genere_wave__tmp4
 jump   ne,(DSP_genere_wave__tmp2)
 rorq   #3,DSP_genere_wave__tmp3

//-> movei  #AHX__main__routine__filtre,DSP_genere_wave__tmp0    ; etape suivante apres noise => filtre
 movei  #AHX__main__routine__volume,AHX__main__pointeur_adresse_routine_etape_suivante
//-> jump   (DSP_genere_wave__tmp0)
 store  DSP_genere_wave__tmp3,(DSP_genere_wave__tmp6)    ; stocke le seed modifié
; ----------------
AHX__main__routine__filtre:
; appliquer le filtre de dest sur dest
 ; tester si filterpos = 32 ?
 ; filterpos de 1 a 31 / 32 / 33 a 63 : 1 a 63 : si on fait -32 : de -31 a -1 / 0 / 1 a 31    // AND $1F : -1 and 31=1 / -30 => 2 / 0 / 1 a 31
 ; OK calculer freq = 25 + ( 9 * filterpos )
 ; calculer position de low dans binPrecalcTable
 ; lire mid et low
 ; sur AHX__main__wavelength_en_octets__pour_filtre octets

;reg__AHX_filter__filterpos          .equr  R0    ; OK
reg__AHX_filter__filterpos_and_1F .equr  R1    ; OK
reg__AHX_filter__source_low       .equr  R3    ; OK
; double volontaire
reg__AHX_filter__R3               .equr  R3    ; OK
reg__AHX_filter__source_mid       .equr  R4    ; OK

reg__AHX_filter__R5               .equr  R5    ; OK
reg__AHX_filter__R22              .equr  R22   ; OK
reg__AHX_filter__R23              .equr  R23   ; OK
reg__AHX_filter__R30              .equr  R30   ; OK
reg__AHX_filter__R31              .equr  R31   ; OK
reg__AHX_filter__freq             .equr  R16   ; OK

AHX__main__filtre_in              .equr  R1    ; OK
AHX__main__filtre_high            .equr  R2    ; OK
AHX__main__filtre_fre             .equr  R5    ; OK
AHX__main__filtre_low             .equr  R25   ; OK
AHX__main__filtre_mid             .equr  R26   ; OK


;   remplacer R8 et R9 et R16

; relit :
;   - pvt_filterPos    R13
;   - pvt_Waveform    R18
;   - pvt_Wavelength   R11
;   -

 ; = wavelength : 0 à 5 ( 2^(n+2) ) // $04/$08/$10/$20/$40/$80  0=$04, 1=$08, 2=$10, 3=$20, 4=$40, 5=$80
 subq   #32,DSP_genere_wave__filterpos
 load   (DSP_genere_wave__source_datas_channel+DSP_index_vc_WaveLength),DSP_genere_wave__wavelength
 jump   eq,(AHX__main__pointeur_adresse_routine_etape_suivante) ; no filter
 moveq  #31,reg__AHX_filter__filterpos_and_1F

; il y a un filtre
 and    DSP_genere_wave__filterpos,reg__AHX_filter__filterpos_and_1F   ; filterpos & $1F : 1 a 31
 movei  #DSP_filterPreCalcTable,reg__AHX_filter__source_low
 load   (reg__AHX_filter__source_low),reg__AHX_filter__source_low
 subq   #1,reg__AHX_filter__filterpos_and_1F          ; filterpos : 0 a 30
 moveq  #(45*2)/9,reg__AHX_filter__R5
 movei  #((31*(6+6+$20+1))*2),reg__AHX_filter__source_mid
 move   reg__AHX_filter__filterpos_and_1F,reg__AHX_filter__R22

 moveq  #9,reg__AHX_filter__freq
 mult   reg__AHX_filter__freq,reg__AHX_filter__R5
 mult   reg__AHX_filter__R5,reg__AHX_filter__R22           ; R6 = filterpos ( 0 a 30) * 45
 mult   reg__AHX_filter__filterpos_and_1F,reg__AHX_filter__freq   ; freq = filterpos * 9
 add    reg__AHX_filter__R22,reg__AHX_filter__source_low
 addq   #25,reg__AHX_filter__freq     ; freq = 25+(9*filterpos)

 ; tester pvt_Waveform
 ; 0=triangle / 1=sawtooth / 2=square / 3=noise
 ; si = 0 : + pvt_Wavelength*2
 ; si = 1 : + (6*2) + pvt_Wavelength*2
 ; si = 2 : + (6*2)*2 + pvt_squarePos mais ramené à : 0 à 31 = R18
 ; si = 3 : + (6+6+$20)*2

 cmpq   #1,DSP_genere_wave__waveform
 move   DSP_genere_wave__waveform,reg__AHX_filter__R22
 jr     hi,AHX_DSP_remplissage_buffer_filter__pas_triangle_ni_sawtooth
 cmpq   #3,reg__AHX_filter__R22

; triangle ou sawtooth
 ;movei  #pvt_Wavelength,reg__AHX_filter__R5
 ;add   AHX__main__pointeur_sur_enregistrement_voice,reg__AHX_filter__R5
 ;loadb  (reg__AHX_filter__R5),reg__AHX_filter__R23
 move   DSP_genere_wave__wavelength,reg__AHX_filter__R23
 add    reg__AHX_filter__R23,reg__AHX_filter__R23        ; wavelength*2
 cmpq   #0,reg__AHX_filter__R22
 jr	eq,AHX_DSP_remplissage_buffer_filter__calcul_filtre
 add    reg__AHX_filter__R23,reg__AHX_filter__source_low   ; source low OK

; sawtooth : + (6*2) + pvt_Wavelength*2
 jr	AHX_DSP_remplissage_buffer_filter__calcul_filtre
 addqt  #(6*2),reg__AHX_filter__source_low

AHX_DSP_remplissage_buffer_filter__pas_triangle_ni_sawtooth:
; square ou noise
;;->  cmpq  #3,reg__AHX_filter__R22 ; done above
 jr     ne,AHX_DSP_remplissage_buffer_filter__square
; noise : 45*(filterpos-1)+     (6+6+$20)*2
 moveq  #((6+6+$20)*2)/4,reg__AHX_filter__R5
 shlq   #2,reg__AHX_filter__R5

 jr	AHX_DSP_remplissage_buffer_filter__calcul_filtre
 add    reg__AHX_filter__R5,reg__AHX_filter__source_low

AHX_DSP_remplissage_buffer_filter__square:
; noise : + (6*2)*2 + pvt_squarePos mais ramené à : 0 à 31 = R18
 add    DSP_genere_wave__squarepos,DSP_genere_wave__squarepos   ; * 2 pour .word
 addq   #((6*2)*2),reg__AHX_filter__source_low
 add    DSP_genere_wave__squarepos,reg__AHX_filter__source_low

AHX_DSP_remplissage_buffer_filter__calcul_filtre:
 add    reg__AHX_filter__source_low,reg__AHX_filter__source_mid

; mid and low sources are reversed
 loadw  (reg__AHX_filter__source_low),AHX__main__filtre_mid
 movei  #$FF800000,reg__AHX_filter__R22
 loadw  (reg__AHX_filter__source_mid),AHX__main__filtre_low
 movei  #$007F0000,reg__AHX_filter__R23
 shlq   #16,AHX__main__filtre_low
 shlq   #16,AHX__main__filtre_mid
 sharq  #8,AHX__main__filtre_low
 sharq  #8,AHX__main__filtre_mid   ; ext.l + asl.l #8
 movei  #buffer_temp_wave,reg__AHX_filter__R30

 move   pc,reg__AHX_filter__R31
;----------- boucle ------------
AHX__main__routine__filtre__boucle_calcul_filtre:
 load   (reg__AHX_filter__R30),AHX__main__filtre_in  ; valeur sur 8 bits signée
 moveq  #0,AHX__main__filtre_high
 sub    AHX__main__filtre_mid,AHX__main__filtre_high
 shlq   #24,AHX__main__filtre_in
 sub    AHX__main__filtre_low,AHX__main__filtre_high
 sharq  #8,AHX__main__filtre_in      ; 32 bits signée << 16
 add    AHX__main__filtre_in,AHX__main__filtre_high

; clipper  AHX__main__filtre_high entre $FF80 et $007F
 cmp    reg__AHX_filter__R22,AHX__main__filtre_high
 jr     pl,AHX__main__routine__filtre__high__superieur_au_minimum
 cmp    reg__AHX_filter__R23,AHX__main__filtre_high
 move   reg__AHX_filter__R22,AHX__main__filtre_high
;;;  if high < minimum then not > maximum
AHX__main__routine__filtre__high__superieur_au_minimum:
 jr     mi,AHX__main__routine__filtre__high__inferieur_au_maximum
 nop
 move   reg__AHX_filter__R23,AHX__main__filtre_high

AHX__main__routine__filtre__high__inferieur_au_maximum:
; fre  = (high >> 8) * freq;
 move   AHX__main__filtre_high,AHX__main__filtre_fre
 sharq  #8,AHX__main__filtre_fre
 imult  reg__AHX_filter__freq,AHX__main__filtre_fre

; mid = mid + fre
 add    AHX__main__filtre_fre,AHX__main__filtre_mid
; clipper  AHX__main__filtre_mid entre $FF80 et $007F
 cmp    reg__AHX_filter__R22,AHX__main__filtre_mid
 jr     pl,AHX__main__routine__filtre__mid__superieur_au_minimum
 cmp    reg__AHX_filter__R23,AHX__main__filtre_mid
 move   reg__AHX_filter__R22,AHX__main__filtre_mid
;;;  if mid < minimum then not > maximum
AHX__main__routine__filtre__mid__superieur_au_minimum:
 jr     mi,AHX__main__routine__filtre__mid__inferieur_au_maximum
 nop
 move   reg__AHX_filter__R23,AHX__main__filtre_mid
AHX__main__routine__filtre__mid__inferieur_au_maximum:

; fre  = (mid  >> 8) * freq;
 move   AHX__main__filtre_mid,AHX__main__filtre_fre
 sharq  #8,AHX__main__filtre_fre
 imult  reg__AHX_filter__freq,AHX__main__filtre_fre

; low = low + fre
 add    AHX__main__filtre_fre,AHX__main__filtre_low

; clipper  AHX__main__filtre_low entre $FF80 et $007F
 cmp    reg__AHX_filter__R22,AHX__main__filtre_low
 jr     pl,AHX__main__routine__filtre__low__superieur_au_minimum
 cmp    reg__AHX_filter__R23,AHX__main__filtre_low
 move   reg__AHX_filter__R22,AHX__main__filtre_low
;;;  if low < minimum then not > maximum
AHX__main__routine__filtre__low__superieur_au_minimum:
 jr     mi,AHX__main__routine__filtre__low__inferieur_au_maximum
; choisis si on met low ou high en fonction de filterpos
 cmpq   #0,DSP_genere_wave__filterpos
//-> nop
 move   reg__AHX_filter__R23,AHX__main__filtre_low
AHX__main__routine__filtre__low__inferieur_au_maximum:

//->; choisis si on met low ou high en fonction de filterpos
//-> cmpq   #0,DSP_genere_wave__filterpos
 move   AHX__main__filtre_high,reg__AHX_filter__R3 ;; store high
 jr     pl,AHX__main__routine__filtre__store_done
 nop
; filterpos negatif : store low
 move   AHX__main__filtre_low,reg__AHX_filter__R3
AHX__main__routine__filtre__store_done:
 sharq  #16,reg__AHX_filter__R3
 subq   #1,DSP_genere_wave__wavelength_en_octets__pour_filtre
 store  reg__AHX_filter__R3,(reg__AHX_filter__R30)
 jump   ne,(reg__AHX_filter__R31)
 addqt  #4,reg__AHX_filter__R30

; sortie
 jump   (AHX__main__pointeur_adresse_routine_etape_suivante)
 nop

; ----------------
AHX__main__routine__lire_N_octets:
; dispo : DSP_genere_wave__tmp0
; dispo : DSP_genere_wave__tmp4
; dispo : DSP_genere_wave__tmp7
; lire  AHX__main__wavelength_en_octets octets
;   increment entre les octets = AHX__main__increment_pour_lire_les_octets
;   source = AHX__main__source_des_samples
;   dest = AHX__main__buffer_dest_des_samples
; saut en AHX__main__pointeur_adresse_routine_etape_2 à la fin
 movei  #buffer_temp_wave,DSP_genere_wave__tmp1
 move   DSP_genere_wave__increment_pour_lire_les_octets,DSP_genere_wave__tmp6
 move   DSP_genere_wave__tmp1,DSP_genere_wave__tmp2
 move   DSP_genere_wave__wavelength_en_octets,DSP_genere_wave__tmp5
 shlq   #2,DSP_genere_wave__tmp6    ; ecart entre les octets * 4
AHX__main__routine__lire_N_octets__boucle:
 load   (DSP_genere_wave__tmp1),DSP_genere_wave__tmp3
 add    DSP_genere_wave__tmp6,DSP_genere_wave__tmp1
 subq   #1,DSP_genere_wave__tmp5
 store  DSP_genere_wave__tmp3,(DSP_genere_wave__tmp2)
 jr     ne,AHX__main__routine__lire_N_octets__boucle
 addqt  #4,DSP_genere_wave__tmp2

; forcement volume juste après
 ;movei #AHX__main__routine__volume,DSP_genere_wave__tmp1
 ;move  AHX__main__pointeur_adresse_routine_etape_suivante_plus_1,AHX__main__pointeur_adresse_routine_etape_suivante
 ;move  AHX__main__pointeur_adresse_routine_etape_suivante_plus_2,AHX__main__pointeur_adresse_routine_etape_suivante_plus_1
 ;jump  (DSP_genere_wave__tmp1)
 ;nop
; ----------------
AHX__main__routine__volume:
; appliquer le volume de dest sur dest // AHX__main__wavelength_en_octets
 movei  #buffer_temp_wave,DSP_genere_wave__tmp1
 move   DSP_genere_wave__wavelength_en_octets,DSP_genere_wave__tmp8
 move   DSP_genere_wave__volume,DSP_genere_wave__tmp0
 load   (DSP_genere_wave__dest_record_I2S+index_AHX_enregistrements_N_voies__I2S_buffer),DSP_genere_wave__tmp5
 move   DSP_genere_wave__tmp1,DSP_genere_wave__tmp2
 movei  #$FFFF,DSP_genere_wave__tmp9
 addq   #4,DSP_genere_wave__tmp2

AHX__main__routine__volume__boucle:
 load   (DSP_genere_wave__tmp1),DSP_genere_wave__tmp3     ; octet 1
 load   (DSP_genere_wave__tmp2),DSP_genere_wave__tmp4     ; octet 2
 imult  DSP_genere_wave__volume,DSP_genere_wave__tmp3     ; * volume
 imult  DSP_genere_wave__tmp0,DSP_genere_wave__tmp4

; passage en 2 fois 16 bits
 and   DSP_genere_wave__tmp9,DSP_genere_wave__tmp3   ; limite aux 16 bits du bas octet 1
 shlq   #16,DSP_genere_wave__tmp4                    ; octet 2 en haut
 addq   #8,DSP_genere_wave__tmp1
 or     DSP_genere_wave__tmp4,DSP_genere_wave__tmp3
;--
 subq   #2,DSP_genere_wave__tmp8
 store  DSP_genere_wave__tmp3,(DSP_genere_wave__tmp5)
 addqt  #8,DSP_genere_wave__tmp2
 jr     ne,AHX__main__routine__volume__boucle
 addqt  #4,DSP_genere_wave__tmp5

 movei  #AHX__main__adresse_retour_vers_main_suivant_voie,DSP_genere_wave__tmp0
 jump   (DSP_genere_wave__tmp0)
 nop

;--------------- subroutine -----------------
; le volume est à zéro il faut remplir avec des 0 tout le buffer
DSP_genere_wave_routine_volume_a_zero:
 load   (DSP_genere_wave__dest_record_I2S+index_AHX_enregistrements_N_voies__I2S_buffer),DSP_genere_wave__volume
 moveq  #0,DSP_genere_wave__wavelength
 move   DSP_genere_wave__volume,DSP_genere_wave__filterpos
 moveq  #0,DSP_genere_wave__decaleur_wavelength
 moveq  #16,DSP_genere_wave__squarepos
 shlq   #1,DSP_genere_wave__squarepos
 addq   #4,DSP_genere_wave__filterpos

DSP_genere_wave_routine_volume_a_zero__boucle:
 store  DSP_genere_wave__wavelength,(DSP_genere_wave__volume)
 store  DSP_genere_wave__decaleur_wavelength,(DSP_genere_wave__filterpos)
 subq   #1,DSP_genere_wave__squarepos
 addqt  #8,DSP_genere_wave__volume
 jr     ne,DSP_genere_wave_routine_volume_a_zero__boucle
 addqt  #8,DSP_genere_wave__filterpos

; fais la boucle sur le channel
 movei  #DSP_genere_wave__boucle_recolle1,DSP_genere_wave__volume
 jump   (DSP_genere_wave__volume)
 nop
;--------------- subroutine -----------------
; lit des bits du stream au DSP / de 1 a 8 bits
; entree : R0=nb bits // R28=adresse de retour
; sortie : R0=octet
; utilise : R10/R11/R12/R13/R14/  /R17/R18/R19

DSP_AHX_decode_streaming_V4__read_bits_from_bits_streaming:
	jr	non_empty
	moveq	#0,DSP_decode_bits__tmp1
reload:
	load   	(DSP_decode_bits__pointeur_lecture_bits),DSP_decode_bits_bitbuffer
	addq   	#4,DSP_decode_bits__pointeur_lecture_bits
	moveq	#0,DSP_decode_bits_bitcount
	bset	#5,DSP_decode_bits_bitcount
non_empty:
	move	DSP_decode_bits_bitbuffer,DSP_decode_bits__bits_resultat
	sub	DSP_decode_bits__nb_bits_a_lire,DSP_decode_bits_bitcount
	jr	pl,enough_bits
	neg	DSP_decode_bits__nb_bits_a_lire

	move	DSP_decode_bits__bits_resultat,DSP_decode_bits__tmp1
	move	DSP_decode_bits__nb_bits_a_lire,DSP_decode_bits__bits_resultat
	move	DSP_decode_bits_bitcount,DSP_decode_bits__nb_bits_a_lire
	addq	#32,DSP_decode_bits__bits_resultat
	neg	DSP_decode_bits__nb_bits_a_lire
	jr	reload
	sh	DSP_decode_bits__bits_resultat,DSP_decode_bits__tmp1

enough_bits:
	sh	DSP_decode_bits__nb_bits_a_lire, DSP_decode_bits_bitbuffer
	addq	#32,DSP_decode_bits__nb_bits_a_lire
	sh	DSP_decode_bits__nb_bits_a_lire,DSP_decode_bits__bits_resultat
	jump	(DSP_decode_bits__adresse_retour)
	or	DSP_decode_bits__tmp1,DSP_decode_bits__bits_resultat
; ---------------------------------------- DSP Datas
         .long

AHX_DSP_Seed_Noise:         dc.l   "AYS!"

AHX_table_routines_a_executer:
 dc.l   AHX_DSP_remplissage_buffer_triangle
 dc.l   AHX_DSP_remplissage_buffer_sawtooth
 dc.l   AHX_DSP_remplissage_buffer_square
 dc.l   AHX_DSP_remplissage_buffer_noise

DSP_localData:
DSP_module_streaming_bits:      dc.l 0
DSP_module_streaming_bits_cur:  dc.l 0
DSP_module_streaming_bits_end:  dc.l 0
DSP_NB_channels:                dc.l 0
DSP_ratio_Amiga_Jaguar__a_virgule_9_bits:  dc.l    0

;;;
HIVELY_datas_channels:
  .rept  max_NB_channels
 dc.l   0         ; vc_AudioVolume   0
 dc.l   0         ; vc_Waveform     4
 dc.l   0         ; vc_SquarePos    8
 dc.l   0         ; vc_WaveLength    12
 dc.l   0         ; vc_FilterPos    16
 dc.l   0         ; vc_AudioPeriod   20
 dc.l   1         ; channel on ou off ? 24
 dc.l   0         ; vc_RingWaveform
 dc.l   0         ; vc_RingAudioPeriod
  ; Ring Modulation : vc_Waveform+vc_WaveLength+vc_AudioPeriod
  .endr

buffer_temp_wave:  dcb.l  128,0

; NB_channels fois 128 .L , buffers à mixer
buffer_128_1:   dcb.l  64*max_NB_channels,0

DSP_HVL_table_panning_voies_de_base:
index   set    0
 .rept  max_NB_channels
 dc.l   HIVELY_datas_channels+(DSP_index_vc__total*index*4)
index   set  index+1
 .endr

RM_buffers:
        ds.l 128*max_RM_channels

; format de datas pour le replay I2S
i               set 0
rm_buffer       set RM_buffers
rm_buffer_main  set RM_buffers_main
rm_cnt          set 0

AHX_enregistrements_N_voies:
 .rept  max_NB_channels
 dc.l  0                                ; offset
 dc.l  0                                ; increment
 dc.l  0                                ; mask bouclage
 dc.l  buffer_128_1+(i*64*4)            ; pointeur buffer
 dc.l  255                              ; panning left
 dc.l  255                              ; panning right
 dc.l  0                                ; offset RM
 dc.l  0                                ; increment RM
 dc.l  0

i               set  i+1
 .endr

 print "AHX_enregistrements_N_voies:",/x/l AHX_enregistrements_N_voies
 dc.l "ENDE" 			;-)
;---------------------
; FIN DE LA RAM DSP
code_DSP_end:
;---------------------

SOUND_DRIVER_SIZE   .equ   code_DSP_end-D_RAM+52
 .print "; -----------------------------------------------"
 .print "; --- Sound driver free mem (DSP): ", /u 8192-SOUND_DRIVER_SIZE, " bytes  ---"
 .print "; -----------------------------------------------"
