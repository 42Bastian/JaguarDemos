// -*-c-*-

int scale = 3;
PFont f;

void plot(int x, int y, int r,int g,int b)
{
  fill(r, g, b);
  stroke(r, g, b);
  rect(x*scale, y*scale, scale, scale);
}

void settings()
{
  size(320*scale, 240*scale);
  noSmooth();
}

int [] si_co = new int[1609];

void setup()
{
  surface.setLocation(1520, 48);
  rectMode(CORNER);
  fill(0, 0, 0);
  stroke(0, 0, 0);
  rect(0, 0, 320*scale, 240*scale);
  frameRate(15);
  f = createFont("Monaco", 20);
  textFont(f);
  textAlign(LEFT, CENTER);
  translate(0,0);
  fill(255,0,0);
   for(int i = 0; i < 1609; ++i){
    si_co[i] = int(sin(i*PI/804)*256);
  }
  
}

float si(float a)
{
  float m = round(2*PI*256);
  a = abs(round(a*256) % m);
  return si_co[int(a)]/256.;
  
}
float co(float a)
{
  float m = round(2*PI*256);
  a = abs(round(a*256) % m);
  return si_co[int((a+1609/4)%1609)]/256.;
}

void mouseClicked()
{
  if ( mouseButton == LEFT ) {
  }
}

int n = 100;
float x=0,u,v=0,t=0.0;
float r = 1.2;
void draw()
{
  int i,j;
  fill(0, 0, 0);
  stroke(0, 0, 0);
  rect(0, 0, 320*scale, 240*scale);
  v = x =0.0;
  for(i = 0; i < n; ++i){
    float i0 = float(i);
    float i2 = float(i/16);
    for(j =0; j < n; ++j){
      u=si(i0+v)+si(i2+x);
      v=co(i0+v)+co(i2+x);
      x = (u % (2*PI))+t;
      v = v % (2*PI);
      plot(int(160+50*u),int(120+50*v),i*2,j*2,int(t*32) & 255);
    }
  }
  t += 0.025;
}
