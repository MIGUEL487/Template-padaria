import {products,reviews,pillars} from '../content/demo'
export const site = {
  name:'O Refúgio',
  url:'https://template-padaria.vercel.app',
  logo:'o refúgio.',
  colors:{cream:'#F6EDDC',beige:'#E8D5B5',butter:'#F1D9A0',caramel:'#C98A4B',terracotta:'#B5603E',coffee:'#6B4226',cocoa:'#3A2418',ink:'#2A1810'},
  hero:{eyebrow:'PADARIA ARTESANAL · FEITO COM CARINHO',title:'O sabor que transforma pequenos momentos em grandes memórias.',description:'Pães fresquinhos, receitas especiais e aquele aconchego que faz você se sentir em casa. Descubra o prazer de saborear cada detalhe.'},
  contacts:{whatsapp:'',address:'Praça da Sé, São Paulo — SP',mapQuery:'Praça da Sé São Paulo',demonstration:true},
  hours:[{days:'Segunda a sábado',time:'7h às 19h'},{days:'Domingos e feriados',time:'8h às 14h'}],
  socials:{instagram:'',facebook:'',tiktok:'',youtube:''},
  fonts:{display:'Georgia',body:'system-ui'},
  assets:{manifest:'/frames/manifest.json'},
  products,reviews,pillars,
} as const
