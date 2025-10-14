# 🎨 Design Guidelines - git-to-know-me

Padrão de UI/UX para manter consistência e evitar "AI template look".

---

## ✅ FAÇA (Do's)

### **Tamanhos**
- ✅ Títulos: `text-3xl` a `text-5xl` (máximo)
- ✅ Corpo: `text-base` ou `text-sm`
- ✅ Detalhes: `text-xs`
- ✅ Botões: `size="sm"` (h-8 ou h-9)
- ✅ Avatares: pequenos (w-10 h-10)
- ✅ Ícones: w-4 h-4 ou w-5 h-5

### **Layout**
- ✅ Alinhamento à esquerda (assimétrico)
- ✅ Listas verticais simples
- ✅ Bullet points minimalistas (w-1 h-1)
- ✅ Espaçamento generoso
- ✅ Max-width definidos (max-w-2xl, max-w-4xl)

### **Cores**
- ✅ Textos: slate-100 (títulos), slate-300/400 (corpo), slate-500/600 (hints)
- ✅ Bordas: slate-800/50, slate-700/80
- ✅ Backgrounds: slate-900/30 a slate-900/40
- ✅ Gradientes apenas em CTAs principais

### **Glassmorphism**
- ✅ `backdrop-blur-xl` ou `backdrop-blur-2xl`
- ✅ `bg-slate-900/30` ou `bg-slate-900/40`
- ✅ `border-slate-800/50`

### **Animações**
- ✅ Hover: `duration-300`
- ✅ Entrada: `duration-700`
- ✅ Scale sutil: `scale-[1.02]`
- ✅ `motion-reduce:transition-none` sempre

### **Componentes**
- ✅ Cards compactos (p-4 a p-6)
- ✅ Headers minimalistas
- ✅ Footers discretos (text-xs)

---

## ❌ EVITE (Don'ts)

### **Anti-patterns de AI Templates**
- ❌ Títulos gigantes (6xl, 7xl, 8xl)
- ❌ Grid de 3 colunas com cards grandes
- ❌ Tudo centralizado
- ❌ Ícones muito grandes (w-6 h-6 ou maiores)
- ❌ Cards com muito padding (p-8+)
- ❌ Gradientes em todos os elementos
- ❌ Emojis em excesso
- ❌ Textos longos e genéricos

---

## 📐 Exemplos Práticos

### **✅ Bom (Minimalista)**

```tsx
<h1 className="text-4xl font-bold text-slate-100">
  Título direto ao ponto
</h1>

<p className="text-sm text-slate-400">
  Descrição curta e objetiva.
</p>

<div className="flex items-center gap-3">
  <div className="w-1 h-1 rounded-full bg-blue-400/60" />
  <p className="text-sm text-slate-300">Feature</p>
</div>

<Button size="sm" className="h-9 text-sm">
  Ação
</Button>
```

### **❌ Ruim (AI Template)**

```tsx
<h1 className="text-7xl font-black bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
  TÍTULO GIGANTE COM GRADIENTE CHAMATIVO
</h1>

<p className="text-2xl text-center max-w-4xl">
  Descrição muito longa e genérica que não agrega valor...
</p>

<div className="grid grid-cols-3">
  <div className="p-12">
    <div className="w-16 h-16 bg-gradient-to-br...">
      <IconeGigante />
    </div>
    <h3 className="text-3xl">Título Grande</h3>
  </div>
</div>
```

---

## 🎯 Princípio Geral

> **"Menos é mais"**  
> Design refinado, profissional, que não grita "foi feito por AI"

---

## 📋 Checklist Rápido

Antes de criar/atualizar componente, pergunte:

- [ ] Título < 5xl?
- [ ] Alinhado à esquerda?
- [ ] Botões size="sm"?
- [ ] Evitei grid de 3 cards?
- [ ] Ícones ≤ 5x5?
- [ ] Textos concisos?
- [ ] Espaçamento respirável?
- [ ] Gradientes com moderação?

Se tudo ✅ → Design aprovado! 🎨

