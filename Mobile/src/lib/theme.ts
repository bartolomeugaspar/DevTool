export interface ThemeTokens {
  pageBg:      string;
  card:        string;
  border:      string;
  navBg:       string;
  navBorder:   string;
  text1:       string;
  text2:       string;
  text3:       string;
  accent:      string;
  accentBg:    string;
  inputBg:     string;
  inputBorder: string;
  skelBg:      string;
  btnSecBg:    string;
  btnSecText:  string;
  btnPrimaryText: string;
  headerBg:    string;
}

export function tokens(light: boolean): ThemeTokens {
  return {
    pageBg:      light ? '#f3f4f6'              : '#07111e',
    card:        light ? '#ffffff'              : '#0e1e35',
    border:      light ? '#e5e7eb'              : '#1a3557',
    navBg:       light ? '#ffffff'              : '#0c2340',
    navBorder:   light ? '#e5e7eb'              : '#1a3557',
    text1:       light ? '#0c2340'              : '#ffffff',
    text2:       light ? '#586779'              : '#8e9bab',
    text3:       light ? '#94a3b8'              : '#304259',
    accent:      light ? '#002f7a'              : '#31ECC6',
    accentBg:    light ? 'rgba(0,47,122,0.10)'  : 'rgba(49,236,198,0.10)',
    inputBg:     light ? '#f9fafb'              : '#0c2340',
    inputBorder: light ? '#e5e7eb'              : '#1a3557',
    skelBg:      light ? '#e5e7eb'              : '#1a3557',
    btnSecBg:    light ? '#f3f4f6'              : '#1a3557',
    btnSecText:  light ? '#0c2340'              : '#8e9bab',
    btnPrimaryText: light ? '#ffffff'           : '#07111e',
    headerBg:    light ? '#e8edf2'              : '#0c2340',
  };
}
