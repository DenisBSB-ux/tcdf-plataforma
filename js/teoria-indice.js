/* Índice teoria → página do PDF. Só metadados (norma:artigo → página); o PDF em si fica no Drive ou no aparelho.
   Chave = começo do slug da matéria. "pdf" = trecho do nome do arquivo (senão usa o primeiro PDF da matéria). */
const TEORIA_INDICE = {
  'direito-tributario': {
    pdf: 'tribut',
    drive: 'https://drive.google.com/file/d/1KrMXL6RCTKdSc8yCsNEPq24y3Bt9pRbz/view?usp=drive_link', // apostila pública (padrão, até a conta cadastrar outro link)
    paginas: {"CF:59": 2, "CF:145": 7, "CF:147": 23, "CF:148": 37, "CF:149": 38, "CF:150": 7, "CF:151": 10, "CF:152": 11, "CF:153": 19, "CF:154": 20, "CF:155": 21, "CF:156": 23, "CF:157": 28, "CF:158": 28, "CF:159": 29, "CF:160": 30, "CF:161": 30, "CF:162": 30, "CF:195": 38, "CTN:3": 2, "CTN:4": 33, "CTN:9": 11, "CTN:10": 12, "CTN:11": 12, "CTN:12": 13, "CTN:13": 13, "CTN:14": 14, "CTN:15": 14, "CTN:16": 34, "CTN:77": 35, "CTN:78": 35, "CTN:79": 35, "CTN:80": 35, "CTN:81": 37, "CTN:82": 37, "CTN:96": 3, "CTN:97": 3, "CTN:100": 4}
  }
};
/* apelidos: matéria cujo nome começa por esta chave usa o mesmo índice */
TEORIA_INDICE['d-tributario'] = TEORIA_INDICE['direito-tributario'];
