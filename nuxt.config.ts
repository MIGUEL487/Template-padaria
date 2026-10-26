import tailwindcss from '@tailwindcss/vite'
export default defineNuxtConfig({
  compatibilityDate: '2026-10-26',
  devtools: {enabled: false},
  css: ['~/assets/css/main.css','~/assets/css/site.css','~/assets/css/refinements.css'],
  vite: {plugins: [tailwindcss()]},
  app: {head: {htmlAttrs:{lang:'pt-BR'},title:'O Refúgio — Padaria artesanal',meta:[{name:'description',content:'Pães fresquinhos, receitas especiais e aquele aconchego que faz você se sentir em casa.'}]}},
  typescript: {strict:true}
})
