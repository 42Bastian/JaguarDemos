# YARC reloaded

This is reworked version of YARC using no(!) 68K code at all. It is booted directly via SBL (Second stage Boot Loader) from BIOS. The 68K is stopped.

The demo uses Ericde45's LSP port with a small change: `lsp_init.das` is the relocator in DSP code instead 68k.

The DSP is loaded and started by the GPU.

*NOTE* Currently needs a Model M Jaguar!