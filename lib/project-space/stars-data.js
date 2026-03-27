export const stars = [
  {
    id: 'tetris',
    title: 'Tetris',
    category: 'game',
    description: 'The ultimate puzzle classic.',
    content: 'Controls:\n← / → : Move\n↑ : Rotate\n↓ : Soft Drop\nSpace : Hard Drop\n\nGoal: Clear lines to score points and prevent the blocks from reaching the top!',
    tags: ['gaming', 'classic', 'puzzle'],
    color: '#f43f5e', // Rose
  },
  {
    id: 'big-o',
    title: 'Big O Cheatsheet',
    category: 'knowledge',
    description: 'Time complexity reference for common algorithms.',
    content: 'O(1) - Constant: Array access\nO(log n) - Logarithmic: Binary Search\nO(n) - Linear: Simple Loop\nO(n log n) - Linearithmic: Merge Sort\nO(n²) - Quadratic: Nested Loops\nO(2ⁿ) - Exponential: Recursive Fibonacci',
    tags: ['coding', 'cs', 'algorithms'],
    color: '#fbbf24', // Amber
  },
  {
    id: 'markdown',
    title: 'Markdown Guide',
    category: 'knowledge',
    description: 'Common syntax for the web.',
    content: '# Heading 1\n## Heading 2\n**Bold** / *Italic*\n[Link](url)\n![Alt](img_url)\n- List Item\n1. Numbered Item\n`code` / ```block```',
    tags: ['writing', 'docs', 'web'],
    color: '#10b981', // Emerald
  },
  {
    id: 'center-div',
    title: 'How to Center a Div',
    category: 'knowledge',
    description: 'The ultimate guide to CSS centering.',
    content: '/* 1. Flexbox (The Modern Way) */\ndisplay: flex;\njustify-content: center;\nalign-items: center;\n\n/* 2. Grid (The Short Way) */\ndisplay: grid;\nplace-items: center;\n\n/* 3. Absolute (The Old Way) */\nposition: absolute;\ntop: 50%;\nleft: 50%;\ntransform: translate(-50%, -50%);',
    tags: ['css', 'web', 'funny'],
    color: '#6366f1', // Indigo
  },
  {
    id: 'calculator',
    title: 'Calculator',
    category: 'tool',
    description: 'A fully functional glassmorphism calculator.',
    content: 'Interactive calculator component.',
    tags: ['math', 'utility', 'tool'],
    color: '#a855f7', // Purple
  },
  {
    id: 'boolean-algebra',
    title: 'Boolean Algebra',
    category: 'knowledge',
    description: 'The fundamental laws of logic gates and boolean math.',
    content: 'IDENTITY LAW:\nA + 0 = A\nA · 1 = A\n\nNULL LAW:\nA + 1 = 1\nA · 0 = 0\n\nIDEMPOTENT LAW:\nA + A = A\nA · A = A\n\nINVERSE LAW:\nA + A\' = 1\nA · A\' = 0\n\nCOMMUTATIVE LAW:\nA + B = B + A\nA · B = B · A\n\nDE MORGAN\'S LAWS:\n(A + B)\' = A\' · B\'\n(A · B)\' = A\' + B\'',
    tags: ['math', 'logic', 'cs'],
    color: '#3b82f6', // Blue
  }
];
