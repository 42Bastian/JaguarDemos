#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>

uint32_t pos = 0;
uint8_t getByte(FILE *in)
{
  int inbyte0;

  inbyte0 = fgetc(in);
  ++pos;
  if ( inbyte0 < 0 ){
    printf("Error\n");
    exit(1);
  }
  return (uint8_t)inbyte0;
}
uint16_t getWord(FILE *in)
{
  return (uint16_t)((getByte(in)<<8)|getByte(in));
}

int main(void)
{
  FILE *in;
  int inbyte;
  uint8_t fb;
  uint16_t word;
  uint16_t color;
  int frame;
  int idx;
  int cnt;
  uint8_t vertice_buffer[512];
  uint16_t palette[16];
  uint32_t stat[16] = {0};
  uint8_t cntVert;
  in = fopen("scene1.dat","rb");
  int final = 0;
  frame = 0;
  pos = 0;

  while( final == 0 && !feof(in) ){
    printf("frame%03d:\n",frame);
    fb = getByte(in);
    cnt = 0;

    if ( fb & 1 ){
      printf("; /* clear screen */\n");
    }

    if ( fb & 2 ){
      word = getWord(in);
      printf("; %04x\n",word);
      color = word;
      for(cnt = 0, idx = 0; color ; color <<= 1, ++idx){
        if ( color & 0x8000 ){
          //00000RRR 0GGG0BBB
          int r = (getByte(in) & 0x7)<<2;
          int g = getByte(in);
          int b = (g & 0x7) << 2;
          g = ((g & 0x70) >> 4)<<3;
          palette[idx] = (r<<11)|(b<<6)|g;
          ++cnt;
        }
      }
    }

    printf(" dc.w $%04x\n",fb|(cnt<<8));

    if ( fb & 2 ){
      /* convert ST palette r:g:b to Jaguar rbg */
      printf("; palette%03d\n",frame);
      printf(" dc.w ");
      for( idx = 0; word ;  ++idx){
        if ( word & 0x8000 ){
          if ( cnt > 1 ){
            printf("%d, $%04x,", idx*2, palette[idx]);
          } else {
            printf("%d, $%04x\n", idx*2, palette[idx]);
          }
          --cnt;
        }
        word <<= 1;
      }
    }

    if ( fb & 4 ){
      int vert = 0;
      cntVert = getByte(in);
      fread(vertice_buffer, 2, cntVert, in);
      pos += 2*cntVert;

      while( 1 ){
        fb = getByte(in);

        if ( fb == 0xfd ){
          final = 1;
          printf(" dc.w $0000\n");
          printf(" .end\n");
          break;
        }
        if ( fb == 0xff ){
          printf(" dc.w $0000\n");
          break;
        }
        if ( fb == 0xfe ){
          printf("; SKIP %08x\n",pos);
          while( (pos & 0xffff) ){
            (void)getByte(in);
          }
          printf(" dc.w $0000\n");
          break;
        }

        int xfb = fb & 0xf;
        if ( xfb <= 33 ){
            printf("; desc%03d_%03d\n"
                   " dc.w $%04x\n",frame, vert,(fb & 0xf0) << 4| fb & 0xf);

            printf(" dc.b ");
        }
        ++stat[xfb];
        for ( fb &= 0xf; fb; --fb){
          idx = getByte(in);
          if ( xfb <= 33 ){
            printf(" %d,%d",vertice_buffer[idx*2],vertice_buffer[idx*2+1]);
            if ( fb != 1 ){
              printf(",");
            } else {
              printf("\n");
            }
          }
        }
        ++vert;
      }
    } else {
      printf("; /* non-indexed */\n");
      int vert = 0;
      while( 1 ){
        fb = getByte(in);
        if ( fb == 0xfd ){
          final = 1;
          printf(" dc.w $0000\n");
          printf(" .end\n");
          break;
        }
        if ( fb == 0xff ){
          printf(" dc.w $0000\n");
          break;
        }
        if ( fb == 0xfe ){
          printf("; SKIP %08x\n",pos);
          while( (pos & 0xffff) ){
            (void)getByte(in);
          }
          printf(" dc.w $0000\n");
          break;
        }

        cntVert = fb & 0xf;
        fread(vertice_buffer, 2, cntVert, in);
        pos += 2*cntVert;
        ++stat[cntVert];
        if ( cntVert <= 33 ){
          printf("; desc%03d_%03d\n"
                 " dc.w $%04x\n",frame, vert,(fb & 0xf0) << 4| fb & 0xf);

          printf(";vert%02d_%03d\n dc.b ",vert, frame);
          for(idx = 0; idx < cntVert; ++idx){
            printf(" %d,%d",vertice_buffer[2*idx],vertice_buffer[2*idx+1]);
            if ( idx == (cntVert-1) ){
              printf("\n");
            } else {
              printf(",");
            }
          }
        }
        ++vert;
      }
    }

    ++frame;
//->    if ( frame == 500 ) break;
  }
  int total = 0;
  printf("; Polygon sizes:\n");
  for(int i = 0; i < 16; ++i){
    if ( stat[i] ){
      printf("; %2d %5d\n",i, stat[i]);
      total += stat[i];
    }
  }
  printf("; Total: %d\n",total);
  return 0;
}
